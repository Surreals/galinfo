<?

/**
*	common articles function
*/
function bringArticles(){
	global $par,$depot;

	if (isset($par['newsid'])){
		require_once("readnews.php");
		if (!isset($par['print'])) $depot['vars']['footerInformers'] = parse_local(array(),'footerInformers',1);
		return get_newsread();
	}
	else {
		$par['ns']="listall";
		$page="";
		if (@$par['pg']>0) $page=" - ".$depot['lxs']['page']." ".($par['pg']+1);
		$depot['vars']['title']					=$depot['lxs'][$par['articletype']]." ".$depot['lxs']['def_pre_title'].$page;
		$depot['vars']['description']			=$depot['lxs']['def_description_rubric']." ".$depot['lxs'][$par['articletype']].$page;
		/*if (in_array($par['articletype'],array("audio","video","photo"))) 
			$prefix="media";
		else*/
			$prefix=$par['articletype'];

		return get_tpl($prefix.'ListAll',0,1);
	}
}


function get_chat(){
	global $par,$errors,$oks,$gerrors,$vars;
	if (!isset($par['chid']))
	return get_tpl('chatHome',0,1);
	else return get_tpl('chatView',0,1);
}


function get_filteredArticles(){
	global $par;
	$par['ns']="listall";
	return get_tpl('filterListAll',0,1);
}


function get_listall(){
	return get_tpl('_listall',0);
}


function get_newshome(){
	global $par,$depot;

	if (@$par['ns']=='search') return get_search(); 

	$depot['vars']['title']			=$depot['lxs']['def_title'];
	$depot['vars']['keywords']		=$depot['lxs']['def_keywords'];
	$depot['vars']['description']	=$depot['lxs']['def_description'];

	if (!isset($par['rubric_id'])) {
		if (!isset($depot['vars']['lastidset'])) {
			cleanLastIDCookie();
		}
		return get_tpl('homepageContent',0,1);
	}
	else {
		//$par['ns']="listall";
		$depot['vars']['title']			=$depot['lxs']['def_title_rubric']." ".$depot['rubrics'][$par['rubric_id']]['title'];
		$depot['vars']['description']	=$depot['lxs']['def_description_rubric']." ".$depot['rubrics'][$par['rubric_id']]['title'];

		return parse_local(
			array('currentrubric'=>mb_strtoupper($depot['rubrics'][$par['rubric_id']]['title'],'utf8')),
			'homepageRubricsContent',1);
	}

}

								
/*	SERVICE		FUNCTIONS*/
function newsoday(){
	require_once("newsoday_fnc.php");
	return newsoday_fnc();
}


/*	MAIN HEADLINE.	*/
function mainheadline(){
	require_once("news_mainheadline.php");
	return mainheadline_fnc();
}

/* BLOGS BOX */
function blogsBox(){
	global $par,$depot;
	$arr=array();
	$addon="";
	if (isset($par['rubric_id']) && $par['rubric_id']) {
		$addon=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);
	}

	$sql= "	
		SELECT	DISTINCT
				N1.id,
				N1.images,
				N1.ntype,
				N1.urlkey,
				N1.photo,
				N1.video,
				N1.printsubheader,
				".NEWSHEAD.".nheader,
				".NEWSHEAD.".nteaser,
				".FUSERS.".name,
				".FUSERS.".id as uuserid,
				".PICSU.".filename,
				".STATCOMM.".qty
			
		FROM	
				(	SELECT  
							".NEWS.".id,
							".NEWS.".images,
							".NEWS.".userid,
							".NEWS.".ntype,
							".NEWS.".urlkey,
							".NEWS.".printsubheader,
							".NEWS.".photo,
							".NEWS.".video
					FROM ".NEWS." USE KEY (ntype)
					WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
					AND		ntype=20
					AND		".NEWS.".approved=1
					AND		userid <> 0
					AND		{$depot['mysql_time_factor']} 
					$addon
					ORDER BY udate DESC
					LIMIT {$depot['enviro']['qty_blog_box']}
				
				)
		
		AS N1

		LEFT JOIN	".NEWSHEAD." 
		USING	(id)

		LEFT JOIN ".STATCOMM." 
		USING(id)

		LEFT JOIN ".FUSERS."
		ON	N1.userid = ".FUSERS.".id

		LEFT JOIN ".PICSU."
		ON	".FUSERS.".id = ".PICSU.".userid
	
		 ";
	
	$run_sql_main = sqlquery_cached($sql,30,1);
	
	if (count($run_sql_main)){

		$placed=0;
		foreach ($run_sql_main as $item){

			$placed++;
			$link=articleLink($item);
					
			/*$images=get_selected_images($item['images'],$depot['vars']['language']);
			$image='';
			if (count($images)) {
				$image.="<a href=\"$link\"><img src='/media/gallery/intxt/".$images[0]['filename']."'";
				if (@$images[0]['title_'.$depot['vars']['language']]){
					$image.=" alt='".$images[0]['title_'.$depot['vars']['language']]."'";
				} 
				$image.=">";

			}*/

			$avt=($item['filename']) ? "/media/avatars/tmb/".$item['filename'] : "/im/user.gif";
			$subheader=($item['printsubheader']) ? "<span class='sheaderil'>".getfromsql($item['nsubheader'],$par['lng'])."</span>" : "";

			$arr['items'][]=array(
							
				"allnewslink"	=>	"http://".$depot['vars']['subdomain1'].$depot['vars']['language_link']."blogs/",
				"boxtitle"		=>	mb_strtoupper($depot['lxs']['blogs'],"utf8"),
			
				"bloggerlink"	=>	"http://".$depot['vars']['subdomain1'].$depot['vars']['language_link']."bloggers/".$item['uuserid']."/",
				"bloggeravatar"	=>	"<img src='$avt'>",
				"avatarfile"	=>	$avt,
				"bloglink"		=>	$link,
				"blogtitle"		=>	getfromsql($item['nheader'],$depot['vars']['language']),
				"bloggername"	=>	getfromsql(
										str_replace(
											array(" ","  ","   ","    ","     ","      ","       "),
											" ",
											$item['name']),
										$depot['vars']['language']
									),
				"blogteaser"		=>	limit_text(getfromsql($item['nteaser'],$depot['vars']['language']),110),
				"subheader"		=>	$subheader,
				"commstat"		=>	$item['qty']?"<em class=\"astat\"><i class=\"acomm\"><em></em>".$item['qty']."</i></em>":""
						
			);
		
		}
		return parse_local($arr,'boxBlogs',1);
	}
}



