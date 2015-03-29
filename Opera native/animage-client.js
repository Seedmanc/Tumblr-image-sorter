// ==UserScript==
// @name		Animage-client
// @description	Determines the path for saving current image to based on its tags.
// @version	1.0
// @author		Seedmanc
// @include	http://scenario.myweb.hinet.net/*
// @include	http*://*.media.tumblr.com/*
// @include	https://mywareroom.files.wordpress.com/*
// @include	http://mywareroom.files.wordpress.com/*
// @include	http://e.blog.xuite.net/* 
// @include	http://voice.x.fc2.com/*
// @include	http://*.amazonaws.com/data.tumblr.com/* 
// @include	https://*.amazonaws.com/data.tumblr.com/* 
// ==/UserScript==
													
// ==Settings=====================================================

	var root='E:\\#-A\\!Seiyuu\\';										//main collection folder

	var folders={														//folder and names matching database
		"	!!group	"	:	"	!!group	",								//used both for tag translation and providing the list of existing folders
		"	!!solo	"	:	"	!!solo	",								//trailing whitespaces are voluntary in both keys and values,
		"	!!unsorted"	:	"	!!unsorted	", 							// character case is only voluntary in key names
		"	原由実	"	:	"	!iM@S\\Hara Yumi	",					//first three key names are not to be changed, but folder names can be anything
		"	今井麻美	"	:	"	!iM@S\\Imai Asami	",					//subfolders for categories instead of names must have '!' as first symbol
		"	沼倉愛美	"	:	"	!iM@S\\Numakura Manami	",
		"	けいおん!	"	:	"	!K-On	",
		"	日笠陽子	"	:	"	!K-On\\Hikasa Yoko	",
		"	寿美菜子	"	:	"	!K-On\\Kotobuki Minako	",
		"	竹達彩奈	"	:	"	!K-On\\Taketatsu Ayana	",
		"	豊崎愛生	"	:	"	!K-On\\Toyosaki Aki	",
		"	クリスマス	"	:	"	!Kurisumasu	",
		"	Lisp	"	:	"	!Lisp	",	
		"	阿澄佳奈	"	:	"	!Lisp\\Asumi Kana	",
		"	らき☆すた	"	:	"	!Lucky Star	",
		"	遠藤綾	"	:	"	!Lucky Star\\Endo Aya	",
		"	福原香織	"	:	"	!Lucky Star\\Fukuhara Kaori	",
		"	長谷川静香	"	:	"	!Lucky Star\\Hasegawa Shizuka	",
		"	加藤英美里	"	:	"	!Lucky Star\\Kato Emiri	",
		"	今野宏美	"	:	"	!Lucky Star\\Konno Hiromi	", 
		"	井上麻里奈	"	:	"	!Minami-ke\\Inoue Marina	",
		"	佐藤利奈	"	:	"	!Minami-ke\\Sato Rina	",
		"	Petit Milady":	"	!Petit Milady	", 
		"	悠木碧	"	:	"	!Petit Milady\\Yuuki Aoi	",
		"	ロウきゅーぶ! "	:	"	!Ro-Kyu-Bu	",
		"	歌手		"	:	"	!Singer	",
		"	Kalafina "	:	"	!Singer\\Kalafina	",
		"	LiSA	"	:	"	!Singer\\LiSA	",
		"	May'n	"	:	"	!Singer\\May'n	", 
		"	茅原実里	"	:	"	!SOS-dan\\Chihara Minori",
		"	後藤邑子	"	:	"	!SOS-dan\\Goto Yuko	",
		"	平野綾	"	:	"	!SOS-dan\\Hirano Aya	", 
		"	スフィア	"	:	"	!Sphere	", 
		"	戸松遥	"	:	"	!Sphere\\Tomatsu Haruka	",
		"	やまとなでしこ "	:	"	!Yamato Nadeshiko	",
		"	堀江由衣	"	:	"	!Yamato Nadeshiko\\Horie Yui",
		"	田村ゆかり	"	:	"	!Yamato Nadeshiko\\Tamura Yukari	",
		"	千葉紗子	"	:	"	Chiba Saeko	",
		"	渕上舞	"	:	"	Fuchigami Mai	",
		"	藤田咲	"	:	"	Fujita Saki	",
		"	後藤沙緒里	"	:	"	Goto Saori	",
		"	花澤香菜	"	:	"	Hanazawa Kana	",
		"	早見沙織	"	:	"	Hayami Saori	",
		"	井口裕香	"	:	"	Iguchi Yuka	",
		"	井上喜久子	"	:	"	Inoue Kikuko	",
		"	伊藤かな恵	"	:	"	Ito Kanae	",
		"	伊藤静	"	:	"	Ito Shizuka	",
		"	門脇舞以	"	:	"	Kadowaki Mai	",
		"	金元寿子	"	:	"	Kanemoto Hisako	",
		"	茅野愛衣	"	:	"	Kayano Ai	",
		"	喜多村英梨	"	:	"	Kitamura Eri	",
		"	小林ゆう	"	:	"	Kobayashi Yuu	",
		"	小清水亜美	"	:	"	Koshimizu Ami	",
		"	釘宮理恵	"	:	"	Kugimiya Rie	",
		"	宮崎羽衣	"	:	"	Miyazaki Ui	",
		"	水樹奈々	"	:	"	Mizuki Nana	",
		"	桃井はるこ	"	:	"	Momoi Haruko	",
		"	中原麻衣	"	:	"	Nakahara Mai	",
		"	中島愛	"	:	"	Nakajima Megumi	",
		"	名塚佳織	"	:	"	Nazuka Kaori	",
		"	野川さくら	"	:	"	Nogawa Sakura	",
		"	野中藍	"	:	"	Nonaka Ai	",
		"	能登麻美子	"	:	"	Noto Mamiko	",
		"	折笠富美子	"	:	"	Orikasa Fumiko	",
		"	朴璐美	"	:	"	Paku Romi	",
		"	酒井香奈子	"	:	"	!Lovedoll\\Sakai Kanako	",
		"	榊原ゆい	"	:	"	Sakakibara Yui	",
		"	坂本真綾	"	:	"	Sakamoto Maaya	",
		"	佐倉綾音	"	:	"	Sakura Ayane	",
		"	沢城みゆき	"	:	"	Sawashiro Miyuki	",
		"	椎名へきる	"	:	"	Shiina Hekiru	",
		"	清水愛	"	:	"	Shimizu Ai	",
		"	下田麻美	"	:	"	Shimoda Asami	",
		"	新谷良子	"	:	"	Shintani Ryoko	",
		"	白石涼子	"	:	"	Shiraishi Ryoko	",
		"	田中理恵	"	:	"	Tanaka Rie	",
		"	丹下桜	"	:	"	Tange Sakura	",
		"	東山奈央	"	:	"	Toyama Nao	",
		"	植田佳奈	"	:	"	Ueda Kana	",
		"	上坂すみれ	"	:	"	Uesaka Sumire	",
		"	ゆかな		"	:	"	Yukana	"};

	ignore={'内田真礼':true, '小倉唯':true, '歌手':true, 'seiyuu':true, '声優':true};		
																		//these tags will not count towards any category and won't be included into filename
																		//e.g. you can get rid of tags unrelated to picture, that some bloggers tend to add

	var storeUrl='http://puu.sh/dyFtc/196a6da5b6.swf';					//flash databases are bound to the URL.  									
	debug=	true;														//disable cleanup, leaving variables and flash objects in place (causes lag on tab close)
																		//also enables export and import of names and meta tag databases to/from a text file
																		//also will cause "downloadify" button to appear even if no DB record was found 
