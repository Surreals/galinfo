<?

function get_listUni($dpar=array(NULL)){
	global $par,$depot;
	
	$articletype=$articlelink=$dpar[0];
	$needtop=true;
	$extraclass="";

	if (isset($dpar[1]) && $dpar[1]=='filterrubric') {
		$articlelink=$par['rubric_id'];
		$needtop=false;
	}

	$arr=array();
	$arr1=array();

	$imageObligateSql="";

	/*special template for photo section*/
	$tpl=	($articletype=="photo") ? "photoHomeList" : "analyticsHomeList";
	$limit=	($articletype=="photo") ? 42 : $depot['enviro']['qty_analytics_per_pa'];
	$imgsize=	($articletype=="photo") ? "intxt" : "tmb";
	if ($articletype=="photo") {
		$needtop=false;
		$imageObligateSql=" AND ".NEWS.".images <> '' ";
	}

	/* special class for video */
	if ($articletype=="video") {
		$extraclass=" videolist";
	}

	/* special qty for news */
	if ($articletype=="news") {
		$limit = 100;
		$tpl="newsSection";
		$needtop = false;
	}

	$path=$depot['vars']['language_link'];
	if (isset($par['rubric_id'])) {
		$addon = " AND FIND_IN_SET(\"".$depot['rubrics'][$par['rubric_id']]['id']."\",`rubric`)";
		$path.=$par['rubric_id'].'/';
		$hdadd=" / ".sqller($depot['rubrics'][$par['rubric_id']]['title']);
		$arr1['forfilters'] = sqller(mb_strtoupper($depot['rubrics'][$par['rubric_id']]['title'],"UTF-8"));
	} else {
			$addon="";
			$hdadd="";
	}
	
	$path.=$articlelink."/";

	if ((!isset($par['pg']) || $par['pg'] ==0) && $needtop) {
		require_once(dirname(__FILE__)."/../etc/stuffrare.php");
		$arr1['topNewsUniversal']=topNewsUniversal($articletype);
	}

	/*calculate qty*/
	$sql_count="
		SELECT	COUNT(*) as qty
		FROM		".NEWS." 
		WHERE	lang		=	\"".sqller($depot['vars']['langid'])."\"
		AND		approved	=	1
		AND		ntype		=	".$depot['article_keys'][$articletype]."
		$addon
		$imageObligateSql
	";
	$sql_count_run=sqlquery_cached($sql_count,100,1);
	$count=$sql_count_run[0];
	list($from,$to,$pages) = pager_calc($limit,10,$count['qty']);

	$sql="
		SELECT	".NEWS.".*,
				".NEWSHEAD.".nheader,
				".NEWSHEAD.".nteaser
		FROM		".NEWS." 
		LEFT JOIN	".NEWSHEAD." 
		USING	(id)
		WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
		AND		approved <> 0
		AND		ntype=".$depot['article_keys'][$articletype]."
		AND		{$depot['mysql_time_factor']}
		$addon
		$imageObligateSql
		ORDER BY udate DESC
	";
	
	if ($to) $sql.=" LIMIT $from,$to";

	$sql_run=sqlquery_cached($sql,100,1);

	if (!isset($par['pg']) || $par['pg']==0) {
		
		$get_mn=1;
	} else {
		$get_mn=0;
	}

	$counter=1;

	foreach ($sql_run as $res) {

		if (count(@$depot['excludenewsid'])) {
			if (in_array($res['id'],$depot['excludenewsid'])) continue;
		}
		
		/* Build using listhead, link,image,nheader,day,month,year,teaser,newslist*/
		//$link=str_replace("-",'/',$res['ndate']);
		$images=get_selected_images($res['images'],$depot['vars']['language']);

		
		$date_arr=explode('-',$res['ndate']);
		$time_arr=explode(':',$res['ntime']);

		$format_date="<em class='ordate'>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]}<br>{$date_arr[0]}<br><b>{$time_arr[0]}:{$time_arr[1]}</b></em>";
		$format_date1="<em class='ordate fl'>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]} {$date_arr[0]} <strong>{$time_arr[0]}:{$time_arr[1]}</strong></em>";

		$image="";
		if (count($images)) {
			$image.="<a href='".articleLink($res)."' class='phim'><img src='/media/gallery/".$imgsize."/".$images[0]['filename']."'";
			if (@$images[0]['title_'.$depot['vars']['language']]){
				$image.=" alt='".$images[0]['title_'.$depot['vars']['language']]."'";
			} else {
				$image.=" alt='news image'";
			}
			$image.=" /></a>";
			$realimage = $image;
			$headerdate=$format_date1;
		} else {
			$headerdate="";
			$image=$format_date;
			$realimage = "";
		}

		/*date devider*/
		if (!isset($datedevider) || $dev_date != $res['ndate']) {
			$datedevider = "<span class='datedevider'>".$date_arr[2]." ".$depot['lxs']['mona_'.$date_arr[1]]."</span>";
			$dev_date = $res['ndate'];
		} else {
			$datedevider = "";
		}
		
		/*$exclusive=($res['exclusive']) ? "<em title='Exclusive' class='exclusive'></em>" : "";*/

		if (!@$par['pg'] && $counter < 3 && $articletype != "photo" ) {
			$startclass=" class=\"startlist\""; 
		} else {
			$startclass="";
		}
		$arr['article'][] = array (
									
			'link' => articleLink($res),
			'image'		=> !$startclass ? $image : $format_date,
			'imagestart'=> $startclass && $headerdate ? $image : "",
			'headerdate'=>	$headerdate,
			'headnews'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
			'teasnews'	=>	limit_text(getfromsql($res['nteaser'],$depot['vars']['language']),100),
			'comments'	=>	$res['comments'] ? "<em class=\"commentstat\">{$res['comments']}</em>" : "",
			'mediaicon'	=>	mediaIcon($res),
			'startclass'=>	$startclass,
			'shortdate' =>	$date_arr[2].".".$date_arr[1],
			'realimage'	=>	$realimage,
			'time'		=>	$time_arr[0].":".$time_arr[1],
			'important' =>  $res['nweight'] > 0 ? " class='imp'" : "",
			'datedevider' => $datedevider
		);
		$counter++;
	}
	$arr['anaheader']	= $depot['lxs'][$articletype];
	if (isset($par['rubric_id'])) {
		$arr['anaheader'] .= ' / '.$depot['rubrics'][$par['rubric_id']]['title'];
	}
	$arr['extraclass'] = $extraclass;
	$arr1['analist'] = parse_local($arr,$tpl,1);

	if (@$dpar[1]!=='filterrubric')
	$arr1['pager'] = pager($path,$pages,10,array());
	return parse_local($arr1,"analyticsHome",1);
}