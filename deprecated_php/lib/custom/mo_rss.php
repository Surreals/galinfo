<?
$depot['vars']['mod_result']=get_rss();


function get_rss(){
	global $par,$depot;
	$ttop="";
	if (!isset($par['ns'])) $par['ns']='home';
	switch ($par['ns']){
		case 'home'		:	$ttop.=get_rsshome();break;
		case 'all'		:		
		case 'rubric'	:	
		case 'theme'	:
		case 'region'	:	$ttop.=get_allnews();break;	
		//case 'ukrnet'	:	$ttop.=get_full('full');break;
		case 'ukrnet'	:	$ttop.=get_for_region(99,'yandex');break;
		case 'yandex'	:	$ttop.=get_full('yandex');break;
		
		case 'sitemap_full'	:	
		case 'sitemap'	:	$ttop.=get_sitemap();break;

		case 'googlenews'	:	$ttop.=get_googlenews();break;
	}
	return  $ttop;

}

function get_rsshome(){
	global $par,$depot;
	$ttop='';
	$ttop.="<h1>".$depot['lxs']['he_rssexp']."</h1>";
	
	$ttop.="<h2 class=ln>".$depot['lxs']['he_allnews']."</h2>";
	$ttop.="<b class=rss>".$depot['lxs']['he_lastnews']."</b>";
	$ttop.="<a href='".$depot['vars']['language_link']."rss/export.xml' class=rssl>https://".$_SERVER['HTTP_HOST']."/".$par['lng']."/rss/export.xml</a>";
	
	$haza=array();
	if (is_array(@$depot['cats'])){
		foreach ($depot['cats'] as $k=>$v){
				$haza[$v['cattype']][]=array($v['param'],getfromsql($v['title'],$par['lng']));
		}
	}

	$topro=array('region','rubric','theme');
	foreach ($topro as $ct){
		if (isset($haza[$ct])){

			$ttop.="<h2 class=ln>".$depot['lxs']['he_rss'.$ct]."</h2>";
			//add all for theme
			if ($ct == 'theme') {
				array_unshift($haza[$ct],array('all',$depot['lxs']['he_allnews']));
			}
			foreach ($haza[$ct] as $k=>$v){
				$ttop.="<b class=rss>".$v[1]."</b>";
				$ttop.="<a href='".$depot['vars']['language_link']."rss/".$ct."/".$v[0].".xml' class=rssl>https://".$_SERVER['HTTP_HOST']."/".$depot['vars']['language_link']."rss/".$ct."/".$v[0].".xml</a>";
			}
		}
	}

	$arr['content'] = $ttop;
	$arr['content1'] = '';
	return parse_local($arr, '_commonwide');
}

/*			MAIN HEADLINE.	*/
function get_allnews(){
	global $par,$errors,$oks,$gerrors,$depot,$lxs,$enviro;
	$ttop="";
	$placed=0;
	$currdate='crazy';
	$arr=array();
	$addon=$addon1=$addon2='';
	$hd='';

	$arr['rsstitle']='';
	if (@$par['rubric_id']) {
		$addon = " AND FIND_IN_SET(\"".$depot['catss'][$par['rubric_id'].'rubric']."\", ".NEWS.".rubric) ";
		$arr['rsstitle']=" - ".$depot['cats'][$depot['catss'][$par['rubric_id'].'rubric']]['title'];
	}


	$sql1="
			SELECT		subnews.id,
						subnews.ndate,
						subnews.ntime,
						subnews.rubric,
						subnews.ntype,
						subnews.urlkey,
						
						".NEWSHEAD.".nheader,
						".NEWSHEAD.".nteaser

			FROM		(
							SELECT	id,ndate,ntime,rubric,udate,ntype,urlkey
							FROM	".NEWS."   USE KEY (udate, id, lang, approved)
							WHERE lang = \"".$depot['vars']['langid']."\" 

							AND approved = 1 AND hiderss=0 
							AND		{$depot['mysql_time_factor']} ".
							$addon.$addon1.$addon2."
							ORDER BY udate DESC 
							LIMIT 20
						) AS subnews
				
			LEFT JOIN	".NEWSHEAD."  USE KEY (PRIMARY)
			USING		(id)
			ORDER BY	udate DESC";


	/*$sql=sqlquery($sql1);*/
	$sql=sqlquery_cached($sql1,200,1);


	/*while ($res = conn_fetch_assoc($sql)){*/
	foreach ($sql as $res){
		$tmstmp =strtotime($res['ndate']." ".$res['ntime']);
		$date=date('D, d M Y H:i:s O',$tmstmp);
		list ($year, $month, $day) = explode('-',$res['ndate']);
		$rbs=explode(',',$res['rubric']);
		$cat_sql="SELECT title FROM ".CATS." WHERE id = '".$rbs[0]."'";
		$sql_run=sqlquery($cat_sql);
		$cat=conn_fetch_row($sql_run);
		if (!@$cat[0]) $category=$depot['lxs']['he_lastnews'];else $category=$cat[0];

		$arr['itemset'][]=array(
				
			'link'		=> articleLink($res),
			'category'	=>	htmlspecialchars($category),
			'date'		=>	$date,
			'title'		=>	htmlspecialchars(getfromsql($res['nheader'],$par['lng'])),
			'teaser'	=>	htmlspecialchars(getfromsql($res['nteaser'],$par['lng']))
							
		);
	}
	$ttop.=complete_rss($arr);
	return $ttop;
}


