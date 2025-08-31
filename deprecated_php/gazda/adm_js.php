<?

require_once("../lib/etc/conf.php");
require_once("../lib/etc/conn.php");
require_once("../lib/etc/core.php");

$lexfile=file($_SERVER["DOCUMENT_ROOT"]."/var/tls/lex.hash");
foreach ($lexfile as $line){
	if (trim($line)){
		$tmp=explode("{:}",$line);
		$depot["tx"][trim($tmp["0"])]=ceho(trim($tmp[1]));
	}
}

header ("Content-Type: application/x-javascript\n");

?>


var groupIsChecked = false;

function chvis(id,preffix,thisobj){
	var obj = document.getElementById ? document.getElementById(preffix+id) : null;
	hide_mess();
	/*count all anchors*/
	var divs = document.getElementsByTagName("div");

	for (var i=0; i<divs.length; i++){
		var diva = divs[i];

		if (diva.getAttribute("rel") == "submenu")
		{
			diva.style.display='none';
		}
	}
	if (obj) obj.style.display='block';

	var anchors = document.getElementsByTagName("a");
	for (var i=0; i<anchors.length; i++){
		var anchor = anchors[i];

		if (anchor.getAttribute("rel") == "mm"){
			anchor.className='';
		}
	}

	thisobj.className='active';
	
	return false;
}



function chgLoc(loc){
	var timerA;
	timerA=setTimeout(document.location.href=loc, 500);
}


function updDate(va,lng){
	var obj = document.getElementById ? document.getElementById("dateholder") : null;
	var objScript = document.getElementById ? document.getElementById("updscript") : null;
	obj.style.backgroundColor = '#CC0000';
	//obj.innerHTML ="<div style='text-align:center;'><img src=\"img/clock.gif\"></div>";
	objScript.src = "/gazda/adm_get_list.php?upd=upddate&which="+va+"&lnng="+lng+"&timerds="+Math.random();
	return false;
	
}

function commonAx(holder,iframeID,vars){
	var obj = document.getElementById ? document.getElementById(holder) : null;
	var objScript = document.getElementById ? document.getElementById(iframeID) : null;
	/*obj.style.backgroundColor = '#999'; */

	var varsstring=vars.join('&');

	objScript.src = "/gazda/adm_get_list.php?"+varsstring+"&timerds="+Math.random();
	return false;
	
}

function setvalueAx(name,value){
		var obj = document.getElementById ? document.getElementById(name) : null;
		obj.innerHTML = value;
}

function setDate(timed){
	var obj = document.getElementById ? document.getElementById("dateholder") : null;
	obj.style.backgroundColor = '#FFFF66';
	var times = timed.split(':');
	var allpop = new Array('hour','min','day','month','year');
	for (var i=0;i<allpop.length;i++) {
		eval("document.forms['ad']."+allpop[i]+".value = '"+times[i]+"'");
	}

	
}


function runFUNC(funcname){
	eval(funcname);	
}

function switchImagesTreeVis(direction){
	var tree = document.getElementById('imagestree');
	var list = document.getElementById('imageslist');

	if (direction){
		tree.className = 'hidden';
		list.className = 'visible';
	} else {
		list.className = 'hidden';
		tree.className = 'visible';
	}
	
	
}



function sbm(suvalue,idvalue,sudirvalue){

	if (suvalue !== '') document.forms['ad'].su.value=suvalue;
	if (idvalue !== '') document.forms['ad'].id.value=idvalue;



	if (sudirvalue !== '')
	{
		if (sudirvalue == "gosave")
		{
			for(var j=0;j<document.forms['ad'].qty.value;j++){
				myname=eval("document.forms['ad'].idword"+j+".value");
				if (!chkname(myname))
				{
					window.alert('<? echo $depot["tx"]["al_wrongletter"]; ?>');
					return;
				}
			}
		}

		if (sudirvalue == "gosavechange")
		{
			
			myname=document.forms['ad'].idword.value;
			if (!chkname(myname))
			{
				window.alert('<? echo $depot["tx"]["al_wrongletter"]; ?>');
				return;
			}
		

		}
		document.forms['ad'].sudir.value=sudirvalue;
	}

	document.forms['ad'].submit();


}

