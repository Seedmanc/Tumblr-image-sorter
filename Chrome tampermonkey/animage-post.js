// ==UserScript==
// @name		Animage-server
// @description	Puts tags for links into database
// @version		1.0
// @author		Seedmanc
// @include		http://*.tumblr.com/post/*
// @include		http://*.tumblr.com/page/*
// @include		http://*.tumblr.com/tag*/*
// @include		http://*.tumblr.com/	
// @include		http://*.tumblr.com/image/*

// @exclude		http://*.media.tumblr.com/*

// @grant 		none
// @run-at 		document-start
// @require  	http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js 
// @require 	https://dl.dropboxusercontent.com/u/74005421/js%20requisites/swfstore.min.js 
// ==/UserScript==

// ==Settings=====================================================

	var fixMiddleClick=true;													//Looks like in Chrome even middle mouse click triggers onClick event, which loads image into photoset viewer
																				// instead of opening it in a new tab, which is required for the userscript to process the image
																				// this option will fix this by removing the view in photoset feature altogether (only if there are tags found)
																				// might cause unexpected behaviour and mess with progressbar in title
	var debug=	true;															//disable cleanup, leaving variables and flash objects in place (causes lag on tab close)
																				// also enables rewriting of database records for images
	var highlight='darkgrey';													//color to mark the already saved images with
	var storeUrl='https://dl.dropboxusercontent.com/u/74005421/js%20requisites/storage.swf';
																				//flash databases are bound to the URL.							

// ==/Settings====================================================

//$.noConflict();
 tagsDB=null;
var ranonce=false;

namae=document.location.host; 													 
document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);

function cleanUp(){																//remove variables and flash objects from memory 
	if (!debug){																//without removal there would be a noticeable lag upon tab closing
		delete tagsDB;
		a=jQuery('object');
		jQuery.each(a,function(i,v){
			v.parentNode.removeChild(v)});
	};
};

function getFname(fullName){													//extract filename from image URL and format it
	fullName=fullName||'';														//source URL processing for filename
	if (fullName.indexOf('?')!=-1)												//first remove url parameters 
		fullName=fullName.substring(0,fullName.indexOf('?'));
		
	if (fullName.indexOf('xuite')!=-1) {										//this blog names their images as "(digit).jpg" causing filename collisions
		i=fullName.lastIndexOf('/');
		fullName=fullName.substr(0,i)+'-'+fullName.substr(i+1);					//add parent catalog name to the filename to ensure uniqueness
	};
	return fullName.substring(fullName.lastIndexOf('/')+1);						
};  

function getID(lnk){															//extract numerical post ID from self-link
	Result=lnk.substring(lnk.indexOf('/post/')+7+lnk.indexOf('image/'));	
	if (Result.indexOf('#')!=-1)												//remove url postfix 
		Result=Result.substring(0,Result.indexOf('#'));	
	i=Result.lastIndexOf('/');
	if (i!=-1)
		Result=Result.substring(0,i);
	if ((Result=='')||(Result.search(/[^0-9]/g)!=-1)) {
		alert('IDentification error');
		throw new Error('IDentification error: '+Result);
	}
	else
		return Result;
};

function main(){																//search for post IDs on page and call API to get info about them
  try {
	if (!ranonce){
		posts=jQuery('.post');//.not('.post .post');
		if (document.location.href.indexOf('/image/')!=-1)						//make it work also on image pages, since we can get post id there as well
			posts=[jQuery('<div><a href="http://'+namae+'/post/'+getID(document.location.href)+'" >a</a></div>') ];	
																				//helps when you got directly to image page without visiting post page beforehand
		if (posts.length==0) {			
			posts=jQuery(jQuery('.column')[2]).find('.bottompanel');			//for "Catching elephant" theme
			posts=(posts.length)?posts:jQuery("[id='post']");					//for "Cinereoism" that uses IDs instead of Classes /0
			if (posts.length==0){
				document.title+=' [No .posts found]';							//give up
				return;
			};
		};
		
		document.title="Rdy:[";											//a "progressbar" will be displayed in page title,
																				// indicating that the page is ready for interaction
		jQuery.each(posts,function(i,v){
			//linx=jQuery(v).find('a');
			delete id;
			h=jQuery(v).find("a[href*='"+namae+"/post/']");
			if (h.length==0) h=jQuery(v).next().find("a[href*='"+namae+"/post/']");
			if (h.length) id=getID(h[0].href);									//for every post on page find the self-link inside of post, containing post ID
			/*jQuery.each(linx,function(idx,val){									
				//delete id;
				if (val.href.indexOf(namae+/post/)!=-1) {
					id=getID(val.href);
					return false;}
			}); */
			
			if (typeof id == 'undefined') {										//workaround for Optica theme that doesn't have selflinks within .post elements
			/*	phtst=jQuery(v).find("div[id^='photoset']");					//photosets have IDs inside, well, id attributes starting with photoset_
				pht=jQuery(v).find("a[href*='/image/']");						//single photos link to the photo page with the ID being inside URL
				if (phtst.length) 
					id=phtst.attr('id').split('_')[1]
				else if (pht.length)
					id=getID(pht[0].href)
				else {*/
					console.log('IDs not found');
					if (debug) document.title+='✗';
					return true;
				//};
			};
	 		jQuery.ajax({														//get info about current post via tumblr API based on the ID
				type:'GET',
				url: "http://api.tumblr.com/v2/blog/"+namae+"/posts/photo",
				dataType:'jsonp',
				data: {
					api_key : "fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4",
					id: id
				}
			})	.done(function(result) { process ( result,v);})
				.fail(function(jqXHR, textStatus, errorThrown) { alert('Error: '+textStatus);} )
				.always(function(){
					ifr=undefined;
					if (i==posts.length-1) {									//at the end of processing indicate it's finished and cleanup flash
						document.title+='] 100%'; 
						cleanUp();
					};
					if (document.location.href.indexOf('/image/')!=-1){			//redirect to actual image from image page after we got the ID
						document.location.href=jQuery('img#content-image')[0].src;
						};
				}); 
		});	
	};
  }
  finally {
	ranonce=true;};
};

