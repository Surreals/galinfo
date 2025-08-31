<?

function get_module_result(){

		global  $par,$depot,  $allangs;


		$ttop="";

		if (!isset($par['su']) || $par['su']=='') $par['su']='viewmedia';
	

		switch ($par['su']){
			case "viewmedia":		$ttop.= media_items_view();		break;

			case "uploadmedia":		$ttop.=	uploadMedia();			break;

			case "saveeditmedia":	$ttop.=	uploadMedia();			break;

			case "delmedia":		$ttop.= media_items_delete();	break;

			case "exchange":		$ttop.= media_items_exchange();	break;

		}

		
		$ttop.= "</form>";
		return $ttop;

}



/*#########################################################################################################################*/

function uploadMedia(){
	global  $par,$depot, $_FILES,$depot;
	//echo sqller($par['announce']);
	$sql_add='';

	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		chk_req('titlee_'.$res['lang'],iho('�� ������� ����� ����'));
		$val=puttodb($par['titlee_'.$res['lang']],$res['lang']);
		$sql_add.='title_'.$res['lang'].' = "'.$val.'",';

	}


	$ignore = false;
	$uploading=false;

	if ($par['su'] !== 'saveeditmedia'){
		$checksum=0;

		if (isset($_FILES['kino'])&&($_FILES['kino']['name']!='')) {$checksum++;$ignore=true;$uploading=true;}
		if ($par['youtubec'])	{	$checksum++;$ignore=true;	}
		if ($par['filename'])	{	$checksum++;$ignore=true;	}
		if (!$checksum) $depot['errors'][]="Provide videofile infomation";
	}


	if ($depot['errors']) return media_items_view();

	if ($par['su'] == 'saveeditmedia') {
		$ignore=true;
		$unique_name=$par['filename'];
	} else {
		if ($par['filename'] && !$uploading){
			$unique_name = $par['filename'];
		} else {
			$unique_name= generate_unique(10);
		}
	}


 
	$save_f= $unique_name;


	if ($par['type']=='video'){
		if (!video_save('kino',$unique_name,$ignore)) {
				$depot['errors'][]='Problem saving videofile. ';
				return media_items_view();
		}

	
	} else if ($par['type']=='audio'){
		if (!mp3_save('kino',$unique_name,$ignore)) {
				$depot['errors'][]='Problem saving audiofile: ';
				return media_items_view();
		}
		
		
	}


	


	/*TRY TO ADD IMAGE*/

	

	$picfilename='';
	if (isset($_FILES['picfile'])&&($_FILES['picfile']['name']!='')){

		$paths=array('/media/videotmb/tmb/','/media/videotmb/intxt/','/media/videotmb/full/');
	
		if ($par['su'] !== 'saveeditmedia') {


			if ($saved_file	=	tmp_file_save('picfile',0,$paths)){
				
				$picfilename =stripslashes($depot['vars']['ppic']);

			}
			
		}  else {
			
			$sql="SELECT * FROM ".MEDIA." WHERE id =\"".sqller($par['id'])."\"";
			$res=conn_fetch_assoc(conn_sql_query($sql));
			
			if (conn_error()) echo conn_error();

			if ($res['picfile']){

				$saved_file=	tmp_file_save('filename',$res['picfile'],$paths);
				$picfilename=$res['picfile'];

			} else {

				if ($saved_file	=	tmp_file_save('picfile',0,$paths)){
				
					$picfilename =stripslashes($depot['vars']['ppic']);

				}
				
			}

		}

	} else {
		if ($par['su'] == 'saveeditmedia') { 
				$picfilename=$par['oldpicfilename'];
		}
	}



	if ($depot['errors']) {
		if ($par['su'] == 'svadd') $par['su'] = 'add'; else $par['su'] = 'edit';
		return media_items_view();
	}
	switch ($par['su']) {
		case "uploadmedia":	
						$sql1=	"INSERT INTO ".$depot['currt']['dbname'][$par['type']]."	SET ".$sql_add;

						$sql1.="
							filename	=		\"".$save_f."\",
							dirid		=	\"".sqller($par['id'])."\",
							youtubec	=	\"".sqller(makeMeYT($par['youtubec']))."\",
							filecode	=	\"".generate_unique(10)."\",
							usetype		=	\"".sqller($par['usetype'])."\",
							picfile		=	\"".sqller($picfilename)."\"


							";
						break;
		case "saveeditmedia":
						$sql1=	"UPDATE ".$depot['currt']['dbname'][$par['type']]."	SET ".$sql_add;

						$sql1.="
							dirid		=	\"".sqller($par['id'])."\",
							youtubec	=	\"".sqller(makeMeYT($par['youtubec']))."\",
							filename	=	\"".sqller($par['filename'])."\",
							usetype		=	\"".sqller($par['usetype'])."\",
							picfile		=	\"".sqller($picfilename)."\"
							";
						break;
	}
	/*images		=	\"".sqller($par['selimgs_images'])."\",*/

	$where='';

	if($par['su'] == 'saveeditmedia'){

		$given_arr=explode("_",$par['arrayname']);
		$where =" WHERE id = \"".sqller($given_arr[1])."\"";	
	}

	$sql1.=$where;

    $res_ = conn_sql_query($sql1) or die (conn_error());

	if (conn_affected_rows($res_)>0 || !conn_error()){
			$depot['oks'][]=iho("���������");
	} else {
		$depot['errors'][]=iho("�������� ��� ���������� ����");
	}
	return media_items_view();
}







