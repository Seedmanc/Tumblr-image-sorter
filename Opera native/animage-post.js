// ==UserScript==
// @name		Animage-post
// @description	Store tags for images and indicate saved state
// @version	1.1
// @author		Seedmanc
// @include	http://*.tumblr.com/post/*
// @include	http://*.tumblr.com/page/*
// @include	http://*.tumblr.com/tagged/*
// @include	http://*.tumblr.com/
// @include	http://*.tumblr.com/image/*
// @include	http://*.tumblr.com/search/*
// @include	http*://www.tumblr.com/dashboard*
// @include	http*://www.tumblr.com/tagged/*

// @exclude	http*://*.media.tumblr.com/*
// ==/UserScript==

// ==Settings=====================================================

	var enableOnDashboard=	true;												//will try to process posts on dashboard too
																				// might be slow and/or glitchy so made optional

	var linkify= 			true;												//make every image (even inline images in non-photo posts) to be processed
																				// and linked to either itself, it's larger version or its reverse image search
																				// might break themes like PixelUnion Fluid

	var debug=				false;												//initial debug value, gets changed to settings value after DB creation
																				// enables error notifications and disables cleanup (causes lag on tab close)
	var storeUrl=	'//dl.dropboxusercontent.com/u/74005421/js%20requisites/storage.swf';
																				//flash databases are bound to the URL, must be same as in the other script			
// ==/Settings====================================================

function loadAndExecute(url, callback){											//Load specified js library and launch a function after that
	var scriptNode = document.createElement ("script");	
	scriptNode.addEventListener("load", callback);
	scriptNode.onerror=function(){ 
		throw new Error("Can't load "+url);
	};
	scriptNode.src = url;
	document.head.appendChild(scriptNode);
};

 tagsDB=null;
var J=T=false;
var namae=document.location.host; 			
var isImage=(document.location.href.indexOf('/image/')!=-1);					//processing for image pages is different from regular posts
var isPost=(document.location.href.indexOf('/post/')!=-1);
var isDash=(namae.indexOf('www.')==0);											//processing for non-blog pages of tumblr like dashboard is different too
var asked=false;

document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);

window.onerror = function(msg, url, line, col, error) {							//general error handler
   var extra = !col ? '' : '\ncolumn: ' + col;
   extra += !error ? '' : '\nerror: ' + error;									//shows '✗' for errors and also alerts a message if in debug mode
   if ((msg.search('this.swf')!=-1)||(msg.search('Script error')!=-1)) 
	 return true;																//except for irrelevant errors
   document.title+='✗';
   if (debug)
	alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra)
   else
	throw error;
   var suppressErrorAlert = true;
   return suppressErrorAlert;
};

function cleanUp(){																//remove variables and flash objects from memory 
	if (debug) return;															// without removal there would be a noticeable lag upon tab closing in Opera
	delete tagsDB;
	jQuery("object[id^='SwfStore_animage_']").remove();
};

function getFname(fullName){													//extract filename from image URL and format it
	fullName=fullName||'';													
	fullName=fullName.replace(/(\?).*$/gim,'');									//first remove url parameters 
	if (fullName.indexOf('tumblr_')!=-1) 
		fullName=fullName.replace(/(tumblr_)|(_\d{2}\d{0,2})(?=\.)/gim,'')		//prefix and postfix of tumblr image names can be omitted without info loss
	else if (fullName.indexOf('xuite')!=-1) {									//this hosting names their images as "(digit).jpg" causing filename collisions
		i=fullName.lastIndexOf('/');
		fullName=fullName.substr(0,i)+'-'+fullName.substr(i+1);					//add parent catalog name to the filename to ensure uniqueness
	};
	return fullName.split('/').pop(); 					
};  

