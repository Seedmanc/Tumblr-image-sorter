  
function getFileName(fullName, full){											//Source URL processing for filename
	full=full || false;
	fullName=fullName.replace(/(#|\?).*$/gim,'');								//first remove url parameters
	if (fullName.indexOf('xuite')!=-1) {										//This blog names their images as "(digit).jpg" causing filename collisions
		i=fullName.lastIndexOf('/');
		fullName=fullName.substr(0,i)+'-'+fullName.substr(i+1);					// add parent catalog name to the filename to ensure uniqueness
	}
	else if ((fullName.indexOf('amazonaws')!=-1)&&(!full))  					//Older tumblr images are weirdly linked via some encrypted redirect to amazon services,
		fullName=fullName.substring(0,fullName.lastIndexOf('_')-2);				// where links only have a part of the filename without a few last symbols and extension,
																				// have to match it here as well, but we need full filename for downloadify, thus the param
	if ((fullName.indexOf('tumblr_')!=-1)&&!full) 
		fullName=fullName.replace(/(tumblr_)|(_\d{2}\d{0,2})(?=\.)/gim,'');
	fullName=fullName.replace(/\\/g,'/');										//Function is used both for URLs and folder paths which have opposite slashes
	return fullName.split('/').pop();
};


function mkUniq(arr, sort){														//Ensures uniqueness of array elements, optionally sorting them
	to={};
	for (var i=0;i<arr.length;i++){
		to[arr[i].toLowerCase()]=true;
	};
	arr2=Object.keys(to);
	return (sort)?arr2.sort():arr2;
};

/*try{																			//for some reason exports gives an error here, but it works in index.js just fine
	exports.mkUniq = mkUniq;													//This function is used by both addon and content scripts
}catch(e){};*/


if ( typeof exports !== "undefined") {
	exports.mkUniq = mkUniq;
};