function media_items_view(){
	global  $par,$b2,  $enviro, $allangs,$depot,$_FILES;

	$ttop='';
	$vis="display:none;";
	
	$num_colls=8;

	$DB=$depot['currt']['dbname'][$par['type']];
	$curr_sql="SELECT name_".$allangs[0]." FROM ".CTREE." WHERE id=\"".$par['id']."\"";
	$curr_type=conn_fetch_row(conn_sql_query($curr_sql));
	
	$ttop.="<h2>".getfromdb($curr_type[0],$allangs[0])."</h2>";
	
	if ($depot['oks'])		$ttop.=oks();
	if ($depot['errors'])	$ttop.=errors();

	$ttop.="<a href=\"JavaScript:add_newitem('".$par['type']."','uploadmedia','additem','');\" style='margin-top:5px;float:left;' class='addsome'><span> ".iho('������  ����')."</span></a>";
	$ttop.="<a href=\"JavaScript:dlm();\" style='float:right;margin-top:0px;'><img src=\"img/bt_del.gif\" alt=\"".iho('�������� ������')."\" title=\"".iho('�������� ������')."\" border=0> ".iho('�������� ������')."</a>";

	$ttop.="<div style='clear:both;width:100%;'></div><div class='quick1' style='border:".$depot['currt']['color1'][$par['type']]." 2px solid;'><table width=100%><tr><td width=60% valign=top>";
	$sqpt=conn_sql_query("SELECT * FROM ".PICTYPE);
	$types=array("0","- - - - - - -");
	for ($i=0;$i<conn_sql_num_rows($sqpt);$i++){
		$res=conn_fetch_assoc($sqpt);
		$types[]=$res['kwd'];
		$types[]=$res['kwd'];
	}

	$datas = getCommonTree(CTREE,$depot['currt']['dbstate'][$par['type']],0);

	$ttop.="<a href=\"JavaScript:sbm('exchange','','');\" style='margin-bottom:10px;display:block;'><img src=\"img/bt_exchange.gif\" alt=\"".iho("��������� ������")."\" title=\"".iho("��������� ������")."\" border=0> ".iho('��������� ������')."</a>";

	$par['typeid']=$par['id'];
	$ttop.=bd_popup($datas,'typeid','width:200px;border:#CC0000 solid 1px;',0,'');
	$ttop.="</td>";

	$ttop.="<td align=right width=40%>".iho('������ �� �������� ������')."<br>";
	$ttop.=bd_tf(@$par['keyword'],'keyword','text','width:200px','','')."<input type=submit name=srch value='".iho('������')."' id=sbmt><br>";
	if (@$par['findall']) $checked='checked'; else $checked='';
	$ttop.="<input type=checkbox name=findall value=1 $checked>&nbsp;&nbsp;".iho("������ � ��� ������");

	$ttop.="</td>";
	$ttop.="</tr></table></div>";



	/*$ttop.="<div id=errors name=errors></div>";*/
	$ttop.="<table width=100%><tbody id = 'additem_tbody' style='$vis'><tr><td colspan=$num_colls class=hgadd>";
	$ttop.="<div id='additem' name='additem'></div></tbody>";
	$ttop.="<tr><td colspan=3  style='text-align:center !important;' class=hg>";
	


	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	//$addon=array('filename');
	$addon=array();
	$add_sql='';
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);

		$ttop.="<input type=hidden name='title_".$res['lang']."' value='".@$par['title_'.$res['lang']]."'>";

		$addon[]='title_'.$res['lang'];
		$addon[]='filename';
	
	}

	$path="/gazda/?act=media&type=".$par['type']."&su=viewmedia&id=".$par['id'];

	$pager='';
	$addon_sting=array();

	if (@$par['keyword']) {
		foreach ($addon as $k){
			$addon_string[] =$k." LIKE \"%".sqller($par['keyword'])."%\" ";
		}
		$add_sql=" AND (".implode(' OR ', $addon_string).")";
		$path.="&keyword=".$par['keyword'];
	}

	if (@$par['findall'] && @$par['keyword']){
		$sql_count="SELECT COUNT(*) FROM ".$depot['currt']['dbname'][$par['type']]." WHERE 1 ".$add_sql;
		$path.="&findall=1";
	} else 
		$sql_count="SELECT COUNT(*) FROM ".$depot['currt']['dbname'][$par['type']]." WHERE dirid=\"".$par['id']."\" ".$add_sql;
	

	$count1=conn_sql_query($sql_count) or die(conn_error());
	if (!isset($par['pg'])) $par['pg']=0;
	
	
	//$perpage=$enviro['news_per_page'];
	$perpage=24;
	$count=conn_fetch_row($count1);


	$pages=($count[0]%$perpage) ? (int)($count[0]/$perpage+1) : $count[0]/$perpage;

	$ppg=20;
	$pppages=($pages%$ppg) ? (int)($pages/$ppg+1) : $pages/$ppg;
	$curr_ppg=(int)($par['pg']/$ppg);

	$start_page=$curr_ppg*$ppg;
	$end_page=($curr_ppg*$ppg+$ppg>$pages) ? $pages : $curr_ppg*$ppg+$ppg;
	//$path=$par['pphtm'];
	//foreach ($_SERVER as $k=>$v) echo "$k = > $v<br>";
	
	if ($curr_ppg!=0) {
		$prev_page="<a href=\"$path&pg=".($curr_ppg*$ppg-1)."\">&lt;</a>"; 
		$pprev_page="<a href=\"$path&pg=0\">&laquo;</a>"; 
	}	else 
	{
		$prev_page="";
		$pprev_page="";
	}
	if ($curr_ppg!= ($pppages-1) && $pppages!==0) {
		$next_page="<a href=\"$path&pg=".(($curr_ppg+1)*$ppg)."\">&gt;</a>"; 
		$nnext_page="<a href=\"$path&pg=".($pages-1)."/\">&raquo;</a>";
	} else 
	{
		$next_page="";
		$nnext_page="";
	}
		
	if ($pages>1) {
		$pager.="<div class=pager>";
		$pager.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$pager.= "<a href=\"$path&pg=$i\">".($i+1)."</a>";
			else $pager.= "<span>".($i+1)."</span>";
		}
		$pager.= $next_page.$nnext_page;

		$pager.="<div style='padding-left:50px;font-size:18px;float:left;'>/ ".$count[0]."</div>";
		$pager.="</div>";
	} else {
		$pager.="<div style='font-size:18px;float:left;'>/ ".$count[0]."</div>";
	}



	if (@$par['findall'] && @$par['keyword'])
		$sql=conn_sql_query("SELECT * FROM ".$depot['currt']['dbname'][$par['type']]." WHERE 1 $add_sql  ORDER BY id DESC LIMIT	".$par['pg']*$perpage.",".$perpage) or die(conn_error());
		
	else
		$sql=conn_sql_query("SELECT * FROM ".$depot['currt']['dbname'][$par['type']]." WHERE dirid=\"".$par['id']."\" $add_sql  ORDER BY id DESC LIMIT	".$par['pg']*$perpage.",".$perpage) or die(conn_error());
	
	
	
	if (!conn_sql_num_rows($sql)){
		$ttop.="<tr><td colspan=\"".$num_colls."\" style='text-align:center !important;'>* * * * * * * * * * * * * * * * * * * * * * * *</td></tr>";
		
	}

	$ttop.="
				<tr>
					<td width=50% class=heaad>".iho('�����')."</td>
					<td width=25% class=heaad>".iho('���')."</td>
					<td width=15% class=heaad>".iho('���')."</td>
					<td width=10% class=heaad>".iho('��������')."</td>
				</tr>
	";

	
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){

		$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);

		$type= ($res['usetype']==1) ? "<span style='color:#6600CC'>UGCC</span>" : "<span style='color:#F00'>YouTube</span>";

		$image= ($res['picfile']) ? "<img src='/media/videotmb/tmb/{$res['picfile']}' style='width:30px;float:right'>" : "";

		$height = ($par['type']=='video') ? 360 : 53;
		$filetype = ($par['type']=='video') ? 'flv' : 'mp3';

		$filenameTitle = ($res['usetype']==1) ? "<p class='rem' style=\"margin-left:30px\">".$res['filename'].".$filetype</p>" : "<p class='rem' style=\"margin-left:30px\"><strike>file</strike></p>";
		



		$thecode=($res['usetype']==1) ? "<iframe frameborder=\"0\" fullscreen height=\"$height\" src=\"http://{$_SERVER['HTTP_HOST']}/embed/".$res['filecode']."\" width=\"520\"></iframe>" : "<iframe width=\"520\" height=\"$height\" src=\"http://www.youtube.com/embed/".$res['youtubec']."\" frameborder=\"0\" allowfullscreen></iframe>";

		$ttop.="
				<tr  class='datarow'>
					<td class='bord'>
						
						<div>
							<input type=checkbox name='mediaid[]' value=\"".$res['id']."\" class=chkbx>
							<a href=\"JavaScript:add_newitem('".$par['type']."_".$res['filecode']."','viewmedia','additem_".$res['id']."','')\"' style=\"margin-left:20px\">".$res['title_ua']."</a>
							$filenameTitle
						</div>
						
					</td>
					<td class='bord' style='font-size:9px;'>
						<textarea name='as$i' style='width:100%;height:100%;font-size:10px!important;line-height:11px;overflow:hidden;padding:0;' onclick='this.select()' >".htmlspecialchars($thecode)."</textarea>
					</td>
					<td class='bord'>$image".$type."</td>
					<td class='bord'><a href=\"JavaScript:add_newitem('".$par['type']."','uploadmedia','additem_".$res['id']."','')\"><img src=\"img/bt_edit.gif\" alt=\"".$depot['tx']["ti_edit"]."\" title=\"".$depot['tx']["ti_edit"]."\" border=0></a></td>
				</tr>
				<tbody id = 'additem_".$res['id']."_tbody' style='display:none;clear:both;'>
					<tr>
						<td colspan=4>
							<div id='additem_".$res['id']."' name='additem_".$res['id']."'></div>
						</td>
					</tr>
				</tbody>	
				";

	}
	if ($pager){
			$ttop.="<tr><td colspan=8>$pager</td></tr>";
	}
	$ttop.=  "</table>
				<input type=hidden name=act value=\"media\">
				<input type=hidden name=su value=\"viewmedia\">
				<input type=hidden name=arrayname value=\"\">
				<input type=hidden name=par value=\"\">
				<input type=hidden name=id value=\"".$par['id']."\">
				<input type=hidden name=type value=\"".$par['type']."\">

		";
	return $ttop;


	
}



