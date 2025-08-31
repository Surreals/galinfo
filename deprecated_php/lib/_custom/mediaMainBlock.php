<?

$depot['vars']['mod_result'] = mediaMAINBlock();

/*
**	ÌÅÄ²À.ÃÎËÎÂÍÅ BLOCK	*/

function mediaMAINBlock($random=0){
	global $depot,$par;

	$sql=sqlquery_cached("
						
						SELECT 
							".NEWSHEAD.".id,
							".NEWSHEAD.".nheader,
							".NEWSHEAD.".nsubheader,
							".NEWS.".ntype,
							".NEWS.".comments,
							".NEWS.".images,
							".NEWS.".urlkey,
							".NEWS.".printsubheader,
							".STATCOMM.".qty
						FROM 
							".NEWSHEAD."
						LEFT JOIN
							".NEWS."
						
						USING(id)

						LEFT JOIN	".STATCOMM." USE KEY (PRIMARY)
						USING		(id)

						WHERE approved=1
						AND		{$depot['mysql_time_factor']} 
						AND	".NEWS.".ntype =21
					
						ORDER BY ndate DESC, ntime DESC
						LIMIT 5

	", 10, 1);


	$news=array();
	
	$index=1;
	$articles_qty=count($sql);
	$article_type="";

	if (!$articles_qty) return;

	foreach ($sql as $v){
		$image="<img src='/media/tmb-default.jpg'>";
		if ($v['images'])	{
			$images=get_selected_images($v['images'],$depot['vars']['language']);
			if (count($images)) {
				$image="<img src='/media/gallery/tmb/".$images[0]['filename']."'>";
			}
		} 

		$class = ($articles_qty==$index) ? 'class="mr0"': "";
		
		$subheader=($v['printsubheader']) ? "<span class='sheader tline'>".getfromsql($v['nsubheader'],$par['lng'])."</span>" : "";

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
									/*"type"		=>	$depot['lxs'][$depot['article_types'][$v['ntype']]],*/
									"class"		=>	$class,
									"subheader"	=>	$subheader
		);
		
		$index++;
		$article_type=$v['ntype'];
	}
	
	if ($random && is_array($news["newsline"])) shuffle($news["newsline"]);

	if (count($news['newsline'])) 
	
	return
		"<a class=\"boxheader\" href=\"".$depot['vars']['language_link'].$depot['article_types'][$v['ntype']]."/\"><b>".$depot['lxs']['mainmedia']."</b></a>
		<ul class=\"mediablock\">
			".parse_local($news,"mediaBlock",1).
		"</ul>";

}

?>