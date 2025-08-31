/*zmolo.com (2013|v1.50)*/

var str_array=new Array();
var href_array=new Array();
var domesplash;

var news_id=0;
var ind=1;
var runNews, dt;
var currentStr;
var blinkImage="<img src='/im/blink.gif' style='margin-bottom:-2px;'>";
var scrollMargin=80;
var lastScrollTop=0;
var wh=$(window).height();
var playerState=false;

var runningStringTimeout=3000;

function isdefined(variable) {
	return (typeof(window[variable]) == "undefined") ?  false: true;
}

var popupWidth=300;

function refIm(imagename){
	var ima=document.getElementById(imagename);
	var src=ima.src;
	var regs=   /\&tst\=.*/;
	if (src.match(regs))
	{
		newshit="&tst="+Math.random();
		src = src.replace(regs,newshit);
	} else {
		src=src+"&tst="+Math.random();
	}
	ima.src = src;
	return false;
}


function putaj(){
	
	$('body').append(
		$(document.createElement('iframe'))
			.attr("name","ajaxObj")
			.attr("id","ajaxObj")
			.css({
				'position':'absolute',
				'visibility' : 'hidden',
				'display':'block',
				'width' : '0',
				'height' :'0'
			})
		);
	$("#ajaxObj").attr("src","/init.htm");
}


function create_fader(){
	var bodyObj=document.getElementsByTagName('body')[0];
	var fadeObj = document.createElement("div");
	fadeObj.setAttribute('id','fade');
	fadeObj.onclick = function () {destrpopcont();};
	fadeObj.style.display = 'none';
	fadeObj.style.position = 'absolute';
	fadeObj.style.top = '0';
	fadeObj.style.left = '0';
	fadeObj.style.zIndex = '20';
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
	return false;
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


function getpopup(cond){
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

		/*popupObj.style.display = 'block';*/
		$(popupObj).fadeIn(400);

		popupObj.style.top = scroll[1]+(coords[3]-300)/2+'px';
		popupObj.style.left = (coords[0]-popupWidth)/2+'px';

	} 
	else 
	{
		popupObj.style.display = 'none';

	}

}


