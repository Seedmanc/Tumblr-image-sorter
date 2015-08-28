// ==UserScript==
// @name		Animage-get
// @description	Format file name & save path for current image by its tags
// @version	    1.1
// @author		Seedmanc
// @namespace	https://github.com/Seedmanc/Tumblr-image-sorter

// @include		http*://*.amazonaws.com/data.tumblr.com/* 
// @include		http*://*.media.tumblr.com/*


// @grant 		none 
// require 	https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js

// @run-at 		document-body
// @noframes
// ==/UserScript==
													
// ==Settings=====================================================

	var root=			'E:\\#-A\\!Seiyuu\\';								//Main collection folder
																			//Make sure to use double backslashes instead of single ones everywhere	
	var ms=				'!';												//Metasymbol, denotes folders for categories instead of names, must be their first character
	
	var folders=		{													//Folder and names matching database
		"	!!group	"	:	"		!!group	",								// used both for tag translation and providing the list of existing folders
		"	!!solo	"	:	"		!!solo	",								// trailing whitespaces are voluntary in both keys and values,
		"	!!unsorted"	:	"		!!unsorted	", 							// first three key names are not to be changed, but folder names can be anything
		"	原由実		"	:	"	 !iM@S\\Hara Yumi",					      // subfolders for categories instead of names must have the metasymbol as first symbol
		"	今井麻美	"	:	"	!iM@S\\Imai Asami	",
		"	沼倉愛美	"	:	"	!iM@S\\Numakura Manami",
		"	けいおん!	"	:	"	!K-On	",								 //Category folders can have their own tag, which, if present, will affect the folder choice
		"	日笠陽子	"	:	"	!K-On\\Hikasa Yoko	",					 // for solo and group images
		"	寿美菜子	"	:	"	!K-On\\Kotobuki Minako",
		"	竹達彩奈	"	:	"	!K-On\\Taketatsu Ayana",
		"	豊崎愛生	"	:	"	!K-On\\Toyosaki Aki	",
		"	クリスマス	"	:	"	 !Kurisumasu	",
		"	Lisp	"		:	"	!Lisp	",								//Roman tags can be used as well
		"	阿澄佳奈	"	:	"	!Lisp\\Asumi Kana	",
		"	酒井香奈子	"	:	"	!Lovedoll\\Sakai Kanako",
		"	らき☆すた	"	:	"	!Lucky Star	",
		"	遠藤綾		"	:	"	 !Lucky Star\\Endo Aya	",
		"	福原香織	"	:	"	!Lucky Star\\Fukuhara Kaori",
		"	長谷川静香	"	:	"	!Lucky Star\\Hasegawa Shizuka",
		"	加藤英美里	"	:	"	!Lucky Star\\Kato Emiri	",
		"	今野宏美	"	:	"	!Lucky Star\\Konno Hiromi	", 
		"	井上麻里奈	"	:	"	!Minami-ke\\Inoue Marina	",
		"	佐藤利奈	"	:	"	!Minami-ke\\Sato Rina	",
		"	Petit Milady	":	"	!Petit Milady	", 
		"	悠木碧		"	:	"	 !Petit Milady\\Yuuki Aoi	",
		"	ロウきゅーぶ! "	:	"	!Ro-Kyu-Bu	",
		"	Kalafina 	"	:	"	!Singer\\Kalafina	",
		"	LiSA		"	:	"	!Singer\\LiSA	",
		"	May'n		"	:	"	!Singer\\May'n	", 
		"	茅原実里	"	:	"	!SOS-dan\\Chihara Minori",
		"	後藤邑子	"	:	"	!SOS-dan\\Goto Yuko	",
		"	平野綾		"	:	"	 !SOS-dan\\Hirano Aya	", 
		"	スフィア	"	:	"	 !Sphere	", 
		"	やまとなでしこ "	:	"	!Yamato Nadeshiko	",
		"	堀江由衣	"	:	"	!Yamato Nadeshiko\\Horie Yui",
		"	田村ゆかり	"	:	"	!Yamato Nadeshiko\\Tamura Yukari",
		"	雨宮天	"		:	" 	Amamiya Sora	",
		"	千葉紗子	"	:	"	Chiba Saeko	",
		"	渕上舞		"	:	"	 Fuchigami Mai	",
		"	藤田咲		"	:	"	 Fujita Saki	",
		"	後藤沙緒里	"	:	"	Goto Saori	",
		"	花澤香菜	"	:	"	Hanazawa Kana	",
		"	早見沙織	"	:	"	Hayami Saori	",
		"	井口裕香	"	:	"	Iguchi Yuka	",
		"	井上喜久子	"	:	"	Inoue Kikuko	",
		"	伊藤かな恵	"	:	"	Ito Kanae	",
		"	伊藤静		"	:	"	 Ito Shizuka	",
		"	門脇舞以	"	:	"	Kadowaki Mai	",
		"	金元寿子	"	:	"	Kanemoto Hisako	",
		"	茅野愛衣	"	:	"	Kayano Ai	",
		"	喜多村英梨	"	:	"	Kitamura Eri	",
		"	小林ゆう	"	:	"	 Kobayashi Yuu	",
		"	小清水亜美	"	:	"	Koshimizu Ami	",
		"	釘宮理恵	"	:	"	Kugimiya Rie	",
		"	宮崎羽衣	"	:	"	Miyazaki Ui	",
		"	水樹奈々	"	:	"	Mizuki Nana	",
		"	桃井はるこ	"	:	"	Momoi Haruko	",
		"	中原麻衣	"	:	"	Nakahara Mai	",
		"	中島愛		"	:	"	 Nakajima Megumi	",
		"	名塚佳織	"	:	"	Nazuka Kaori	",
		"	野川さくら	"	:	"	 Nogawa Sakura	",
		"	野中藍		"	:	"	 Nonaka Ai	",
		"	能登麻美子	"	:	"	Noto Mamiko	",
		"	折笠富美子	"	:	"	Orikasa Fumiko	",
		"	朴璐美		"	:	"	 Paku Romi	",
		"	榊原ゆい	"	:	"	Sakakibara Yui	",
		"	坂本真綾	"	:	"	Sakamoto Maaya	",
		"	佐倉綾音	"	:	"	Sakura Ayane	",
		"	沢城みゆき	"	:	"	Sawashiro Miyuki	",
		"	椎名へきる	"	:	"	Shiina Hekiru	",
		"	清水愛		"	:	"	 Shimizu Ai	",
		"	下田麻美	"	:	"	Shimoda Asami	",
		"	新谷良子	"	:	"	Shintani Ryoko	",
		"	白石涼子	"	:	"	Shiraishi Ryoko	",
		"	田中理恵	"	:	"	Tanaka Rie	",
		"	丹下桜		"	:	"	 Tange Sakura	",
		"	東山奈央	"	:	"	Toyama Nao	",
		"	植田佳奈	"	:	"	Ueda Kana	",
		"	上坂すみれ	"	:	"	Uesaka Sumire	",
		"	ゆかな		"	:	"	 Yukana	"
	};

	var ignore=			{'歌手':true, 'seiyuu':true, '声優':true};			//These tags will not count towards any category and won't be included into filename
																			// to disable an entry without removing it use false as value

	var allowUnicode=	false;												//Whether to allow unicode characters in manual translation input, not tested
	
	var useFolderNames=	true;												//In addition to tags listed in keys of the folders object, recognize also folder names themselves
																			// this way you won't have to provide both roman and unicode spellings for names as separate tags

	var debug=			false;												//Initial debug state, affects creation of flashDBs. Value saved in the DB overrides it after DB init.
	
	var storeUrl=		'//dl.dropboxusercontent.com/u/74005421/js%20requisites/storage.swf';	
																			//Flash databases are bound to the URL, must be same as in the other script
