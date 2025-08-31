<?




function get_mmenu(){
	global $depot,$a_pages,$lxs;
	
	/*$array = array (

					"analytics",
					"photo-video",
					"archive");	*/
	
	$array = array (

					"subject",
					"photo-video",
					"announce",
					"archive",);

	$ttop= "<ul>
		<li><a href='".$depot['language_link']."news/all/'>".$lxs['he_lastnews']."</a></li>
		<li><a href='".$depot['language_link']."region/lviv/'>".$lxs['lviv']."</a></li>
	";

	foreach ($array as $k){
		$idword =$depot['bypath'][$k];
		$ttop.="<li><a href='".$depot['language_link'].str_replace(",","/",$k)."/'>".$a_pages[$idword]['title']."</a></li>\n";
	}

	return $ttop."</ul>";
}


function get_mmenu1(){
	global $depot,$a_pages,$lxs;
	$array = array (

					"about",
					"commercial",
					);

	$ttop= "<ul class='rt'>";
	foreach ($array as $k){
		$idword =$depot['bypath'][$k];
		$ttop.="<li><a href='".$depot['language_link'].str_replace(",","/",$k)."/'>".$a_pages[$idword]['title']."</a></li>\n";
	}

	return $ttop."</ul>";
}


function getRubrics(){
	global $par,$depot;
	
	$rubric=array();
	$zclass='';
	

	if (!isset($depot['cats'])){

		$sql_str="
					SELECT * 
					FROM ".CATS." 
					WHERE lng = \"".$depot['vars']['langid'][$par['lng']]."\" 
					AND isvis=1
					AND cattype<>2
					ORDER BY orderid
					
					";


		$sql=sqlquery_cached($sql_str,1000,4);

		foreach ($sql as $res){
			$depot['cats'][$res['id']]=$res;
			$depot['catss'][$res['param'].$res['cattype']]=$res['id'];
		}
	}


	foreach ($depot['cats'] as $v){
		$class='';
		switch ($v['cattype']){
				
			case 1:
						if (isset($par['rubric_id']) && $par['rubric_id'] == $v['param'] && $par['rubric_id'] <>'0') $class=' class="active"';
						$rubric['items'][]=array(
										'link'		=>	$depot['vars']['language_link'].'rubric/'.$v['param'].'/',
										'class'		=>	$class,
										'caption'	=>	mb_strtoupper(getfromsql($v['title'],$par['lng']),"UTF8")
										);
						break;
		}
	}
	
	/*LAST ITEM*/
	$rubric['items'][(count($rubric['items'])-1)]['class']='  class="mr0"';


	return parse_local($rubric,'rubricmenu',1);

}