function complete_rss($arr){
	global $par,$errors,$oks,$gerrors,$depot,$lxs,$enviro;
	$arr['rsstitle']=$_SERVER['HTTP_HOST'].$arr['rsstitle'];
	$arr['rssdescr']=$depot['lxs']['he_rssdescr'];
	$arr['rssurl'] = 'https://'.$_SERVER['HTTP_HOST'].'/';
	$arr['rssimage'] = 'https://'.$_SERVER['HTTP_HOST'].'/im/logo-rss-100.png';
	$arr['rssimage180'] = 'https://'.$_SERVER['HTTP_HOST'].'/im/logo-rss-180x.png';
	return parse_local($arr, '_rsschannel');
}




function get_full($vendor){
	global $par,$errors,$oks,$gerrors,$depot,$lxs,$enviro;
	$ttop="";
	$placed=0;
	$currdate='crazy';
	$arr=array();
	$addon=$addon1=$addon2='';
	$hd='';
	$all_news_link = "/".$par['lng']."/";
	$arr['rsstitle']='';

	$exclusive="";
	if (isset($par['exclusive'])){
		$exclusive=" AND ".NEWS.".exclusive= 1 ";
	}

	$sql1="
			SELECT		subnews.id,
						subnews.ndate,
						subnews.ntime,
						subnews.rubric,
						subnews.ntype,
						subnews.urlkey,
						
						".NEWSHEAD.".nheader,
						".NEWSHEAD.".nteaser,
						".NEWSB.".nbody

			FROM		(
							SELECT	id,ndate,ntime,rubric, udate,ntype,urlkey
							FROM	".NEWS." USE KEY (udate, id, lang, approved)
							WHERE lang = \"".$depot['vars']['langid']."\" 
							AND approved = 1 
							AND hiderss=0 
							$exclusive
							".
							$addon.$addon1.$addon2."
							AND		{$depot['mysql_time_factor']} 
							ORDER BY udate DESC 
							LIMIT 20
						) AS subnews
				
			LEFT JOIN	".NEWSHEAD." USE KEY (PRIMARY)
			USING		(id)

			LEFT JOIN	".NEWSB." USE KEY (PRIMARY)
			USING		(id)

			ORDER BY	udate DESC";


	/*$sql=sqlquery($sql1);*/
	$sql=sqlquery_cached($sql1,100,1);


	/*while ($res = conn_fetch_assoc($sql)){*/
	foreach ($sql as $res){
		$tmstmp =strtotime($res['ndate']." ".$res['ntime']);
		$date=date('D, d M Y H:i:s O',$tmstmp);
		list ($year, $month, $day) = explode('-',$res['ndate']);
		$rbs=explode(',',$res['rubric']);
		$cat_sql="SELECT title FROM ".CATS." WHERE id = '".$rbs[0]."'";
		$sql_run=sqlquery($cat_sql);
		$cat=conn_fetch_row($sql_run);
		if (!@$cat[0]) $category=$depot['lxs']['he_lastnews'];else $category=$cat[0];

		$arr['itemset'][]=array(
				
			'link'		=> articleLink($res),
			'category'	=>	htmlspecialchars($category),
			'date'		=>	$date,
			'title'		=>	htmlspecialchars(getfromsql($res['nheader'],$par['lng'])),
			'teaser'	=>	"<![CDATA[".preg_replace('/<(.+)>/U','',getfromsql($res['nteaser'],$par['lng']))."]]>"	,
			/*'fulltext'	=>	htmlspecialchars(preg_replace('/<(.+)>/U','',getfromsql($res['nbody'],$par['lng'])))*/
			'fulltext'	=>	"<![CDATA[".preg_replace('/<(.+)>/U','',getfromsql($res['nteaser'],$par['lng'])." " .getfromsql($res['nbody'],$par['lng']))."]]>"			
		);	 
	}
	$arr['rsstitle']=$_SERVER['HTTP_HOST'].$arr['rsstitle'];
	$arr['rssdescr']=$depot['lxs']['he_rssdescr'];
	$arr['rssurl'] = 'https://'.$_SERVER['HTTP_HOST'].'/';
	$arr['rssimage'] = 'https://'.$_SERVER['HTTP_HOST'].'/im/logo-rss-100.png';
	$arr['rssimage180'] = 'https://'.$_SERVER['HTTP_HOST'].'/im/logo-rss-180x.png';
	$ttop.=parse_local($arr, '_rss'.$vendor,1);

	return $ttop;
}



