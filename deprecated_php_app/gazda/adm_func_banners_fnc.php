<?

global $a,$p,$previndex;
//$js="js_lang";
function get_module_result(){

		global $par,$errors,$oks, $depot;
		$html='';
		$html.= "<form name='ad' method=post enctype='multipart/form-data'>";
		
		if (!isset($par['su']) || !$par['su']) $par['su']='viewmedia';
			//echo $par['su'];
		switch ($par['su']){
			case "viewmedia":		$html.= banners_view();break;
			case "add":
			case "edit":			$html.= banners_add();break; 
			case "editsave": 	
			case "addsave":			$html.= banners_save();break;
			case "removebanner":	$html.= banners_del();break;
			case "delmedia":		$html.= media_items_delete();	break;
			case "exchange":		$html.= media_items_exchange();	break;


		}

		$html.=  "
				<input type=hidden name=act value=\"banners\">
				<input type=hidden name=su value=\"".@$par['su']."\">
				<input type=hidden name=sudir value=\"\">
				<input type=hidden name=dirid value=\"".@$par['dirid']."\">
				<input type=hidden name=par value=\"\">";
		$html.= "</form>";
		return $html;

}



function banners_view(){
	global $par,$b, $depot,$depot;
	$html=bannerTools();

	$html.="<a href=\"JavaScript:sbm('add','0','');\" style='line-height:30px;height:30px;'><img src=\"img/bt_add.gif\" alt=\"".$depot['tx']["he_add"]."\" title=\"".$depot['tx']["he_add"]."\" border=0 style='margin-right:15px;margin-bottom:-5px;'> ".$depot['tx']["he_add"]."</a>";


	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	//$addon=array('filename');
	$addon=array('bname');
	$add_sql='';
	

	$path="/gazda/?act=banners&su=viewmedia&dirid=".$par['dirid'];

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
		$sql_count="SELECT COUNT(*) FROM ".$depot['currt']['dbname'][$par['type']]." WHERE dirid=\"".$par['dirid']."\" ".$add_sql;
	

	$count1=conn_sql_query($sql_count) or die(conn_error());
	if (!isset($par['pg'])) $par['pg']=0;
	
	
	//$perpage=$enviro['news_per_page'];
	$perpage=50;
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



	if (@$par['findall'] && @$par['keyword']){
		$sql=conn_sql_query("SELECT * FROM ".BANNERS." WHERE 1 $add_sql  ORDER BY id DESC LIMIT	".$par['pg']*$perpage.",".$perpage) or die(conn_error());
		
		}
		
	else{
		$sql=conn_sql_query("SELECT * FROM ".BANNERS." WHERE dirid=\"".$par['dirid']."\" $add_sql  ORDER BY id DESC LIMIT	".$par['pg']*$perpage.",".$perpage) or die(conn_error());

	}
	
	$html.="<table width=100% cellpadding=5><tr>
		<td class=heaad width=60%>".$depot['tx']["he_bannername"]."</td>
		<td class=heaad width=10%>".$depot['tx']["he_type"]."</td>
		<td width=20% class=heaad>".$depot['tx']["he_operations"]."</td>
	</tr>";
	$rulerwidth=90;
	/*$sql_t="	
				SELECT id, bname, btype 
				FROM ".BANNERS." 
				WHERE dirid = \"".sqller($par['id'])."\"
				$addon
				ORDER BY bname
				";*/

	/*$sql=conn_sql_query($sql_t) or die(conn_error());*/
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_assoc($sql);
	}

	if (!conn_sql_num_rows($sql)){
		$html.= "<tr><td colspan=3 class=bord style=\"text-align:center !important;\"><br><br><br><br> * * * * * * * * * * * * * * * <br><br><br></td></tr>";
	} else {
		$type=array('1'=>'FILE','2'=>'HTML');
		foreach ($b as $cat){ 

			$currcolor="#F6F6F6";
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#EEEEEE"; 
			$html.="<tr>
			<td class=bord style=\"background-color:".$currcolor.";\">
				<input type=checkbox name='mediaid[]' value=\"".$cat['id']."\" class=chkbx>&nbsp;&nbsp;
				<a href=\"JavaScript:sbm('edit','".$cat['id']."','')\"  title=\"".$depot['tx']["ti_edit"]."\">".stripslashes($cat['bname'])."</a></td>
			<td class=bord style=\"background-color:".$currcolor.";\"><a href=\"/gazda/viewbanner.php?id={$cat['id']}\" title=\"Переглянути\" target=\"_blank\"><img src=\"img/bt_images.gif\"></a>&nbsp;".$type[$cat['btype']]."</td>
			<td class=bord>";
		
			$html.="<a href=\"JavaScript:sbm('edit','".$cat['id']."','')\" id=butt class=edit title=\"".$depot['tx']["ti_edit"]."\"></a>";
			$html.="<a href=\"JavaScript:rr('".$cat['id']."','banner')\" style='margin-left:40px;'><img src=\"img/bt_del.gif\" alt=\"".$depot['tx']["ti_delete"]."\" title=\"".$depot['tx']["ti_delete"]."\" border=0></a>";	
			$html.="</td></tr>";
		}

	}
	

	if ($pager){
			$html.="<tr><td colspan=3>$pager</td></tr>";
	}

	$html.="</table><input type=hidden name=id value=\"\">";
	return $html;
}