function anaheads(){
	global $par,$depot;
	$addon='';
	$html="";
	$arr=array();
	
		$sql= "	
			SELECT	".NEWS.".*,
					".NEWSB.".nheader,
					".NEWSB.".nteaser
			FROM		".NEWS." 
			LEFT JOIN	".NEWSB." 
			USING	(id)
			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		ntype=2
			AND		approved=1
			$addon
			ORDER BY udate DESC
			LIMIT ".$depot['enviro']['qty_anno_list_homepa'];


		$list='';$stoposa=array();
		/*$run_sql = sqlquery($sql);*/
		$run_sql = sqlquery_cached($sql,30,1);
		/*while ($res=mysql_fetch_assoc($run_sql)){*/

		foreach ($run_sql as $res){
			/*if (count($res)<3) continue; */
			
				
				$link=str_replace("-",'/',$res['ndate']);
				$images=get_selected_images($res['images'],$depot['vars']['language']);
				$image='';
				if (count($images)) {
					$image.="<img src='/meis/gallery/intxt/".$images[0]['filename']."'";
					if (@$images[0]['title_'.$depot['vars']['language']]){
						$image.=" alt='".$images[0]['title_'.$depot['vars']['language']]."'";
					} 
					$image.=">";
				}
				$day=	substr($res['ndate'],-2,2);
				$month=	substr($res['ndate'],-5,2);
				
				$stoposa=array(
							
					'linknews'	=>	$depot['vars']['language_link']."news/".$res['id'].$depot['fext'],
					'image'		=>	$image,
					'date'		=>	$day,
					'month'		=>	$depot['lxs']['mona_'.$month],
					'year'		=>	substr($res['ndate'],0,4),
					'headnews'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
					'teaser'	=>	getfromsql($res['nteaser'],$depot['vars']['language']),
					'linktheme'	=>	"/".$depot['vars']['language']."/analytics/".@$res1[1]."/",
					'capttheme'	=>	getfromsql(@$res1[2],$depot['vars']['language'])
				);

				$arr['anaset'][]=$stoposa;
			
		}
		//$stoposa['list'] = $list;
		//$arr['anaset'][]=$stoposa;
	//}
	return parse_local($arr,'_anteaser');
}



/*		TOP X	*/
function topread($limit=5,$iscollection=NULL,$pattern="justlist"){
	global $par,$depot;
	$addon=$addon1=$addon2='';

	/*if (isset($depot['current_article'])){
		$addon.=ruleRubrickFromActiveNews($depot['current_article']['rubric']);
	} else*/ /*if (isset($par['rubric_id'])){
		$addon.=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);
	}*/
	
	$sql1="

		SELECT		
			subnews.id,
			subnews.ndate,
			subnews.ntime, 
			subnews.ntype, 
			subnews.urlkey,
			subnews.photo,
			subnews.video,
			".NEWSHEAD.".nheader,
					subnews.nweight
		FROM		
			(
				SELECT	".NEWS.".id,ndate,ntime,nweight,ntype,urlkey,photo,video
				FROM	".NEWS."
				RIGHT JOIN	".STATVIEW." 
				USING		(id)
				WHERE	lang = \"".$depot['vars']['langid']."\"
				AND		ndate >= DATE(DATE_SUB(NOW(), INTERVAL ".$depot['enviro']['days_actual_news']." DAY))
				AND		{$depot['mysql_time_factor']} 
				AND		approved=1
				".
				$addon.$addon1.$addon2." 
				ORDER BY	".STATVIEW.".qty DESC, udate DESC 
				LIMIT	$limit "./*$depot['enviro']['qty_top_read'].*/"
			) AS subnews
		LEFT JOIN	".NEWSHEAD."
		USING		(id)";

	return topx($sql1,'topread',$iscollection,$pattern);
}

function topreadBox(){
	global $depot;
	return "
		<h2>".$depot['lxs']['topread']."</h2>
		<ul>
			".topread(5,false,"weirdlist")."
		</ul>
	";
}

function topreadBoxInside(){
	global $depot;
	$collection=topread(10,true);
	return parse_local($collection,"topread_box_inside",1);
}