function redi(newparam,id){
	document.forms['ad'].act.value=newparam;
	document.forms['ad'].su.value="content";
	document.forms['ad'].id.value=id;
	document.forms['ad'].submit();
}


function redi1(newparam,id){
	document.forms['ad'].act.value=newparam;
	document.forms['ad'].su.value="v";
	document.forms['ad'].par.value=id;
	document.forms['ad'].submit();
}

function quick_redir(newparam){
	var id = document.forms['ad'].quicker.value;
	redi(newparam,id);
}


function chng_lang(val){
	if (val) document.forms['ad'].su.value=val; else 
	document.forms['ad'].su.value='';
	document.forms['ad'].submit();
}

function sbmt(param,value4){
	eval("document.forms['ad']."+param+".value='"+value4+"'");
	document.forms['ad'].submit();
	return false;
	
}


function chkname(name){
	
	if (name.length > 0)
    {
       	return name.match("([A-Za-z0-9]|-|_){"+name.length+"}");
    }
    return false;

}


function cl(){
	if (window.confirm('<? echo iho("All categories without top parents will be deleted. Are you sure?") ?>')){
		document.forms['ad'].su.value='goclean';
		document.forms['ad'].submit();
	} 
}

function r(id){
	if (window.confirm('<? echo $depot["tx"]["al_del"]; ?>')){
		document.forms['ad'].su.value="remove";
		document.forms['ad'].id.value=id;
		document.forms['ad'].submit();
	} 
}

function rc(id){
	if (window.confirm('<? echo $depot["tx"]["al_del"]; ?>')){
		document.forms['ad'].su.value="chard";
		document.forms['ad'].id.value=id;
		document.forms['ad'].submit();
	} 
}

function rr(id,suffix){
	if (window.confirm('<? echo $depot['tx']["al_del"]; ?>')){
		if (window.confirm('<? echo $depot['tx']["al_areyousure"]; ?>'))
		{		
			if (suffix) document.forms['ad'].su.value="remove"+suffix;
			else document.forms['ad'].su.value="remove";

			document.forms['ad'].id.value=id;
			document.forms['ad'].submit();
		}

	} 
}

function rrr(id){
	if (window.confirm('<? echo $depot["tx"]["al_del"]; ?>')){
		if (window.confirm('<? echo $depot["tx"]["al_areyousure"]; ?>'))
		{	
			document.forms['ad'].varid.value=id;
			document.forms['ad'].su.value="remvar";
			document.forms['ad'].submit();
		}

	} 
}



function dl(){
	if (window.confirm('<? echo $depot["tx"]["al_del"]; ?>')){
		if (window.confirm('<? echo $depot["tx"]["al_areyousure"]; ?>'))
		{		
			document.forms['ad'].su.value="delimages";
			document.forms['ad'].submit();
		}

	} 
}

function syncro(){
	if (window.confirm('<? echo $depot["tx"]["al_syncro"]; ?>')){
		document.forms['ad'].su.value="syncro";
		document.forms['ad'].submit();
	} 
}

function patt(suvalue,idvalue,varidvalue,langid,sudirvalue){

	if (suvalue !== '')
	{
		document.forms['ad'].su.value=suvalue;
	}

	if (idvalue !== '')
	{
		document.forms['ad'].pattid.value=idvalue;
	}

	if (varidvalue !== '')
	{
		document.forms['ad'].varid.value=varidvalue;
	}
	
	if (langid !== '')
	{
		document.forms['ad'].lang.value=langid;
	}

	if (sudirvalue !== '')
	{
	document.forms['ad'].sudir.value=sudirvalue;
	}
	document.forms['ad'].submit();

}


function proceed_patt(varname){
	document.forms['ad'].currpatt.value=varname;
	document.forms['ad'].submit();
}