/*#########################################################################*/


function banners_add(){
	global $par,$depot;
	$html='';
	$fileloaded='';
	if ($par['su']=='edit'){
	
			$rec=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".BANNERS." WHERE id = \"".$par['id']."\""));
			foreach ($rec as $k=>$v){
				$par[$k]=htmlspecialchars(stripslashes($v));
			}
			$html.="<input type=hidden name=oldname value=\"".$rec['bfile']."\">";
			$html.="<input type=hidden name=id value=\"".$rec['id']."\">";
			if ($rec['bfile']) $fileloaded="<div class=notice>Прикріплений файл / ".$rec['bfile']."</div>";

	}


	$html.="<table width=100% cellpadding=5><tr>
		<td class=heaad width=35%>Файл</td>
		<td width=10% align=center>&nbsp;</td>
		<td width=55% class=heaad>HTML код</td>
	</tr>
	<tr>
		<td>
			<label for=bname>Назва банера</label>".
			bd_tf(@$par['bname'],'bname','text','width:350px','','')."<br><br>
			
			<label for=bfile>Завантажити файл для банера</label>
			<input type=file name=bfile style='width:350px;'>
			<br><span class=rem>Флеш файл повинен ОВОВЯЗКОВО мати розширення swf</span>$fileloaded<br>
			
			<label for=bwidth>Розміри об'єкта (шир., висота.)</label>".
			bd_tf(@$par['bwidth'],'bwidth','text','width:100px','','')."&nbsp;&nbsp;X&nbsp;&nbsp;".
			bd_tf(@$par['bheight'],'bheight','text','width:100px','','')."<br><br>".
			"<label for=blink>Лінк для файла</label>".
			bd_tf(@$par['blink'],'blink','text','width:350px','','').
			"<br><br><label for=bpar>Додатковий параметер</label>".
			bd_tf(@$par['bpar'],'bpar','text','width:350px','','')."<br><br>
			<label for=loadtype>Метод завантаження</label>".
			bd_popup(array(1,'Після завантаження сторінки',2,'Вставляти безпосередньо в сторінку'),'loadtype','width:350px','','')."</td>
			<td>&nbsp;</td>
			<td>
				<label for=onsitecode>Частина коду що міститься в тілі сторінки</label>".
				bd_tar(@$par['onsitecode'],'onsitecode','500px;','120px;','','').
				"<br><br><label for=loadcode>Частина коду що завантажує банер</label>".
				bd_tar(@$par['loadcode'],'loadcode','500px;','120px;','','').
				"<br><br></td></tr><tr><td colspan=3><hr>
				<label for=btype>Який тип банера використовувати</label>".
				bd_popup(array(1,'Файл',2,'HTML Код'),'btype','width:350px','','');
	
	if ($par['su'] == 'add') $suu='addsave'; else $suu='editsave';
	$html.= "<input type=button value=\"".$depot['tx']["bt_proceed"]."\" id='submt' onClick=\"sbm('$suu','','')\" style='margin-left:250px !important;'>";

	$html.="</td></tr></table>";
	return $html;
}


