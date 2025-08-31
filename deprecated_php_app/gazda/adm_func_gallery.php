<?

global $a2,$b2,$p,$previndex,$allangs;

function aget_center(){
	global $par,$depot,$allangs;
	/*if (!require_level('ac_admin'))	return;*/
	$html=pic_js();
	$html.= "<h1 class='fixed'>".iho("Фото")."</h1><hr>";

	$langsql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	for ($i=0;$i<conn_sql_num_rows($langsql);$i++){
		$rs=conn_fetch_assoc($langsql);
		$allangs[]=$rs['lang'];

	}

	if (!isset($par['su'])) $par['su']='v';

	switch ($par['su']){
		case "v": 
		case "moveup":
		case "changeenviro":
		case "movedown":	$html.= gallery_view();break;
		case "savetype":	$html.= gallery_savetype();break;
		case "remove":		$html.= gallery_del();break;
		case "chng" :		$html.=gallery_change();break;
		case "exchangedir": $html.=gallery_movedir();break;

		case "viewimages":
		case "saveeditedimage":
		case "proceedsaveedit":	$html.= gallery_images_view();break;
		case "bulk":			$html.= gallery_images_view_bulk();break;
		case "moveimup"		:
		case "moveimdown"	:$html.= gallery_images_move();break;
		case "saveimage":	$html.= gallery_images_format();break;
		case "delimages":	$html.= gallery_images_delete();break;
		case "exchange":	$html.= gallery_images_exchange();break;
		case "proceedsave":	if (gallery_images_proceedsave()) $html.= gallery_images_view();break;
	}
	return $html;
}


function gallery_images_view_bulk(){
	global $par,$b2, $tx, $enviro,$depot, $allangs,$depot;
	$curr_type=conn_fetch_row(conn_sql_query("SELECT name_".$allangs[0]." FROM ".PICTYPE." WHERE id=\"".$par['id']."\""));
	$html="<h2>".iho("Пакетне завантаження: ").getfromdb($curr_type[0],$allangs[0])."</h2>
		<a href=\"?act=gallery&su=viewimages&id=".$par['id']."\">".iho("Повернутися до альбому ")."</a>
		<div>
			<form action=\"/gazda/adm_func_bulk.php?id=".$par['id']."\" class=\"dropzonezml\">
				
				<div style='float: right;width: 240px;background: #EEE; padding:20px;'>
					<p>".iho("Підпис до усіх фото")."</p>
					<textarea name='title_ua' value='' style='width: 100%; height: 50px;'></textarea>
					
					<p style='margin-top: 10px;'>".iho("Теги")."</p>
					<input type='text' name='tags' value='' style='width: 200px;'>

					<p style='margin-top: 10px;margin-bottom: 10px;'><input type='checkbox' name='watermark' value='1'>&nbsp;&nbsp".iho("Водяний знак")."</p>

					<input type='button' class='bulkuploadbutton' id='sbmt' style='width: 100%;height: 50px; line-height: 50px;' value='".iho("ЗАВАНТАЖИТИ")."'>
				</div>
			</form>
		</div>
	";
	return $html;	
}



function gallery_images_view(){
	global $par,$b2, $tx, $enviro,$depot, $allangs,$depot,$_FILES;

	$html="";
	$vis="display:none;";

	$num_colls=8;
	$curr_type=conn_fetch_row(conn_sql_query("SELECT name_".$allangs[0]." FROM ".PICTYPE." WHERE id=\"".$par['id']."\""));
	$sqpt=conn_sql_query("SELECT * FROM ".PICTYPE);
	$html.="<h3 style='display: block;'>".getfromdb($curr_type[0],$allangs[0])."</h3>
			
			<form name='ad' method=post enctype=\"multipart/form-data\" >
			<div style='float:right;margin-top:-60px;'>";

	subselect2();
	$datas=array();
	foreach ($depot['b2'] as $cat){ 
		$datas[]=$cat['id'];
		$datas[]=str_repeat(" | . . . . ", ($cat['level']-1)).$cat['name_'.$par['lng']];
	}
	$html.="<img src='img/ico_tree.gif' style='margin-bottom:-3px;margin-right:3px;'>".bd_popup($datas,'id','width:400px;border:#CC0000 solid 1px;',0,'onChange = "sbm(\'viewimages\',\'\',\'\')"')."</div>
		<a href=\"JavaScript:add_type('addimage','addimage','');\" class='addsome'><span> ".iho('Додати  фото')."</span></a>
		<a href=\"?act=gallery&su=bulk&id=".$par['id']."\"  class='addsome addsome1'><span> ".iho('Пакетне завантаження')."</span></a>
		<a href=\"JavaScript:dl();\" style='float:right;margin:5px;' ><img src=\"img/bt_del.gif\" alt=\"".iho('Видалити відмічені')."\" title=\"".iho('Видалити відмічені')."\" border=0> ".iho('Видалити відмічені')."</a>
		<div style='clear:both;width:100%;'></div><div class=quick1><table width=90%><tr><td width=60% valign=top>
		<a href=\"JavaScript:sbm('exchange','','');\" style='margin-bottom:10px;display:block;'><img src=\"img/bt_exchange.gif\" alt=\"".iho("Перенести відмічені")."\" title=\"".iho("Перенести відмічені")."\" border=0> ".iho('Перенести відмічені')."</a>".
			bd_popup($datas,'typeid','width:200px;border:#CC0000 solid 1px;',0,'').
		"</td>
		<td align=right>".iho('найти за ключовим словом')."<br>".
			bd_tf(@$par['keyword'],'keyword','text','width:200px','','').
			"<input type=submit name=srch value='".iho('шукати')."' id=sbmt><a href='/gazda/?act=gallery&su=viewimages&id=".$par['id']."' style='margin-left:20px;'>".iho('Очистити')."</a><br>";

	if (@$par['findall']) $checked='checked'; else $checked='';
	$html.="<input type=checkbox name=findall value=1 $checked>&nbsp;&nbsp;".iho("Шукати у всіх групах");

	$html.="</td></tr></table></div>
		<div id=errors1 name=errors></div><table width=100%>
		<tbody id = 'addimage___tbody' style='$vis'><tr><td colspan=$num_colls class=hgadd>
		<div id='addimage' name='addimage'></div></tbody>
		<tr>";

	for ($s=1;$s<=$num_colls;$s++){
		$html.="<td width=\"".(int)(100/$num_colls)."%\">&nbsp;</td>";
	}
	$html.="</tr><tr><td colspan=".$num_colls."  style='text-align:center !important;' class=hg>";

	if ($par['su']=='saveeditedimage' || $par['su']=='proceedsaveedit'){

		if ((isset($_FILES['filename'])&&($_FILES['filename']['name']!=''))  || isset($par['useraw']))
		return 	gallery_images_format(1);

		if ($par['su']=='proceedsaveedit') {
		   gallery_images_proceedsave(1);
		}

		//foreach ($par as $k=>$v) echo $k."=>".$v."<br>";
		$vararr=explode("___", $par['arrayname']); 
		//foreach ($vararr as $k=>$v) echo $k."=>".$v."<br>"; 
		$que="UPDATE ".PICS." SET ";
		$sql1=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
		for ($i=0;$i<conn_sql_num_rows($sql1);$i++){
				$res=conn_fetch_array($sql1, PDO::FETCH_ASSOC);
				$val=puttodb($par['titlee_'.$res['lang']],$res['lang']);
				
				$que.="	title_".$res['lang']." = \"".$val."\",";
		}

		$que.=" tags = \"".sqller(@$par['tags'])."\" WHERE filename=\"".$vararr[1]."\"";
        $res_ = conn_sql_query($que) or die(conn_error());

		if (conn_affected_rows($res_)>0) $depot['oks'][]=iho("Зміни збережено");
		$par['imageid'] = $vararr[1];
	}



	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	//$addon=array('filename');
	$addon=array();
	$add_sql='';
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);

		$html.="<input type=hidden name='title_".$res['lang']."' value='".@$par['title_'.$res['lang']]."'>";

		$addon[]='title_'.$res['lang'];
		$addon[]='filename';
		$addon[]='tags';
	
	}

	$path="/gazda/?act=gallery&su=viewimages&id=".$par['id'];

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
		$sql_count="SELECT COUNT(*) FROM ".PICS." WHERE 1 ".$add_sql;
		$path.="&findall=1";
	} else 
		$sql_count="SELECT COUNT(*) FROM ".PICS." WHERE pic_type=\"".$par['id']."\" ".$add_sql;
	

	$count1=conn_sql_query($sql_count) or die(conn_error());
	if (!isset($par['pg'])) $par['pg']=0;
	
	//$perpage=$depot['enviro']['news_per_page'];
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
		$sql=conn_sql_query("SELECT * FROM ".PICS." WHERE 1 $add_sql  ORDER BY id DESC LIMIT	".$par['pg']*$perpage.",".$perpage);
		
	else
		$sql=conn_sql_query("SELECT * FROM ".PICS." WHERE pic_type=\"".$par['id']."\" $add_sql  ORDER BY id DESC LIMIT	".$par['pg']*$perpage.",".$perpage);
	
	if (!conn_sql_num_rows($sql)){
		$html.="<tr><td colspan=\"".$num_colls."\" style='text-align:center !important;'>* * * * * * * * * * * * * * * * * * * * * * * *</td></tr>";
	}

	for ($i=0;$i<conn_sql_num_rows($sql);$i++){

		$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		if (!($i % $num_colls)){
			$html.="<tr>";
		}

		$image_pat_name=getImagePath($res['filename']).$res['filename'];

		$html.="<td class=hg><a href=\"JavaScript:add_type1('addimage___".$res['filename']."','addimage')\"'><img src=\"/media/gallery/tmb/".$image_pat_name."?timestamp=".$depot['vars']['ctime']."\" style='width: 100%'></a><input type=checkbox name='imageid[]' value=\"".$res['filename']."\" class=chkbx>";
		$html.="<textarea name=\"".md5($image_pat_name)."\" class=tiny onclick=\"this.select()\">/media/gallery/full/".$image_pat_name."</textarea>";
		
		if (($i % $num_colls) == ($num_colls-1)){
			$html.="</tr>";
		}
		
	}
	if ($pager){
		$html.="<tr><td colspan=8>$pager</td></tr>";
	}
	$html.=  "</table><input type=hidden name=act value=\"gallery\"><input type=hidden name=su value=\"viewimages\"><input type=hidden name=arrayname value=\"\"><input type=hidden name=par value=\"\">";
	return $html."</form>";
}


