<?


function aget_center(){
		global $par, $depot;
		$types=explode(",","region,rubric,theme,city");
		if (!isset($par['type']) || !in_array($par['type'],$types)) $par['type']=$types[0];

		$lang_pars=array_keys($depot['vars']['langs']);

		if (!isset($par['lang']) || !isset($depot['vars']['langs'][$par['lang']][0])) $par['lang']=$lang_pars[0];


		if (isset($par['io'])) $par['pg']=0;

		$html= "<h1>".$depot['tx']['he_comments']."</h1><hr><form name='ad' method=post>";

		if (!isset($par['su']) || !trim($par['su'])) $par['su']='view';
		switch ($par['su']){
			case "view":
			case "block":
			case "unblock":
			case "replacement":	$html.=comments_view();	break;
			case "edit":		$html.=comments_add();	break;
			case "svadd": 
			case "svedit":		$html.=comments_save();	break;
			case "remove":		$html.=comments_del();	break;

		}

		$html.= "</form>";
		return $html;

}


function comments_replace(){
	global $par, $depot;
	$sql_qty=" SELECT id,comment FROM ".COMMENTS." WHERE ".COMMENTS.".comment LIKE \"%".sqller($par['findwhat'])."%\" limit 200";
	$sql=conn_sql_query($sql_qty) or die(conn_error());
	
	if (!conn_sql_num_rows($sql)) {
		$depot['oks'][]=iho('�� �������� ������� ���������');
		return;
	}

	$replaced=0;
	while ($res=conn_fetch_assoc($sql)){
		$res_ = conn_sql_query("
			
					UPDATE ".COMMENTS."
					SET		comment = \"".sqller(str_replace($par['findwhat'],$par['replaceto'],$res['comment']))."\"
					WHERE	id=\"".$res['id']."\"
		
		");

		if(conn_affected_rows($res_)) $replaced++;
	}

	$depot['oks'][]=$replaced." ".iho("��������� ����������");


}

function comments_add(){
	global $par,$depot;
	$html='';
	$nnow=time();
	
	$admin=0;
	if (require_level('ac_newscomment')){
		$admin=1;
	}
	
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'view';

	if ($par['su'] == 'edit') {

		/*		CHECK AVAILABILITY		*/
		$toedit=conn_fetch_assoc(conn_sql_query("
						SELECT		".COMMENTS.".*
						FROM		".COMMENTS." 
						WHERE		".COMMENTS.".id = \"".sqller($par['id'])."\"
				"));


		if (count($toedit)<3) {
			$depot['errors'][]=$depot['tx']['al_noid'];
			$par['su']=$toview;
			return comments_view();
		}
		

		foreach ($toedit as $k=>$v){
			$par[$k] = stripslashes($v);	
		}

	}

	foreach ($depot['vars']['langs'] as $k=>$v) {
		$l[]=$v['id'];
		$l[]=$v['langtitle'];
	}
	
	
	$html.="
		<table width=100% cellpadding=5 cellspacing=1>
			<tr><td width=600 valign=top>";
	$html.="<label for=nbody>".iho('�����')."</label>";	
	$html.=bd_tf(@$par['nick'],'nick','text','width:600px;','','');
	$html.="<label for=nbody>".iho('��������')."</label>";
	$def_cont=(@$par['comment']) ? $par['comment'] : '-';
	$html.="<textarea id=\"comment\" name=\"comment\" style=\"height:200px;width:600px;\">$def_cont</textarea>";
	$html.="</td></tr><tr><td valign=top>";
	
	if (@$par['id'])
			$html.="<input type=button name=addne id='submt' value='".iho('��������')."' style='margin:10px 0 20px 0px !important;' onClick=\"JavaScript:r('".$par['id']."')\">";
	
	$html.="<input type=submit name=addne id='submt' class=save value='".iho('��������')."' style='margin:10px 0 20px 250px !important;'>";
	
	$html.="</td></tr></table>";

		
	$html.="<div name='langlex' id='langlex'></div>";
	$html.=  "
				<input type=hidden name=act value=\"comments\">
				<input type=hidden name=su value=\"sv".$par['su']."\">	
				<input type=hidden name=id value=\"".@$par['id']."\">
				<input type=hidden name=oldsu value=\"".@$par['oldsu']."\">
				<input type=hidden name=pg value=\"".@$par['pg']."\">
	";
	return $html;
}


function comments_save(){
	global $par,$depot;
	//echo sqller($par['announce']);
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'view';

	if ($depot['errors']) {
		if ($par['su'] == 'svadd') $par['su'] = 'add'; else $par['su'] = 'edit';
		return comments_add();
	}
	
	//echo $depot['vars']['langs']1[$par['lang']][1];return;
	$sql=	"UPDATE ".COMMENTS."	SET ";

	$sql.="
			
			nick		=	\"".sqller($par['nick'])."\",
			comment		=	\"".sqller($par['comment'])."\" WHERE id = \"".sqller($par['id'])."\"";

    $res_ = conn_sql_query($sql) or die (conn_error());

	if (conn_affected_rows($res_)>0){
			$depot['oks'][]="1 ".$depot['tx']['ok_recordsadded'];
	} else {
		$depot['errors'][]="Problem editing Comment information";
		$depot['errors'][]=$depot['tx']['al_edited'];

	}
	$par['su'] = $toview;
	return comments_view();
}

function deleteChecked(){
	global $depot,$par;

	$deleted=0;
	if (!isset($par['commentsarray'])) {
		$depot['errors'][]='No records have been checked';
		return;
	}

	foreach ($par['commentsarray'] as $comment){

		$sql=	"DELETE FROM ".COMMENTS." WHERE id = \"".sqller($comment)."\"";
        $res_ = conn_sql_query($sql);
		if (conn_affected_rows($res_)>0) $deleted++;
		
	}

	if ($deleted) $depot['oks'][]=$deleted.iho(" ������ ��������");

}
/*	*	*	*	*	*	*	*	*	VIEW NEWS	*	*	*	*	*	*	*	*	*/


function comments_view(){
	global $depot,$par;
	$html='';

	if ($par['su']=='replacement') $html.=comments_replace();
	if (isset($par['removechecked'])) deleteChecked();

	foreach ($depot['vars']['langs'] as $k=>$v) {
		$l[]=$k;
		$l[]=$v['langtitle'];
	}
	//$html.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'onChange = "chng_lang()"')."</div>";

	$html.="<div style='padding:5px;background:#EEE;'>";
	
	$days	=	range(1,31);
	$day=array(0,"---");
	foreach ($days as $d) {$day[]=sprintf("%02d",$d);$day[]=sprintf("%02d",$d);}

	$mo_tx=explode(" ","mon_jan mon_feb mon_mar mon_apr mon_may mon_jun mon_jul mon_aug mon_sep mon_oct mon_nov mon_dec");
	$month=array(0,"---");
	for ($i=1;$i<=count($mo_tx);$i++){
		$month[]=sprintf("%02d",$i);
		$month[]=$depot['tx'][$mo_tx[($i-1)]];
	}
	$time=time();
	$curryear=date("Y",$time);
	$year=array(0,"---");
	for ($i=($curryear-1);$i<=($curryear);$i++){
		$year[]=$i;
		$year[]=$i;
	}
	
	$html.="<table><tr>";

	$html.="<td>".iho('����:<br>');
	$html.=bd_popup($day,	'sday',	'width:50px',	1,	'')."</td>";

	$html.="<td><br>";
	$html.=bd_popup($month,	'smonth', 'width:100px',	1,	'')."</td>";

	$html.="<td><br>";
	$html.=bd_popup($year,	'syear', 'width:60px',	1,	'')."</td>";
	
	$html.="<td width=30>&nbsp;</td><td width=90>".iho('�������&nbsp;�����:')."<br>";
	$html.=bd_tf(@$par['kwd'],	'kwd','text', 'width:150px',	1,	'')."</td>";

	$html.="<td width=30>&nbsp;</td><td width=60>".iho('ID&nbsp;������:')."<br>";

	$html.=bd_tf(@$par['sid'],	'sid','text', 'width:100px',	1,	'')."</td>";

	$html.="<td width=30>&nbsp;</td><td width=60>".iho('I�&nbsp;³��������:')."<br>";

	$html.=bd_tf(@$par['uip'],	'uip','text', 'width:100px',	1,	'')."</td>";

	$html.="<td width=30>&nbsp;</td><td width=60>".iho('E-mail �����������:')."<br>";

	$html.=bd_tf(@$par['cnick'],	'cnick','text', 'width:100px',	1,	'')."</td>";

	$html.="<td width=30>&nbsp;</td><td width=60><input type=hidden name=pg value=0><input type='submit' name='io' id='submt' value='".iho('Գ���������')."'></td>";

	$html.="</tr></table></div>";


	$html.="
				<div style='background:#FFCC66;padding:10px;'>
					<a href='' onclick='chngVis(\"hiddenHolder\",\"block\");return false;'>".iho("�����-��̲��")."</a>
					<div style='display:none'; id='hiddenHolder'>
					<hr>
						<table width=100%>
							<tr>
								<td width=10%>
									".iho('������ � ������� ���������:')."
								</td>
								<td width=30%>
									<textarea name='findwhat' style='width:95%;height:60px;'></textarea>
								</td>
								<td width=10%>
									".iho('������� ��:')."
								</td>
								<td width=30%>
									<textarea name='replaceto' style='width:95%;height:60px;'></textarea>
								</td>

								<td width=30%>
									<input type=hidden name=pg value=0><input type=button name=io id='submt' value='".iho('�������')."'  onClick='sbm(\"replacement\",\"\",\"\")'>
								</td>


							</tr>
						</table>
					</div>
				</div>
	";

	$path="/gazda/index.php?act=comments&su=view";
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
	
	

	if (@$par['kwd']) {
			$addsql.=" AND ".COMMENTS.".comment LIKE \"%".sqller($par['kwd'])."%\"";
			$path.="&kwd=".htmlspecialchars($par['kwd']);
	}

	if (@$par['sid']) {
		$addsql.=" AND ".COMMENTS.".newsid = ".sqller($par['sid']);
		$path.="&sid=".htmlspecialchars($par['sid']);
	}

	if (@$par['uip']) {
		$addsql.=" AND ".COMMENTS.".ipaddr = ".sprintf("%u",ip2long(sqller($par['uip'])));
		$path.="&uip=".htmlspecialchars($par['uip']);
	}

	if (@$par['cnick']) {
		$addsql.=" AND ".FUSERS.".uname   LIKE \"%".sqller($par['cnick'])."%\"";
		$path.="&cnick=".htmlspecialchars($par['cnick']);
	}



	
	$sql_qty="	SELECT 
				COUNT(*) 
				FROM ".COMMENTS." 
				LEFT JOIN ".FUSERS."
				ON ".COMMENTS.".authorid =  ".FUSERS.".id
				WHERE 1 ".$addsql;
	//echo $sql_qty;
	$count1=conn_sql_query($sql_qty) or die(conn_error());

	if (!isset($par['pg'])) $par['pg']=0;
	//$perpage=$enviro['comments_per_page'];
	$perpage=30;
	$count=conn_fetch_row($count1);
	$pages=($count[0]%$perpage) ? (int)($count[0]/$perpage+1) : $count[0]/$perpage;

	$ppg=10;
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
	
	$pager_html='';
	if ($pages>1) {
		$pager_html.="<div class=pager>";
		$pager_html.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$pager_html.= "<a href=\"$path&pg=$i\">".($i+1)."</a>";
			else $pager_html.= "<span>".($i+1)."</span>";
		}
		$pager_html.= $next_page.$nnext_page;

		$pager_html.="<div style='padding-left:50px;font-size:18px;float:left;'>/ ".$count[0]."</div>";
		$pager_html.="</div>";
	} else {
		$pager_html.="<div style='font-size:18px;float:left;'>/ ".$count[0]."</div>";
	}

	$html.=$pager_html;

	$sql1="
			SELECT	".COMMENTS.".*,
					DATE_FORMAT(".COMMENTS.".ddate,'%d.%m.%y <span style=\"color:#F00;\">%H:%i</span>') AS ndatef,
					".FUSERS.".uname
			FROM ".COMMENTS." 
			LEFT JOIN ".FUSERS."
			ON ".COMMENTS.".authorid =  ".FUSERS.".id
			
			WHERE 1 ".$addsql."
			ORDER BY	ddate DESC 
			LIMIT	".$par['pg']*$perpage.",".$perpage;
	//echo $sql1;


	$qry=conn_sql_query($sql1) or die(conn_error());
	if (!conn_sql_num_rows($qry)) {
		$html.="<h2><br><br><br>".$depot['tx']['he_norecords']."</h2>";
	} else {
	
			$html.="<table width=100% cellpadding=15 cellspacing=1  style='clear:both;'>
							<tr>
								<td width=15% class=heaad>
									<a href='' onclick='selectAll(\"commentsarray[]\");return false;' style='float:right;padding:10px 20px;background:#FFCC00;'>".iho("������� ���")."</a>
								</td>
								<td class=heaad width=80%>
									<input type='submit' name='removechecked' value='".iho("�������� ������")."' id='submt' style='float:right;margin-top:-150px;position:relative;'>
								</td>
								<td width=5%  class=heaad>&raquo;
								</td>
							</tr>";

			for ($i=0;$i<conn_sql_num_rows($qry);$i++){
				$res=conn_fetch_assoc($qry);
				
				if ($i%2) $bg=" bgcolor=#EEEEEE"; else $bg="";
				
				$html.="
						<tr>
							<td  class=bord  bgcolor='#F4ECD7'><input type='checkbox' name='commentsarray[]' value='".$res['id']."' >&nbsp;<b class=big>"
							.$res['ndatef']."</b><br><span class=remr>
							
							<a href='/gazda/?act=comments&cnick=".htmlspecialchars($res['uname'])."'>"
							.htmlspecialchars($res['uname'])."</a> USERID: ".$res['authorid']." </span>
							<br><span class=rem><a href='/gazda/?act=comments&uip=".long2ip($res['ipaddr'])."'>"
							.long2ip($res['ipaddr'])."</a><br>"
							.$res['uniqueno']."</span>"
							
							
							."</td>
							<td  class=bord  $bg style='padding:10px;'>";
				$html.=iho("������: ")."<b><a href='/gazda/?act=addnews&su=viewpub&sid=".$res['newsid']."' style='color:#C00;'>".$res['newsid']."</a></b><br><a href='/gazda/?act=comments&su=edit&id=".$res['id']."&pg=".$par['pg']."' class=clr>".$res['comment']."</a>";
					
				
				$html.="</td><td  class=bord>";
				$html.="<a href=\"JavaScript:rr('".$res['id']."')\" id=butt class=del title=\"".$depot['tx']["ti_delete"]."\" style='float:right;'></a>";
				$html.="</td></tr>";
			}
	}
	$html.="	<tr><td width=15% class=heaad>&nbsp;</td><td class=heaad>	<input type='submit' name='removechecked' value='".iho("�������� ������")."' id='submt' style='float:right;margin-top:-150px;position:relative;'></td><td  class=heaad>&raquo;</td></tr>
				<input type=hidden name=oldsu value=\"".@$par['su']."\">
				<input type = hidden name='act' value='".$par['act']."'>
				<input type = hidden name='su' value=''>
				<input type = hidden name='id' value=''>
				<input type = hidden name='pg' value='".$par['pg']."'>
	</table>";


	return $html.$pager_html;
}


function comments_del(){
	global $par,$depot;
	$html='';
	$news_id=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".COMMENTS." WHERE  id=\"".$par['id']."\""));

	if (isset($par['id'])) {
		$sql="DELETE FROM ".COMMENTS." WHERE id=\"".$par['id']."\"";	
	}
    $res_ = conn_sql_query($sql) or die(conn_error());
	if (conn_affected_rows($res_)) {
			array_unshift($depot['oks'],$depot['tx']['ok_del1']);
			
			conn_sql_query("UPDATE ".STATCOMM." SET qty=qty-1 WHERE id = \"".$news_id['newsid']."\"");
	} else {
		array_unshift($depot['errors'],$depot['tx']['al_norecs']."<br><br>");
	}
	$par['hder']=$depot['tx']['he_announces'];
	$html.=comments_view();
	return $html;
}



function lang_js(){
$r=<<<JSCR

 <script language="javaScript">

		  <!--

		function setvalue(name,value){
				var obj = document.getElementById ? document.getElementById(name) : null;
				obj.innerHTML = value;
		}
		  
	
			
		function clearimage(formobj){
		
			eval("document.ad."+formobj+".value = ''");
			eval("document.ad."+formobj+"_imo.src ='/gallery/tmb/no_image.gif'");
		}


		//-->
		 </script>
JSCR
;

return $r;
}


?>
