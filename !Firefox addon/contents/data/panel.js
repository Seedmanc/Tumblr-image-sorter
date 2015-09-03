
$("#tabs").tabs();
$("#accordion").accordion({
	heightStyle: "content", 
	collapsible: true
});
$("#highlightColor").spectrum({
	color: "#000", 
	clickoutFiresChange: true
});

$( "#dialog" ).dialog({
	dialogClass:'alert', 
	autoOpen: false, 
	modal:true, 
	buttons: {
		Ok: function() {
			$( this ).dialog( "close" );
		}
	}
});
$( "#confirm" ).dialog({
	dialogClass:'no-close', 
	autoOpen: 	false, 
	modal: 		true, 
	 buttons: {
		"Add": function() {
			merge=true;
			$('input#file').click();
			$( this ).dialog( "close" );
		}, 
		"Replace": function() {
			merge=false;
			$('input#file').click();
			$( this ).dialog( "close" );
		}
	}
});

$('input.addrow').on('click',  addRow);
$('input.im').on('click', imprt);
$('input.ex').on('click', exprt); 
$('input.tag').on('change', checkTag);	
$('input.folder').on('change', checkMatch);
$('input.translation').on('change', checkMatch);

$('a#external').on('click', function(e){
	e.preventDefault();
	addon.port.emit('openLink',e.target.href);
	return false;
});

$('input#resetConfirm').on('change', function(e){
	if (e.target.checked)
		$('input#reset').removeAttr('disabled')
	else	
		$('input#reset').attr('disabled', 'disabled')
}); 
$('input#reset').on('click', function(){
	$('input#reset').attr('disabled', 'disabled');
	$('input#resetConfirm').prop('checked', false);
	addon.port.emit('reset');
}); 

