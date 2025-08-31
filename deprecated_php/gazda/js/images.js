var mx,my,mw,mh;

	
function Browser() {

	var ua, s, i;
	this.isIE    = false;
	this.isNS    = false;
	this.version = null;
	ua = navigator.userAgent;

	s = "Netscape6/";
	if ((i = ua.indexOf(s)) >= 0) {
		this.isNS = true;
		this.version = parseFloat(ua.substr(i + s.length));
		return;
	}

	// Treat any other "Gecko" browser as NS 6.1.
	s = "Gecko";
	if ((i = ua.indexOf(s)) >= 0) {
		this.isNS = true;
		this.version = 6.1;
		return;
	}

	s = "MSIE";
	this.isIE = true;
	this.version = parseFloat(ua.substr(i + s.length));
	return;
}

var browser = new Browser();
var dragObj = new Object();
dragObj.zIndex = 0;

var upl=document.getElementById('originalImage');

function dragStart(event, id, act) {
	var el;
	var x, y;

	// If an element id was given, find it. Otherwise use the element being
	// clicked on.
	mx=event.screenX;
	my=event.screenY;

	if (id) dragObj.elNode = document.getElementById(id);
	else {
		/*if (browser.isIE) dragObj.elNode = window.event.srcElement;
		if (browser.isNS) dragObj.elNode = event.target;
		if (dragObj.elNode.nodeType == 3) dragObj.elNode = dragObj.elNode.parentNode; */
	}

	mw=parseInt(dragObj.elNode.style.width);
	mh=parseInt(dragObj.elNode.style.height);


	// Get cursor position with respect to the page.

	if (browser.isIE) {
		x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
		y = window.event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
	}
	if (browser.isNS) {
		x = event.clientX + window.scrollX;
		y = event.clientY + window.scrollY;
	}

	// Save starting positions of cursor and element.
	dragObj.cursorStartX = x;
	dragObj.cursorStartY = y;
	dragObj.elStartLeft  = parseInt(dragObj.elNode.style.left, 10);
	dragObj.elStartTop   = parseInt(dragObj.elNode.style.top,  10);

	if (isNaN(dragObj.elStartLeft)) dragObj.elStartLeft = 0;
	if (isNaN(dragObj.elStartTop))  dragObj.elStartTop  = 0;

	// Update element's z-index.
	//dragObj.elNode.style.zIndex = ++dragObj.zIndex;
	// Capture mousemove and mouseup events on the page.

	if (browser.isIE) {
		eval('document.attachEvent("onmousemove",'+ act+')');
		document.attachEvent("onmouseup",   dragStop);
		window.event.cancelBubble = true;
		window.event.returnValue = false;
	}
	if (browser.isNS) {
		eval('document.addEventListener("mousemove",'+ act+',   true)');
		document.addEventListener("mouseup",   dragStop, true);
		event.preventDefault();
	}
}


function scaleD(event){
	var x, y;
	// Get cursor position with respect to the page.
	if (browser.isIE) {
		x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
		y = window.event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
	}
	if (browser.isNS) {
		x = event.clientX + window.scrollX;
		y = event.clientY + window.scrollY;
	}

	var deltax=event.screenX-mx;
	var deltay=event.screenY-my;

	var delta=(Math.abs(deltax) > 
	Math.abs(deltay)) ? deltax : deltay;

	if (mw==0 || mh==0)
	{
		mw=mh=1;
	}
	
	if (document.forms['ad'].uniformscale.checked)
	{
		
		var k =mw/mh;
		if(deltax == delta){
			deltay=Math.round(delta/k);
		} else {
			deltax=Math.round(delta*k);
		}
	}

	dragObj.elNode.style.width=mw+deltax+'px';
	dragObj.elNode.style.height=mh+deltay+'px';

	document.forms['ad'].wd.value=mw+deltax;
	document.forms['ad'].ht.value=mh+deltay;

	// Move drag element by the same amount the cursor has moved.
}

function dragGo(event) {
	var x, y;
	// Get cursor position with respect to the page.
	if (browser.isIE) {
		x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
		y = window.event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
	}
	if (browser.isNS) {
		x = event.clientX + window.scrollX;
		y = event.clientY + window.scrollY;
	}
	deltax=dragObj.elStartLeft + x - dragObj.cursorStartX;
	deltay=dragObj.elStartTop  + y - dragObj.cursorStartY;
	
	dragObj.elNode.style.left = deltax + "px";
	dragObj.elNode.style.top  = deltay + "px";
	document.forms['ad'].xpos.value=deltax;
	document.forms['ad'].ypos.value=deltay;

	if (browser.isIE) {
		window.event.cancelBubble = true;
		window.event.returnValue = false;
	}
	if (browser.isNS) event.preventDefault();
}



function dragStop() {
  // Stop capturing mousemove and mouseup events.
  if (browser.isIE) {
    document.detachEvent("onmousemove", scaleD);
	document.detachEvent("onmousemove", dragGo);
    document.detachEvent("onmouseup",   dragStop);
  }
  if (browser.isNS) {
    document.removeEventListener("mousemove", scaleD,   true);
	document.removeEventListener("mousemove", dragGo,   true);
    document.removeEventListener("mouseup",   dragStop, true);
  }
}


function resetToUniform(){

	var	mover= document.getElementById('mover');
	var	sizer= document.getElementById('sizer');

	w1=parseInt(upl.style.width);
	h1=parseInt(upl.style.height);
	
	var divwidth = (w1<h1) ? w1 : h1;
	var marginleft=Math.round((w1-divwidth)/2);
	var margintop=Math.round((h1-divwidth)/2);
	divheight=divwidth;

	mover.style.left = marginleft+ "px";
	mover.style.top  = margintop + "px";
	document.forms['ad'].xpos.value=marginleft;
	document.forms['ad'].ypos.value=marginleft;
	
	sizer.style.width=	divwidth+'px';
	sizer.style.height=	divheight+'px';
	document.forms['ad'].wd.value=divwidth;
	document.forms['ad'].ht.value=divwidth;
}



function resetToFull(){	

	var	mover= document.getElementById('mover');
	var	sizer= document.getElementById('sizer');
	
	w1=parseInt(upl.style.width);
	h1=parseInt(upl.style.height);


	sizer.style.width=w1+'px';
	sizer.style.height=h1+'px';

	document.forms['ad'].wd.value=w1;
	document.forms['ad'].ht.value=h1;


	mover.style.left = "0px";
	mover.style.top  = "0px";

	document.forms['ad'].xpos.value=0;
	document.forms['ad'].ypos.value=0;
}


function setSize(){	

	var	mover= document.getElementById('mover');
	var	sizer= document.getElementById('sizer');
	
	sizer.style.width=document.forms['ad'].wd.value+'px';
	sizer.style.height=document.forms['ad'].ht.value+'px';

	mover.style.left = document.forms['ad'].xpos.value+"px";
	mover.style.top  = document.forms['ad'].ypos.value+"px";
}