function selectimage(nm){
	var selection;
	if (selection)
	{
		selection.close()
	}
	selection=window.open("/gazda/adm_func_selectimage.php?formelement="+nm,"info","width=660,height=560,menubar=no,scrollbars=yes");
	if (window.focus)
	{
		selection.focus();
	}
}



function clearimage(formobj){
		
			eval("document.ad."+formobj+".value = ''");
			eval("document.ad."+formobj+"_imo.src ='/media/gallery/tmb/no_image.gif'");
}


function hide_mess(){
	var ero=document.getElementById('error');
	var oki=document.getElementById('oks');

	if (ero) ero.style.display='none';
	if (oki) oki.style.display='none';

}

/*FORMATTING*/

var text_enter_url      = "Enter the complete URL for the hyperlink";
var text_enter_url_name = "Enter the title of the webpage";
var text_enter_image    = "Enter the complete URL for the image";
var text_enter_email    = "Enter the email address";
var text_enter_flash    = "Enter the URL to the Flash movie.";
var text_flash_width    = "Enter the Width of the movie in pixels. Maximum Width= ";
var text_flash_height   = "Enter the Height of the movie in pixels. Maximum Height= ";
var text_code           = "Usage: [CODE] Your Code Here.. [/CODE]";
var text_quote          = "Usage: [QUOTE] Your Quote Here.. [/QUOTE]";

var error_no_url        = "You must enter a URL";
var error_no_title      = "You must enter a title";
var error_no_email      = "You must enter an email address";
var error_no_width      = "You must enter a width";
var error_no_height     = "You must enter a height";
var error_not_url       = "The text you have selected was not recognized as an acceptable URL";
var error_invalid_email = "The text you have selected was not recognized as an acceptable email address";


function eddit(textelem,action,pclass){
	
	element =document.getElementById(textelem);
	element.focus();
	var cclass = (pclass) ? " class="+pclass : '';
	if (navigator.appName == "Microsoft Internet Explorer")
	{
		var rng = document.selection.createRange();
		rng.text = "<" + action + cclass + ">" + rng.text + "</"+action+">" ;

	} else {
		s_start =element.selectionStart;
		s_end =	element.selectionEnd;
		element.value = element.value.substring(0,s_start) + '<' + action +  cclass + '>' + element.value.substring(s_start,s_end) + '</' + action + '>' +  element.value.substring(s_end,element.value.length);
	}

	return false;
}

function eddit_anchor(textelem,sourceobj){
	
	element =document.getElementById(textelem);
	sourcee = document.getElementById(sourceobj);
	href = sourcee.value;
	element.focus();
	if (navigator.appName == "Microsoft Internet Explorer")
	{
		var rng = document.selection.createRange();
		rng.text = "<a href='" + href +  "'>" + rng.text + "</a>" ;

	} else {
		s_start =element.selectionStart;
		s_end =	element.selectionEnd;
		element.value = element.value.substring(0,s_start) + '<a href="'+href+'">' + element.value.substring(s_start,s_end) + '</a>' +  element.value.substring(s_end,element.value.length);
	}

	return false;
}

function eddit_unar(textelem,action){
	
	element =document.getElementById(textelem);
	element.focus();
	if (navigator.appName == "Microsoft Internet Explorer")
	{
		var rng = document.selection.createRange();
		rng.text = action + rng.text ;

	} else {
		s_start =element.selectionStart;
		s_end =	element.selectionEnd;
		element.value = element.value.substring(0,s_start) + action + element.value.substring(s_start,s_end) +  element.value.substring(s_end,element.value.length);
	}

	return false;
}

function eddit_replace(textelem,action){

	element =document.getElementById(textelem);
	element.focus();
	if (action == 'newline')
	{
		var old_content=element.value;
		var regexp=/[\r]/g;
		element.value = old_content.replace(regexp,"<br/>");
	}
	
	return false;
}