/*#########################################################################################################################*/




function media_items_delete(){
	global  $par,$b2,  $enviro,$depot, $depot;

	$ttop='';
	$r=0;

	if (!count(@$par['mediaid'])){
		$depot['errors'][]=iho("�� ������� ������� ����������");
	}

	foreach ($par['mediaid'] as $v){
		$filename=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".$depot['currt']['dbname'][$par['type']]." WHERE id=\"".$v."\""));
        $res_ = conn_sql_query("DELETE FROM ".$depot['currt']['dbname'][$par['type']]." WHERE id=\"".$v."\"");
		$r++;
		if(conn_affected_rows($res_)>0){

			if ($par['type']=='video'){
				@unlink($_SERVER['DOCUMENT_ROOT']."/media/video/".$filename['filename'].".flv");
				@unlink($_SERVER['DOCUMENT_ROOT']."/media/videotmb/intxt/".$filename['picfile']);
				@unlink($_SERVER['DOCUMENT_ROOT']."/media/videotmb/full/".$filename['picfile']);
				@unlink($_SERVER['DOCUMENT_ROOT']."/media/videotmb/tmb/".$filename['picfile']);
			} else if ($par['type']=='audio'){
				@unlink($_SERVER['DOCUMENT_ROOT']."/audio/".$filename.".mp3");
			}

		}
	}
	$depot['oks'][]=iho("$r ����� ��������");
	return media_items_view();


	
}



