var openedProducts=new Array();
var popupWidth=50;
var splasWidth=47

function ajaxedPopup(transferer,childObj,varObj,action){

	var obj = document.getElementById ? document.getElementById(childObj) : null;
	var objScript = document.getElementById ? document.getElementById(transferer) : null;

	obj.innerHTML ="<img src=\"img/clock.gif\">";
	objScript.src = "/gazda/adm_get_list.php?var="+varObj.name+"&val="+varObj.value+"&holder="+childObj+"&upd="+action+"&timest="+Math.random();

	//obj.innerHTML = "1920391203910293";
}


function setvalue(name,value){
		var obj = document.getElementById ? document.getElementById(name) : null;
		obj.innerHTML = value;
}


function setFormElementValue(formname,elementId,evalue){

		eval("document.forms['"+formname+"']."+elementId+".value="+evalue);
	
}



/*fading things*/





function create_fader(){
	var objBody = document.getElementsByTagName("body").item(0);
	var fadeObj = document.createElement("div");
	fadeObj.setAttribute('id','fade');
	fadeObj.onclick = function () {};
	fadeObj.style.display = 'none';
	fadeObj.style.position = 'absolute';
	fadeObj.style.top = '0';
	fadeObj.style.left = '0';
	fadeObj.style.zIndex = '20';
 	fadeObj.style.width = '100%';
	objBody.insertBefore(fadeObj, objBody.firstChild);

	var objClock = document.createElement("div");
	objClock.setAttribute('id','splash');
	objClock.style.display="none";
	objClock.style.position="absolute";
	objClock.style.width="50px";
	objClock.style.height="50px";
	objClock.style.zIndex = '22';
	objClock.innerHTML = "<img src='/gazda/img/clock.gif'>";

	objBody.insertBefore(objClock, objBody.firstChild);




}

function wholePage(){
	
	var pageXscroll, pageYscroll;
	
	if (window.innerHeight && window.scrollMaxY) {	
		pageXscroll = document.body.scrollWidth;
		pageYscroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight){ 
		pageXscroll = document.body.scrollWidth;
		pageYscroll = document.body.scrollHeight;
	} else { 
		pageXscroll = document.body.offsetWidth;
		pageYscroll = document.body.offsetHeight;
	}
	
	var windowWidth, windowHeight;
	if (self.innerHeight) {
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) {
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) {
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}	
	
	


	if(pageYscroll < windowHeight){
		pageHeight = windowHeight;
	} else { 
		pageHeight = pageYscroll;
	}

	if(pageXscroll < windowWidth){	
		pageWidth = windowWidth;
	} else {
		pageWidth = pageXscroll;
	}

	arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight,pageXscroll,pageYscroll);
	return arrayPageSize;
}


function getPageScroll(){
	var pageYscroll;

	if (self.pageYOffset) {
		pageYscroll = self.pageYOffset;
	} else if (document.documentElement && document.documentElement.scrollTop){
		pageYscroll = document.documentElement.scrollTop;
	} else if (document.body) {
		pageYscroll = document.body.scrollTop;
	}

	arrayPageScroll = new Array('',pageYscroll); 
	return arrayPageScroll;
}


function fadePageTimer(){
	
}

function getpopup(cond,objID){
	var popupObj=document.getElementById ? document.getElementById(objID) : null;
	//popupWidth=popupObj.width;
	//destr('popup');
	
	destr('splash');
	if (cond)
	{
		var coords= wholePage();
		var scroll=getPageScroll();
		var fadeObj = document.getElementById('fade');

		chngvis('fade','block');
		fadeObj.style.height = (coords[1] + 'px');
		fadeObj.style.display = 'block';

		selects = document.getElementsByTagName("select");
        for (i = 0; i != selects.length; i++) {
                selects[i].style.visibility = "hidden";
        }
		popupObj.style.display = 'block';
		popupObj.style.top = scroll[1]+(coords[3]-50)/2+'px';
		popupObj.style.left = (coords[0]-popupWidth)/2+'px';
	} 
	else 
	{
		popupObj.style.display = 'none';
	}

}