// ==/Settings=========================================================

   tagsDB=null;																//Makes sure databases are accessible from console for debugging
   names=null ;
   meta=null ; 		
var title;
var filename;															
var folder = ''; 
var DBrec='';																//Raw DB record,   object with fields for saved flag and tag list
var N=M=T=false;															//Flags indicating readiness of plugins loaded simultaneously
var exclrgxp=/%|\/|:|\||>|<|\?|"|\*/g;										//Pattern of characters not to be used in filepaths
		
out = document.createElement('div');										//Main layer that holds the GUI
	out.id = "output" ; 
	out.innerHTML="<div id='down'> </div>";									//Sublayer for download button
 
tb=document.createElement('table');											//Table for entering manual translation of unknown tags
	tb.id='translations';
	tagcell='<table class="cell"><tr>														\
		<td class="radio"><input type="radio" class="category"  value="name"/></td>			\
		<td class="radio"><input type="radio" class="category"  value="meta"/></td>			\
		</tr><tr><td colspan="2"><a href="#" title="Click to ignore this tag for now" class="ignr">';
																			//Each cell has the following in it:
																			//	two radiobuttons to choose a category for the tag - name or meta
																			//	the tag itself, either in roman or in unicode
																			//		the tag is also a link, clicking which removes the tag from results until refresh
																			//	if the tag is in unicode, cell has a text field to input translation manually
																			// 		if there are also roman tags, they are used as options for quick input into the text field
																			//	if the tag is in roman and consists of two words, cell has a button enabled to swap their order
																			//		otherwise the button is disabled
	foot=tb.createTFoot();
	row=foot.insertRow(0);
	row.innerHTML='<input type="submit" id="submit" onclick=submit() value="submit">';
	head=tb.createTHead();													//At the bottom of the table there is the "submit" button that stores changes
	row=head.insertRow(0);													// and relaunches tag analysis without reloading the image
	row.insertCell(0).innerHTML='<table class="cell" style="font-width:95%; font-size:small;">\
		<tr class="cell" ><th class="cell">name</th><th class="cell">meta</th></tr></table>';	
	tb.hidden="hidden";
	
