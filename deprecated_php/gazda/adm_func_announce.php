<?

function aget_center(){
	global $tx,$depot,$lngs,$par;
	$ttop='';
	if (!require_level('ac_newsadd')){
		$errors[]=$depot["tx"]['in_noaccess'];
		return;
	}
	$lang_pars=array_keys($lngs);
	if (!isset($par['lang']) || !isset($lngs[$par['lang']][0])) $par['lang']=$lang_pars[0];

	if (!isset($par['su']) || !trim($par['su'])) $par['su']='view';
	switch ($par['su']){
		case "view": 
			$par['hder']=$depot["tx"]['he_announces'];
			$ttop.=announce_view();break;
		case "add": 
			$par['hder']=$depot["tx"]['he_addann'];	
			$ttop.=announce_add();break;
		case "edit": 
			$par['hder']=$depot["tx"]['he_editann'];	
			$ttop.=announce_add();break;
		case "svadd": 
		case "svedit": 
			$par['hder']=$depot["tx"]['he_addnews'];
			$ttop.=announce_save();break;
		case "remove": 
			$ttop.=announce_del();break;
	}
	$ttop= "<h1>".$par['hder']."</h1><hr><form name='ad' method=post>".$ttop;
	$ttop.= "</form>";
	return $ttop;
}


