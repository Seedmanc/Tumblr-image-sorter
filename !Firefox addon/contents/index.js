var tabs = require("sdk/tabs");
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var Request = require("sdk/request").Request;
var ss = require("sdk/simple-storage");
var clipboard = require("sdk/clipboard");
var common = require("./data/common-functions.js"); 
 
defaults={files:{}, settings:{ root:'C:\\my\\collection\\', metasymbol:'!' ,highlightColor:'#000', enableOnDashboard:true, linkify:true, allowUnicode:false, useFolderNames:true}, folders:{'!group':'!group','!solo':'!solo','!unsorted':'!unsorted' }, auxdb:{names:{ }, meta:{ }}, ignore:[ ]};

if (!ss.storage.animage)  													//main storage object
	ss.storage.animage=defaults; 

var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

var panel = panels.Panel({
	width: 505, 
	height: 550,
	contentURL: "./panel.html",	
	onHide: handleHide,
	onShow: applyPanelData
});

panel.port.on("reset", function(){
	ss.storage.animage=defaults;
	applyPanelData();
});

panel.port.on("openLink", function(link){
	ss.storage.animage=defaults;
	tabs.open(link);
});


panel.port.on('panelStarted', function(){
	ss.on("OverQuota", function(){
		panel.port.emit("stored", 'over quota');
		throw new Error('Simple storage is over quota due to panel script.');
	});
}); 

function settingsObject(){
	return {
		lists:{
			folders: {
				root:		ss.storage.animage.settings.root,
				metasymbol:	ss.storage.animage.settings.metasymbol,
				folders:	ss.storage.animage.folders
			},
			name: {
				names:		ss.storage.animage.auxdb.names,
				meta:		ss.storage.animage.auxdb.meta
			},
			ignore:		ss.storage.animage.ignore
		},
		options: {
			post:	{
				highlightColor: 	ss.storage.animage.settings.highlightColor,
				enableOnDashboard:	ss.storage.animage.settings.enableOnDashboard,
				linkify:			ss.storage.animage.settings.linkify
			},
			image: {
				allowUnicode:		ss.storage.animage.settings.allowUnicode,
				useFolderNames:		ss.storage.animage.settings.useFolderNames
			}
		}
	};
};

function applyPanelData() {  
	panel.port.emit("show", settingsObject());
};
 

function handleChange(state) {
	if (state.checked) {
		panel.show({
			position: button
		});
	}
}

function handleHide() {
	button.state('window', {checked: false});
	panel.port.emit('storePanelData');
}
 

panel.port.on('storedPanelData', function(data){
	if (data.lists.folders.root)
		ss.storage.animage.settings.root =			data.lists.folders.root;
	ss.storage.animage.settings.metasymbol =		data.lists.folders.metasymbol;
	ss.storage.animage.settings.highlightColor =	data.options.post.highlightColor;
	ss.storage.animage.settings.enableOnDashboard =	data.options.post.enableOnDashboard;
	ss.storage.animage.settings.linkify =			data.options.post.linkify;
	ss.storage.animage.settings.allowUnicode =		data.options.image.allowUnicode;
	ss.storage.animage.settings.useFolderNames =	data.options.image.useFolderNames;
	ss.storage.animage.auxdb.meta =					data.lists.name.meta;
	ss.storage.animage.auxdb.names =				data.lists.name.names;	
	ss.storage.animage.ignore =						data.lists.ignore;
	ss.storage.animage.folders =					data.lists.folders.folders; 
});

pageMod.PageMod({
	include: [	/http[^s].*tumblr\.com\/?$/,										//match all personal blog pages containing posts
				/http[^s].*tumblr\.com\/post\/.*/,									// hope tumblr won't make https everywhere
				/http[^s].*tumblr\.com\/image\/.*/,
				/http[^s].*tumblr\.com\/page\/.*/,
				/http[^s].*tumblr\.com\/tagged\/.*/,
				/http[^s].*tumblr\.com\/search\/.*/,
				"https://www.tumblr.com/dashboard*",								//and also dashboard
				"https://www.tumblr.com/tagged/*"	],
	exclude: "*.media.tumblr.com",
	contentScriptFile: ["./jquery.js", "./common-functions.js", "./animage-post.js"],
	contentScriptWhen: "ready",
	attachTo: ['top' ],
	onAttach: attachListeners
});

pageMod.PageMod({
	include: [	"*.media.tumblr.com",												//match only directly opened images
				"*.amazonaws.com/data.tumblr.com/"	],								//older tumblr posts hosted images on amazon
	contentScriptFile: ["./jquery.js", "./common-functions.js", "./animage-get.js"],
	contentScriptWhen: "ready",
	contentStyleFile: "./animage-get.css",
	contentScriptOptions: {
		folders:ss.storage.animage.folders,
		ignore:	ss.storage.animage.ignore
	},
	attachTo: ['top' ],
	onAttach: attachListeners
});

function isSaved(image, worker){
	if ((ss.storage.animage.files[image.fname])&&(ss.storage.animage.files[image.fname].s==1))
		worker.port.emit("isSaved",image.i);
};

function storeImageData(data, worker){												//Add/modify database record for a filename
	oldRec=ss.storage.animage.files[data.fname];													//Check if there's already a record in database for this image	
	DBrec={s:0, t:data.tags};
	if ((oldRec)&&(data.merge)) {													// if there is we need to merge existing tags with the new ones 
		oldtags=oldRec.t; 
		newtags=common.mkUniq(oldtags.concat(data.tags), false);
		DBrec.t=newtags;
		DBrec.s=oldRec.s;
	} else if (data.s!==undefined)
		DBrec.s=data.s;		
	ss.storage.animage.files[data.fname]=DBrec;	
	
	if (data.auxdb)
		ss.storage.animage.auxdb=data.auxdb;
	
	worker.port.emit("stored", true);	
};

function getPostInfo(post, worker){
	var APIcall = Request({
		url: "https://api.tumblr.com/v2/blog/"+post.source+"/posts/photo",
		content: {
			api_key:'fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4',
			id:		post.id
		},
		onComplete: function (response) { 
			if ((!response.text)||(response.status!=200))
				worker.port.emit("APIfailure",  {r:response.statusText, i:post.i})
			else
				worker.port.emit("APIresponse", {r:response.json, i:post.i});
		}
	}).get();
};

function getImageData(fname, worker){
	DBrec=ss.storage.animage.files[fname];
	if ((DBrec)&&(DBrec.t.length))
		worker.port.emit('gotImageData', DBrec);
}; 

function attachListeners(worker){ 
	ss.on("OverQuota", function(){
		worker.port.emit("stored", 'over quota');
		throw new Error('Simple storage is over quota due to get script.');
	});
	worker.port.on("storeImageData", function(data){
		storeImageData(data, worker);
	});
	worker.port.on("isSaved", function(arg){
		isSaved(arg, worker);
	});
	worker.port.on("getPostInfo", function(post){		
		getPostInfo(post, worker);
	});
	worker.port.on("getImageData", function(fname){		
		getImageData(fname, worker);
	});
	worker.port.on("setClipboard", function(text){		
		clipboard.set(text);
	});
	worker.port.emit("init", settingsObject());
};