port=document.createElement('table');										//Subtable for settings and im/export of tag databases
	st2=port.style;
	row= port.insertRow(0);
	cell=row.insertCell(0);
	cell.setAttribute('class','settings');
	cell.innerHTML=' <a href="##" onclick=toggleSettings() class="settings">- settings -</a> ';	
	row0=port.insertRow(1);
	row0.insertCell(0).innerHTML='<input type="checkbox" id="debug"/> debug';	
	row1=port.insertRow(2);
	row1.insertCell(0).innerHTML=' <a href="###" onclick=ex() id="aex" class="exim">export db</a>';
	row2=port.insertRow(3);	
	row2.insertCell(0).id='ex';
	row3=port.insertRow(4);
	row3.insertCell(0).innerHTML=' <a href="####" onclick=im() id="aim" class="exim">import db</a> ';	
	row4=port.insertRow(5);
	row4.insertCell(0).id='im';
	port.id='port';

trimObj(folders);											//Run checks on user-input content and format it
trimObj(ignore);	

/*
window.onerror = function(msg, url, line, col, error) {						//General error handler
   var extra = !col ? '' : '\ncolumn: ' + col;
   extra += !error ? '' : '\nerror: ' + error;								//Shows '✗' for errors in title and also alerts a message if in debug mode
   if (msg.search('this.swf')!=-1) 
	 return true;															//Except for irrelevant errors
   document.title+='✗';
   if (debug)
   	 alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
   var suppressErrorAlert = true;
   return suppressErrorAlert;
};*/

var xhr = new XMLHttpRequest();												//Redownloads opened image as blob 
	xhr.responseType="blob";												// so that it would be possible to get it via downloadify button
	xhr.onreadystatechange = function() {									// supposedly the image is being taken from cache so it shouldn't cause any slowdown
		if (this.readyState == 4 && this.status == 200) {
			var blob=this.response;
			var reader = new window.FileReader();
			reader.readAsDataURL(blob); 
			reader.onloadend = function() {
				base64data = reader.result;                
				base64data=base64data.replace(/data\:image\/\w+\;base64\,/,"");
				dl(base64data);												//Call the button creation function
		}
	} else if ((this.status!=200)&&(this.status!=0)) {
		if (this.status==404) {
			document.title='Error '+this.status;
			throw new Error('404');
		};
		throw new Error('Error getting image: '+this.status);
	};							//TODO: add fallback to the tumblr hosted image if link url fails (requires storing post id and blog name)
};