function banners_save(){
	global $par,$depot,$depot,$_FILES,$oks,$errors;
	/*check file*/
	
	if (!@$par['bname']) $par['bname'] = md5($depot['vars']['ctime'].mt_rand(1,10));
	
	if ($par['su'] == 'addsave'){
		$sql="INSERT INTO ".BANNERS." SET ";
		$filename = md5($par['bname'].$depot['vars']['ctime']);
		$addon='';
	} else {
		$sql="UPDATE ".BANNERS." SET ";
		preg_match('/(.*)(\.)(\w+)$/',$par['oldname'],$matches);
		if (@$matches[1])
			$filename = $matches[1];
		else $filename = md5($par['bname'].$depot['vars']['ctime']);
		$addon=" WHERE id = \"".$par['id']."\"";
	}
	$fileadd='';
	$name='bfile';
	if (isset($_FILES[$name])&&($_FILES[$name]['name']!='')) {
		preg_match('/(.*)(\.)(\w+)$/',$_FILES[$name]['name'],$matches1);
		if (upload_file('bfile',$_SERVER['DOCUMENT_ROOT'].'/var/things/'.$filename.".".$matches1[3])){
			$fileadd=$filename.".".$matches1[3];
		} else {
			$errors[]='There is a problem uploading file to server';
		}
	} else {
		
			$oks[]='No files has been uploaded';
		
	}
	foreach (explode(' ','bname btype loadtype onsitecode loadcode blink bpar bwidth bheight dirid') as $v)
		$sql.=" $v=\"".sqller($par[$v])."\",";
	$sql=substr($sql,0,-1);

	if ($fileadd) $sql.=", bfile = \"".sqller($fileadd)."\"";
		$sql.=$addon;

    $res_= conn_sql_query($sql) or die(conn_error());
	if (conn_affected_rows($res_)>0){
		$oks[]="Banner saved";
		if (!$fileadd) $oks[]="The file wasnt changed / uploaded";
	} else {
		if (!$fileadd)
		$errors[]='The banner has not been changed';
		else $oks[]="Only file has been changed";
	}
	$par['su']='v';

	freecache(8);
	return banners_view();
}




function upload_file($name,$destfilename){
	global $errors,$_FILES,$par,$enviro,$oks;
	if (isset($_FILES[$name])&&($_FILES[$name]['name']!='')){			
		if (is_uploaded_file($_FILES[$name]['tmp_name'])) {
				if (move_uploaded_file($_FILES[$name]['tmp_name'], $destfilename)) return true;
				else return false;
		}
	} else return false;
	$oks[]=$destfilename;
}



function banners_del(){
	global $par,$errors,$oks,$b, $depot;
	$html='';
	$filename=conn_fetch_row(conn_sql_query("SELECT * FROM ".BANNERS." WHERE id = \"".$par['id']."\""));
	if ($filename[0]){
		@unlink($_SERVER['DOCUMENT_ROOT'].'/things/'.$filename[0]);
	}

    $res_ = conn_sql_query("DELETE FROM ".BANNERS." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($depot['oks'],$depot['tx']['ok_del1']);
	} else {
		array_unshift($depot['oks'],$depot['tx']['al_norecs']."<br><br>");
	}
	$par['cat']='v';
	freecache(8);
	$html.=banners_view();
	return $html;
}


