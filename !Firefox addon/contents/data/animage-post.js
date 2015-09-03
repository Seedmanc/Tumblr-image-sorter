
// ==UserScript==
// @name		Animage-post
// @description	Store tags for images and indicate saved state
// @version		1.2
// @author		Seedmanc
// @namespace	https://github.com/Seedmanc/Tumblr-image-sorter

// @include		http://*.tumblr.com/post/*
// @include		http://*.tumblr.com/page/*
// @include		http://*.tumblr.com/tagged/*
// @include		http://*.tumblr.com
// @include		http://*.tumblr.com/image/*
// @include		http://*.tumblr.com/search/*
// @include		http*://www.tumblr.com/dashboard*
// @include		http*://www.tumblr.com/tagged/*

// @exclude		http*://*.media.tumblr.com/*

// @grant 		none
// @run-at 		document-body
// @noframes
// ==/UserScript==

// ==Settings=====================================================

	var highlightColor;																//Specify a color to mark saved images and hope it won't blend with bg
	
	var enableOnDashboard;															//Will try to collect post info from dashboard posts too
																					// might be slow and/or glitchy so made optional

	var linkify;																	//Make every image (even inline images in non-photo posts) to be processed
																					// and linked to either itself, it's larger version or its reverse image search
																					// might break themes like PixelUnion Fluid
// ==/Settings====================================================
 
var blogName=document.location.host; 				
var isImage=(document.location.href.indexOf('/image/')!=-1); 
var isPost=(document.location.href.indexOf('/post/')!=-1);
var isDash=(blogName.indexOf('www.')==0);  
var posts=$([]); 
var progress=[];
var imageLinks={};

self.port.on('init', function(obj){
	highlightColor =	obj.options.post.highlightColor;
	enableOnDashboard =	obj.options.post.enableOnDashboard; 
	linkify =			obj.options.post.linkify; 	
	main();
});
 
