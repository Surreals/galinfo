/*zmolo.com gallery viewer v 23.03.12*/


var thumbsQty=0;
var tmbPerFrame=8;
var currentTmbFrame=0;
var tmbSize=0;
var currentImage=null;

$(document).ready(function(){
	
	tmbSize=parseInt($("#thumbstrip	li").css("width"));

	$('#thumbsholder').find('a').bind('click', function(event) {
		event.stopPropagation();
		changeMainPic(this); return false;
	});

	thumbsQty=$('#thumbsholder').find('a').length;


	$('.tmbmover').bind('click', function(event) {
			moveStrip(this); return false;
	});

	$("#thumbsholder").width($("#imagedocker").width());

	$("#thumbstrip").width(tmbSize*thumbsQty+'px');

	$("#imagetitle").width($("#imagedocker").width());

	$("#moveslideleft").fadeTo(200,0.3);

	$('#mainfixer').load(function() {
		$("#imageViewer").fadeIn(400);
		$("#navigateleft,#navigateright").height(
			$("#imageViewer").height()
		);

	});

	$("#navigateleft,#navigateright").fadeTo("slow",0.1);

	$("#navigateleft,#navigateright").bind('mouseenter',function(event){
			event.stopPropagation();
			$(this).fadeTo("fast",0.8);
	});

	$("#navigateleft,#navigateright").bind('mouseleave',function(event){
			event.stopPropagation();
			$(this).fadeTo("fast",0.8);
	});


	$("#imageViewer").hover(
		function(event){
			event.stopPropagation();
			$("#navigateleft,#navigateright").fadeTo("fast",0.8);
		},

		function(event){
			event.stopPropagation();
			$("#navigateleft,#navigateright").fadeTo("fast",0.1);
		}
		
	);


	$("#navigateleft,#navigateright").bind('click',function(event){
			navigateGallery($(this));
			return false;
	});


	currentImages=$('#thumbsholder').find('a');
	currentImage=$(currentImages[0]).attr('id');
	document.onkeydown = getKey;

});


function changeMainPic(activeOBJ){
	if (activeOBJ.className == 'active') return;
	
	

	imgPreload = new Image(); 
	//$("#backimage").fadeTo(0,0.7);
	imgPreload.onload=function(){
			
			//if ($('#imageViewer').css('display') !== 'none') {
			//	$("#imageViewer").fadeTo(400,0.01,function() {showGalleryBox(activeOBJ);});
			//}

			//$("#imageViewer").css({"backgroundImage":"url("+imgPreload.src+")"});
			$("#imageViewer").fadeTo(400,0.01,function() {
				
				showGalleryBox(activeOBJ,imgPreload.width,imgPreload.height);
				/*********************if (!$("#imageViewer").html()!=="")
					$("#imageViewer").html("");***/
				$(activeOBJ).addClass('active');
			}); 

			return false;
	}

	imgPreload.src = $(activeOBJ).attr("href");
	$("#imagetitle").html(
		$(activeOBJ).attr('title')	
	);
	currentImage=$(activeOBJ).attr("id");


	$("#currentimageID").html(currentImage.replace(/(\w+)_(\d+)/gi, '$2'));
	$("#imageViewer .phoqtyicon span").html(currentImage.replace(/(\w+)_(\d+)/gi, '$2'));

	centerStrip($(activeOBJ).attr("id"));

}


function moveStrip(objMover){
	var tmbFramesQty=parseInt(thumbsQty/tmbPerFrame);
	if (thumbsQty%tmbPerFrame) tmbFramesQty++;
	var moveTo=0;

	if (objMover.id == 'moveslideright') {
		if (currentTmbFrame >= (tmbFramesQty-1)) {
			$("#moveslideright").fadeTo(200,0.3);
			return false;
		}
		currentTmbFrame++;
		moveTo=(-1)*currentTmbFrame*tmbSize*tmbPerFrame+"px";
		
		
	} else if (objMover.id == 'moveslideleft'){
		if (currentTmbFrame ==0) return false;
		currentTmbFrame--;
		moveTo=(-1)*currentTmbFrame*tmbSize*tmbPerFrame+"px";
	}
	

	$("#thumbstrip").animate({marginLeft:moveTo},800,function(){
			if (currentTmbFrame >= (tmbFramesQty-1))	$("#moveslideright").fadeTo(200,0.3); else $("#moveslideright").fadeTo(200,1);
			if (currentTmbFrame ==0)					$("#moveslideleft").fadeTo(200,0.3); else $("#moveslideleft").fadeTo(200,1);
	});

}


function showGalleryBox(objLink,width,height){
	$('.listimage').removeClass("active");
	var viewWidth = $(".centercontent").width();
	
	/*
	FOR COVER SIZE

	height=height*viewWidth/width;
	width=viewWidth;
	*/
	width=viewWidth;


	$("#imageViewer").animate({/*"width":width+"px","height":height+"px"*/},200,function(){
			/*********************$("#imageViewer").css({"backgroundImage":"url("+$(objLink).attr('href')+")"});*/

			$("#mainfixer").attr("src",$(objLink).attr('href'));
			$("#imageViewer").fadeTo(200,1);
			$("#navigateleft,#navigateright").height($("#imageViewer").height());


	});

	
}


function navigateGallery(arrowObject){
	
	var gotoID=0;
	var currentID=currentImage.replace(/(\w+)_(\d+)/gi, '$2');

	if ($(arrowObject).attr('id')=='navigateleft') {
		if (currentID>1) gotoID=parseInt(currentID)-1; else gotoID=thumbsQty;
		
	} else  {
		if (currentID<(thumbsQty)) gotoID=parseInt(currentID)+1; else gotoID=1;
	}

	movetoid=currentImage.replace(/(\w+)_(\d+)$/gi, '$1_'+gotoID);
	changeMainPic($("#"+movetoid));
}


function centerStrip(avtiveId){

	var stripLength=thumbsQty*tmbSize;
	var currentPosition=currentImage.replace(/(\w+)_(\d+)$/gi, '$2');
	var newStripPosition=($('#thumbsholder').width()-tmbSize)/2-(currentPosition-1)*tmbSize;


	if (newStripPosition>0) newStripPosition=0;
	if (newStripPosition<$('#thumbsholder').width()-stripLength) {
		newStripPosition=$('#thumbsholder').width()-stripLength;
	}

	$("#thumbstrip").animate({marginLeft:newStripPosition+'px'},800);
}


function getKey(e){
	if (e == null) { // ie
		keycode = event.keyCode;
	} else { // mozilla
		keycode = e.which;
	}	
	key = String.fromCharCode(keycode).toLowerCase();

	if(keycode == 37){
		$("#navigateleft").click();
	}
	if(keycode == 39){ 
		$("#navigateright").click();
	}
}
