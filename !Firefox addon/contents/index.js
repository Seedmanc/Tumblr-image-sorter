var {ToggleButton} = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var pageMod = require("sdk/page-mod");
var ss = require("sdk/simple-storage"); 
var common = require("./data/common-functions.js");  
 
var defaults={files:{}, settings:{ root:'C:\\my\\collection\\', metasymbol:'!' ,highlightColor:'#000', enableOnDashboard:true, linkify:true, allowUnicode:false, useFolderNames:true}, folders:{'!group':'!group','!solo':'!solo','!unsorted':'!unsorted' }, auxdb:{names:{ }, meta:{ }}, ignore:[ ]};

if (!ss.storage.animage)  														//Main storage object
	ss.storage.animage=defaults; 
	
var button = ToggleButton({
  id: "my-button",
  label: "Tumblr Image Sorter",
  icon: {
    "16": "./images/icon-16.png",
    "32": "./images/icon-32.png",
    "64": "./images/icon-64.png"
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

require("sdk/view/core").getActiveView(panel).setAttribute("noautohide", true);

panel.port.on("reset", function(){
	ss.storage.animage=defaults;
	applyPanelData();
});

panel.port.on("openLink", function(link){
	require("sdk/tabs").open(link);
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
	if (state.checked) 
		panel.show({
			position: button
		})
	else
		panel.hide();
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
	include: [	/http[^s].*tumblr\.com\/?$/,										//Match all personal blog pages containing posts
				/http[^s].*tumblr\.com\/post\/.*/,									// hope tumblr won't make https everywhere
				/http[^s].*tumblr\.com\/image\/.*/,
				/http[^s].*tumblr\.com\/page\/.*/,
				/http[^s].*tumblr\.com\/tagged\/.*/,
				/http[^s].*tumblr\.com\/search\/.*/,
				"https://www.tumblr.com/dashboard*",								//and also dashboard
				"https://www.tumblr.com/tagged/*"	],
	exclude: "*.media.tumblr.com",
	contentScriptFile: ["./jquery-ui/jquery.js", "./common-functions.js", "./animage-post.js"],
	contentScriptWhen: "ready",
	attachTo: ['top' ],
	onAttach: attachListeners
});
 
pageMod.PageMod({
	include: [	"*.media.tumblr.com",												//Match only directly opened images
				"*.amazonaws.com/data.tumblr.com/",									//older tumblr posts hosted images on amazon
				"http://scenario.myweb.hinet.net/*",								//other sites are used by animage.tumblr.com to host images
				"http://e.blog.xuite.net/*",
				"http://voice.x.fc2.com/*",
				"https://mywareroom.files.wordpress.com/*"],								
	contentScriptFile: ["./jquery-ui/jquery.js", "./common-functions.js", "./animage-get.js"],
	contentScriptWhen: "ready",
	contentStyleFile: "./animage-get.css",
	attachTo: ['top' ],
	onAttach: attachListeners
});

function isSaved(imageName, worker){
	if ((ss.storage.animage.files[imageName])&&(ss.storage.animage.files[imageName].s==1))
		worker.port.emit("isSaved", imageName);
};

function storeImageData(data, worker){												//Add/modify database record for a filename
	var oldRec=ss.storage.animage.files[data.fname];									//Check if there's already a record in database for this image	
	var DBrec={s:0, t:data.tags};
	if ((oldRec)&&(data.merge)) {													// if there is we need to merge existing tags with the new ones 
		var oldtags=oldRec.t; 
		var newtags=common.mkUniq(oldtags.concat(data.tags), false);
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
	require("sdk/request").Request({
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
	var DBrec=ss.storage.animage.files[fname];
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
		require("sdk/clipboard").set(text);
	});
	worker.port.emit("init", settingsObject());
};

/*const { setTimeout } = require("sdk/timers");

     

function handleChange(state) {
  if (state.checked) {
    setTimeout(() => panel.show({ position: button }), 100);
  }
}*/