$('input#ignore').on('change', function(e){							//most of the onchange functions perform input validation 
	input=e.target.value;
	e.target.value=$.map(input.split(','), function(v){
		trimmed=v.trim();
		return (trimmed!='')?v.trim():undefined;
	}).join(',');
});
$('input#ms').on('change', function(e){
	$(e.target).css('background-color', '');
	msexclrgxp=new RegExp(exclrgxp.source+"|\\s|\\\\", 'g');
	if ((!e.target.value)||(msexclrgxp.test(e.target.value))) {
		e.target.value=e.target.value.replace(msexclrgxp, '!');
		$(e.target).css('background-color', '#FFBF80');				//orange color indicates where the script attempted to fix input mistakes
	};			
});	
$('input#root').on('change', function(e){
	if ((e.target.value)&&(e.target.value[e.target.value.length-1]!='\\'))
		e.target.value+='\\';
	rootrgxp=/^([a-z]:){1}(\\[^<>:"/\\|?*]+)+\\$/gi;
	$(e.target).css('background-color', ''); 
	if (!rootrgxp.test(e.target.value)) {
		e.target.focus();											//no idea how to replace wrong characters here
		$(e.target).css('background-color', '#FF8080');				//red color indicates unfixable errors, user input won't be saved until corrected
	};			
});	

addon.port.on('show', applyPanelData);  

addon.port.on('storePanelData', function(){ 
	addon.port.emit('storedPanelData', storePanelData());
});

addon.port.emit('panelStarted');

addon.port.on("stored", function(response){
	if (response=='over quota') {
		$('#dialog div').text('Error: storage is over quota.');
		$("#dialog").dialog("open");
	};
});
				
var exclrgxp=new RegExp(/\/|:|\||>|<|\?|"|\*/g);					//characters not allowed in filenames
var merge=false;
var panelData={lists:{}, options:{}};

function storePanelData(){
	var lists={}; var options={post:{}, image:{}};

	lists.ignore=$('input#ignore').prop('value').split(',');
	lists.folders=collectFolderData();
	lists.name=collectNaMeData();

	options.post.highlightColor=$('#highlightColor').spectrum("get").toHexString();
	options.post.enableOnDashboard=$('#enableOnDashboard').prop('checked');
	options.post.linkify=$('#linkify').prop('checked');
	options.image.allowUnicode=$('#allowUnicode').prop('checked');
	options.image.useFolderNames=$('#useFolderNames').prop('checked');
	
	return {lists:lists, options:options};
};

function applyPanelData(panelData){ 
	var lists=panelData.lists; var options=panelData.options;
	assignFolderData(panelData.lists.folders);
	assignNaMeData(panelData.lists.name);
	$('input#ignore').prop('value', panelData.lists.ignore.join(', ')).change();
	
	$('#highlightColor').spectrum("set", panelData.options.post.highlightColor);
	$('#enableOnDashboard').prop('checked', options.post.enableOnDashboard);
	$('#linkify').prop('checked', options.post.linkify);
	$('#allowUnicode').prop('checked', options.image.allowUnicode);
	$('#useFolderNames').prop('checked', options.image.useFolderNames);
};

function checkTag(e){
	$(e.target).css('background-color', '');
	if (e.target.value.indexOf(',')!=-1) {
		$(e.target).css('background-color', '#FFBF80');
		e.target.value=e.target.value.replace(',', ' ');
	};		
	e.target.value=e.target.value.toLowerCase().trim();
	if (!e.target.value)
		$(e.target).css('background-color', '#FF8080');
};

function checkMatch(e){
	$(e.target).css('background-color', '');
	if (exclrgxp.test(e.target.value)) {
		$(e.target).css('background-color', '#FFBF80');
		e.target.value=e.target.value.replace(exclrgxp, '-');
	};		
	e.target.value=e.target.value.trim();
	e.target.value=e.target.value.replace(/^\\|\\$/g, '');		
	if (!e.target.value)
		$(e.target).css('background-color', '#FF8080');
};

function addRow(t){
	var oldrow=$(t.target).parents('tr:first');
	var newrow=oldrow.clone();
	newrow.find('input:text').filter(function(){return this.value.trim() === "";}).css('background-color', '#FF8080');
	newrow.find('input.addrow').attr('value', '-').attr('class', 'remrow').on('click', remRow);
	newrow.find('input.tag').on('change', checkTag);
	newrow.find('input:text:last').on('change', checkMatch);
	oldrow.find("input:text").prop('value', '').css('background-color', '');
	var whereto=oldrow.parents('table').find('tbody');
	if (whereto.find('tr:last').length)
		whereto.find('tr:last').after(newrow)
	else
		whereto.append(newrow);
};
function remRow(t){
	var row=$(t.target).parents('tr:first');
	row.remove();
};

function collectFolderData(){
	var obj ={root:'', metasymbol:'', folders:{ }};
	obj.root=($('input#root').css('background-color')!='rgb(255, 128, 128)')?$('input#root').prop('value'):'';
	obj.metasymbol=$('input#ms').prop('value');
	
	var tbl = $('table#folders tbody tr').get().map(function(row) {			//convert data from table to 2D array
		return $(row).find('td').not('.btn').get().map(function(cell) {
			return $(cell).find('input:text').prop('value');
		});
	});  
	$.each(tbl, function(i, row){											//convert array to object
		if (row[0]&&row[1])
			obj.folders[row[0]]=row[1];
	});
	return obj;
};
function collectNaMeData(){
	var obj={names:{ }, meta:{ }};
	var names = $('table#names tbody tr').get().map(function(row) {
		return $(row).find('td').not('.btn').get().map(function(cell) {
			return $(cell).find('input:text').prop('value');
		});
	});  
	var meta = $('table#meta tbody tr').get().map(function(row) {
		return $(row).find('td').not('.btn').get().map(function(cell) {
			return $(cell).find('input:text').prop('value');
		});
	}); 
	$.each(names, function(i, row){
		if (row[0]&&row[1])
			obj.names[row[0]]=row[1].replace('\\', '-');
	});
	$.each(meta, function(i, row){
		if (row[0]&&row[1])
			obj.meta[row[0]]=row[1].replace('\\', '-');
	});
	return obj;
};

function exprt(e){
	var source=$(e.target).prop('name');
	var obj=(source=='folders')?collectFolderData():collectNaMeData();		
	var data="text/json;charset=utf-8, "+encodeURIComponent(JSON.stringify(obj, null, '\t'));
	$('a#dl').prop('href','data://'+data).prop('download', source+'.json.txt')[0].click();
};
function imprt(e){ 		
	var source=$(e.target).prop('name');
	$('input#file').prop('value', '');
	
	$('input#file')[0].onchange=function(evt){
		var file = evt.target.files[0];
		
		if (file.type!='text/plain') {
			$('#dialog div').text('Wrong filetype: must be text/json');
			$("#dialog").dialog("open"); 
			return false;
		};
		
		var obj=(source=='folders')?collectFolderData():collectNaMeData();
		
		var reader = new FileReader();
		reader.onloadend = function(e) {
			try {	
					o=JSON.parse(e.target.result);
			} catch(err){
				$('#dialog div').text('Error: '+err.message);
				$("#dialog").dialog("open"); 
				return false;
			};
			if (source=='folders'){
				if (o.root) {
					if (merge && obj.root) {}
					else 
						obj.root=o.root;
				}
				else {
					$('#dialog div').text('No root entry found');
					$("#dialog").dialog("open");
				};
					
				if (o.metasymbol) {
					if (merge && obj.metasymbol) {}
					else 
						obj.metasymbol=o.metasymbol;
				}
				else {
					$('#dialog div').text('No metasymbol entry found');
					$("#dialog").dialog("open");
				};	
					
				if (o.folders) {
					if (!merge) 
						obj.folders={};

					$.each(Object.keys(o.folders), function(i, v){
						if (!obj.folders[v])
							obj.folders[v]=o.folders[v];
					});
				}
				else {
					$('#dialog div').text('No folders entry found');
					$("#dialog").dialog("open");
				};				
				assignFolderData(obj);
				
			} else {
				
				if (o.names) {
					if (!merge) 
						obj.names={};

					$.each(Object.keys(o.names), function(i, v){
						if (!obj.names[v])
							obj.names[v]=o.names[v];
					});
				}
				else {
					$('#dialog div').text('No names entry found');
					$("#dialog").dialog("open");
				};
				
				if (o.meta) {
					if (!merge) 
						obj.meta={};

					$.each(Object.keys(o.meta), function(i, v){
						if (!obj.meta[v])
							obj.meta[v]=o.meta[v];
					});
				}
				else {
					$('#dialog div').text('No meta entry found');
					$("#dialog").dialog("open");
				};
				assignNaMeData(obj);
			};
			addon.port.emit('storedPanelData', storePanelData());
		};
		reader.readAsText(file);			
	};
	$('#confirm').dialog('open');
};

function assignFolderData(obj){
	$('input#root').prop('value', obj.root).change();
	$('input#ms').prop('value', obj.metasymbol).change();	
	
	$('table#folders input.remrow').each(function(i, v){v.click();});
	
	newrow=$('table#folders input.addrow').parents('tr:first');
	$.each(Object.keys(obj.folders), function(i, v){
		if (['!group', '!solo', '!unsorted'].indexOf(v)!=-1){
			$('input.'+v.replace('!','')).filter('.folder').prop('value', obj.folders[v]);
			return true;
		};
		newrow.find('input:first').prop('value', v).change();
		newrow.find('input:last').prop('value', obj.folders[v]).change();
		newrow.find('input.addrow')[0].click();
	}); 
};

function assignNaMeData(obj){ 
	$('table#names input.remrow').each(function(i, v){v.click();});
	newrow=$('table#names input.addrow').parents('tr:first');
	$.each(Object.keys(obj.names), function(i, v){ 
		newrow.find('input:first').prop('value', v).change();
		newrow.find('input:last').prop('value', obj.names[v]).change();
		newrow.find('input.addrow')[0].click();
	}); 
	
	$('table#meta input.remrow').each(function(i, v){v.click();});	
	newrow=$('table#meta input.addrow').parents('tr:first');
	$.each(Object.keys(obj.meta), function(i, v){ 
		newrow.find('input:first').prop('value', v).change();
		newrow.find('input:last').prop('value', obj.meta[v]).change();
		newrow.find('input.addrow')[0].click();
	});
};
 

//TODO ergonomize 'Lists' tab interface so that large amount of rows won't affect accessibility of buttons
//TODO generalize load and save functions even more to avoid duplicating code
//TODO add parsing of dir CMD output to quickly fill in folders
//TODO hide scrollbar while leaving ability to scroll
//TODO move to simple prefs? 
//TODO option to disable clipboard copy?