function announce_add(){
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
						SELECT		".ANNO.".*,
									DATE_FORMAT(".ANNO.".ddate,'%H.%i.%d.%m.%Y') AS mydate
						FROM		".ANNO." 
						WHERE		".ANNO.".id = \"".sqller($par['id'])."\"
				"));
		if (count($toedit)<3) {
			$errors[]=$depot["tx"]['al_noid'];
			$par['su']=$toview;
			return announce_view();
		}
		
		/*		FINALLY	*/	
		$do_not_affect=array();
		$awaiting_array=array("region");
		foreach ($toedit as $k=>$v){
			if (!in_array($k,$do_not_affect)) {
				if (!in_array($k,$awaiting_array)) {
					$par[$k] = stripslashes($v);
				} else {
					$par[$k] = explode(',',stripslashes($v));
				}
			}
		}
		list($par['hour'],$par['min'],$par['day'],$par['month'],$par['year']) = explode(".",$par['mydate']);
	}

	foreach ($lngs as $k=>$v) {
		$l[]=$k;
		$l[]=$v[0];
	}
	
	//if ($errors) $ttop.=errors();

	if ($par['su'] == 'add')
		$ttop.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'onChange = "chng_lang()"');
	else if ($par['su'] == 'edit')
		$ttop.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'');

		
	$ttop.="</div>
	
			<br><br><br>
			<table width=100% cellpadding=5 cellspacing=1>
				<tr><td width=70% valign=top>
					<label for=nbody>Заголовок анонсу</label>";
	$def_cont=@$par['announce'] ? $par['announce'] : '';
	$ttop.="<textarea id=\"announce\" name=\"announce\" style=\"height:100px;width:98%;\">$def_cont</textarea>
			<label for=nbody>Текст анонсу</label>";
	$def_cont=(@$par['atext']) ? $par['atext'] : '';
	$ttop.="<div style='width:98%'><textarea id=\"atext\" name=\"atext\" style=\"height:150px;width:96%;\">$def_cont</textarea></div>";

	$hours	=	range(0,23);
	foreach ($hours as $d) {$hour[]=sprintf("%02d",$d);$hour[]=sprintf("%02d",$d);}
	$mins	=	range(0,59);
	foreach ($mins as $d) {$min[]=sprintf("%02d",$d);$min[]=sprintf("%02d",$d);}
	$days	=	range(1,31);
	foreach ($days as $d) {$day[]=sprintf("%02d",$d);$day[]=sprintf("%02d",$d);}

	$mo_tx=explode(" ","mon_jan mon_feb mon_mar mon_apr mon_may mon_jun mon_jul mon_aug mon_sep mon_oct mon_nov mon_dec");
	$month=array();
	for ($i=1;$i<=count($mo_tx);$i++){
		$month[]=$i;
		$month[]=$depot["tx"][$mo_tx[($i-1)]];
	}
	$time=time();
	if (!isset($par['year'])) $par['year']=date("Y",$time);
	$curryear=date("Y",$time);
	$year=array();
	for ($i=($par['year']-1);$i<=($curryear+1);$i++){
		$year[]=$i;
		$year[]=$i;
	}
	
	$ttop.="</td><td valign='top'>";
	/*$ttop.=image_maker(@$par['images'],'images');*/

	/*
	
	РЕГІОНИ
	
	$ttop.="<label for='region'>Регіони</label>";

	$sql='SELECT id, title, cattype FROM '.CATS.' WHERE lng="'.$par["lang"].'" AND cattype = "city" ORDER BY orderid';


	$regs=array(0,'-----');
	$query=conn_sql_query($sql) or die(conn_error());
	for ($i=0;$i<conn_sql_num_rows($query);$i++) {
		$res=conn_fetch_row($query);
		$regs[]=$res['0'];
		$regs[]=$res['1'];
			
	}
	
	$ttop.=bd_multipopup($regs,'region','height:128px;width:99%',3,'');
	*/
	
	$ttop.="<label for=place>Адреса</label>
		".bd_tar(@$par['place'],'place','100%','100px;','2')."
		
		<label for=place>GPS <small style=\"font-size:11px;color:#999\">49.835519,24.034052</small></label>
		".bd_tf(@$par['gps'],'gps','text','width:100%','2','')."
	";

	$ttop.="<table width=97% style='border-bottom:#CCC solid 1px;'><tr>";
	$ttop.="<td width=10%><label for='hour'>Годин</label>";
	if (!isset($par['hour'])) $par['hour']=date("H",$time);
	$ttop.=bd_popup($hour,	'hour',	'width:45px',	1,	'')."</td>";
	
	$ttop.="<td width=10%><label for='min'>Хвилин</label>";
	if (!isset($par['min'])) $par['min']=date("i",$time);
	$ttop.=bd_popup($min,	'min',	'width:45px',	1,	'')."</td>";

	$ttop.="<td width=10%><label for='ddata'>Число</label>";
	if (!isset($par['day'])) $par['day']=date("d",$time);
	$ttop.=bd_popup($day,	'day',	'width:45px',	1,	'')."</td>";

	$ttop.="<td width=16%><label for='month'>Місяць</label>";
	if (!isset($par['month'])) $par['month']=date("m",$time);
	$ttop.=bd_popup($month,	'month', 'width:85px',	1,	'')."</td>";

	$ttop.="<td width=16%><label for='year'>Рік</label>";
	$ttop.=bd_popup($year,	'year', 'width:55px',	1,	'')."</td>";

	$ttop.="<td width=20% style='border-left:#999 solid 1px;padding-left:20px;'>";
	$ttop.="</td>";
	$ttop.="</tr></table>";
	if (@$par['notice']) $checked='checked'; else $checked='';
	$ttop.="<div class=dframe style='margin-top:15px;'><div class=bod><input type=checkbox name=notice value=1 $checked>&nbsp;Виділяти анонс</div></div>";

	if (@$par['id'])
			$ttop.="<input type=button name=addne id='submt' value='Видалити' style='margin:40px 0 20px 0px !important;float:right;' onClick=\"JavaScript:r('".$par['id']."')\">";
	
	$ttop.="

		<input type=submit name=addne id='submt' class=save value='Зберегти' style='margin:40px 0 20px 0px !important;float:left;'>
	</td>
	<td valign=top></td>
	</tr>
	
	<tr>
		<td valign=top></td>
	</tr>
	</table>
	
	<br><br>
	<hr>
	<script language=\"javascript1.2\">
				  CKEDITOR.replace( 'atext' );
			</script>
	<div name='langlex' id='langlex'></div>

				<input type=hidden name=act value=\"announce\">
				<input type=hidden name=su value=\"sv".$par['su']."\">	
				<input type=hidden name=id value=\"".@$par['id']."\">
				<input type=hidden name=oldsu value=\"".@$par['oldsu']."\">
				<input type=hidden name=city value=\"".@$par['city']."\">
	";
	return $ttop;
}


function announce_save(){
	global $par,$errors,$depot;
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'view';

	if ($errors) {
		if ($par['su'] == 'svadd') $par['su'] = 'add'; else $par['su'] = 'edit';
		return announce_add();
	}
	$ddate=	$par['year']."-".$par['month']."-".$par['day']." ".$par['hour'].":".$par['min'].":00";
	switch ($par['su']) {
		case "svadd":	
						$sql=	"INSERT INTO ".ANNO."	SET ";
						break;
		case "svedit":
						$sql=	"UPDATE ".ANNO."	SET ";
						break;
	}
	/*images		=	\"".sqller($par['selimgs_images'])."\",*/
	if (@$par['notice']) $notice=1;else $notice=0;
	$sql.="
			announce	=	\"".sqller($par['announce'])."\",
			atext		=	\"".sqller($par['atext'])."\",
			place		=	\"".sqller($par['place'])."\",
			gps		=	\"".sqller($par['gps'])."\",
			ddate		=	\"".$ddate."\",
			notice		=	$notice,
			lang		=	\"".sqller($par['lang'])."\",";
	
	foreach (array('region') as $v) {
		if (@$par[$v]) {
			$sql.="$v =	\"".sqller(implode(',',$par[$v]))."\",";
		}
		
	}

	$where='';

	if($par['su'] == 'svedit'){
		$where =" WHERE id = \"".sqller($par['id'])."\"";	
	}
	$sql=substr($sql,0,-1).$where;
    $res_ = conn_sql_query($sql) or die (conn_error());

	if (conn_affected_rows($res_)>0){
			$oks[]="1 ".$depot["tx"]['ok_recordsadded'];
	} else {
		$errors[]="Problem adding/editing ANNOUNCE information";
		$errors[]=$depot["tx"]['al_edited'];

	}
	$par['su'] = $toview;
	return announce_view();
}


