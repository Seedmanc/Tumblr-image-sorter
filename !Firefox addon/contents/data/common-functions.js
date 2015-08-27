﻿function getFileName(fullPath){														//Extract filename from image URL and format it
	fullPath=fullPath||'';													
	fullPath=fullPath.replace(/(\?).*$/gim,'');										//First remove url parameters 
	if (fullPath.indexOf('tumblr_')!=-1) 
		fullPath=fullPath.replace(/(tumblr_)|(_\d{2}\d{0,2})(?=\.)/gim,'')			//Prefix and postfix of tumblr image names can be omitted without info loss
	else if (fullPath.indexOf('xuite')!=-1) {										//This hosting names their images as "(digit).jpg" causing filename collisions
		i=fullPath.lastIndexOf('/');
		fullPath=fullPath.substr(0,i)+'-'+fullPath.substr(i+1);						// add parent catalog name to the filename to ensure uniqueness
	};
	return fullPath.split('/').pop(); 					
};  


function mkUniq(arr, sort){															//Ensures uniqueness of array elements, optionally sorting them
	to={};
	for (var i=0;i<arr.length;i++){
		to[arr[i].toLowerCase()]=true;
	};
	arr2=Object.keys(to);
	return (sort)?arr2.sort():arr2;
};

try{
exports.mkUniq = mkUniq;															//This function is used by both addon and content scripts
}catch(e){};