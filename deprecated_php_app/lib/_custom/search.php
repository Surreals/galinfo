<?
function searchResults(){
	global $par,$lxs,$errors,$depot;
	$arr=array();
	if (!$par['q'] or strlen(trim($par['q']))<3){
		$arr['header']="<h1>".$depot['lxs']['he_noresults']."</h1>";
		$arr['info']="<h2>".$depot['lxs']['he_wrongquery']."</h2><br><br>".$depot['lxs']['he_shortq'];

		return parse_local($arr,'_search',1);
	}
	$word_array=explode(" ",trim($par['q']));
	$word_good=array();
	foreach($word_array as $word){
		$r=trim($word);
		if ($r !== '')  {
			$word_good[]=$r;
		}
		if (count($word_good)>5) break;
	}

	$plus_word='';
	foreach ($word_good as $k){
		$plus_word.="+*".$k."* ";
	}


	/*
	$sql1="
		SELECT		subnews.id,
					subnews.ndate,
					".NEWSB.".nheader,
					".NEWSB.".nteaser

		FROM		(
						SELECT	id,ndate
						FROM	".NEWS." 
						WHERE lang = \"".$depot['vars']['langid']."\" 
						AND approved = 1
					) AS subnews
			
		LEFT JOIN ".NEWSB."	
		USING		(id)
		WHERE	MATCH(".NEWSB.".nheader) AGAINST ('".sqller(trim($plus_word))."' IN BOOLEAN MODE)
		OR		MATCH(".NEWSB.".nteaser) AGAINST ('".sqller(trim($plus_word))."' IN BOOLEAN MODE)
		ORDER BY ndate DESC limit 10";*/
	
	
	
	/*LETS COUNT FIRST*/
	$cnt="
	
		SELECT COUNT(*) FROM ".NEWS." GETID
                RIGHT JOIN
                   ( SELECT GETBODY.id
                     FROM  ".NEWSI." AS GETBODY
                     WHERE MATCH(GETBODY.indexed)
                     AGAINST ('".sqller(trim($plus_word))."' IN BOOLEAN MODE)
                   ) AS SUBNEWS
                   USING (id)
                   WHERE  GETID.lang = \"".sqller($depot['vars']['langid'])."\"
				AND  GETID.approved = 1
	";
	$cnt=sqlquery($cnt);
	$count=mysql_fetch_row($cnt);
	if (!$count[0]){
		$arr['header']="<h1>".htmlspecialchars(addslashes($par['q']))."</h1>";
		$arr['info']="<br><br><h2>".$depot['lxs']['he_noresults']."</h2><br><br><br>".$depot['lxs']['he_tryagain'];

		return parse_local($arr,'_search',1);
	}


	if (!isset($par['pg']) && @$par['pg']==0)
	 @sqlquery("INSERT INTO ".SRCHS." SET srchword = \"".sqller(implode(' ',$word_good))."\"");
	

	list($from,$to,$pages) = pager_calc($depot['enviro']['qty_news_search'],10,$count[0]);
	//echo $from."/".$to."/".$pages;die();

	$path="/search/?q=".$par['q'];
	if ($to) $limit=" LIMIT $from,$to"; else  $limit='';
	$sql1="
				SELECT 
						MYBODY.id, 
						MYBODY.nteaser, 
						MYBODY.nheader, 

						BISUB.ndate,
						BISUB.ntype,
						BISUB.urlkey,
						BISUB.images,
						BISUB.photo,
						BISUB.ntime,
						BISUB.video

				FROM 
				(
					SELECT 
							".NEWS.".id, 
							".NEWS.".ndate,
							".NEWS.".ntype,
							".NEWS.".urlkey,
							".NEWS.".images,
							".NEWS.".photo,
							".NEWS.".video,
							".NEWS.".ntime

					FROM  ".NEWS."
					RIGHT JOIN
					   ( SELECT 
								GETBODY.id
						 FROM   
								".NEWSI." AS GETBODY
						 WHERE 
								MATCH(GETBODY.indexed)
								AGAINST ('".sqller(trim($plus_word))."' IN BOOLEAN MODE)
					   ) AS SUBNEWS
					   
					USING (id)
					WHERE  
						".NEWS.".lang = \"".sqller($depot['vars']['langid'])."\" 
					AND  
						".NEWS.".approved = 1
					
					ORDER BY  ".NEWS.".ndate DESC $limit

				) AS BISUB

				LEFT JOIN  ".NEWSHEAD." AS MYBODY
				USING (id)
	";


	$sql=sqlquery($sql1);


	$arr['header']="<h1>".htmlspecialchars(addslashes($par['q']))."</h1>";
	$arr['info']="<div class='sinfo'>".$depot['lxs']['he_newsfound'].": <b>".$count[0]."</b>"."<div class=\"clean pt20 devider\"></div></div>";


	while	($res=mysql_fetch_assoc($sql)){	
		$images=get_selected_images($res['images'],$depot['vars']['language']);

		
		$date_arr=explode('-',$res['ndate']);
		$time_arr=explode(':',$res['ntime']);

		$format_date="<time class='ordate'>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]} <br><b>{$time_arr[0]}:{$time_arr[1]}</b></time>";
		$format_date1="<time class='ordate'>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]} <b>{$time_arr[0]}:{$time_arr[1]}</b></time>";
		$headerdate="";

		$image="";
		if (count($images)) {
			$image.="<a href='".articleLink($res)."' class='phim'><img src='/media/gallery/tmb/".$images[0]['filename']."'";
			if (@$images[0]['title_'.$depot['vars']['language']]){
				$image.=" alt='".$images[0]['title_'.$depot['vars']['language']]."'";
			} else {
				$image.=" alt='news image'";
			}
			$image.=" /></a>";
			$headerdate=$format_date1;
		} else {
			$headerdate="";
			$image=$format_date;
		}
		
		$arr['article'][] = array (
									
							'link' => articleLink($res),
							'image'		=>	$image,
							'headerdate'=>	$headerdate,
							'headnews'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
							'teasnews'	=>	limit_text(getfromsql($res['nteaser'],$depot['vars']['language']),100),
							'comments'	=>	"",
							'mediaicon'	=>	mediaIcon($res)							
		);
		
	}
	$depot['vars']['title']=$depot['lxs']['he_search'].": ".htmlspecialchars(addslashes($par['q']));
	$arr['pager']=pager($path,$pages,10,array());
	return parse_local($arr,'_search',1);
}