/*#########################################################################################################################*/




function media_items_exchange(){
	global  $par,$b,  $enviro,$depot, $depot;

	$ttop='';
	$r=0;

	if (!count(@$par['mediaid'])){
		$depot['errors'][]=iho("�� ������� ������� �����");
	}

	if (!$par['typeid']){
		$depot['errors'][]=iho("�� ������� �����");
	}

	if ($depot['errors']) return media_items_view();

	foreach ($par['mediaid'] as $v){
		$sql="UPDATE ".$depot['currt']['dbname'][$par['type']]." SET dirid = \"".conn_real_escape_string($par['typeid'])."\" WHERE id=\"".$v."\"";
		conn_sql_query($sql);
		$r++;

		
	}
	$depot['oks'][]=iho("$r ����� ����������");
	return media_items_view();


	
}


/*#########################################################################################################################*/


function video_save($name,$savename,$ignore){
	global  $depot,$_FILES,$par,$enviro;
	$ttop='';
	$kino_path="/media/video/";
	$pp=$_SERVER['DOCUMENT_ROOT'];
	
	if (isset($_FILES[$name])&&($_FILES[$name]['name']!='')){
		$allowed_exts=array('application/octet-stream');
		$tt=$_FILES[$name]['type'];

		if (!in_array($tt,$allowed_exts)) {
			$depot['errors'][]=iho("�������������� ���� ������� ���� FLV (application/octet-stream) ������");
			$depot['errors'][]=iho("�� ���������� ����������� ����:".$_FILES[$name]['type']);
		
			return false;
		}

		if (is_uploaded_file($_FILES[$name]['tmp_name'])) {
				move_uploaded_file($_FILES[$name]['tmp_name'], $pp.$kino_path.$savename.'.flv');
		}
		else return false;
	} else {
		if ($ignore) return true; else return false;
	}
	return true;
}