function destrpopcont() {
	selects = document.getElementsByTagName("select");
	for (i = 0; i != selects.length; i++) {
			selects[i].style.visibility = "visible";
	}

	chngvis('fade','none');
	var objPop = document.getElementById ? document.getElementById("popcont") : null;
	$('#popup').fadeOut(400,function(){objPop.innerHTML = '';});
	
	/*chngvis('popup','none'); */
	hideNastyThings(1);
	
	return false;
}


function chngvis(name,val){
	var obj = document.getElementById ? document.getElementById(name) : null;
	obj.style.display=val;

	var objok = document.getElementById ? document.getElementById('oks') : null;
	var objerror = document.getElementById ? document.getElementById('error') : null;
	
	if (objok)
	{
		objok.style.display='none';
	}

	if (objerror)
	{
		objerror.style.display='none';
	}

	return false;
}


function hideNastyThings(condition){

	var visibility = (condition==1) ? 'visible' : 'hidden'; 

	selects = document.getElementsByTagName("select");
	for (i = 0; i != selects.length; i++) {
			//alert("getpopup");
			selects[i].style.visibility = visibility;
	}

	flashes = document.getElementsByTagName("object");
	for (i = 0; i != flashes.length; i++) {
			flashes[i].style.visibility = visibility;
	}
	
}



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


