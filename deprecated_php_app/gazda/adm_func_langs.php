<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){

		global $par, $depot;
		$ttop=lang_js();
		$ttop.= "<h1>".$depot["tx"]['he_langs']."</h1><hr>".hhead()."<form name='ad' method=post>";
		
		if (!isset($par['su'])) $par['su']='view';
		switch ($par['su']){
			case "view": 
			case "moveup":
			case "movedown":
			case "savelex":	$ttop.= lang_view();	break;
			case "add":		$ttop.= lang_add();		break;
			case "edit":	$ttop.= lang_edit();	break;
			case "remove":	$ttop.= lang_del();		break;
			case "clean" :	$ttop.=	lang_clean();	break;
			case "chng" :	$ttop.=	lang_change();	break;
			case "syncro" : $ttop.=	lang_syncro();	break;
		}

		
		$ttop.= "</form>";
		return $ttop;

}



function hhead(){
	global $par,$idslist, $depot;
	$ttop='';
	return $ttop;
}



function lang_view(){
	global $par,$depot, $oks;
	$ttop='';
	
	if ($par['su'] == "moveup" || $par['su'] == "movedown"){
		move_record();
	}

	if ($par['su'] == 'savelex'){
		$fh=fopen($_SERVER['DOCUMENT_ROOT']."/tls/lex.front_".$par['thelang'],"w");
		
		if (strtoupper($par['encoding']) !== "UTF-8"){
			$lxtxt=stripslashes(mb_convert_encoding($par['lextext'], $par['encoding'],"UTF-8"));
		} else {
			$lxtxt=stripslashes($par['lextext']);
		}


		fputs($fh, $lxtxt);
		fclose ($fh);
		$depot['oks'][]=iho("���� ���������. ���� �� �������� ��������� !����������! ����� ��������� '��������� ��������'.");
	}

	$ttop.="<table width=100% cellpadding=5 cellspacing=1><tr><td class=heaad width=20%>".$depot["tx"]["he_lang"]."</td><td class=heaad width=20%>".$depot["tx"]["he_sitechar"]."</td><td class=heaad width=20%>".iho("�������� ��������")."</td><td class=heaad width=20%>".iho("��������� �����")."</td><td width=20% class=heaad>".$depot["tx"]["he_operations"]."</td></tr>";

	$rulerwidth=90;

	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	

	if (!conn_sql_num_rows($sql)){
		$ttop.= "<tr><td colspan=5 class=bord style=\"text-align:center !important;\"> * * * * * * * * * * * * * * * </td></tr>";
	} else {

		foreach ($b as $cat){ 

			$currcolor=$colors[1];
			if (isset($par['id']) && ($par['id'] == $cat['lang'])) $currcolor="#FFFF66"; 
		
			$ttop.="
					<tr>
						<td class=bord style=\"padding-left:10px;background-color:".$currcolor."; background-image: url(img/ruler.gif);background-position: -80px -3px; background-repeat:no-repeat;\">&#8226;&nbsp;".stripslashes($cat['langtitle'])." [".$cat['id']."]</td>
						<td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['site_charset'])."</td>
						<td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['lex_charset'])."</td>
						<td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['mail_charset'])."</td>
						<td class=bord>
						
							<a href=\"JavaScript:sbm('moveup','".$cat['lang']."','')\"  title=\"".$depot["tx"]["ti_moveup"]."\" id=butt class=up></a>

							<a href=\"JavaScript:sbm('movedown','".$cat['lang']."','')\"  title=\"".$depot["tx"]["ti_movedown"]."\" id=butt class=down></a>

							<a href=\"JavaScript:sbm('edit','".$cat['lang']."','')\" id=butt class=edit title=\"".$depot["tx"]["ti_edit"]."\"></a>

							<a href=\"JavaScript:editlex('langlex','lang','".$cat['lang']."')\"  id=butt class=swap title=\"".iho("���������� �������")."\"></a>";

				if ($cat["isactive"]) {
					$ttop.="<a href=\"JavaScript:sbm('chng','".$cat['lang']."','')\" id=butt class=act title=\"".$depot["tx"]["ti_changestatus"]."\" style='margin-left:20px;'></a>";
				} else {
					$ttop.="<a href=\"JavaScript:sbm('chng','".$cat['lang']."','')\" id=butt class=deact title=\"".$depot["tx"]["ti_changestatus"]."\" style='margin-left:20px;'></a>";
				}
				
				

				$ttop.="<a href=\"JavaScript:rr('".$cat['lang']."')\" id=butt class=del title=\"".$depot["tx"]["ti_delete"]."\" style='margin-left:20px;'></a>";

			$ttop.="</td></tr>";

			
		}

	}
	$ttop.="</table>";
	$ttop.="<div name='langlex' id='langlex'></div>";
	$ttop.=  "<input type=hidden name=act value=\"langs\"><input type=hidden name=su value=\"\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"\">";
	return $ttop;
}


