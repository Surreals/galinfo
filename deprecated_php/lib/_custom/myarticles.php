<?


function myArticlesResult(){
	global $par,$depot,$logged_im;

	if (!in_array('2',$depot['vars']['perm'])) {
		$depot['errors'][]=$depot['lxs']['noaccess'];
		return errors();
	}

	$ttop="
			
	<a id='addcomment' href='/myaccount/articles/?a=new' style='margin-top:0px;'><p>".$depot['lxs']['addarticle']."</p></a>";
	if (!isset($par['a'])) $par['a'] = 'view';
	switch ($par['a']){
		case 'view'		: $ttop1=	myCivilView();	break; 
		case 'new'		: $ttop1=	myCivilAdd();	break;
		case 'edit'		: $ttop1=	myCivilAdd();	break;
		case 'savenew'	: $ttop1=	myCivilSave();	break;
		case 'saveedit' : $ttop1=	myCivilSave();	break;
		case 'dl'		: $ttop1=	myCivilDelete();	break;
	}
	return $ttop."<div class='clean'></div>".errors().oks().$ttop1;
}


function myCivilView(){
	global $par,$depot,$logged_im;
	$ttop="";
	$sql_count_text="SELECT COUNT(*) FROM ".NEWS." WHERE userid = \"".sqller($depot['logged_user']['usid'])."\" AND ".NEWS.".ntype = \"2\"";
	$sql_count=sqlquery($sql_count_text);
	$count=mysql_fetch_row($sql_count);

	if (!$count[0]) return parse_local(array('message'=>"<h3>".$depot['lxs']['norecords']."</h3><div class='clean'></div>"),'frameMessage',1);

	list($from,$to,$pages) = pager_calc(20,10,$count[0]);
	if ($to) $limit=" LIMIT $from,$to";

	$sql_all_text="
					SELECT	".NEWSHEAD.".*,
							".NEWS.".ndate,
							".NEWS.".approved
					FROM ".NEWS."
					LEFT JOIN ".NEWSHEAD."
					USING (id) 
					WHERE ".NEWS.".userid = \"".sqller($depot['logged_user']['usid'])."\" 
					AND ".NEWS.".ntype = \"2\"
					ORDER BY ".NEWS.".id DESC ".@$limit;

	$sql_all = sqlquery($sql_all_text);

	$ttop.="<ul class='tah mylist'>";
	while ($res= mysql_fetch_assoc($sql_all )) {
		$style='';
		if (!$res['approved']) $style=" style='background:#FFD3CC;'";
		$ttop.="
				<li $style>
					<ul>
						<li class='w70'><a href='/myaccount/articles/?a=edit&id=".$res['id']."'>&rarr;&nbsp;".$res['nheader']."</a></li>
						<li class='w30'><span class='rem'>".$res['ndate']."</span></li>
					</ul>
				</li>
		";
	}
	$ttop.="</ul>";
   	$ttop.= pager("/myaccount/articles/",$pages,10,array());
	return $ttop;
}


function myCivilDelete(){
	global $par,$depot,$logged_im; 
	$ttop="<form name='ad' method='post'><div class='clean'></div><div style='background:#e8eff5;border:#DDD solid 1px;padding:20px;'>";
	if (isset($par['godelete'])) {
		$ttop.="<h2>".$depot['lxs']['confirdelrecord']."</h2>";
		$ttop.="
			<div class='submitblock'>
				
				<input type=\"hidden\"  name=\"a\" value=\"dl\" />
				<input type=\"submit\" class=\"sbmt\" name=\"confirmdelete\" value=\"".$depot['lxs']['yes']."\" /> ";
			

		$ttop.="</div></form>";

		return $ttop;
	} else {
		sqlquery(
			
		"
					DELETE ".NEWS.",
						   ".NEWSB.",
						   ".NEWSHEAD.",

					FROM ".NEWS."
					LEFT JOIN ".NEWSB."
					USING (id) 
					LEFT JOIN ".NEWSHEAD."
					USING (id) 


					WHERE ".NEWS.".id = \"".sqller($par['id'])."\"
					AND ".NEWS.".userid = \"".sqller($depot['logged_user']['usid'])."\"
					AND ".NEWS.".ntype = \"2\"
					AND ".NEWS.".approved <> 1 "
					
		);

		if (mysql_affected_rows()>0){
			$depot['oks'][]=$depot['lxs']['recorddel'];
		} else {
		   $depot['oks'][]=$depot['lxs']['recorddelproblem'];
		}
	}
	freecache(1);
	return myCivilView();
	
}