function fadePage(){

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


function getA(actpar,val,clockholder){
	var objaj = document.getElementById ? document.getElementById("ajaxObj") : null;
	var obJholder = document.getElementById ? document.getElementById(clockholder) : null;
	if (obJholder)
	{
		obJholder.style.display='block';

		var Owidth =    ($(obJholder).width()-16)/2;
		var Oheight =   ($(obJholder).height()-16)/2;


		obJholder.innerHTML="<img src='/im/loading.gif' style='margin:"+Oheight+"px "+Owidth+"px;text-align:center;'>";
		$(obJholder).fadeIn(200);
	}
	

	
	objaj.src = "/apphlp/upd.php?"+actpar+"&value="+val+"&tst="+Math.random();
	return false;
}


function setvalue(name,value){
	var obj = document.getElementById ? document.getElementById(name) : null;
	if (obj == null) return;
	
	obj.innerHTML = value;
}

function setvalue1(formname,elementname,elvalue){
	eval("document.forms['"+formname+"']."+elementname+".value = elvalue");
}




function SS(frm,alert){
	if (!(alert))
	{   
		Calert("Checking ....");
	} else {
		Cmessage("Checking ....");
	}
	
	document.forms[frm].submit();
	return false;
}



function addslashes(str) {
/*str=str.replace(/\'/g,'\\\'');*/
str=str.replace(/\"/g,'\\\"');
/*str=str.replace('/\\/g','\\\\');*/
/*str=str.replace(/\0/g,'\\0');*/
return str;
}



function stripslashes(str) {
str=str.replace(/\\'/g,'\'');
str=str.replace(/\\"/g,'"');
str=str.replace(/\\\\/g,'\\');
str=str.replace(/\\0/g,'\0');
return str;
}



function Calert(message,okbt){
	var error_content = document.getElementById('popcont');
	var popup = document.getElementById('popup');
	var top = document.getElementById('toppop');
	var ssubmit = document.getElementById('popupsubmit');
	ssubmit.className='sbmt1';
	popup.className='';
	top.className='';
	error_content.className='';
	if (okbt)
	{
		ssubmit.style.display='none';
	} else {
		ssubmit.style.display='inline';
	}
	getpopup(1);
	error_content.innerHTML = message;
}



function Cmessage(message,okbt){
	var error_content = document.getElementById('popcont');
	var popup = document.getElementById('popup');
	var top = document.getElementById('toppop');
	var ssubmit = document.getElementById('popupsubmit');
	ssubmit.className='sbmt';
	popup.className='okout';
	top.className='okbg';
	error_content.className='oktext';
	
	if (okbt)
	{
		ssubmit.style.display='none';
	} else {
		ssubmit.style.display='inline';
	}


	getpopup(1);
	error_content.innerHTML = message;
}





function Clearemail(){
	for (var i=1; i<=7; i++)
	{
		eval ("document.forms['ad'].email_"+i+".value='';");
	}
}


function chUp(action,formname,showalert){
	
	var objScript = document.getElementById ? document.getElementById("ajaxObj") : null;
	var reqLine='';
	var currform    =   eval("document."+formname);
	for(var i=0;i<currform.length;i++){
		if (currform[i].type !== "radio")
		{  
			reqLine+=currform[i].name+"="+escape(currform[i].value)+"&";
		} else {
			if (currform[i].checked)
			{
			   reqLine+=currform[i].name+"="+escape(currform[i].value)+"&";
			}
		}
		
	}
	reqLine+="&frm="+formname+"&timestamp="+Math.random();
	objScript.contentWindow.document.forms['upd'].passed.value = reqLine;
	objScript.contentWindow.document.forms['upd'].act.value = action;
	objScript.contentWindow.document.forms['upd'].submit();
	
	return false;
}



function chPg(contid,newsid,page,language,showalert){
	if (!(showalert))
	{
		Cmessage("Processing ...",1);
	}
	
	var objScript = document.getElementById ? document.getElementById("ajaxObj") : null;
	var reqLine='';

	reqLine= "/apphlp/upd.php?lng="+language+"&contid="+contid+"&commentnewsid="+newsid+"&pg="+page+"&act=chpage&timestamp="+Math.random();
	objScript.src = reqLine;

	return false;
}




function chgLoc(loc){
	var timerA;
	timerA=setTimeout(document.location.href=loc, 500);
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


function showTip1(obj){
	var tipid=obj.getAttribute("id");
	if (tipid == '1')
	{
		objtxt='Invite this team to join your Mini Leagues.';
		showtip('tip',objtxt,obj);
	}
	
}

function hideTip1(){
	var ObjTip = document.getElementById ? document.getElementById('tip') : null;
	ObjTip.style.display='none';
	
}

function showtip(tipid,objtxt,obj){
	var ObjTip = document.getElementById ? document.getElementById(tipid) : null;
	ObjTip.style.top = obj.offsetTop-45;
	ObjTip.style.left = obj.offsetLeft+50;
	if (ObjTip.style.display == 'none') 
	{
		
		ObjTip.style.display='block';
		ObjTip.innerHTML="<div>"+objtxt+"</div>";
	}
	
}

function hidetip(){ 
	str='hideLayer()';              
	timerB=setTimeout('eval(str)', 500);
}

function hideLayer(){
	var ObjTip = document.getElementById ? document.getElementById("tip") : null;
	var objScript = document.getElementById ? document.getElementById("tipcontainer") : null;
	ObjTip.style.visibility="hidden";objScript.src = "/tip.php";

}


function updatetip(name,value){
	var obj = document.getElementById ? document.getElementById(name) : null;
	obj.innerHTML = value;
	$('body').scrollTo( '#commentstart', 800, {queue:true} );
	/*$('body').scrollTop('commentstart')*/;
}


function listnews(name,value){
	var obj = document.getElementById ? document.getElementById(name) : null;
	$('body').scrollTo( '#headline', 800, {queue:true} );
	obj.innerHTML = value;
	
	/*$('body').scrollTop('commentstart')*/;
}

function movetip(obj){
	var ObjTip = document.getElementById ? document.getElementById("tip") : null;
	ObjTip.style.top=obj.clientY+document.body.scrollTop;
	ObjTip.style.left=obj.clientX+document.body.scrollLeft-250;
}



function switchTab(setName,tabID,tabsQty){
	for (var i=1; i<=tabsQty; i++)
	{

		var block   = document.getElementById("hold_"+setName+i);
		var tab     = document.getElementById(setName+i);
		if (tabID == i)
		{   
			 
			 var name="hold_"+setName+i;
			$(block).fadeIn(400);
			tab.className = setName+' active';
		}
		else {
						
			block.style.display='none';
			tab.className = setName;
		}
	}
	return false;
}


function scaleText(direction){
	var container = document.getElementById('read');
	container.className= direction;
}

function showCommentForm(replytoID){
	var $cform = $('#commentform');

	if (replytoID)
	{
		$("#replyto").val(replytoID);
	}
	//$cform.fadeIn(400);
	
	$('body').scrollTo('#commentstart', 800);
	$('textarea[name="message"]').css('border-color','red');
	$("#emptycomm").hide();
	return false;

}

function listHeadlineNews(direction){
	var actpar='listnews';
	var val=document.forms.listnews.lng.value+','+
			document.forms.listnews.rubric_id.value+','+
			direction+','+
			document.forms.listnews.limits.value
		;
	/*window.alert(val); */
	$("#headline").fadeOut(200,function() {getA(actpar,val,'headline')});
	return false;
}


function refresh(){
	var actpar='listnews';
	var val=document.forms.listnews.lng.value+','+
			document.forms.listnews.rubric_id.value+','+
			''+','+
			''
		;
	/*window.alert(val);*/
	$("#headline").fadeOut(200,function() {getA(actpar,val,'headline')});
	return false;
}



function isInteger(s) {
  return (s.toString().search(/^-?[0-9]+$/) == 0);
}


function resetSearchField(fieldObj,requestValue){
	   if (requestValue == '')
   {
	  fieldObj.value='';
   }
	allowSearch=true;
}


function colorBoxed(){
	$('.needlogin,a#likelogin,.loginpop,.myacc').colorbox({transition:'fade', speed:500});
}


function riseCptchVote(imageid){
	var html=   "/apphlp/upd.php?act=vt&phid="+imageid+"&tst="+Math.random();
	$.colorbox({href:html});    
}



function getDropList(e,holder,openSize) {
	cancelBodyBubble(e);
	
	initSizes[holder]= $('#'+holder).height();

	 $('#'+holder).animate({height:openSize+'px'},openSize,function(){

		 $(this).find(".magickdrop").each(function(){
			  $(this).height(openSize-45+"px");
			  $(this).fadeTo(300,0.95);
		 })
				   
	});
}

function hideDropped(){
	$('body').find(".magickdropholder").each(function(){
		
		var processThis=false;
		$(this).find(".magickdrop").each(function(){    
			
			if ($(this).css('display') !== 'none') {
				processThis=true;
				$(this).fadeOut(300);
			}
		});
		if (processThis)
		{
			$(this).animate({height:initSizes[$(this).attr('id')]},300);
		}   
	});
}


function fullyOpen(id){
	$('#'+id).animate({height:($(".maybe").height())},300,function(){$(".moredown").fadeOut(300)});

}

function hideAllPops(){
	hideDropped();
}


function preloaDs(){
		
	$('#srchlink').bind("click",function(e){
		e.preventDefault();
		$(".searchblock").animate({top:'41px'},200);
	});

	
	$(".commentbody").find(".commentmenu").find('a').hover(
		function () {
			$(this).parent(".commentmenu").parent(".commentbody").addClass("commhover");
		 }, 
		function () {
			$(this).parent(".commentmenu").parent(".commentbody").removeClass("commhover");
		}
	);


	$(".menubutton,.slideaway").click(function(){
		var mleft=parseInt($("nav").css("left"));
		if (mleft != 0) {
			$("nav").animate({"left":0},500); 
			if ($('.mmenu').height() > $(window).height()) {
				$('.suggestscroll').css('display','block').bind('click',function (e){
					e.preventDefault();
					$(this).hide();
					$('.scrldesk').animate({
						scrollTop: '1000px'
					}, 1000);
				});
			}

		} else {
			$("nav").animate({"left":"-320px"},500);
		}
		return false;
	});

	$(".mmenu").bind('mouseleave', function (e) {
		$("nav").animate({"left":"-320px"},500);
		$('body').css('overflow','auto');
	})

	$('.scrldesk').scroll(function () {
		$('.suggestscroll').hide();
	});

	/*scroll defs*/
	$(window).scroll(function(){
		
		if(parseInt($(".searchblock").css("top")) > 0 ) {
			$(".searchblock").animate({top:'-100px'},200);
		}
		
		st = $(window).scrollTop();
		if (st > 1500) {
			if ($(".scrolltotop").css("display") != 'block')
			$(".scrolltotop").show();
		} else {
			if ($(".scrolltotop").css("display") == 'block')
			$(".scrolltotop").hide();
		}


		/*if ($(window).width()<800) {
			if (st < lastScrollTop  && lastScrollTop > wh*2) {
				clearTimeout(dt);
				
					$(".scrolltotop").fadeIn( {
						duration    :"slow",
						queue       :false,
						complete    :function(){
							dt=setTimeout(function(){$(".scrolltotop").fadeOut(500)},2000);
						}
					});
				
			} else if (st > lastScrollTop) {
				clearTimeout(dt);
				$(".scrolltotop").fadeOut(50);
			}
		}

		if ($(window).width() <= 375) {
			if ($(window).scrollTop()>10) {
				$("#menugrid").css("margin",0);
			} else {
				$("#menugrid").css("margin","10px");
			}
		}

		lastScrollTop= st;
		*/
	});

	$(".lwave").click(function(e){
		e.preventDefault();
		var myWindow = window.open("/apphlp/lwr.html", "LWR", "width=440, height=320");
	});

	$("body").append(
		$(document.createElement("a"))
		.attr({
			"class": "scrolltotop",
			"href": "" 
		})
		.click(function (e){
			e.preventDefault();
			$('html, body').animate({
				scrollTop: 0
			}, 1000);
			$(this).hide();
		})
	);

	if ($(".calswitcher").length) {
		$(".calswitcher").click(function(e){
			e.preventDefault();
			$(".archivenav").toggle();
		});
	}

	if ($("#poll").length){
		
		$("#poll").find(".vitem").each(function(){
			$(this).click(function(){
				vote($(this).attr('rel'));
				return false;
			});
		});
	}
	

	/*inline slide*/
	var inslideQty=$("article").find(".inlineslide").length;
	if (inslideQty) initInlineSlide(inslideQty);


	/*redtram clean inline style*/
	$(".rt-n-1663__photo").removeAttr("style");
	$(".rt-n-1663__link").removeAttr("style");
	$(".rt-n-1663__link").removeClass("rt-n-1663__link");
	$(".rt-n-1663__link").css({width:"60px !important",height:"45px !important",border:"none !important",float:"left !important"});
	$(".rt-n-1663__title").removeClass("rt-n-1663__title");
	$(".rt-n-1663__outer").css({padding:"0 !important"});
}


function shareInline(ilnk) {
	shareInlineWindow = window.open(ilnk, "_blank", "width=800,height=600");
	return false;
}


function responsiveTricks(){
	if ($(".lcolrel").length && $("#relativeb").length)
	{
		$("#relativeb").html($(".lcolrel").html());
	}


	$(".sharecopy").html($(".sharegroup").html());
	$(".search").clone().appendTo(".searchcopy");
	$("#ialogin").clone().appendTo(".logincopy");

	if ($(".bloglist").length)
		$(".bloglist").clone().appendTo($(".bblcopy"));

	/*gen copy*/
	$(".cp").each(function(){
		$(this).clone().appendTo($(".cp"+$(this).attr('id')));
	});



}



function  cancelBodyBubble(e){
	if (window.event)
	{ 
			window.event.cancelBubble = true;
	}  else {
		e.cancelBubble = true;
	}
}



function setScroll(sObj,topObj,bottObj,initMargin,leftPos){
	var init_height=$(sObj).height();
	var init_width = $(sObj).css("width");
	var opts = {"position":"static","marginTop":"0px"};
	var s_pos = $(window).scrollTop();
	var h_pos = $(window).scrollLeft();
	var off = $(topObj).offset();
	var bottom = $(bottObj).offset().top-init_height;
	var marginTop= initMargin;
	scrolling=true;
	

	if ($(window).height()<init_height)
	{
	
		if(s_pos-off.top+$(window).height() >= init_height && ($(bottObj).offset().top>init_height+off.top+160))
			{
			if(($(bottObj).offset().top - s_pos < $(window).height()) && scrolling) {

				opts.position = 'relative';
				opts.marginTop = (bottom-off.top-20)+'px';
				scrolling = false;
				if (leftPos) {opts.left = 0;}

			}
			else if (scrolling) {
				scrolling = true;
				opts.position = 'fixed';
				opts.marginTop =$(window).height()-init_height-off.top+'px';
				opts.height = init_height;
				opts.width = init_width;
				if (leftPos) {opts.left = off.left-157-h_pos+"px";}
				opts.zIndex = 200;
			}

		} else {
			scrolling = false;
		
		}
	} else {
		if(s_pos > off.top+marginTop){
			if((s_pos >= bottom-50) && scrolling) {

				opts.position = 'relative';
				opts.marginTop = (bottom-off.top-50)+'px';
				if (leftPos) {opts.left = 0;}
				scrolling = false;
			}
			else if (scrolling) {
				scrolling = true;
				opts.position = 'fixed';
				opts.marginTop = '-'+(off.top+marginTop)+'px';
				opts.height = init_height;
				opts.width = init_width;
				//if (leftPos) {opts.left = off.left-157-h_pos+"px";}
				if (leftPos)
					opts.left = "15px";
				opts.zIndex = 200;
			}

		} else {
			scrolling = false;
		
		}
	}
	$(sObj).css(opts);
}



function splashit(){
	if (domesplash)
	{
		$(window).scroll(function(){
			if ($(window).scrollTop() > 200)
			{
				showsplash();
			}
		});
	}
}


function showsplash(){
return;
	var s = 500,
		h = 330;

	var w = $(window).width();
	if (w >500)
	{
		s = 520;
		h = 330;
	} else if (w < 500)
	{
		s= 320;
		h = 370;
	}
	
	if ($('#likesplash').length > 0) return;
	$('<div id="fader">').appendTo('body');

	$('#fader').css({
		width: $(document).width() + 'px',
		height: $(document).height() + 'px',
		background: "#FFFFFF",
		opacity:    "0.85",
		position:   "absolute",
		left: 0,
		top: 0,
		"z-index":1000
	});

	$('<iframe id="likesplash" name="likesplash">').appendTo('body');
	$('#likesplash').attr('src', '/apphlp/fblike.php?s='+s); 
	$('#likesplash').css({
			background: "#b70950",
			width   :   s+"px",
			height  :   h + "px",
			top     :   ($(window).height()-h)/2+"px",
			left    :   ($(window).width()-s)/2+"px",
			position :  "fixed",
			display: "none",
			"z-index":1001
	});

	$('#likesplash').fadeIn(1000);
}


function staticScroll(sObj,hObj){
	off = $(hObj).offset();
	if (off.top<$(window).scrollTop())
	{   
		$(sObj).css({"position":"fixed","margin-top":'-'+off.top+"px"});

	} else {
		
		$(sObj).css({"position":"relative"});
	}
}


function initInlineSlide(inslideQty){
	makeViewer($("article").find(".inlineslide"));
	var articleHeader = $("header").find("h1").text();
	if (inslideQty == 1) {
		$("#inlinenav").remove();
	} 

	$("article").find(".inlineslide").each(function(){
		$(this).find("a").each(function(){
			if (inslideQty > 1) {
				$(this).append("<span>"+inslideQty+"</span>");
			}
			var imgAddress=$(this).attr("href");
			var imgText=$(this).parents("figure").find("figcaption").text();
			var imId=$(this).parents("figure").attr("id");
			$(this).append(createImageSocials(document.URL,articleHeader,imgAddress,imgText,imId,'inlineshare'));
		});     
	});
}


function createImageSocials(aURL,aHeader,imURL,imText,imId,divClass) {

	var fblink = fblinkGet(aURL,aHeader,imURL,imText,imId);
	var twlink = twlinkGet(aURL,aHeader,imURL,imText,imId);
	var vklink = vklinkGet(aURL,aHeader,imURL,imText,imId);

	var fbico=$(document.createElement("a"))
					.attr("href",fblink)
					.addClass("fb")
					.click(function(e){
						e.preventDefault();
						e.stopPropagation();
						shareInline($(this).attr("href"));
				});

	var twico=$(document.createElement("a"))
					.attr("href",twlink)
					.addClass("tw")
					.click(function(e){
						e.preventDefault();
						e.stopPropagation();
						shareInline($(this).attr("href"));
				});

	var vkico=$(document.createElement("a"))
					.attr("href",twlink)
					.addClass("vk")
					.click(function(e){
						e.preventDefault();
						e.stopPropagation();
						shareInline($(this).attr("href"));
				});


	var bar = $(document.createElement("div"))
				.addClass(divClass)
				.append($(vkico))
				.append($(twico))
				.append($(fbico))
				
				
	return bar;
}


function fblinkGet(aURL,aHeader,imURL,imText,imId,isfull){

	var preffix = 'http://'+document.domain;
	if (isfull) {
		preffix = '';
	}

	var fbO={
		caption     :   "Gal-Info",
		redirect    :   encodeURIComponent("http://"+document.domain+"/closeme.htm"),
		picture     :   encodeURIComponent(preffix+imURL),
		descr       :   encodeURIComponent(aHeader+" "+imText),
		link        :   encodeURIComponent(aURL+"#"+imId)
	}

	var fblink="https://www.facebook.com/dialog/feed?app_id=371755279700434&caption="+fbO.caption
				+"&redirect_uri="+fbO.redirect
				+"&picture="+fbO.picture
				+"&description="+fbO.descr
				+"&link="+fbO.link;
	return fblink;
}

function twlinkGet(aURL,aHeader,imURL,imText,imId){
	var via="Toxicoman";
	return "https://twitter.com/intent/tweet?text="+encodeURIComponent(aHeader)+"&url="+encodeURIComponent(aURL+"#"+imId)+"&via="+via;
}

function vklinkGet(aURL,aHeader,imURL,imText,imId){
	return "";
	var fbO={
		caption     :   "Gal-Info",
		redirect    :   encodeURIComponent("http://"+document.domain+"/closeme.htm"),
		picture     :   encodeURIComponent("http://"+document.domain+imURL),
		descr       :   encodeURIComponent(aHeader+" "+imText),
		link        :   encodeURIComponent(aURL+"#"+imId)
	}

	var vklink="https://vk.com/share.php?url="+fbO.link
				+"&title="+fbO.caption
				+"&description="+fbO.descr
				+"&image="+fbO.picture;
	
	return vklink;
}


function makeViewer(oCollection,selectedAnchor){

	var as=$(oCollection).find("a");
	var currentFrame=0;

	$("body").append(
		$(document.createElement("div"))
		.css({
				"width"     :$(document).width(),
				"height"    :$(document).height() + 'px',
			})
		.attr("id","inlineoverlay")
		.click(function(){$(this).hide()})
		.hide()
		.append(
			$(document.createElement("div"))
			.attr("id","inlinefader")
			.click(function(){$(this).parent("#inlineoverlay").hide()})
		)
		.append(
			$(document.createElement("div"))
			.css({
				"width"     :$(window).width(),
				"height"    :$(window).height(),
			})
			.attr("id","inlinescreen")
			.click(function(e){
					e.stopPropagation();
					e.preventDefault();
					$("#inlineprojector").attr("src","");
					$("#inlineprojector").css({"width":0,"height":0});
					$("#inlineoverlay").hide();
			})
			.append(
				$(document.createElement("img"))
				.attr("id","inlineprojector")
				.click(function(e){
					e.stopPropagation();
					e.preventDefault();
					var direc=1;
					if (e.screenX < $(window).width()/2) direc=-1;
					nextInlineFrame(direc);
				})
			)
			.append(
				$(document.createElement("img"))
				.attr("src","/im/clock1.gif")
				.attr("id","inlineclock")
			).append(
				$(document.createElement("div"))
					.attr("id","inlinetext")
					.css({"width":$(window).width()})
			).append(
				$(document.createElement("div"))    
				.attr("id","inlinenav")
				.append(
					$(document.createElement("a"))
					.attr("id","inlineprev")
					.attr("href","")
					.click(function(e){
						e.stopPropagation();
						e.preventDefault();
						nextInlineFrame(-1);
					})
				)
				.append(
					$(document.createElement("a"))
					.attr("id","inlinenext")
					.attr("href","")
					.click(function(e){
						e.stopPropagation();
						e.preventDefault();
						nextInlineFrame(1);
					})
				)
				
			).append(
				$(document.createElement("a"))
				.attr("id","inlineclose")
				.attr("href","")
				.click(function(e){
					e.stopPropagation();
					e.preventDefault();
					$("#inlineprojector").attr("src","");
					$("#inlineprojector").css({"width":0,"height":0});
					$("#inlineoverlay").hide();
				})
			).append(createImageSocials(document.URL,"Gal-Info","Default image","Default Text","justid",'slideshare'))
		)
	);


	/*attach spinner*/
	var loadingSpinner = new Spinner({
	  lines: 64, length: 0, width: 5, radius: 20, corners: 0, rotate: 0, 
	  direction: 1, color: '#ff0099', speed: 2, trail: 100, shadow: false, 
	  hwaccel: false, className: 'spinner', zIndex: 2e9, top: '50%', left: '50%' 
	}).spin(document.getElementById('inlinescreen'));
	//hideLoader=setTimeout(function(){$(".spinner").hide()},10e3);
		
	if (!selectedAnchor)                
		$(oCollection).find("a").click(function(e){
			e.preventDefault();
			showInlineFrame($(this));
		});
	else 
		$('body').on('click',selectedAnchor,function(e){
			e.preventDefault();
			showInlineFrame($(this),true);
		});

	function showInlineFrame(anchor,href){
		
		
		/*  define frame index  */
		if (!href) cattr='href'; else cattr='src';
		for(var i=0;i<as.length;i++) {
			iob=as[i];
			if ($(iob).attr('href') == $(anchor).attr(cattr)) currentFrame = i;
		}
		
		$("#inlineoverlay")
			.show("slow")
			.css("height",$(document).height());
		$("#inlinescreen").css(
		{
			"background-position":"none"
		});
		$(".spinner").show();

		imgPreload = new Image();
		imgPreload.onload=function(){
			
			$("#inlineprojector").attr("src",imgPreload.src);

			iWidth=imgPreload.width;
			iHeight=imgPreload.height;

			k1=$(window).width()/$(window).height();
			k2=iWidth/iHeight;
			if (k1>=k2)
			{
				if (imgPreload.height>$(window).height())
				{
					iHeight=$(window).height();
					iWidth=iHeight*k2;
				} 
			} else if (k1<k2)
			{
				if (imgPreload.width>$(window).width())
				{
					iWidth=$(window).width();
					iHeight=iWidth/k2;
				}
			}


			$("#inlineprojector").css({
					"left"  :"50%",
					"top"   :"50%",
					"width" :iWidth+"px",
					"height":iHeight+"px",
					"margin-top":-iHeight/2+"px",
					"margin-left":-iWidth/2+"px"
			});

			$("#inlinenav").css({
					"left"  :"0%",
					"top"   :"50%",
					"width" : "100%",
					"height":iHeight+"px",
					"margin-top":-iHeight/2+"px"
			});
			
			if ($(anchor).parents("figure").length){
				var title=$(anchor).parents("figure").find("figcaption").text();
			} else if ($(anchor).find("span").length){
				var title=$(anchor).find("span").text();
			} else if  ($(anchor).attr("title") !== "") {
				var title=$(anchor).attr("title");
			}
			
			if (!title) {
				$("#inlinetext").text("");
				$("#inlinetext").hide();
			}
			else  {
				$("#inlinetext").show();
				$("#inlinetext").text(title);
			}


			/*update sharing links*/

			var articleHeader = $("header").find("h1").text();
			var imId=$(anchor).parents("figure").attr("id");
			var fblink = fblinkGet(document.URL,articleHeader,imgPreload.src,title,imId,true);
			var twlink = twlinkGet(document.URL,articleHeader,imgPreload.src,title,imId,true);
			var vklink = vklinkGet(document.URL,articleHeader,imgPreload.src,title,imId,true);

			$(".slideshare .fb").attr("href",fblink);
			$(".slideshare .tw").attr("href",twlink);
			$(".slideshare .vk").attr("href",vklink);
			
			$(".spinner").hide();
		}
		imgPreload.src = $(anchor).attr(cattr);
	}
	
		
	function nextInlineFrame(direction){
		if (direction > 0) {
			if (typeof as[currentFrame+1] != 'undefined') {
				currentFrame++;
			}
			else {
				currentFrame=0;
			}
		} else {
			if (typeof as[currentFrame-1] != 'undefined') {
				currentFrame--;
			}
			else {
				currentFrame=as.length-1;
			}
		}
		showInlineFrame(as[currentFrame]);
	}
}

function sameHeight(){
	if ($(".photolist").length) {
		var containers = $(".photolist").find("li");
		var pocket=[];
		var maxheight = 0;
		var coll=1;
		for (var i=0; i<containers.length; i++){
			var cheight = $(containers[i]).height();
			if (cheight > maxheight) maxheight = cheight;
			pocket.push(i);

			if (i%3 == 2) {
				for (var j=0;j<pocket.length;j++){
					$(containers[pocket[j]]).css({'height': maxheight + 30 + 'px'});
				}
				pocket=[];
				maxheight = 0;
				coll++;
			}
		}
	}
}


function checkLastNewsID(){
	if (typeof lastNewsID == 'undefined') return;
	var query = {act: "lastNewsIDCheck", nid: lastNewsID};
	$.get( "/apphlp/updAjax.php", query ).done(function(data){
		var response = JSON.parse(data);
		if (response.diff == 0) return;
		$(".newsplash").text(response.diff).show();
	});
	
	var updNew = setTimeout(function(){checkLastNewsID()},20*1000);

}

function vote(vid){
	var objScript = document.getElementById ? document.getElementById("ajaxObj") : null;
	objScript.src="/apphlp/upd.php?act=pollaction&myvote="+vid+"&timestamp="+Math.random();
	return false;
}

function newsdatepicker(){

    $.datepicker.regional['uk'] = {
        closeText: 'Закрити', // set a close button text
        currentText: 'Сьогодні', // set today text
        monthNames: ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'], // set month names
        monthNamesShort: ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру'], // set short month names
        dayNames: ['Неділя','Понеділок','Вівторок','Середа','Четверг','П\'ятниця','Субота'], // set days names
        dayNamesShort: ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'], // set short day names
        dayNamesMin: ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'], // set more short days names
        dateFormat: 'yy/mm/dd',
        prevText: 'Назад',
        nextText: 'Вперед',
    };

    $.datepicker.setDefaults($.datepicker.regional['uk']);


	$('.datepicker').append('<div><input name="news-pick-date" type="hidden" id="news-pick-date" value=""/></div>');

	$('#news-pick-date').datepicker({
        showOn: "button",
        buttonImageOnly: true,
        buttonImage: "/js/datepicker/images/calendar.png",
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy/mm/dd',
        buttonText: "",
        minDate: new Date(2006,0,1),
        maxDate: 0,
        yearRange: "-20:+0",
        onSelect: function (date,inst) {
        	window.location = document.location.origin +'/archive/'+date;
        }
	})

}


$(document).ready(function(){

	if ($('#staticlike1').length) 
	{
		scrollMargin = $('#staticlike1').offset().top-$('#staticlike1').outerHeight()+160;
		$(window).scroll(function(){
			setScroll('#staticlike1',".readcol","#commentstart",-10,false);
			setScroll('#staticlike2',".lcolww", ".doublead",-10,false);
		});
	}

	$('.scrldesk').bind('mousewheel', function(e){
		e.stopPropagation();
		$('body').css('overflow','hidden');
	});

	sameHeight();
	colorBoxed();
	preloaDs();
	responsiveTricks();
	splashit();
	checkLastNewsID();
	putaj();
	newsdatepicker();

});

