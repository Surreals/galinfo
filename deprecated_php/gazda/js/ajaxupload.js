var imageUploadProgress="<img src='img/loader_light_blue.gif'>";


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
function ajaxUpload(form,url_action,id_element,index){
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
		destr('splash');
    }
	addEvent($m('ajax-temp'),"load", doUpload);
	form.setAttribute("target","ajax-temp");
	form.setAttribute("action",url_action+"&lastindex="+document.ad.lastindex.value+"&isedit="+isedit);
	form.setAttribute("method","post");
	form.setAttribute("enctype","multipart/form-data");
	form.setAttribute("encoding","multipart/form-data");
	
	$m(id_element).innerHTML = imageUploadProgress;

	form.submit();
	switchUploads(0);	
}



function attachNewUploadField(index,html,lastindex,dbid){

	if (eval("document.ad.takenimagefield"+index+".value") !== "0")
	{
		return;
	}

	var newDIV = document.createElement("div");
	var parentDIV = $m('imageupload');
	newDIV.setAttribute("id","imagefield"+lastindex);
	newDIV.setAttribute("className","imagefield");
	newDIV.setAttribute("class","imagefield");

	parentDIV.appendChild(newDIV);

	$m("imagefield"+lastindex).innerHTML=html;

	setFormElementValue ("ad","lastindex",lastindex);
	setFormElementValue ("ad","takenimagefield"+index,dbid);
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