// ==UserScript==
// @name		Animage-post
// @description	Puts tags for links into database
// @version	1.0
// @author		Seedmanc
// @include	http://*.tumblr.com/post/*
// @include	http://*.tumblr.com/page/*
// @include	http://*.tumblr.com/tagged/*
// @include	http://*.tumblr.com/
// @include	http://*.tumblr.com/image/*
// @include	http://*.tumblr.com/search/*
// @include	http*://www.tumblr.com/dashboard*

// @exclude	http*://*.media.tumblr.com/*
// ==/UserScript==

// ==Settings=====================================================

	var debug=		false;														//initial debug value, get changed to settings value after DB creation
																				//enabling debug makes DB entries for images updated every time post is visited
																				//also it enables error notifications and disables cleanup ( causes lag on tab close)
	var storeUrl=	'//dl.dropboxusercontent.com/u/74005421/js%20requisites/storage.swf';
																				//flash databases are bound to the URL, must be same as in the other script
	var enableOnDashboard= true;												//will try to collect post info from dashboard posts too
																				//might be slow and/or glitchy so made optional
// ==/Settings====================================================

var load,execute,loadAndExecute;load=function(a,b,c){var d;d=document.createElement("script"),d.setAttribute("src",a),b!=null&&d.addEventListener("load",b),c!=null&&d.addEventListener("error",c),document.body.appendChild(d);return d},execute=function(a){var b,c;typeof a=="function"?b="("+a+")();":b=a,c=document.createElement("script"),c.textContent=b,document.body.appendChild(c);return c},loadAndExecute=function(a,b){return load(a,function(){return execute(b)})};		//external script loader function

 tagsDB=null;
var J=T=false;
var isImage=(document.location.href.indexOf('/image/')!=-1);					//processing for image pages is different from regular posts

var namae=document.location.host; 			
var isDash=(namae.indexOf('www.')==0);											//processing for non-blog pages of tumblr like dashboard is different too
document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);

function cleanUp(){																//remove variables and flash objects from memory 
	if (debug) return;															//without removal there would be a noticeable lag upon tab closing in Opera
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
	if ((Result=='')||(Result.search(/[^0-9]/g)!=-1)) {
		if (debug) alert('IDentification error: '+Result);
		throw new Error('IDentification error');
	}
	else
		return Result;
};

function main(){																//search for post IDs on page and call API to get info about them
	if (isDash)
		posts=jQuery('ol.posts').find('div.post').not('.new_post')
	else {
		posts=jQuery('article.entry > div.post').not('.n').parent();				//some really stupid plain theme
		posts=(posts.length)?posts:jQuery('.post');
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

	document.title+=" Ready: [";												//a "progressbar" will be displayed in page title,
																				// indicating that the page is ready for interaction
	if (!isImage)	{
		hc=posts.find('.hc.nest');
		if (hc.length) {
			hc.css('position','relative');										//fix broken themes with image links being under a large div		
			posts=hc.parent();
		};
	};
	jQuery.each(posts, function(i,v){											//for every post we need to find its ID and request info from API with it
		id='';
		h=jQuery(v).find("a[href*='"+namae+"/post/']");							//several attempts to find selflink
		h=(h.length)?h:jQuery(v).next().find("a[href*='"+namae+"/post/']");		//workaround for Optica theme that doesn't have selflinks within .post elements
		h=(h.length)?h:jQuery(v).find("a[href*='"+namae+"/image/']");
		if (h.length) 
			id=getID(h[0].href);												//for every post on page find the self-link inside of post, containing post ID
		if (id == '') {															//if no link was found, try to find ID in attributes of nodes
			phtst=jQuery(v).find("div[id^='photoset']");						//photosets have IDs inside, well, id attributes starting with photoset_
			pht=jQuery(v).attr('id');											//single photos might have ID inside same attribute
			if (phtst.length) 
				id=phtst.attr('id').split('_')[1]
			else if (pht)
				id=getID(pht)
			else {				
				document.title+='✗';
				if (debug) alert('IDs not found');
				throw new Error('IDs not found');
				return false;
			};
		};												//TODO: only call API if no DB record is found for images in current post
		if (isDash)
			namae=jQuery(v).find('a.post_info_link')[0].hostname;
		jQuery.ajax({															//get info about current post via tumblr API based on the ID
			type:'GET',
			url: "http://api.tumblr.com/v2/blog/"+namae+"/posts/photo",
			dataType:'jsonp',
			data: {
				api_key : "fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4",
				id: id
			}
		})	.done(function(result) { process (result, v);})
			.fail(function(jqXHR, textStatus, errorThrown) { alert('Error: '+textStatus);})
			.always(function(){
				if (isImage)													//redirect to actual image from image page after we got the ID
					document.location.href=jQuery('img#content-image')[0].src;
				ifr=undefined;
				if (i==posts.length-1) {										//at the end of processing indicate it's finished and cleanup flash
					document.title+='] 100%'; 
					cleanUp();
				};
			});
	});	
};

function mutex(){																//check readiness of libraries being loaded simultaneously
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
			mutex();
		})
	else 
		J=true; 
	
	tagsDB = new SwfStore({														//loading tag database, holds pairs "filename	is_saved,tag1,tag2,...,tagN"
		namespace: "animage",
		swf_url: storeUrl, 
		debug: debug,
		onready: function(){
			debug=(tagsDB.get(':debug:')=='true');								//update initial debug value with the one saved in DB
			tagsDB.config.debug=debug;
			
			T=true;
			mutex();
		},
		onerror: function() {
			alert('tagsDB failed to load');
		}
	}); 
};