// ==/Settings=========================================================


var load,execute,loadAndExecute;load=function(a,b,c){var d;d=document.createElement("script"),d.setAttribute("src",a),b!=null&&d.addEventListener("load",b),c!=null&&d.addEventListener("error",c),document.body.appendChild(d);return d},execute=function(a){var b,c;typeof a=="function"?b="("+a+")();":b=a,c=document.createElement("script"),c.textContent=b,document.body.appendChild(c);return c},loadAndExecute=function(a,b){return load(a,function(){return execute(b)})};//external script loader function

																		//communication between functions here is mostly done via global variables
 tagsDB=null;
 names=null ;
 meta=null ; 															//these three must be deletable on cleanup
var filename;															
var folder = ''; 
var DBrec;																//raw DB record
var J=N=M=T=false;														//flags indicating readyness of plugins loaded simultaneously
var runonce=true; 														//flag ensuring that onready() is only executed once

var style=" 							\
	div#output {						\
		position:absolute;				\
		left:0; top:0;					\
		width:100px; height:30px;		\
		z-index:99;						\
	}									\
	div#down {							\
		left:0; top:0;					\
		position:fixed;					\
		padding-left:1px;				\
		padding-top:0;					\
		width:100px;					\
		height:30px;					\
		z-index:98;						\
	}									\
	input.txt {							\
		width:95%;						\
	}									\
	table, tr {							\
		text-align:center;				\
	}									\
	td.cell, td.radio{					\
		border:1px solid black;			\
	}									\
	td.settings {						\
		border-left: 1px solid black;	\
		border-right:1px solid black;	\
	}									\
	table.cell	{						\
		width:100%; 					\
		border-collapse: collapse;		\
	}									\
	table#translations 	{				\
		border-spacing: 5px;			\
		z-index:0;						\
		position:absolute;				\
		left:0;							\
		top:52px;						\
		overflow:scroll;				\
		font-size:90%;					\
		margin-left:-4px;				\
		width:110px;					\
		table-layout:fixed;				\
		background:white;				\
	}									\
	a {									\
		font-family:Arial;				\
		font-size:small;				\
		text-align:center;				\
		content-align:center;			\
	}									\
	a.settings {						\
		text-decoration:none;			\
	}									\
	th {								\
		border:0;						\
	}									\
	input#submit{						\
		width:98%;						\
		height:29px;					\
	}									\
	table#port{							\
		left:1px; top:30px;				\
		position:fixed;					\
		border-bottom:1px solid black;	\
		background:lightgray;			\
		z-index:97;						\
		width:101px;					\
		border-collapse:collapse;		\
	}									\
";
		
