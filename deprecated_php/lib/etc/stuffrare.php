<?

function topNewsUniversal($dpar){
	global $par,$depot;
	//variables to play with: link,image,day,month,year,header,teaser
	$addon="";
	$ttop="";

	$articletype=$dpar;

	if ($articletype == 'articles' || $articletype == 'news'){
		$addon='';
		if (@$par['rubric_id']) {	
			$addon.= " AND FIND_IN_SET(\"".$depot['rubrics'][$par['rubric_id']]['id']."\", ".NEWS.".rubric) ";
		}
	} 
	
	$addon.=" AND ntype = {$depot['article_keys'][$articletype]} ";

	$sql= "	
			SELECT	".NEWS.".*,
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nteaser
			FROM		".NEWS." 
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)
			WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
			AND		nweight>=1
			AND		approved=1
			AND		{$depot['mysql_time_factor']}
			AND		images <> ''
			$addon
			ORDER BY udate DESC
			LIMIT 1	
		";
		

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

		$link=articleLink($res);

		$addclass='';
		if ($frameid == 1) $addclass=" cleft";
		if ($frameid == 3) $addclass=" cright";

		$arr['item'][]=array(
			'addclass'		=>	$addclass,	
			'image'		=>	$image,	
			'link'		=>	$link,
			'alttext'	=>	$alttext, 
			'header'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
			'teaser'	=>	limit_text(getfromsql($res['nteaser'],$depot['vars']['language']),300),
		
		);

		$frameid++;
	}
	return parse_local($arr,'topNewsUniversal', 1);
}


function topBlogs(){
	global $par,$depot;
	//variables to play with: link,image,day,month,year,header,teaser
	$addon="";
	$ttop="";

	if (isset($par['blogger_id'])) return bloggerProfile($par['blogger_id']);	
	$addon.=" AND ntype = {$depot['article_keys']['blogs']} ";
	$sql="
			SELECT	DISTINCT
				N1.id,
				N1.images,
				N1.ntype,
				N1.ndate,
				N1.ntime,
				N1.urlkey,
				".NEWSHEAD.".nheader,
				".NEWSHEAD.".nteaser,
				".FUSERS.".name,
				".FUSERS.".twowords,
				".FUSERS.".id as uuserid,
				".PICSU.".filename
			
		FROM	
				(	SELECT  
							".NEWS.".id,
							".NEWS.".images,
							".NEWS.".userid,
							".NEWS.".ntype,
							".NEWS.".ndate,
							".NEWS.".ntime,
							".NEWS.".urlkey
					FROM ".NEWS."
				
					WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
					AND		ntype=20
					AND		nweight >=0 
					AND		".NEWS.".approved=1
					AND		userid <> 0
					AND		{$depot['mysql_time_factor']} 
					ORDER BY udate DESC
					LIMIT	5
			
				)
		
		AS N1
		LEFT JOIN	".NEWSHEAD." 
		USING	(id)

		LEFT JOIN ".FUSERS."
		ON	N1.userid = ".FUSERS.".id

		LEFT JOIN ".PICSU."
		ON	".FUSERS.".id = ".PICSU.".userid

		GROUP BY uuserid

		LIMIT 2
		
		";
		
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
		}

		$date_arr=explode('-',$res['ndate']);
		$time_arr=explode(':',$res['ntime']);

		$format_date="<em class='ordate'>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]} {$date_arr[0]} <b>{$time_arr[0]}:{$time_arr[1]}</b></em>";

		$addclass='';

		$avt=($res['filename']) ? "<img src='/media/avatars/".$res['filename']."'>" : "";

		$bloggername=getfromsql(
								str_replace(
										array(" ","  ","   ","    ","     ","      ","       "),
										"<br>",
										$res['name']),
								$depot['vars']['language']
					);
		
		$devider = ($frameid==count($sqlr)) ? "" : "<div class='devider'></div>"; 

		$arr['item'][]=array(
								'addclass'	=>	$addclass,	
								'image'		=>	$image,	
								'link'		=>	articleLink($res),
								'alttext'	=>	$alttext, 
								'header'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
								'teaser'	=>	limit_text(getfromsql($res['nteaser'],$depot['vars']['language']),300),
								'avt'		=>	$avt,
								'blogger'	=>	"<a href=\"".$depot['vars']['language_link']."bloggers/".$res['uuserid']."/\" class=\"topblogger fserif\">".$res['name']."</a>",
								'twowords'	=>	getfromsql($res['twowords'],$depot['vars']['language']),
								'headerdate'=>	$format_date,
								"devider"	=>	$devider
		);
		$frameid++;
	}
	return parse_local($arr,'topBlogs', 1);
}



function bloggerProfile($userid){
	global $depot,$par;

	$sql=sqlquery(
				"
				SELECT ".FUSERS.".name ,
						".FUSERS.".shortinfo,
						".FUSERS.".twowords,
						".PICSU.".filename
				FROM ".FUSERS."
				LEFT JOIN ".PICSU."
				ON ".FUSERS.".id = ".PICSU.".userid
				WHERE ".FUSERS.".id = \"".sqller($userid)."\"
	"	
	);

	if (!conn_sql_num_rows($sql)>0) err404();
	
	$res=conn_fetch_assoc($sql);

	if (!$res['filename']) $res['filename']="/im/user.gif"; else $res['filename']="/media/avatars/".$res['filename'];

	$arr=array(
				"image"	=>	"<img src=\"{$res['filename']}\">",
				"name"	=>	$res['name'],
				"twowords" => $res['twowords'],
				"bloggerinfo"	=>	nl2br($res['shortinfo'])

		/*"bloggerinfo"	=>	nl2br(htmlspecialchars($res['shortinfo']))*/

	);

	if (isset($par['blogger_id'])){
		$depot['vars']['description']=htmlspecialchars(strip_tags(str_replace(array("\r","\n"),"",$res['shortinfo'])));
		$depot['vars']['keywords']=htmlspecialchars(strip_tags($res['name']." ".$res['twowords']));
	}
	return parse_local($arr,"blogsProfile",1);
}
