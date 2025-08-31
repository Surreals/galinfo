<?


function myBlogResult(){
	global $par,$depot,$logged_im;

	$ttop="";

	if (!in_array('1',$depot['vars']['perm'])) {
		$depot['errors'][]=$depot['lxs']['noaccess'];
		return errors();
	}
			


	if (!isset($par['a'])) $par['a'] = 'view';

	if ($par['a']=='view') 	$ttop.="<a class='likebutton' href='/myaccount/blog/?a=new' style='float:right;'><p>".$depot['lxs']['addblog']."</p></a>";


	switch ($par['a']){
		case 'view'		: $ttop1=	myBlogView();	break; 
		case 'new'		: $ttop1=	myBlogAdd();	break;
		case 'edit'		: $ttop1=	myBlogAdd();	break;
		case 'savenew'	: $ttop1=	myBlogSave();	break;
		case 'saveedit' : $ttop1=	myBlogSave();	break;
		case 'dl'		: $ttop1=	myBlogDelete();	break;
	}
	return $ttop."<div class='clean'></div>".errors().oks().$ttop1;
}


function myBlogView(){
	global $par,$depot,$logged_im;
	$ttop="";


	$sql_count_text="SELECT COUNT(*) FROM ".NEWS." WHERE userid = \"".sqller($depot['logged_user']['usid'])."\" AND ntype=20";

	/*$sql_count_text="SELECT COUNT(*) FROM ".NEWS." WHERE  ntype=20";*/

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
					AND ntype=20
					ORDER BY ".NEWS.".id DESC ".@$limit;

	
	/*$sql_all_text="
					SELECT	".NEWSHEAD.".*,
							".NEWS.".ndate,
							".NEWS.".approved
					FROM ".NEWS."
					LEFT JOIN ".NEWSHEAD."
					USING (id) 
					WHERE  ntype=20
					ORDER BY ".NEWS.".id DESC ".@$limit;*/



	$sql_all = sqlquery($sql_all_text);

	$ttop.="<ul class='tbl mylist'>";
	while ($res= mysql_fetch_assoc($sql_all )) {
		$style='';
		if (!$res['approved']) $style=" class='notapproved'";
		$ttop.="
				<li $style>
					<ul>
						<li class='w70'><a href='/myaccount/blog/?a=edit&id=".$res['id']."'>".$res['nheader']."</a></li>
						<li class='w30'><span class='rem'>".$res['ndate']."</span></li>
					</ul>
				</li>
		";
	}

	$ttop.="</ul>";

   	$ttop.= pager("/myaccount/blog/",$pages,10,array());

	return $ttop;
}


function myBlogDelete(){
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
						   ".NEWSHEAD."

					FROM ".NEWS."
					LEFT JOIN ".NEWSB."
					USING (id) 

					LEFT JOIN ".NEWSHEAD."
					USING (id) 


					WHERE ".NEWS.".id = \"".sqller($par['id'])."\"
					AND ".NEWS.".userid = \"".sqller($depot['logged_user']['usid'])."\"
					AND ntype=20
					AND ".NEWS.".approved <> 1 "
					
		);

		if (mysql_affected_rows()>0){
			$depot['oks'][]=$depot['lxs']['recorddel'];
		} else {
		   $depot['oks'][]=$depot['lxs']['recorddelproblem'];
		}
	}
	freecache(5);
	return myBlogView();
	
}