function destr(objID) {
	selects = document.getElementsByTagName("select");
	for (i = 0; i != selects.length; i++) {
			selects[i].style.visibility = "visible";
	}
	chngvis('fade','none');
	var objPop = document.getElementById ? document.getElementById("objID") : null;
	/*objPop.innerHTML = '';  */
	chngvis(objID,'none');
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

function setDate(timed){
	var obj = document.getElementById ? document.getElementById("dateholder") : null;
	obj.style.backgroundColor = '#FFFF66';
	var times = timed.split(':');
	var allpop = new Array('hour','min','day','month','year');
	for (var i=0;i<allpop.length;i++) {
		eval("document.forms['ad']."+allpop[i]+".value = '"+times[i]+"'");
	}

	
}


function ajax_request(rstring){
	
	var objScript = document.getElementById ? document.getElementById("updscript") : null;
	objScript.src = "/gazda/adm_get_list.php?"+rstring+"&timest="+Math.random();

	
}


function sbm_su(suvalue,idvalue,sudirvalue){
	document.forms['ad'].su.value=sudirvalue;
	document.forms['ad'].submit();
}



function sbmssu(ssuvalue,idvalue,sudirvalue){
	if (ssuvalue !== '') document.forms['ad'].ssu.value=ssuvalue;
	if (idvalue !== '') document.forms['ad'].id.value=idvalue;


	if (sudirvalue !== '')
	{
		if (sudirvalue == "gosave")
		{
			for(var j=0;j<document.forms['ad'].qty.value;j++){
				myname=eval("document.forms['ad'].idword"+j+".value");
				if (!chkname(myname))
				{
					window.alert('al_wrongletter');
					return;
				}
			}
		}

		if (sudirvalue == "gosavechange")
		{
			
			myname=document.forms['ad'].idword.value;
			if (!chkname(myname))
			{
				window.alert('al_wrongletter');
				return;
			}
		

		}
		document.forms['ad'].ssudir.value=sudirvalue;
	}

	document.forms['ad'].submit();


}

function rrssu(id){
	if (window.confirm('ARE YOU SURE')){
				
			document.forms['ad'].ssu.value="remove";
			document.forms['ad'].id.value=id;
			document.forms['ad'].submit();
	

	} 
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


function eddit_tpl(textelem,sourceobj){
	
	element =document.getElementById(textelem);
	sourcee = document.getElementById(sourceobj);
	field = sourcee.value;
	element.focus();
	if (navigator.appName == "Microsoft Internet Explorer")
	{
		var rng = document.selection.createRange();
		rng.text = "{%FD:"+field+"%}";

	} else {
		s_start =element.selectionStart;
		s_end =	element.selectionEnd;
		element.value = element.value.substring(0,s_start) + "{%FD:"+field+"%}" + element.value.substring(s_start,s_end) +  element.value.substring(s_end,element.value.length);
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
		objLoadHolder.className='selectedHolder'; 
		objLoadHolder.setAttribute('id','loadedHolder'+imageID);
		imageKeepr.appendChild(objLoadHolder);

		var objLoadingImageLink = document.createElement("a");
		objLoadingImageLink.setAttribute('href','');
		objLoadingImageLink.className='imginline76';
		objLoadingImageLink.setAttribute('rel','loadedHref');
		objLoadingImageLink.setAttribute('id','loadedHref'+imageID);
		objLoadingImageLink.onclick = function () {activateLoaded(imageID); return false;}
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
		if (window.confirm("You already hev one position selected. Deselect it first."))
		{
			deselect(id);
		}
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



function previewmovie(movieid){
	window.open("/gazda/preview.php?videoid="+movieid,"info","width=480,height=420,menubar=no,scrollbars=no");
	return false;
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


function expandBranch(id,icon,realid){
	var obj = document.getElementById ? document.getElementById(id) : null;
	if (!obj) {
		return false;
	}

	var switches=new Array();

	switches["none"]="block";
	switches["block"]="none";

	var icons=new Array();

	icons["opened"]="closed";
	icons["closed"]="opened";


	current_arr=new Array();
	current_str = document.forms['ad'].openbranch.value;
	current_arr = current_str.split(",");

	

	if (obj.style.display == 'none'){
		current_arr.push(realid);
	} else {
		var ind=0;
		for (var i=0; i<current_arr.length; i++){
			if (current_arr[i] == realid) {
				ind = i;
			}
		}

		current_arr.splice(ind,1);
	}

	document.forms['ad'].openbranch.value = current_arr.join(",");

	obj.style.display=switches[obj.style.display];
	icon.className=icons[icon.className];


	return false;

}


function addTypeCommon(pattidvar,ttype){
	var tbd = document.getElementById ? document.getElementById(pattidvar+'___holder') : null;
	tbd.style.display='block';
	var obj = document.getElementById ? document.getElementById(pattidvar) : null;
	var objScript = document.getElementById ? document.getElementById("updscript") : null;
	obj.innerHTML ="<div style='text-align:center;'><img src=\"img/clock.gif\"></div>";
	objScript.src = "/gazda/adm_get_list.php?pattidvar="+pattidvar+"&upd="+ttype+"&timest="+Math.random();

	
}


function switchTab(tabber,holder,tabID,tabsQty){
	for (var i=1; i<=tabsQty; i++)
	{

		/*var block	= document.getElementById(holder+i);
		var tab		= document.getElementById(tabber+i);*/
		if (tabID == i)
		{	
			$m(holder+i).style.display='block';
			$m(tabber+i).className='active';
		}
		else {
			
			
			$m(holder+i).style.display='none';
			$m(tabber+i).className='';
		}
		
	}
	
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
		var cross = "javascript: ";
		cross += "window.parent.$m('"+id_element+"').innerHTML = document.body.innerHTML; void(0);";
		$m(id_element).innerHTML = "ERROR UPLOADING FILE: GEN JS";
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
		destr('splash');
    }
	addEvent($m('submit-temp'),"load", doUpload);
	form.setAttribute("target","submit-temp");
	form.setAttribute("action",url_action);
	form.setAttribute("method","post");

	
	if(form.onsubmit() !== false){
		form.submit(); 
	}
}
	


function switchLanguageTab(parName,language){
	
	var holder=document.getElementById(parName);

	for (i=0;i<holder.childNodes.length;i++)
	{
		if (holder.childNodes[i].tagName == 'A')
		{
			holder.childNodes[i].className='inactiveLanguageTab';	
		} else if (holder.childNodes[i].tagName == 'DIV')
		{
		   holder.childNodes[i].className='inactiveLanguageHolder';
		}
	}

	activeTab=document.getElementById('a_'+parName+'_'+language);
	activeDiv=document.getElementById('div_'+parName+'_'+language);

	activeTab.className= 'activeLanguageTab';
	activeDiv.className= 'activeLanguageHolder';

	return false;
}

function savePhotoTitles(imageID,index,langs){

	var lang = langs.split(',');

	string='';
	for (var i=0; i<lang.length;i++ )
	{
		string+= '&title_'+lang[i]+'='+document.getElementById('title_'+lang[i]+index).value;
	}

	ajax_request('upd=savephototitles&index='+index+'&id='+imageID+string);
	
}

function loadEvent(func)
{	
	var oldonload = window.onload;
	if (typeof window.onload != 'function'){
    	window.onload = func;
	} else {
		window.onload = function(){
		oldonload();
		func();
		}
	}

}


loadEvent(create_fader);