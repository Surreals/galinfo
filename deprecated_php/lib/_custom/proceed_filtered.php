<?


/**
 *	Filters articles by different parameters
 */

function get_listFiltered($dpar=array(NULL)){
	global $par,$depot;

	$articletype=$dpar[0];
	$arr=array();
	$addon="";
	$hdadd="";

	if (isset($par['filter_id']))
		$path=$depot['vars']['language_link'].$par['filterNews']."/".$par['filter_id']."/";
	else 
		$path=$depot['vars']['language_link'].$par['filterNews']."/";

	
	
	if (!isset($par['pg']) || $par['pg'] ==0) {
		if ($par['filterNews'] != 'editor')
			$arr['topNewsUniversal']=topNewsFiltered();
		else {
			LLoad('stuffrare');
			$arr['topNewsUniversal']=bloggerProfile($par['filter_id']);
		}

	}

	if (count(@$depot['excludenewsid'])) {
		$addon.=" AND ".NEWS.".id NOT IN(".implode(',',$depot['excludenewsid']).")";
	}


	/*calculate qty*/
	$sql_count=filterArticlesSQLcount($addon);		
	$sql_count_run=sqlquery_cached($sql_count,100,1);
	$count=$sql_count_run[0];
	list($from,$to,$pages) = pager_calc($depot['enviro']['qty_analytics_per_pa'],10,$count['qty']);
	
	$sql=filterArticlesSQLrun($addon,$from,$to);


	$sql_run=sqlquery_cached($sql,100,1);

	$get_mn=(!isset($par['pg']) || $par['pg']==0) ? 1 : 0;
		
	$themeTitle='';

	foreach ($sql_run as $res) {
		
		/* Build using listhead, link,image,nheader,day,month,year,teaser,newslist*/
		//$link=str_replace("-",'/',$res['ndate']);
		$images=get_selected_images($res['images'],$depot['vars']['language']);
		
		$date_arr=explode('-',$res['ndate']);
		$time_arr=explode(':',$res['ntime']);

		$format_date="<em class='ordate'>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]}<br>{$date_arr[0]}<br><b>{$time_arr[0]}:{$time_arr[1]}</b></em>";
		$format_date1="<em class='ordate fl'>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]} {$date_arr[0]} <strong>{$time_arr[0]}:{$time_arr[1]}</strong></em>";
		$headerdate="";

		$image="";
		if (count($images)) {
			$image.="<a href='".articleLink($res)."'><img src='/media/gallery/intxt/".$images[0]['filename']."'";
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

		$exclusive=/*($res['exclusive']) ? "<em title='Exclusive' class='exclusive'></em>" : */"";

		$arr['article'][] = array (
									
			'link'		=>	articleLink($res),
			'image'		=>	$image,
			'headerdate'=>	$headerdate,
			'headnews'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
			'teasnews'	=>	getfromsql($res['nteaser'],$depot['vars']['language']),
			'comments'	=>	$res['comments'] ? "<em class=\"commentstat\">{$res['comments']}</em>" : ""
		);

		if (!$themeTitle) $themeTitle=@$res['ttitle'];
	}

	$fortitle = ($par['filterNews']=='topthemes') ? $themeTitle : @$par["filter_id"];

	if ($par['filterNews'] == 'editor'){
		$sql_t=sqlquery("SELECT name FROM ".FUSERS." WHERE id = \"".sqller($par['filter_id'])."\"");
		if (!mysql_num_rows($sql_t)) err404();
		$sql_t_res=mysql_fetch_row($sql_t);
		$fortitle=$sql_t_res[0];

	}

	if ($par['filterNews'] == 'region'){
		$arr['anaheader']= $depot['regions'][$par['filter_id']]['title'];
		$fortitle=$depot['lxs']['news']." - ".$arr['anaheader'];
	}

	if (!isset($arr['anaheader']))
		$arr['anaheader']=@$depot['lxs'][$par['filterNews']];

	$arr1=array_merge($arr,
		array(	
			'analist'	=>	parse_local($arr,'analyticsHomeList',1),
			'pager'		=>	pager($path,$pages,10,array()),
			'forfilters'=>	$fortitle
		)
	);
	
	if ($fortitle) $fortitle=$fortitle." - ";

	$depot['vars']['title']=$fortitle.@$depot['lxs'][$par['filterNews']]."  ".(@$par['pg']>0?(" - ".$depot['lxs']['page']." ".($par['pg']+1)):"");
	$depot['vars']['description'].=" ".$fortitle." ".@$depot['lxs'][$par['filterNews']]."  ".(@$par['pg']>0?(" ".$depot['lxs']['page']." ".($par['pg']+1)):"");

	return parse_local($arr1,'analyticsHome',1);
}



function filterArticlesSQLcount($addon){
	global $par,$depot;

	switch($par['filterNews']){
		case "election" :		$quickfilter=" AND ".NEWS.".election = 1"; break;
		case "pressrelease" :	$quickfilter=" AND ".NEWS.".pressrelease = 1"; break;
	}

	if ($par['filterNews']=='topthemes'){

		return "
			SELECT	COUNT(*) as qty
			FROM ".NEWS."
			LEFT JOIN ".CATS." 
			ON	".NEWS.".theme = ".CATS.".id 
			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved <> 0
			AND		{$depot['mysql_time_factor']}
			AND		".CATS." .id IS NOT NULL
			AND		cattype=2 
			AND param = \"".sqller($par['filter_id'])."\"
			$addon
		";
		
	} else if ($par['filterNews']=='tags'){
		
		return "
			SELECT	COUNT(*) as qty
			FROM		".NEWS." 

			LEFT JOIN
				(
					SELECT ".TAGMAP.".newsid
					FROM 
					".TAGMAP." LEFT JOIN  ".TAGS." 
					ON tagid = id	
					WHERE tag = \"".sqller($par['filter_id'])."\"
				) AS SUBTAG
			ON
				".NEWS.".id = SUBTAG.newsid 

			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved <> 0
			AND		{$depot['mysql_time_factor']}
			AND		SUBTAG.newsid IS NOT NULL

			$addon

		";
	} else if ($par['filterNews']=='editor'){
		return "
			SELECT	COUNT(*) as qty
			FROM		".NEWS." 

			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved <> 0
			AND		{$depot['mysql_time_factor']}
			AND		userid = \"".sqller($par['filter_id'])."\"

			$addon

		";
	} else if (	
				$par['filterNews'] == "election" ||
				$par['filterNews'] == "pressrelease"
			){
			
			return "
			SELECT	COUNT(*) as qty
			FROM		".NEWS." 

			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved <> 0
			AND		{$depot['mysql_time_factor']}
			$quickfilter
			$addon

		";
	} else if ($par['filterNews']=='region'){

		if (!isset($depot['regions'][$par['filter_id']]['id'])) err404();
		return "
			SELECT	COUNT(*) as qty
			FROM	".NEWS."
			WHERE	FIND_IN_SET(".$depot['regions'][$par['filter_id']]['id'].",".NEWS.".region) 
			/*
			lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved <> 0
			AND		{$depot['mysql_time_factor']}
			AND		
			*/
		";
		
	} 
}


function filterArticlesSQLrun($addon,$from,$to){
	global $par,$depot;

	$limit=($to) ? "LIMIT $from,$to" : "";

	switch($par['filterNews']){
		case "election" :		$quickfilter=" AND ".NEWS.".election = 1"; break;
		case "pressrelease" :	$quickfilter=" AND ".NEWS.".pressrelease = 1"; break;
	}


	if ($par['filterNews']=='topthemes'){

		return "
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser,
					".CATS.".title as ttitle,
					".CATS.".param

			FROM		".NEWS." USE KEY(theme)
			LEFT JOIN	".CATS." USE KEY(uniq)
			ON ".NEWS.".theme = ".CATS.".id 

			LEFT JOIN	".NEWSHEAD." 
			ON	".NEWS.".id = ".NEWSHEAD.".id

			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"

			AND		approved <> 0
			AND		{$depot['mysql_time_factor']}
			AND		".CATS.".id IS NOT NULL
			AND		cattype=2 AND param = \"".sqller($par['filter_id'])."\"
			
			$addon
			ORDER BY udate DESC
			$limit
			
			";
		
	} else if ($par['filterNews']=='tags'){
		
		return "
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser

			FROM		".NEWS." 
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)

			LEFT JOIN
				(
					SELECT ".TAGMAP.".newsid
					FROM 
					".TAGMAP." LEFT JOIN  ".TAGS." 
					ON tagid = id	
					WHERE tag = \"".sqller($par['filter_id'])."\"
				) AS SUBTAG
			
			ON
				".NEWS.".id = SUBTAG.newsid 

			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"

			AND		approved <> 0
			AND		{$depot['mysql_time_factor']}
			AND		SUBTAG.newsid IS NOT NULL
			
			$addon
			ORDER BY udate DESC
			$limit
		";
	} else if ($par['filterNews']=='editor'){
		
		return "
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser

			FROM		".NEWS." 
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)


			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved <> 0
			AND		{$depot['mysql_time_factor']}
			AND		userid = \"".sqller($par['filter_id'])."\"
			$addon
			ORDER BY udate DESC
			$limit
		";
	
	}
	else if (	
				$par['filterNews'] == "election" ||
				$par['filterNews'] == "pressrelease"
			){
		
		return "
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser

			FROM		".NEWS." 
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)


			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved = 1
			AND		{$depot['mysql_time_factor']}
			$addon
			$quickfilter
			ORDER BY udate DESC
			$limit
		";
	
	} else if ($par['filterNews']=='region'){

		if (!isset($depot['regions'][$par['filter_id']]['id'])) err404();
		return "
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser

			FROM		".NEWS." USE KEY(nweight)
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)

			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved = 1
			AND		{$depot['mysql_time_factor']}
			AND		FIND_IN_SET(".$depot['regions'][$par['filter_id']]['id'].",".NEWS.".region) 
			$addon
			
			ORDER BY udate DESC
			$limit";
	}
}