function bannerTools(){
	global  $par,$b2, $depot, $enviro,$depot, $allangs,$depot,$HTTP_POST_FILES;
	$vis="display:none;";
	
	$num_colls=8;

	$DB=$depot['currt']['dbname'][$par['type']];
	$curr_sql="SELECT name_".$allangs[0]." FROM ".CTREE." WHERE id=\"".$par['dirid']."\"";
	$curr_type=conn_fetch_row(conn_sql_query($curr_sql));
	
	$html="<h2 style='background:#EEE;padding:5px;'>".getfromdb($curr_type[0],$allangs[0])."</h2>";
	
	/*$html.="<a href=\"JavaScript:add_newitem('".$par['type']."','uploadmedia','additem','');\" style='margin-top:5px;float:left;' class='addsome'><span> ".iho('Додати  файл')."</span></a>";*/

	$html.="<a href=\"JavaScript:dlm();\" style='float:right;margin-top:0px;'><img src=\"img/bt_del.gif\" alt=\"Видалити відмічені\" title=\"Видалити відмічені\" border=0>Видалити відмічені</a>";

	$html.="<div style='clear:both;width:100%;'></div><div class='quick1' style='border:".$depot['currt']['color1'][$par['type']]." 2px solid;'><table width=100%><tr><td width=60% valign=top>";

	$datas = getCategories(CTREE,$depot['currt']['dbstate'][$par['type']],0);

	$html.="<a href=\"JavaScript:sbm('exchange','','');\" style='margin-bottom:10px;display:block;'><img src=\"img/bt_exchange.gif\" alt=\"Перенести відмічені\" title=\"Перенести відмічені\" border=0> Перенести відмічені</a>";

	$par['typeid']=$par['dirid'];
	$html.=bd_popup($datas,'typeid','width:200px;border:#CC0000 solid 1px;',0,'');
	$html.="</td>";

	$html.="<td align=right width=40%>Знайти за ключовим словом<br>";
	$html.=bd_tf(@$par['keyword'],'keyword','text','width:200px','','')."<input type=submit name=srch value='шукати' id=sbmt><br>";
	if (@$par['findall']) $checked='checked'; else $checked='';
	$html.="<input type=checkbox name=findall value=1 $checked>&nbsp;&nbsp;Шукати у всіх групах</td></tr></table></div>";
	return $html;
}


function media_items_delete(){
	global  $par,$b2, $depot, $enviro,$depot, $depot,$errros, $oks;

	$html='';
	$r=0;

	if (!count(@$par['mediaid'])){
		$errors[]="Не вибрано жодного елемента";
	}

	foreach ($par['mediaid'] as $v){
		$r++;
		$filename=conn_fetch_row(conn_sql_query("SELECT * FROM ".BANNERS." WHERE id = \"".$v."\""));
		if ($filename[0]){
			@unlink($_SERVER['DOCUMENT_ROOT'].'/things/'.$filename[0]);
		}
		conn_sql_query("DELETE FROM ".BANNERS." WHERE id=\"".$v."\"");
		
	}
	$oks[]="$r елементів видалено";
	$par['su']="viewmedia";
	return banners_view();
}


function media_items_exchange(){
	global  $par,$b, $depot, $enviro,$depot, $depot,$errros, $oks;

	$html='';
	$r=0;

	if (!count(@$par['mediaid'])){
		$errors[]="Не вибрано жодного файлу";
	}

	if (!$par['typeid']){
		$errors[]="Не вибрано групи";
	}

	if (@$errors) return banners_view();

	foreach ($par['mediaid'] as $v){
		$sql="UPDATE ".BANNERS." SET dirid = \"".conn_real_escape_string($par['typeid'])."\" WHERE id=\"".$v."\"";
		conn_sql_query($sql);
		$r++;
	}

	$oks[]="$r елементів перенесено";
	$par['su']="viewmedia";
	return banners_view();
	
}