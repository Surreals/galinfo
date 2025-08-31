shownObjects=new Array();


function create_fader(){
	var bodyObj=document.getElementsByTagName('body')[0];
	var fadeObj = document.createElement("div");
	fadeObj.setAttribute('id','fade');
	fadeObj.onclick = function () {destrpopcont();};
	fadeObj.style.display = 'none';
	fadeObj.style.position = 'absolute';
	fadeObj.style.top = '0';
	fadeObj.style.left = '0';
	fadeObj.style.zIndex = '9';
 	fadeObj.style.width = '100%';
	bodyObj.insertBefore(fadeObj, bodyObj.firstChild);
}



function sbmtr(formname,copyfrom,e){
	var keycode;
	if (window.event) keycode = window.event.keyCode;
	else if (e) keycode = e.which;
	else return true;
	
	var getfrom=document.getElementById(copyfrom);
	if (keycode == 13){
		var func = new Function;
		func = getfrom.onclick;
		func();
		return false;
	}else return true;
}





function sbmt(formname,newparam){
	if (newparam)
	{
		eval("document.forms['"+formname+"'].su.value=newparam");
	}
	
	eval("document.forms['"+formname+"'].submit()");
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


function fadePage(cond){
	var popupObj= document.getElementById ? document.getElementById("popup") : null;
	if (cond)
	{
		var coords= wholePage();
		var scroll=getPageScroll();
		var fadeObj = document.getElementById('fade');
		
		
		/*window.alert(coords[1]+'///'+coords[3]+'///'+coords[5]);*/
	
		hideNastyThings(0);
		chngvis('fade','block');
		fadeObj.style.height = (coords[1]+'px');
		fadeObj.style.display = 'block';

		selects = document.getElementsByTagName("select");
        for (i = 0; i != selects.length; i++) {
                selects[i].style.visibility = "hidden";
        }

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

	for(var i=0;i<shownObjects.length;i++){
		obbj= document.getElementById(shownObjects[i]);
		obbj.style.display='none';
	}
	
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



function showP(popupID){
	/*popupObj.style.display = 'block';*/
	var popupObj = document.getElementById(popupID);
	fadePage(1);


	var coords= wholePage();
	var scroll=getPageScroll();

	popupObj.style.display='block';
	shownObjects.push(popupID);

	popupObj.style.top = scroll[1]+(coords[3]-parseInt(popupObj.style.height))/2+'px';
	popupObj.style.left = (coords[0]-parseInt(popupObj.style.width))/2+'px';
	
}