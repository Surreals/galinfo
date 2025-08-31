<?
function newsoday_fnc(){
	global $par,$errors,$oks,$gerrors,$depot,$lxs,$enviro;
	//variables to play with: link,image,day,month,year,header,teaser
	$addon="";
	$html="";
	
	if (@$par['rubric_id']) {	
		$addon=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);
		$sql= "	
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser,
					".NEWSSLIDEHEAD.".sheader,
					".NEWSSLIDEHEAD.".steaser

			FROM		".NEWS."     USE KEY (nweight)
			LEFT JOIN	".NEWSHEAD."	 USE KEY (PRIMARY)
			ON ".NEWS." .id = ".NEWSHEAD.".id

			LEFT JOIN	".NEWSSLIDEHEAD."	 USE KEY (PRIMARY)
			ON ".NEWS." .id = ".NEWSSLIDEHEAD.".id

			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		nweight=2
			AND		approved=1
			AND		{$depot['mysql_time_factor']} 
			$addon
			ORDER BY udate DESC
			LIMIT 4	
		";
	} else {
		$sql= "	
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser,
					".NEWSSLIDEHEAD.".sheader,
					".NEWSSLIDEHEAD.".steaser

			FROM		".NEWS."     USE KEY (PRIMARY)
			LEFT JOIN	".NEWSHEAD."	 USE KEY (PRIMARY)
			ON ".NEWS." .id = ".NEWSHEAD.".id

			LEFT JOIN	".NEWSSLIDEHEAD."	 USE KEY (PRIMARY)
			ON ".NEWS." .id = ".NEWSSLIDEHEAD.".id

			LEFT JOIN	".SPECIALIDS."
			ON ".NEWS.".id = ".SPECIALIDS.".newsid

			WHERE		".SPECIALIDS.".section	=	1
			AND			".SPECIALIDS.".newsid	<>	0
			AND		approved=1
			AND		{$depot['mysql_time_factor']} 
			ORDER BY	".SPECIALIDS.".id 

			LIMIT 4	
	
		";
	}
	
	/*REMOVED TIME FILTER*/
	/*AND ndate >= DATE(DATE_SUB(NOW(), INTERVAL 3 DAY))*/

	$sqlr= sqlquery_cached($sql,30,1);
	if (!count($sqlr)) return;
	
	$frameid=1;
	foreach ($sqlr as $res){

		$link=str_replace("-",'/',$res['ndate']);
		$images=get_selected_images($res['images'],$depot['vars']['language']);
		$image=$tmb='';
		$alttext='';
		
		if (count($images)) {
			$image.="<img src='/media/gallery/intxt/".$images[0]['filename']."'";
			$image.=" alt='".trim(htmlspecialchars(getfromsql($res['nheader'],$depot['vars']['language'])))."'";
			$alttext="title='".trim(htmlspecialchars(getfromsql($res['nheader'],$depot['vars']['language'])))."'";
			$image.=" />";

			$tmb="<img src='/media/gallery/tmb/".$images[0]['filename']."'>";
		}

		$link=articleLink($res);
		$slideTeaser = ($res['steaser']) ? $res['steaser'] : $res['nteaser'];
		$slideHeader = ($res['sheader']) ? $res['sheader'] : $res['nheader'];

		if (time() <  8*3600 + $res['udate']) {
			$time = date('H:i',$res['udate']);
		} else {
			list($y,$m,$d) = explode("-",$res['ndate']);
			//$time = $d."&nbsp;<i>".$depot['lxs']['mona_'.$m]."</i>";
			$time = $d."&nbsp;/&nbsp;<i>".$m."</i>";
		}

		$arr['image'][]=	array(	
			'frameid'	=>	$frameid,
			'link'		=>	$link,
			'image'		=>	$image,
			'imagefull'		=>	str_replace("/intxt/","/full/",$image),
			'tmb'		=>	$tmb,
			'alttext'	=>	$alttext,
			'header'	=>	getfromsql($slideHeader,$depot['vars']['language']),
			'teaser'	=>	limit_text(getfromsql($slideTeaser,$depot['vars']['language']), $depot['enviro']['qty_letter_headnews']),
			'hidden'	=>  ($frameid>1) ? '  style="display:none"' : '',
			'time'		=>	$time			
		);

		/*$arr['text'][]=	array(	
								'frameid'	=>	$frameid,
								'link'		=>	$link,
								'alttext'	=>	$alttext,
								'header'	=>	getfromsql($slideHeader,$depot['vars']['language']),
								'teaser'	=>	limit_text(getfromsql($slideTeaser,$depot['vars']['language']), $depot['enviro']['qty_letter_headnews']),
								'style'	=>  ($frameid>1) ? ' style="display:none"' : '',
								'exclusive'	=>	$exclusive
		);


		if (count($sqlr) > 1)
		$arr['tmb'][]=	array(	
								'frameid'	=>	$frameid,
								'link'		=>	$link,
								'image'		=>	$frameid,
								'alttext'	=>	$alttext,
								'class'	=>  ($frameid==1) ? ' class="active"' : '',
					
						
		);*/

		$frameid++;
	}

	$depot['vars']['topnews']=$arr;
	return parse_local($arr,'newsSlide',1);
}