function addURL(textelem, type) {
	var element =document.getElementById(textelem);
	element.focus();
	if (navigator.appName == "Microsoft Internet Explorer") {
		var enterURL = '', enterTITLE = '', FoundErrors = '';
		var rng = document.selection.createRange();
		if (type == 1) {
			if (rng.text == "") {
				enterURL   = prompt(text_enter_url, "http://");
				enterTITLE = '';
				if (!enterURL) {
					FoundErrors += "\n" + error_no_url;
				}
			} else {
				enterURL = rng.text;
				if (enterURL.indexOf('http://') != 0) {
					FoundErrors += "\n" + error_not_url;
				}
			}
			if (FoundErrors) {
				alert("Error!" + FoundErrors);
				return false;
			}
			rng.text = "<a href='" + enterURL + "'>";
			element.focus();
		} else {
			if (rng.text == "") {
				enterURL   = prompt(text_enter_url, "http://");
				enterTITLE = prompt(text_enter_url_name, "My Webpage");
				if (!enterURL) {
					FoundErrors += "\n" + error_no_url;
				}
				if (FoundErrors) {
					alert("Error!" + FoundErrors);
					return false;
				}
			} else {
				if (rng.text.indexOf('http://') == 0) {
					enterURL   = rng.text;
					enterTITLE = prompt(text_enter_url_name, "My Webpage");
				} else {
					enterURL   = prompt(text_enter_url, "http://");
					enterTITLE = rng.text;
				}
			}
			rng.text = "<a href='" + enterURL + "'>" + enterTITLE + "</a>";
			element.focus();
		}
	} else{
		var enterURL = '', enterTITLE = '', FoundErrors = '';
		var selStart = element.selectionStart;
		var selEnd   = element.selectionEnd;
		var text     = element.value.substring(selStart, selEnd);
		if (type == 1) {
			if (text == "") {
				enterURL   = prompt(text_enter_url, "http://");
				enterTITLE = '';
				if (!enterURL) {
					FoundErrors += "\n" + error_no_url;
				}
			} else {
				enterURL = text;
				if (enterURL.indexOf('http://') != 0) {
					FoundErrors += "\n" + error_not_url;
				}
			}
			if (FoundErrors) {
				alert("Error!" + FoundErrors);
				return;
			}
			//element.value.substring(selStart, selEnd) = "[URL]" + enterURL + "[/URL]";
			var before = element.value.substring(0, selStart);
			var after  = element.value.substring(selEnd, element.textLength);
			element.value = before + "<a href = '" + enterURL + "'>" + after;
			element.focus();
		} else {
			if (text == "") {
				enterURL   = prompt(text_enter_url, "http://");
				enterTITLE = prompt(text_enter_url_name, "My Webpage");
				if (!enterURL) {
					FoundErrors += "\n" + error_no_url;
				}
			} else {
				if (text.indexOf('http://') == 0) {
					enterURL   = text;
					enterTITLE = prompt(text_enter_url_name, "My Webpage");
				} else {
					enterURL   = prompt(text_enter_url, "http://");
					enterTITLE = text;
				}
			}
			if (!enterTITLE) enterTITLE = enterURL;
			//element.value.substring(selStart, selEnd) = "[URL=" + enterURL + "]" + enterTITLE + "[/URL]";
			var before = element.value.substring(0, selStart);
			var after  = element.value.substring(selEnd, element.textLength);
			element.value = before + "<a href='" + enterURL + "'>" + enterTITLE + "</a>" + after;
			element.focus();
		}
	}
	return false;
}

