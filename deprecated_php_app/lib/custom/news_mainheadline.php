<?

function mainheadline_fnc(){
	global $par,$depot;
	$html="";
	$placed=0;
	$currdate='crazy';
	$arr=array();
	$addon=$addon1=$addon2=$addon3='';
	$hd='';
	$all_news_link = $depot['vars']['language_link'];
	$key="udate";

	if (@$par['rubric_id']) {

		$addon=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);
		$all_news_link.=$par['rubric_id'].'/news/';
		$key="rubric";
		/*$depot['vars']['title']=$depot['lxs']['def_title_rubric']." — ".$depot['rubrics'][$par['rubric_id']]['title'].";  ".$depot['vars']['title'];*/

		$arr['rubricheader']=$depot['rubrics'][$par['rubric_id']]['title'];
	} else {
		$all_news_link.='news/';
	}

	if ($par['ns'] == 'listall') {
		list($from,$to,$pages) = pager_calc($depot['enviro']['news_qty_perpage'],10,300);
		if ($to) $limit=" LIMIT $from,$to";
		$pattern='headlineList';
		$filterNewsOnly="
			AND ntype < 21  /*blogs*/
			AND ntype <> 2	/*articles*/
		";
	} else {
		$qty=(isset($par['rubric_id']) && $par['rubric_id']) ? $depot['enviro']['news_qty_main_rubric'] : getNewsLimit();
		$limit="LIMIT ".$qty;
		$pattern='headlineMain';
		$filterNewsOnly=/*" AND ntype = 1 "*/"";
	}

	if ($par['ns']=='home' && !@$par['rubric_id']) $addon3 =" AND rated = 1 ";

	$sql_code="
		SELECT		".NEWS.".id,
					".NEWS.".ndate,
					".NEWS.".ntime, 
					".NEWS.".ntype,
					".NEWS.".images, 
					".NEWS.".urlkey, 
					".NEWS.".photo,
					".NEWS.".video,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nsubheader,
					".NEWS.".nweight,
					".NEWS.".comments,
					".NEWS.".printsubheader,
					".STATCOMM.".qty
		
		FROM ".NEWS." USE KEY($key)		
					/*(
						SELECT	id,
								ndate,
								ntime,
								nweight,
								images, 
								udate, 
								comments,
								ntype,
								printsubheader,
								urlkey,
								photo,
								video

						FROM	".NEWS." USE KEY ($key)
						WHERE lang = \"".$depot['vars']['langid']."\" 
						AND		{$depot['mysql_time_factor']} 
						AND approved = 1 
						".$filterNewsOnly.
						$addon.$addon1.$addon2.$addon3."
						ORDER BY udate DESC ". 
						$limit."
					) AS subnews*/

			
		LEFT JOIN	".NEWSHEAD." USE KEY (PRIMARY)
		USING		(id)

		LEFT JOIN	".STATCOMM." USE KEY (PRIMARY)
		USING		(id) 

		WHERE lang = \"".$depot['vars']['langid']."\" 
		AND		{$depot['mysql_time_factor']} 
		AND approved = 1 
		".$filterNewsOnly.
		$addon.$addon1.$addon2.$addon3."
		ORDER BY udate DESC ". 
		$limit."
	";
	

	$sql=sqlquery_cached($sql_code,5,1);

	$hd='';
	$banners=0;
	$ddate='';
	$real_curr_da=date('Y-m-d',$depot['vars']['ctime']);
	
	$fragment=1;
	$fragments=array();
	$count=1;

	foreach ($sql as $res){
		if (isset($depot['placed_news']) && in_array($res['id'],$depot['placed_news'])) continue;
		$placed++;
		if ($currdate != $res['ndate'] || $currdate == 'crazy') {

			$class=$currdate == 'crazy' ? ' firstday' : '';

			$currdate=$res['ndate'];
			list($year,$month,$date)=explode('-',$res['ndate']);
			$month1= $depot['lxs']["mona_".$month];

			$ddate="<header class=\"boxtitle$class\"><h6>".$depot['lxs']['news']."</h6> <time><span>$date</span> $month1</time></header>";
			
		} else {
			$ddate="";
		}
		
		if ($res['nweight']=='1') $class=" class=\"imp\""; 
		else if ($res['nweight']=='2') $class=" class=\"vimp\"";	else $class='';
		
		/*if (!($placed%$depot['enviro']['news_qty_banner']) && ($placed !== (int)($depot['enviro']['news_qty_main'])) && $par['ns'] !=='listall') {
			$banners++;
			$banner="<li>".getbanner('head'.$banners);
		} else {
			$banner='';
		}*/

		/*	INFO BEDGE	*/
		$infobedge=$comments=$mediaicons="";
		$comments=$res['qty'] ? "<em class=\"inline-ico commentstat\">{$res['qty']}</em>" : "";
		$mediaicons=mediaIcon($res);
		if ($comments || $mediaicons) $infobedge=$comments.$mediaicons;

		$arr['newsline'][]=array(
			'class'		=>	$class,
			'link'		=>	articleLink($res),
			'time'		=>	substr($res['ntime'],0,5),
			'header'	=>	/*$image.*/getfromsql($res['nheader'],$par['lng']),
			'banner'	=>	@$banner,
			'subheader'	=>	@$subheader,
			'infobedge'	=>	$infobedge,
			'date'		=>  $ddate
		);

		if ($par['ns'] !== 'listall') {
			if ($count >= $depot['environews']['fragment_'.$fragment]  || $placed == $qty ) {
				/*reset*/
				$count=1;
				if ($fragment == $depot['environews']['qty']  || $placed == $qty) {
					$preffix = isset($par['rubric_id']) ? $par['rubric_id'].'/' : '';
					$arr['morebutton']="<a href=\"/".$preffix."news/\" class=\"morebutton\">".$depot['lxs']['he_allnews']."</a>";
				}
				$fragment++;
				$fragments[]=parse_local($arr,$pattern,1);
				$arr=array();
			} else {
				$count++;
			}
		}
	}

	if (count($arr)) {
		$fragments[]=parse_local($arr,$pattern,1);
	}

	//print_r($fragments);

	if ($par['ns'] !=='listall') {
		$articles = articlesBlock(array($depot['environews']['qty'],2),true);
		$specialBlocks=newsCollection(	
			array(
			'qty'	=> $depot['environews']['qty']-1,
			'imageType' => 'intxt',
			'headers'	=> true,
			'extraConditions' => NEWS.".headlineblock = 1"	
		));
	
		$items=array();
		for ($i=0;$i<count($fragments);$i++) {
			if (isset($articles['items'][$i])) {
				$tpl="headlineArticle";
				if ($i==0) $tpl="headlineArticleMain";
				$articles['items'][$i]['id'] = $i+1;
				$article = parse_local($articles['items'][$i],$tpl,1);
			}

			if (isset($specialBlocks['items'][$i])) $special = parse_local($specialBlocks['items'][$i],'headlineSpecial'.$depot['environews']['block_'.($i+1)],1);
			else $special="";

			$items['item'][]=array(
				'headline'	=>	$fragments[$i],
				'article'	=>	@$article,
				'special'	=>	$special
			);
		}
		
		return parse_local($items,'headlineJoin',1);

	} else {
		$arr['container'] = pager($all_news_link,$pages,10,array());
		return parse_local($arr,$pattern,1);
	}

}


/*define total news */
function getNewsLimit(){
	global $depot;
	$total=0;
	for ($i=1;$i<=$depot['environews']['qty'];$i++){
		$total +=$depot['environews']['fragment_'.$i];
	}
	return $total;
}