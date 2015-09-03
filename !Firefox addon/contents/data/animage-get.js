// ==UserScript==
// @name			Animage-get
// @description		Format file name & save path for current image by its tags
// @version	    1.2
// @author			Seedmanc
// @namespace		https://github.com/Seedmanc/Tumblr-image-sorter

// @include		http*://*.amazonaws.com/data.tumblr.com/* 
// @include		http*://*.media.tumblr.com/*


// @grant 			none 
// @require 		https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js

// @run-at 		document-body
// @noframes
// ==/UserScript==
													
// ==Settings=====================================================

	var root;																//Main collection folder 
	
	var ms;																	//Metasymbol, denotes folders for categories instead of names, must be their first character

	var allowUnicode;														//Whether to allow unicode characters in manual translation input 
	
	var useFolderNames;														//In addition to tags listed in keys of the folders object, recognize also folder names themselves
																			 
// ==/Settings=========================================================
 		
var title;
var filename;															
var folder = ''; 
var DBrec='';																 
var exclrgxp=/%|\/|:|\||>|<|\?|"|\*/g;										//Pattern of characters not to be used in filepaths
 	
var out=$('<div id="output"><div id="down"></div></div>');					//Main layer that holds the GUI 
var tb =$('<table id="translations">');										//Table for entering manual translation of unknown tags

var	tagcell='<table class="cell"><tr>														\
		<td class="radio"><input type="radio" class="category"  value="name"/></td>			\
		<td class="radio"><input type="radio" class="category"  value="meta"/></td>			\
	</tr><tr>																				\
		<td colspan="2"><a href="#" title="Click to ignore this tag for now" class="ignr">';
																			//Each cell has the following in it:
																			//	two radiobuttons to choose a category for the tag - name or meta
																			//	the tag itself, either in roman or in unicode
																			//		the tag is also a link, clicking which removes the tag from results until refresh
																			//	if the tag is in unicode, cell has a text field to input translation manually
																			// 		if there are also roman tags, they are used as options for quick input into the text field
																			//	if the tag is in roman and consists of two words, cell has a button enabled to swap their order
																			//		otherwise the button is disabled
var tfoot=$('<tfoot><tr><td>														\
	<input type="submit" id="submit" value="submit">								\
</td></tr></tfoot>');														//At the bottom of the table there is the "submit" button that applies changes
var thead=$('<thead><tr><td			>												\
	<table class="cell" style="font-width:95%; font-size:small;">					\
		<tr class="cell"><th class="cell">name</th><th class="cell">meta</th></tr>	\
	</table>																		\
</td></tr></thead>');
tb.append(thead).append(tfoot).hide();


function expandFolders(){													 //Complement DB with tags produced from folders names
	for (var key in folders) {													 
		if (folders.hasOwnProperty(key)&&(['!group','!solo','!unsorted'].indexOf(key)==-1)) { 
			t=folders[key];											
			rx=new RegExp('/^'+String.fromCharCode(92)+ms+'/', '');			
			x=getFileName(t).toLowerCase().replace(rx,'');
			folders[x]=t;
		};
	};													 
}; 	

self.port.on ('gotImageData', main); 
self.port.on ('init', function(obj){
	allowUnicode =	obj.options.image.allowUnicode;
	useFolderNames =obj.options.image.useFolderNames;
	root =			obj.lists.folders.root;
	ms =			obj.lists.folders.metasymbol;
	folders =		obj.lists.folders.folders;
	names =			obj.lists.name.names;
	meta =			obj.lists.name.meta;
	ignore =		obj.lists.ignore;
	if (useFolderNames)
		expandFolders();	
	self.port.emit('getImageData', getFileName(document.location.href)); 
}); 
	
function main(record){ 														//Launch tag processing and handle afterwork
	if (document.location.href.indexOf('tumblr')==-1) 						//If not on tumblr
		if (!(/(jpe*g|bmp|png|gif)/gi).test(document.location.href.split('.').pop()))
			return;															// check if this is actually an image link
			
	DBrec=record;
	$('body').append(out);
	$('div#output').append(tb);
	
	analyzeTags();
	
	$('body').on('keyup', function(key){
		if ((key.keyCode==13)&&($('a#dlLink').length))
			$('a#dlLink')[0].click();
	});
	setInterval(function(){
		document.title=title;												//Apparently DOM changes reset the title back to default
	}, 1000);	

	dlLink='<a href="'+document.location.href.replace('#','')+'" download="'+filename+'" id="dlLink"></a>';
	$('div#down').wrap(dlLink);
	$('a#dlLink').on('click', onDload);
};

