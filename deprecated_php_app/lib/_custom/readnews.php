<?

function get_newsread(){
	global $par,$depot;

	/*	IF NEWS ID PROVIDED	*/
	if (isset($par['newsid'])) {

		preg_match("/^(.+)_(\d+)$/",$par['newsid'],$matches);
		if (!isset($matches[1]) || !isset($matches[2])) {
			
			preg_match("/^(\d+)$/",$par['newsid'],$matches1);

			if (isset($matches1[1])){

				/*old site map exclusion*/
				if ($matches1[1] == '197187') $matches1[1] = '197190';

				$sql=sqlquery("SELECT * FROM ".NEWS." WHERE id = \"".sqller($matches1[1])."\"");
		
				if (!mysql_num_rows($sql)) {
					err404();
					return;
				} else {
					$newsObj=mysql_fetch_assoc($sql);
					return r301(articleLink($newsObj));
				}
			
			
			} else return err404();
		}

		if ($par['articletype']=='blogs'){
			if ($_SERVER['HTTP_HOST']!==$depot["vars"]['subdomain1']){
				header("Location: http://".$depot["vars"]['subdomain1'].$_SERVER['REQUEST_URI']."\n\r");
				return;
			}
		} else {
			if ($_SERVER['HTTP_HOST']!==$depot["vars"]['domain']){
				header("Location: http://".$depot["vars"]['domain'].$_SERVER['REQUEST_URI']."\n\r");
				return;
			}
		}
		
		$blogIs='';
		$approved=$timefactor=""; 

		if (!isset($_COOKIE['ediID'])) {
			$approved=" AND	".NEWS.".approved = \"1\" ";
			$timefactor = " AND		{$depot['mysql_time_factor']} ";
		}

		$blogIs=""; 
		$sql_n= "	
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nsubheader,
					".NEWSHEAD.".nteaser,
					".NEWSB.".nbody,
					".NEWSMETA.".ntitle,
					".NEWSMETA.".ndescription,
					".NEWSMETA.".nkeywords
			FROM		".NEWS." 
			LEFT JOIN	".NEWSB."		USING	(id)
			LEFT JOIN	".NEWSHEAD."	USING	(id)
			LEFT JOIN	".NEWSMETA."	USING	(id)
			WHERE		
				".NEWS.".id = \"".sqller($matches[2])."\"
			AND
				".NEWS.".urlkey = \"".sqller($matches[1])."\"
			AND	
				".NEWS.".ntype = \"".$depot['article_keys'][$par['articletype']]."\"
			$approved
			$timefactor
			$blogIs
			
		"; /*AND lang = \"".$depot['vars']['langid']."\"*/
		
		$the_news=sqlquery($sql_n);
		//echo $sql_n."<hr>";
		$depot['current_article'] = mysql_fetch_assoc($the_news);
		if (count($depot['current_article'])>2) {

			sqlquery("
				UPDATE ".STATVIEW." 
				SET qty = qty+1 
				WHERE id = \"".sqller($matches[2])."\"
			");

			if (!(mysql_affected_rows()>0)) {
				sqlquery("
					INSERT ".STATVIEW." 
					SET id = \"".sqller($matches[2])."\", 
						qty=2
				");
			}
			
			if ($depot['current_article']['rubric']) {
				$first_rubric=explode(',',$depot['current_article']['rubric']);
				$par['rubric_id'] = @$depot['cats'][$first_rubric[0]]['param'];
			} else {
				$par['rubric_id'] = 0;
			}
		} else {
			err404();
		}
	}


	/*$depot['vars']['title']			=	cleanMeta(getfromsql($depot['current_article']['nheader'],$par['lng']));
	$depot['vars']['description']	=	cleanMeta(getfromsql($depot['current_article']['nteaser'],$par['lng']));*/

	$dtitle			=	(trim($depot['current_article']['ntitle'])) ? $depot['current_article']['ntitle']: $depot['current_article']['nheader'];
	$ddescription	=	(trim($depot['current_article']['ndescription'])) ? $depot['current_article']['ndescription']:$depot['current_article']['nteaser'];
	$dkeywords		=	(trim($depot['current_article']['nkeywords'])) ? $depot['current_article']['nkeywords'] : mb_strtolower($depot['lxs']['news'],"UTF-8").extractKeywords($depot['current_article']);

	$depot['vars']['title']			=	cleanMeta(getfromsql($dtitle,$par['lng']));
	$depot['vars']['ogtitle']		=	"<meta property=\"og:title\" content=\"".str_replace('"','&quot;',getfromsql($dtitle,$par['lng']))."\" />";

	$depot['vars']['description']	=	cleanMeta(getfromsql($ddescription,$par['lng']));
	$depot['vars']['ogdescription']		=	"<meta property=\"og:description\" content=\"".str_replace('"','&quot;',getfromsql($ddescription,$par['lng']))."\" />";

	$depot['vars']['keywords']		=	$dkeywords;

	if (isset($par['print'])) return readnews();

	switch ($par['articletype']){
		case "articles":	$pattern="readArticles";	break;
		case "announcesw":	$pattern="readAnnounces";	break;
		case "blogs":		$pattern="readBlogs";		break;
		case "library":		$pattern="readLibrary";		break;
		default :			$pattern='readNews';
	}

	return parse_local(array(),$pattern,1);
}


/******************************************************************************************/

function readnews(){
	global $par,$depot;
	//variables to play with: head, date, link, headline, toplist = SET,
	$image='';
	$depot['excludenewsid'][]=$depot['current_article']['id'];
	$ogimage=false;
	$depot['vars']['replace_images']=array();
	
	if (!$depot['current_article']['layout']){
		if ($depot['current_article']['ntype'] == $depot['article_keys']['photo']){
			$imgclass='nimages';
			$pathimg='full';
			$pattern='readSlider';
		} else {
			$imgclass='nimages';
			$pathimg='intxt';
			$pattern='readSimple';
		}
	} else {
		if (in_array($depot['current_article']['layout'],array('1','10'))){
			$imgclass='nimages';
			$pathimg='intxt';
			$pattern='readSimple';
		} else {
			switch ($depot['current_article']['layout']) {
				case 2 :
					$imgclass='phimages';
					$pathimg='full';
					$pattern='readSlider';
					break;
				case 3 : 
					$imgclass='phimages';
					$pathimg='intxt';
					$pattern='readInlineImages';
					break;
				case 4 : 
					$imgclass='phimages';
					$pathimg='intxt';
					$pattern='readReport';
					break;
			}
		}
	}

	$body = $depot['current_article']['nbody'];

	if ($depot['current_article']['images'] && $depot['current_article']['layout'] !=='10') {

		$images=get_selected_images($depot['current_article']['images'],$depot['vars']['language']);
		$imageo='';
		$alttext='';
		if (count($images)) {

			if ($pattern=='readSlider' && count($images)>1) {
				if (!isset($par['print'])) {
					require_once("galleryview.php");
					$image=galleryViewer($images);
				} else {
					$image="<div class='$imgclass'>".photoSectionSocials($images,$pathimg)."</div>";
				}
			} else if ($pattern == 'readSimple' || $pattern == 'readReport') {
				$image="<div class='$imgclass'>".photoSectionSocials($images,$pathimg)."</div>";
			} else if ($pattern == 'readInlineImages') {
				$depot['vars']['replace_images'] = $images;
				$body = parseNewsBody($depot['current_article']['nbody']);
				$image="<div class='$imgclass'>".photoSectionSocials($images,$pathimg)."</div>";
			}
		}
	}
	
	if (isset($par['print'])) {
		if ($pattern == 'readSlider')
			$pattern="readSimple-print";
		else {
			/*$pattern.="-print";*/
			$pattern="readSimple-print";
		}
	}

	if ($depot['current_article']['showauthor']){
		if ($depot['current_article']['nauthorplus']){

			$auth="<div class=\"brick author\">
					<img src=\"/im/test/author.jpg\">
					<p>".$depot['lxs']['author']."</p>
					".$depot['current_article']['nauthorplus']."
					</div>";
		} else $auth='';
	} else $auth='';


	list($year,$month,$day)=explode('-',$depot['current_article']['ndate']);
	if ($par['articletype']!=='print') {
		$print="<a href='/".$par['lng']."/print/$year/$month/$day/".$par['newsid']."' class=printer target='_blank' rel='nofollow'>".$depot['lxs']['he_print']."</a>";
	} else $print='';

	$signed='';

	$topauth=$auth="";
	/*if ($par['articletype']=='blogs') {*/

	if ($depot['current_article']['ntype'] =='20' || ($depot['current_article']['showauthor'] && $depot['current_article']['userid'])){
		$blogger = sqlquery("	
			SELECT	".FUSERS.".*,
					".PICSU.".filename
			FROM ".FUSERS." 
			LEFT JOIN ".PICSU."
			ON	".FUSERS.".id = ".PICSU.".userid
			WHERE ".FUSERS.".id = \"".$depot['current_article']['userid']."\"
		");
		
		$res=mysql_fetch_assoc($blogger);
		$avt=($res['filename']) ? "/media/avatars/tmb/".$res['filename'] : "/im/user.gif";
		$bloggername=getfromsql(
			str_replace(
					array(" ","  ","   ","    ","     ","      ","       "),
					/*"<br>"*/" ",
					$res['name']),
			$depot['vars']['language']
		);

		if ($depot['current_article']['ntype'] =='20') {
			$blogger=array(
				"avatar"	=>	$avt,
				"link"		=>	"http://".$depot['vars']['subdomain1'].$depot['vars']['language_link']."bloggers/".$res['id']."/",
				"name"		=>	$bloggername,
				"twowords"	=>	$res['twowords']
			);
			$topauth=parse_local($blogger, "bloggerInfo",1);
		} else $auth="<a href=\"".$depot['vars']['language_link']."editor/".$res['id']."/\"  class=\"author\">".$bloggername."</a>";
	}

	/*RUBRIC CRUMB*/
	$crumbRubric="";
	if ($depot['current_article']['rubric']){
		$rarray=array();
		foreach (explode(',',$depot['current_article']['rubric']) as $v) {
			if (!isset($depot['cats'][$v])) continue;
			$rarray[]="<a href=\"".$depot['vars']['language_link'].$depot['cats'][$v]['param']."/\" class='rubricheader'>".
						$depot['cats'][$v]['title']."</a>";
		}

		$crumbRubric = implode("&nbsp;&nbsp;|&nbsp;&nbsp;",$rarray);
	}

	/*ARTICLE TYPE CRUMB*/
	$crumbType="<a href=\"".$depot['vars']['language_link'].$depot['article_types'][$depot['current_article']['ntype']]."/\">".
						mb_strtoupper($depot['lxs'][$depot['article_types'][$depot['current_article']['ntype']]],"utf8")."</a>";

	/*ADMIN EDITOR'S LINK*/
	if (isset($_COOKIE['ediID'])) {
		$editorlink = "<a href=\"/enginedoor/?act=addnews&su=edit&id=".$depot['current_article']['id']."&callback=http://".$_SERVER['HTTP_HOST'].$_SERVER["REQUEST_URI"]."\" class=\"editorslink\"><b>EDIT</b></a>";
	} else {$editorlink="";}


	$arr=array(
		'currentrubric' =>$crumbRubric,
		'currenttype'	=>$crumbType,

		'subheader'	=>	$depot['current_article']['nsubheader'] ?
								("<div class=\"brick subheader\">
								<em>".$depot['current_article']['nsubheader']."</em></div>") : "",

		'superauthor'=>	$auth,
		'blogauthor' =>	$topauth,	

		'fromrubric' => readRubricBlock($depot['current_article']['rubric']),
		'printlink'		=>	"http://".$_SERVER["HTTP_HOST"].$_SERVER['REQUEST_URI']."?print",
		'images'	=>	$image,
		'header'	=>	$depot['current_article']['nheader'],
		'teaser'	=>	$depot['current_article']['nteaser'],
		'body'		=>	parseNewsQuotes($body),
		'wday'		=>	$depot['lxs']['dw_'.date("w",$depot['current_article']['udate'])],
		'date'		=>	$day,
		'month'		=>	$depot['lxs']['mona_'.$month],
		'year'		=>	$year,
		'time'		=>	substr($depot['current_article']['ntime'],0,5),

		'tags'		=>	getTags($depot['current_article']['id']),
		'bytheme'		=> byTheme($depot['current_article']['bytheme']),
		/*'media'			=> mediaBlocknarrow($depot['current_article']['id']),*/

		'statcomm'	=>	$depot['current_article']['comments'] 
						? "<span class=\"commstat\"><em></em>".$depot['current_article']['comments']."</span>" : "",
		'signed'		=>	$signed,
		'relativenews'=> relativeNews($depot['current_article']['id'],$depot['current_article']['ndate']),
		'adminedit'		=> $editorlink
	);
	
	if (!$arr['subheader'] && !$arr['superauthor']) $arr['headerclass']='class="nobg"';
	$html= parse_local($arr,$pattern,1);
	return $html;
}


/***
*	relative news for article reading page
*/


function relativeNews($newsid, $newstime){
	global $par,$depot;
	$sqltext= "SELECT tagid FROM ".TAGMAP." WHERE newsid = $newsid ";
	$sql_run = sqlquery($sqltext);

	if (!mysql_num_rows($sql_run)) {
		   return;
	}	else {

		$sql1="
			SELECT	distinct	
				".NEWS.".id,
				".NEWS.".ntype,
				".NEWS.".comments,
				".NEWS.".images,
				".NEWS.".urlkey,
				".NEWS.".nweight,
				".NEWS.".photo,
				".NEWS.".video,
				".STATCOMM.".qty,
				".NEWSHEAD.".nheader

			FROM
				a_tags_map t11
				LEFT JOIN a_tags_map t12
				USING (tagid)
				
				LEFT JOIN a_news
				ON a_news.id = t12.newsid
				
			LEFT JOIN	".NEWSHEAD."
			ON  ".NEWS.".id = ".NEWSHEAD.".id

			LEFT JOIN  ".STATCOMM."
			ON  ".NEWS.".id = ".STATCOMM.".id
			
			WHERE 
			t11.newsid = '".sqller($newsid)."'
			AND t12.newsid <> '".sqller($newsid)."'
			
			AND lang = 1
			AND approved = 1
			AND {$depot['mysql_time_factor']}  
			ORDER BY udate DESC
			LIMIT ".$depot['enviro']['qty_relative_news']."
		";

		$sql=sqlquery_cached($sql1,10,1);
		$arr=array();
		if (!count($sql)) {
			return;
		}
		$i=0;
		foreach ($sql as $res) {
			$link="";
			$image='';
			if ($res['images'])	{
				$images=get_selected_images($res['images'],$depot['vars']['language']);
				if (count($images)) {
					$image="<a href='".articleLink($res)."'><img src='/media/gallery/tmb/".$images[0]['filename']."' class='headline'></a>";
				}
			} 
			if ($res['nweight']>0) $impclass=" class='imp'";
			/*	INFO BEDGE	*/
			$infobedge=$comments=$mediaicons="";
			$comments=$res['qty'] ? "<em class=\"inline-ico commentstat\">{$res['qty']}</em>" : "";
			$mediaicons=mediaIcon($res);
			if ($comments || $mediaicons) $infobedge=$comments.$mediaicons;

			$arr['bytheme'][]=array(
				'link'		=>	articleLink($res),
				'caption'	=> $res['nheader'],
				'image'		=>	$image,
				'infobedge'	=>	$infobedge,
				'impclass'	=>	@$impclass
			);
			$i++;
		}
		return parse_local($arr,'relativeBlock',1);
	}								  
}


/**
*	tags on article reading page
*/

function getTags($nid){
	global $depot;
	$sql="
		SELECT ".TAGS.".tag
		FROM 
			".TAGMAP." LEFT JOIN  ".TAGS." 
			ON tagid = id 
			WHERE newsid = \"".sqller($nid)."\" 
	";
	$sql_result=sqlquery_cached($sql,999,1);
	$tags=array();
	foreach ($sql_result as $v){
		$tags[]="<a href='http://".$depot['vars']['domain'].$depot['vars']['language_link']."tags/".urlencode($v['tag'])."/'>".$v['tag']."</a>";
	}

	if (count($tags)){
		return "
			<div id=\"tags\">
				".$depot['lxs']['tags'].": 
				".implode(', ',$tags)."
			</div>
		";
	}
}

function readRubricBlock($rid){
	global $depot;
	$news=fromRubric($rid,5);

	if (count($news)) return
		"
		<b>".$depot['lxs']['lastnews']."</b><br><br>
		<ul class=\"hot inlinelist\">
		".implode("\n",$news)."
		</ul>
	";
}

function mediaBlocknarrow(){
	global $depot;
	$news=mediaListBlock(2);
	if (count(@$news['newsline'])) return
		"
		<span class=\"boxheader\"><b>".$depot['lxs']['media']."</b></span>

		<ul class=\"mediablock narrowmedia\">
		".parse_local($news,"mediaBlock",1)."
		</ul>
	";
}

function byTheme($theme1){
	global $depot;
	$temp=array();
	foreach (explode(",",$theme1) as $l){
		if ($l) $temp[]=$l;
	}
	$theme=implode(",",$temp);
	if (!$theme) return;
	$sql=sqlquery_cached("
		SELECT 
			".NEWSHEAD.".id,
			".NEWSHEAD.".nheader,
			".NEWS.".ntype,
			".NEWS.".comments,
			".NEWS.".ndate,
			".NEWS.".urlkey,
			".STATCOMM.".qty
		FROM 
			".NEWSHEAD."
		LEFT JOIN
			".NEWS."
		USING(id)
		LEFT JOIN	".STATCOMM." USE KEY (PRIMARY)
		USING		(id)
		WHERE ".NEWSHEAD.".id IN($theme)
		AND approved = 1
		AND		{$depot['mysql_time_factor']} 
		ORDER BY FIELD(".NEWSHEAD.".id, $theme)

	", 999, 1);

	$news=array();

	foreach ($sql as $v){	
		list($y,$m,$d)=explode("-",$v['ndate']);
		$news[]="
			<li><em>$d ". $depot['lxs']["mona_".$m]."</em>
				<h3><a href=\"".articleLink($v)."\">".$v['nheader']."</a>".($v['qty']?'<em class="commentstat">'.$v['qty']."</em>":"")."</h3>
			</li>
		";
	}
	if ($news){
		return "
			<span class=\"boxheader\"><b>".$depot['lxs']['bytheme']."</b></span>
			<ul class=\"hot bytheme\">
				".implode("\n",$news)."
			</ul>
		";
	}
}

function hashOuterURLs($text){
	$pattern="~href(\s*)\=(\s*)[\"'](\s*)(http\://([\w\.\-]+)(/\S*)?)(\s*)[\"']~sU";
	/*preg_match($pattern,$text,$matches);
	print_r($matches);*/
	return preg_replace_callback ($pattern,'hashOuterURLsFunction',$text);
}

function hashOuterURLsFunction($matches){
		return hashThis(@$matches[4],@$matches[5],@$matches[0]);
}

function hashThis($address,$domain,$original){
	$ignoreDomains=array(
		"galinfo.com.ua",
		"www.galinfo.com.ua",
		"dev.galinfo.com.ua",
		"interfax.com.ua",
		"www.interfax.com.ua"					
	);
	
	if (!in_array($domain,$ignoreDomains)){
		return "href=\"http://".$_SERVER['HTTP_HOST']."/go/".base64_encode($address)."\" target=\"_blank\" ";
	} else return $original;
}

function parseNewsBody($text){
	global $par,$depot;
	$text=hashOuterURLs($text);
	$depot['vars']['replacedimages'] = array();
	$ogimage = false;

	if (count(@$depot['vars']['replace_images']))	{
		$depot['vars']['ogimage'] = "";

		// replace image ids into gallery
		$pattern="~\{\{(\d+)\}\}~sU";
		$text=preg_replace_callback($pattern,
			function($m){
				global $depot,$par;
				$depot['vars']['replacedimages'][] = $m[1];
				if (!$depot['vars']['ogimage']) {
					$depot['vars']['ogimage']="<meta property=\"og:image\" content=\"http://".$_SERVER['HTTP_HOST']."/media/gallery/intxt/".$depot['vars']['replace_images'][($m[1]-1)]['filename']."\" />";
				}

				return "
					<figure class=\"inlineslide\" id=\"f".$m[1]."\">
						<a href=\"/media/gallery/full/".$depot['vars']['replace_images'][($m[1]-1)]['filename']."\" class=\"inlinea\">
							<img src=\"/media/gallery/intxt/".$depot['vars']['replace_images'][($m[1]-1)]['filename']."\">
						</a>
						<figcaption>".trim(htmlspecialchars(getfromsql($depot['vars']['replace_images'][($m[1]-1)]['title_'.$par['lng']],$depot['vars']['lang'])))."</figcaption>
					</figure>";
			},
		$text);
	}
	return $text;
}

function parseNewsQuotes($text){
	global $par,$depot;
	// replace news IDs with quotautio
	$pattern="~\[\[(\d+)\]\]~sU";
	$text=preg_replace_callback($pattern,
		function($m){
			global $depot,$par;

			$sql=sqlquery_cached("
				SELECT 
					".NEWSHEAD.".id,
					".NEWSHEAD.".nheader,
					".NEWS.".ntype,
					".NEWS.".urlkey
				FROM 
					".NEWSHEAD."
				LEFT JOIN
					".NEWS."
				USING(id)
				WHERE ".NEWSHEAD.".id = ".$m[1]."
				AND approved = 1
				AND		{$depot['mysql_time_factor']}
			", 999, 1);

			return "<p><a href=\"".articleLink($sql[0])."\" class=\"bytheway\">".$sql[0]['nheader']."</a>";
			},
		$text);
	return $text;
}

function photoSectionSocials($collection, $path){
	global $depot,$par;
	$image="";
	$ogimage = false;
	$id=1;

	
	//$startfrom = isset($depot['vars']['replacedimages']) ? $depot['vars']['replacedimages'] : 0;
	foreach ($collection as $cimage){
		if (isset($depot['vars']['replacedimages']) && in_array($id,$depot['vars']['replacedimages'])) {
			$id++;
			continue;
		}

		$image.="	
			<figure class=\"inlineslide\" id=\"f".$id."\">
				<a href=\"/media/gallery/full/".$cimage['filename']."\" class=\"inlinea\">
					<img src=\"/media/gallery/".$path."/".$cimage['filename']."\">
				</a>
				<figcaption>".htmlspecialchars($cimage['title_'.$par['lng']])."</figcaption>
			</figure>
		";
		if (!$ogimage) {
			
			$depot['vars']['ogimage']="<meta property=\"og:image\" content=\"http://".$_SERVER['HTTP_HOST']."/media/gallery/$path/".$cimage['filename']."\" />";
			$ogimage=true;
		}
		$id++;
	}
	return $image;
}