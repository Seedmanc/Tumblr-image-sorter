// ==UserScript==
// @name		Animage-post
// @description	Store tags for images and indicate saved state
// @version		1.0
// @author		Seedmanc
// @include		http://*.tumblr.com/post/*
// @include		http://*.tumblr.com/page/*
// @include		http://*.tumblr.com/tagged/*
// @include		http://*.tumblr.com/
// @include		http://*.tumblr.com/image/*
// @include		http://*.tumblr.com/search/*
// @include		http*://www.tumblr.com/dashboard*

// @exclude		http*://*.media.tumblr.com/*

// @grant 		none
// @run-at 		document-start
// @require  	https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js 
// @require 	https://dl.dropboxusercontent.com/u/74005421/js%20requisites/swfstore.min.js 
// ==/UserScript==

// ==Settings=====================================================

	var highlightColor=	'black';													//Because chrome sucks it does not support outline-color invert which ensured visibility
																					// you'll have to specify a color to mark saved images and hope it won't blend with bg

	var fixMiddleClick=	true;														//Because chrome sucks, it launches left onClick events for middle click as well,
																					// which is wrong, images open in photoset viewer instead of a new tab as required for the script
																					// this option will 'fix' this by removing the view in photoset feature altogether
																					// alternatively you'll have to right-click open in a new tab instead
																				
	var debug=			false;														//Initial debug value, gets changed to settings value after DB creation
																					// enabling debug makes DB entries for images updated every time post is visited
																					// also it enables error notifications
	var storeUrl=		'//dl.dropboxusercontent.com/u/74005421/js%20requisites/storage.swf';
																					//Flash databases are bound to the URL, must be same as in the other script
																				
	var enableOnDashboard= true;													//Will try to collect post info from dashboard posts too
																					// might be slow and/or glitchy so made optional
	var Googlify= true;																//Make every inline image of a post  link to its reverse image search on Google
																					//might break themes like PixelUnion Fluid
// ==/Settings====================================================

 tagsDB=null;
var J=T=P=false;
var namae=document.location.host; 				
var isImage=(document.location.href.indexOf('/image/')!=-1);						//processing for image pages is different from regular posts
var isPost=(document.location.href.indexOf('/post/')!=-1);
var isDash=(namae.indexOf('www.')==0);												//processing for non-blog pages of tumblr like dashboard is different too
document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);

function getFname(fullName){														//extract filename from image URL and format it
	fullName=fullName||'';													
	fullName=fullName.replace(/(\?).*$/gim,'');										//first remove url parameters 
	if (fullName.indexOf('tumblr_')!=-1) 
		fullName=fullName.replace(/(tumblr_)|(_\d{2}\d{0,2})(?=\.)/gim,'')			//prefix and postfix of tumblr image names can be omitted without info loss
	else if (fullName.indexOf('xuite')!=-1) {										//this hosting names their images as "(digit).jpg" causing filename collisions
		i=fullName.lastIndexOf('/');
		fullName=fullName.substr(0,i)+'-'+fullName.substr(i+1);						//add parent catalog name to the filename to ensure uniqueness
	};
	return fullName.split('/').pop(); 					
};  

