﻿// ==UserScript==
// @name		Animage-post
// @description	Store tags for images and indicate saved state
// @version		1.0
// @author		Seedmanc
// @namespace	https://github.com/Seedmanc/Tumblr-image-sorter

// @include		http://*.tumblr.com/post/*
// @include		http://*.tumblr.com/page/*
// @include		http://*.tumblr.com/tagged/*
// @include		http://*.tumblr.com/
// @include		http://*.tumblr.com/image/*
// @include		http://*.tumblr.com/search/*
// @include		http*://www.tumblr.com/dashboard*

// @exclude		http*://*.media.tumblr.com/*

// @grant 		none
// @run-at 		document-body
// @require  	https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js 
// @require 	https://dl.dropboxusercontent.com/u/74005421/js%20requisites/swfstore.min.js 
// @noframes
// ==/UserScript==

// ==Settings=====================================================

	var highlightColor=		'black';												//Because chrome sucks it does not support outline-color invert which ensured visibility
																					// you'll have to specify a color to mark saved images and hope it won't blend with bg

	var fixMiddleClick=		true;													//Because chrome sucks, it launches left onClick events for middle click as well,
																					// images open in photoset viewer instead of a new tab as required for the script
																					// this option will 'fix' this by removing the view in photoset feature altogether
																					// alternatively you'll have to right-click open in a new tab instead
	
	var enableOnDashboard=	true;													//Will try to collect post info from dashboard posts too
																					// might be slow and/or glitchy so made optional

	var linkify= 			true;													//Make every image (even inline images in non-photo posts) to be processed
																					// and linked to either itself, it's larger version or its reverse image search
																					// might break themes like PixelUnion Fluid
																					
	var debug=				false;													//Initial debug value, gets changed to settings value after DB creation
	
	var storeUrl=		'//dl.dropboxusercontent.com/u/74005421/js%20requisites/storage.swf';
																					//Flash databases are bound to the URL, must be same as in the other script
// ==/Settings====================================================

 tagsDB=null;
var J=T=P=false;
var namae=document.location.host; 				
var isImage=(document.location.href.indexOf('/image/')!=-1); 
var isPost=(document.location.href.indexOf('/post/')!=-1);
var isDash=(namae.indexOf('www.')==0); 
var asked=false;

window.onerror = function(msg, url, line, col, error) {								//General error handler
 	var extra = !col ? '' : '\ncolumn: ' + col;
 	extra += !error ? '' : '\nerror: ' + error;										//Shows '✗' for errors in title and also alerts a message if debug is on
 	if (msg.search('Script error')!=-1)
 		return true;																// except for irrelevant errors
 	document.title+='✗';
	if (debug)
		alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra)
	else 
		throw error;
 	var suppressErrorAlert = true;
 	return suppressErrorAlert;
};

function getFname(fullName){														//Extract filename from image URL and format it
	fullName=fullName||'';													
	fullName=fullName.replace(/(\?).*$/gim,'');										//First remove url parameters 
	if (fullName.indexOf('tumblr_')!=-1) 
		fullName=fullName.replace(/(tumblr_)|(_\d{2}\d{0,2})(?=\.)/gim,'')			//Prefix and postfix of tumblr image names can be omitted without info loss
	else if (fullName.indexOf('xuite')!=-1) {										//this hosting names their images as "(digit).jpg" causing filename collisions
		i=fullName.lastIndexOf('/');
		fullName=fullName.substr(0,i)+'-'+fullName.substr(i+1);						//add parent catalog name to the filename to ensure uniqueness
	};
	return fullName.split('/').pop(); 					
};  

