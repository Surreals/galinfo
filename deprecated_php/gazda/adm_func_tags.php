<?


function aget_center(){
	global $tx,$depot,$lngs,$par;
	$ttop='';
	if (!require_level('ac_newsadd')){
		$depot['oks'][] = "У вас немає доступу до цієї сторінки";
		$errors[]=$depot["tx"]['in_noaccess'];
		return;
	}

	if(!require_level('ac_add_tags')){
		$depot['oks'][] = "У вас немає доступу до цієї сторінки";
		$errors[]=$depot["tx"]['in_noaccess'];
		return;
	}
	$lang_pars=array_keys($lngs);
	if (!isset($par['lang']) || !isset($lngs[$par['lang']][0])) $par['lang']=$lang_pars[0];
	if (!isset($par['su']) || !trim($par['su'])) $par['su']='view';
	switch ($par['su']){
		case "view": 
			$ttop.=tags_view();break;
		case "add": 
			$ttop.=tags_add();break;
		case "edit": 
			$ttop.=tags_add();break;
		case "svadd": 
		case "svedit": 
			$ttop.=tags_save();break;
		case "remove": 
			$ttop.=tags_del();break;
		case "removeconfirm": 
			$ttop.=tags_del();break;
	}
	$addhead = "";

	if (@$par['kwd']) $addhead.=" / Назва: ". $par['kwd'];
	if (@$par['sid']) $addhead.=" / ID: ". $par['sid'];

	$ttop= "<h1>Теги$addhead</h1><hr><form name='ad' method='post'>".$ttop;
	$ttop.= "</form>";
	return $ttop;
}