function lang_add(){
	global $par, $errors, $oks, $depot;
	$ttop='';

	$h2=str_replace("{|thevar|}",iho(" ����."),$depot["tx"]["he_addlang"]);
	$ly=1;

	if (!isset($par['sudir'])){
		$ttop.= "<table width=100%><tr><td rowspan=2 valign=top>$h2<br>".$depot["tx"]["in_adding"]."<br></td><td width=50 rowspan=2>&nbsp;</td><td>";
		$ttop.= "<TEXTAREA style='width:640px;height:200px;' name=list></textarea></td></tr><tr><td class=haader>
		<br><input type=button value=\"".$depot["tx"]["bt_proceed"]."\"  id=submt onClick=\"sbm('','','proceed')\"></td></tr></table>";
	} else if ($par['sudir']=="proceed"){
		$allo=explode("\n",$par['list']);


		$ttop.="$h2";
		$ttop.= "<table width=\"100%\"><tr><td width=\"20%\" class=heaad>".$depot["tx"]['he_titlename']."</td>";
		$ttop.= "<td class=heaad width=\"20%\">".$depot["tx"]['he_param']."</td>";
		$ttop.= "<td class=heaad width=\"51%\">".$depot["tx"]['he_sitechar']."</td>";
		$ttop.= "<td class=heaad width=\"15%\">".$depot["tx"]['he_lexchar']."</td>";
		$ttop.= "<td class=heaad width=\"15%\">".iho("��������� �����")."</td>";
		$ttop.= "<td class=heaad  width=\"10%\">".$depot["tx"]['he_active']."</td></tr>";
		$i=0;

		foreach ($allo as $k=>$v){
			if (!trim($v)) continue;
			$ttop.= "<tr><td class=tdrow><INPUT type=text name=title".$i." style=\"width:180px;\" value=\"".htmlspecialchars($v)."\"></td>";
			
			$ttop.= "<td class=tdrow><INPUT type=text name=idword".$i." style=\"width:180px;\" value=\"".str_replace(array(" ","'","\"","/","\\"),array('-',"","","",""),trim(translit($v)))."\"></td>";

			$ttop.= "<td class=tdrow><INPUT type=text name=site_charset".$i." style=\"width:150px;\" value=\"UTF-8\"></td>";

			$ttop.= "<td  class=tdrow><INPUT type=text name=lex_charset".$i." style=\"width:150px;\" value=\"windows-1251\"></td>";

			$ttop.= "<td  class=tdrow><INPUT type=text name=mail_charset".$i." style=\"width:150px;\" value=\"windows-1251\"></td>";

			$ttop.= "<td class=tdrow>
			
					<input type='checkbox' value='1' name=hot".$i." checked>
					</td></tr>";
			$i++;
		}
		$ttop.= "</table><div class=sbm><input type=button value=\"".$depot["tx"]["bt_save"]."\" id=submt class='save' onClick=\"sbm('','','gosave')\"><input type=hidden name=qty value=\"$i\"></div>";
	} else if  ($par['sudir']=="gosave"){

		$dd=0;
		$q21 = '';
		for ($i=0;$i<$par['qty'];$i++){
			if (!isset($par["hc$i"])) $par["hc$i"]=0;
			if (!isset($par["hot$i"])) $par["hot$i"]=0;
			$dd++;
	
			$ison=conn_fetch_row(conn_sql_query("SELECT * FROM ".LANG." WHERE lang=\"".conn_real_escape_string(trim($par["idword$i"]))."\""));
			if ($ison[0]){
				$depot['errors'][]="Parameter idword for ".conn_real_escape_string(trim($par["title$i"]))." duplicates one in DB. It should be unique";
			}
			else {
				$q21=conn_sql_query("INSERT INTO ".LANG." SET 
				langtitle=\"".conn_real_escape_string(trim($par["title$i"]))."\",
				lang=\"".conn_real_escape_string(trim($par["idword$i"]))."\",
				site_charset=\"".conn_real_escape_string(trim($par["site_charset$i"]))."\",
				lex_charset=\"".conn_real_escape_string(trim($par["lex_charset$i"]))."\",
				mail_charset=\"".conn_real_escape_string(trim($par["mail_charset$i"]))."\",
				isactive=\"".trim($par["hot$i"])."\"") or die(conn_error());

			}
		}
		if (conn_affected_rows($q21)) {
			$depot['oks'][]=$dd." ".$depot["tx"]["ok_recordsadded"]; 
			lang_syncro();
		}
		else {
			$depot['errors'][]=$depot["tx"]["al_recordsadded"];
					
		}
		return lang_view();
	}

	$ttop.= "<input type=hidden name=act value=\"langs\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=id value=\"".@$par['id']."\">";
	return $ttop;

}