function getID(lnk){																//Extract numerical post ID from self-link
	if (lnk.search(/[^0-9]/g)==-1)
		return lnk;																	//Sometimes the argument is the ID itself that needs checking
	var Result=lnk.substring(lnk.indexOf('/post/')+7+lnk.indexOf('image/'));		//one of those will be -1, another the actual offset	
	Result=Result.replace(/(#).*$/gim,'');											//remove url postfix 
	var i=Result.lastIndexOf('/');
	if (i!=-1)
		Result=Result.substring(0,i);
	if ((Result=='')||(Result.search(/[^0-9]/g)!=-1)) 
		throw new Error('IDentification error: '+Result)
	else
		return Result;
};

function identifyPost(i){															//Find the ID of post in question and request info via API for it
	var id; var h;
	var post=posts.eq(i);
	if (isDash) {
		var slflnk=post.find('a.post_permalink')[0]; 
		blogName=slflnk.hostname;													//On dashboard every post might have a different author
		id=getID(slflnk.href);
	} else if (isPost)
		id=getID(document.location.href)											//Even simpler on the post page
	else {		 																	// but it gets tricky in the wild
		id='';
		h=post.find("a[href*='"+blogName+"/post/']");								//Several attempts to find selflink
		h=(h.length)?h:post.next().find("a[href*='"+blogName+"/post/']");			//workaround for Optica and seigaku themes that don't have selflinks within post elements
		h=(h.length)?h:post.find("a[href*='"+blogName+"/image/']");					//IDs can be found both in links to post and to image page
		if (h.length) 
			id=getID(h[h.length-1].href);														
		if (id == '') {																//If no link has been found, try to find ID in the attributes of nodes
			var phtst=post.find("div[id^='photoset']");								// photosets have IDs inside, well, id attributes starting with photoset_
			var pht=post.attr('id');												// single photos might have ID inside same attribute
			if (phtst.length) 
				id=phtst.attr('id').split('_')[1]
			else if (pht)
				id=getID(pht)
			else {				
				throw new Error('IDs not found');
				return false;
			};
		};			
	};											
	self.port.emit("getPostInfo", {source:blogName, id:id, i:i});					//Have to passthrough the post index here to use it later
};

function main(){																	//Search for posts on page and call API to get info about them 
	self.port.on("stored", function(response){
		if (response!==true) {
			if (response) {
				alert('Storage is over quota');
			} else
				alert('Storage write error');
			return;
		};
		if (isImage)																//Redirect to actual image from image page after we stored the info  
			document.location.href=$('img#content-image')[0].src;	
	});
	
	if (isDash) {
		if (!enableOnDashboard)														//don't run on dashboard unless enabled
			return;
		posts=$('ol.posts').find('div.post').not('.new_post');						//Getting posts on dashboard is straightforward with its constant design,
	}																				// but outside of it are all kinds of faulty designs, so we have to experiment
	else if (isImage) 
		posts=$('<div><a href="'+document.location.href+'" >a</a></div>')			//Make it work also on image pages, since we can get post id from url
	else {																			
																					//iterate through possible ways of finding posts in various themes
																					
		posts= $('article.entry > div.post').not('.n').parent();					//Some really stupid plain theme has to be checked before everything
		posts=(posts.length)?posts:$('.post').not('#description');					//General way to obtain posts that are inside containers with class='post'
		
		posts=posts.length?posts: $('.column').eq(2).find('.bottompanel').parent();	//for "Catching elephant" theme
		posts=posts.length?posts: $("[id='post']");									//for "Cinereoism" that uses IDs instead of Classes /0	
		posts=posts.length?posts: $("[id='designline']");							//the Minimalist, not tested though and saved indication probably won't work
		posts=posts.length?posts: $("article[class^='photo']");						//alva theme for ge
		posts=posts.length?posts: $("[id='posts']");								//tincture pls why are you doing this
		posts=posts.length?posts: $("div.posts").not("#allposts");					//some redux theme, beats me
		posts=posts.length?posts: $("article[class^='post-photo']");				//no idea what theme, uccm uses it
		posts=posts.length?posts: $("div[id='entry']");								//seigaku by sakurane, dem ids again
		
		if (posts.length==0){
			document.title+=' [No posts found]';									//Give up
			return;
		};

		var hc=posts.find('.hc.nest');
		if (hc.length) {
			hc.css('position','relative');											//Fix 'broken' themes with image links being under a large div		
			posts=hc.parent();														// this should be generalized somehow
		};
	};	
	self.port.on("APIresponse", process);
	self.port.on("APIfailure", function(resp){
		console.log('API failure: '+resp.r, resp.i);
		progressBar('✗',resp.i);
	});
	
	$.each(posts, function(i,v){
		identifyPost(i);															//Send post index instead of post itself, because posts can't be serialized
	});
 		
};

function process(postData) {														//Process information obtained from API by post ID
	var post=posts.eq(postData.i);													//pointer to post on page
	var res=postData.r;																//API response
	var link_url='';
	var inlimg=[];
	var photos=0;
	var img=jQuery([]);
	var bar='';	var href='';														//Piece of progressbar, (№) for amount of photos in a post,
																					// space for non-photo posts, ✗ for errors
	if (res.meta.status!='200') {
		throw  new Error('API error: '+res.meta.msg);
		return;
	};
	
	var isPhoto=res.response.posts[0].type=='photo';

	if (linkify) {																	//Find inline images
		var r;
		inlimg=post.find('img[src*="tumblr_inline_"]');
		inlimg=$.grep(inlimg, function(vl,ix) {
			if (vl.src.search(/(_\d{2}\d{0,2})(?=\.)/gim)!=-1) {
				href=vl.src.replace(/(_\d{2}\d{0,2})(?=\.)/gim,'_1280');			//If there is an HD version, link it
				if (vl.src.split('.').pop()=='gif')
					href=vl.src;													//except for gifs
				r=true;
				bar='('+inlimg.length+')';
			}
			else {
				href='http://www.google.com/searchbyimage?sbisrc=cr_1_0_0&image_url='+escape(vl.src);
				r=false;															// otherwise link it to google reverse image search 
			};
			
			var a='<a href="'+href+'" style=""></a>';
			i=$(vl);
			x=i.parent().is('a')?i:i.parent().parent().is('a')?i.parent():i;		//Basically either direct parent or grandparent of the image can be a link already
			if ((x.parent().is('a'))||(i.width()<128)) 								// in which case we need to skip processing to avoid problems
				return false;														// as well as if the image is in fact a button and not a part of the post
			i.wrap(a);
			if (typeof pxuDemoURL !== 'undefined' && pxuDemoURL=="fluid-theme.pixelunion.net")
				i.parent().css('position','relative');								//Fix for PixelUnion Fluid which otherwise gets #rekt if you insert a link
			return r;
		});
	};
	if (!isPhoto) {																	//Early termination if there are no images at all
		if ((!linkify)||(inlimg.length==0)) {										// or if processing is disabled
			progressBar(' ', postData.i);
			return;				
		};
	} else {
		photos=res.response.posts[0].photos.length;									//Find whether this is a single photo post or a photoset
		if (photos>1) {																//photoset
			img=post.find('iframe.photoset').contents();
			img=img.length?img:post.find('figure.photoset');
			if (img.length==0)														//Some photosets are in iframes, some aren't
				img=post.find("div[id^='photoset'] img")
			else 
				img=img.find('img');
			img=img.not('img[src*="tumblr_inline_"]');
		} else {																	//single image
			link_url+=res.response.posts[0].link_url;								//For a single photo post, link url might have the highest-quality image version,
			var ext=link_url.split('.').pop();											// unaffected by tumblr compression 
			link_url=(/(jpe*g|bmp|png|gif)/gi.test(ext))?link_url:'';				// check if this is actually an image link

			img=post.find('img[src*="tumblr_"]').not('img[src*="tumblr_inline_"]');	//Find image in the post to linkify it
			if (img.length && linkify) {
				var p=img.parent().wrap('<p/>');									//Parent might be either the link itself or contain it as a child,
				var lnk=p.parent().find('a[href*="/image/"]');						// depends on particular theme
				lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].link_url+'"]');
				lnk=(lnk.length)?lnk:p.parent().find('a[href*="'+res.response.posts[0].photos[0].original_size.url+'"]');
				if ((lnk.length) && (lnk[0].href))					
					lnk[0].href=link_url?link_url:res.response.posts[0].photos[0].original_size.url
				else if (typeof pxuDemoURL == 'undefined')																	
					img.wrap('<a href="'+res.response.posts[0].photos[0].original_size.url+'"></a>');
				p.unwrap();															 
			};
		};
		bar=String.fromCharCode(10111+photos);										
																					
	};
	img=$(img.toArray().concat(inlimg));											//Make sure inline images go after the usual ones
	var tags=$.map(res.response.posts[0].tags, function(v,i){
		return v.toLowerCase();
	});																				//get tags associated with the post
	var url;
	for (var j=0; j<photos+inlimg.length; j++) {
		if (j<photos) 																//First come the images in photo posts if exist
			url=(link_url)?link_url:res.response.posts[0].photos[j].original_size.url
		else																		// then the inline ones
			url=img.eq(j).parent().attr('href');
		
		imageLinks[getFileName(url)]=img.eq(j);	
		self.port.emit("isSaved",getFileName(url));
		
		if (tags.length)
			self.port.emit("storeImageData", {fname:getFileName(url), tags:tags, merge:true});		

	};	
	progressBar((tags.length)?bar:'-', postData.i);									//dash indicates no found tags for the post
};

self.port.on('isSaved', function(imageName){			
	if (!isImage) 														 			//Add a border of highlight color around the image to indicate saved image
		imageLinks[imageName].css({'outline':'3px solid '+highlightColor,'outline-offset':'-3px'});	
});

function progressBar(bar, i){														//Outputs a piece of progress bar at a correct place in title
	progress[i]=bar;
	document.title='▶['+progress.join('');
	if (progress.length==posts.length)
		document.title+=']■';
};


//TODO: add support for custom domains
//TODO: add tags retrieval from reblog source if no tags were found here  
//TODO: check if the actual width of an image to be linked is within limits of the _ postfix, because tumblr lies
//TODO: store post ID and blog name for images? Will make it possible to have a backlink from image page
//TODO: only call API if no DB record was found for images in the current post (requires ^)