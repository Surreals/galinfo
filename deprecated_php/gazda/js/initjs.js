jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", ( $(document).height() - this.height() ) / 2+$(document).scrollTop() + "px");
    this.css("left", ( $(document).width() - this.width() ) / 2+$(document).scrollLeft() + "px");
    return this;
}

function centerModals(){

	if ($(".centerme").length>0)
	{
		$(".centerme").center();
	}

	$(".smart").find('tr').hover(
		function(){
			if ($(this).children("td:first").hasClass('heaad') ||
				$(this).children("td:first").hasClass('nosmart')) return;
			
			$(this).find("td").css({backgroundColor:"#FFE6E7 !important"});
		},
	
		function(){
			$(this).find("td").css({backgroundColor:""});
		}
	);

	$( ".haspicker" ).each(function(){
		var defDate;
		if ($(this).attr("rel")) {
			defDate=$(this).attr("rel");
		}


		$(this).datepicker({dateFormat: "dd.mm.yy", defaultDate: defDate});
	});
	$(".needtimepicker").timepicker({timeFormat: 'HH:mm',stepMinute: 5});

}


function simpleCK(editor,theight){
	if (!theight) theight=200;
	CKEDITOR.replace(editor,
	{
		toolbar :
		[
			{ name: 'basicstyles', items : [  'Source','Bold','Italic','NumberedList','BulletedList','Link' ] },
			{ name: 'tools', items : [ 'Maximize'] }
		],
		height:theight+"px"
	});
}


function countTitle() {

	if($('textarea[name=nheader]').length) {
        var text_count = $('textarea[name=nheader]').val().length;
    }else{
        var text_count = 0;
	}

    if($('select[name="region[]"] option:selected').length){
    	var text_region = $('select[name="region[]"] option:selected').data('description').length;
    }else{
        var text_region = 0;
	}
    var count = text_region + text_count;
    var span = $('label[for=nheader]').find('span');
    span.text(count);
    if(count > 70){
        span.removeClass('green');
        span.addClass('red');
	}else{
        span.removeClass('red');
        span.addClass('green');
	}
}

function countDescription() {
	if($('textarea[name=nteaser]').length) {
        var count = $('textarea[name=nteaser]').val().length;
    }else{
        var count = 0;
	}

    var span = $('label[for=nteaser]').find('span');
    span.text(count);
    if(count > 120){
        span.removeClass('green');
        span.addClass('red');
    }else{
        span.removeClass('red');
        span.addClass('green');
    }

}

var myDropzone;


$(document).ready(function(){

	countTitle();
	countDescription();

	$('textarea[name=nheader]').on('keyup',function () {
        countTitle();
    });
    $('select[name="region[]"]').on('change',function () {
        countTitle();
    })

    $('textarea[name=nteaser]').on('keyup',function () {
        countDescription();
    });

	centerModals();
	myDropzone = new Dropzone('.dropzonezml');
	$('.bulkuploadbutton').on('click', function(){
		myDropzone.processQueue();
	});
});