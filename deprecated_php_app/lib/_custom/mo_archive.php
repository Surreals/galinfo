<?
$depot['vars']['mod_result']=get_archive();


function get_archive(){
	global $par,$depot;
	$ttop="";
	$depot['vars']['title']=@$depot['lxs']['he_zik']." - ".@$depot['lxs']['he_archive'];
	$depot['vars']['description']=@$depot['lxs']['def_title']." ";
	return get_allarch();break;	
}

function get_archhome(){
	global $par,$depot;
	$ttop='';
	$ttop.="<h1>".$depot['lxs']['he_archive']."</h1>";
	$sql="SELECT YEAR(ndate) as nyear FROM ".NEWS." WHERE lang = \"".$depot['langs'][$par['lng']]['id']."\" GROUP BY nyear ORDER BY nyear DESC";
	$sql_run=sqlquery($sql);
	$cyear=date('Y',$depot['ctime']);
	while ($year = mysql_fetch_row($sql_run)){
		$ttop.="<h2 class=ln>".$year[0]."</h2><div>";
		if ($year[0] !== $cyear) $end=12; else $end=date('m',$depot['ctime']);
			for ($i=1;$i<=$end;$i++){
				$ttop.="<a href='/".$par['lng']."/archive/".$year[0]."/".sprintf('%02d',$i)."/' class=arch>".$depot['lxs']['mon_'.sprintf('%02d',$i)]."</a>";
				//$ttop.='mon_'.sprintf('%02d',$i);
			}
		$ttop.="</div>";
	}
	$arr['content'] = $ttop;
	$arr['content1'] = '';
	return parse_local($arr, 'commonPattern',1);
}


