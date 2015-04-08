// ==UserScript==
// @name		Animage-server
// @description	Puts tags for links into database
// @version	1.0
// @author		Seedmanc
// @include	http://*.tumblr.com/post/*
// @include	http://*.tumblr.com/page/*
// @include	http://*.tumblr.com/tag*/*
// @include	http://*.tumblr.com/
// @include	http://*.tumblr.com/image/*
// @include	http://*.tumblr.com/search/*
// @exclude	http://*.media.tumblr.com/*
// ==/UserScript==

// ==Settings=====================================================

	var debug=		true;														//disable cleanup, leaving variables and flash objects in place (causes lag on tab close)
																				// also overwrite database records for images every time 
	var highlight=	'darkgrey';													//color to mark the already saved images with
	var storeUrl=	'http://puu.sh/dyFtc/196a6da5b6.swf';						//flash databases are bound to the URL, must be same as in the 2nd script

// ==/Settings====================================================

var load,execute,loadAndExecute;load=function(a,b,c){var d;d=document.createElement("script"),d.setAttribute("src",a),b!=null&&d.addEventListener("load",b),c!=null&&d.addEventListener("error",c),document.body.appendChild(d);return d},execute=function(a){var b,c;typeof a=="function"?b="("+a+")();":b=a,c=document.createElement("script"),c.textContent=b,document.body.appendChild(c);return c},loadAndExecute=function(a,b){return load(a,function(){return execute(b)})};	//external script loader function

 tagsDB=null;
var ranonce=false;
var a=b=false;

namae=document.location.host; 													 
document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);

function cleanUp(){																//remove variables and flash objects from memory 
	if (debug) return;															//without removal there would be a noticeable lag upon tab closing in Opera
	delete tagsDB;
	jQuery("object[id^='SwfStore_animage_']").remove();
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
		
		document.title+=" Ready: [";											//a "progressbar" will be displayed in page title,
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

function mutex(){																//check readiness of libraries being loaded
	if (a&&b){																	//instead of sequential loading of the database and jquery 
																				//make them load simultaneously
		main();																	//when everything is loaded, proceed further
		a=b=false;
	}
};

function onDOMContentLoaded(){													//load plugins
	if ((typeof jQuery == 'undefined')||((jQuery)&&(jQuery.fn.jquery.split('.')[1]<5)))
		loadAndExecute("https://ajax.googleapis.com/ajax/libs/jquery/1.6.0/jquery.min.js",function(){
			$.noConflict(); 													//only load jQuery if it is either absent or the existing version is below 1.5
			a=true; 
			mutex();}
		)
	else {
		a=true; 
		mutex();
	};
	
	tagsDB = new SwfStore({														//loading tag database, holds pairs "filename	is_saved,tag1,tag2,...,tagN"
		namespace: "animage",
		swf_url: storeUrl, 
		onready: function(){
			b=true;
			mutex();
		},
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
		if (ifr.length==0)														//some photosets are in iframes, some aren't
			ifr=jQuery(v).find("div[id^='photoset']");
	}
	else 				
		bar='-';
	url=(link_url)?link_url:res.response.posts[0].photos[0].original_size.url;
		
	tags=res.response.posts[0].tags;											//get tags associated with the post
	if (tags.length!=0) {														//nothing to do here without them
														//to-do: add tags retrieval from reblog source if no tags were found here
		tags.unshift('0');														//assume image is not saved yet
		jQuery.each(tags,function(i,v){tags[i]=v.replace(/\,/g,'.');});			
		for (j=0; j<photoset; j++) {		
			document.title+=bar;														
			url=(link_url)?link_url:res.response.posts[0].photos[j].original_size.url;		
			tst=tagsDB.get( getFname(url) );									//check if there's already a record in database for this image				
			if ((!tst)||(debug))  												//if there isn't, make one, putting the flag and tags there
				tagsDB.set(getFname(url), tags.toString().toLowerCase());			
														//to-do: make tags cumulative, adding up upon visiting different posts of same image?
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
				else 															//and for photosets  too
					jQuery(ifr).find('img')[j].style.border='4px solid '+highlight;	
			};
		};
	}
	else document.title+=String.fromCharCode(160);								//empty space indicates no found tags for a post
	lnk=jQuery(v).find('img')[0];
	if (lnk)
		if ((lnk.parentNode.href) && ((lnk.parentNode.href.indexOf('/image/')!=-1)||(lnk.parentNode.href==res.response.posts[0].link_url)))															
			lnk.parentNode.href=url;											//make the photos link directly to the best quality image instead of a page

};
