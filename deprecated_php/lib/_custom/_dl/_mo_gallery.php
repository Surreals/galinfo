<?
$vars['mod_result']=get_gallery();


function get_gallery(){
	global $par,$errors,$oks,$gerrors,$vars,$lxs;

	if (isset($par['gq'])) return search_gallery();

	$ttop="";
	$vars['title']=@$lxs['he_zik']." - ".@$lxs['he_zike']." | ".$lxs['he_gallery'];

	$sql="
			SELECT COUNT(*) 
			FROM ".PICS.",".PICTYPE." 
			WHERE ".PICS.".pic_type = ".PICTYPE.".id
			AND ".PICTYPE.".isvisible = 1 
			";
	$common="/".$par['lng']."/gallery/";

	if (isset($par['imkwd'])) {
		$sql.=" AND kwd = \"".sqller($par['imkwd'])."\"";
		$common.=$par['imkwd']."/";
	}
	$count=mysql_fetch_row(sqlquery($sql));
	
	list($from,$to,$pages) = pager_calc(18,10,$count[0]);
	
	
	$sql_1="
			SELECT ".PICS.".*
			FROM ".PICS.",".PICTYPE." 
			WHERE ".PICS.".pic_type = ".PICTYPE.".id
			AND ".PICTYPE.".isvisible = 1 
			";

	if (isset($par['imkwd'])) {
		$sql_1.=" AND kwd = \"".sqller($par['imkwd'])."\"";
	}
	$sql_1.=" ORDER BY ".PICS.".id DESC";
	if ($to) $sql_1.=" LIMIT $from,$to";
	

	$sql_1_run=sqlquery($sql_1);

	/*		COMPOSE ARRAY	*/

	//echo $from."---".$to."---".$count[0]."---".mysql_num_rows($sql_1_run)."<br>".$sql_1;
	
	$imagelist='';
	
	for ($i=0;$i<mysql_num_rows($sql_1_run);$i++){
		$res=mysql_fetch_assoc($sql_1_run);
		if ($i==0){
			if ($res['raw']) {
				$size=filesize($_SERVER['DOCUMENT_ROOT']."/gallery/raw/".$res['filename']);
				$kb_size=sprintf("%.2f",($size/1024));
				$download="<a href='/gallery/raw/".$res['filename']."' target='_blank'>".$lxs['he_downraw']." ($kb_size ".$lxs['he_kb'].")</a>";
			} else {
				$download='';
			}
			$arr=array(
					'header' => $lxs['he_gallery'],
					'image' =>	'<img src="/gallery/full/'.$res['filename'].'" id="galleryImage">',
					'imageinfo'=>'<span id=text><p> '.getfromsql($res['title_'.$par['lng']],$par['lng']).' </p></span>',
					'imagedown'=>'<span id=download>'.$download.'</span>',
			);
		}

		$imagelist.="<a href='/gallery/full/".$res['filename']."' id='".$par['lng']."___".$res['id']."' rel='tmb'  title='".htmlspecialchars(getfromsql($res['title_'.$par['lng']],$par['lng']))."'><img src='/gallery/tmb/".$res['filename']."' alt='".htmlspecialchars(getfromsql($res['title_'.$par['lng']],$par['lng']))."'></a>";
	}
	$arr['imgmenu']=gallery_menu();
	$arr['imagelist']=$imagelist;
	$arr['pager']=pager($common,$pages,10,array());

	$ttop.=parse_local($arr,'_gallery');
	return $ttop;

}


function gallery_menu($qty=0){
	global $par,$errors,$oks,$gerrors,$vars,$lxs,$b2;
	$ttop="";
	subselect2();
	Lload('forms');
	$sql=mysql_query("SELECT * FROM ".PICTYPE." ORDER BY id");
	if (!isset($par['imkwd'])) $par['imkwd'] = '124hpqowefnPQ9732Y5108UJ209TJ203FJ102FJ1092JF1324U-91283451928H4598234T13KJ4RTG';
	$ttop.="<form name=suche method=get action='/".$par['lng']."/gallery/search/'>";
	$ttop.="<input type='text' name='gq' value='' class='srch' style='width:140px;'>";
	$ttop.="<input type='submit' name='go' value='".$lxs['he_search']."' class='sbmt' style='width:80px;'></form>";
	
	if (trim(@$par['gq'])) {
		$ttop.=htmlspecialchars($par['gq']);
		$ttop.=": <b>".$qty."</b>";
	}
	$ttop.="<div id=menu><ul id=menu1>";
	$firstlevel=1;
	$sstart="/".$par['lng']."/gallery/";
	$slink='';
	$cpath=array();
	foreach ($b2 as $cat){ 
		if (!$cat['isvisible']) continue;
		$plink='';
		$class=($cat['level'] == 1) ? "level1" : "level2";
		if ($cat['kwd'] == $par['imkwd'] && $par['imkwd']!==0) 
		{
			$class='level1a';
		}
	
		if ($firstlevel < $cat['level']){
			$ttop.="<ul>";
		} else if ($firstlevel > $cat['level']){
			$tokill = $firstlevel - $cat['level'];
			while ($tokill){
				array_pop($cpath);
				$ttop.="</ul>";
				$tokill--;
			}
		}

		if (count($cpath)){
			$slink=$sstart.$plink.$cat['kwd']."/";
		} else {
			$slink=$sstart.$cat['kwd']."/";
		}

		$firstlevel = $cat['level'];
		$adclass=($par['imkwd'] == $cat['kwd']) ? 'class=active' : '';
		$ttop.="<li><a href=\"".$slink."\"  $adclass>".$cat['name_'.$par['lng']]."</a>";

	}

	while ($firstlevel>1){
			$ttop.="</ul>";
			$firstlevel--;
	}
	
	$ttop.="</ul></div>";




	return $ttop;
}