function myCivilAdd(){
	global $par,$depot,$logged_im ;
	
	$ttop="<form name='ad' method='post'><div class='clean'></div><div style='background:#e8eff5;border:#DDD solid 1px;padding:20px;'>";
	$image="<img src='/im/noimage.gif' id='selectedimage'>";
	$image_id='';


	$themes_list=array('','- - - - - - - - - - - '.$depot['lxs']['crtheme']);
	$sql_themes_text="SELECT * FROM ".THEMES." WHERE lang = '".$depot['langs'][$par['lng']]['id']."' ORDER BY ndate DESC, ntime DESC";
	
	$sql_themes=mysql_query($sql_themes_text);
	while ($res_1 = mysql_fetch_assoc($sql_themes)){
		$themes_list[]=$res_1['id'];
		$themes_list[]=$res_1['nheader'];      
   }
				
	if ($par['a'] == 'edit') {

		
		$sql=sqlquery("
					SELECT ".NEWS.".*,
						   ".NEWSB.".nheader,
						   ".NEWSB.".nteaser,
						   ".NEWSB.".nbody
					FROM ".NEWS."
					LEFT JOIN ".NEWSB."
					USING (id) 
					WHERE ".NEWS.".id = \"".sqller($par['id'])."\"
					AND ".NEWS.".userid = \"".sqller($depot['logged_user']['usid'])."\"
					AND ".NEWS.".ntype = \"{$depot['newstype']['civilreporter']}\"");
		
		$res_e=mysql_fetch_assoc($sql);
		if (!isset($res_e['nheader']))	{
			$depot['errors'][]='WRONG ARTICLE ID';
			return myCivilView();
		}

		$par['nheader']		=  $res_e['nheader'] ;
		$par['nteaser']		=  $res_e['nteaser'] ;
		$par['nbody']		=  $res_e['nbody'] ;
		$par['crtheme']		=  $res_e['crtheme'] ;

		$images=get_selected_images($res_e['images'],$depot['lang']);
		
		$alttext='';
		
		if (count($images)) {
			$image="<img src='/gallery/intxt/".$images[0]['filename']."'";
			$image.=" alt='".trim(htmlspecialchars(getfromsql($res_e['nheader'],$depot['lang'])))."'";
			$alttext="title='".trim(htmlspecialchars(getfromsql($res_e['nheader'],$depot['lang'])))."'";
			$image.=" id='selectedimage' />";
			$image_id= $images[0]['id'];
		}


		$ttop.="<input type='hidden' name='id' value='".$par['id']."'>";
		
	}


	$ttop.="
				
				<label for=nheader>".$depot['lxs']['header']."</label>".bd_tar(@$par['nheader'],'nheader','98%','30px',1)."
				<label for=nteaser>".$depot['lxs']['teaser']."</label>".bd_tar(@$par['nteaser'],'nteaser','98%','60px',2)."
				<label for=nteaser>".$depot['lxs']['crtheme']."</label>".bd_popup(@$themes_list,'crtheme','width:98%',3,'')."
				<label for=nbody>".$depot['lxs']['blogtext']."</label>";
	$def_cont=(@$par['nbody']) ? $par['nbody'] : '-';
	$ttop.="	
				<textarea id=\"nbody\" name=\"nbody\" style=\"height:400px;width:98%;\">$def_cont</textarea>
				<script language=\"javascript1.2\">
				  generate_wysiwyg('nbody');
				</script>
				</div>";

	$sql_text="SELECT * FROm ".PICS." WHERE userid = \"".sqller($depot['logged_user']['usid'])."\" ORDER BY id DESC";
	$sql=sqlquery($sql_text);
	


	$im_selector="
					<div style='float:right;width:550px;height:150px;overflow:auto;background:#FFFFCC;'>
						<ul class='imselu'>
							<li><a href='/im/noimage.gif' id='0' rel='userimage' style='color:#E00;font-weight:bold'>X ".$depot['lxs']['noimage']."</a></li>
	";
	while($res=mysql_fetch_assoc($sql)) {
			
			$sel_class=($image_id == $res['id']) ? 'class="selected"' : '';
			$im_selector.="<li $sel_class><a href='/gallery/intxt/".getImagePath($res['filename']).$res['filename']."' class='imname' id='".$res['id']."' rel='userimage'>".$res['filename']."</a></li>";

			

	}
	$im_selector.="</ul></div><div class='clean'></div>";

	$image_holder="<div style='width:250px;height:150px;float:left;'>".$image."</div>";

	$ttop.="<label>".$depot['lxs']['newsillustration']."</label><div class='clean'></div>".$image_holder.$im_selector;

   $ttop.="
			<div class='submitblock pt30'>
				<input type=\"submit\" class=\"sbmt\" name=\"addne\" value=\"".$depot['lxs']['save']."\" />
				<input type=\"hidden\"  name=\"a\" value=\"save".$par['a']."\" />
				<input type=\"hidden\"  name=\"olda\" value=\"".$par['a']."\" />
				<input type=\"hidden\"	id=\"selimgs_images\" name=\"selimgs_images\" value=\"$image_id\">
			
	";

	if ($par['a'] == 'edit'  && !$res_e['approved'])  $ttop.="<input type=\"submit\" class=\"sbmt\" style=\"background:#000;margin-left:50px;\" name=\"godelete\" value=\"".$depot['lxs']['delete']."\" />";


	$ttop.="</div>";

	return $ttop."</form>";
}