function getID(lnk){															//extract numerical post ID from self-link
	if (lnk.search(/[^0-9]/g)==-1)
		return lnk;
	Result=lnk.substring(lnk.indexOf('/post/')+7+lnk.indexOf('image/'));		//one of those will be -1, another the actual offset	
	Result=Result.replace(/(#).*$/gim,'');										//remove url postfix 
	i=Result.lastIndexOf('/');
	if (i!=-1)
		Result=Result.substring(0,i);
	if ((Result=='')||(Result.search(/[^0-9]/g)!=-1)) 
		throw new Error('IDentification error: '+Result)
	else
		return Result;
};

function main(){																//search for post IDs on page and call API to get info about them
	if (debug) 
		jQuery("div[id^='SwfStore_animage_']").css({'top':'0','left':'0',"position":'absolute'})
	else																		//bring the flash window in or out of the view depending on the debug mode
		jQuery("div[id^='SwfStore_animage_']").css({'top':'-2000px','left':'-2000px',"position":'absolute'});
	if (isDash)
		posts=jQuery('ol.posts').find('div.post').not('.new_post')				//getting posts on dashboard is straightforward with its constant design,
	else {																		// but outside of it are all kinds of faulty designs, so we have to experiment
		posts=jQuery('article.entry > div.post').not('.n').parent();			//some really stupid plain theme
		posts=(posts.length)?posts:jQuery('.post').not('#description');			//general way to obtain posts that are inside containers with class='post'
		if (isImage) 
			if (tagsDB.get(getFname(jQuery('img#content-image')[0].src)))
				document.location.href=jQuery('img#content-image')[0].src		//proceed directly to the image if it already has a DB record with tags	
			else
				posts=[jQuery('<div><a href="'+document.location.href+'" >a</a></div>')];	
																				//make it work also on image pages, since we can get post id from url
		posts=posts.length?posts:jQuery('.column').eq(2).find('.bottompanel').parent();
																				//for "Catching elephant" theme
		posts=posts.length?posts:jQuery('[id="post"]');							//for "Cinereoism" that uses IDs instead of Classes /0	
		posts=posts.length?posts:jQuery('[id="designline"]');					//The Minimalist, not tested though and saved indication probably won't work
		posts=posts.length?posts:jQuery("article[class^='photo']");				//alva theme for ge
		posts=posts.length?posts:jQuery('[id="posts"]');						//Tincture pls why are you doing this
		posts=posts.length?posts:jQuery("div.posts").not('#allposts');			//some redux theme, beats me
		posts=posts.length?posts:jQuery("article[class^='post-photo']");		//no idea what theme, uccm uses it		
		posts=posts.length?posts:jQuery('div[id="entry"]');							//seigaku by sakurane, dem ids again
		if (posts.length==0){
			document.title+=' [No posts found]';								//give up
			return;
		};
	};

	document.title+=" ▶[";												//a "progressbar" will be displayed in page title,
																				// indicating that the page is ready for interaction
	if (!isImage)	{
		hc=posts.find('.hc.nest');
		if (hc.length) {
			hc.css('position','relative');										//fix broken themes with image links being under a large div		
			posts=hc.parent();
		};
	};
	jQuery.each(posts, function(i,v){											//for every post we need to find its ID and request info from API with it
		if (isDash) {
			self=jQuery(v).find('a.post_permalink')[0];							//again everything is simple when on dashboard
			namae=self.hostname;												//On dashboard every post might have a different author
			id=getID(self.href);
		} else if (isPost)
			id=getID(document.location.href)									//even simpler on the post page
		else {																	//but in the wild it gets tricky
			id='';
			h=jQuery(v).find("a[href*='"+namae+"/post/']");						//several attempts to find selflink
			h=(h.length)?h:jQuery(v).next().find("a[href*='"+namae+"/post/']");	//workaround for Optica & seigaku themes that don't have selflinks within post elements
			h=(h.length)?h:jQuery(v).find("a[href*='"+namae+"/image/']");
			if (h.length) 
				id=getID(h[h.length-1].href);									//for every post on page find the self-link inside of post, containing post ID
			if (id == '') {														//if no link was found, try to find ID in attributes of nodes
				phtst=jQuery(v).find("div[id^='photoset']");					//photosets have IDs inside, well, id attributes starting with photoset_
				pht=jQuery(v).attr('id');										//single photos might have ID inside same attribute
				if (phtst.length) 
					id=phtst.attr('id').split('_')[1]
				else if (pht)
					id=getID(pht)
				else 		
					throw new Error('IDs not found');					
			};	
		};											//TODO: only call API if no DB record is found for images in current post
		jQuery.ajax({															//get info about current post via tumblr API based on the ID
			type:'GET',
			url: "http://api.tumblr.com/v2/blog/"+namae+"/posts/photo",
			dataType:'jsonp',
			data: {
				api_key : "fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4",
				id: id
			}
		})	.done(function(result) { process (result, v);})
			.fail(function(jqXHR, textStatus, errorThrown) { throw errorThrown;})
			.always(function(){
				if (isImage)													//redirect to actual image from image page after we got the ID
					document.location.href=jQuery('img#content-image')[0].src;
				if (i==posts.length-1) {										//at the end of processing indicate it's finished and cleanup flash
					document.title+=']■'; 
					cleanUp();
				};
			});
	});	
};

function mkUniq(arr){																//Sorts an array and ensures uniqueness of its elements
	to={};
	jQuery.each(arr, function(i,v){
		to[v.toLowerCase()]=true;});
	arr2=Object.keys(to);
	return arr2;
};

function gate(){																//check readiness of libraries being loaded simultaneously
	if (J&&T){		
		J=T=false;																											
		main();																	//when everything is loaded, proceed further
	}
};

function onDOMContentLoaded(){													//load plugins 
	if (window.top != window.self)  											//don't run on frames or iframes
		return;
	if (isDash && !enableOnDashboard)
		return;
	if ((typeof jQuery == 'undefined')||((jQuery)&&(jQuery.fn.jquery.split('.')[1]<5)))
		loadAndExecute("https://ajax.googleapis.com/ajax/libs/jquery/1.6.0/jquery.min.js", function(){
			$.noConflict(); 													//only load jQuery if it is either absent or the existing version is below 1.5
			J=true; 
			gate();
		})
	else 
		J=true; 
	
	tagsDB = new SwfStore({														//main tag database, holds pairs "filename	{s:is_saved?1:0,t:'tag1,tag2,...,tagN'}"
		namespace: "animage",
		swf_url: storeUrl, 
		debug: debug,
		onready: function(){
			debug=(tagsDB.get(':debug:')=='true');								//update initial debug value with the one saved in DB
			tagsDB.config.debug=debug;
			
			T=true;
			gate();
		},
		onerror: function() {
			throw new Error('tagsDB failed to load');
		}
	}); 
};

function process(res, v) {														//process information obtained from API by post ID
	var link_url='';
	var img=jQuery([]);
	var inlimg=[];
	var photos=0;
	var bar='';
	if (res.meta.status!='200') {
		throw new Error('API error: '+res.meta.msg);
		return;
	};	
	var isPhoto=res.response.posts[0].type=='photo';
	v=jQuery(v);	
	if (linkify) {																//find inline images
		inlimg=v.find('img[src*="tumblr_inline_"]');
		inlimg=jQuery.grep(inlimg, function(vl,ix) {							//leave only those that have HD versions existing
			if (vl.src.search(/(_\d{2}\d{0,2})(?=\.)/gim)!=-1) {
				href=vl.src.replace(/(_\d{2}\d{0,2})(?=\.)/gim,'_1280');		//if there is an HD version, link it
				if (vl.src.split('.').pop()=='gif')
					href=vl.src;												//except for gifs
				r=true;
				bar=inlimg.length+'.';
			}
			else {
				href='http://www.google.com/searchbyimage?sbisrc=cr_1_0_0&image_url='+escape(vl.src);
				r=false;														//otherwise link to google reverse image search
			};
			a='<a href="'+href+'" style=""></a>';
			i=jQuery(vl);
			x=i.parent().is('a')?i:i.parent().parent().is('a')?i.parent():i;	//i dunno either
			if ((x.parent().is('a'))||(i.width()<128)) 							//basically either direct parent or grandparent of the image can be a link already
				return false;													//in which case we need to skip processing
			i.wrap(a);
			if (typeof pxuDemoURL!== 'undefined' && pxuDemoURL=="fluid-theme.pixelunion.net")
				i.parent().css('position','relative');							//fix for PixelUnion Fluid
			return r;
		});
	};
	if (!isPhoto) {																//we're only interested in posts with images
		if ((!linkify)||(inlimg.length==0)) {
			document.title+=' ';
			return;				
		};
	} else {
		photos=res.response.posts[0].photos.length;								//find whether this is a single photo post or a photoset
		bar=String.fromCharCode(10111+photos);									//piece of progressbar, (№) for amount of photos in a post
																				// empty space for non-photo posts, ✗ for errors
		if (photos>1) {
			img=v.find('iframe.photoset').contents();
			img=img.length?img:v.find('figure.photoset');
			if (img.length==0)													//some photosets are in iframes, some aren't
				img=v.find("div[id^='photoset'] img")
			else 
				img=img.find('img');
		} else {
			link_url+=res.response.posts[0].link_url;							//for a single photo post, link url might have the highest-quality image version,
			ext=link_url.split('.').pop();										// unaffected by tumblr compression
			r=/(jpe*g|bmp|png|gif)/gi;											//check if this is actually an image link
			link_url=(r.test(ext))?link_url:''; 
			
			img=v.find('img[src*="tumblr_"]').not('img[src*="tumblr_inline_"]');//find image in the post to linkify it
			if (img.length && linkify) {
				p=img.parent().wrap('<p/>');									//what would you do? Parent might be either the link itself or contain it as a child
				lnk=p.parent().find('a[href*="/image/"]');
				lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].link_url+'"]');
				lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].photos[0].original_size.url+'"]');
				if ((lnk.length) && (lnk[0].href))					
					lnk[0].href=link_url?link_url:res.response.posts[0].photos[0].original_size.url
				else if (typeof pxuDemoURL =='undefined')			
					img.wrap('<a href="'+res.response.posts[0].photos[0].original_size.url+'"></a>');
				p.unwrap();														//^ this might not work in themes like Fluid by PU
			};
		};
	};
	img=jQuery(img.toArray().concat(inlimg));									//make sure the resulting list of images is in order
	tags=res.response.posts[0].tags;											//get tags associated with the post
	DBrec={s:0, t:tags.toString().toLowerCase()};								//create an object for database record
	
	for (j=0; j<photos+inlimg.length; j++) {
		if (j<photos)
			url=(link_url)?link_url:res.response.posts[0].photos[j].original_size.url
		else
			url=img.eq(j).parent().attr('href');
		tst=tagsDB.get(getFname(url));											//Check if there's already a record in database for this image	
		if (tags.length)  {
			if (tst) {															// if there is we need to merge existing tags with newfound ones
				oldtags=JSON.parse(tst).t.split(',');
				newtags=mkUniq(oldtags.concat(tags));
				DBrec.t=newtags.toString().toLowerCase();
				DBrec.s=parseInt(JSON.parse(tst).s);
			} else
				DBrec.s=0;			
			tagsDB.set(getFname(url), JSON.stringify(DBrec));	
			
			if (tagsDB.get(getFname(url))!=JSON.stringify(DBrec))				//immediately check whether the write was successful
				if (!debug && !asked)											//if not and no debug mode enabled, prompt to enable it
					if (confirm('Failed writing to DB. Flashcookies size limit might have been hit.\n Would you like to enable debug mode to get a possibility to fix that? (Will reload the page)')) {
						tagsDB.set(':debug:','true');
						location.reload();
						asked=true;												//avoid asking multiple times for every post
					} else
						throw new Error('Failed to write to DB')
				else if (!asked){												//if already in debug, try to bring the flash window into view
					alert('Failed writing to DB. Flashcookies size limit might have been hit. If you see a flash dialog window at the top-left corner, try raising the limit.');
					window.scrollTo(0, 0);
					asked=true;
					
				};										//TODO: make tags cumulative, adding up upon visiting different posts of same image?
		};												//TODO: add tags retrieval from reblog source if no tags were found here
		if ((tst)&&(JSON.parse(tst).s=='1')&&(!isImage)) 						//otherwise if there is a record and it says the image has been saved
			img.eq(j).css('outline','3px solid invert').css('outline-offset','-3px');	
																				//add a border of highlight color around the image to indicate that
	};	
	document.title+=(tags.length)?bar:'-';										//dash indicates no found tags for a post
};

//TODO: store post ID and blog name for images? Might help with images whose link_url follows to 3rd party hosting with expiration (animage)
//TODO: implement some kind of feedback from flash to script about space request success
//TODO: output FlashDB messages to flash window instead of console on debug.
//TODO: add support for custom domains
//TODO: check if the actual width of an image to be linked is within limits of the _ postfix, because tumblr lies