function process(res, v) {														//process information obtained from API by post ID
	var link_url='';
	var img;
	if (res.meta.status!='200') {
		if (debug) alert('API error: '+res.meta.msg);
		throw new Error('API error: '+res.meta.msg);
		return;
	};
	if (res.response.posts[0].type!='photo') {									//we're only interested in photo posts
		document.title+=' ';
		return;																	
	};
	v=jQuery(v);
	photos=res.response.posts[0].photos.length;									//find whether this is a single photo post or a photoset
	if (photos>1) {
		ifr=v.find('iframe.photoset').contents();
		ifr=ifr.length?ifr:v.find('figure.photoset');
		if (ifr.length==0)														//some photosets are in iframes, some aren't
			ifr=v.find("div[id^='photoset'] img")
		else 
			ifr=ifr.find('img');
	} else {
		link_url+=res.response.posts[0].link_url;								//for a single photo post, link url might have the highest-quality image version,
		ext=link_url.split('.').pop();											// unaffected by tumblr compression
		r=/(jpe*g|bmp|png|gif)/gi;												//check if this is actually an image link
		link_url=(r.test(ext))?link_url:''; 
		
		img=v.find('img[src*="tumblr_"]');										//find image in the post to linkify it
		if (img.length) {
			p=img.parent().wrap('<p/>');										//what would you do? Parent might be either the link itself or contain it as a child
			lnk=p.parent().find('a[href*="/image/"]');
			lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].link_url+'"]');
			lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].photos[0].original_size.url+'"]');
			if ((lnk.length) && (lnk[0].href))					
				lnk[0].href=link_url?link_url:res.response.posts[0].photos[0].original_size.url
			else 																
				img.wrap('<a href="'+res.response.posts[0].photos[0].original_size.url+'"></a>');
			p.unwrap();															//^ this might potentially break themes like Fluid by PU
		};
	};
	bar=String.fromCharCode(10111+photos);										//piece of progressbar, (№) for amount of photos in a post
																				// empty space for non-photo or tagless posts, ✗ for errors

	tags=res.response.posts[0].tags;											//get tags associated with the post
	DBrec={s:0, t:tags.toString().toLowerCase()};								//create an object for database record
	for (j=0; j<photos; j++) {
		url=(link_url)?link_url:res.response.posts[0].photos[j].original_size.url;		
		tst=tagsDB.get(getFname(url));											//check if there's already a record in database for this image	
		if (((!tst)||(debug))&&(tags.length))  									//if there isn't, make one, putting the flag and tags there
			tagsDB.set(getFname(url), JSON.stringify(DBrec));	
														//TODO: make tags cumulative, adding up upon visiting different posts of same image?
														//TODO: add tags retrieval from reblog source if no tags were found here
		if ((tst)&&(JSON.parse(tst).s=='1')&&(!isImage)) {						//otherwise if there is a record and it says the image has been saved
			img=(photos==1)?img:jQuery(ifr[j]);
			img.css('outline','3px solid invert').css('outline-offset','-3px');	//add a border of highlight color around the image to indicate that
		};
	};	
	document.title+=(tags.length)?bar:' ';										//empty space indicates no found tags for a post
};

//TODO: store post ID and blog name for images? Might help with images whose link_url follows to 3rd party hosting with expiration (animage)