function search_gallery(){
	global $par,$errors,$oks,$gerrors,$vars,$lxs;
	$ttop="";
	$vars['title']=$lxs['he_search'];
	if (!$par['gq'] or strlen(trim($par['gq']))<3){
		$arr['header']=$lxs['he_search'];
		$arr['image']="<br><br><h1 style='color:#FFF;'>".$lxs['he_noresults']."</h1><br><br><br><br>"."<h2>".$lxs['he_wrongquery']."</h2>";
		$arr['imgmenu']=gallery_menu();
		return parse_local($arr,'_gallery');
	}

	$word_array=explode(" ",trim($par['gq']));
	$word_good=array();
	foreach($word_array as $word){
		$r=trim($word);
		if ($r !== '')  {
			$word_good[]=$r;
		}
		if (count($word_good)>5) break;
	}

	$plus_word='';
	foreach ($word_good as $k){
		$plus_word.="+".$k." ";
	}




	$sql="
			SELECT COUNT(*) 
			FROM ".PICS.",".PICTYPE." 
			WHERE ".PICS.".pic_type = ".PICTYPE.".id
			AND ".PICTYPE.".isvisible = 1 
			AND MATCH(title_ua,title_ru,title_en,title_pl) AGAINST ('".sqller(trim($plus_word))."' IN BOOLEAN MODE)
			";
	$cnt=sqlquery($sql);
	$count=mysql_fetch_row($cnt);

	if (!$count[0]){
		$arr['header']=$lxs['he_search'];
		$arr['image']="<br><br>"."<h1>".htmlspecialchars(addslashes($par['gq']))."</h1><br><br><br><br><h2>".$lxs['he_noresults']."</h2>".$lxs['he_tryagain'];
		$arr['imgmenu']=gallery_menu();
		return parse_local($arr,'_gallery');
	}

	list($from,$to,$pages) = pager_calc(18,10,$count[0]);
	
	
	$sql_1="
			SELECT ".PICS.".*
			FROM ".PICS.",".PICTYPE." 
			WHERE ".PICS.".pic_type = ".PICTYPE.".id
			AND ".PICTYPE.".isvisible = 1 
			AND MATCH(title_ua,title_ru,title_en,title_pl) AGAINST ('".sqller(trim($plus_word))."' IN BOOLEAN MODE)
			";
	$sql_1.=" ORDER BY ".PICS.".id DESC";
	if ($to) $sql_1.=" LIMIT $from,$to";
	$sql_1_run=sqlquery($sql_1);

	/*		COMPOSE ARRAY	*/

	//echo $from."---".$to."---".$count[0]."---".mysql_num_rows($sql_1_run)."<br>".$sql_1;
	$common='/'.$par['lng'].'/gallery/search/?gq='.$par['gq'];
	$imagelist='';
	
	for ($i=0;$i<mysql_num_rows($sql_1_run);$i++){
		$res=mysql_fetch_assoc($sql_1_run);
		if ($i==0){
			if ($res['raw']) {
				$size=filesize($_SERVER['DOCUMENT_ROOT']."/gallery/raw/".$res['filename']);
				$kb_size=sprintf("%.2f",($size/1024));
				$download="<a href='/gallery/raw/".$res['filename']."' target='_blank'>".$lxs['he_downraw']." ($kb_size ".$lxs['he_kb'].")</a>";
			} else {
				$download='';
			}
			$arr=array(
					'header' => $lxs['he_gallery'],
					'image' =>	'<img src="/gallery/full/'.$res['filename'].'" id="galleryImage">',
					'imageinfo'=>'<span id=text><p> '.getfromsql($res['title_'.$par['lng']],$par['lng']).' </p></span>',
					'imagedown'=>'<span id=download>'.$download.'</span>',
			);
		}

		$imagelist.="<a href='/gallery/full/".$res['filename']."' id='".$par['lng']."___".$res['id']."' rel='tmb'  title='".htmlspecialchars(getfromsql($res['title_'.$par['lng']],$par['lng']))."'><img src='/gallery/tmb/".$res['filename']."' alt='".htmlspecialchars(getfromsql($res['title_'.$par['lng']],$par['lng']))."'></a>";
	}
	$arr['imgmenu']=gallery_menu($count[0]);
	$arr['imagelist']=$imagelist;
	$arr['pager']=pager($common,$pages,10,array());
	$vars['title']=$lxs['he_search'].": ".$par['gq'];
	$ttop.=parse_local($arr,'_gallery');
	return $ttop;

}
?>