uu = document.createElement('div');										//layers that will hold the download button and table for unknown tags
	uu.id = "output" ; 
	uu.innerHTML="<div id='down' > </div>";
 
tb=document.createElement('table');										//table for entering manual translation of unknown tags
	tb.id='translations';
	tagcell='<table class="cell"><tr>														\
		<td class="radio"><input type="radio" class="category"  value="name"  /></td>		\
		<td class="radio"><input type="radio" class="category"  value="meta"/></td>			\
		</tr><tr><td colspan="2"><a href="#" title="Click to ignore this tag for now" onclick=ignor3(this)>';
																		//each cell has the following in it:
																		//	two radiobuttons to choose a category for the tag - name or meta
																		//	the tag itself, either in roman or in kanji
																		//		the tag is also a link, clicking which removes the tag from results until refresh
																		//	if the tag is in kanji, cell has text field to input translation manually
																		// 		if there are also roman tags, they are used as options for quick input into text field
																		//	if the tag is in roman and consists of two words, cell has a button to swap their order
																		//		otherwise the button is disabled
	foot=tb.createTFoot();
	row=foot.insertRow(0);
	row.innerHTML='<input type="submit" id="submit" onclick=submit() value="submit">';
	head=tb.createTHead();												//at the bottom of the table there is the "submit" button that stores changes
	row=head.insertRow(0);												// and relaunches tag analysis without reloading the image
	row.insertCell(0).innerHTML='<table class="cell" style="font-width:95%; font-size:small;">\
		<tr class="cell" ><th class="cell">name</th><th class="cell">meta</th></tr></table>';	
	tb.hidden="hidden";
	
port=document.createElement('table');									//subtable for exporting and importing auxiliary tags database
	st2=port.style;
	row= port.insertRow(0);
	cell=row.insertCell(0);
	cell.setAttribute('class','settings');
	cell.innerHTML=' <a href="##" onclick=toggleSettings() class="settings">- settings -</a> ';	
	row0=port.insertRow(1);
	row0.insertCell(0).innerHTML=' <input type="checkbox" id="debug"  onchange="debugSwitch(this)" /> debug';	
	row1=port.insertRow(2);
	row1.insertCell(0).innerHTML='<a href="###" onclick=ex() >export tags</a>';
	row2=port.insertRow(3);	
	row2.insertCell(0).id='ex';
	row3=port.insertRow(4);
	row3.insertCell(0).innerHTML=' <a href="####" onclick=im()>import tags</a> ';	
	row4=port.insertRow(5);
	row4.insertCell(0).id='im';
	port.id='port';

trimObj(folders);																														
																		
var xhr = new XMLHttpRequest();											//redownloads opened image as blob 
	xhr.responseType="blob";											//so that it would be possible to get it via downloadify button
	xhr.onreadystatechange = function() {								//supposedly the image is being taken from cache so it shouldn't cause any slowdown
		if (this.readyState == 4 && this.status == 200) {
			var blob=this.response;
			var reader = new window.FileReader();
			reader.readAsDataURL(blob); 
			reader.onloadend = function() {
				base64data = reader.result;                
				base64data=base64data.replace("data:;base64,","");
				dl(base64data);											//call button creation function
		}
	} else if ((this.status!=200)&&(this.status!=0))
		alert('Error getting image: '+this.status);
};

function trimObj(obj){ 													//remove trailing whitespace in object keys and values,
	rootrgxp=/^(?:[\w]\:)\\.+\\$/g;
	exclrgxp=/\/|:|\||>|<|\?|"/g;										// also make sure that folder names have no illegal characters
	roota=root.split('\\')
	if (!(rootrgxp.test(root))||(exclrgxp.test(roota.splice(1,roota.length).join('\\')))) {
		alert('Illegal characters in root folder path "'+root+'"');
		throw new Error('Illegal characters in root');
	};
	for (var key in obj) {												// also convert keys to lower case for better matching
		if (obj.hasOwnProperty(key)) { 									
			t=obj[key].trim();
			k=key.trim().toLowerCase();
			delete obj[key];
			obj[k]=t;
			if (exclrgxp.test(obj[k])) {
				alert('Illegal characters in folder name entry: "'+obj[k]+'" for name "'+k+'"');
				throw new Error('Illegal character in database error');	//can't continue until the problem is fixed
			};
		};
	};
}; 

