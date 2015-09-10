var exclrgxp=/:|\||>|<|\?|"|\*/g;											//Pattern of characters not to be used in filepaths

function getFileName(fullName, full){										//Source URL processing for filename
	var i;
	full=full || false;
	fullName=fullName.replace(/(#|\?).*$/gim,'');							//first remove url parameters
	if (fullName.indexOf('xuite')!=-1) {									//This host names their images as "(digit).jpg" causing filename collisions
		i=fullName.lastIndexOf('/');
		fullName=fullName.substr(0,i)+'-'+fullName.substr(i+1);				// add parent catalog name to the filename to ensure uniqueness
	}
	else if ((fullName.indexOf('amazonaws')!=-1)&&(!full))  				//Older tumblr images are weirdly linked via some encrypted redirect to amazon services,
		fullName=fullName.substring(0,fullName.lastIndexOf('_')-2);			// where links only have a part of the filename without a few last symbols and extension,
																			// have to match it here as well, but we need full filename for downloadify, thus the param
	if ((fullName.indexOf('tumblr_')!=-1)&&!full) 
		fullName=fullName.replace(/(tumblr_)|(_\d{2}\d{0,2})(?=\.)/gim,'');
	fullName=fullName.replace(/\\/g,'/');									//Function is used both for URLs and folder paths which have opposite slashes
	return fullName.split('/').pop();
};


function mkUniq(arr, sort){													//Ensures uniqueness of array elements, optionally sorting them
	var to={};
	for (var i=0;i<arr.length;i++){
		to[arr[i].toLowerCase()]=true;
	};
	var arr2=Object.keys(to);
	return (sort)?arr2.sort():arr2;
};

function checkMatch(e){
	$(e.target).css('background-color', '');
	var addrgxp;
	
	if (platform=="windows") 
		addrgxp='|\/';
	else
		addrgxp='|\\\\';
	
	if (($(e.target).attr("class")=="translation")||($(e.target).attr("class")=="txt"))
		var newexclrgxp=new RegExp(exclrgxp.source+"|\\\\|\\/", 'g')
	else
		newexclrgxp =new RegExp(exclrgxp.source+addrgxp, 'g');
		
	e.target.value=e.target.value.trim();
	e.target.value=e.target.value.replace(/^\\|\\$|^\/|\/$/g, '').trim();	//remove unneeded slashes in the beginning and the end of subfolder names
	
	if (newexclrgxp.test(e.target.value)) {
		$(e.target).css('background-color', '#ffff00');
		e.target.value=e.target.value.replace(newexclrgxp, '-');
	};		
		
	if (!e.target.value)
		$(e.target).css('background-color', '#FF8080');
};

if ( typeof exports !== "undefined") {										//This is used in both index.js and content script
	exports.mkUniq = mkUniq;
};