function get_allarch(){
	global $par,$depot;
	$ttop="";
	$arr=array();
	$addon='';
	$placed=0;
	$hdr='';

	if (!isset($par['ns']) || !$par['ns']){
	   $par['ns']=date("Y/m",time());
	}

	$currdate='FUCK';
	$all_news_link= array('lng'=>$par['lng'],'phtm'=>'archive');
	
	$next_index=0;



	/*now shoot*/
	$qry=explode('/',$par['ns']);
	/*	0		1		2		3			4		5		6		7		*/
	/*	2007	09		(24)	news | an				*/
	
	if (isset($qry[2])) {
		if (preg_match('/^(\d+)$/',$qry[2])){
			$date_addon=" AND ndate = '".$qry[0]."-".$qry[1]."-".$qry[2]."'";
			$next_index=3;
			list($year,$month,$day) = array($qry[0],$qry[1],$qry[2]);
			$all_news_link['year']=$qry[0];
			$all_news_link['month']=$qry[1];
			$all_news_link['day']=$qry[2];
		} else {
			$date_addon=" AND YEAR(ndate) = '".$qry[0]."' AND MONTH(ndate) = '".(int)($qry[1])."' ";
			$all_news_link['year']=$qry[0];
			$all_news_link['month']=$qry[1];
			$next_index=2;
		}
	} else {
		$date_addon=" AND YEAR(ndate) = '".$qry[0]."' AND MONTH(ndate) = '".(int)($qry[1])."' ";
		$all_news_link['year']=$qry[0];
		$all_news_link['month']=$qry[1];
		
	}

	/*FIX TITLE*/
	$dateTitle="";
	foreach (explode(" ","day month year") as $d){
		if(isset($all_news_link[$d])){
			if ($d=='month'){
				if (isset($all_news_link['day'])) $dateTitle.=" ".$depot['lxs']['mona_'.$all_news_link[$d]];
				else $dateTitle.=" ".$depot['lxs']['mon_'.$all_news_link[$d]];
			}
			else $dateTitle.=" ".$all_news_link[$d];
			
		}
	}
	$dateTitle.=" ".$depot['lxs']['year1'];
	$depot['vars']['title'].=" | ".$dateTitle;
	$depot['vars']['description'].=" ".$depot['lxs']['for']." ".$dateTitle;


	$header_h2 =$depot['lxs']['mon_'.$qry[1]]." ".$qry[0];
	$firstday=date('w',strtotime($qry[0]."-".$qry[1]."-01"));

	$daveska='';
	if ($next_index && isset($qry[$next_index])){

		switch ($qry[$next_index]) {
			case 'rubric':
			case 'region': 
						$val = (isset($qry[($next_index+1)])) ? $qry[($next_index+1)] : '';
						$filter=$qry[$next_index];
						$addon = " AND FIND_IN_SET(\"".$depot['catss'][$val.$filter]."\", ".NEWS.".$filter) ";
						$hdr.=" / ".$depot['cats'][$depot['catss'][$val.$filter]]['title'];
						$all_news_link['filter']=$filter;
						$all_news_link['value']=$val;
						$daveska= $qry[$next_index]."/".$val."/";
						break;
			case 'theme':
						$val = (isset($qry[($next_index+1)])) ? $qry[($next_index+1)] : 'all';
						$filter=$qry[$next_index];
						if ($val !== 'all'){
							$addon = " AND FIND_IN_SET(\"".$depot['catss'][$val.'theme']."\", ".NEWS.".theme) ";
							$hdr.=" / ".$depot['cats'][$depot['catss'][$val.'theme']]['title'];
							$daveska= $qry[$next_index]."/".$val."/";
						} else {
							$addon = " AND ".NEWS.".ntype  = '2'";
							$hdr.=" - ".$depot['lxs']['he_analytics'];
							$daveska= $qry[$next_index]."/";
						}
						$all_news_link['filter']=$filter;
						$all_news_link['value']=$val;
						break;
						
		}				
	}

	$try=$try_date=array();
	foreach (array('phtm','year','month','day','filter','value') as $pr){
		if (isset($all_news_link[$pr])) $try[]=$all_news_link[$pr];
	}

	foreach (array('year','month','day') as $pr){
		if (isset($all_news_link[$pr])) $try_date[]=$all_news_link[$pr];
	}

	$common_link=$depot['vars']['language_link'].implode('/',$try)."/";
	$common_date=implode('/',$try_date);

	/***********     RIGHT COLUMN **************/
	$haza=array();
	foreach ($depot['cats'] as $k=>$v){
			$haza[$v['cattype']][]=array($v['param'],getfromsql($v['title'],$par['lng']));
	}
	$topro=array('region','rubric','theme');


	/******** CALENDAR ***********/

	//YEAR
	$sql="SELECT YEAR(ndate) as nyear FROM ".NEWS." WHERE lang = \"".$depot['vars']['langid']."\" GROUP BY nyear ORDER BY nyear DESC";
	$sql_run=sqlquery($sql);

	$ttop1="
				
					<header class='accenttitle'>".$depot['lxs']['archivel']."</header>
					<div class='years holdup'><ul>";
	while ($year = mysql_fetch_row($sql_run)){
		if (!$year[0]) continue;
		if ($year[0] == $all_news_link['year']){
			$ttop1.="<li><span>".$year[0]."</span>";
		} else {
			$ttop1.="<li><a href='".$depot['vars']['language_link']."archive/".$year[0]."/".$all_news_link['month']."/$daveska'>".$year[0]."</a>";
		}
	}
	$ttop1.="</ul><span class='clean'></span></div>";

	$ttop1.="<div class='months holdup'><ul>";
	
	$curreantYear=(date("Y",$depot['vars']['ctime']) == $all_news_link['year']) ? true : false;
	$curreantMonth=date("m",$depot['vars']['ctime']);

	for ($i=1;$i<=12;$i++){

		if ($curreantYear && $i>(int)$curreantMonth) continue;

		if ($i == $all_news_link['month']){
			$ttop1.="<li><span>".$depot['lxs']['shortmo_'.sprintf('%02d',$i)]."</span>";
		} else {
			$ttop1.="<li><a href='".$depot['vars']['language_link']."archive/".$all_news_link['year']."/".sprintf('%02d',$i)."/$daveska'>".$depot['lxs']['shortmo_'.sprintf('%02d',$i)]."</a>";
		}

		
		//$ttop.='mon_'.sprintf('%02d',$i); 
	}									
	$ttop1.="</ul><div class='clean'></div></div>";

	$linnk = $depot['vars']['language_link']."archive/".$all_news_link['year']."/".$all_news_link['month']."/";

	if (isset($all_news_link['day'])) $activedate= $all_news_link['day']; else $activedate='';

	$ttop1.="<div class='spacer'></div><div class='holdup'>".monthCalendar($qry[0],$qry[1],$linnk,$daveska,$activedate)."<span class='clean'></span></div>";


	$path=$common_link;
	if (isset($par['rubric_id'])) {

		//echo sqller(@$styles[$par['rubric_id']]['id']);
		$addon = " AND FIND_IN_SET(\"".$depot['rubrics'][$par['rubric_id']]['id']."\",`rubric`)";
		$path.=$par['rubric_id'].'/';
		$hdadd=" / ".sqller($depot['rubrics'][$par['rubric_id']]['title']);
		$arr1['forfilters'] = sqller(mb_strtoupper($depot['rubrics'][$par['rubric_id']]['title'],"UTF-8"));
	} else {
			$addon="";
			$hdadd="";
	}
	
	/*$path.=$depot['vars']['language_link']."archive/";*/



	/*calculate qty*/
	/*$sql_count="
			SELECT	COUNT(*) as qty
			FROM		".NEWS." 
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)
			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved <> 0
			AND		ntype <>6
			AND		{$depot['mysql_time_factor']}
			$date_addon
			$addon";
	$sql_count_run=sqlquery_cached($sql_count,100,1);
	$count=$sql_count_run[0];*/
	$from = 0;
	$to = $depot['enviro']['qty_analytics_per_pa'];

	if (isset($par['pg']) && $par['pg']) {
		$from = $par['pg'] * $depot['enviro']['qty_analytics_per_pa'];
		$to = $depot['enviro']['qty_analytics_per_pa'];
	}
	$sql="
			SELECT	SQL_CALC_FOUND_ROWS
					".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser
			FROM		".NEWS." 
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)
			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		approved <> 0
			AND		ntype <>6
			AND		{$depot['mysql_time_factor']}
			$date_addon
			$addon
			ORDER BY udate DESC";
	
	if (@$to) $sql.=" LIMIT $from,$to";
	$sql_run=sqlquery($sql);

	$count=mysql_fetch_row(sqlquery("SELECT FOUND_ROWS()"));
	list($from,$to,$pages) = pager_calc($depot['enviro']['qty_analytics_per_pa'],10,$count[0]);

	if (!isset($par['pg']) || $par['pg']==0) {
		
		$get_mn=1;
	} else {
		$get_mn=0;
	}
	
	while ($res = mysql_fetch_assoc($sql_run)) {
		
		/* Build using listhead, link,image,nheader,day,month,year,teaser,newslist*/
		//$link=str_replace("-",'/',$res['ndate']);
		$images=get_selected_images($res['images'],$depot['vars']['language']);
		
		$date_arr=explode('-',$res['ndate']);
		$time_arr=explode(':',$res['ntime']);

		$format_date="<em class='ordate'>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]} {$date_arr[0]}<br><b>{$time_arr[0]}:{$time_arr[1]}</b></em>";
		$format_date1="<em class='ordate'>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]} {$date_arr[0]} <b>{$time_arr[0]}:{$time_arr[1]}</b></em>";

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
		

		$arr['article'][] = array (
									
							'link' => articleLink($res),
							'image'		=>	$image,
							'headerdate'=>	$headerdate,
							'headnews'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
							'teasnews'	=>	limit_text(getfromsql($res['nteaser'],$depot['vars']['language']),170),
							'comments'	=>	$res['comments'] ? "<em class=\"commentstat\">{$res['comments']}</em>" : "",
							'mediaicon'	=>	mediaIcon($res)
		);
	}

	if (!count(@$arr['article'])) $arr['message']="<h2><br><br>".$depot['lxs']['noarticles_archive']."</h2>";
	$ttop.=parse_local($arr,'archiveList',1).pager($path,$pages,10,array());

	$arr1=array('content' => $ttop,'aside' => "<aside class='foldbottom'>".$ttop1."</aside>");
	return parse_local($arr1, 'commonPattern',1);
}