function tags_add(){
	global $par,$depot,$lngs;
	$ttop='';
	$nnow=time();
	$admin=0;
	if (require_level('ac_newsadmin')){
		$admin=1;
	}
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'view';
	if ($par['su'] == 'edit') {

		/*		CHECK AVAILABILITY		*/
		$toedit=conn_fetch_assoc(conn_sql_query("
			SELECT		".TAGS.".*
			FROM		".TAGS." 
			WHERE		id = \"".sqller($par['id'])."\"
		"));
		if (count($toedit)<2) {
			$errors[]=$depot["tx"]['al_noid'];
			$par['su']=$toview;
			return tags_view();
		}
		/*		FINALLY	*/	
		$do_not_affect=array();
		$awaiting_array=array("region");
		foreach ($toedit as $k=>$v){
			$par[$k] = stripslashes($v);
		}
	}
		
	$ttop.="
		<br><br>
		<table width=100% cellspacing=0 class='smart'>
			<tr class='header'>
				<td width=70% >Тег</td>
				<td>&nbsp</td>
			</tr>
			<tr>
				<td valign=top>
					<br><br><br>
					".bd_tf(@$par['tag'],'tag','text','width:100%','2','')."
				</td>
				<td valign='top'>
					<input type=submit name=addne id='submt' class=save value='Зберегти' style='margin:40px 0 20px 0px !important;float:left;'>
				</td>
			</tr>
		</tble>
	

		<input type=hidden name=act value=\"tags\">
		<input type=hidden name=su value=\"sv".$par['su']."\">	
		<input type=hidden name=id value=\"".@$par['id']."\">
		<input type=hidden name=oldsu value=\"".@$par['oldsu']."\">
	";
	return $ttop;
}


function tags_save(){
	global $par,$errors,$depot;
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'view';

	if ($errors) {
		if ($par['su'] == 'svadd') $par['su'] = 'add'; else $par['su'] = 'edit';
		return tags_add();
	}
	switch ($par['su']) {
		case "svadd":	
						$sql=	" INSERT INTO ".TAGS."	SET ";
						break;
		case "svedit":
						$sql=	" UPDATE ".TAGS."	SET ";
						break;
	}
	$sql.="
			tag	=	\"".sqller($par['tag'])."\"";

	$where='';

	if($par['su'] == 'svedit'){
		$where =" WHERE id = \"".sqller($par['id'])."\"";	
	}
	$sql.=$where;
    $res_ = conn_sql_query($sql) or die (conn_error());

	if (conn_affected_rows($res_)>0){
			$oks[]="1 ".$depot["tx"]['ok_recordsadded'];
	} else {
		$errors[]="Problem adding/editing TAG information";
		$errors[]=$depot["tx"]['al_edited'];

	}
	$par['su'] = $toview;
	return tags_view();
}


function tags_view(){
	global $tx,$lngs,$lngs1,$par,$depot;
	$ttop="
	
	<table class='smart'><tr>	
		<td width=90>Ключове&nbsp;слово:</td>		
		<td>".bd_tf(@$par['kwd'],	'kwd','text', 'width:150px',	1,	'')."</td>
		<td width=60>ID&nbsp;Новини:</td>
		<td>".bd_tf(@$par['sid'],	'sid','text', 'width:100px',	1,	'')."</td>
		<td width=60><input type=submit name=io id='submt' value='Фільтрувати'></td>
	</tr></table>
	<a href='' onClick='sbm(\"add\",\"\",\"\"); return false;' style='float:right;margin:10px;'><img src='/gazda/img/bt_add.gif' style='margin-right:15px;margin-bottom:-5px;'>ДОДАТИ</a>";

	$path="/gazda/index.php?act=tags&su=".$par['su'];
	$addsql='';

	if (@$par['kwd']) {
		$addsql.=" AND ".TAGS.".tag LIKE \"%".sqller($par['kwd'])."%\"";
		$path.="&kwd=".htmlspecialchars($par['kwd']);
	}

	if (@$par['sid']) {
		$addsql=" AND ".TAGMAP.".newsid = ".sqller($par['sid']);
	}

	/*$sql_qty=" 
		SELECT COUNT(*) 
		FROM ".TAGS." 
		LEFT JOIN ".TAGMAP."
		ON id = tagid
 		WHERE 1 ".$addsql. "
		GROUP BY id
	";

	$count1=conn_sql_query($sql_qty) or die(conn_error());*/
	$perpage=100;
	if (!isset($par['pg'])) $par['pg']=0;

	$sql1="
		SELECT	SQL_CALC_FOUND_ROWS  
			id, tag, count(*) qty
			FROM ".TAGS." LEFT JOIN ".TAGMAP."
			on id = tagid
			WHERE 1
			$addsql
			GROUP BY id
		ORDER BY tag
		LIMIT	".$par['pg']*$perpage.",".$perpage;

	$qry=conn_sql_query($sql1) or die(conn_error());

	$rcount = conn_fetch_row(conn_sql_query("SELECT FOUND_ROWS()"));
	
	$count=$rcount[0];
	$pages=($count%$perpage) ? (int)($count/$perpage+1) : $count/$perpage;
	$ppg=10;
	$pppages=($pages%$ppg) ? (int)($pages/$ppg+1) : $pages/$ppg;
	$curr_ppg=(int)($par['pg']/$ppg);

	$start_page=$curr_ppg*$ppg;
	$end_page=($curr_ppg*$ppg+$ppg>$pages) ? $pages : $curr_ppg*$ppg+$ppg;
	
	if ($curr_ppg!=0) {
		$prev_page="<a href=\"$path&pg=".($curr_ppg*$ppg-1)."\">&lt;</a>"; 
		$pprev_page="<a href=\"$path&pg=0\">&laquo;</a>"; 
	}	else {
		$prev_page="";
		$pprev_page="";
	}
	if ($curr_ppg!= ($pppages-1) && $pppages!==0) {
		$next_page="<a href=\"$path&pg=".(($curr_ppg+1)*$ppg)."\">&gt;</a>"; 
		$nnext_page="<a href=\"$path&pg=".($pages-1)."/\">&raquo;</a>";
	} else {
		$next_page="";
		$nnext_page="";
	}
		
	if ($pages>1) {
		$ttop.="<div class=pager>";
		$ttop.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$ttop.= "<a href=\"$path&pg=$i\">".($i+1)."</a>";
			else $ttop.= "<span>".($i+1)."</span>";
		}
		$ttop.= $next_page.$nnext_page;

		$ttop.="<div style='padding-left:50px;font-size:18px;float:left;'>/ ".$count."</div>";
		$ttop.="</div>";
	} else {
		$ttop.="<div style='font-size:18px;float:left;'>/ ".$count."</div>";
	}
	
	if (!conn_sql_num_rows($qry)) {
		$ttop.="<h2><br><br><br>".$depot["tx"]['he_norecords']."</h2>";
	} else {
	
		$ttop.="
		<table width=100% class='smart' cellspacing=0 style='clear:both;'>
			<tr class='header'>
				<td width=15%>ID</td>
				<td width=60%>".$depot["tx"]['he_header']."</td>
				<td width=5%>Новин</td>
				<td width=20%>&raquo;</td>
			</tr>";

		for ($i=0;$i<conn_sql_num_rows($qry);$i++){
			$res=conn_fetch_assoc($qry);
			$ttop.="
				<tr class='datarow'>
					<td>".$res['id']."</td>
					<td><b>".$res['tag']."</b></td>
					<td>".$res['qty']."</td>
					<td>
						<a href=\"JavaScript:sbm('edit','".$res['id']."','')\" id=butt class=edit title=\"".$depot["tx"]["ti_edit"]."\"></a>
						<a href=\"?act=tags&su=remove&id=".$res['id']."\" id=butt class=del title=\"".$depot["tx"]["ti_delete"]."\" style='float:right;'></a>
					</td>
				</tr>";
		}
	}
	$ttop.="
		<input type=hidden name=oldsu value=\"".@$par['su']."\">
		<input type = hidden name='act' value='".$par['act']."'>
		<input type = hidden name='su' value=''>
		<input type = hidden name='id' value=''>
		<input type = hidden name='pg' value='0'>
	</table>";

	return $ttop;
}


function tags_del(){
	global $par,$depot;
	$ttop='';
	if ($par['su'] == 'remove') {
		$tag=conn_fetch_row(conn_sql_query("SELECT tag FROM ".TAGS." where id = \"".sqller($par['id'])."\" "));
		$html = "
			<form method='post' style='display: block; text-align: center'>
				<div style='width: 400px; height: 200px; margin: 100px auto; border: #F00 solid 5px; padding: 30px; text-align:center;font-size: 14px;'>
					<b><input type = 'checkbox' name='isreplaceid' value='1'/> &nbsp;При видаленні замінити тег <span style='color:#F00'>".$tag[0]."</span> у всіх новинах на тег ID №:</b>
					<br><br>
					<input type = 'text' name = 'replaceid' /><br><br>
					<input type=submit name=addne id='submt' class=save value='Видалити' style='margin:40px 0 20px 0px !important;float:none;'>
				</div>
				<input type = hidden name='act' value='".$par['act']."'>
				<input type = hidden name='su' value='removeconfirm'>
				<input type = hidden name='id' value='".$par['id']."'>
			</form>	
		";
		return $html;
	} else {
		if (isset($par['isreplaceid']) && $par['replaceid']) {
			conn_sql_query(
				"DELETE FROM " . TAGMAP . " WHERE `newsid` IN (
					SELECT id FROM (
						SELECT a.newsid AS id
							FROM " . TAGMAP . " a
							JOIN " . TAGMAP . " a2 ON a.newsid = a2.newsid
						WHERE a.tagid = " . sqller($par['id']) . " AND a2.tagid = " . sqller($par['replaceid']) . " 
					) AS tmp
				) AND `tagid` = " . sqller($par['id']) . ";"
			);

			conn_sql_query("
				update ".TAGMAP."
				set tagid = \"".sqller($par['replaceid'])."\"
				where tagid = \"".sqller($par['id'])."\"
			") or die(conn_error());
		}
        $res_ = conn_sql_query("
			DELETE ".TAGS.",".TAGMAP." 
			FROM ".TAGS." LEFT JOIN ".TAGMAP."
			ON id = tagid
			where id = \"".sqller($par['id'])."\"
		") or die(conn_error());
		
		if (conn_affected_rows($res_)) {
			array_unshift($depot['oks'],$depot["tx"]['ok_del1']);
		} else {
			array_unshift($depot['errors'],$depot["tx"]['al_norecs']."<br><br>");
		}
		return tags_view();
	}
}