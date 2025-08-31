<?


function get_listblogs(){
	global $par,$errors,$oks,$gerrors,$depot,$enviro,$lxs;

	$arr=array();
	$columns=2;

	$path=$depot['vars']['language_link']."blogs/";

	if (isset($par['rubric_id'])) {

		//echo sqller(@$styles[$par['rubric_id']]['id']);
		$addon = " AND FIND_IN_SET(\"".$depot['rubrics'][$par['rubric_id']]['id']."\",`rubric`)";
		$path.=$par['rubric_id'].'/';
		$hdadd=" / ".sqller($depot['rubrics'][$par['rubric_id']]['title']);
	} else {
			$addon="";
			$hdadd="";
	}

	if (isset($par['blogger_id'])){
		$addon.=" AND ".NEWS.".userid = \"".$par['blogger_id']."\" ";
		$path=$depot['vars']['language_link']."bloggers/".$par['blogger_id']."/";
	}



	/*	ТОП БЛОГИ*/
		
	if ((!isset($par['pg']) || $par['pg'] ==0) && isset($par['blogger_id'])) {
		require_once(dirname(__FILE__).'/../etc/stuffrare.php');
		$arr1['topNewsUniversal']=topBlogs();
	}




	if (count(@$depot['excludenewsid'])) {
		$addon.=" AND ".NEWS.".id NOT IN(".implode(',',$depot['excludenewsid']).")";
	}


	


	/*calculate qty*/
	$sql_count="
			SELECT	COUNT(*) as qty
			FROM		".NEWS." 
			LEFT JOIN	".NEWSHEAD." 
			USING	(id)
			WHERE	lang = \"".$depot['vars']['langid']."\"
			AND		approved <> 0
			AND		ntype=20
			$addon";
	$sql_count_run=sqlquery_cached($sql_count,100,1);
	$count=$sql_count_run[0];
	list($from,$to,$pages) = pager_calc($depot['enviro']['qty_analytics_per_pa'],10,$count['qty']);


	if ($to) $limit=" LIMIT $from,$to"; else $limit="";



	$sql="
			SELECT	DISTINCT
				N1.id,
				N1.images,
				N1.ntype,
				N1.ndate,
				N1.ntime,
				N1.comments,
				N1.urlkey,
				".NEWSHEAD.".nheader,
				".NEWSHEAD.".nteaser,
				".FUSERS.".name,
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
							".NEWS.".comments,
							".NEWS.".urlkey

					FROM ".NEWS."
					WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
					AND		ntype=20
					AND		".NEWS.".approved=1
					AND		{$depot['mysql_time_factor']} 
					$addon
					ORDER BY udate DESC
					$limit
				
				)
		
		AS N1
		LEFT JOIN	".NEWSHEAD." 
		USING	(id)

		LEFT JOIN ".FUSERS."
		ON	N1.userid = ".FUSERS.".id

		LEFT JOIN ".PICSU."
		ON	".FUSERS.".id = ".PICSU.".userid
		
		";
	
	
	$sql_run=sqlquery_cached($sql,100,1);

	if (!isset($par['pg']) || $par['pg']==0) {
		
		$get_mn=1;
	} else {
		$get_mn=0;
	}

	$index=1;
	foreach ($sql_run as $res) {
		
		$avt=($res['filename']) ? "/media/avatars/tmb/".$res['filename'] : "/im/user.gif";
		$bloggername=getfromsql(
			str_replace(
					array(" ","  ","   ","    ","     ","      ","       "),
					"<br>",
					$res['name']),
			$depot['vars']['language']
		);
		
		$date_arr=explode('-',$res['ndate']);
		$time_arr=explode(':',$res['ntime']);


		$format_date1="<time>{$date_arr[2]} {$depot['lxs']['mona_'.$date_arr[1]]} {$date_arr[0]}</time>";
		
		$fdate1=$fdate2="";

		if (!isset($par['blogger_id'])) $fdate1=$format_date1; else $fdate2=$format_date1;

		$blogger="
				<a href=\"".$depot['vars']['language_link']."bloggers/".$res['uuserid']."/\" class=\"blogger\">
					<img src='$avt'>
					<span>
						<b>$bloggername</b>
						$fdate1
					</span>
					<em class='clean'></em>
				</a>";

		/*if bloggers profile*/
		if (isset($par['blogger_id'])) $blogger="";
		
		$images=get_selected_images($res['images'],$depot['vars']['language']);
		$image='';
		/*if (count($images)) {
			$image.="<a href='".articleLink($res)."'><img src='/media/gallery/tmb/".$images[0]['filename']."'";
			if (@$images[0]['title_'.$depot['vars']['language']]){
				$image.=" alt='".$images[0]['title_'.$depot['vars']['language']]."'";
			} else {
				$image.=" alt='news image'";
			}
			$image.=" /></a>";
		} else {*/
			$image=/*"<a href='".articleLink($res)."'><img src='/im/noimage.jpg' alt='noimage'></a>"*/$blogger;
			$blogger="";
		/*}*/


		$arr['article'][] = array (
									
			'link' => articleLink($res),
			'image'		=>	$image,
			'headerdate'=>	$fdate2,
			'headnews'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
			'teasnews'	=>	limit_text(getfromsql($res['nteaser'],$depot['vars']['language']), 200),
			'comments'	=>	$res['comments'] ? "<em class=\"astat\"><i class=\"acomm\"><em></em>{$res['qty']}</i></em>" : "",
			'blogger'	=> $blogger		
		);

		$index++;
	
		/*a bit overdo --retrieve meta*/
		if (isset($par['blogger_id']) && $index==2){
			$depot['vars']['title']=$res['name']." - ".$depot['lxs']['blogst'];
		}
	
	}

	if (@$par['pg']>0) $depot['vars']['title'].=" - ".$depot['lxs']['page']." ".($par['pg']+1);

	$arr1['analist'] = parse_local($arr,'blogsHomeList',1);
	$arr1['pager'] = pager($path,$pages,10,array());
	$arr1['anaheader'] = $depot['lxs']['blogsl'];
	return parse_local($arr1,'blogsHome',1);
}



