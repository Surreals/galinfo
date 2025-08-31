<?

function galleryViewer($images){
	global $depot;
	if (!count($images)) return;
	$image_arr=array();

	$additional_images="";
	$default_title="";
	$i=0;
	foreach ($images as $im){
		$i++;
		$class="";
		if ($i==1){

			$mainimage = "<a href=\"/media/gallery/full/".$im['filename']."\" class=\"mainimage\" title=\"".htmlspecialchars($im['title_'.$depot['vars']['language']])."\"><img src=\"/media/gallery/full/".$im['filename']."\" alt=\"".htmlspecialchars($im['title_'.$depot['vars']['language']])."\" id='mainfixer'></a>";	
			$mainImagePlaced=true;
			$default_title=htmlspecialchars($im['title_'.$depot['vars']['language']]);
			$class=" active";

			
			$depot['vars']['ogimage']="<meta property=\"og:image\" content=\"http://".$_SERVER['HTTP_HOST']."/media/gallery/full/".$im['filename']."\" />";
			$ogimage=true;
						
		} 

		$additional_images.="<li><a href=\"/media/gallery/full/".$im['filename']."\"  rel=\"thumb\" id ='".$depot['vars']['language']."_$i'  title=\"".htmlspecialchars($im['title_'.$depot['vars']['language']])."\"  class='listimage$class' style=\"background-image:url('/media/gallery/tmb/".$im['filename']."')\"><img src=\"/media/gallery/tmb/".$im['filename']."\"></a></li>";
	}

	return  "
		<div id=\"gtool\">
			<div id=\"thumbsholder\">
				<ul id=\"thumbstrip\">
					".$additional_images."
				</ul>
			</div>
		</div>
		
		<div id=\"imageViewer\">
			<span class=\"phoqtyicon\"><span>1</span>/$i</span>
			$mainimage
			<a href='' id=\"navigateleft\"></a>
			<a href='' id=\"navigateright\"></a>
		</div>
		<div id=\"imagedocker\">
			<span id=\"imagetitle\">".$default_title."</span>
		</div>
		
		<script>
			$(document).ready(function(){
				makeViewer($(\"#thumbsholder\").find(\"li\"),\"#mainfixer\");
			});
		</script>
		<script type=\"text/javascript\" src=\"/js/spin.min.js\"></script>

		<div class=\"spacer\"></div>
	";
}