function myBlogAdd(){
	global $par,$depot,$logged_im ;
	

	$ttop="
				<form name='ad' method='post'>
					<div class='clean'></div>";
	
				
	if ($par['a'] == 'edit') {

		
		$sql=sqlquery("
					SELECT ".NEWS.".*,
						   ".NEWSHEAD.".nheader,
						   ".NEWSHEAD.".nteaser,
						   ".NEWSB.".nbody
					FROM ".NEWS."
					LEFT JOIN ".NEWSB."
					USING (id) 
					LEFT JOIN ".NEWSHEAD."
					USING (id) 
					WHERE ".NEWS.".id = \"".sqller($par['id'])."\"
					AND ".NEWS.".userid = \"".sqller($depot['logged_user']['usid'])."\"
					AND ".NEWS.".ntype	= 20 ");
		


		$res_e=mysql_fetch_assoc($sql);

		if (!isset($res_e['nheader']))	{
			$depot['errors'][]='WRONG BLOG ID';
			return myBlogView();
		}

		$par['nheader']		=  $res_e['nheader'] ;
		$par['nteaser']		=  $res_e['nteaser'] ;
		$par['nbody']		=  $res_e['nbody'] ;

		$ttop.="<input type='hidden' name='id' value='".$par['id']."'>";
		
	}


	$ttop.="
				
				<label for=nheader class='label'><b>".$depot['lxs']['header']."</b></label>".bd_tar(@$par['nheader'],'nheader','98%','30px',1)."
				<br><br><label for=nteaser><b>".$depot['lxs']['teaser']."</b></label>".bd_tar(@$par['nteaser'],'nteaser','98%','60px',2)."
				<br><br><label for=nbody><b>".$depot['lxs']['blogtext']."</b></label>";
	$def_cont=(@$par['nbody']) ? $par['nbody'] : '&nbsp;';
	$ttop.="	
				<textarea id=\"nbody\" name=\"nbody\" style=\"height:400px;width:98%;\">$def_cont</textarea>
				<script language=\"javascript1.2\">
				  CKEDITOR.replace( 'nbody' );
				</script>
				
				";
	
   $ttop.="
			<div class='submitblock pt30'>
				<input type=\"submit\" class=\"sbmt\" name=\"addne\" value=\"".$depot['lxs']['save']."\" />
				<input type=\"hidden\"  name=\"a\" value=\"save".$par['a']."\" />
			
	";

	if ($par['a'] == 'edit' && !$res_e['approved'])  $ttop.="<input type=\"submit\" class=\"sbmt\" style=\"background:#000;margin-left:50px;\" name=\"godelete\" value=\"".$depot['lxs']['delete']."\" />";




	return $ttop."<br><br><br></div></form>";
}


function myBlogSave(){
	global $par,$depot,$logged_im,$enviro,$HTTP_POST_FILES;
	$ttop="";
	if (isset($par['godelete']))  return myBlogDelete();

	chk_req("nheader",$depot['lxs']['header']);
	chk_req("nbody",$depot['lxs']['blogtext']);

	$ddate=date("Y-m-d",time());
	$time=date("H:i:s",time());

	/*
	$ddate=	$par['year']."-".$par['month']."-".$par['day'];
	$time=	$par['hour'].":".$par['min'].":00";	*/

	//echo $lngs1[$par['lang']][1];return;

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

	if($par['a'] == 'savenew'){
		/*NEWS PROPERTIES*/
		$sql.="	urlkey		 =	\"".sqller(safeUrlStr($par['nheader']))."\",";
	}

	$sql.="
			ntime		=	\"".sqller($time)."\",
			userid		=	\"".sqller($depot['logged_user']['usid'])."\",
			lang		=	\"".sqller($depot['vars']['langid'][$par['lng']])."\",
			ntype		=	20,
			approved	=	0,
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
					nbody		=	\"".sqller($par['nbody'])."\"";

			$sql3.="	
					id			=	\"".$no."\",
					nheader		=	\"".sqller($par['nheader'])."\",
					nteaser		=	\"".sqller($par['nteaser'])."\"";

			mysql_query($sql2);
			mysql_query($sql3);
			if (!(mysql_affected_rows()>0)) {
				
				mysql_query("DELETE FROM ".NEWS." WHERE id = $no");
				$depot['errors'][]="Problem adding BLOG body";
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

	freecache(5);
	//foreach ($par as $k=>$v) echo $k."=))".$v."<br>";
	return myBlogView();

}
?>