function gallery_images_delete(){
	global $par,$b2, $tx, $enviro,$depot,$depot;
	$html='';
	$r=0;
	if (!count(@$par['imageid'])){
		$depot['errors'][]=iho("Не вибрано жодного зображення");
	}

	foreach ($par['imageid'] as $v){
        $res_ = conn_sql_query("DELETE FROM ".PICS." WHERE filename=\"".$v."\"");
		$r++;
		if(conn_affected_rows($res_)>0){
			@unlink($_SERVER['DOCUMENT_ROOT']."/media/gallery/full/".$v);
			@unlink($_SERVER['DOCUMENT_ROOT']."/media/gallery/tmb/".$v);
			@unlink($_SERVER['DOCUMENT_ROOT']."/media/gallery/intxt/".$v);
			@unlink($_SERVER['DOCUMENT_ROOT']."/media/gallery/raw/".$v);
		}
	}
	$depot['oks'][]=iho("$r зображень видалено");
	return gallery_images_view();
}



function gallery_images_exchange(){
	global $par,$b, $tx, $enviro,$depot,$depot;
	$r=0;

	if (!count(@$par['imageid'])){
		$depot['errors'][]=iho("Не вибрано жодного зображення");
	}

	if (!$par['typeid']){
		$depot['errors'][]=iho("Не вибрано групи");
	}

	if ($depot['errors']) return gallery_images_view();

	foreach ($par['imageid'] as $v){

		conn_sql_query("UPDATE ".PICS." SET pic_type = \"".conn_real_escape_string($par['typeid'])."\" WHERE filename=\"".$v."\"");
		$r++;
		
	}
	$depot['oks'][]=iho("$r зображень перенесено");
	return gallery_images_view();
}


function gallery_movedir(){
	global $par, $depot;

	if (isset($par['diritems']) && is_array($par['diritems'])) {

		$idLevel=array();
		$sql=sqlquery("SELECT id, level FROM ".PICTYPE);
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$s=conn_fetch_assoc($sql);
			$idLevel[$s['id']] = $s['level'];
		}

		foreach($par['diritems'] as $item) {
			subselect2($item);
			if ($par['newparent'] !== 'toplevel') {
				// find bias 
				$bias = $idLevel[$par['newparent']] - $idLevel[$item] + 1;
				// check enclosure
				if ($par['newparent'] == $item) continue;

				$enclosure = false;
				foreach($depot['b2'] as $node) {
					if ($node['id'] == $par['newparent']) $enclosure = true;
				}

				if ($enclosure) continue;

				$parentLevel = $idLevel[$par['newparent']];
			} else {
				$bias = 1 - $idLevel[$item];
				$par['newparent'] = 0;
				$parentLevel = 0;
			}

			// order
			$lastid = conn_fetch_row(sqlquery("SELECT MAX(orderid) FROM ".PICTYPE." WHERE parentword = \"".sqller($par['newparent'])."\""));
			if (!count($lastid)) $lastid[0]=0;

			sqlquery("
				UPDATE 
					".PICTYPE." 
				SET 
					parentword = \"".$par['newparent']."\",
					level = $parentLevel + 1,
					orderid = ".$lastid[0]." + 1
				WHERE 
					id = $item
			");

			// update branch level
			foreach($depot['b2'] as $node) {
				sqlquery("
					UPDATE 
						".PICTYPE." 
					SET 
						level = level + $bias
					WHERE 
						id = ".$node['id']."
				");
			}
			
		}
	}

	return gallery_view();
}

function gallery_view(){
	global $par,$depot, $tx, $enviro,$allangs;
	$html="<form name='ad' method=post enctype=\"multipart/form-data\" >";
	$html.="<a href=\"JavaScript:add_type('adp','pictype','block');\" style='float:right;margin-top:-35px;position:relative;' class=addsome><span> ".iho('Додати групу')."</span></a>";

	subselect2();
	$datas=array('toplevel', iho('Коренева категорія'));
	foreach ($depot['b2'] as $cat){ 
		$datas[]=$cat['id'];
		$datas[]=str_repeat(" | . . . . ", ($cat['level']-1)).$cat['name_'.$par['lng']];
	}

	$html.="<div class=quick1>".iho('Знайти за ключовим словом')."&nbsp;&nbsp;&nbsp;&nbsp;"
	.bd_tf(@$par['keyword'],'keyword','text','width:200px','','')."<input type=button name=srch value='".iho('шукати')."' id=sbmt onclick='sbm_su(\"\",\"\",\"viewimages\")'>
	<input type=hidden name=findall value=1>
	<div style='float: right;width: 280px;'>
		<a href=\"JavaScript:sbm('exchangedir','','');\" style='margin-bottom:10px;display:block;'><img src=\"img/bt_exchange.gif\" alt=\"".iho("Перенести відмічені")."\" title=\"".iho("Перенести відмічені")."\" border=0> ".iho('Перенести відмічені')."</a>".
			bd_popup($datas,'newparent','width:200px;border:#CC0000 solid 1px;',0,'')."
		</div>
	</div>
		<ul class='dropselect'>
			<li id = 'adp___tbody'>
				<span id='adp' name='adp'></span>
			</li>";

	$lngs2=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".LANG." ORDER BY id LIMIT 1"));

	if ($par['su'] == "moveup" || $par['su'] == "movedown"){
		move_record();
	}

	$sql=conn_sql_query("SELECT * FROM ".PICTYPE." ORDER BY id");
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}

	if (!isset($par['action'])) $par['action']='imagelib';
	if (!conn_sql_num_rows($sql)){
		$html.= "<h2> No Images</h2>";
	} else {
		$currentLevel=1;
		$currentParent='0';
		
		$openbranches=array();
		if (isset($par['openbranch'])) $openbranches = explode(",",$par['openbranch']);
		if (isset($_COOKIE['ojsbranches'])) $openbranches = explode(",",$_COOKIE['ojsbranches']);
		

		/*foreach ($b2 as $cat){*/ 
		for ($i=0;$i<count($depot['b2']);$i++){
			
			$cat=$depot['b2'][$i];

			$class='closed';
			$display='none';
			
			/*OPENED BRANCHES*/
			if (in_array($currentParent,$openbranches)) {
				$display='block';
			}

			if (in_array($cat['id'],$openbranches)) {
				$class='opened';
			}

			if($currentLevel<$cat['level']){

				$html.="<li id='branch".$currentParent."' style='display:$display;'><ul>";
			}
			else if ($currentLevel>$cat['level']){

				$qty=$currentLevel-$cat['level'];

				while($qty>0){

					$html.="</ul></li>";
					$qty--;
				}
			}
			
			/*FLAT CATEGORY*/
			if(!isset($depot['b2'][($i+1)]) ||  $depot['b2'][($i+1)]['level']<=$cat['level']) $class='opened'; 

			/*bg 
				background-position:".(($cat['level']-1)*20-80)."px -3px;
			*/
			$html.="
				<li class='astree gallerydir' style=\"padding-left:".(($cat['level']-1)*20+10)."px;\" >
				<span class='galleryTools'><a href=\"JavaScript:sbm('moveup','".$cat['id']."','')\"><img src=\"img/bt_up.gif\" alt=\"".$depot['tx']["ti_moveup"]."\" title=\"".$depot['tx']["ti_moveup"]."\" border=0></a>

					<a href=\"JavaScript:sbm('movedown','".$cat['id']."','')\"><img src=\"img/bt_down.gif\" alt=\"".$depot['tx']["ti_movedown"]."\" title=\"".$depot['tx']["ti_movedown"]."\" border=0></a>
					<a href=\"JavaScript:add_type('adp___".$cat['id']."','pictype','block')\"><img src=\"img/bt_edit.gif\" alt=\"".$depot['tx']["ti_edit"]."\" title=\"".$depot['tx']["ti_edit"]."\" border=0></a>
					<a href=\"JavaScript:rr('".$cat['id']."')\" style='margin-left:20px;'><img src=\"img/bt_del.gif\" alt=\"".$depot['tx']["ti_delete"]."\" title=\"".$depot['tx']["ti_delete"]."\" border=0></a>
				</span><input type='checkbox' name='diritems[]' value='".$cat['id']."'>
				<a href='' class='$class' onclick='return expandBranch(\"branch".$cat['id']."\",this,{$cat['id']});'></a><a href=\"\" onClick =\"sbm('viewimages','".$cat['id']."',''); return false;\">".getfromdb(stripslashes($cat['name_'.$allangs[0]]),$allangs[0])."
					</a></li>
				<li id = 'adp___".$cat['id']."___tbody' style='display:none;clear:both;'>
					<div id='adp___".$cat['id']."' name='adp___".$cat['id']."'></div>
				</li>";
			
			$currentLevel= $cat['level'];
			$currentParent=$cat['id'];
		}

	}
	
	
	$html.="</ul></div>";

	$html.=  "
		<input type=hidden name=act value=\"gallery\">
		<input type=hidden name=su value=\"\">
		<input type=hidden name=arrayname value=\"\">
		<input type=hidden name=id value=\"\">
		<input type=hidden name=par value=\"\">
		<input type=hidden name='openbranch' value='".@$par['openbranch']."'>
		";
	return $html."</form>";
}