/*		TOP X COMMENTED	*/
function topcommented(){
	global $par,$depot;
	$addon=$addon1=$addon2='';

	if (isset($depot['current_article'])){
		$addon.=ruleRubrickFromActiveNews($depot['current_article']['rubric']);
	} else if (isset($par['rubric_id'])){
		$addon.=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);
	}

	$sql1="
		SELECT		
			subnews.id,
			subnews.ndate,
			subnews.ntime, 
			subnews.ntype, 
			subnews.urlkey,
			subnews.photo,
			subnews.video,
			".NEWSHEAD.".nheader,
			subnews.nweight
		FROM		
			(
				SELECT	".NEWS.".id,ndate,ntime,nweight,ntype,urlkey,photo,video
				FROM	".NEWS."
				RIGHT JOIN	".STATCOMM."
				USING		(id)
				WHERE	lang = \"".$depot['vars']['langid']."\"
				AND		ndate >= DATE(DATE_SUB(NOW(), INTERVAL ".$depot['enviro']['days_actual_news']." DAY))
				AND		{$depot['mysql_time_factor']} 
				AND		approved=1
				".
				$addon.$addon1.$addon2." 
				ORDER BY	".STATCOMM.".qty DESC, ".STATCOMM.".nudate DESC 
				LIMIT		".$depot['enviro']['qty_top_commented']."
			) AS subnews
		LEFT JOIN	".NEWSHEAD."
		USING		(id)";
	return topx($sql1,'topcomm');
}


/*		TOP TOP	*/
function toptop(){
	global $par,$depot;
	$addon=$addon1=$addon2='';

	if (isset($depot['current_article'])){
		$addon.=ruleRubrickFromActiveNews($depot['current_article']['rubric']);
	} else if (isset($par['rubric_id'])){
		$addon.=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);
	}

	$sql1="

		SELECT		
			subnews.id,
			subnews.ndate,
			subnews.ntime, 
			subnews.ntype,
			subnews.urlkey,
			subnews.photo,
			subnews.video,
			".NEWSHEAD.".nheader,
			subnews.nweight
		FROM		
			(
				SELECT	".NEWS.".id,ndate,ntime,nweight,ntype,urlkey,photo,video
				FROM	".NEWS." 
				
				WHERE	lang = \"".$depot['vars']['langid']."\"
				AND		ndate >= DATE(DATE_SUB(NOW(), INTERVAL ".$depot['enviro']['days_actual_news']." DAY))
				AND		suggest=1
				AND		approved=1
				AND		{$depot['mysql_time_factor']} 
				".
				$addon.$addon1.$addon2." 
				ORDER BY udate DESC 
				LIMIT		".$depot['enviro']['qty_top_read']."
			) AS subnews
		LEFT JOIN	".NEWSHEAD."
		USING		(id)";

	return topx($sql1,'topread');
}



function pressreleaseBlock(){
	return __FILE__."/".__LINE__;

	global $depot,$par;
	$html="";
	$arr=array();
	$sql1="
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader

			FROM		".NEWS." 
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)


			WHERE	lang = \"".sqller($depot['vars']['langid'][$par['lng']])."\"
			AND		approved <> 0
			AND		{$depot['mysql_time_factor']}
			AND ".NEWS.".pressrelease = 1
			ORDER BY udate DESC
			LIMIT ".$depot['enviro']['qty_pressrelease_box'];

	$sql=sqlquery_cached($sql1,20,1);
	foreach ($sql as $res){
		$ddate=explode("-",$res['ndate']);
		$day=	$ddate[2];
		$month=	$ddate[1];
		$arr['justlist'][]=array(		
			'date'		=>	$day." ".$depot['lxs']['mona_'.$month],
			'link'		=>	articleLink($res),
			'headline'	=>	getfromsql($res['nheader'],$par['lng']),
			'mediaicon'	=>	mediaIcon($res)	
		);
	}

	if (count($arr)) $html.=parse_local($arr,'pressreleaseBlock',1);
	return $html;

}


function topx($sql1,$hde,$returnCollection=false,$pattern="justlist"){
	global $par,$depot;
	//variables to play with: head, date, link, headline, toplist = SET, 
	$html="";
	$placed=0;
	$currdate='crazy';
	$arr=array();

	$sql=sqlquery_cached($sql1,20,1);

	if (!count($sql)) return '<b style="padding:30px;display:block">'.$depot['lxs']['noarticles'].'</b>';
	

	foreach ($sql as $res){
		/*$exclusive=(@$res['exclusive']) ? "<em title='Exclusive' class='exclusive'></em>" : "";*/
		$ddate=explode("-",$res['ndate']);
		
		$image="";
		if (isset($res['images'])){
			$image="<img src='/media/intxt-default.jpg'>";
			$impath="tmb";
			
			$images=get_selected_images($res['images'],$depot['vars']['language']);
			if (count($images)) {
				$image="<img src='/media/gallery/$impath/".$images[0]['filename']."'>";
			}
		}

		$day=	$ddate[2];
		$month=	$ddate[1];
		$arr['justlist'][]=array(		
			'day'		=>	$day,
			'shortmo'	=>	$depot['lxs']['shortmo_'.$month],
			'date'		=>	$day." ".$depot['lxs']['mona_'.$month],
			'link'		=>	articleLink($res),
			'headline'	=>	getfromsql($res['nheader'],$par['lng']),
			'mediaicon'	=>	mediaIcon($res),
			'image'		=>	$image
		);
	}
	if (count($arr)) $html.=parse_local($arr,$pattern);
	return $returnCollection ? $arr : $html;
}