function get_for_region($region_id,$vendor){
	global $par,$errors,$oks,$gerrors,$depot,$lxs,$enviro;
	$ttop="";
	$placed=0;
	$currdate='crazy';
	$arr=array();
	$addon=$addon1=$addon2='';
	$hd='';
	$all_news_link = "/".$par['lng']."/";
	$arr['rsstitle']='';

	$exclusive="";
	if (isset($par['exclusive'])){
		$exclusive=" AND ".NEWS.".exclusive= 1 ";
	}

	$sql1="
			SELECT		subnews.id,
						subnews.ndate,
						subnews.ntime,
						subnews.rubric,
						subnews.ntype,
						subnews.urlkey,
						
						".NEWSHEAD.".nheader,
						".NEWSHEAD.".nteaser,
						".NEWSB.".nbody

			FROM		(
							SELECT	id,ndate,ntime,rubric, udate,ntype,urlkey
							FROM	".NEWS." USE KEY (udate, id, lang, approved)
							WHERE lang = \"".$depot['vars']['langid']."\" 
							AND approved = 1
							AND FIND_IN_SET(".$region_id.",region)
							AND hiderss=0
							$exclusive
							".
		$addon.$addon1.$addon2."
							AND		{$depot['mysql_time_factor']} 
							ORDER BY udate DESC 
							LIMIT 20
						) AS subnews
				
			LEFT JOIN	".NEWSHEAD." USE KEY (PRIMARY)
			USING		(id)

			LEFT JOIN	".NEWSB." USE KEY (PRIMARY)
			USING		(id)

			ORDER BY	udate DESC";
	/*$sql=sqlquery($sql1);*/
	$sql=sqlquery_cached($sql1,100,1);


	/*while ($res = conn_fetch_assoc($sql)){*/
	foreach ($sql as $res){
		$tmstmp =strtotime($res['ndate']." ".$res['ntime']);
		$date=date('D, d M Y H:i:s O',$tmstmp);
		list ($year, $month, $day) = explode('-',$res['ndate']);
		$rbs=explode(',',$res['rubric']);
		$cat_sql="SELECT title FROM ".CATS." WHERE id = '".$rbs[0]."'";
		$sql_run=sqlquery($cat_sql);
		$cat=conn_fetch_row($sql_run);
		if (!@$cat[0]) $category=$depot['lxs']['he_lastnews'];else $category=$cat[0];

		$arr['itemset'][]=array(

			'link'		=> articleLink($res),
			'category'	=>	htmlspecialchars($category),
			'date'		=>	$date,
			'title'		=>	htmlspecialchars(getfromsql($res['nheader'],$par['lng'])),
			'teaser'	=>	"<![CDATA[".preg_replace('/<(.+)>/U','',getfromsql($res['nteaser'],$par['lng']))."]]>"	,
			/*'fulltext'	=>	htmlspecialchars(preg_replace('/<(.+)>/U','',getfromsql($res['nbody'],$par['lng'])))*/
			'fulltext'	=>	"<![CDATA[".preg_replace('/<(.+)>/U','',getfromsql($res['nteaser'],$par['lng'])." " .getfromsql($res['nbody'],$par['lng']))."]]>"
		);
	}
	$arr['rsstitle']=$_SERVER['HTTP_HOST'].$arr['rsstitle'];
	$arr['rssdescr']=$depot['lxs']['he_rssdescr'];
	$arr['rssurl'] = 'https://'.$_SERVER['HTTP_HOST'].'/';
	$arr['rssimage'] = 'https://'.$_SERVER['HTTP_HOST'].'/im/logo-rss-100.png';
	$arr['rssimage180'] = 'https://'.$_SERVER['HTTP_HOST'].'/im/logo-rss-180x.png';
	$ttop.=parse_local($arr, '_rss'.$vendor,1);
	return $ttop;
}