/*#########################################################################################################################*/

function gallery_savetype(){
	global $tx, $par, $depot;
	$html="";
	$given_arr=explode("___",$par['arrayname']);
	$sql=conn_sql_query("SELECT * FROM ".LANG."");

	/*chk_valid_strict('kwd',iho("���� ��� ������"));*/
	if (count($depot['errors'])) return gallery_view();

	if (count($given_arr) == 1){

		$order=conn_fetch_row(conn_sql_query("SELECT MAX(orderid) FROM ".PICTYPE));
		$sql1="
					INSERT INTO ".PICTYPE." SET 
					orderid=\"".($order[0]+1)."\",
					kwd = \"".generate_unique(14)."\",
					/*kwd = \"".conn_real_escape_string(stripslashes(@$par['kwd']))."\",*/
		";
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
				$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
				$val=puttodb($par['name_'.$res['lang']],$res['lang']);
				$sql1.='name_'.$res['lang'].' = "'.$val.'",';
		}

		if ($par['parentword'] == "0"){
			$level=1;
		} else {
			$the_lev=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".PICTYPE." WHERE id=\"".$par['parentword']."\""));
			if (!is_array($the_lev)) return "ERROR";
			$level=$the_lev['level']+1;
		}

		$sql1.=" level=\"".$level."\",";
		/*$sql1.=" isvisible=\"".$par['isvisible']."\",";*/
		$sql1.=" parentword=\"".$par['parentword']."\"";
        $res_ = conn_sql_query($sql1) or die(conn_error());
		if (conn_affected_rows($res_)>0){
			$depot['oks'][]=iho("Один розділ додано.");
		}
		return gallery_view();
	} else {
		$sql1="UPDATE ".PICTYPE." SET /*kwd = \"".conn_real_escape_string(stripslashes(@$par['kwd']))."\",*/";
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
				$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
				$val=puttodb($par['name_'.$res['lang']],$res['lang']);
				$sql1.='name_'.$res['lang'].' = "'.$val.'",';
		} 
		
		/*isvisible=\"".$par['isvisible']."\"*/
		$sql1.= " isvisible=\"\" WHERE id=\"".$given_arr[1]."\"";

        $res_ = sqlquery($sql1);
		if (conn_affected_rows($res_)>0){
			$depot['oks'][]=iho("Один запис редаговано.");
		}
		return gallery_view();
	}

}



function gallery_del(){
	global $par,$depot, $b, $tx;
	$html='';

    $res_ = conn_sql_query("DELETE FROM ".PICTYPE." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($depot['oks'],$depot['tx']['ok_del1']);
	} else {
		array_unshift($depot['errors'],$depot['tx']['al_norecs']."<br><br>");
	}
	$html.=gallery_view();
	return $html;
}