function fromRubric($rubricid,$limit){
	global $depot;
	$addon="";
	if (isset($depot['current_article'])){
		$addon="AND ".NEWSHEAD.".id <> ".$depot['current_article']['id'];
	}

	if ($rubricid){
		$addon.=ruleRubrickFromActiveNews($rubricid);
	}

	$sql=sqlquery_cached("
						
		SELECT 
			".NEWSHEAD.".id,
			".NEWSHEAD.".nheader,
			".NEWS.".ntype,
			".NEWS.".urlkey,
			".NEWS.".comments,
			".NEWS.".photo,
			".NEWS.".video,
			".STATCOMM.".qty
		FROM 
			".NEWS." use key(udate)
		LEFT JOIN
			".NEWSHEAD."
		
		USING(id)

		LEFT JOIN ".STATCOMM."
		USING(id)

		WHERE	approved=1
		AND		{$depot['mysql_time_factor']} 
		$addon
			
		
		ORDER BY udate DESC
		LIMIT $limit
	", 900, 1);

	$news=array();
	foreach ($sql as $v){

		/*	INFO BEDGE	*/
		$infobedge=$comments=$mediaicons="";
		$comments=$v['qty'] ? "<i class=\"acomm\"><em></em>{$v['qty']}</i>" : "";
		$mediaicons=mediaIcon($v);
		if ($comments || $mediaicons) $infobedge="<em class=\"astat\">".$comments.$mediaicons."</em>";
		$news[]="<li><a href=\"".articleLink($v)."\">".$v['nheader']."</a>".$infobedge."</li>";
	}
	return $news;
}


function announcesBlock($dpar=array(0)){
	global $depot,$par;
	
	$limit=$dpar[0];

	if (!$limit) $limit=$depot['enviro']['qty_anno_homepage'];

	$addon="";

	$sql1="	
		SELECT	id,
				DATE_FORMAT(ddate,'%H.%i.%d.%m.%Y') AS mydate,
				DATE_FORMAT(ddate,'%w') AS wday,
				DATE(ddate) as tdate, 
				gps,
				place,
				announce,
				atext ,
				(ddate<NOW())as gohide,
				notice
		FROM	".ANNO." 
		WHERE ddate >NOW() 	 
		ORDER BY ddate
		LIMIT $limit
	";

	$sql=sqlquery_cached($sql1,0,2);
	$news=array();
	if (!count($sql)) return;
	foreach ($sql as $v){
		list($h,$m,$d,$mo,$Y)=explode(".",$v['mydate']);
		$news['items'][]=array(
			'head'	=>$v['announce'],
			'date'	=>$d,
			'month'	=>$depot['lxs']['mona_'.$mo],
			'wday'	=>$depot['lxs']['dw_'.$v['wday']],
			'time'	=>$h.":".$m
		);
	}
	return parse_local($news,'announcesBlock',1);
}



function expertBlock(){
	//return;
	/*******/

	global $depot,$par;
	$arr=array();
	$addon="";
	if (isset($depot['current_article'])){
		$addon="AND ".NEWSHEAD.".id <> ".$depot['current_article']['id'];
		$addon.=ruleRubrickFromActiveNews($depot['current_article']['rubric']);
	} else if (isset($par['rubric_id'])){
		$addon.=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);
	}

	$sql=sqlquery_cached("
						
		SELECT 
			".NEWSHEAD.".id,
			".NEWSHEAD.".nheader,
			".NEWSHEAD.".nteaser,
			".NEWS.".ntype,
			".NEWS.".images,
			".NEWS.".urlkey

		FROM 
			".NEWSHEAD."
		LEFT JOIN
			".NEWS."
		
		USING(id)

		WHERE expert =1
		AND		lang = \"".sqller($depot['vars']['langid'])."\"
		AND		".NEWS.".approved=1
		AND		{$depot['mysql_time_factor']}
		$addon
			
		ORDER BY udate DESC
		LIMIT 1

	", 600, 1);
	$news=array();

	if (!count($sql)) return;

	foreach ($sql as $v){
		$image='';
		if ($v['images'])	{
			$images=get_selected_images($v['images'],$depot['vars']['language']);
			if (count($images)) {
				$image="<img src='/media/gallery/intxt/".$images[0]['filename']."' class='headline'>";
			}
		} 
			
		$arr['item'][]=array(
			"link"		=>	articleLink($v),	
			"image"		=>	$image,
			"header"	=>	$v['nheader'],
			"teaser"	=>	limit_text($v['nteaser'],90)			
		);
	}
	return parse_local($arr,"expertyza",1);
}




function mostPopularBlock(){
	return __LINE__."/".__FILE__;
}


function articlesBlock($dpars=array(0,0),$nodecorate=false){
	global $depot,$par;
	@list($limit,$type)=$dpars;

	if (!$limit) {
		$limit=$depot['enviro']['qty_art_box'];
	} else {
		/*$limit=($depot['enviro']['qty_art_box']*$limit).",".$depot['enviro']['qty_art_box'];*/
	}
	$addon="
			AND	".NEWS.".ntype=2
			";

	/*if ($newsreview)
		$addon.="
			AND	".NEWS.".newsreview = $newsreview";
	else	{
		$addon.="
			AND	".NEWS.".newsreview = 0
			";

		if (!isset($par['rubric_id'])){
			$addon.=" AND	".NEWS.".rated=1
			";
		}
	}*/


	/*if (isset($depot['current_article'])){
		$addon.="
				AND		".NEWSHEAD.".id <>	".$depot['current_article']['id'];
		$addon.=ruleRubrickFromActiveNews($depot['current_article']['rubric']);

	} else if (isset($par['rubric_id'])){
		$addon.=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);
		$limit=6;
	}*/

	if (isset($par['rubric_id']) && $par['rubric_id'])  {
		$addon.=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);
	} else {
		$addon.=" AND nweight > 0 ";
	}

	$sql_query="		
		SELECT 
			".NEWSHEAD.".id,
			".NEWSHEAD.".nheader,
			".NEWSHEAD.".nteaser,
			".NEWS.".ntype,
			".NEWS.".comments,
			".NEWS.".images,
			".NEWS.".urlkey,
			".NEWS.".photo,
			".NEWS.".video,
			".NEWS.".ndate,
			".NEWSSLIDEHEAD.".sheader,
			".NEWSSLIDEHEAD.".steaser,
			".STATCOMM.".qty/*,
			".CATS.".title*/

		FROM 
			".NEWSHEAD." USE KEY (PRIMARY)
		LEFT JOIN
			".NEWS." USE KEY (datetype)
		
		ON ".NEWSHEAD.".id = ".NEWS.".id

		LEFT JOIN	".STATCOMM." USE KEY (PRIMARY)
		ON	".NEWS.".id = ".STATCOMM.".id

		LEFT JOIN	".NEWSSLIDEHEAD."
		ON	".NEWS.".id = ".NEWSSLIDEHEAD.".id

		/*LEFT JOIN ".CATS."
		ON ".CATS.".id = ".NEWS.".newsreview*/


		WHERE 1
				
		AND		{$depot['mysql_time_factor']} 
		AND		approved = 1
				$addon
	
		ORDER BY udate DESC
		LIMIT $limit
	";

	$sql=sqlquery_cached($sql_query, 10, 1);

	$news=array();
	
	$index=1;
	$articles_qty=count($sql);
	$items=array();
	
	foreach ($sql as $v){

		$image="<img src='/media/tmb-default.jpg'>";
		$impath="intxt";

		if ($v['images'])	{
			$images=get_selected_images($v['images'],$depot['vars']['language']);
			if (count($images)) {
				$image="<img src='/media/gallery/$impath/".$images[0]['filename']."'>";
			}
		} 
		
		$lastclass=($index%2)	? "" : " fr";
		$devider=($index%2)		? "" : "<span class='clean'></span>";
		
		list($yy,$mm,$dd)=explode("-",$v['ndate']);

		/*$exclusive=($v['exclusive']) ? "<em title='Exclusive' class='exclusive'></em>" : "";*/
		
		$teaser = $v['steaser'] ? $v['steaser'] : $v['nteaser'];

		if (!$nodecorate) $teaser = limit_text(getfromsql($teaser,$depot['vars']['language']),100);
		else $teaser = getfromsql($teaser,$depot['vars']['language']);

		$items['items'][]=array(
			'link'		=>	articleLink($v),
			'head'		=>	$v['sheader'] ? $v['sheader'] : $v['nheader'],
			'teaser'	=>	$teaser,
			'image'		=>	$image,
			'commstat'	=>	$v['qty']?"<em class=\"inline-ico commentstat\">".$v['qty']."</em>":"",
			'lastclass'	=>	$lastclass,
			'date'		=>	"<span>".$dd."</span> ".$depot['lxs']['mona_'.$mm],
			'devider'	=>	$devider,
			'mediaicon'	=>	mediaIcon($v),
			/*'reviewtype'=>	mb_strtoupper($v['title'],'UTF-8'),*/			
		);
		$index++;
		
	}

	$pattern=(isset($par['articletype']) || isset($par['filterNews']) || @$par['rubric_id']) ? "articlesBlockInside" : "articlesBlock";

	if (@$par['ns']=='home') $pattern= "articlesBlock";
	if (isset($type)){
		switch ($type){
			case "1" : $pattern="articlesBlockReadPage"; break;
			case "2" : $pattern="articlesBlockHeadline"; break;
		}
	}
	if (!count(@$items['items'])) return;

	if (!$nodecorate)
		return parse_local($items,$pattern,1);
	else 
		return $items;
	
}