function onDOMContentLoaded(){		 
	if  (jQuery.fn.jquery.split('.')[1]<5)  {			//I never asked for this
		var scriptNode = document.createElement ("script");						// but stupid @require fails to overwrite existing jQuery on site,		
		scriptNode.addEventListener("load", function(){$.noConflict();});		// which might be too old (<1.5) for the script to work (ajax.done and stuff)
		scriptNode.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js';
		document.getElementsByTagName('head')[0].appendChild (scriptNode);		//have to do it manually
	};
 
	tagsDB = new SwfStore({														//loading tag database, holds pairs "filename	is_saved,tag1,tag2,...,tagN"
		namespace: "animage",
		swf_url: storeUrl, 
		onready: function(){
			main();
		},
		debug: debug,
		onerror: function() {
			alert('tagsDB failed to load');
		}
	}); 
};

function process (res, v){														//process information obtained from API by post ID
	if (res.meta.status!='200') {
		console.log('API error: '+res.meta.msg);
		return;
	};
	if (res.response.posts[0].type!='photo') {									//we're only interested in photo posts
		document.title+=String.fromCharCode(160) ;
		return;																	
	};
	bar='|';																	//piece of progressbar, | for every image in photoset post, - for single photo post
																				// empty space for non-photo or tagless posts, ✗ for errors
	link_url=res.response.posts[0].link_url;
	ext=getFname(link_url).substring(getFname(link_url).lastIndexOf('.'));
	r=/(jpe*g|bmp|png|gif)/gi;													//check if this is actually an image link
	link_url=(r.test(ext))?link_url:'';
	photoset=res.response.posts[0].photos.length;								//find whether this is a single photo post or a photoset
	if (photoset-1) {
		ifr=jQuery(v).find('iframe.photoset').contents();
		if (ifr.length==0)
			ifr=jQuery(v).find("div[id^='photoset']");							//some themes store photosets in iframes, others don't
	}
	else 				
		bar='-';
	url=(link_url)?link_url:res.response.posts[0].photos[0].original_size.url;
		
	tags=res.response.posts[0].tags;											//get tags associated with the post
	if (tags.length!=0) {														//nothing to do here without them
														//to-do: add tags retrieval from reblog source if no tags were found here
		tags.unshift('0');														//assume image is not saved yet
		//jQuery.each(tags,function(i,v){tags[i]=v.replace(/\,/g,'.');});			
		for (j=0; j<photoset; j++) {		
			document.title+=bar;														
			url=(link_url)?link_url:res.response.posts[0].photos[j].original_size.url;		
			if (photoset-1) {
				link=jQuery(ifr).find('a');										//let's hope all links of this kind in themes have this class
				if ((link.length)&&(link[j].href)) 
					removeEvents(link[j]);											//remove event listeners such as onclick, because in Chrome they mess with middlebutton new tab opening
			};
			tst=tagsDB.get( getFname(url) );									//check if there's already a record in database for this image				
			if ((!tst)||(debug))  												//if there isn't, make one, putting the flag and tags there
				tagsDB.set(getFname(url), tags.toString());			
														//to-do: make tags cumulative, adding up upon visiting different reposts of same image?
			if ((tst)&&(tst.split(',')[0]=='1')&&(document.location.href.indexOf('/image/')==-1)) {																		
																				//otherwise if there is a record and it says the image has been saved
				if (photoset==1){												//add a border of highlight color around the image to indicate that
					if (jQuery(v).find('.media').length)
						jQuery(v).find('.media')[0].style.background=highlight
					else if (jQuery(v).find('.post-content').length)
						jQuery(v).find('img')[0].style.background=highlight		//wish I had a single straightforward way to do that for all tumblr themes
					else
						v.style.background=highlight;
				}
				else 															//and for photosets too
					jQuery(ifr).find('img')[j].style.border='4px solid '+highlight;	
			};
		};
	}
	else document.title+=String.fromCharCode(160);								//empty space indicates no found tags for a post
	lnk=jQuery(v).find('img')[0];
	if (lnk)
		if ( (lnk.parentNode.href) && ((lnk.parentNode.href.indexOf('/image/')!=-1)||(lnk.parentNode.href==res.response.posts[0].link_url)))	{
			lnk.parentNode.href=url;											//make the photos link directly to the best quality image instead of a page
			removeEvents(lnk.parentNode);										//looks like it's impossible to know if there are even listeners so I have to process it anyway
		};
};
 
function removeEvents(node){	//remove event listeners such as onclick, because in Chrome they mess with middlebutton new tab opening
	if (fixMiddleClick) {
		elClone = node.cloneNode(true);											
		node.parentNode.replaceChild(elClone, node);		
		//jQuery(node).on('click','');   jQuery(node).removeAttr('onclick');
	};
};
 