function trimObj(obj){													//Remove trailing whitespace in object keys and values & check correctness of user input
	rootrgxp=/^(?:[\w]\:)\\.+\\$/g;											//makes sure that folder names have no illegal characters
  try {
	roota=root.split('\\');
	if (!(rootrgxp.test(root))||(exclrgxp.test(roota.splice(1,roota.length).join('\\')))) 
		throw new Error('Illegal characters in root folder path: "'+root+'"');
	ms=ms[0];																//It's a symbol, not a string, after all
	if ((exclrgxp.test(ms))||(/\\/.test(ms)))  
		throw new Error ('Illegal character as metasymbol: "'+ms+'"');
	for (var key in obj) {													//Convert keys to lower case for better matching
		if (obj.hasOwnProperty(key)) { 
			t=obj[key];			
			delete obj[key];
			if (typeof t == 'string') {
				t=t.trim();
				if (useFolderNames) {													//Expand DB with tags produced from folders names
					rx=new RegExp('/^'+String.fromCharCode(92)+ms+'/', '');			
					x=getFileName(t).toLowerCase().replace(rx,'');
					obj[x]=t;
				};
			};
			k=key.trim().toLowerCase();
			obj[k]=t;
			if (exclrgxp.test(obj[k]))  									//Can't continue until the problem is fixed
				throw new Error('Illegal characters in folder name entry: "'+obj[k]+'" for name "'+k+'"'); 
		};
	};
  } catch (err) {
		if (!debug)
			alert(err.name+': '+err.message);								//Gotta always notify the user 
		throw err;
  };														//TODO: even more checks here
}; 															

function toggleSettings(){													//Show drop-down menu with settings
	$('table#port td').not('.settings').toggle();
	$('table#translations').css('top',($('table#port').height()+30)+'px');
	sign=$('a.settings').eq(0);
	if (sign.text().search(/\+/,'-')!=-1) {
		sign.text(sign.text().replace(/\+/gi,'-'));
		$('td.settings').css('border-bottom','');
	}
	else {
		sign.text(sign.text().replace(/\-/gi,'+'));
		$('td.settings').css('border-bottom','1px solid black');
	}
};

function debugSwitch(checkbox){												//Toggling debug mode requires page reload
	debug = checkbox.checked;
	tagsDB.set(':debug:',debug );
	location.reload();
};

onDOMcontentLoaded();
function onDOMcontentLoaded(){ 												//Load plugins and databases
	href=document.location.href;

//	$('img').wrap("<center></center>");
	$('body')[0].appendChild(out);

};

function getTags(retry){													//Manages tags acquisition for current image file name from db
	DBrec=JSON.parse(tagsDB.get(getFileName(document.location.href)));			// first attempt at getting taglist for current filename is done upon the beginning of image load
};
	
function main(){ 															//Launch tag processing and handle afterwork

	$('div#output').append(tb);
	unsorted=analyzeTags();
	$('input#submit')[0].onclick=submit; 
	$('input.txt').on('change',selected);

};

function isANSI(s) {														//Some tags might be already in roman and do not require translation
	is=true;
	s=s.split('');
	$.each(s,function(i,v){
		is=is&&(/[\u0000-\u00ff]/.test(v));});
    return is;
};

