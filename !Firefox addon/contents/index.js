var tabs = require("sdk/tabs");
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var Request = require("sdk/request").Request;
var ss = require("sdk/simple-storage");
var common = require("./data/common-functions.js");
var worker;
var db;

if (!ss.storage.animage)  								//main storage object
	ss.storage.animage={files:{}};

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
/*
var panel = panels.Panel({
  contentURL: self.data.url("panel.html"),
  contentScriptFile: [self.data.url("jquery.js"),self.data.url("panel.js") ],
  onHide: handleHide
});
panel.on("show", function() {
  panel.port.emit("show");
});*/

function handleChange(state) {
	if (state.checked) {
    /*panel.show({
      position: button
    });*/
		worker.port.emit("start");
	}
}

function handleHide() {
	button.state('window', {checked: false});
}

pageMod.PageMod({
	include: "*.tumblr.com",
	contentScriptFile: ["./jquery.js", "./common-functions.js", "./animage-post.js"],
	contentScriptWhen: "ready",
	attachTo: ['top','existing'],
	onAttach: attachListeners
});

function checkSaved(image){
	if ((db.files[image.fname])&&(db.files[image.fname].s==1))
		worker.port.emit("isSaved",image.i);
};

function saveData(data){	
	oldRec=db.files[data.fname];												//Check if there's already a record in database for this image	
	DBrec={s:0, t:data.tags.toString().toLowerCase()};

	if (oldRec) {																// if there is we need to merge existing tags with newfound ones 
		oldtags=oldRec.t.split(','); 
		newtags=common.mkUniq(oldtags.concat(data.tags), false);
		DBrec.t=newtags.toString().toLowerCase();
		DBrec.s=parseInt(oldRec.s);
	} else
		DBrec.s=0;		
	db.files[data.fname]=DBrec;	
	
	if (db.files[data.fname]==DBrec)
		worker.port.emit("saved", true)
	else																		//not sure if reachable
		worker.port.emit("saved",false);	
};

function attachListeners(wrkr){ 
	worker=wrkr;
	ss.on("OverQuota", function(){
		worker.port.emit("saved", 'over quota');
		throw new Error('Simple storage is over quota.');
	});
	worker.port.on("saveData", saveData);
	worker.port.on("checkSaved", checkSaved);
	worker.port.on("getPostInfo", function(post){		
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
					worker.port.emit("APIresponse", {r:response.text, i:post.i});
			}
		}).get();
	});
};
