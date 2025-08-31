var imageUploadProgress="<img src='/im/loading.gif'>";



function savePhotoTitles(imageID,index,langs,department){

	var lang = langs.split(',');

	string='';
	for (var i=0; i<lang.length;i++ )
	{
		string+= '&title_'+lang[i]+'='+document.getElementById('title_'+lang[i]+index).value;
	}
	request=new Array();
	request[0]='act=savephototitles&index='+index+'&id='+imageID+string+'&dept='+department;
	getA(request,false);
	
}


/*############################# AJAX UPLOAD #################################3*/


function $m(theVar){
	return document.getElementById(theVar)
}
function remove(theVar){
	var theParent = theVar.parentNode;
	theParent.removeChild(theVar);
}

function remove1(theVar){
	theVar = document.getElementById(theVar)
	var theParent = theVar.parentNode;
	theParent.removeChild(theVar);
}


function addEvent(obj, evType, fn){
	if(obj.addEventListener)
	    obj.addEventListener(evType, fn, true)
	if(obj.attachEvent)
	    obj.attachEvent("on"+evType, fn)
}
function removeEvent(obj, type, fn){
	if(obj.detachEvent){
		obj.detachEvent('on'+type, fn);
	}else{
		obj.removeEventListener(type, fn, false);
	}
}
function isWebKit(){
	return RegExp(" AppleWebKit/").test(navigator.userAgent);
}


function ajaxSubmit(form,url_action,id_element,index){
	getpopup(1,'splash');

	var detectWebKit = isWebKit();
	form = typeof(form)=="string"?$m(form):form;
	var erro="";
	if(form==null || typeof(form)=="undefined"){
		erro += "The form of 1st parameter does not exists.\n";
	}else if(form.nodeName.toLowerCase()!="form"){
		erro += "The form of 1st parameter its not a form.\n";
	}
	if($m(id_element)==null){
		erro += "The element of 3rd parameter does not exists.\n";
	}
	if(erro.length>0){
		alert("Error in call ajaxUpload:\n" + erro);
		return;
	}
	var iframe = document.createElement("iframe");
	iframe.setAttribute("id","submit-temp");
	iframe.setAttribute("name","submit-temp");
	iframe.setAttribute("width","0");
	iframe.setAttribute("height","0");
	iframe.setAttribute("border","0");
	iframe.setAttribute("style","width: 0; height: 0; border: none;");
	form.parentNode.appendChild(iframe);
	
	window.frames['submit-temp'].name="submit-temp";
	
	var doUpload = function(){
		removeEvent($m('submit-temp'),"load", doUpload);
		positi=	 $("#"+id_element).position();

		var cross = "javascript: ";
		cross += "window.parent.$m('"+id_element+"').innerHTML = document.body.innerHTML; void(0);";
		cross += "window.parent.scroll(0,"+positi.top+");";

	
		$m(id_element).innerHTML = "ERROR UPLOADING DATA: GEN JS";
		$m('submit-temp').src = cross;
		if(detectWebKit){
        	remove($m('submit-temp'));
        }else{
        	setTimeout(function(){ remove($m('submit-temp'))}, 250);
        }

		form.setAttribute("target","_self");
		form.removeAttribute("action");
		form.removeAttribute("enctype");
		form.removeAttribute("encoding");

		if (!keepPopup)
		{	  
			destr('splash');
		}
    }
	addEvent($m('submit-temp'),"load", doUpload);
	form.setAttribute("target","submit-temp");
	form.setAttribute("action",url_action);
	form.setAttribute("method","post");

	
	/*if(form.onsubmit() !== false){ */
		form.submit(); 
	/*}*/	
}  




function ajaxUpload(form,url_action,id_element,index){
	/*getpopup(1,'splash');*/

	var detectWebKit = isWebKit();
	form = typeof(form)=="string"?$m(form):form;
	var erro="";
	if(form==null || typeof(form)=="undefined"){
		erro += "The form of 1st parameter does not exists.\n";
	}else if(form.nodeName.toLowerCase()!="form"){
		erro += "The form of 1st parameter its not a form.\n";
	}
	if($m(id_element)==null){
		erro += "The element of 3rd parameter does not exists.\n";
	}
	if(erro.length>0){
		alert("Error in call ajaxUpload:\n" + erro);
		return;
	}
	var iframe = document.createElement("iframe");
	iframe.setAttribute("id","ajax-temp");
	iframe.setAttribute("name","ajax-temp");
	iframe.setAttribute("width","0");
	iframe.setAttribute("height","0");
	iframe.setAttribute("border","0");
	iframe.setAttribute("style","width: 0; height: 0; border: none;");
	form.parentNode.appendChild(iframe);

	var isedit=eval("document.ad.takenimagefield"+index+".value");
	
	window.frames['ajax-temp'].name="ajax-temp";
	var doUpload = function(){
		removeEvent($m('ajax-temp'),"load", doUpload);
		var cross = "javascript: ";
		cross += "window.parent.$m('"+id_element+"').innerHTML = document.body.innerHTML; void(0);";
		$m(id_element).innerHTML = "ERROR UPLOADING FILE: GEN JS";
		$m('ajax-temp').src = cross;
		if(detectWebKit){
        	remove($m('ajax-temp'));
        }else{
        	setTimeout(function(){ remove($m('ajax-temp'))}, 250);
        }

		switchUploads(1);

		form.setAttribute("target","_self");
		form.removeAttribute("action");
		form.removeAttribute("enctype");
		form.removeAttribute("encoding");
		/*destr('splash');*/
    }
	addEvent($m('ajax-temp'),"load", doUpload);
	form.setAttribute("target","ajax-temp");
	form.setAttribute("action",url_action+"&lastindex="+document.ad.lastindex.value+"&isedit="+isedit);
	form.setAttribute("method","post");
	form.setAttribute("enctype","multipart/form-data");
	form.setAttribute("encoding","multipart/form-data");
	
	$m(id_element).innerHTML = imageUploadProgress;
	$('input:file[value=""]').attr('disabled', true);
	form.submit();
	switchUploads(0);	
}






function attachNewUploadField(index,html,lastindex,dbid,additionalClassName){

	if (eval("document.ad.takenimagefield"+index+".value") !== "0")
	{
		return;

	}
	
	if (!additionalClassName)
	{
		adclass='';
	} else {
		adclass=additionalClassName;
	}
	
	var newDIV = document.createElement("div");
	var parentDIV = $m('imageupload');
	newDIV.setAttribute("id","imagefield"+lastindex);
	newDIV.setAttribute("className","imagefield"+adclass);
	newDIV.setAttribute("class","imagefield"+adclass);

	parentDIV.appendChild(newDIV);

	parentDIV.insertBefore(newDIV, parentDIV.firstChild);

	$m("imagefield"+lastindex).innerHTML=html;

	setFormElementValue ("ad","lastindex",lastindex);
	setFormElementValue ("ad","takenimagefield"+index,dbid);
}


function setFormElementValue(formname,elementId,evalue){
	eval("document.forms['"+formname+"']."+elementId+".value="+evalue);
}



function switchUploads(switcher){
	for (var i=0; i<document.forms.length; i++)
	{
		for (j=0; j<document.forms[i].elements.length; j++ )
		{
			if (document.forms[i].elements[j].type == 'file')
			{
			   if (switcher)
			   { 
					document.forms[i].elements[j].removeAttribute('disabled');
			   } else {
					document.forms[i].elements[j].setAttribute('disabled','');
			   }
			   
			}  
		}
	}
}