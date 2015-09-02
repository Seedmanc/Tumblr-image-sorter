var tabs = require("sdk/tabs");
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var Request = require("sdk/request").Request;
var ss = require("sdk/simple-storage");
var clipboard = require("sdk/clipboard");
var common = require("./data/common-functions.js");
var db; 
 
defaults={files:{}, settings:{ root:'C:\\my\\collection\\', metasymbol:'!' ,highlightColor:'#000', enableOnDashboard:true, linkify:true, allowUnicode:false, useFolderNames:true}, folders:{ }, auxdb:{names:{ }, meta:{ }}, ignore:[ ]};

if (!ss.storage.animage)  													//main storage object
	ss.storage.animage=defaults;

db=ss.storage.animage;

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
	contextMenu: true,
	onHide: handleHide,
	onShow: applyPanelData
});

panel.port.on("reset", function(){
	db=defaults;
	applyPanelData();
});

function applyPanelData() { 
 
	panel.port.emit("show",{
		lists:{
			folders: {
				root:		db.settings.root,
				metasymbol:	db.settings.metasymbol,
				folders:	db.folders
			},
			name: {
				names:		db.auxdb.names,
				meta:		db.auxdb.meta
			},
			ignore:		db.ignore
		},
		options: {
			post:	{
				highlightColor: 	db.settings.highlightColor,
				enableOnDashboard:	db.settings.enableOnDashboard,
				linkify:			db.settings.linkify
			},
			image: {
				allowUnicode:		db.settings.allowUnicode,
				useFolderNames:		db.settings.useFolderNames
			}
		}
	});
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
		db.settings.root =			data.lists.folders.root;
	db.settings.metasymbol =		data.lists.folders.metasymbol;
	db.settings.highlightColor =	data.options.post.highlightColor;
	db.settings.enableOnDashboard =	data.options.post.enableOnDashboard;
	db.settings.linkify =			data.options.post.linkify;
	db.settings.allowUnicode =		data.options.image.allowUnicode;
	db.settings.useFolderNames =	data.options.image.useFolderNames;
	db.auxdb.meta =					data.lists.name.meta;
	db.auxdb.names =				data.lists.name.names;	
	db.ignore =						data.lists.ignore;
	db.folders =					data.lists.folders.folders;
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
	attachTo: ['top','existing'],
	onAttach: attachListeners
});

pageMod.PageMod({
	include: [	"*.media.tumblr.com",												//match only directly opened images
				"*.amazonaws.com/data.tumblr.com/"	],								//older tumblr posts hosted images on amazon
	contentScriptFile: ["./jquery.js", "./common-functions.js", "./animage-get.js"],
	contentScriptWhen: "ready",
	contentStyleFile: "./animage-get.css",
	contentScriptOptions: {
		folders:db.folders,
		ignore:	db.ignore
	},
	attachTo: ['top','existing'],
	onAttach: attachListeners
});

function isSaved(image, worker){
	if ((db.files[image.fname])&&(db.files[image.fname].s==1))
		worker.port.emit("isSaved",image.i);
};

function storeImageData(data, worker){												//Add/modify database record for a filename
	oldRec=db.files[data.fname];													//Check if there's already a record in database for this image	
	DBrec={s:0, t:data.tags};
	if ((oldRec)&&(data.merge)) {													// if there is we need to merge existing tags with the new ones 
		oldtags=oldRec.t; 
		newtags=common.mkUniq(oldtags.concat(data.tags), false);
		DBrec.t=newtags;
		DBrec.s=oldRec.s;
	} else if (data.s!==undefined)
		DBrec.s=data.s;		
	db.files[data.fname]=DBrec;	
	
	if (data.auxDB)
		db.auxDB=data.auxDB;
	if (db.files[data.fname]==DBrec)
		worker.port.emit("stored", true);
	else																			//not sure if reachable
		worker.port.emit("stored",false);	
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
	DBrec=db.files[fname];
	if ((DBrec)&&(DBrec.t.length))
		worker.port.emit('gotImageData', DBrec);
};

function attachListeners(worker){ 
	ss.on("OverQuota", function(){
		worker.port.emit("saved", 'over quota');
		throw new Error('Simple storage is over quota.');
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
	worker.port.emit("sendAuxDB", db.auxDB);
};