/**											*
*
*			SITE MAP
*
*/



function get_sitemap(){
	global $par,$errors,$oks,$gerrors,$depot,$lxs,$enviro;

	$limit=" AND ndate >= DATE(DATE_SUB(NOW(), INTERVAL 14 DAY)) ";
	$cacheid=100;
	$cahcetimeout=15;
	

	if ($par['ns']=='sitemap_full') {
		$limit="";
		$cacheid=101;
		$cahcetimeout=24*30*60;

	}

	$html="";
	
	$arr=array();
	$now=date("Y-m-d",$depot['vars']['ctime']);

	$arr['items'][]=array(
				"link"		=>	"https://".$_SERVER['HTTP_HOST']."/",
				"lastmod"	=>	$now,
				"frequency"	=>	"hourly",
				"priority"	=>	0.7
	);


	/*CATEGORIES*/
	$sql=sqlquery_cached("SELECT * FROM ".CATS." WHERE cattype<>3 AND isvis=1",1000,4);
	foreach ($sql as $res){

		$subpath="";
		if ($res['cattype']==2) $subpath="topthemes/";

		$arr['items'][]=array(
				"link"		=>	"https://".$_SERVER['HTTP_HOST']."/".$subpath.$res['param']."/",
				"lastmod"	=>	$now,
				"frequency"	=>	"hourly",
				"priority"	=>	0.7
		);
	}


	/*NEWSTYPES*/
	foreach (explode("|","news|announces|blogs|video|audio|photo|articles|ljlive|mainmedia") as $ntype){
		$arr['items'][]=array(
				"link"		=>	"https://".$_SERVER['HTTP_HOST']."/$ntype/",
				"lastmod"	=>	$now,
				"frequency"	=>	"hourly",
				"priority"	=>	0.7
		);
	}

	
	/*NEWS*/
	$sql1="
			
				SELECT	id,ndate,ntime,rubric,ntype,urlkey
				FROM	".NEWS." USE KEY (udate, id, lang, approved)
				WHERE lang = \"".$depot['vars']['langid']."\" 
				AND approved = 1 ".
				$limit."
				AND		{$depot['mysql_time_factor']} 
				ORDER BY udate DESC 
			";


	$sql=sqlquery_cached($sql1,$cahcetimeout,$cacheid);

	foreach ($sql as $res){
			
		$arr['items'][]=array(
				"link"		=> articleLink($res),
				"lastmod"	=>	$res['ndate'],
				"frequency"	=>	"daily",
				"priority"	=>	0.7
		);
		
	}

	return parse_local($arr, 'sitemap',1);
}





function get_googlenews(){
	global $par,$errors,$oks,$gerrors,$depot,$lxs,$enviro;
	$ttop="";
	$placed=0;
	$currdate='crazy';
	$arr=array();

	$daysago=time()-48*3600;

	$sql1="
			SELECT		subnews.id,
						subnews.ndate,
						subnews.ntime,
						subnews.rubric,
						subnews.ntype,
						subnews.urlkey,
						subnews.images,
						".NEWSHEAD.".nheader

			FROM		(
							SELECT	id,ndate,ntime,rubric,ntype,urlkey,images
							FROM	".NEWS." 
							WHERE lang = \"".$depot['vars']['langid']."\" 
							AND	{$depot['mysql_time_factor']}
							AND udate > $daysago
							AND approved = 1
							ORDER BY udate DESC 
							LIMIT 1000
						) AS subnews
				
			LEFT JOIN	".NEWSHEAD."
			USING		(id)
			ORDER BY	udate DESC";


	/*$sql=sqlquery($sql1);*/
	$sql=sqlquery_cached($sql1,10,1);


	/*while ($res = conn_fetch_assoc($sql)){*/
	foreach ($sql as $res){
		$tmstmp =strtotime($res['ndate']." ".$res['ntime']);

		$date=date('Y-m-d\TH:iP');
		list ($year, $month, $day) = explode('-',$res['ndate']);
		$isolangs=array(
						'ua'=>'uk',	
						'ru'=>'ru',
						'pl'=>'pl',
						'en'=>'en'
		);


		$arr['itemset'][]=array(
				
			'link'		=> articleLink($res),
			'date'		=>	$date,
			'title'		=>	htmlspecialchars(getfromsql($res['nheader'],$par['lng'])),
			'publisher'	=>	$_SERVER['HTTP_HOST'],
			'language'	=>	$isolangs[$depot['vars']['language']]
			/*'enclosure' =>	$image*/
							
		);
	}
	
	$ttop.=parse_local($arr, "googlenews",1);

	return $ttop;
}