function topNewsFiltered(){
	global $par,$depot;
	//variables to play with: link,image,day,month,year,header,teaser
	$addon="";
	$ttop="";
	
	$quickfilter="";
	switch($par['filterNews']){
		case "election" :		$quickfilter=" AND ".NEWS.".election = 1"; break;
		case "pressrelease" :	$quickfilter=" AND ".NEWS.".pressrelease = 1"; break;
	}

	if ($par['filterNews'] == "topthemes")
		$sql= "	

			SELECT	".NEWS.".*,
				".NEWSHEAD.".nheader,
				".NEWSHEAD.".nteaser,
				".CATS.".title as ttitle,
				".CATS.".param

			FROM		".NEWS." USE KEY(theme)
			LEFT JOIN	".CATS." USE KEY(uniq)
			ON ".NEWS.".theme = ".CATS.".id 

			LEFT JOIN	".NEWSHEAD." 
			ON	".NEWS.".id = ".NEWSHEAD.".id

			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"

			AND		approved = 1
			AND		nweight>=2
			AND		{$depot['mysql_time_factor']}
			AND		".CATS.".id IS NOT NULL
			AND		cattype=2 AND param = \"".sqller($par['filter_id'])."\"
			
			$addon
			ORDER BY udate DESC
			limit 1
		";

	else if ($par['filterNews'] == "tags")
		$sql= "	
				SELECT	".NEWS.".*,
						".NEWSHEAD.".nheader,
						".NEWSHEAD.".nteaser
				FROM		".NEWS." 
				LEFT JOIN	".NEWSHEAD." 
				USING	(id)


				LEFT JOIN
					(
						SELECT ".TAGMAP.".newsid
						FROM 
						".TAGMAP." LEFT JOIN  ".TAGS." 
						ON tagid = id	
						WHERE tag = \"".sqller($par['filter_id'])."\"
					) AS SUBTAG
				ON
					".NEWS.".id = SUBTAG.newsid 

				WHERE	lang = \"".sqller($depot['vars']['langid'])."\"

				AND		approved = 1
				AND		{$depot['mysql_time_factor']}
				AND		SUBTAG.newsid IS NOT NULL
				AND		images <> ''
				$addon
				ORDER BY udate DESC
				LIMIT 1	
			";
	else if (	
				$par['filterNews'] == "election" ||
				$par['filterNews'] == "pressrelease"
			)
		$sql= "	
				SELECT	".NEWS.".*,
						".NEWSHEAD.".nheader,
						".NEWSHEAD.".nteaser
				FROM		".NEWS." 
				LEFT JOIN	".NEWSHEAD." 
				USING	(id)
				WHERE	lang = \"".sqller($depot['vars']['langid'])."\"

				AND		approved <> 0
				AND		{$depot['mysql_time_factor']}
				$quickfilter		
				$addon
				ORDER BY udate DESC
				LIMIT 1	
			";

	else if ($par['filterNews']=='region') {

		if (!isset($depot['regions'][$par['filter_id']]['id'])) err404();
		$sql=  "
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser

			FROM		".NEWS." USE KEY(nweight)
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)

			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved =1
			AND		nweight > 1
			AND		{$depot['mysql_time_factor']}
			AND		FIND_IN_SET(".$depot['regions'][$par['filter_id']]['id'].",".NEWS.".region) 
			$addon
			ORDER BY udate DESC
			LIMIT 1	";
	}

	
	$sqlr= sqlquery_cached($sql,100,1);
	if (!count($sqlr)) return;
	
	$frameid=1;
	foreach ($sqlr as $res){

		$depot['excludenewsid'][]=$res['id'];

		$link=str_replace("-",'/',$res['ndate']);
		$images=get_selected_images($res['images'],$depot['vars']['language']);
		$image='';
		$alttext='';
		
		if (count($images)) {
			$image.="<img src='/media/gallery/full/".$images[0]['filename']."'";
			$image.=" alt='".trim(htmlspecialchars(getfromsql($res['nheader'],$depot['vars']['language'])))."'";
			$alttext="title='".trim(htmlspecialchars(getfromsql($res['nheader'],$depot['vars']['language'])))."'";
			$image.=" />";

			//$image="background:url(/media/gallery/intxt/".$images[0]['filename'].") center center no-repeat;";

		}
		$day=	substr($res['ndate'],-2,2);
		$month=	substr($res['ndate'],-5,2);

		$link= articleLink($res);

		$addclass='';
		if ($frameid == 1) $addclass=" cleft";
		if ($frameid == 3) $addclass=" cright";
		
		$exclusive=/*($res['exclusive']) ? "<em title='Exclusive' class='exclusive'></em>" : */"";

		$arr['item'][]=array(
								'addclass'		=>	$addclass,	
								'image'		=>	$image,	
								'link'		=>	$link,
								'alttext'	=>	$alttext, 
								'header'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
								'teaser'	=>	limit_text(getfromsql($res['nteaser'],$depot['vars']['language']),300)		
		);


		$frameid++;
	}
	if ($image)
		return parse_local($arr,'topNewsUniversal', 1);
	else return parse_local($arr,'topNewsUniversalNoImage', 1);
}