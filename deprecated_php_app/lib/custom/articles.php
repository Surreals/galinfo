/*##################################################################################################################*/
<?
function get_analitics_main($res){
	global $par,$errors,$oks,$gerrors,$depot,$lxs;
	//variables to play with: link,image,day,month,year,header,teaser
	$addon='';
	$html="";

	$link=str_replace("-",'/',$res['ndate']);
	$images=get_selected_images($res['images'],$depot['vars']['language']);
	$image='';
	if (count($images)) {
		$image.="<img src='/media/gallery/intxt/".$images[0]['filename']."'";
		if (@$images[0]['title_'.$depot['vars']['language']]){
			$image.=" alt='".$images[0]['title_'.$depot['vars']['language']]."'";
			
		} 
		$image.=">";
	}
	$day=	substr($res['ndate'],-2,2);
	$month=	substr($res['ndate'],-5,2);
	$arr=array(	
				'headnews'	=>	'',
				'link'		=>	$depot['vars']['language_link']."news/".$res['id'].$depot['fext'],
				'image'		=>	$image,
				'day'		=>	$day,
				'month'		=>	$depot['lxs']['mona_'.$month],
				'year'		=>	substr($res['ndate'],0,4),
				'header'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
				'teaser'	=>	getfromsql($res['nteaser'],$depot['vars']['language'])
		
	);
	return parse_local($arr,'_newsoday');
}

/*##################################################################################################################*/

function get_analytics_menu($res){
	global $par,$lxs,$enviro,$errors,$language,$menu,$active_pars,$depot;
	$t=array();
	$class=(!(@$par['aid'])) ? "class=\"active\"" : "";
	$t['anal'][]=array(
						'class'		=>		$class,
						'link'		=>		$depot['vars']['language_link'].'analytics/',
						'caption'	=>		$depot['lxs']['he_allarts']
			);


	foreach ($res as $k1=>$k){
		if($k['param'] == @$par['aid']) {
			$class="class=\"active\"";
			$depot['vars']['title']=$k['title']." | ".$depot['vars']['title'];
		} else $class="";
		$t['anal'][]=array(
						'class'		=>		$class,
						'link'		=>		$depot['vars']['language_link'].'analytics/'.$k['param'].'/',
						'caption'	=>		$k['title']
			);
		
	}
	return parse_local($t,'_analmenu');

}

?>