function toggleSettings(){
	$('table#port td').not('.settings').toggle();
	$('table#translations').css('top',($('table#port').height()+30)+'px');
	sign=$('a.settings')[0];
	if (sign.innerText.search(/\+/,'-')!=-1)
		sign.innerText=sign.innerText.replace(/\+/gi,'-')
	else
		sign.innerText=sign.innerText.replace(/\-/gi,'+');
	updateHeight();
};

function debugSwitch(checkbox){
	debug = checkbox.checked;
	tagsDB.set(':debug:',debug );
	location.reload();
};
document.addEventListener('DOMContentLoaded', onDOMcontentLoaded, false);  

function onDOMcontentLoaded(){ 											//load plugins and databases
	loadAndExecute("https://ajax.googleapis.com/ajax/libs/jquery/1.6.0/jquery.min.js",function(){
		$('body')[0].appendChild(uu);
		J=true; 
		mutex();}
	);
	names = new SwfStore({												//auxiliary database for names that don't have folders
		namespace: "names",
		swf_url: storeUrl,  
		onready: function(){	
			N=true;
			mutex();
		},
		onerror: function() {
			document.title+=' ✗ names failed to load';}
	});												//TODO: delay aux DB loading until & if they're actually needed? 
	
	meta = new SwfStore({												//auxiliary database for meta tags such as franchise name or costume/accessories
		namespace: "meta",
		swf_url: storeUrl,   
		onready: function(){	
			M=true;
			mutex();
		},
		onerror: function() {
			document.title+=' ✗ meta failed to load';}
	});
	
	tagsDB = new SwfStore({												//loading tag database, holds pairs "filename	is_saved,tag1,tag2,...,tagN"
		namespace: "animage",
		swf_url: storeUrl,  
		debug: debug,
		onready: function(){ 											//Opera seems to have a bug where loading multiple flash DBs causes double
		 	if (runonce) 												// calling of onready functions
				onDBready();											
			runonce=false;	
		},
		onerror: function() {
			alert('tagsDB failed to load');}
	});
};
var intrvl; 
function onDBready(){													//poll readiness of flashDB plugin until it's actually ready, because onready() and .ready lie
	document.querySelectorAll("div[id^='SwfStore_animage_']")[0]['style']="top: -2000px; left: -2000px; position: absolute;";
	clearTimeout(intrvl);												// ^ this might load before jQuery so have to use vanilla js
	try {		
		debug =(tagsDB.get(':debug:')=='true');
		tagsDB.config.debug=debug;
		getTags(false);		
	}
	catch(err)	{
		if ((err instanceof TypeError)||(err instanceof ReferenceError))//retry accessing flashDB after 200ms, usually either a this.swf.get or a tagDB error happens
			intrvl=setTimeout(function(){ onDBready();}, 200)			//I wonder if this can potentially lead to looping
		else {
			document.title+=err.name+':'+err.message;					
			throw err;
		};
	} 
}

function getTags(retry){												//manages tags acquisition for current image file name from db
	DBrec=tagsDB.get(getFname(document.location.href));					//first attempt at getting taglist for current filename is done upon the beginning of image load
	if ((DBrec!=null) || (debug)) {										//if tags are found, all is fine, report readiness
		T=true;															//or if we're in debug mode, proceed anyway
		mutex();		
	} else 
		if ((retry) || (document.readyState=='complete'))				//otherwise if we ran out of attempts or it's too late 
			cleanup(false)												//remove extra stuff as if nothing happened
		else {
			retry=true;													//but if not schedule a second attempt at retrieving tags to image load end
			window.addEventListener('load',function(){getTags(true); },false);
		};										//TODO: make getTags actually return  the value to main() to get rid of global var
};

function mutex(){														//checks readiness of plugin and databases when they're loading simultaneously 
	if (J && N && M && T) {												//when everything is loaded, proceed further
		main();
		J=N=M=T=false;													//no multiple calling anymore for you
	};
};