function mp3_save($name,$savename,$ignore){
	global  $depot,$par,$enviro,$_FILES;
	$ttop='';
	$kino_path="/media/audio/";
	$pp=$_SERVER['DOCUMENT_ROOT'];
	

	if (isset($_FILES[$name])&&($_FILES[$name]['name']!='')){
		$allowed_exts=array('audio/mpeg','audio/mp3');
		$tt=$_FILES[$name]['type'];
		if (!in_array($tt,$allowed_exts)) {
			$depot['errors'][]="Uploading videofile should be of mp3 (audio/mpeg) format. Given: ".$_FILES[$name]['type'];
			
			return false;
		}

		if (is_uploaded_file($_FILES[$name]['tmp_name'])) {
				move_uploaded_file($_FILES[$name]['tmp_name'], $pp.$kino_path.$savename.'.mp3');
		}
		else return false;
	} else {
		if ($ignore) return true; else return false;
	}
	return true;
}


function tmb_save($name,$savename,$ignore){
	global  $depot,$_FILES,$par,$enviro;
	$ttop='';
	$tmb_path="/media/video/img/";
	$pp=$_SERVER['DOCUMENT_ROOT'];
	$ut1=530;
	$ut2=300;

	if (isset($_FILES[$name])&&($_FILES[$name]['name']!='')){
		$allowed_exts=array('image/jpeg','image/pjpeg','image/gif','image/png');
		$tt=$_FILES[$name]['type'];
		if (!in_array($tt,$allowed_exts)) {
			$depot['errors'][]=iho("Uploading picture for thumbnail should be one of these formats - .jpg, .gif, .png");
			$ttop.=errors();
			return false;
		}

		if (is_uploaded_file($_FILES[$name]['tmp_name'])) {
				switch ($tt) {
					case 'image/pjpeg':
						if (!(@$image=ImageCreateFromJpeg($_FILES[$name]['tmp_name']))) {
							$depot['errors'][]="The file you uploaded isn't a valid JPEG format";
							return;
						}
						break;
					case 'image/jpeg':
						if (!(@$image=ImageCreateFromJpeg($_FILES[$name]['tmp_name']))) {
							$depot['errors'][]="The file you uploaded isn't a valid JPEG format";
							return;
						}
						break;
					case 'image/gif':
						if (!(@$image=ImageCreateFromGif($_FILES[$name]['tmp_name']))) {
							$depot['errors'][]="The file you uploaded isn't a valid GIF format";
							return;
						}
						break;
					case 'image/png':
						if (!(@$image=ImageCreateFromPng($_FILES[$name]['tmp_name']))) {
							$depot['errors'][]="The file you uploaded isn't a valid PNG format";
							return;
						}
						break;
				}
		}
		else $image=ImageCreateFromJpeg($pp.'/im/empty-frame.jpg');
	} else {
		if ($ignore) return true; else $image=ImageCreateFromJpeg($pp.'/im/empty-frame.jpg');
	}
	

	$height=ImageSY($image);
	$width=ImageSX($image);
	$tmbimage=ImageCreateTrueColor($ut1,$ut2);
	$cream=ImageColorAllocate($tmbimage,51,102,204);
	ImageFill($tmbimage,1,1,$cream);
	imagecopyresampled ($tmbimage, $image, 0, 0, 0, 0, ($ut1-1), ($ut2-1), $width, $height);
	imagerectangle($tmbimage,0,0,$ut1,$ut2,$cream);
	ImageJpeg($tmbimage,$pp.$tmb_path.$savename.'.jpg',100);
	ImageDestroy($image);
	ImageDestroy($tmbimage);
	return true;
}






?>
