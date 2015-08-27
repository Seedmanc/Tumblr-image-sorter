var tabs = require("sdk/tabs");
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var Request = require("sdk/request").Request;
var ss = require("sdk/simple-storage");
var worker;
 
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
	onAttach: function(wrkr) {
		worker=wrkr;
	   
		worker.port.on("saveData",function(message){
			worker.port.emit("saved",message[0]+' '+message[1]);
		});
		worker.port.on("getPostInfo", function(post){		
			var APIcall = Request({
				url: "https://api.tumblr.com/v2/blog/"+post.source+"/posts/photo",
				content: {
					api_key:'fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4',
					id:		post.id
				},
				onComplete: function (response) { 
					if ((!response.text)||(response.status!=200))
						worker.port.emit("APIfailure", {r:response.statusText, i:post.i})
					else
						worker.port.emit("APIresponse", {r:response.text, i:post.i});
				}
			}).get();
		});
	}
});
