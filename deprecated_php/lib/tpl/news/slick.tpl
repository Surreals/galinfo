<div class="big_slick_slider"  id="big_slick_slider<?=$gallery_id?>">
    <div class="slick_line" id="slider_line_<?=$gallery_id?>">
        <?php foreach($images as $i=>$image): ?>
        <div class="slick_line_item <?=$i==0?'slick-current':''?>">                
            <div class="img_item " style="background-image: url('/media/gallery/tmb/<?=$image['filename']?>')">
                <a style="display: none" href="/media/gallery/full/<?=$image['filename']?>"></a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <?php 
        if(isset($_GET['tp'])){
            var_dump($images);
        }
    ?>
    <div class="big_slides" id="slider_big_<?=$gallery_id?>">
        <?php foreach($images as $i=>$image): ?>
        <div class="slick_big_item <?=$i==0?'slick-current':''?>">
            <div class="slick_big_item_img">
                <figure class="inlineslide">
                    <a href="/media/gallery/full/<?php echo $image['filename']; ?>" class="inlinea">
                        <img src="/media/gallery/full/<?=$image['filename']?>" alt="<?=$image['title_ua']?>" title="<?=$image['title_ua']?>">
                    </a>
                    <figcaption>
                        <?=$image['title_ua']?>
                    </figcaption>
                </figure>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <div class="slider_count"><span>1</span>/<?=sizeof($images)?></div>

</div>
<script type="text/javascript">

    $(document).ready(function(){
    if ($('#inlineoverlay').length == 0){
    makeViewer($('.slick_line .slick_line_item'), '.slick_big_item_img img')
    }



    if ($('#big_slick_slider<?=$gallery_id?>').closest('article').length > 0){
    $('#big_slick_slider<?=$gallery_id?>').css('max-width', $('article').width() + 'px')
    }

    $('#slider_line_<?=$gallery_id?>').slick({
    infinite: true,
            slidesToShow: <?= $count_in_line?> ,
            slidesToScroll: 1,
            arrows:false,
            centerMode: <?= sizeof($images) > $count_in_line?'true':'false'?> ,
            focusOnSelect:true,
            accessibility:false,
            draggable:true,
            variableWidth:true,
            asNavFor:'#slider_big_<?=$gallery_id?>'
    });
    $('#slider_big_<?=$gallery_id?>').slick({
    adaptiveHeight:true,
            asNavFor:'#slider_line_<?=$gallery_id?>',
            fade:true,
            accessibility:false,
            prevArrow:'<div class="slick-prev slick-arrow"></div>',
            nextArrow:'<div class="slick-next slick-arrow"></div>',
    });
    $('#slider_big_<?=$gallery_id?>').on('afterChange', function(event, slick, currentSlide, nextSlide){
    $(this).closest('.big_slick_slider').find('.slider_count span').html(currentSlide + 1)
    })





    })
</script>