function rubricBlocks() {
	global $depot;
	require_once("news_rubricblock.php");
	$html = '';
	$idsa = explode(",",$depot['enviro']['rubric_blocks']);
	foreach ($idsa as $id) {
		if (isset($depot['rubrics_ids'][$id])) {
			$html .= rubricBlock_fnc($depot['rubrics_ids'][$id]);
		} 
	}
	return $html;
}


/* RUBRIC BLOCKS */
function rubricBlock($dpar=array()){
	global $depot;
	$rubric=$dpar[0];
	require_once("news_rubricblock.php");
	return rubricBlock_fnc($rubric);
}



function mediaListBlock($limit,$section){
	global $depot,$par;
	
	if (!isset($depot['article_keys'][$section])) return array();

	$addon="	AND	".NEWS.".ntype = \"".sqller($depot['article_keys'][$section])."\"	";


	if (isset($depot['current_article'])){

		/*$addon.="
				AND		".NEWS.".id <>	".$depot['current_article']['id'];
		$addon.=ruleRubrickFromActiveNews($depot['current_article']['rubric']);*/

	} else if (isset($par['rubric_id'])){
		
		/*$addon.=ruleRubrickFromActiveNews($depot['rubrics'][$par['rubric_id']]['id']);*/

	}

	$sql_code="
						
		SELECT 
			".NEWSHEAD.".id,
			".NEWSHEAD.".nheader,
			".NEWS.".ntype,
			".NEWS.".comments,
			".NEWS.".images,
			".NEWS.".urlkey,
			".NEWS.".photo,
			".NEWS.".video,
			".NEWS.".youcode,
			".STATCOMM.".qty
		FROM 
			".NEWS." USE KEY (ntype)
		LEFT JOIN
			".NEWSHEAD."
		
		USING(id)

		LEFT JOIN	".STATCOMM." USE KEY (PRIMARY)
		USING		(id)

		WHERE	approved=1
		AND		rated=1
		AND		{$depot['mysql_time_factor']} 
		$addon

	
		ORDER BY udate DESC
		LIMIT $limit

	";

	$sql=sqlquery_cached($sql_code,10, 1);
	$news=array();
	
	$index=1;
	$articles_qty=count($sql);

	if (!$articles_qty) return;

	foreach ($sql as $v){
		$image="<img src='/media/tmb-default.jpg'>";
		if ($v['images'])	{
			$images=get_selected_images($v['images'],$depot['vars']['language']);
			if (count($images)) {
				$image="<img src='/media/gallery/tmb/".$images[0]['filename']."'>";
			}
		} else if (trim($v['youcode'])) {

			 $image = "<img src='http://img.youtube.com/vi/".$v['youcode']."/hqdefault.jpg'>";
		}

		

		$class = ($articles_qty==$index) ? 'class="mr0"': "";

		$news[]="
		
		<li $class>
			<a href=\"".articleLink($v)."\">$image</a>
			<em>".$depot['lxs'][$depot['article_types'][$v['ntype']]]."</em>
			<a href=\"".articleLink($v)."\">".$v['nheader']."</a>
		</li>";


		$news['newsline'][]=array(
			"image"		=>	$image,
			"link"		=>	articleLink($v),
			"header"	=>	$v['nheader'],
			"type"		=>	$depot['lxs'][$depot['article_types'][$v['ntype']]],
			"class"		=>	($index==1?" class='active'":""),
			"style"		=>	($index==1?"":"display:none"),
			'index'		=>	$index,
			'mediaicon'	=>	mediaIcon($v)
			);

		$news['tmb'][]=array(
			"image"		=>	$image,
			"link"		=>	articleLink($v),
			"header"	=>	$v['nheader'],
			"class"		=>	($index==1?" class='active'":""),
			'index'		=>	$index,
		);

		$index++;
	}
	$news['section']=$section;
	$news['sectionname']=$depot['lxs'][$section];
	if (@$random && is_array($news["newsline"])) shuffle($news["newsline"]);
	return $news;
}