function bloggersBox(){
	global $par,$depot;
	$arr=array();
	
	@list($ntype,$limit)=explode(",",$parameters);
	if (!isset($limit)) $limit = 10;

	/*MAIN BLOCK ARTICLE*/
	$sql= "	

		SELECT	DISTINCT
				".FUSERS.".id,
				".FUSERS.".name,
				".PICSU.".filename,
				T1.blogsqty

		FROM	".FUSERS." 
		LEFT JOIN	
					(
							SELECT userid, COUNT(*) as blogsqty
							FROM ".NEWS."
							WHERE userid <> 0
							AND ntype = 20
							AND approved=1
							AND		{$depot['mysql_time_factor']} 
							GROUP BY userid

					) AS T1

		ON ".FUSERS.".id = T1.userid

		LEFT JOIN ".PICSU."
		ON ".FUSERS.".id = ".PICSU.".userid
		
		WHERE /*".FUSERS.".approved <> ''
		AND	*/	T1.blogsqty <> 0
		ORDER BY T1.blogsqty DESC

	 ";

	$run_sql_main = sqlquery_cached($sql,30,1);


	
	if (count($run_sql_main)){

		foreach ($run_sql_main as $res){

			$avt=($res['filename']) ? "/media/avatars/tmb/".$res['filename'] : "/im/user.gif";

			$bloggername=getfromsql($res['name'],$depot['vars']['language']);

			$image="<img src='$avt'>";

		

			$arr['items'][]=array(
				'image'	=> $image,
				'link'	=>	"https://".$depot['vars']['subdomain1'].$depot['vars']['language_link']."bloggers/".$res['id']."/",
				'head'	=>	str_replace(array(" ","  ","    ")," ",$bloggername),
				'qty'	=>	$res['blogsqty']
			);

		}



	}

	return parse_local($arr,'boxBlogsAuthors',1);
}


?>