function analyzeTags() {   													//This is where the tag matching magic occurs
	filename=getFileName(document.location.href, true);
 	if (!DBrec) return;														// if there are any tags, that is
	folder='';

	document.title='';												
	
	tags=DBrec.t;
 
	fldrs=[];
	nms=[];
	mt=[];
	ansi={}
	rest=[];
	
	tags=$.map(tags,function(v,i){											//Some formatting is applied to the taglist before processing

		v=v.replace(/’/g,"\'").replace(/"/g,"''");					
		v=v.replace(/\\/g, '-');									
		v=v.replace(/(ou$)|(ou )/gim,'o ').trim();							//Eliminate variations in writing 'ō' as o/ou at the end of the name in favor of 'o'
																			// I dunno if it should be done in the middle of the name as well		
		sp=v.split(' ');	
		if (sp.length>1) 
			$.each(tags, function(ii,vv){
				if (ii==i) return true;
				if (sp.join('')==vv) 
					return v=false;											//Some bloggers put unicode tags both with and without spaces, remove duplicates with spaces
				}
			); 
		
		if (!v) 
			return null;
																
		if ((ignore[v])||(ignore[v.split(' ').reverse().join(' ')]))
			return null														//Remove ignored tags so that they don't affect the tag amount
		else return v;
	});		
																			//1st sorting stage, no prior knowledge about found categories
	$.each(tags, function(i,v){ 											//Divide tags for the image into 5 categories
		if (folders[v]) 													//	the "has folder" category
			fldrs.push(folders[v])
		else if (names[v]) 													//	the "no folder name tag" category
			nms.push(names.get(v))
		else if (meta[v])													//	the "no folder meta tag" category,
			mt.push(meta[v])												// which doesn't count towards final folder decision, but simply adds to filename
		else if (isANSI(v)) {											
			if (tags.length==1)												//If the tag is already in roman and has no folder it might be either name or meta
				nms.push(v)													//if it's the only tag it is most likely the name
			else {															//	otherwise put it into the "ansi" category that does not require translation
				splt=v.split(' ');
				if (splt.length==2)	{										//Some bloggers put tags for both name reading orders (name<->surname),
					rvrs=splt.reverse().join(' ');
					if (names.get(rvrs)) {									// thus creating duplicating tags
						nms.push(names.get(rvrs))							// try to find database entry for reversed order first,
						return true;									
					}
					else if (ansi[rvrs])									// then check for duplicates		
						return true;
				}
				ansi[v]=true;											
			};
		}									
		else
			rest.push(v);													//	finally the "untranslated" category
	});
																			//2nd sorting stage, now we know how many tags of each category there are
																			//It's time to filter the "ansi" category further
	$.each(fldrs.concat(nms.concat(mt)), function(i,v){						//Some bloggers put both unicode and translated names into tags
		rx=new RegExp('/^'+String.fromCharCode(92)+ms+'/', '');
		x=getFileName(v).toLowerCase().replace(rx,'');
		y=x.split(' ').reverse().join(' ');									// check if we already have a name translated to avoid duplicates
		delete ansi[x];														//I have to again check for both orders even though I deleted one of them before,
		delete ansi[y];														// but at the time of deletion there was no way to know yet which one would match
	});																		//This also gets rid of reverse duplicates between recognized tags and ansi
	fldrs=mkUniq(fldrs, true);	
	nms=$(nms).not(fldrs).get();											//subtract fldrs from nms if they happen to have repeating elements
	fldrs2=[];			
	
	fldrs=$.grep(fldrs,function(v,i){										//A trick to process folders for meta tags, having subfolders for names inside
		fmeta=getFileName(v);
		if ((fmeta.indexOf(ms)==0)) {										// such folders must have the metasymbol as the first character
			fldrs2.push(fmeta);
			if (fldrs.concat(nms).length==1)								//In the rare case when there are no name tags at all we put the image to meta folder
				folder+=v+'\\'												// no need to put meta tag into filename this way, since the image will be in the same folder
			else
				mt.push(fmeta.replace(ms,''));	 							//usually it needs to be done though
			return false;													//exclude processed meta tags from folder category
			}
		else
			return true;													//return all the non-meta folder tags
		}
	);
	if (fldrs2.length==1) {													//Make sure only one folder meta tag exists
		folders['!!solo']=fldrs2[0];										//replace solo folder with metatag folder, so the image can go there if needed,
		folders['!!group']=fldrs2[0];										// same for group folder (see 3rd sorting stage)
	};		
	
	fldrs2=$.map(fldrs,function(vl,ix){
		return getFileName(vl);												//Extract names from folder paths
	});		
	
	mt=mt.concat(Object.keys(ansi));										//Roman tags have to go somewhere until assigned a category manually	
	filename=(mkUniq(fldrs2.concat(nms), true).concat(['']).concat(mkUniq(mt), true)
		.join(',').replace(/\s/g,'_').replace(/\,/g,' ')+' '+filename).trim(); 																
																			//Format the filename in a booru-compatible way, replacing spaces with underscores,
																			// first come the names alphabetically sorted, then the meta sorted separately 
																			// and lastly the original filename;		
																			// any existing commas will be replaced with spaces as well	
																			//this way the images are ready to be uploaded to boorus using the mass booru uploader script
																		
	unsorted=(rest.length>0)||(Object.keys(ansi).length>0);					//Unsorted flag is set if there are tags outside of 3 main categories 
	tb.setAttribute("hidden","hidden");				
	fn='';																	//Final, 3rd sorting stage, assign a folder to the image based on found tags and categories
	nms=mkUniq(nms);
	if (unsorted)  {														//If there are any untranslated tags, make a table with text fields to provide manual translation
		buildTable(ansi, rest);
		folder=folders["!!unsorted"]+'\\';   								//Mark image as going to "unsorted" folder if it still has untranslated tags
		filename=fn+' '+filename;
		document.title+='? ';												//no match ;_;
	} else											
	 if ((fldrs.length==1)&&(nms.length==0)){								//Otherwise if there's only one tag and it's a folder tag, assign the image right there
		folder=fldrs[0]+'\\';
		filename=filename.split(' ');
		filename.shift();													//Remove the folder name from file name since the image goes into that folder anyway
		filename=filename.join(' ').trim();
		document.title+='✓ '; 												//100% match, yay
	} else
	 if ((fldrs.length==0)&&(nms.length==1)){								//If there's only one name tag without a folder for it, goes into default "solo" folder
		folder=folders['!!solo']+'\\'; 										// unless we had a !meta folder tag earlier, then the solo folder 
																			// would have been replaced with the appropriate !meta folder
	} else 
	 if (nms.length+fldrs.length>1)											//Otherwise if there are several name tags, folder or not, move to the default "group" folder
		folder=folders['!!group']+'\\';										// same as the above applies for meta
	filename=filename.replace(exclrgxp, '-').trim();						//Make sure there are no forbidden characters in the resulting name 
	document.title+=' \\'+folder+filename;
	folder=root+folder;														//If no name or folder tags were found, folder will be set to root directory
	
	if (DBrec.s==1) document.title='💾 '+document.title;						//Indicate if the image has been marked as saved before
	title=document.title;
	return unsorted;
};

function buildTable(ansi, rest) {											//Create table of untranslated tags for manual translation input

	tb.removeAttribute("hidden");
	options='';
	tbd=tb.appendChild(document.createElement('tbody'));
	$.each(ansi, function(i,v){												//First process the unassigned roman tags
		row1=tbd.insertRow(0);
		cell1=row1.insertCell(0);  
		cell1.id=i;
		swp='<input type="button" value="swap"  id="swap" />'
		cell1.innerHTML=tagcell+i+'</a><br>'+swp+'</td></tr></table>'; 
		if (i.split(' ').length!=2)											//For roman tags consisting of 2 words enable button for swapping their order
			$(cell1).find('input#swap').attr('disabled','disabled');		// script can't know which name/surname order is correct so the choice is left to user
		$(cell1).attr('class','cell ansi');
		$(cell1).find('input[type="radio"]').attr('name',i);			
		options='<option value="'+i+'"></option>'+options;					//Populate the drop-down selection lists with these tags
		$(cell1).find('input#swap').on('click',function(){swap(this);});
	});																		// so they can be used for translating unicode tags if possible
 
	$.each(rest, function(i,v){												//Now come the untranslated unicode tags
		fn+='['+v.replace(/\s/g,'_')+']'+' '; 								// such tags are enclosed in [ ]  in filename for better searchability on disk
		row1=tbd.insertRow(0);
		cell1=row1.insertCell(0); 
		cell1.id=v;
		cell1.innerHTML=tagcell+v+'</a><br><input list="translation" size=10 class="txt"/>\
			<datalist id="translation">'+options+'</datalist></td></tr></table>'; 
		$(cell1).attr('class','cell unicode');
		$(cell1).find('input[type="radio"]').attr('name',v);				//In case the blogger provided both roman tag and unicode tag for names,
	}); 																	// the user can simply select one of roman tags for every unicode tag as translation
																			// to avoid typing them in manually. Ain't that cool?		
 	$.each($('a.ignr'),function(i,v){v.onclick=function(){ignoreTag(this);};}); 
};

function ignoreTag(anc){													//Remove clicked tag from results for current session (until page reload)
	ignore[anc.textContent]=true;											// this way you don't have to fill in the "ignore" list, 
																			// while still being able to control which tags will be counted
	tdc=$(anc).parent().parent().parent().parent().parent().parent();		//a long way up from tag link to tag cell table					
	tdc.attr('hidden','hidden');
	tdc.attr('ignore','ignore');	

	$.each($('datalist').find('option'), function(i,v){						//Hide these tags from the drop-down lists of translations too
		if (v.value==anc.textContent)										 
			v.parentNode.removeChild(v);								 
		}																 
	);
};

function swap(txt){															//Swap roman tags consisting of 2 words
																		
	data=$('datalist');														// these are most likely the names so they can have different writing orders
	set=[];
	theTag=$(txt).prev().prev()[0];
	$.each(data.find('option'), function(i,v){
		if (v.value==theTag.textContent)
			set.push(v);													//Collect all options from drop-down lists containing the tag to be swapped
		}
	);
	swapped=theTag.textContent.split(' ').reverse().join(' ');

	theTag.textContent=swapped;
	tdc=$(txt).parent().parent().parent().parent().parent();				//Change ids of tag cells as well
	tdc.prop('swap',!tdc.prop('swap'));										//mark node as swapped
	$.each(set,function(i,v){
		v.value=swapped;													//apply changes to the quick selection lists too
		}
	);
};

function selected(inp){														//Hide the corresponding roman tag from results when it has been selected 
	ansi=$('td.ansi');														// as a translation for unicode tag
	unicode=$('td.unicode').find('input.txt');								//that's not a filename, fyi
	knj={};
	$.each(unicode,function(i,v){
		knj[v.value]=true;
		$.each(ansi,function(ix,vl){ 										//Have to show a previously hidden tag if another was selected
			if (vl.textContent.trim()==v.value.trim())
				$(vl).parent().attr('hidden','hidden');
			}
		);
		}
	);
	$.each(ansi,function(ix,vl){											//I don't even remember how and why this works
			if ((!knj[vl.textContent.trim()])&&(!$(vl).parent().attr('ignore')))
				$(vl).parent().removeAttr('hidden');						// but it does
			}
		);
};


function dl(base64data){													//Make downloadify button with base64 encoded image file as parameter
																			// which will both cause save file dialog with custom filename and copy save path to clipboard
	Downloadify.create( 'down'  ,{
		filename: function(){ return filename;}, 							//is this called "stateless"?
		data: base64data, 
		dataType: 'base64',
		downloadImage: '//dl.dropboxusercontent.com/u/74005421/js%20requisites/downloadify.png',
		onError: function(){ throw new Error('Downloadify error');},
		onComplete: onCmplt,
		swf:  downloadifySwf,
		width: 100,
		height: 30,
		transparent: true,
		append: true,
		textcopy: function(){ if (DBrec) {return folder+filename;} else return '';}	
	});																		//If no database record is found, don't change the clipboard
};

function onCmplt(){															//Mark image as saved in the tag database
	if (DBrec)	{															// it is used to mark saved images on tumblr pages
		DBrec.s=1;							
		self.port.emit('saveData',{fname:getFileName(document.location.href), tags:tags, s:1});
									
	};																		
}

self.port.on('saved', function(really){
	if (really) {
		document.title='💾 '+document.title;	
		//remove UI here
	};  //report error here
});		

function submit(){															//Collects entered translations for missing tags
	tgs=$('td.cell');														//saves them to databases and relaunches tag analysis with new data
	missing=false;
	$.each(tgs,function(i,v){
		if ($(v).parent().attr('ignore')) {
			ignore[v.id]=true;												//Mark hidden tags as ignored
			return true;
		};
		tg=$(v).find('input.txt');
		if (tg.length)
			tg=tg[0].value.trim();											//found translation tag
		else {
			tg=v.textContent.trim(); 										//found roman tag
			if ($(v).prop('swap')) {
				t=DBrec.t.replace(tg.split(' ').reverse().join(' '),tg);
				DBrec.t=t;													//Apply swap changes to the current taglist
			};
		}											
		cat=$(v).find('input.category');
		if (tg.length){
			if (!isANSI(tg)&&!allowUnicode) {
				$(v).find('input.txt').css("background-color","#ffC080");
				missing=true;												//Indicate unicode characters in user input unless allowed
			} 
			else if (cat[0].checked) 										//name category was selected for this tag
				names.set(v.textContent.trim().toLowerCase(),tg.replace(exclrgxp,'-'))		
			else if (cat[1].checked)										//meta category was selected
				meta.set(v.textContent.trim().toLowerCase(), tg.replace(exclrgxp,'-'))
			else { 															//no category was selected, indicate missing input
				$(cat[0].parentNode.parentNode ).css("background-color","#ff8080");
				missing=true;
			}
		}
		else {
			$(v).find('input.txt').css("background-color","#ff8080");
			missing=true;													//no translation was provided, indicate missing input
			return true;
			}
		}
	);						
	tbd=$('#translations > tbody')[0];
	to=missing?1000:10;														//If there was missing input, delay before applying changes to show that
	setTimeout(function(){
		tbd.parentNode.removeChild(tbd);
		analyzeTags();
	}, to);
};


//TODO: add save button activation via keyboard
//TODO: improve the button: open assigned folder directly, use modern dialog
//TODO: ^ try to set last used directory in flash save dialog so as to avoid clipboard usage
//TODO: add checks for common mistakes in unicode names like 実/美 & 奈/菜
//TODO: option to disable unsorted category if translations are not required by user
//TODO: add checks for existing entries in another DB?