function announce_view(){
	global $tx,$lngs,$lngs1,$par,$depot;
	$ttop='';
	foreach ($lngs as $k=>$v) {
		$l[]=$k;
		$l[]=$v[0];
	}
	$ttop.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'onChange = "chng_lang()"')."</div>";

	$ttop.="<div style='padding:5px;background:#EEE;'>";
	
	$days	=	range(1,31);
	$day=array(0,"---");
	foreach ($days as $d) {$day[]=sprintf("%02d",$d);$day[]=sprintf("%02d",$d);}

	$mo_tx=explode(" ","mon_jan mon_feb mon_mar mon_apr mon_may mon_jun mon_jul mon_aug mon_sep mon_oct mon_nov mon_dec");
	$month=array(0,"---");
	for ($i=1;$i<=count($mo_tx);$i++){
		$month[]=sprintf("%02d",$i);
		$month[]=$depot["tx"][$mo_tx[($i-1)]];
	}
	$time=time();
	$curryear=date("Y",$time);
	$year=array(0,"---");
	for ($i=($curryear-1);$i<=($curryear);$i++){
		$year[]=$i;
		$year[]=$i;
	}

	$anno_set=conn_sql_query("SELECT id,param, title FROM ".CATS." WHERE cattype='city' AND isvis = 1 AND lng=\"".$par['lang']."\" ORDER BY orderid");
	$anno_arr=array(0,'Всі анонси');
	while ($cty = conn_fetch_assoc($anno_set)){
		$anno_arr[]=$cty['id'];
		$anno_arr[]=$cty['title'];
	}

	$ttop.="
	
	<table><tr>
		<td>".bd_popup($day,	'sday',	'width:50px',	1,	'')."</td>
		
		<td>".bd_popup($month,	'smonth', 'width:100px',	1,	'')."</td>
		
		<td>".bd_popup($year,	'syear', 'width:60px',	1,	'')."</td>
		
		<td width=20>&nbsp;</td><td width=90>Ключове&nbsp;слово:</td>
		
		<td>".bd_tf(@$par['kwd'],	'kwd','text', 'width:150px',	1,	'')."</td>

		<td width=20>&nbsp;</td><td width=60>ID&nbsp;Анонсу:</td>
		<td>".bd_tf(@$par['sid'],	'sid','text', 'width:100px',	1,	'')."</td>
		
		<td width=60>".bd_popup($anno_arr,	'city', 'width:100px',	1,	'')."</td>
		<td width=20>&nbsp;</td><td width=60><input type=submit name=io id='submt' value='Фільтрувати'></td>
	</tr></table></div>
	<a href='' onClick='sbm(\"add\",\"\",\"\"); return false;' style='float:right;margin:10px;'><img src='/gazda/img/bt_add.gif' style='margin-right:15px;margin-bottom:-5px;'>ДОДАТИ</a>";

	$path="/gazda/index.php?act=announce&su=".$par['su'];
	$addon='';
	$addsql='';
	

	if (@$par['syear'] && @$par['smonth'] && @$par['sday']) {
		$addsql.= " AND DATE(ddate) = \"".implode('-',array($par['syear'],$par['smonth'],$par['sday']))."\"";
		$path.="&syear=".$par['syear']."&smonth=".$par['smonth']."&sday=".$par['sday'];
	} 
	else if (@$par['syear'] && @$par['smonth']) {
		$addsql.= " AND YEAR(ddate) = \"".$par['syear']."\" AND MONTH(ddate) = \"".$par['smonth']."\"";
		$path.="&syear=".$par['syear']."&smonth=".$par['smonth'];
	}
	else if (@$par['syear'] ) {
		$addsql.= " AND YEAR(ddate) = \"".$par['syear']."\"";
		$path.="&syear=".$par['syear'];
	}
	
	if (@$par['city']) {
		$path.="&city=".$par['city'];
		$addsql.=" AND FIND_IN_SET(\"".$par['city']."\",region) ";
	}

	if (@$par['kwd']) {
			$addsql.=" AND ".ANNO.".announce LIKE \"%".sqller($par['kwd'])."%\"";
			$path.="&kwd=".htmlspecialchars($par['kwd']);
	}

	if (@$par['sid']) {
		$addsql=" AND ".ANNO.".id = ".sqller($par['sid']);
	}

	$sql_qty=" SELECT COUNT(*) FROM ".ANNO." WHERE 1 /*lang = \"".$par['lang']."\"*/ ".$addsql;
	$count1=conn_sql_query($sql_qty) or die(conn_error());

	if (!isset($par['pg'])) $par['pg']=0;
	$perpage=30;
	$count=conn_fetch_row($count1);
	$pages=($count[0]%$perpage) ? (int)($count[0]/$perpage+1) : $count[0]/$perpage;

	$ppg=10;
	$pppages=($pages%$ppg) ? (int)($pages/$ppg+1) : $pages/$ppg;
	$curr_ppg=(int)($par['pg']/$ppg);

	$start_page=$curr_ppg*$ppg;
	$end_page=($curr_ppg*$ppg+$ppg>$pages) ? $pages : $curr_ppg*$ppg+$ppg;
	
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
		$ttop.="<div class=pager>";
		$ttop.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$ttop.= "<a href=\"$path&pg=$i\">".($i+1)."</a>";
			else $ttop.= "<span>".($i+1)."</span>";
		}
		$ttop.= $next_page.$nnext_page;

		$ttop.="<div style='padding-left:50px;font-size:18px;float:left;'>/ ".$count[0]."</div>";
		$ttop.="</div>";
	} else {
		$ttop.="<div style='font-size:18px;float:left;'>/ ".$count[0]."</div>";
	}

	$sql1="
		SELECT	*,
				DATE_FORMAT(ddate,'%d.%m.%y') AS ndatef,
				DATE_FORMAT(ddate,'%H:%i') AS ntimef
		FROM ".ANNO." WHERE 1 /*lang = \"".$par['lang']."\"*/ ".$addsql."
		ORDER BY ddate DESC 
		LIMIT	".$par['pg']*$perpage.",".$perpage;

	$qry=conn_sql_query($sql1) or die(conn_error());
	if (!conn_sql_num_rows($qry)) {
		$ttop.="<h2><br><br><br>".$depot["tx"]['he_norecords']."</h2>";
	} else {
	
			$ttop.="<table width=100% cellpadding=15 cellspacing=1  style='clear:both;'><td width=15% class=heaad>&nbsp;</td><td class=heaad width=65%>".$depot["tx"]['he_header']."</td><td width=20%  class=heaad>&raquo;</td></tr>";

			for ($i=0;$i<conn_sql_num_rows($qry);$i++){
				$res=conn_fetch_assoc($qry);
				
				if ($i%2) $bg=" bgcolor=#EEEEEE"; else $bg="";
				
				if ($res['notice']) $cls='class=red'; else $cls='';
				$ttop.="
						<tr>
							<td  class=bord  bgcolor='#F4ECD7'><b class=big>".$res['ndatef']." ".$res['ntimef']."</b></td>
							<td  class=bord  $bg style='padding:10px;'>";
				$ttop.="<b $cls>".$res['announce']."</b><br>".$res['place']."";
					
				
				$ttop.="</td><td  class=bord><a href=\"JavaScript:sbm('edit','".$res['id']."','')\" id=butt class=edit title=\"".$depot["tx"]["ti_edit"]."\"></a>";
				$ttop.="<a href=\"JavaScript:rr('".$res['id']."')\" id=butt class=del title=\"".$depot["tx"]["ti_delete"]."\" style='float:right;'></a>";
				$ttop.="</td></tr>";
			}
	}
	$ttop.="
				<input type=hidden name=oldsu value=\"".@$par['su']."\">
				<input type = hidden name='act' value='".$par['act']."'>
				<input type = hidden name='su' value=''>
				<input type = hidden name='id' value=''>
	</table>";

	return $ttop;
}


function announce_del(){
	global $par,$depot;
	$ttop='';
	
	if (isset($par['id'])) {
		$sql="DELETE FROM ".ANNO." WHERE id=\"".$par['id']."\"";	
	}

    $res_ = conn_sql_query($sql) or die(conn_error());
	if (conn_affected_rows($res_)) {
			array_unshift($depot['oks'],$depot["tx"]['ok_del1']);
	} else {
		array_unshift($depot['errors'],$depot["tx"]['al_norecs']."<br><br>");
	}
	$par['hder']=$depot["tx"]['he_announces'];
	$ttop.=announce_view();
	return $ttop;
}