//images function
function pass(imageID,imageFile){
	
	var anchors = document.getElementsByTagName("a");
	for (var i=0; i<anchors.length; i++){
		var anchor = anchors[i];
		if (anchor.getAttribute("rel") == "loadedHref" && anchor.getAttribute("id") == ('loadedHref'+imageID)){
			window.alert("You already have this image selected");
			return;
		}
	}
	
	if (document.forms['ad'].currselected.value == '' ){
		var imageKeepr = document.getElementById("selectedi");

		var objLoadHolder= document.createElement("div");
		objLoadHolder.className='image_popup_item selectedHolder';
		objLoadHolder.setAttribute('id','loadedHolder'+imageID);
		imageKeepr.appendChild(objLoadHolder);

		var objImageCountSpan = document.createElement("span");
		objImageCountSpan.className='image_popup_count';
		var image_count = imageKeepr.getAttribute("data-images")
		image_count++;
		imageKeepr.setAttribute("data-images",image_count)
		objImageCountSpan.innerHTML =image_count;



		var objLoadingImageLink = document.createElement("a");
		objLoadingImageLink.setAttribute('href','');
		objLoadingImageLink.className='imginline76';
		objLoadingImageLink.setAttribute('rel','loadedHref');
		objLoadingImageLink.setAttribute('id','loadedHref'+imageID);
		objLoadingImageLink.onclick = function () {activateLoaded(imageID); return false;}

		objLoadingImageLink.appendChild(objImageCountSpan);
		objLoadHolder.appendChild(objLoadingImageLink);

		var objLoadingImage = document.createElement("img");
		objLoadingImage.src = "/media/gallery/tmb/"+imageFile;
		objLoadingImage.setAttribute('id','loadedImage'+imageID);
		objLoadingImageLink.appendChild(objLoadingImage);
		objLoadingImage.setAttribute('width','75');
		

		var objFilename= document.createElement("span");
		objFilename.setAttribute('id','objFilename'+imageID);
		objFilename.innerHTML=extractFileName(imageFile);
		objLoadHolder.appendChild(objFilename);


		
		changeSet(imageID,'a');

	} else {
		var objLoadingImageLink= document.getElementById('loadedHref'+document.forms['ad'].currselected.value);
		objLoadingImageLink.setAttribute('id','loadedHref'+imageID);
		objLoadingImageLink.onclick = function () {activateLoaded(imageID); return false;}

		var objLoadingImage = document.getElementById('loadedImage'+document.forms['ad'].currselected.value);
		objLoadingImage.setAttribute('id','loadedImage'+imageID);
		objLoadingImage.src = "/media/gallery/tmb/"+imageFile;
		
		var objFilename = document.getElementById('objFilename'+document.forms['ad'].currselected.value);
		objFilename.innerHTML=extractFileName(imageFile);
		objFilename.setAttribute('id','objFilename'+imageID);

		changeSet(imageID,'e');
	}


	countSelectedImages('loadedHref');
	document.forms['ad'].currselectedimage.value='';
	document.forms['ad'].currselected.value='';

	
}


function extractFileName(fullPath) {
	return fullPath.replace(/(.*)([\/\\])([^>/\\]+)/gi, '$3');
}

function passURL(imageID,imageFile){
	var imageurl=document.getElementById('imageurl');
	var imsize=document.getElementById('imsize');
	imageurl.value='/media/gallery/'+imsize.value+'/'+imageFile;
	
}

function suck(){
	window.alert("SUCK !!!");
	return false;
}


function  countSelectedImages(rel){
	var anchors = document.getElementsByTagName("a");
	var count=0;

	
	for (var i=0; i<anchors.length; i++){
		var anchor = anchors[i];
		if (anchor.getAttribute("rel") == rel){
			count++;
		}
	}
	var spanObj = document.getElementById('imageqty');
	spanObj.innerHTML = count;

}


function activateLoaded(id){
	
	if (document.forms['ad'].currselected.value == '') 
	{
		document.forms['ad'].currselected.value=id;
		currIm=document.getElementById("loadedImage"+id);
		document.forms['ad'].currselectedimage.value=currIm.getAttribute("src");
		currIm.src="/gazda/img/pixanime.gif";
		currIm.width="75";
		//currIm.height="75";

	} else {
		
			deselect(id);
		
	}

	
}


function deselect(){
	if (document.forms['ad'].currselected.value == '' ){
		window.alert("No image selected!");
		return false;
	}
	currIm=document.getElementById("loadedImage"+document.forms['ad'].currselected.value);
	currIm.src=document.forms['ad'].currselectedimage.value;
	document.forms['ad'].currselectedimage.value='';
	document.forms['ad'].currselected.value='';

}