function getID(lnk){																//extract numerical post ID from self-link
	if (lnk.search(/[^0-9]/g)==-1)
		return lnk;																	//sometimes the argument is the ID itself that needs checking
	Result=lnk.substring(lnk.indexOf('/post/')+7+lnk.indexOf('image/'));			//one of those will be -1, another the actual offset	
	Result=Result.replace(/(#).*$/gim,'');											//remove url postfix 
	i=Result.lastIndexOf('/');
	if (i!=-1)
		Result=Result.substring(0,i);
	if ((Result=='')||(Result.search(/[^0-9]/g)!=-1)) {
		if (debug) alert('IDentification error: '+Result);
		throw new Error('IDentification error: '+Result);
	}
	else
		return Result;
};

function identifyPost(v){															//Find the ID of post in question and request info via API for it
	if (isDash) {
		self=jQuery(v).find('a.post_permalink')[0];									//again everything is simple when on dashboard
		namae=self.hostname;														//On dashboard every post might have a different author
		id=getID(self.href);
	} else if (isPost)
		id=getID(document.location.href)											//even simpler on the post page
	else {																			//but it gets tricky in the wild
		id='';
		h=jQuery(v).find("a[href*='"+namae+"/post/']");								//several attempts to find selflink
		h=(h.length)?h:jQuery(v).next().find("a[href*='"+namae+"/post/']");			//workaround for Optica theme that doesn't have selflinks within .post elements
		h=(h.length)?h:jQuery(v).find("a[href*='"+namae+"/image/']");				//IDs can be found both in links to post and to image page
		if (h.length) 
			id=getID(h[h.length-1].href);														
		if (id == '') {																//if no link was found, try to find ID in attributes of nodes
			phtst=jQuery(v).find("div[id^='photoset']");							//photosets have IDs inside, well, id attributes starting with photoset_
			pht=jQuery(v).attr('id');												//single photos might have ID inside same attribute
			if (phtst.length) 
				id=phtst.attr('id').split('_')[1]
			else if (pht)
				id=getID(pht)
			else {				
				document.title+='✗';												//give up
				if (debug) alert('IDs not found');
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
		}).done(function(result) {resolve({r:result, v:v});})						//have to return two values at once, data and pointer to post on page
		  .fail(function(jqXHR, textStatus, errorThrown) {reject(Error(textStatus));});
    });	
};

function loadAndExecute(url, callback){										//Load specified js library and launch a function after that
	var scriptNode = document.createElement ("script");	
	scriptNode.addEventListener("load", callback);
	scriptNode.onerror=function(){ 
		document.title+='✗';
		if (debug) alert("Can't load "+url);
	};
	scriptNode.src = url;
	document.head.appendChild(scriptNode);
};

function main(){																	//search for post IDs on page and call API to get info about them
	if (isDash)
		posts=jQuery('ol.posts').find('div.post').not('.new_post')					//getting posts on dashboard is straightforward with its constant design,
	else {																			// but outside of it are all kinds of faulty designs, so we have to experiment
		posts=jQuery('article.entry > div.post').not('.n').parent();				//some really stupid plain theme have to be checked before everything
		posts=(posts.length)?posts:jQuery('.post');									//general way to obtain posts that are inside containers with class='post'
		if (isImage) 
			if (tagsDB.get(getFname(jQuery('img#content-image')[0].src)))
				document.location.href=jQuery('img#content-image')[0].src			//proceed directly to the image if it already has a DB record with tags	
			else
				posts=[jQuery('<div><a href="'+document.location.href+'" >a</a></div>')];	
																					//make it work also on image pages, since we can get post id from url
		posts=posts.length?posts:jQuery('.column').eq(2).find('.bottompanel').parent();
																					//for "Catching elephant" theme
		posts=posts.length?posts:jQuery('[id="post"]');								//for "Cinereoism" that uses IDs instead of Classes /0	
		posts=posts.length?posts:jQuery('[id="designline"]');						//The Minimalist, not tested though and saved indication probably won't work
		posts=posts.length?posts:jQuery('[id="posts"]');							//Tincture pls why are you doing this
		posts=posts.length?posts:jQuery("div.posts");								//some redux theme, beats me
		if (posts.length==0){
			document.title+=' [No posts found]';									//give up
			return;
		};
	};

	document.title="Rdy:[";															//Because chrome sucks it has no window title area
																					//We're limited to tab title which is very small
																					//A "progressbar" will be displayed in page title,
	if (!isImage)	{																//indicating that the page is ready for interaction
		hc=posts.find('.hc.nest');
		if (hc.length) {
			hc.css('position','relative');											//fix broken themes with image links being under a large div		
			posts=hc.parent();														//because sharing is caring
		};
	};
	
	promisePosts(posts.toArray()).then(function() {									//the what
 		if (isImage)																//redirect to actual image from image page after we got the ID
 			document.location.href=jQuery('img#content-image')[0].src;						
 		document.title+=']100%';													//at the end of processing indicate it's finished
	}).catch(function(err) {														//catch any error that happened along the way
 		document.title+='✗';  
 		if (debug) alert( 'Error: '+err.message);
		throw err;
	}); 	
};

function mutex(){																	//check readiness of libraries being loaded simultaneously
	if (J&&T&&P){		
		J=T=P=false;																											
		main();																		//when everything is loaded, proceed further
	}
};

function onDOMContentLoaded(){														//load plugins 
	if (window.top != window.self)  												//don't run on (i)frames
		return;
	if (isDash && !enableOnDashboard)												//don't run on dashboard unless enabled
		return;
			
	if (!(Promise && Promise.resolve))  											//Because tumblr sucks it replaces native Promise implementation
		loadAndExecute('//dl.dropboxusercontent.com/u/74005421/js%20requisites/es6-promise.min.js', function(){ 
			P=true;																	// with it's own bullshit on dashboard via index.js that doesn't work
			mutex();
		})																			//therefore I have to fix that by overwriting it back by a polyfill
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
	
	tagsDB = new SwfStore({															//main tag database, holds pairs "filename	{s:is_saved?1:0,t:'tag1,tag2,...,tagN'}"
		namespace: "animage",
		swf_url: storeUrl, 
		debug: debug,
		onready: function(){
			debug=(tagsDB.get(':debug:')=='true');									//update initial debug value with the one saved in DB
			tagsDB.config.debug=debug;			
			T=true;
			mutex();
		},
		onerror: function() {
			if (debug)
				alert('tagsDB failed to load')										
			else																	
				document.title="tagsDB load error";	
		}
	}); 
};

function process(postData) {														//process information obtained from API by post ID
	v=jQuery(postData.v);															//pointer to post on page
	res=postData.r;																	//API response
	var link_url='';
	var img;
	if (res.meta.status!='200') {													//I don't even know if this is reachable
		if (debug) alert('API error: '+res.meta.msg);
		throw  new Error('API error: '+res.meta.msg);
		return;
	};
	if (Googlify) {
		inlimg=$('img[src*="tumblr_inline_"]');
		$.each(inlimg,function(ix,vl) {
			a='<a href="http://www.google.com/searchbyimage?sbisrc=cr_1_0_0&image_url='+escape(vl.src)+'"  ></a>';
			$(vl).wrap(a);
		});
	};
	if (res.response.posts[0].type!='photo') {										//we're only interested in photo posts
		document.title+=' ';
		return;																	
	};
	photos=res.response.posts[0].photos.length;										//find whether this is a single photo post or a photoset
	if (photos>1) {
		ifr=v.find('iframe.photoset').contents();
		ifr=ifr.length?ifr:v.find('figure.photoset');
		if (ifr.length==0)															//some photosets are in iframes, some aren't
			ifr=v.find("div[id^='photoset'] img")
		else 
			ifr=ifr.find('img');
	} else {
		link_url+=res.response.posts[0].link_url;									//for a single photo post, link url might have the highest-quality image version,
		ext=link_url.split('.').pop();												// unaffected by tumblr compression
		r=/(jpe*g|bmp|png|gif)/gi;													//check if this is actually an image link
		link_url=(r.test(ext))?link_url:''; 
		
		img=v.find('img[src*="tumblr_"]');											//find image in the post to linkify it
		if (img.length) {
			p=img.parent().wrap('<p/>');											//Parent might be either the link itself or contain it as a child
			lnk=p.parent().find('a[href*="/image/"]');
			lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].link_url+'"]');
			lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].photos[0].original_size.url+'"]');
			if ((lnk.length) && (lnk[0].href))					
				lnk[0].href=link_url?link_url:res.response.posts[0].photos[0].original_size.url
			else 																
				img.wrap('<a href="'+res.response.posts[0].photos[0].original_size.url+'"></a>');
			p.unwrap();																//^ this might potentially break themes like Fluid by PU
		};
	};
	bar=String.fromCharCode(10111+photos);											//piece of progressbar, (№) for amount of photos in a post
																					// empty space for non-photo posts, ✗ for errors

	tags=res.response.posts[0].tags;												//get tags associated with the post
	DBrec={s:0, t:tags.toString().toLowerCase()};									//create an object for database record
	for (j=0; j<photos; j++) {
		url=(link_url)?link_url:res.response.posts[0].photos[j].original_size.url;		
		tst=tagsDB.get(getFname(url));												//check if there's already a record in database for this image	
		if (((!tst)||(debug))&&(tags.length))  										//if there isn't or we're in debug mode, make one, putting the flag and tags there
			tagsDB.set(getFname(url), JSON.stringify(DBrec));	
														//TODO: make tags cumulative, adding up upon visiting different posts of same image?
														//TODO: add tags retrieval from reblog source if no tags were found here
		if ((tst)&&(JSON.parse(tst).s=='1')&&(!isImage)) {							//otherwise if there is a record and it says the image has been saved
			img=(photos==1)?img:jQuery(ifr[j]);
			img.css('outline','3px solid '+highlightColor).css('outline-offset','-3px');	
																					//add a border of highlight color around the image to indicate that
		};
	};	
	document.title+=(tags.length)?bar:'-';											//empty space indicates no found tags for the post
};

function promisePosts(posts){														//Because chrome sucks I have write a bunch of nonsensical code just to make sure it behaves
																					// and processes posts in their order instead of randomly. 		
 	return posts.map(identifyPost).reduce(function(sequence, chapterPromise) {		// Opera did everything properly right away without tinkering
 		return sequence.then(function() {
 			return chapterPromise;
		}).then(function(chapter) {													//copied directly from some html5 site, don't ask me about variable names, ask chrome why it sucks
			process(chapter);
		});
	}, Promise.resolve());
};

function removeEvents(node){														//remove event listeners such as onclick, because in chrome they mess with middlebutton new tab opening
	if (fixMiddleClick) {
		elClone = node.cloneNode(true);											
		node.parentNode.replaceChild(elClone, node);		 
	};
};
//TODO: store post ID and blog name for images? Might help with images whose link_url follows to 3rd party hosting with expiration (animage). Also will make it possible to have a backlink from image page