function myCivilSave(){
	global $par,$depot,$logged_im,$enviro,$HTTP_POST_FILES;
	$ttop="";
	if (isset($par['godelete']))  return myCivilDelete();

	chk_req("nheader",$depot['lxs']['header']);
	chk_req("nbody",$depot['lxs']['blogtext']);
	chk_req("crtheme",$depot['lxs']['crtheme']);

	if (count($depot['errors'])) {
		$par['a']=$par['olda'];
		return myCivilAdd();
	}

	$ddate=date("Y-m-d",time());
	$time=date("H:i:s",time());

	/*
	$ddate=	$par['year']."-".$par['month']."-".$par['day'];
	$time=	$par['hour'].":".$par['min'].":00";	*/

	//echo $lngs1[$par['lang']][1];return;
	
	if ($par['selimgs_images']==0) $par['selimgs_images']='';

	switch ($par['a']) {
		case "savenew":	
						$sql=	"INSERT INTO ".NEWS."		SET  ndate		=	\"".sqller($ddate)."\",";
						$sql2=	"INSERT INTO ".NEWSB."		SET ";
						$sql3=	"INSERT INTO ".NEWSHEAD."	SET ";	
				
						break;
		case "saveedit":
						$sql=	"UPDATE ".NEWS."		SET ";
						$sql2=	"UPDATE ".NEWSB."		SET ";
						$sql3=	"UPDATE ".NEWSHEAD."	SET ";
						
						break;
	}



	$sql.="	
			images		=	\"".sqller($par['selimgs_images'])."\",
			ntime		=	\"".sqller($time)."\",
			userid		=	\"".sqller($depot['logged_user']['usid'])."\",
			lang		=	\"".sqller($depot['langs'][$par['lng']]['id'])."\",
			crtheme		=	\"".sqller($par['crtheme'])."\",
			ntype		=	\"".sqller($depot['newstype']['civilreporter'])."\",
			udate		=	UNIX_TIMESTAMP(CONCAT_WS(' ','".sqller($ddate)."','".sqller($time)."'))
			";


	$where='';

	if($par['a'] == 'saveedit'){
		$where =" 
					WHERE	id = \"".sqller($par['id'])."\"
					AND		userid = \"".sqller($depot['logged_user']['usid'])."\"
		";	
	}
	$sql=substr($sql,0,-1).$where;
	mysql_query($sql) or $depot['errors'][]= mysql_error();
	$no=0;
	
	if (count(@$depot['errors'])) return;



	if($par['a'] == 'savenew'){
		if (mysql_affected_rows()>0){
			$no=mysql_insert_id();
			$sql2.="	
					id			=	\"".$no."\",
					nheader		=	\"".sqller($par['nheader'])."\",
					nteaser		=	\"".sqller($par['nteaser'])."\",
					nbody		=	\"".sqller($par['nbody'])."\"";

			$sql3.="	
					id			=	\"".$no."\",
					nheader		=	\"".sqller($par['nheader'])."\",
					nteaser		=	\"".sqller($par['nteaser'])."\"";

			mysql_query($sql2);
			mysql_query($sql3);
			if (!(mysql_affected_rows()>0)) {
				
				mysql_query("DELETE FROM ".NEWS." WHERE id = $no");
				$depot['errors'][]="Problem adding NEWS body";
				$par['a']='new';
				return;
			}  else {
				$depot['oks'][]=$depot['lxs']['changesaved1'];
			}
		} else {
			$depot['errors'][]="Problem adding BLOG information";
			$par['a']='new';
			return;
		}
	} else {
		$no=sqller($par['id']);
		$sql2.="	
					nheader		=	\"".sqller($par['nheader'])."\",
					nteaser		=	\"".sqller($par['nteaser'])."\",
					nbody		=	\"".sqller($par['nbody'])."\"
					WHERE id = \"$no\"	
					";

		$sql3.="	
					nheader		=	\"".sqller($par['nheader'])."\",
					nteaser		=	\"".sqller($par['nteaser'])."\"
					WHERE id = \"$no\"	
					";

		mysql_query($sql2);
		mysql_query($sql3) or die(mysql_error());
		$depot['oks'][]=$depot['lxs']['changesaved1'];
	}

	freecache(1);
	//foreach ($par as $k=>$v) echo $k."=))".$v."<br>";
	return myCivilView();

}
?>