/*
**	MEDIA WIDGET	*/

function mediaWidget($section=array("photo")){
	global $depot;
	
	$news=mediaListBlock(10,$section[0]);

	if (count($news)) return
	parse_local($news,"mediaWidget",1);

}



/*
**	MEDIA STRIP	*/

function mediaStrip(){
	global $depot;
	
	$news=mediaListBlock(25,false);

	if (count($news)) return
	parse_local($news,"mediaStrip",1);

}


/**
* SEARCH INDEX
*/

function get_search(){
	require_once('search.php');
	return searchResults();
}




/**
*	CLEAN DATA FOR META TAGS
*/

function cleanMeta ($str){
	$str=str_replace("&nbsp;",' ',$str);
	$str=strip_tags($str);
	/*$array_t=array(
			
		"#",
		"^",
		"&",
		"»",
		"«",
		"'",
		"\"",
		".",
		",",
		"[",
		"]",
		"{",
		"}",
		"`",
		"\n",
		"\t",
		"”",
		"„",
		"?",
		"!",
		"’"
		);

	$str=str_replace($array_t,'',$str);	
	mb_internal_encoding("UTF-8");
	mb_regex_encoding("UTF-8");	*/
	$pattern=mb_convert_encoding('/[#\^\&\?»«\'",\[\]\}\{\\n\\r”„\!’\:\(\);*\.]/su',"UTF-8");

	$str=preg_replace($pattern,'',$str);
	return $str;
}




function socials($news){
	global $lxs,$depot;
	$fb="http://www.facebook.com/sharer.php?u=http://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI']."&t=".urlencode($news['nheader']);
	$tw="http://twitter.com/home/?status=".trim($news['nheader'])." http://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
	$lj="http://www.livejournal.com/update.bml?subject=".urlencode($news['nheader'])."&event=http://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
	$vc="http://vkontakte.ru/share.php?url=http://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];

	$html="
			<div class='socials'>
					
			<a href='$vc' class='vc' title='".$depot['lxs']['vc']."' target='_blank'  rel='nofollow'><b>".$depot['lxs']['vc']."</b></a>
			<a href='$lj' class='lj' title='".$depot['lxs']['lj']."' target='_blank'  rel='nofollow'><b>".$depot['lxs']['lj']."</b></a>
			<a href='$tw' class='tw' title='".$depot['lxs']['tw']."' target='_blank'  rel='nofollow'><b>".$depot['lxs']['tw']."</b></a>
			<a href='$fb' class='fb' title='".$depot['lxs']['fb']."' target='_blank'  rel='nofollow'><b>".$depot['lxs']['fb']."</b></a>
			<span class='share'>".$depot['lxs']['sharenews']."</span>
		</div>
	";
	return $html;
}