function getID(lnk){																//Extract numerical post ID from self-link
	if (lnk.search(/[^0-9]/g)==-1)
		return lnk;																	//Sometimes the argument is the ID itself that needs checking
	Result=lnk.substring(lnk.indexOf('/post/')+7+lnk.indexOf('image/'));			//one of those will be -1, another the actual offset	
	Result=Result.replace(/(#).*$/gim,'');											//remove url postfix 
	i=Result.lastIndexOf('/');
	if (i!=-1)
		Result=Result.substring(0,i);
	if ((Result=='')||(Result.search(/[^0-9]/g)!=-1)) 
		throw new Error('IDentification error: '+Result)
	else
		return Result;
};

function identifyPost(v){															//Find the ID of post in question and request info via API for it
	if (isDash) {
		self=jQuery(v).find('a.post_permalink')[0]; 
		namae=self.hostname;														//On dashboard every post might have a different author
		id=getID(self.href);
	} else if (isPost)
		id=getID(document.location.href)											//Even simpler on the post page
	else {																			// but it gets tricky in the wild
		id='';
		h=jQuery(v).find("a[href*='"+namae+"/post/']");								//Several attempts to find selflink
		h=(h.length)?h:jQuery(v).next().find("a[href*='"+namae+"/post/']");			//workaround for Optica theme that doesn't have selflinks within .post elements
		h=(h.length)?h:jQuery(v).find("a[href*='"+namae+"/image/']");				//IDs can be found both in links to post and to image page
		if (h.length) 
			id=getID(h[h.length-1].href);														
		if (id == '') {																//If no link was found, try to find ID in attributes of nodes
			phtst=jQuery(v).find("div[id^='photoset']");							// photosets have IDs inside, well, id attributes starting with photoset_
			pht=jQuery(v).attr('id');												// single photos might have ID inside same attribute
			if (phtst.length) 
				id=phtst.attr('id').split('_')[1]
			else if (pht)
				id=getID(pht)
			else {				
				throw new Error('IDs not found');
				return false;
			};
		};			
	};											//TODO: only call API if no DB record was found for images in current post			
    return new Promise(function(resolve, reject) {									//I have no idea what this is
     	jQuery.ajax({																//get info about current post via tumblr API based on the ID
			type:'GET',
			url: "//api.tumblr.com/v2/blog/"+namae+"/posts/photo",
			dataType:'jsonp',
			data: {
				api_key : "fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4",
				id: id
			}
		}).done(function(result) {resolve({r:result, v:v});})						//Have to return two values at once, data and pointer to post on page
		  .fail(function(jqXHR, textStatus, errorThrown) {reject(Error(textStatus));});
    });	
};

function loadAndExecute(url, callback){												//Load specified js library and launch a function after that
	var scriptNode = document.createElement ("script");	
	scriptNode.addEventListener("load", callback);
	scriptNode.onerror=function(){ 
		throw new Error("Can't load "+url);
	};
	scriptNode.src = url;
	document.head.appendChild(scriptNode);
};

function main(){																	//Search for post IDs on page and call API to get info about them
	if (debug) 
		jQuery("div[id^='SwfStore_animage_']").css('top','0').css('left','0').css("position",'absolute').css('opacity','0.8');
	else																			//Bring the flash window in or out of the view depending on the debug mode
		jQuery("div[id^='SwfStore_animage_']").css('top','-2000px').css('left','-2000px').css("position",'absolute');
	if (isDash)
		posts=jQuery('ol.posts').find('div.post').not('.new_post')					//Getting posts on dashboard is straightforward with its constant design,
	else {																			// but outside of it are all kinds of faulty designs, so we have to experiment
		posts=jQuery('article.entry > div.post').not('.n').parent();				//Some really stupid plain theme have to be checked before everything
		posts=(posts.length)?posts:jQuery('.post').not('#description');				//General way to obtain posts that are inside containers with class='post'
		if (isImage) 
			if (tagsDB.get(getFname(jQuery('img#content-image')[0].src)))
				document.location.href=jQuery('img#content-image')[0].src			//Proceed directly to the image if it already has a DB record with tags	
			else
				posts=[jQuery('<div><a href="'+document.location.href+'" >a</a></div>')];	
																					//Make it work also on image pages, since we can get post id from url
		posts=posts.length?posts:jQuery('.column').eq(2).find('.bottompanel').parent();
																					//for "Catching elephant" theme
		posts=posts.length?posts:jQuery('[id="post"]');								//for "Cinereoism" that uses IDs instead of Classes /0	
		posts=posts.length?posts:jQuery('[id="designline"]');						//The Minimalist, not tested though and saved indication probably won't work
		posts=posts.length?posts:jQuery('[id="posts"]');							//Tincture pls why are you doing this
		posts=posts.length?posts:jQuery("div.posts").not('#allposts');				//some redux theme, beats me
		if (posts.length==0){
			document.title+=' [No posts found]';									//Give up
			return;
		};
	};
																					//Because chrome sucks it has no window title area
	document.title="▶[";															// we're limited to tab title which is very small
																					//A "progressbar" will be displayed in page title,
	if (!isImage)	{																// indicating that the page is ready for interaction
		hc=posts.find('.hc.nest');
		if (hc.length) {
			hc.css('position','relative');											//Fix 'broken' themes with image links being under a large div		
			posts=hc.parent();														// because sharing is caring
		};
	};
	
	promisePosts(posts.toArray()).then(function() {									//the what
 		if (isImage)																//Redirect to actual image from image page after we got the ID
 			document.location.href=jQuery('img#content-image')[0].src;						
 		document.title+=']■';														//At the end of processing indicate it's finished
	}).catch(function(err) {														//catch any error that happened along the way
		throw err;
	}); 	
};

function mkUniq(arr){																//Sorts an array and ensures uniqueness of its elements
	to={};
	$.each(arr, function(i,v){
		to[v.toLowerCase()]=true;});
	arr2=Object.keys(to);
	return arr2;
};

function mutex(){																	//Check readiness of libraries being loaded simultaneously
	if (J&&T&&P){		
		J=T=P=false;																											
		main();																		//when everything is loaded, proceed further
	}
};

if (typeof masonite != 'undefined')
	jQuery(window).load(function(){													//some themes require waiting till their own functions finish
		onDOMContentLoaded();
	})
else
	onDOMContentLoaded();
	
function onDOMContentLoaded(){														//Load plugins 

	if (isDash && !enableOnDashboard)												//don't run on dashboard unless enabled
		return;
			
	if (!(Promise && Promise.resolve))  											//Because tumblr sucks it replaces native Promise implementation
		loadAndExecute('//dl.dropboxusercontent.com/u/74005421/js%20requisites/es6-promise.min.js', function(){ 
			P=true;																	// with it's own bullshit on dashboard via index.js that doesn't work
			mutex();
		})																			// therefore I have to fix that by overwriting it back by a polyfill
	else
		P=true;
	if (jQuery.fn.jquery.split('.')[1]<5) {											//@require doesn't load jQuery if it's already present on the site
		loadAndExecute('//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js', function(){ 
			$.noConflict();														// but existing version might be older than required (1.5)
			J=true;
			mutex();															// force load the newer jQuery if that's the case
		});			
	}
	else 
		J=true; 

	tagsDB = new SwfStore({															//Main tag database, holds pairs "filename	{s:is_saved?1:0,t:'tag1,tag2,...,tagN'}"
		namespace: "animage",
		swf_url: storeUrl, 
		debug: debug,
		onready: function(){
			debug=(tagsDB.get(':debug:')=='true');									//Update initial debug value with the one saved in DB
			tagsDB.config.debug=debug;			
			T=true;
			mutex();
		},
		onerror: function() {			
			document.title="✗ tagsDB error";	
			throw new Error('tagsDB failed to load');												
		}
	}); 
};

function process(postData) {														//Process information obtained from API by post ID
	v=jQuery(postData.v);															//pointer to post on page
	res=postData.r;																	//API response
	var link_url='';
	var img=jQuery([]);
	var inlimg=[];
	var isPhoto=res.response.posts[0].type=='photo';
	var photos=0;
	var bar='';
	if (res.meta.status!='200') {													//I don't even know if this is reachable
		throw  new Error('API error: '+res.meta.msg);
		return;
	};
	if (linkify) {																	//Find inline images
		inlimg=v.find('img[src*="tumblr_inline_"]');
		inlimg=jQuery.grep(inlimg, function(vl,ix) {
			if (vl.src.search(/(_\d{2}\d{0,2})(?=\.)/gim)!=-1) {
				href=vl.src.replace(/(_\d{2}\d{0,2})(?=\.)/gim,'_1280');			//If there is an HD version, link it
				r=true;
				bar=inlimg.length;
			}
			else {
				href='http://www.google.com/searchbyimage?sbisrc=cr_1_0_0&image_url='+escape(vl.src);
				r=false;															// otherwise link to google reverse image search 
			};
			a='<a href="'+href+'" style=""></a>';
			i=jQuery(vl);
			x=i.parent().is('a')?i:i.parent().parent().is('a')?i.parent():i;		//I dunno either
			if ((x.parent().is('a'))||(i.width()<128)) 								// basically either direct parent or grandparent of the image can be a link already
				return false;														// in which case we need to skip processing to avoid problems
																					// as well as if the image was in fact a button and not a part of the post
			i.wrap(a);
			if (typeof pxuDemoURL !== 'undefined' && pxuDemoURL=="fluid-theme.pixelunion.net")
				i.parent().css('position','relative');								//Fix for PixelUnion Fluid which otherwise gets rekt if you insert a link
			return r;
		});
	};
	if (!isPhoto) {																	//Early termination if there are no images at all
		if ((!linkify)||(inlimg.length==0)) {										// or if processing is disabled
			document.title+=' ';
			return;				
		};
	} else {
		photos=res.response.posts[0].photos.length;									//Find whether this is a single photo post or a photoset
		if (photos>1) {
			img=v.find('iframe.photoset').contents();
			img=img.length?img:v.find('figure.photoset');
			if (img.length==0)														//Some photosets are in iframes, some aren't
				img=v.find("div[id^='photoset'] img")
			else 
				img=img.find('img');
			img=img.not('img[src*="tumblr_inline_"]');
		} else {
			link_url+=res.response.posts[0].link_url;								//For a single photo post, link url might have the highest-quality image version,
			ext=link_url.split('.').pop();											// unaffected by tumblr compression
			r=/(jpe*g|bmp|png|gif)/gi;												// check if this is actually an image link
			link_url=(r.test(ext))?link_url:''; 

			img=v.find('img[src*="tumblr_"]').not('img[src*="tumblr_inline_"]');	//Find image in the post to linkify it
			if (img.length && linkify) {
				p=img.parent().wrap('<p/>');										//Parent might be either the link itself or contain it as a child,
				lnk=p.parent().find('a[href*="/image/"]');							// depends on particular theme
				lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].link_url+'"]');
				lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].photos[0].original_size.url+'"]');
				if ((lnk.length) && (lnk[0].href))					
					lnk[0].href=link_url?link_url:res.response.posts[0].photos[0].original_size.url
				else if (typeof pxuDemoURL == 'undefined')																	
					img.wrap('<a href="'+res.response.posts[0].photos[0].original_size.url+'"></a>');
				p.unwrap();															//^ this might break themes like Fluid by PU
			};
		};
		bar=String.fromCharCode(10111+photos);										//Piece of progressbar, (№) for amount of photos in a post
																					// empty space for non-photo posts, ✗ for errors
	};
	img=jQuery(img.toArray().concat(inlimg));										//Make sure the resulting list of images is in order
	tags=res.response.posts[0].tags;												//get tags associated with the post
	DBrec={s:0, t:tags.toString().toLowerCase()};									//create an object for database record
	
	for (j=0; j<photos+inlimg.length; j++) {
		if (j<photos) 																//First come the images in photo posts if exist
			url=(link_url)?link_url:res.response.posts[0].photos[j].original_size.url
		else																		// then the inline ones
			url=img.eq(j).parent().attr('href');
		tst=tagsDB.get(getFname(url));												//Check if there's already a record in database for this image	
		if (tags.length)  {
			if (tst) {																// if there is we need to merge existing tags with newfound ones
				oldtags=JSON.parse(tst).t.split(',');
				newtags=mkUniq(oldtags.concat(tags));
				DBrec.t=newtags.toString().toLowerCase();
				DBrec.s=parseInt(JSON.parse(tst).s);
			} else
				DBrec.s=0;
			tagsDB.set(getFname(url), JSON.stringify(DBrec));	
			
			if (tagsDB.get(getFname(url))!=JSON.stringify(DBrec))					//Immediately check whether the write was successful
				if (!debug && !asked)												// if not and no debug mode enabled, prompt to enable it
					if (confirm('Failed writing to DB. Flashcookies size limit might have been hit.\n Would you like to enable debug mode to get a possibility to fix that? (Will reload the page)')) {
						tagsDB.set(':debug:','true');
						location.reload();
						asked=true;													//avoid asking multiple times for every post
					} else
						throw new Error('Failed to write to DB')
				else if (!asked){													// if already in debug, try to bring the flash window into view
					alert('Failed writing to DB. Flashcookies size limit might have been hit. If you see a flash dialog window at the top-left corner, try raising the limit.');
					window.scrollTo(0, 0);
					asked=true;
				};	
		};												//TODO: add tags retrieval from reblog source if no tags were found here
		if ((tst)&&(JSON.parse(tst).s=='1')&&(!isImage)) 							//Otherwise if there is a record and it says the image has been saved 
			img.eq(j).css('outline','3px solid '+highlightColor).css('outline-offset','-3px');	
																					//Add a border of highlight color around the image to indicate that
		if ((photos>1)&&(j<photos)) {
			y=img.eq(j).parent();
			y=y.is('a')?y:y.parent().find('a').eq(0);								//Look for a link either directly above the image or around it
			if (y.is('a'))  
				removeEvents(y[0]);													//get rid of that annoying photoview feature
		};
	};	
	document.title+=(tags.length)?bar:'-';											//dash indicates no found tags for the post
};

function promisePosts(posts){														//because chrome sucks I have write a bunch of nonsensical code just to make sure it behaves
																					// and processes posts in their order instead of randomly. 		
 	return posts.map(identifyPost).reduce(function(sequence, chapterPromise) {		// Opera did everything properly right away without tinkering
 		return sequence.then(function() {
 			return chapterPromise;
		}).then(function(chapter) {													//copied directly from some html5 site, don't ask me about variable names, ask chrome why it sucks
			process(chapter);
		});
	}, Promise.resolve());
};

function removeEvents(node){	 													//Remove event listeners such as onclick, because in chrome they mess with middlebutton new tab opening
	if (fixMiddleClick) {
		jQuery(node).attr('target','_blank');
		elClone = node.cloneNode(true);											
		node.parentNode.replaceChild(elClone, node);		 
	};
};
//TODO: store post ID and blog name for images? Might help with images whose link_url follows to 3rd party hosting with expiration (animage). Also will make it possible to have a backlink from image page
//TODO: implement some kind of feedback from flash to script about space request success
//TODO: output FlashDB messages to flash window instead of console on debug.