function lang_edit(){
	global $par,$errors,$oks, $depot;
	$ttop='';

	if (!isset($par['sudir'])){	
		
		
		$q11=conn_sql_query("SELECT * FROM ".LANG." WHERE lang=\"".$par['id']."\"");
		$q1=conn_fetch_array($q11, PDO::FETCH_ASSOC);
		if (!conn_sql_num_rows($q11)){
			$depot['errors'][]=$depot["tx"]['al_chooseedit'];
			return lang_view();
		}

		$ttop.="<h2>".$depot["tx"]['he_editelement']." ".$q1['langtitle']."</h2>";
		$ttop.= "<table width=\"100%\"><tr><td class=heaad>".$depot["tx"]['he_titlename']."</td>";
		$ttop.= "<td class=heaad>".$depot["tx"]['he_param']."</td>";
		$ttop.= "<td class=heaad>".$depot["tx"]['he_sitechar']."</td>";
		$ttop.= "<td class=heaad>".$depot["tx"]['he_lexchar']."</td>";
		$ttop.= "<td class=heaad>".iho("��������� �����")."</td>";
		$ttop.= "<td class=heaad>".$depot["tx"]['he_active']."</td></tr>";

	
		$ttop.= "<tr><td class=tdrow><INPUT type=text name=langtitle style=\"width:160px;\" value=\"".htmlspecialchars($q1['langtitle'])."\"></td>";
	
		$ttop.= "<td class=tdrow><INPUT type=text name=idword style=\"width:160px;\" value=\"".trim($q1['lang'])."\"></td>";

		$ttop.= "<td class=tdrow><INPUT type=text name=site_charset style=\"width:150px;\" value=\"".htmlspecialchars($q1['site_charset'])."\"></td>";

		$ttop.= "<td  class=tdrow><INPUT type=text name=lex_charset style=\"width:150px;\" value=\"".htmlspecialchars($q1['lex_charset'])."\"></td>";

		$ttop.= "<td  class=tdrow><INPUT type=text name=mail_charset style=\"width:150px;\" value=\"".htmlspecialchars($q1['mail_charset'])."\"></td>";

		$ttop.= "<td class=tdrow>";
		$ttop.= "<input type='checkbox' value='1' name=isactive ";
		if ($q1['isactive']) $ttop.='checked';
		$ttop.="></td>";
		$ttop.="</tr></table>";
	
	} else if ($par['sudir']=='gosavechange'){
		if (!isset($par["isactive"])) $par["isactive"]=0;

        $res_ = conn_sql_query("UPDATE ".LANG." SET langtitle=\"".conn_real_escape_string(trim($par["langtitle"]))."\",
		lang=\"".conn_real_escape_string(trim($par["idword"]))."\",
		site_charset=\"".conn_real_escape_string(trim($par["site_charset"]))."\",
		lex_charset=\"".conn_real_escape_string(trim($par["lex_charset"]))."\",
		mail_charset=\"".conn_real_escape_string(trim($par["mail_charset"]))."\",
		isactive=\"".trim($par["isactive"])."\" WHERE lang=\"".$par['id']."\"
		") or die(conn_error());
	
		if (conn_affected_rows($res_)) {
			$depot['oks'][]=$depot["tx"]['ok_edited'];
		}
		else {
			$depot['errors'][]=$depot["tx"]['al_edited'];
		}
		return lang_view();
	}


	$ttop.= "
	<input type=hidden name=act value=\"langs\">
	<input type=hidden name=su value=\"edit\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=id value=\"".$par['id']."\">
	<div class=sbm><input type=button value=\"".$depot["tx"]['bt_save']."\" class='save' id=submt onClick=\"sbm('','','gosavechange')\"></div>
		";
	return $ttop;
}




function lang_del(){
	global $par,$errors,$oks,$b, $depot;
	$ttop='';

    $res_ = conn_sql_query("DELETE FROM ".LANG." WHERE lang=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($oks,$depot["tx"]['ok_del1']);
	} else {
		array_unshift($errors,$depot["tx"]['al_norecs']."<br><br>");
	}

	lang_drop($par['id']);

	$ttop.=lang_view();
	return $ttop;
}




function move_record(){
	global $par,$errors,$oks, $depot;

	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	$same_home=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$same_home[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	$j=0;
	foreach($same_home as $radio){
		if ($radio["lang"] == $par["id"]){
			break;
		}
		$j++;
	}

	if ($par['su']=="moveup"){
		if (!isset($same_home[($j-1)])){
			$depot['errors'][]=$depot["tx"]['al_topbranch'];
			return;
		}
		$old=$same_home[($j-1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["langtitle"],$depot["tx"]["ok_movedup"]);
			
	
	} else if ($par['su']=="movedown"){
	
		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$depot["tx"]['al_lowbranch'];
			return;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["langtitle"],$depot["tx"]["ok_moveddown"]);

	} else {
		return;
	}
	
	conn_sql_query("UPDATE ".LANG." SET id=0 WHERE lang=\"".$old["lang"]."\"");
	conn_sql_query("UPDATE ".LANG." SET id=\"".$old["id"]."\" WHERE lang=\"".$new["lang"]."\"");
	conn_sql_query("UPDATE ".LANG." SET id=\"".$new["id"]."\" WHERE lang=\"".$old["lang"]."\"");
	return;
}


function lang_change(){
	global $par,$errors,$oks,$b, $depot;
	$ttop='';

    $res_ = conn_sql_query("UPDATE ".LANG." SET isactive=MOD((isactive+1),2) WHERE lang=\"".$par['id']."\"") or die(conn_error());
	if (conn_affected_rows($res_)) {
		$depot['oks'][]=$depot["tx"]["ok_activated"];
	} else {
		$depot['errors'][]=$depot["tx"]["al_chng"];
	}
	$ttop.=lang_view();
	return $ttop;
}


function lang_syncro(){
	global $par,$errors,$oks,$b, $depot;
	
	$langsql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	for ($i=0;$i<conn_sql_num_rows($langsql);$i++){
		$rs=conn_fetch_assoc($langsql);
		$allangs[]=$rs['lang'];

	}


	$isok=0;
	$ttop='';
	$tablessql=conn_sql_query("SHOW TABLES");
	for ($iu=0;$iu<conn_sql_num_rows($tablessql);$iu++){
		$rres=conn_fetch_row($tablessql);
		$table=$rres[0];

		$needalter=array();
		$alter_SQL = "ALTER TABLE $table";
		$sql=conn_sql_query("SHOW COLUMNS FROM ".$table." LIKE \"%\_deflang\"");
		$needed=array();
		$allneed=array();
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$rs=conn_fetch_assoc($sql);
			preg_match("/^(\w+)_deflang$/",$rs['Field'],$matches);
			$allneed[$matches[1]] = $rs;
		}

		foreach ($allangs as $k) {
			$sql=conn_sql_query("SHOW COLUMNS FROM ".$table." LIKE \"%\_$k\"");
			$currneed=array();
			for ($i=0;$i<conn_sql_num_rows($sql);$i++){
				$rs=conn_fetch_assoc($sql);
				preg_match("/^(\w+)_$k$/",$rs['Field'],$matches);
				$currneed[$matches[1]] = $rs;
			}

			foreach ($allneed as $kk=>$vv) {
				$sql1='';
				if (!isset($currneed[$kk])) {
					/*Prepare SQL*/
					$sql1.=" ADD ".$kk."_".$k." ".strtoupper($vv['Type']);
					if ($vv['Null']) $sql1.=" NULL"; else $sql1.=" NOT NULL";
					if ($vv['Default']) $sql1.=" DEFAULT".$vv['Default'];
					$needalter[]=$sql1;
				}
			}
		}

		if	($needalter) {
			$alter_SQL.=implode(", ",$needalter);		
			conn_sql_query($alter_SQL) or die(conn_error());
			if (conn_error()) $depot['errors'][] = conn_error(); else $depot['oks'][] = iho ("��������� ������� <em>$table</em> ���� ������");
		} else $isok++;
	}
	if ($isok) 	$depot['oks'][] = iho("������� �� ���������� ������������");

	return lang_view();
}


function lang_drop($llang){
	global $par,$errors,$oks,$b, $depot;
	$ttop='';
	$tablessql=conn_sql_query("SHOW TABLES");
	for ($io=0;$io<conn_sql_num_rows($tablessql);$io++){
		$rres=conn_fetch_row($tablessql);
		$table=$rres[0];

		$sql=conn_sql_query("SHOW COLUMNS FROM ".$table." LIKE \"%\_deflang\"");
		$needed=array();
		$needalter=array();
		$allneed=array();
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$rs=conn_fetch_assoc($sql);
			preg_match("/^(\w+)_deflang$/",$rs['Field'],$matches);
			$needalter[]="DROP COLUMN ".$matches[1]."_".$llang;
		}
		
		if	($needalter) {
			$alter_SQL="ALTER TABLE $table ".implode(", ",$needalter);		
			conn_sql_query($alter_SQL) or die(conn_error());
			if (conn_error()) $depot['errors'][] = conn_error(); else $depot['oks'][] = "Structure for table <em>$table</em> was changed";
		}
		
	}

	return lang_view();
	
}

function lang_js(){
$r=<<<JSCR

 <script language="javaScript">

		  <!--
			
			function editlex(pattidvar,ttype,lng){
				var obj = document.getElementById ? document.getElementById(pattidvar) : null;
				var objScript = document.getElementById ? document.getElementById("updscript") : null;
				hide_mess();
				obj.innerHTML ="<div style='text-align:center;'><img src=\"img/clock.gif\"></div>";
				objScript.src = "/gazda/adm_get_list.php?pattidvar="+pattidvar+"&upd="+ttype+"&lng="+lng;

				
			}


		function setvalue(name,value){
				var obj = document.getElementById ? document.getElementById(name) : null;
				obj.innerHTML = value;
		}
		  

		function savelex(pattidvar,suvalue){
			
			var obj = document.getElementById ? document.getElementById(pattidvar) : null;

			document.forms['ad'].su.value=suvalue;
			document.forms['ad'].submit();
			obj.innerHTML ="<img src=\"img/clock.gif\">";

			
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