function defineRubrics(){
	global $depot, $par;
	
	$catsid = array('1'=>'rubrics','3'=>'regions');

	$query = sqlquery_cached("
		SELECT id,param, title,cattype
		FROM ".CATS." 
		WHERE (cattype='1' /*rubric*/ OR  cattype='3' /*region*/)
		AND isvis = 1 
		AND lng=\"".$depot['vars']['langid']."\" 
		ORDER BY orderid
	
	",900,3);

	foreach ($query as $res) {
		$depot[$catsid[$res['cattype']]][$res['param']] = $res;
		$depot[$catsid[$res['cattype']]."_ids"][$res['id']] = $res['param'];
	}
}

function ruleRubrickFromActiveNews($rubrics){

	if (!$rubrics) return;

	$rrubrics=explode(",",$rubrics);

	foreach ($rrubrics as $r){
		$rule[]=" FIND_IN_SET(".$r.",".NEWS.".rubric) ";
	}

	$addon = " AND (".implode(" OR ",$rule).") ";
	return $addon;
}




function chat_anno(){
	global $par,$depot;
	$html='';
	$noactive=0;
	$askclass='report';
	$title =$depot['lxs']['report'];

	$sql = "	
	
		SELECT	A1.*,
			DATE_FORMAT(chatdate,'%d.%m.%Y') AS ddate,
			DATE_FORMAT(chatdate,'%H.%i.%d.%m.%Y') AS d1,
			DATE_FORMAT(startdate,'%H.%i.%d.%m.%Y') AS d2,
			DATE_FORMAT(chatdate,'%w') AS wday,
			DATE_FORMAT(enddate,'%H.%i.%d.%m.%Y') AS d3,	
			GROUP_CONCAT(".PICS.".filename) AS ims 
		FROM
		(
			SELECT	
					".CHATL.".*
					
			FROM ".CHATL." 
			
			WHERE lang = \"".$depot['vars']['langid']."\" 
			AND startdate < NOW() 
			AND enddate > NOW()
			AND published=1
			ORDER BY chatdate DESC
			LIMIT 1
		) A1

		LEFT JOIN ".PICS."
		ON FIND_IN_SET(".PICS.".id, A1.images)
		GROUP BY A1.id
	";
			
	$res1=sqlquery_cached($sql,100,6);

	if (!count($res1)) {
			$noactive=1;
			$sql = "	
				SELECT	A1.*,
						DATE_FORMAT(chatdate,'%d.%m.%Y') AS ddate,
						DATE_FORMAT(chatdate,'%H.%i.%d.%m.%Y') AS d1,
						DATE_FORMAT(chatdate,'%w') AS wday,
						DATE_FORMAT(startdate,'%H.%i.%d.%m.%Y') AS d2,
						DATE_FORMAT(enddate,'%H.%i.%d.%m.%Y') AS d3,	
						GROUP_CONCAT(".PICS.".filename) AS ims 
				FROM
				(
					SELECT	
							".CHATL.".*
							
							
					FROM ".CHATL." 
					WHERE lang = \"".$depot['vars']['langid']."\" 
					AND chatdate >= DATE_SUB(NOW(), INTERVAL ".(isset($depot['enviro']['chat-report-days']) ? $depot['enviro']['chat-report-days']:2)." DAY) 
					AND published =1 
					
					GROUP BY ".CHATL.".id
					ORDER BY chatdate DESC
					LIMIT 1
				) A1
				LEFT JOIN ".PICS."
				ON FIND_IN_SET(".PICS.".id, A1.images)
				GROUP BY A1.id
			";

							
			$res1=sqlquery_cached($sql,100,6);
			if (!count($res1)) return;
	}




	foreach ($res1 as $res) {
		list ($day,$month,$year) = explode('.',$res['ddate']);
		$t1=explode('.',$res['d1']);
		
		if (!$noactive) {
			$askclass='ask';
			$title=$depot['lxs']['he_ask'];
		}

		$arr['listhead']=$depot['lxs']['he_chatconf'];


		$image='';
		if ($res['ims']) {
			$imas=explode(',',$res['ims']);
			$image="<img src='/media/gallery/tmb/".getImagePath($imas[0]).$imas[0]."' alt='announceimage' />";
		}
		$arr['chatlist'][]=array(	
					'link'		=>	$depot['vars']['language_link']."chat/".$res['id'],
					'image'		=>	$image,
					'date'		=>	$day,
					'month'		=>	$depot['lxs']['mona_'.$month],
					'ask'		=>	$title,
					'time'		=>	$t1[0].":".$t1[1],
					'nguest'	=>	getfromsql($res['nguest'],$depot['vars']['language']),
					'teaser'	=>	getfromsql($res['teaser'],$depot['vars']['language']),
					'classask'	=>	$askclass,
					'wday'		=>	$depot['lxs']['dw_'.$res['wday']]
				
		);
	}

	$depot['chatanno']=1;

	return parse_local($arr,'chatAnnounce',1);
}

function defineHeadlineEnviro(){
	global $depot;
	$sql=sqlquery("SELECT * FROM ".ENVIROHEADLINE);
	while ($res = mysql_fetch_assoc($sql)){
		$depot['environews'][$res['envid']] = $res['envalue'];
	}
}

function newsCollection ($params){
	global $depot,$par;	
	
	$possibleParams = array(
		'newsType',
		'noNewsType',
		'qty',
		'imageType',
		'headers',
		'extraConditions',
		'orderBy',
		'teasers',
		'rubric',
	);
	
	/*initialize*/
	foreach ($possibleParams as $v) {
		if (!isset($params[$v])) $params[$v] = false;
	}

	$addon="";
	
	/* include news types*/

	if (is_array($params['newsType'])) {
		$conditions=array();
		foreach ($params['newsType'] as $ntype) {
			$conditions[]=" ".NEWS.".ntype={$depot['article_keys'][$ntype]} ";
		}
		$condition=" ( " .implode(' OR ',$conditions)." ) ";
		$addon=" AND $condition ";
	} else {
		if ($params['newsType'])
			$addon=" AND ".NEWS.".ntype={$depot['article_keys'][$params['newsType']]}";
	}

	/* exclude news types*/

	if (is_array($params['noNewsType'])) {
		$conditions=array();
		foreach ($params['noNewsType'] as $ntype) {
			$conditions[]=" ".NEWS.".ntype <> {$depot['article_keys'][$ntype]} ";
		}
		$condition=" ( " .implode(' OR ',$conditions)." ) ";
		$addon=" AND $condition ";
	} else {
		if ($params['newsType'])
			$addon=" AND ".NEWS.".ntype <> {$depot['article_keys'][$params['noNewsType']]}";
	}
	
	/*default order*/

	if (!$params['orderBy']) $params['orderBy'] = " udate DESC ";


	/* extra conditions */
	
	if (is_array($params['extraConditions'])) {
		if (count($params['extraConditions']))
			$addon.=" AND ".implode(" AND ",$params['extraConditions']);
	} else {
		if (count($params['extraConditions']))
			$addon.=" AND ".$params['extraConditions'];
	}
	$limit=$params['qty'] ? $params['qty'] : 10;
	if ($params['rubric']) $addon.=ruleRubrickFromActiveNews($depot['rubrics'][$params['rubric']]['id']);
	$sql_query="
						
		SELECT 
			".NEWSHEAD.".id,
			".NEWSHEAD.".nheader,
			".NEWSHEAD.".nteaser,
			".NEWS.".ntype,
			".NEWS.".comments,
			".NEWS.".images,
			".NEWS.".urlkey,
			".NEWS.".photo,
			".NEWS.".video,
			".NEWS.".ndate,
			".NEWS.".udate,
			".STATCOMM.".qty

		FROM 
			".NEWSHEAD." USE KEY (PRIMARY)
		LEFT JOIN
			".NEWS."/* USE KEY (udate)	*/					
		ON  ".NEWSHEAD.".id = ".NEWS.".id
			LEFT JOIN	".STATCOMM." USE KEY (PRIMARY)			
		ON  ".NEWS.".id = ".STATCOMM.".id
		
		WHERE 1								
		AND		{$depot['mysql_time_factor']} 
		AND		approved = 1
				$addon

		ORDER BY {$params['orderBy']}
		LIMIT $limit
";

	$sql=sqlquery_cached($sql_query, 10, 1);	
	$items=array();
	
	foreach ($sql as $v){
		$image=false;
		if ($params['imageType']) {
			$impath=$params['imageType'];
			if ($v['images'])	{
				$images=get_selected_images($v['images'],$depot['vars']['language']);
				if (count($images)) {
					$image="<img src='/media/gallery/$impath/".$images[0]['filename']."'>";
				}
			} 
		}
		
		list($yy,$mm,$dd)=explode("-",$v['ndate']);
		$time=date("H:i",$v['udate']);

		if ($params['teasers']) {
			if ($teaser === true) {
				$teaser = getfromsql($v['nteaser'],$depot['vars']['language']);
			} else {
				$teaser = limit_text(getfromsql($v['nteaser'],$depot['vars']['language']),$params['teasers']);
			}
		} else $teaser="";
		$header=$params['headers'] ? $v['nheader'] : '';
		list ($y,$m,$d) = explode('-', $v['ndate']);


		$items['items'][]=array(
			'link'		=>	articleLink($v),
			'head'		=>	$header,
			'teaser'	=>	$teaser,
			'image'		=>	$image,
			'commstat'	=>	$v['qty']?$v['qty']:"",
			'dateverbal' =>	$dd." ".$depot['lxs']['mona_'.$mm],
			'date'		=>	$dd.".".$mm,
			'time'		=>	$time,
			'day'		=>	$d,
			'month'		=>	$m,
			'monthverb'	=>	$depot['lxs']['mona_'.$m],
			'mediaicon'	=>	mediaIcon($v)
		);
	}
	return $items;
}


function cleanLastIDCookie(){
	global $depot;
	/*	define last news id */
	$sql_last = "
		SELECT udate
		FROM ".NEWS." USE KEY(udate)
		WHERE lang = \"".$depot['vars']['langid']."\" 
		AND	{$depot['mysql_time_factor']}
		AND approved = 1
		ORDER BY udate DESC
		LIMIT 1
	";

	$sql_last_r = mysql_fetch_row(sqlquery($sql_last));
	setcookie('lastnewsid',$sql_last_r[0],time()+3600*6,'/');
	$depot['vars']['morejs'][] = "<script>var lastNewsID = ".$sql_last_r[0].";</script>";
}