function isANSI(s) {														//Some tags might be already in roman and do not require translation
	is=true;
	s=s.split('');
	$.each(s,function(i,v){
		is=is&&(/[\u0000-\u00ff]/.test(v));});
    return is;
};

function analyzeTags( ) {   												//This is where the tag matching magic occurs
	filename=getFileName(document.location.href, true); 
	var tags=DBrec.t;	

	folder='';
	document.title='';												
	var fldrs=[];
	var nms=[];
	var mt=[];
	var ansi={}
	var rest=[];
	
	tags=$.map(tags, function(v,i){											//Some formatting is applied to the taglist before processing

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
																
		if ((ignore.indexOf(v)!=-1)||(ignore.indexOf(v.split(' ').reverse().join(' '))!=-1))
			return null														//Remove ignored tags so that they don't affect the tag amount
		else return v;
	});		
																			//1st sorting stage, no prior knowledge about found categories
	$.each(tags, function(i,v){ 											//Divide tags for the image into 5 categories
		if (folders[v]) 													//	the "has folder" category
			fldrs.push(folders[v])
		else if (names[v]) 													//	the "no folder name tag" category
			nms.push(names[v])
		else if (meta[v])													//	the "no folder meta tag" category,
			mt.push(meta[v])												// which doesn't count towards final folder decision, but simply adds to filename;
		else if (isANSI(v)) {											
			if (tags.length==1)												//If the tag is already in roman and has no folder it might be either name or meta
				nms.push(v)													//if it's the only tag it is most likely the name, otherwise put it into 
			else {															//	 the "ansi" category that does not require translation
				splt=v.split(' ');
				if (splt.length==2)	{										//Some bloggers put tags for both name reading orders (name<->surname),
					rvrs=splt.reverse().join(' ');
					if (names[rvrs]) {										// thus creating duplicating tags
						nms.push(names[rvrs])								// try to find database entry for reversed order first,
						return true;									
					}
					else if (ansi[rvrs])									// then check for duplicates		
						return true;
				}
				ansi[v]=true;											
			};
		}									
		else
			rest.push(v);													//	finally the "untranslated" category.
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
		folders['!solo']=fldrs2[0];											//replace solo folder with metatag folder, so the image can go there if needed,
		folders['!group']=fldrs2[0];										// same for group folder (see 3rd sorting stage)
	};		
	
	fldrs2=$.map(fldrs,function(vl,ix){
		return getFileName(vl);												//Extract names from folder paths
	});		
	
	mt=mt.concat(Object.keys(ansi));										//Roman tags have to go somewhere until assigned a category manually	
	filename=(mkUniq(fldrs2.concat(nms), true).concat(['']).concat(mkUniq(mt, true))
		.join(',').replace(/\s/g,'_').replace(/\,/g,' ')+' '+filename).trim(); 																
																			//Format the filename in a booru-compatible way, replacing spaces with underscores,
																			// first come the names alphabetically sorted, then the meta sorted separately 
																			// and lastly the original filename;		
																			// any existing commas will be replaced with spaces as well	
																			// this way the images are ready to be uploaded to boorus using the mass booru uploader script
																		
	unsorted=(rest.length>0)||(Object.keys(ansi).length>0);					//Unsorted flag is set if there are tags outside of 3 main categories  
																			
	nms=mkUniq(nms, true);													//Final, 3rd sorting stage, assign a folder to the image based on found tags and categories
	if (unsorted)  {														//If there are any untranslated tags, make a table with text fields to provide manual translation
		fn=rest.reduce(function (fn, v){
			return fn+' '+'['+v.replace(/\s/g,'_')+']';						// such tags are enclosed in [ ]  in filename for better searchability on disk
		},''); 											
		buildTable(ansi, rest);
		folder=folders["!unsorted"]+'\\';   								//Mark image as going to "unsorted" folder if it still has untranslated tags
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
		folder=folders['!solo']+'\\'; 										// unless we had a !meta folder tag earlier, then the solo folder 
																			// would have been replaced with the appropriate !meta folder
	} else 
	 if (nms.length+fldrs.length>1)											//Otherwise if there are several name tags, folder or not, move to the default "group" folder
		folder=folders['!group']+'\\';										// same as the above applies for meta
		
	filename=filename.replace(exclrgxp, '-').trim();						//Make sure there are no forbidden characters in the resulting name 
	document.title+=' \\'+folder+filename;
	folder=(root+folder).replace(/\\\\/g,'\\');								//If no name or folder tags were found, folder will be set to root directory
	
	if (DBrec.s==1) 
		document.title=('💾 '+document.title).replace('💾 💾','💾');			//Indicate if the image has been marked as saved before
		
	title=document.title;
	$('a#dlLink').attr('download', filename);
};

function buildTable(ansi, rest) {											//Create table of untranslated tags for manual translation input
	tb.show();
	var options='';
	var tbd=tb[0].appendChild(document.createElement('tbody'));
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
		row1=tbd.insertRow(0);
		cell1=row1.insertCell(0); 
		cell1.id=v;
		cell1.innerHTML=tagcell+v+'</a><br><input list="translation" size=10 class="txt"/>\
			<datalist id="translation">'+options+'</datalist></td></tr></table>'; 
		$(cell1).attr('class','cell unicode');
		$(cell1).find('input[type="radio"]').attr('name',v);				//In case the blogger provided both roman tag and unicode tag for names,
	}); 																	// the user can simply select one of roman tags for every unicode tag as translation
																			// to avoid typing them in manually. Ain't that cool?		
 	$.each($('a.ignr'),function(i,v){
		v.onclick=function(){
			ignoreTag(this);
		};
	}); 
			
	$('input#submit')[0].onclick=submit; 
	$('input.txt').on('change', selected);		
};