function move_record(){
	global $par,$depot,  $tx;

	$thegroup=conn_fetch_row(conn_sql_query("SELECT parentword FROM ".PICTYPE." WHERE id = \"".$par['id']."\""));

	$sql=conn_sql_query("SELECT * FROM ".PICTYPE." WHERE parentword = \"".$thegroup[0]."\" ORDER BY orderid");
	$same_home=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$same_home[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	$j=0;
	foreach($same_home as $radio){
		if ($radio["id"] == $par["id"]){
			break;
		}
		$j++;
	}

	if ($par['su']=="moveup"){
		if (!isset($same_home[($j-1)])){
			$depot['errors'][]=$depot['tx']['al_topbranch'];
			return;
		}
		$old=$same_home[($j-1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["name_".$par['lng']],$depot['tx']["ok_movedup"]);
			
	
	} else if ($par['su']=="movedown"){
	
		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$depot['tx']['al_lowbranch'];
			return;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["name_".$par['lng']],$depot['tx']["ok_moveddown"]);

	} else {
		return;
	}
	
	conn_sql_query("UPDATE ".PICTYPE." SET orderid=0 WHERE id=\"".$old["id"]."\"");
	conn_sql_query("UPDATE ".PICTYPE." SET orderid=\"".$old["orderid"]."\" WHERE id=\"".$new["id"]."\"");
	conn_sql_query("UPDATE ".PICTYPE." SET orderid=\"".$new["orderid"]."\" WHERE id=\"".$old["id"]."\"");
	return;
}




function gallery_change(){
	global $par,$depot, $b, $tx;
	$html='';

    $res_ = conn_sql_query("UPDATE ".PICTYPE." SET isvisible=MOD((isvisible+1),2) WHERE id=\"".$par['id']."\"") or die(conn_error());
	if (conn_affected_rows($res_)) {
		$depot['oks'][]=$depot['tx']["ok_activated"];
	} else {
		$depot['errors'][]=$depot['tx']["al_chng"];
	}
	$html.=gallery_view();
	return $html;
}



function tmp_file_save_gallery($name,$change){
	global $depot,$_FILES,$par,$enviro, $depot;
	$html='';
	
	/*$large_path="/media/gallery/full/";*/
	$tmp="/media/gallery/tmp/";
	$par['userpicok']='0';

	if (isset($_FILES[$name])&&($_FILES[$name]['name']!='')){
		$allowed_exts=array('image/jpeg','image/pjpeg','image/gif','image/png');
		$tt=$_FILES[$name]['type'];
		if (!in_array($tt,$allowed_exts)) {
			$depot['errors'][]=iho("Завантажуване зображення бовинно бути одного з трьох форматів - .jpg, .gif, .png");
			$html.=errors();
			return false;
		}

		/*preg_match("/^(\w+)(\.)(\w+)$/",$p,$matches);$q=$p.".".@$exts[$tt];*/
		$exts=array(
						'image/jpeg'=>'jpg',
						'image/pjpeg'=>'jpg',
						'image/gif'=>'gif',
						'image/png'=>'png'
		);
		
		if (is_uploaded_file($_FILES[$name]['tmp_name'])) {
				$pp=$_SERVER['DOCUMENT_ROOT'];

				
				if (!$change) {
					if (@$par['newfilename']){
						$fname=strtolower($par['newfilename'].".".@$exts[$tt]);
					} else {
						$fname=strtolower($_FILES[$name]['name']);
						$fname=strtolower(preg_replace("/[^0-9a-zA-Z-_\.]/msU",rand(1,20),$fname));
					}

					$ishere=conn_fetch_row(conn_sql_query("SELECT COUNT(*) FROM ".PICS." WHERE filename=\"$fname\""));
					
					if ($ishere[0]){
						preg_match("/^([\w-]+)(\.)(\w+)$/",$fname,$matches);
						$fname=$matches[1]."_".substr(md5(time()),0,5).".".@$exts[$tt];
						$depot['oks'][]=iho("Файл з таким іменем існує. Система обрала ім'я: ".$fname);
					}

				}	else {
					$fname=$change;
				}

				$new_location=$pp.$tmp;
				$new_fname=$pp.$tmp.$fname;
				move_uploaded_file($_FILES[$name]['tmp_name'], $new_fname);
	
				$max=$depot['enviro']['large_im_size'];

				switch ($tt) {
					case 'image/pjpeg':
						if (!(@$image=ImageCreateFromJpeg($new_fname))) {
							$depot['errors'][]="The file you uploaded isn't a valid JPEG format";
							return;
						}
						break;
					case 'image/jpeg':
						if (!(@$image=ImageCreateFromJpeg($new_fname))) {
							$depot['errors'][]="The file you uploaded isn't a valid JPEG format";
							return;
						}
						break;
					case 'image/gif':
						if (!(@$image=ImageCreateFromGif($new_fname))) {
							$depot['errors'][]="The file you uploaded isn't a valid GIF format";
							return;
						}
						break;
					case 'image/png':
						if (!(@$image=ImageCreateFromPng($new_fname))) {
							$depot['errors'][]="The file you uploaded isn't a valid PNG format";
							return;
						}
						break;
				}

				$save_processed=$new_location.'processed_'.$fname;
				if (!isset($par['save_original'])){
					$height=ImageSY($image);
					$width=ImageSX($image);

					if ( $max >= $width ) {
						$bigw=$width;
						$bigh=$height;
					} else {
						$bigw=$max;
						$bigh=(int)(($max*$height)/$width);
					}

					$bigimage=ImageCreateTrueColor($bigw,$bigh);
					$cream=ImageColorAllocate($bigimage,254,244,231);
					ImageFill($bigimage,111,111,$cream);
					imagecopyresampled ($bigimage, $image, 0, 0, 0, 0, $bigw, $bigh, $width, $height);


					$save_processed=$new_location.'processed_'.$fname;
					switch ($tt) {
						case 'image/jpeg':
							ImageJpeg($bigimage,$save_processed,100);
							break;
						case 'image/pjpeg':
							ImageJpeg($bigimage,$save_processed,100);
							break;
						case 'image/gif':
							ImageGif($bigimage,$save_processed);
							break;
						case 'image/png':
							ImagePng($bigimage,$save_processed);
							break;
					}		

					ImageDestroy($image);
					ImageDestroy($bigimage);
					$par['ppic']=array($fname,$bigw,$bigh);
				} else {
					$height=ImageSY($image);
					$width=ImageSX($image);
					$par['ppic']=array($fname,$width,$height);
					$_FILES[$name]['name']='';
					/*move_uploaded_file($_FILES[$name]['tmp_name'],$new_location); 
					echo $_FILES[$name]['name'];*/
					@copy($new_fname,$save_processed); 
				}

			}
	}  else {
		
		if (isset($par['useraw'])) {
				$pp=$_SERVER['DOCUMENT_ROOT'];
				$fname=$change;
				 preg_match('/(\w+)\.([^\.]+)$/sU',$fname, $mtch);
				 $tt= $mtch[2];


				$new_location=$pp.$depot['path']['tmp'];
				$new_fname=$pp.$depot['path']['tmp'].$fname;

				if (!@copy($pp.$depot['path']['full'].getImagePath($fname).$fname, $new_fname)) {
					$depot['errors'][]="Impossible to use/find original file";
					return false;
				};
	
				$max=$enviro['large_im_size'];   /**/
				

				switch ($tt) {
					case 'jpg':
						if (!(@$image=ImageCreateFromJpeg($new_fname))) {
							$depot['errors'][]="The file you uploaded isn't a valid JPEG format";
							return;
						}
						break;
			
					case 'gif':
						if (!(@$image=ImageCreateFromGif($new_fname))) {
							$depot['errors'][]="The file you uploaded isn't a valid GIF format";
							return;
						}
						break;
					case 'png':
						if (!(@$image=ImageCreateFromPng($new_fname))) {
							$depot['errors'][]="The file you uploaded isn't a valid PNG format";
							return;
						}
						break;
				}

				
				
				$height=ImageSY($image);
				$width=ImageSX($image);

				if ( $max >= $width ) {
					$bigw=$width;
					$bigh=$height;
				} else {
					$bigw=$max;
					$bigh=(int)(($max*$height)/$width);
				}

				$bigimage=ImageCreateTrueColor($bigw,$bigh);
				$cream=ImageColorAllocate($bigimage,254,244,231);
				ImageFill($bigimage,111,111,$cream);
				imagecopyresampled ($bigimage, $image, 0, 0, 0, 0, $bigw, $bigh, $width, $height);


				$save_processed=$new_location.'processed_'.$fname;
				switch ($tt) {
					case 'jpg':
						ImageJpeg($bigimage,$save_processed,100);
						break;
				
					case 'gif':
						ImageGif($bigimage,$save_processed);
						break;
					case 'png':
						ImagePng($bigimage,$save_processed);
						break;
				}		

				ImageDestroy($image);
				ImageDestroy($bigimage);
				$par['ppic']=array($fname,$bigw,$bigh);
				
		} else {
			return false;	
		}
	
	}
	return true;
}


function gallery_images_format($edit=0){
	global $par,$b2, $tx, $depot, $allangs,$depot;
	$html="<form name='ad' method=post enctype=\"multipart/form-data\" >";
	$max_interface_width=1200;
	if (tmp_file_save_gallery('filename',@$par['oldfilename'])){
		$margin=(int)((900-$par['ppic'][1])/2);

		/*ֲ�� ��������
		$divwidth = $par['ppic'][1]; 
		$divheight = $par['ppic'][2];
		$marginleft=0;
		$margintop=0;
		*/

		/* ��� ������� �� ������
		$divwidth = ($par['ppic'][1]<$par['ppic'][2]) ? $par['ppic'][1] : $par['ppic'][2];
		$marginleft=(int)(($par['ppic'][1]-$divwidth)/2);
		$margintop=(int)(($par['ppic'][2]-$divwidth)/2);
		$divheight=$divwidth; */


		/* ��� ����������� �� ������*/
		/* OR SQUARE  */




		/*$ratio = ($par['ppic'][1]/$depot['enviro']['middle_im_size'] > $par['ppic'][2]/$depot['enviro']['intxt_img_height']) ?
				$par['ppic'][2]/$depot['enviro']['intxt_img_height'] : $par['ppic'][1]/$depot['enviro']['middle_im_size'];
		
		$divwidth = $depot['enviro']['middle_im_size']*$ratio; 
		$divheight=$depot['enviro']['intxt_img_height']*$ratio;
		*/
		
		/*BIND TO 400x280 proportion*/
		
		$ratio = ($par['ppic'][1]/$depot['enviro']['middle_im_size'] > $par['ppic'][2]/$depot['enviro']['intxt_img_height']) ?
				$par['ppic'][2]/$depot['enviro']['intxt_img_height'] : $par['ppic'][1]/$depot['enviro']['middle_im_size'];
		
		$divwidth = $depot['enviro']['middle_im_size']*$ratio; 
		$divheight=$depot['enviro']['intxt_img_height']*$ratio;
		$marginleft=(int)(($par['ppic'][1]-$divwidth)/2);
		$margintop=(int)(($par['ppic'][2]-$divheight)/2);
		
		$scaleKoef=1;
		if ($divwidth > $max_interface_width) {
			$scaleKoef= $max_interface_width/$divwidth;
			$divwidth = $max_interface_width;
			$divheight*=$scaleKoef;
		}

		$par['real_middle_width']=$depot['enviro']['middle_im_size'];

		$html.="<div style='margin-bottom:30px;padding:10px;margin-right:50px;'>
		<table width=100%><tr bgcolor='#FFFF66'>
			<td width=22%>X [ <input class=transp type=\"text\" name=\"fromx\" id=xpos  value='$marginleft'> ]</td>
			<td width=22%>Y [ <input class=transp type=\"text\" name=\"fromy\" id=ypos  value='$margintop'> ]</td>
			<td width=22%>W [ <input class=transp type=\"text\" name=\"tox\" id=wd value='$divwidth '> ]</td>
			<td width=22%>H [ <input class=transp type=\"text\" name=\"toy\" id=ht value='$divheight '> ]</td>
			<td width=12%><input type=button onClick='setSize()' value='".iho("Встановити")."' class=button2></td>
		</tr>
		<tr bgcolor='#EEEEEE'>
			<td colspan=1>".iho('Пропорційно')."</td>
			<td><input name=uniformscale type=checkbox value=1 checked></td>
			<td><input type=button onClick='resetToUniform()' value='".iho("Квадрат")."' class=button2></td>
			<td><input type=button onClick='resetToFull()' value='".iho("Все")."' class=button2></td>
		</tr>
		<tr bgcolor='#CCCCCC'>
			<td colspan=2>".iho('Ширина (середній розмір)')."</td>
			<td>".bd_tf(@$par['real_middle_width'],'real_middle_width','text','width:100px;','','')."</td>
			<td></td>

		</tr>
		
		
		</table></div>";

		
		//$html.="<img src='/media/gallery/tmp/processed_".$par['ppic'][0]."'>";
		$html.="
				  <div style = 'width:".$par['ppic'][1]*$scaleKoef."px;height:".$par['ppic'][2]*$scaleKoef."px;background:#EEE url(/media/gallery/tmp/processed_".$par['ppic'][0]."?y=".time().") top left no-repeat;margin:30px auto;border:#999 dashed 1px;' id=originalImage>

					<div class=imholder id=mover style='left:$marginleft;top:$margintop;'>
						<a href='' onClick='return false' onMOuseDown='dragStart(event,\"mover\",\"dragGo\")'><img src='/gazda/img/bg-move.gif'></a>
						
						<div class=imsizer style=\"width:".$divwidth."px;height:".$divheight."px;\" id=sizer onMOuseDown='dragStart(event,\"sizer\",\"scaleD\")'>
						</div>

					</div>
				</div>";


		$html.="<div style=\"padding:20px;background:#EEE;border:#CCC solid 1px;margin-top:30px;\">";
		
		$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
		$html.="<table width=600>";
		
		
		

		if (!$edit)	{
			$html.="
				<tr>
					<td width=40%>".iho("Назва файлу на сервері")."</td>
					<input type=hidden name=original_name value='".@$par['ppic'][0]."'>
					<td>".bd_tf(@$par['ppic'][0],'newfilename','text','width:350px;border:#CC0000 solid 1px;',2,'')."</td></tr>";
			for ($i=0;$i<conn_sql_num_rows($sql);$i++){
				$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
				$html.="<tr><td width=40%>".iho('Інформація (').$res['langtitle'].")</td>";
				$html.="<td>".bd_tar("",'title_'.$res['lang'],'350px','80px',($i+3))."</td></tr>";

			}
	
			$html.='</tr>';



			/*$html.="<tr><td width=40%>".iho("�������� ������������ �����")."</td>";
			$html.="<td><input type=checkbox name=savefull checked></td></tr>";*/
			/*$html.="<input type=hidden name=savefull value=0>";*/

			$html.='<tr><td></td><td><a href="" onClick="sbm(\'proceedsave\',\'\',\'\');return false;"><img src="img/bt_save.gif" alt="'.$depot['tx']["ti_save"].'" title="'.$depot['tx']["ti_save"].'" border=0></a></td></tr>';
			$html.="</table>";
		} else {
		   for ($i=0;$i<conn_sql_num_rows($sql);$i++){
				$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
				$html.="<input type=hidden name='".'titlee_'.$res['lang']."' value='".@$par['titlee_'.$res['lang']]."'>";

			}
			$html.="
				<input type=hidden name='oldfilename' value='".@$par['oldfilename']."'>
				<input type=hidden name='arrayname' value='".@$par['arrayname']."'>
				<!--tr>
					<td width=40%>".iho("Зберігати повнорозмірну версію")."</td>
					<td><input type=checkbox name=savefull checked></td>
				</tr-->";
			/*$html.="<input type=hidden name=savefull value=0>";*/

			$html.='<tr><td></td><td><a href="" onClick="sbm(\'proceedsaveedit\',\'\',\'\');return false;"><img src="img/bt_save.gif" alt="'.$depot['tx']["ti_save"].'" title="'.$depot['tx']["ti_save"].'" border=0></a></td></tr>';
			$html.="</table>";
		}
		$html.="</div>";

	} else {
		$par['su']='v';
		return gallery_images_view();
	}
	$html.="<input type=hidden name=fname	value='".$par['ppic'][0]."'>";
	$html.="<input type=hidden name=tags	value='".sqller(@$par['tags'])."'>";
	$html.="<input type=hidden name=fwidth	value='".$par['ppic'][1]."'>";
	$html.="<input type=hidden name=fheight value='".$par['ppic'][2]."'>";
	$html.="<input type=hidden name=mark	value='".@$par['mark']."'>";
	$html.="<input type=hidden name=watermark	value='".@$par['watermark']."'>";
	$html.="<input type=hidden name=save_original	value='".@$par['save_original']."'>";
	$html.="<input type=hidden name=original_name	value='".$par['ppic'][0]."'>";
	$html.="<input type=hidden name=su value=\"proceedsave\">";
	$html.="<script language='javascript' type='text/javascript'  src='js/images.js'></script>";
	$html.="<input type=hidden name=id value=\"".@$par['id']."\">";
	return $html."</form>";
}


 function gallery_images_proceedsave($edit=0){
	global $par,$b2, $tx, $enviro,$depot, $allangs;
	$html='';
	$tmb_path=$depot['path']['tmb'];
	$mid_path=$depot['path']['intxt'];
	$full_path=$depot['path']['full'];

	 if (!$edit){
		/*check newname*/
		$final_fname=$par['fname'];
		if ($par['fname'] !== $par['newfilename']) {

			$ishere=conn_fetch_row(conn_sql_query("SELECT COUNT(*) FROM ".PICS." WHERE filename=\"".strtolower($par['newfilename'])."\""));
			if (!($ishere[0])){
				$final_fname=strtolower($par['newfilename']);
			} else {
				$depot['oks'][]=iho("Файл з таким іменем існує. Система обрала попередньо визначене ім'я: ".$fname);
			}
		}
	 } else{
		 $par['fname'] = $par['original_name']=$final_fname=$par['oldfilename'];
	 }


	$full_file_name=splitByDirectories($final_fname,$depot['path']);

	$old_big=$pp=$_SERVER['DOCUMENT_ROOT'].$depot['path']['tmp'].'processed_'.$par['fname'];
	
	
	$old_full=$pp=$_SERVER['DOCUMENT_ROOT'].$depot['path']['tmp'].$par['fname'];
	
	/*if (@$par['savefull']){
		if (file_exists($full_file_name['raw']))
			unlink($full_file_name['raw']);
		rename($old_full,$full_file_name['raw']);
	} else unlink($_SERVER['DOCUMENT_ROOT'].'/media/gallery/tmp/'.$final_fname); */
	unlink($_SERVER['DOCUMENT_ROOT'].$depot['path']['tmp'].$final_fname);
	
	preg_match("/^([\w-_]+)(\.)(\w+)$/",$final_fname,$matches);

	$exts=array(
		'image/jpeg'=>'jpg',
		'image/pjpeg'=>'jpg',
		'image/gif'=>'gif',
		'image/png'=>'png'
	);


	$from_file=$old_big;
	$type=$matches[3];

	switch ($type) {
		case 'jpg':
		case 'jpeg':
			if (!(@$image=ImageCreateFromJpeg($from_file))) {
				$depot['errors'][]="The file you uploaded isn't a valid JPEG format";
				return;
			}
			break;
		case 'gif':
			if (!(@$image=ImageCreateFromGif($from_file))) {
				$depot['errors'][]="The file you uploaded isn't a valid GIF format";
				return;
			}
			break;
		case 'png':
			if (!(@$image=ImageCreateFromPng($from_file))) {
				$depot['errors'][]="The file you uploaded isn't a valid PNG format";
				return;
			}
			break;
	}



	$white = imagecolorallocate($image, 255, 255, 255);
	$black = imagecolorallocate($image, 0, 0, 0);
	$grey = imagecolorallocate($image, 125, 125, 125);
	/*$cream=ImageColorAllocate($newimage,0,102,153);
	ImageFill($newimage,10,10,$cream);
	imagecopyresampled ($newimage, $image, 0, 0, $par['fromx'], $par['fromy'], $middle_w, $middle_h, $par['tox'], $par['toy']);*/


	if ($depot['errors']) return;
	$white=ImageColorAllocate($image,255,255,255);
	$height=ImageSY($image);
	$width=ImageSX($image);	

	/*					INTXT				*/	
	$middle_w=$middle_h=$depot['enviro']['middle_im_size'];
	$middle_w=$middle_h=(isset($par['real_middle_width'])) ?  $par['real_middle_width'] : $depot['enviro']['middle_im_size'];

	$small_w=$depot['enviro']['small_im_size'];
	$small_h=$depot['enviro']['small_im_height'];/*$depot['enviro']['small_im_size'];*/

	$middle_h=(float)$par['toy']*(float)$middle_w/(float)$par['tox'];
	$k=(float)$middle_w/(float)$par['tox'];

	$x0=(0-$par['fromx'])*$k;
	$y0=(0-$par['fromy'])*$k;
	$x1=$width*$k;
	$y1=$height*$k;


	/*$max=$middle_w;
	if ( $max >= $width ) {
		$midw=$width;
		$midh=$height;
	} else {
		$midw=$max;
		$midh=(int)(($max*$height)/$width);
	}  */

	$newimage=ImageCreateTrueColor($middle_w,$middle_h);
	$cream=ImageColorAllocate($newimage,255,255,255);
	ImageFill($newimage,0,0,$cream);
	/*imagecopyresampled ($newimage, $image, 0, 0, 0, 0, $midw, $midh, $width, $height);*/
	imagecopyresampled ($newimage, $image, $x0, $y0, 0, 0, $x1, $y1, $width, $height);

	switch ($type) {
		case 'jpg':
		case 'jpeg':
			ImageJpeg($newimage,$full_file_name['intxt'],100);
			break;
		case 'gif':
			ImageGif($newimage,$full_file_name['intxt']);
			break;
		case 'png':
			ImagePng($newimage,$full_file_name['intxt']);
			break;
	}	

	
	/*				THUMBNAIL			*/
	/*				SQUARE SIZE			

	$newthumb=ImageCreateTrueColor($small_w,$small_h);
	$cream1=ImageColorAllocate($newthumb,225,225,225);
	ImageFill($newthumb,1,1,$cream1);
	
	$delta=($par['tox']<$par['toy']) ? $par['tox'] : $par['toy']; 
	$k=$delta/$small_w;

	$x0=$par['fromx']+($par['tox']-$delta)/2;
	$y0=$par['fromy']+($par['toy']-$delta)/2;

	imagecopyresampled ($newthumb, $image, 0, 0, $x0, $y0, $small_w, $small_w, $delta, $delta);*/


	
	/*		RECTANGLE	*/

	//$small_h=$par['toy']*$small_w/$par['tox'];
	$k=(float)$small_w/(float)$par['tox'];

	$x0=(0-$par['fromx'])*$k;
	$y0=(0-$par['fromy'])*$k;
	$x1=$width*$k;
	$y1=$height*$k;

	$newthumb=ImageCreateTrueColor($small_w,$small_h);
	$cream=ImageColorAllocate($newthumb,255,255,255);
	ImageFill($newthumb,1,1,$cream);
	imagecopyresampled ($newthumb, $image, $x0, $y0, 0, 0, $x1, $y1, $width, $height);
	


	switch ($type) {
		case 'jpg':
		case 'jpeg':
			ImageJpeg($newthumb,$full_file_name['tmb'],100);
			break;
		case 'gif':
			ImageGif($newthumb,$full_file_name['tmb']);
			break;
		case 'png':
			ImagePng($newthumb,$full_file_name['tmb']);
			break;
	}
	

	if ($par['watermark']) {
		$markimage=ImageCreateFromPng($_SERVER['DOCUMENT_ROOT']."/gazda/img/mark.png");
		imagecopy ($image, $markimage, 40, ($height-100), 0, 0, 200, 61 );
	}

	if ($par['mark']){
		imagettftext($image, 8, 0, 8, ($height-7), $black, $_SERVER['DOCUMENT_ROOT']."/media/fonts/trebuc.ttf", $par['mark']);
		imagettftext($image, 8, 0, 7, ($height-8), $white, $_SERVER['DOCUMENT_ROOT']."/media/fonts/trebuc.ttf", $par['mark']);
	 }
	
	if (!@$par['save_original']){
		switch ($type) {
			case 'jpg':
			case 'jpeg':
				ImageJpeg($image,$full_file_name['full'],100);
				break;
			case 'gif':
				ImageGif($image,$full_file_name['full']);
				break;
			case 'png':
				ImagePng($image,$full_file_name['full']);
				break;
			
		}
	} else {
		copy($old_big,$full_file_name['full']);
	}

	/*switch ($type) {
		case 'jpg':
			ImageJpeg($image,$_SERVER['DOCUMENT_ROOT'].$full_path.$final_fname,80);
			break;
		case 'gif':
			ImageGif($image,$_SERVER['DOCUMENT_ROOT'].$full_path.$final_fname);
			break;
		case 'png':
			ImagePng($image,$_SERVER['DOCUMENT_ROOT'].$full_path.$final_fname);
			break;
	}	*/
	ImageDestroy($image);
	ImageDestroy($newimage);
	ImageDestroy($newthumb);

	unlink($_SERVER['DOCUMENT_ROOT'].$depot['path']['tmp'].'processed_'.$par['fname']);
	if ($par['su'] !=='proceedsaveedit')   {
		if (!count($depot['errors'])){
			$query ="INSERT INTO ".PICS." SET filename=\"".conn_real_escape_string(stripslashes($final_fname))."\",";
			$sql1=conn_sql_query("SELECT * FROM ".LANG."");
			for ($i=0;$i<conn_sql_num_rows($sql1);$i++){
					$res=conn_fetch_array($sql1, PDO::FETCH_ASSOC);
					$val=puttodb($par['title_'.$res['lang']],$res['lang']);
					$query.="title_".$res['lang']." = \"".$val."\",";
			}
			$query.="	
				pic_type=\"".$par['id']."\",
				tags = \"".sqller(@$par['tags'])."\", 	
			";

			$query.=" intxtwidth=\"".$par['real_middle_width']."\" ";
			if (@$par['savefull']){
				$query.=", raw=1";
			}
			conn_sql_query($query) or die(conn_error());
			$par['imageid'] = conn_insert_id();
			conn_sql_query("UPDATE ".PICS." SET orderid = ".conn_insert_id()." WHERE id = ".conn_insert_id()."");
			$depot['oks'][]=iho('Зображення додано');
		}
	}
	return true;
}



function gallery_images_proceedsave1($edit=0){
	global $par,$b2, $tx, $enviro,$depot, $allangs,$depot;
	$html='';
	$tmb_path=$depot['path']['tmb'];
	$mid_path=$depot['path']['intxt'];
	$full_path=$depot['path']['full'];

	/*check newname*/
	$final_fname=$par['fname'];


	if (!$edit){
		/*check newname*/
		$final_fname=$par['fname'];
		if ($par['fname'] !== $par['newfilename']) {

			$ishere=conn_fetch_row(conn_sql_query("SELECT COUNT(*) FROM ".PICS." WHERE filename=\"".strtolower($par['newfilename'])."\""));
			if (!($ishere[0])){
				$final_fname=strtolower($par['newfilename']);
			} else {
				$depot['oks'][]=iho("Файл з таким іменем існує. Система обрала попередньо визначене ім'я: ".$fname);
			}
		}
	 } else{
		 $par['fname'] = $par['original_name']=$final_fname=$par['oldfilename'];
	 }




	$old_big=$pp=$_SERVER['DOCUMENT_ROOT'].'/media/gallery/tmp/'.'processed_'.$par['fname'];
	$old_full=$pp=$_SERVER['DOCUMENT_ROOT'].'/media/gallery/tmp/'.$par['fname'];


	$full_file_name=splitByDirectories($final_fname,$depot['path']);

	
	/*if (@$par['savefull']){
		if (file_exists($full_file_name['raw']))
			unlink($full_file_name['raw']);
		rename($old_full,$full_file_name['raw']);
	} else */
	unlink($_SERVER['DOCUMENT_ROOT'].'/media/gallery/tmp/'.$final_fname);
	
	preg_match("/^([\w-_]+)(\.)(\w+)$/",$final_fname,$matches);

	$exts=array(
					'image/jpeg'=>'jpg',
					'image/pjpeg'=>'jpg',
					'image/gif'=>'gif',
					'image/png'=>'png'
	);


	$from_file=$old_big;
	$type=$matches[3];

	switch ($type) {
		case 'jpg':
			if (!(@$image=ImageCreateFromJpeg($from_file))) {
				$depot['errors'][]="The file you uploaded isn't a valid JPEG format";
				return;
			}
			break;
		case 'gif':
			if (!(@$image=ImageCreateFromGif($from_file))) {
				$depot['errors'][]="The file you uploaded isn't a valid GIF format";
				return;
			}
			break;
		case 'png':
			if (!(@$image=ImageCreateFromPng($from_file))) {
				$depot['errors'][]="The file you uploaded isn't a valid PNG format";
				return;
			}
			break;
	}

	if ($depot['errors']) return;

	$uw1=$uw2=$depot['enviro']['middle_im_size'];
	$ut1=$ut2=$depot['enviro']['small_im_size'];
	$height=ImageSY($image);
	$width=ImageSX($image);	
	
						
	/*echo $neww."/".$newh."<br>";
	echo $depot['enviro']['middle_im_size']."<br>";
	echo $par['fromx']."/".$par['fromy']."<br>";
	echo $par['tox']."/".$par['toy']."<br>";*/

	$middle_w=$middle_h=$depot['enviro']['middle_im_size'];
	$middle_w=$middle_h=(isset($par['real_middle_width'])) ?  $par['real_middle_width'] : $depot['enviro']['middle_im_size'];

	$small_w=$small_h=$depot['enviro']['small_im_size'];

	$middle_h=$par['toy']*$middle_w/$par['tox'];
	$k=$middle_w/$par['tox'];

	$x0=(0-$par['fromx'])*$k;
	$y0=(0-$par['fromy'])*$k;
	$x1=$width*$k;
	$y1=$height*$k;



	$newimage=ImageCreateTrueColor($middle_w,$middle_h);
	$cream=ImageColorAllocate($newimage,255,255,255);
	ImageFill($newimage,1,1,$cream);
	/*imagecopyresampled ($newimage, $image, 0, 0, 0, 0, $midw, $midh, $width, $height);*/
	


	$white = imagecolorallocate($newimage, 255, 255, 255);
	$black = imagecolorallocate($newimage, 0, 0, 0);
	$grey = imagecolorallocate($newimage, 125, 125, 125);
	$cream=ImageColorAllocate($newimage,0,102,153);
	ImageFill($newimage,10,10,$cream);
	imagecopyresampled ($newimage, $image, $x0, $y0, 0, 0, $x1, $y1, $width, $height);
	if ($par['mark']){
		imagettftext($newimage, 8, 90,($uw1-3), ($uw1-3), $black, $_SERVER['DOCUMENT_ROOT']."/verdana.ttf", $par['mark']);
		imagettftext($newimage, 8, 90,($uw1-5), ($uw1-5), $grey, $_SERVER['DOCUMENT_ROOT']."/verdana.ttf", $par['mark']);
		imagettftext($newimage, 8, 90,($uw1-4), ($uw1-4),  $white, $_SERVER['DOCUMENT_ROOT']."/verdana.ttf", $par['mark']);
	}
	
	switch ($type) {
		case 'jpg':
			ImageJpeg($newimage,$full_file_name['intxt'],90);
			break;
		case 'gif':
			ImageGif($newimage,$full_file_name['intxt']);
			break;
		case 'png':
			ImagePng($newimage,$full_file_name['intxt']);
			break;
	}	

	
	/*				THUMBNAIL			*/
	$newthumb=ImageCreateTrueColor($small_w,$small_h);
	$cream1=ImageColorAllocate($newthumb,225,225,225);
	ImageFill($newthumb,1,1,$cream1);
	
	$delta=($par['tox']<$par['toy']) ? $par['tox'] : $par['toy']; 
	$k=$delta/$small_w;

	$x0=$par['fromx']+($par['tox']-$delta)/2;
	$y0=$par['fromy']+($par['toy']-$delta)/2;

	//imagecopyresampled ($newthumb, $image, 0, 0, $par['fromx'], $par['fromy'], $small_w, $small_h, $par['tox'], $par['toy']);
	imagecopyresampled ($newthumb, $image, 0, 0, $x0, $y0, $small_w, $small_w, $delta, $delta);

	//imagecopyresampled ($newthumb, $image, ($ut1-$neww)/2, ($ut2-$newh)/2, 0, 0, $neww, $newh, $width, $height);
	
	switch ($type) {
		case 'jpg':
			ImageJpeg($newthumb,$full_file_name['tmb'],100);
			break;
		case 'gif':
			ImageGif($newthumb,$full_file_name['tmb']);
			break;
		case 'png':
			ImagePng($newthumb,$full_file_name['tmb']);
			break;
	}

	

	
	$markimage=ImageCreateFromPng($_SERVER['DOCUMENT_ROOT']."/gazda/img/mark.png");
	imagecopy ($image, $markimage, 7, ($height-30), 0, 0, 150, 31 );

	if ($par['mark']) {
		$white = imagecolorallocate($image, 255, 255, 255);
		$black= imagecolorallocate($image, 0, 0, 0);
		$grey = imagecolorallocate($image, 125, 125, 125);
		imagettftext($image, 8, 0, 9,($height-5), $grey, $_SERVER['DOCUMENT_ROOT']."/verdana.ttf", $par['mark']);
		imagettftext($image, 8, 0, 7,($height-3), $black, $_SERVER['DOCUMENT_ROOT']."/verdana.ttf", $par['mark']);
		imagettftext($image, 8, 0, 8,($height-4), $white, $_SERVER['DOCUMENT_ROOT']."/verdana.ttf", $par['mark']);
	}

	switch ($type) {
		case 'jpg':
			ImageJpeg($image,$full_file_name['full'],80);
			break;
		case 'gif':
			ImageGif($image,$full_file_name['full']);
			break;
		case 'png':
			ImagePng($image,$full_file_name['full']);
			break;
	}


	ImageDestroy($image);
	ImageDestroy($newimage);
	ImageDestroy($newthumb);

	unlink($_SERVER['DOCUMENT_ROOT'].'/media/gallery/tmp/processed_'.$par['fname']);

	/*if (!count($depot['errors'])){
		$query ="INSERT INTO ".PICS." SET filename=\"".conn_real_escape_string(stripslashes($final_fname))."\",";
		$sql1=conn_sql_query("SELECT * FROM ".LANG."");
		for ($i=0;$i<conn_sql_num_rows($sql1);$i++){
				$res=conn_fetch_array($sql1, PDO::FETCH_ASSOC);
				$val=puttodb($par['title_'.$res['lang']],$res['lang']);
				$query.="title_".$res['lang']." = \"".$val."\",";
		}
		$query.=" pic_type=\"".$par['id']."\" ";
		if (@$par['savefull']){
			$query.=", raw=1";
		}
		conn_sql_query($query) or die(conn_error());
		$depot['oks'][]=iho('���������� ������');
	} */


	if ($par['su'] !=='proceedsaveedit')   {
		if (!count($depot['errors'])){
			$query ="INSERT INTO ".PICS." SET filename=\"".conn_real_escape_string(stripslashes($final_fname))."\",";
			$sql1=conn_sql_query("SELECT * FROM ".LANG."");
			for ($i=0;$i<conn_sql_num_rows($sql1);$i++){
					$res=conn_fetch_array($sql1, PDO::FETCH_ASSOC);
					$val=puttodb($par['title_'.$res['lang']],$res['lang']);
					$query.="title_".$res['lang']." = \"".$val."\",";
			}
			$query.=" pic_type=\"".$par['id']."\", ";
			$query.=" intxtwidth=\"".$par['real_middle_width']."\" ";
			if (@$par['savefull']){
				$query.=", raw=1";
			}
			conn_sql_query($query) or die(conn_error());
			$par['imageid'] = conn_insert_id();
			conn_sql_query("UPDATE ".PICS." SET orderid = ".conn_insert_id()." WHERE id = ".conn_insert_id()."");
			$depot['oks'][]=iho('Зображення додано');
			
		}
	}



	

	return gallery_images_view();
	
	
}



function splitByDirectories($final_fname,$paths){
	$mtch=array('1','2');
	preg_match("/^(.+)(\.)(\w+)$/",$final_fname,$mtch);

	if (!isset($mtch[1])) die ("UNRECOVERABLE ERROR ".__FILE__."/".__LINE__);

	$letetrs_string= chunk_split($mtch[1],1,'{OOO}');
	$string= explode('{OOO}',$letetrs_string);
	$rot=$_SERVER['DOCUMENT_ROOT'];
	$path_array=array();

	for ($i=0;$i<2;$i++){
	   if(isset($string[$i])){
		   
			preg_match("/([A-Za-z0-9]{1})/",$string[$i],$matches);
			if (!isset($matches[0])) $string[$i]='other'; 
	   }
	}
	foreach (array('full','intxt','tmb','raw') as $p){
		$dir_name=$rot.$paths[$p].$string[0];
		if (!file_exists($dir_name) || !is_dir($dir_name)){
			mkdir($dir_name);
		}
		$path_array[$p]= $dir_name."/".$final_fname;
	}

	if(!isset($string[1])) return $path_array;
	$path_array=array();

	foreach (array('full','intxt','tmb','raw') as $p){
		$dir_name=$rot.$paths[$p].$string[0].'/'.$string[1];
		if (!file_exists($dir_name) || !is_dir($dir_name)){
			mkdir($dir_name);
		}
		$path_array[$p]= $dir_name."/".$final_fname;
	}
	return $path_array;
}


function image_again(){
	global $depot,$par,$enviro,$tx;
	$html="<form name='ad' method=post enctype=\"multipart/form-data\" >";
	$par['pattidvar']="addimage";
	$given_arr=explode("___",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG."");
	$var='';
	$html='';
	$var.="<table width=60% align=center><tr><td colspan=2 height=50> </td></tr><tr><td width=50%>".iho("Файл зображення")."</td>";
	$var.="<td>";
	$var.="<INPUT TYPE='FILE' name='filename' style=\"width:300px;border:#CC0000 solid 1px;\" value=\"".@$par['filename']."\">";
	$var.="</td></tr>";
	$var.="<tr><td width=50%>".iho("Назва файлу на сервері (без розширення).")."</td>";
	$var.="<td>".bd_tf(@$par['newfilename'],'newfilename','text','width:300px;border:#CC0000 solid 1px;',2,'')."</td></tr>";
	$var.="<tr><td width=50%></td>";
	$var.="<td>".iho("Для назви файлу використовуйте лише латинські літери та цифри. Допускається використання знаків '-','_' ")."</td></tr>";

	$var.="<tr><td>".iho("Марка для зображення")."</td>";
	$var.="<td><input type=text name=mark value='zik.com.ua' style=\"width:300px;border:#CC0000 solid 1px;\"></td></tr>";

	$var.='<tr><td></td><td><a href="JavaScript:savetype(\''.$par["pattidvar"].'\',\'saveimage\')"><img src="img/bt_save.gif" alt="'.$depot['tx']["ti_save"].'" title="'.$depot['tx']["ti_save"].'" border=0></a></td></tr><tr><td colspan=2 height=50> </td></tr>';
	$var.="</table>";
			
	$html.= "<script language=JavaScript>";
	$html.="var tbd = document.getElementById ? document.getElementById('addimage___tbody') : null;tbd.style.display='';";
	$html.="setvalue(\"".$par['pattidvar']."\",\"".puttojs($var)."\");</script>";
	return $html."</form>";
}

function pic_js(){
	global $ctime;
$r=<<<JSCR

 <script language="javaScript">

		  <!--
			
			function add_type(pattidvar,ttype,visibility){
				var tbd = document.getElementById ? document.getElementById(pattidvar+'___tbody') : null;
				//window.alert(pattidvar+'___tbody');
				tbd.style.display=visibility;
				
				var obj = document.getElementById ? document.getElementById(pattidvar) : null;
				var objScript = document.getElementById ? document.getElementById("updscript") : null;
				obj.innerHTML ="<span style='text-align:center;'><img src=\"/gazda/img/clock.gif\"></span>";
				objScript.src = "/gazda/adm_get_list.php?pattidvar="+pattidvar+"&upd="+ttype+"&timest="+Math.random(); 

				
			}

			function add_type1(pattidvar,ttype){
				var tbd = document.getElementById ? document.getElementById('addimage___tbody') : null;
				tbd.style.display='';
				var obj = document.getElementById ? document.getElementById('addimage') : null;
				var objScript = document.getElementById ? document.getElementById("updscript") : null;
				obj.innerHTML ="<div style='text-align:center;'><img src=\"img/clock.gif\"></div>";
				objScript.src = "/gazda/adm_get_list.php?pattidvar="+pattidvar+"&upd="+ttype+"&timest="+Math.random();

				
			}

		function setvalue(name,value){
				var obj = document.getElementById ? document.getElementById(name) : null;
				obj.innerHTML = value;
		}
		  

		function savetype(pattidvar,suvalue){
			
			var obj = document.getElementById ? document.getElementById(pattidvar) : null;

			document.forms['ad'].su.value=suvalue;
			document.forms['ad'].arrayname.value=pattidvar;
			document.forms['ad'].submit();
			obj.innerHTML ="<img src=\"img/clock.gif\">";

			
		}

		function savetype1(pattidvar,suvalue){
			
			var obj = document.getElementById ? document.getElementById('addimage') : null;
			document.forms['ad'].su.value=suvalue;
			document.forms['ad'].arrayname.value=pattidvar;
			document.forms['ad'].submit();
			obj.innerHTML ="<img src=\"img/clock.gif\">";

			
		}



		function saveenviro(pattidvar){
			
			var obj = document.getElementById ? document.getElementById(pattidvar) : null;

			document.forms['ad'].su.value="changeenviro";
			document.forms['ad'].arrayname.value=pattidvar;
			document.forms['ad'].submit();
			obj.innerHTML ="<img src=\"img/clock.gif\">";

			
		}

		function editenv(pattidvar){
			//var parentObj=document.getElementById ? document.getElementById(pattidvar) : null;
			var obj = document.getElementById ? document.getElementById(pattidvar) : null;
			var objImg = document.getElementById ? document.getElementById(pattidvar+"___buttenv") : null;
			var objScript = document.getElementById ? document.getElementById("updscript") : null;
			
			obj.innerHTML ="<img src=\"img/clock.gif\">";
			objImg.innerHTML ="<img src=\"img/clock1.gif\">";

			objScript.src = "/gazda/adm_get_list.php?pattidvar="+pattidvar+"&upd=enviro&timest="+Math.random();

			//obj.innerHTML = "1920391203910293";
		}

		//-->
		 </script>
JSCR
;

return $r;
}


function gallery_images_move(){
	global $par,$tx,$depot;
	
	$thegroup=conn_fetch_row(conn_sql_query("SELECT pic_type FROM ".PICS." WHERE id = \"".$par['imageid']."\""));
	$par['id'] =$thegroup[0];
	$sql=conn_sql_query("SELECT * FROM ".PICS." WHERE pic_type = \"".$thegroup[0]."\" ORDER BY orderid DESC") or die(conn_error());
	
	$same_home=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$same_home[]=conn_fetch_assoc($sql);
	}
	$j=0;

	foreach($same_home as $radio){
		if ($radio["id"] == $par["imageid"]){
			break;
		}
		$j++;
	}

	if ($par['su']=="moveimup"){
		if (!isset($same_home[($j-1)])){
			$depot['errors'][]=$depot['tx']['al_topbranch'];
			return gallery_images_view();
		}
		$old=$same_home[($j-1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["filename"],$depot['tx']["ok_movedup"]);
			
	
	} else if ($par['su']=="moveimdown"){
	
		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$depot['tx']['al_lowbranch'];
			return gallery_images_view();;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["filename"],$depot['tx']["ok_moveddown"]);

	} else { 
		return gallery_images_view();;
	}
	
	conn_sql_query("UPDATE ".PICS." SET orderid=0 WHERE id=\"".$old["id"]."\"") or die(conn_error());
	conn_sql_query("UPDATE ".PICS." SET orderid=\"".$old["orderid"]."\" WHERE id=\"".$new["id"]."\"") or die(conn_error());
	conn_sql_query("UPDATE ".PICS." SET orderid=\"".$new["orderid"]."\" WHERE id=\"".$old["id"]."\"") or die(conn_error());
	
	return gallery_images_view();
}