<?

function rubricBlock_fnc($rubric){
	global $depot;

	if (!isset($depot['rubrics'][$rubric]['id'])) return;
	$addon="
			AND	".NEWS.".ntype<=6
			AND	".NEWS.".rubric =	".$depot['rubrics'][$rubric]['id']."
			";

	$news=array();
	

	/*BLOCK NEWS*/
	$sql_query="
						
		SELECT 
			".NEWSHEAD.".id,
			".NEWSHEAD.".nheader,
			".NEWS.".ntype,
			".NEWS.".comments,
			".NEWS.".images,
			".NEWS.".urlkey,
			".NEWS.".udate,
			".NEWS.".ndate,
			".NEWS.".photo,
			".NEWS.".video,

			".STATCOMM.".qty

		FROM ".NEWS."  USE KEY (maininblock)
	
		LEFT JOIN ".NEWSHEAD."
		ON ".NEWS.".id = ".NEWSHEAD.".id

		LEFT JOIN	".STATCOMM."
		ON ".NEWS.".id = ".STATCOMM.".id
		WHERE	maininblock =1
		AND		approved=1
		AND		{$depot['mysql_time_factor']} 
		$addon
		ORDER BY udate DESC
		LIMIT 1
	";

	$sql=sqlquery_cached($sql_query, 120, 1);


	$exclude_id="";
	
	if (count($sql)){
		$res=$sql[0];
		$image="<img src='/media/tmb-default.jpg'>";
		if ($res['images'])	{
			$images=get_selected_images($res['images'],$depot['vars']['language']);
			if (count($images)) {
				$image="<img src='/media/gallery/intxt/".$images[0]['filename']."'>";
			}
		} 

		$news=array(
				'mainlink'	=>articleLink($res),
				'mainhead'	=>$res['nheader'],
				'mainimage'	=>$image,
				'maincommstat'=>$res['qty']?'<em class="commentstat">'.$res['qty']."</em>":"",
				'mediaicon'	=>	mediaIcon($res)				
		);

		$exclude_id=$res['id'];
	} else {
		return;
	}

	$news['title']="<a href=\"/{$rubric}/\">".$depot['rubrics'][$rubric]['title']."</a>";
	list($y,$m,$d) = explode('-', $res['ndate']);
	$news['date']="<b>$d</b> ".$depot['lxs']['mona_'.$m];

	/*THE REST OF SHIT*/
	if ($exclude_id) $addon.=" AND ".NEWS.".id <> $exclude_id ";
		
	$sql_query="
						
				SELECT 
					".NEWSHEAD.".id,
					".NEWSHEAD.".nheader,
					".NEWS.".ntype,
					".NEWS.".comments,
					".NEWS.".urlkey,
					".NEWS.".photo,
					".NEWS.".video,
					".STATCOMM.".qty

				FROM ".NEWS."  USE KEY (udate)
					
				LEFT JOIN ".NEWSHEAD."
				ON ".NEWS.".id = ".NEWSHEAD.".id

				LEFT JOIN	".STATCOMM."
				ON ".NEWS.".id = ".STATCOMM.".id

				WHERE	nweight >0
				AND		approved=1
				AND		{$depot['mysql_time_factor']} 
				$addon
			
				ORDER BY udate DESC
				LIMIT 2

	";
	$sql=sqlquery_cached($sql_query, 120, 1);

	$index=1;
	foreach ($sql as $v){
		$news['items'][]=array(

				'link'	=>articleLink($v),
				'head'	=>$v['nheader'],
				'commstat'=>$v['qty']?'<em class="commentstat">'.$v['qty']."</em>":"",
				'mediaicon'	=>	mediaIcon($v)
								
		);
		$index++;
		
	}
	return parse_local($news,'rubricBlock',1);
}