function ignoreTag(anc){													//Remove clicked tag from results for current session (until page reload)
	ignore.push(anc.textContent);											// this way you don't have to fill in the "ignore" list, 
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
	unicode=$('td.unicode').find('input.txt');								 
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
	$.each(ansi,function(ix,vl){											 
			if ((!knj[vl.textContent.trim()])&&(!$(vl).parent().attr('ignore')))
				$(vl).parent().removeAttr('hidden');						 
			}
		);
};
 

function onDload(){															//Mark image as saved in the tag database
	DBrec.s=1;																// it is used to mark saved images on tumblr pages
	self.port.emit('setClipboard', folder+filename);
	self.port.emit('storeImageData',{fname:getFileName(document.location.href), s:1, tags:DBrec.t, auxdb:{names:names, meta:meta}});
}

self.port.on('stored', function(){
	title=('💾 '+title).replace('💾 💾','💾');
	if (!unsorted)
		$('div#output').remove();
});	

function submit(){															//Collects entered translations for missing tags
	tgs=$('td.cell');														// saves them to databases and relaunches tag analysis with new data
	missing=false;
	$.each(tgs,function(i,v){
		if ($(v).parent().attr('ignore')) {
			ignore.push(v.id);												//Mark hidden tags as ignored
			return true;
		};
		tg=$(v).find('input.txt');
		if (tg.length)
			tg=tg[0].value.trim();											//found translation tag
		else {
			tg=v.textContent.trim(); 										//found roman tag
			if ($(v).prop('swap')) {
				t=DBrec.t.join(',').replace(tg.split(' ').reverse().join(' '), tg);
				DBrec.t=t.split(',');										//Apply swap changes to the current taglist
			};
		}											
		cat=$(v).find('input.category');
		if (tg.length){
			if (!isANSI(tg)&&!allowUnicode) {
				$(v).find('input.txt').css("background-color","#ffC080");
				missing=true;												//Indicate unicode characters in user input unless allowed
			} 
			else if (cat[0].checked) 										//name category was selected for this tag
				names[v.textContent.trim().toLowerCase()]=tg.replace(exclrgxp,'-')		
			else if (cat[1].checked)										//meta category was selected
				meta[v.textContent.trim().toLowerCase()]=tg.replace(exclrgxp,'-')
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
		tb.hide();
		analyzeTags();
	}, to);
};
	
//TODO: add checks for common mistakes in unicode names like 実/美 & 奈/菜
//TODO: option to disable unsorted category if translations are not required by user 
//TODO: only launch post-download events after user actually agreed to download image instead of onclick 