function destroyImage(){
	if (document.forms['ad'].currselected.value == '' ){
		window.alert("No image selected!");
		return false;
	} 
	
	var imageID=document.forms['ad'].currselected.value;
	var imageKeepr = document.getElementById("selectedi");


	var objloadedHolder= document.getElementById('loadedHolder'+imageID);
	imageKeepr.removeChild(objloadedHolder);

	/*var objLoadingImage = document.getElementById('loadedImage'+imageID);
	var objLoadingImageLink= document.getElementById('loadedHref'+imageID);
	var objFilename = document.getElementById('objFilename'+imageID); 


	objLoadingImageLink.setAttribute("id",null);
	objLoadingImage.setAttribute("id",null);
	objLoadingImageLink.setAttribute("rel",null); */



	
	//objLoadingImage.id=null;
	changeSet(imageID,'r');
	document.forms['ad'].currselectedimage.value='';
	document.forms['ad'].currselected.value='';

	/*objLoadingImageLink.style.display="none";*/
	countSelectedImages('loadedHref');
	return false;
}


function changeSet(id,action){
	var wheretoo=document.forms['ad'].whereto.value;
	//var theStr=document.forms['ad'].selimgs.value;
	var theStr=eval("document.forms['ad']."+wheretoo+".value");
	var idArray=new Array();
	var idArray_old = theStr.split(",");
	if (action == 'a')
	{
		for (var i=0;i<idArray_old.length;i++ )
		{
			if (idArray_old[i] && idArray_old[i] !== id)
			{
				idArray.push(idArray_old[i]);
			}
		}
		idArray.push(id);
	
	} else if (action == 'e'){
		var cr=document.forms['ad'].currselected.value;
		for (var i=0;i<idArray_old.length;i++ )
		{
			if (idArray_old[i])
			{ 
				if(idArray_old[i] !== cr) {
					idArray.push(idArray_old[i]);
				} else {
					idArray.push(id);
				}
			}
		}
	
	} else if (action == 'r'){
		for (var i=0;i<idArray_old.length;i++ )
		{
			if (idArray_old[i] && idArray_old[i] !== id)
			{
				idArray.push(idArray_old[i]);
			}
		}
	}
	//document.forms['ad'].selimgs.value = idArray.join(',');
	eval("document.forms['ad']."+wheretoo+".value='"+idArray.join(',')+"'");
}

function toggleClassNames() {
  var n = this.className;
  this.className = this.altClassName;
  this.altClassName = n;
}


function setupDatarows() {
  var v = document.getElementsByTagName("tr");
  for (var i = 0; i < v.length; i++) {
	if (v[i].className.indexOf("datarow") != -1) {
	  v[i].onmouseover = toggleClassNames;
	  v[i].onmouseout = toggleClassNames;

	 
	 v[i].altClassName = v[i].className + " hover";
	 //v[i].altClassName = "hover";
	}
  }
}


if (typeof window.onload == "undefined" || window.onload == null) {
  window.onload = setupDatarows;
} else {
  (function() {
	 var oldOnload = window.onload;
	 window.onload = function() { oldOnload(); setupDatarows(); }
  })();
}


function setvalue(name,value){
		var obj = document.getElementById ? document.getElementById(name) : null;
		obj.innerHTML = value;
}



function chngVis(id,value){
		var obj = document.getElementById ? document.getElementById(id) : null;

		if (obj.style.display =='none')
			obj.style.display=value;
		else  obj.style.display='none';
}


function selectAll(sName){
	obj = document.getElementsByName(sName);
	for (var i=0; i<obj.length; i++){
		if (groupIsChecked)
		obj[i].checked=false;
		else obj[i].checked=true;
	}

	groupIsChecked = groupIsChecked ? false : true;
	
}


function dlm(){
	if (window.confirm('<? echo $depot['tx']["al_del"]; ?>')){
		if (window.confirm('<? echo $depot['tx']["al_areyousure"]; ?>'))
		{		
			document.forms['ad'].su.value="delmedia";
			document.forms['ad'].submit();
		}

	} 
}

function sbmtOut(param,value4){
	eval("document.forms['ad']."+param+".value='"+value4+"'");
	document.forms['ad'].submit();
	return false;
	
}
  