function main(){ 														//launch tag processing and handle afterwork
	$( "<style>"+style+"</style>" ).appendTo( "head" );
	$('div#output').append(port);	
	toggleSettings();	
	$('input#debug').prop('checked',debug);	
	if (debug) 
		$("div[id^='SwfStore_animage_']").css('top','0').css('left','101px').css("position",'absolute');
												//TODO: make the code above run regardless of found DB record
	$('div#output').append(tb);
	unsorted=analyzeTags();
	updateHeight();														//changing DOM in Opera messes up vertical scrolling	
	
	xhr.open("get",document.location.href,  true); 						//reget the image to attach it to downloadify button
	xhr.send();  
		
	if ((!debug)&&(!unsorted))
		cleanup(false);													//until the save button is clicked only remove aux databases if they're not needed
};

function isANSI(s) {													//some tags might be already in roman and do not require translation
	is=true;
	$.each(s,function(i,v){
		is=is&&(/[\u0000-\u00ff]/.test(v));});
    return is;
}

function analyzeTags() {   												//this is where the tag matching magic occurs
 	if (!DBrec) return;													//if there are any tags, that is
	folder='';
	filename=getFname(document.location.href, true);
    if (debug)
		document.title+=' '+DBrec										//show raw DB record 
	else
		document.title='';												
	
	tags=DBrec.split(','); 	
	tags.shift();														//first value in the record is "saved" flag, not tag
 
	fldrs=[];
	nms=[];
	mt=[];
	ansi={}
	rest=[];
	
	tags=$.map(tags,function(v,i){										//some formatting is applied to taglist before processing
		v=v.replace(/’/g,"\'");				
		v=v.replace(/"/g,"''");										
		v=v.replace(/(ou$)|(ou )/gim,'o ').trim();						//eliminate variations in writing 'ō' as o/ou at the end of the name in favor of 'o'
																		//I dunno if it should be done in the middle of the name as well
		v=v.toLowerCase();
		
		$.each(tags, function(ii,vv){
			if (ii==i) return true;
			sp=vv.split(' ');
			if (vv.length>1) 
				if (sp.join('')==v)
					tags[ii]='';										//some bloggers put kanji tags both with and without spaces, remove duplicates with spaces
			}
		);																
		if ((ignore[v])||(!v)) return null								//remove ignored tags so that they don't affect tag amount
		else return v;
	});
																		//1st sorting stage, no prior knowledge about found categories
	$.each(tags, function(i,v){ 										//split the tags for the image into 5 categories
		if (folders[v]) 												//	the "has folder" category
			fldrs.push(folders[v])
		else if (names.get(v)) 											//	the "no folder name tag" category
			nms.push(names.get(v))
		else if (meta.get(v))											//	the "no folder meta tag" category,
			mt.push(meta.get(v))										// which doesn't count towards final folder decision, but simply adds to filename
		else if (isANSI(v)) {											
			if (tags.length==1)											//if the tag is already in roman and has no folder it might be either name or meta
				nms.push(v)												//if it's the only tag it is most likely the name
			else {														//	otherwise put it into the "ansi" category that does not require translation
				splt=v.split(' ');
				if (splt.length==2)	{									//some bloggers put tags for both name reading orders (name<->surname),
					rvrs=splt.reverse().join(' ');
					if (names.get(rvrs)) {								// thus creating potentially duplicating tags
						nms.push(names.get(rvrs))						//try to find database entry for reversed order first,
						return true;									//note that folders{}  database is not expected to have roman tags
					}
					else if (ansi[rvrs])								// then check for duplicates		
						return true;
				}
				ansi[v]=true;											
			};
		}										//TODO: add checks for common mistakes in kanji names like 実/美 & 奈/菜
		else
			rest.push(v);												//	finally the "untranslated" category
	});
																		//2nd sorting stage, now we know how many tags of each category there are
																		//it's time to filter the "ansi" category further
	$.each(fldrs.concat(nms.concat(mt)), function(i,v){					//some bloggers put both kanji and translated names into tags
		x=getFname(v).toLowerCase();									
		if (x.indexOf('!')==0) x=x.replace('!','');
		y=x.split(' ').reverse().join(' ');								//check if we already have a name translated to avoid duplicates
		delete ansi[x];													//I have to again check for both orders even though I deleted one of them before
		delete ansi[y];													// but at the time of deletion there is no way to know yet which one would match the kanji tag
	});																	//this also gets rid of reverse duplicates between recognized tags and ansi
		
	fldrs2=[];						
	fldrs=$.grep(fldrs,function(v,i){									//a trick to process folders for meta tags, having subfolders for names inside
		fmeta=getFname(v);
		if ((fmeta.indexOf('!')==0)&&(fmeta.indexOf('!!')==-1)) {		//such folders must have "!" as the first symbol, not counting the special folders having "!!" there
			fldrs2.push(fmeta);
			if (fldrs.concat(nms).length==1)							//in the rare case when there are no name tags at all we put the image to meta folder
				folder+=v+'\\'											// no need to put meta tag into filename this way, since the image will be in the same folder
			else
				mt.push(fmeta.replace('!',''));	 						//usually it needs to be done though
			return false;												//exclude processed meta tags from folder category
			}
		else
			return true;												//return all the non-meta folder tags
		}
	);
	if (fldrs2.length==1) {												//make sure only one folder meta tags exists
		folders['!!solo']=fldrs2[0];									// replace solo folder with metatag folder, explained in 3rd sorting stage
		folders['!!group']=fldrs2[0];									// same for group folder
	};	
	
	fn="";			
	fldrs2=$.map(fldrs,function(vl,ix){
		return getFname(vl);											//extract names from folder paths
	});		
	
	mt=mt.concat(Object.keys(ansi));									//roman tags have to go somewhere until assigned a category manually	
	filename=(mkUniq(fldrs2.concat(nms)).concat(['']).concat(mkUniq(mt)).join(',').replace(/\s/g,'_').replace(/\,/g,' ')+' '+filename).trim();																	
																		//format the filename in a booru-compatible way, replacing spaces with underscores,
																		// first come the names alphabetically sorted, then the meta sorted separately 
																		// and lastly the original filename;		
																		// any existing commas will be replaced with spaces as well	
																		//this way the images are ready to be uploaded to boorus using the mass booru uploader script
																		
	unsorted=(rest.length>0)||(Object.keys(ansi).length>0);				//unsorted flag is set if there are tags outside of 3 main categories 
	tb.setAttribute("hidden","hidden");		
																		//Final, 3rd sorting stage, assign a folder to the image based on found tags and categories
	if (unsorted)  {													//if there are any untranslated tags, make a table with text fields to provide manual translation
		tb.removeAttribute("hidden");									//build the table with manual translation inputs 
		options='';
		tbd=tb.appendChild(document.createElement('tbody'));
		$.each(ansi, function(i,v){										//first process the unassigned roman tags
			row1=tbd.insertRow(0);
			cell1=row1.insertCell(0);  
			cell1.id=i;
			swp='<input type="button" value="swap" onclick="swap(this)" id="swap" />'
			cell1.innerHTML=tagcell+i+'</a><br>'+swp+'</td></tr></table>'; 
			if (i.split(' ').length!=2)									//for roman tags consisting of 2 words enable button for swapping their order
				$(cell1).find('input#swap').attr('disabled','disabled');//script can't know which name/surname order is correct so the choice is left to user
			
			$(cell1).attr('class','cell ansi');
			$(cell1).find('input[type="radio"]').attr('name',i);			
			options='<option value="'+i+'"></option>'+options;			//populate the drop-down selection lists with these tags
																		//so they can be used for translating kanji tags if possible
		}); 
		$.each(rest, function(i,v){										//now come the untranslated kanji tags
			fn+='['+v.replace(/\s/g,'_')+']'+' '; 						//such tags are enclosed in [ ]  in filename for better searchability on disk
			row1=tbd.insertRow(0);
			cell1=row1.insertCell(0); 
			cell1.id=v;
			cell1.innerHTML=tagcell+v+'</a><br><input list="translation" size=10 class="txt" onchange="selected(this)"/>\
				<datalist id="translation">'+options+'</datalist></td></tr></table>'; 
			$(cell1).attr('class','cell kanji');
			$(cell1).find('input[type="radio"]').attr('name',v);
		}); 															//in case the blogger provided both roman tag and kanji tag for names,
																		// the user can simply select one of roman tags for every kanji tag as translation
																		// to avoid typing them in manually				
		folder=folders["!!unsorted"]+'\\';   							//mark image as going to "unsorted" folder if it still has untranslated tags
		filename=fn+ ' '+filename;
		document.title+='? ';											//no match ;_;
	} else															
	 if ((fldrs.length==1)&&(nms.length==0)){							//otherwise if there's only one tag and it's a folder tag, assign the image right there
		folder=fldrs[0]+'\\';
		filename=filename.split(' ');
		filename.shift();												//remove the folder name from file name since the image goes into that folder anyway
		filename=filename.join(' ').trim();
		document.title+='✓ '; 											//100% match, yay
	} else
	 if ((fldrs.length==0)&&(nms.length==1)){							//if there's only one name tag without a folder for it, goes into default "solo" folder
		folder=folders['!!solo']+'\\'; 									// unless we had a !metafolder tag earlier, then the solo folder would have been 
																		// replaced with the appropriate !meta folder
	} else 
	 if (nms.length+fldrs.length>1)										//otherwise if there are several name tags, folder or not, move to the default "group" folder
		folder=folders['!!group']+'\\';									// same as the above applies for meta
	filename=filename.replace(/\/|\\|:|\||>|<|\?|"/g,'-').trim();		//make sure there are no forbidden characters in the resulting name
	document.title+=' \\'+folder+filename;
	folder=root+folder;													//if no name or folder tags were found, folder will be set to root directory
														
	folder=folder.replace(/\/|\||>|<|\?|"/g,'-');						//perhaps this is redundant
	
	if (DBrec.split(',')[0]=='1') document.title+=' (already saved)';	//indicate if the image has been marked as saved before
	return unsorted;
};

function ignor3(anc){													//remove clicked tag from results for current session (until page reload)
	ignore[anc.innerText]=true;											//this way you don't have to fill in the "ignore" list, 
																		// while still being able to control which tags will be counted
	$(anc).parent().parent().parent().parent().parent().parent().attr('hidden','hidden');
	$(anc).parent().parent().parent().parent().parent().parent().attr('ignore','ignore');
																		//a long way up from tag link to tag cell table
															
	$.each($('datalist').find('option'), function(i,v){					//hide these tags from the drop-down lists of translations too
		if (v.value==anc.innerText)										 
			v.parentNode.removeChild(v);								 
		}																 
	);	 																//if you hid the wrong tags, just reload the page to restore them
		
	updateHeight();														//fix vertical scroll behaviour in Opera
};

function swap(txt){														//swap roman tags consisting of 2 words
																		
	data=$('datalist');													//these are most likely the names so they can have different writing orders
	set=[];
	$.each(data.find('option'), function(i,v){
		if (v.value==$(txt).prev().prev()[0].innerText)
			set.push(v);
		}
	);
	text=$(txt).prev().prev()[0].innerText.split(' ');

	if (text.length==2){
		text=text.reverse();
		$(txt).prev().prev()[0].innerText=text.join(' ');
		tdc=$(txt).parent().parent().parent().parent().parent();
		tdc[0].id=text.join(' ');
		tdc.prop('swap',!tdc.prop('swap'));								//mark as swapped
		$.each(set,function(i,v){
			v.value=text.join(' ');
			}
		);
	};	
};

function selected(inp){													//hide the corresponding roman tag from results when it has been selected 
	ansi=$('td.ansi');													// as a translation for kanji tag
	kanji=$('td.kanji').find('input.txt');								//that's not a filename, fyi
	knj={};
	$.each(kanji,function(i,v){
		knj[v.value]=true;
		$.each(ansi,function(ix,vl){ 
			if (vl.innerText.trim()==v.value.trim())
				$(vl).parent().attr('hidden','hidden');
			}
		);
		}
	);
	$.each(ansi,function(ix,vl){
			if ((!knj[vl.innerText.trim()])&&(!$(vl).parent().attr('ignore')))
				$(vl).parent().removeAttr('hidden');
			}
		);
	updateHeight();
};

function mkUniq(arr){													//sorts an array and ensures uniqueness of its elements
	to={};
	$.each(arr, function(i,v){
		to[v]=true;}); //.toLowerCase()?
	arr2=Object.keys(to);
	return arr2.sort();													//I thought key names are already sorted in an object but for some reason they're not
};

function getFname(fullName, full){										//source URL processing for filename
	full=full || false;
	fullName=fullName.replace(/(#|\?).*$/gim,'');						//first remove url parameters
	if (fullName.indexOf('xuite')!=-1) {								//this blog names their images as "(digit).jpg" causing filename collisions
		i=fullName.lastIndexOf('/');
		fullName=fullName.substr(0,i)+'-'+fullName.substr(i+1);			//add parent catalog name to the filename to ensure uniqueness
	}
	else if ((fullName.indexOf('amazonaws')!=-1)&&(!full))  			//older tumblr images are weirdly linked via some encrypted redirect to amazon services, where
		fullName=fullName.substring(0,fullName.lastIndexOf('_')-2);		// links only have a part of the filename without a few last symbols and extension,
																		// have to match it here as well
	fullName=fullName.replace(/\\/g,'/');								//however we need full filename to provide it for downloadify, thus the parameter
	return fullName.substring(fullName.lastIndexOf('/')+1 ); 			//function is used both for URLs and folder paths which have opposite slashes
};

function dl(base64data){												//make downloadify button with base64 encoded image file as parameter
																		//which will both cause save file dialog with custom filename and copy save path to clipboard
	Downloadify.create( 'down'  ,{
		filename: function(){ return filename;}, 						//is this called "stateless"?
		data: base64data, 
		dataType: 'base64',
		downloadImage: 'http://puu.sh/bNGSc/9ce20e2d5b.png',
		onError: function(){ alert('Downloadify error');},
		onComplete: function(){ onCmplt(DBrec);},
		swf:  'http://puu.sh/bNDfH/c89117bd68.swf',
		width: 100,
		height: 30,
		transparent: true,
		append: true,
		textcopy: function(){ if (DBrec) {return folder+filename ;} else return '';}	
	});																	//if no database record is found, don't change the clipboard
};

function onCmplt(rec){														//mark image as saved in the tag database
	if (rec)	{														//it is used to mark saved images on tumblr pages
		rec=rec.split(','); 									
		rec.shift();
		rec.unshift('1');								
		rec=rec.join(',');							
		tagsDB.set(getFname(document.location.href), rec);
		rec=tagsDB.get(getFname(document.location.href));
		if (rec.split(',')[0]=='1') 
			document.title+=' (saved now)';}
	if (!debug)
		cleanup(true);													//remove all the flashes, including the button itself
}

function submit(){														//collects entered translations for missing tags
	tgs=$('td.cell');													//saves them to databases and relaunch tag analysis with new data
	missing=false;
	$.each(tgs,function(i,v){
		if ($(v).parent().attr('hidden')) {
			ignore[v.id]=true;											//mark hidden tags as ignored
			return true;
		};
		t=$(v).find('input.txt');
		if (t.length)
			t=t[0].value.trim();										//found translation tag
		else {
			t=v.innerText.trim(); 										//found roman tag
			if ($(v).prop('swap'))
				DBrec=DBrec.replace(t.split(' ').reverse().join(' '),t);//apply swap changes to current taglist
		}
		cat=$(v).find('input.category');
		if (t.length){
			if (cat[0].checked) 										//name category was selected for this tag
				names.set(v.innerText.trim().toLowerCase(),t)		
			else if (cat[1].checked)									//meta category was selected
				meta.set(v.innerText.trim().toLowerCase(), t)
			else { 														//no category was selected, indicate missing input
				$(cat[0].parentNode.parentNode ).css("background-color","rgb(255,128,128)");
				missing=true;
			}
		}
		else {
			$(v).find('input.txt').css("background-color","rgb(255,128,128)");
			missing=true;												//no translation was provided, indicate missing input
			return true;
			}
		}
	);						
	tbd=$('#translations > tbody')[0];
	to=missing?1000:10;													//if there was missing input, delay before applying changes to show that
	setTimeout(function(){
		tbd.parentNode.removeChild(tbd);
		analyzeTags();
		updateHeight();
	}, to);
};

function ex(){															//export auxiliary tag databases as text file
	Downloadify.create( 'ex'  ,{
		filename: 'names&meta tags DB.txt', 
		data: function(){
			xport={names:names.getAll(), meta:meta.getAll()};
			return JSON.stringify(xport,null,'\t');
		},
		dataType:'string',
		downloadImage: 'http://puu.sh/dAkPH/0917853f95.png',
		onError: function(){ alert('Downloadify2 error'); },
		swf:  'http://puu.sh/bNDfH/c89117bd68.swf',
		width: 100,
		height: 30,
		transparent: true,
		append: false,
		textcopy: ''	
	});	
};	

function im(){															//import auxiliary tag databases as text file
	$('#im').append('<input type="file" id="files" style="width:97px;" onchange="handleFileSelect(this)"/>'); 
};

function handleFileSelect(evt) {										//fill databases with data from imported file
    var file = evt.files[0]; 
	var reader = new FileReader();
	reader.onloadend = function(e) {
	  try{	
		clear=confirm('Would you like to clear existing databases before importing?');
		o=JSON.parse(e.target.result);
	  } catch(err){
		alert('Error: '+err.message);
		return false;
	  };
	    if (o.meta) {
			trimObj(o.meta);
			if (clear) 
				meta.clearAll();
			$.each(o.meta, function(i,v){
				meta.set(i,v);});
		}
		else
			alert('No meta DB found');
	    if (o.names) {
			trimObj(o.names);
			if (clear) 
				names.clearAll();
			$.each(o.names, function(i,v){
				names.set(i,v);});
		}
		else
			alert('No names DB found');				
	};
    reader.readAsText(file);
};

function updateHeight(){
	wndht=$(window).height();
	imght=$('img').height();
	ht=$('table#translations').height()+$('table#port').height()+$('div#down').height();
	if (ht<wndht) return;
	maxht=Math.max(ht,imght,wndht);
	$('body').css('height',maxht+'px');
};

function cleanup(full){													//remove variables and flash objects from memory
	if (full) {
		delete tagsDB;													
		$('table#translations').remove();
	};																	//non-full removal leaves tag database and downloadify button in place
	delete names;														//without removal there would be a noticeable lag upon tab closing in Opera
	delete meta;
	x=document.getElementsByTagName('object');
	for (i = 0; i < x.length; i++) {									//this part might execute before jQuery load
		if ((full)||(x[i].id.search(/SwfStore_(names|meta)_\d/gi)!=-1))
			x[i].parentNode.removeChild(x[i]);
	};			
};