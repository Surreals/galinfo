<?

global $a,$p,$previndex;
function aget_center(){
		global $par,$depot,  $tx,$lngs,$lngs1,$depot;

		$html=cats_js();
		$typesid = array('1','2','3');
		$types=explode(",","region,rubric,theme,region");

		if (!isset($par['type']) || !in_array($par['type'],$typesid)) $par['type']='1';
		
		$lang_pars=array_keys($depot['vars']['langs']);
		if (!isset($par['lng']) || !isset($depot['vars']['langs'][0])) $par['lng']=$lang_pars[0];

		/*if (!languageAccess()) {
			return;
		}*/


		$html.= "<h1>".$depot['tx']['he_'.$types[$par['type']]]."</h1><hr><form name='ad' method=post>";
		
		if (!isset($par['su']) || ($par['su']=='')) $par['su']='view';
		switch ($par['su']){
			case "view": 
			case "moveup":
			case "movedown":
			case "savelex":$html.= cats_view();break;
			case "add": $html.= cats_add();break;
			case "edit": $html.= cats_edit();break;
			case "remove": $html.= cats_del();break;
			case "chng" : $html.=cats_change();break;
		}

		$html.="<input type=hidden name='type' value='".$par['type']."'>";
		$html.="<input type=hidden name='act' value='".$par['act']."'>";
		$html.= "</form>";
		return $html;

}




function cats_view(){
	global $par,$depot;
	$ttop='';
	
	if ($par['su'] == "moveup" || $par['su'] == "movedown"){
		move_record();
	}

	
	foreach ($depot['vars']['langs'] as $k=>$v) {
		$l[]=$v['id'];
		$l[]=$v['langtitle'];
	}
	$ttop.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'onChange = "chng_lang()"')."</div>";

	$ttop.="<a href='' onClick='sbm(\"add\",\"\",\"\"); return false;'><img src='/gazda/img/bt_add.gif' style='margin-right:15px;margin-bottom:-5px;'>".iho('������')."</a>";
	$ttop.="<table width=100% cellpadding=5 cellspacing=1><tr><td class=heaad width=80%>".$depot["tx"]["he_titlename"]."</td><td width=20% class=heaad>".$depot["tx"]["he_operations"]."</td></tr>";

	$rulerwidth=90;

	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql=conn_sql_query(
						"SELECT * FROM 
						".CATS." WHERE 
						cattype = \"".sqller($par['type'])."\"
						AND lng=\"".$depot['vars']['langid']."\" 
						ORDER BY orderid
					");

	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	

	if (!conn_sql_num_rows($sql)){
		$ttop.= "<tr><td colspan=5 class=bord style=\"text-align:center !important;\"> * * * * * * * * * * * * * * * </td></tr>";
	} else {

		foreach ($b as $cat){ 

			$currcolor=$colors[1];
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66"; 
		
			$ttop.="<tr class='datarow'><td class=bord style=\"padding-left:10px;\">".stripslashes($cat['title'])." <span style='color:#999'>ID: {$cat['id']}</span> </td><td class=bord>";


				$ttop.="<a href=\"JavaScript:sbm('moveup','".$cat['id']."','')\"  title=\"".$depot["tx"]["ti_moveup"]."\" id=butt class=up></a>";

				$ttop.="<a href=\"JavaScript:sbm('movedown','".$cat['id']."','')\"  title=\"".$depot["tx"]["ti_movedown"]."\" id=butt class=down></a>";

				$ttop.="<a href=\"JavaScript:sbm('edit','".$cat['id']."','')\" id=butt class=edit title=\"".$depot["tx"]["ti_edit"]."\"></a>";


				if ($cat["isvis"]) {
					$ttop.="<a href=\"JavaScript:sbm('chng','".$cat['id']."','')\" id=butt class=act title=\"".$depot["tx"]["ti_changestatus"]."\" style='margin-left:20px;'></a>";
				} else {
					$ttop.="<a href=\"JavaScript:sbm('chng','".$cat['id']."','')\" id=butt class=deact title=\"".$depot["tx"]["ti_changestatus"]."\" style='margin-left:20px;'></a>";
				}
				
				

				$ttop.="<a href=\"JavaScript:rr('".$cat['id']."')\" id=butt class=del title=\"".$depot["tx"]["ti_delete"]."\" style='float:right;'></a>";

			$ttop.="</td></tr>";

			
		}

	}
	$ttop.="</table>";
	$ttop.="<div name='langlex' id='langlex'></div>";
	$ttop.=  "<input type=hidden name=su value=\"view\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"\">";
	return $ttop;
}


function cats_add(){
	global $par,$depot;
	$ttop='';

	//$h2=str_replace("{|thevar|}",iho(" ����."),$depot["tx"]["he_addlang"]);
	$ly=1;

	if (!isset($par['sudir'])){
		$ttop.= "<table width=100%><tr><td rowspan=2 valign=top><h2>".$depot['vars']['langids'][$par['lang']]."</h2><br>".$depot["tx"]["in_adding"]."<br></td><td width=50 rowspan=2>&nbsp;</td><td>";
		$ttop.= "<TEXTAREA style='width:640px;height:200px;' name=list></textarea></td></tr><tr><td class=haader>
		<br><input type=button value=\"".$depot["tx"]["bt_proceed"]."\"  id=submt onClick=\"sbm('','','proceed')\"></td></tr></table>";
	} else if ($par['sudir']=="proceed"){
		$allo=explode("\n",$par['list']);


		$ttop.="<h2>".@$lngs[$par['lang']][0]."</h2>";
		$ttop.= "<table width=\"100%\" cellspacing=1><tr><td width=\"40%\" class=heaad>".$depot["tx"]['he_titlename']."</td>";
		$ttop.= "<td class=heaad width=\"40%\">".$depot["tx"]['he_param']."</td>";
		$ttop.= "<td class=heaad>".$depot["tx"]['he_visible']."</td></tr>";
		$i=0;

		foreach ($allo as $k=>$v){
			if (!trim($v)) continue;
			$ttop.= "<tr><td class=tdrow><INPUT type=text name=title".$i." style=\"width:280px;\" value=\"".htmlspecialchars($v)."\"></td>";
			
			$ttop.= "<td class=tdrow><INPUT type=text name=idword".$i." style=\"width:280px;\" value=\"".str_replace(array(" ","'","\"","/","\\"),array('-',"","","",""),trim(translit($v)))."\"></td>";

			$ttop.= "<td class=tdrow>
			
					<input type='checkbox' value='1' name=hot".$i." checked>
					</td></tr>";
			$i++;
		}
		$ttop.= "</table>
		<div class=sbm><input type=button value=\"".$depot["tx"]["bt_save"]."\" id=submt class='save' onClick=\"sbm('','','gosave')\"><input type=hidden name=qty value=\"$i\"></div>";
	} else if  ($par['sudir']=="gosave"){

		$dd=0;
		for ($i=0;$i<$par['qty'];$i++){
			if (!isset($par["hc$i"])) $par["hc$i"]=0;
			if (!isset($par["hot$i"])) $par["hot$i"]=0;
			$dd++;
	
			$ison=conn_fetch_row(
				conn_sql_query("
						SELECT * FROM ".CATS." WHERE 
							param=\"".conn_real_escape_string(trim($par["idword$i"]))."\" AND
							lng=\"".$par['lang']."\" AND
							cattype=\"".$par['type']."\"
			"));
			if ($ison[0]){
				$depot['errors'][]=iho("��������� ��� ".conn_real_escape_string(trim($par["title$i"]))." ��� ����. ������ �������.");
			}
			else {
				$order=conn_fetch_row(conn_sql_query("SELECT MAX(orderid) FROM ".CATS));
	
				$q21=conn_sql_query("INSERT INTO ".CATS." SET 
				orderid=\"".($order[0]+1)."\",
				title=\"".	sqller($par["title$i"])		."\",
				param=\"".	sqller($par["idword$i"])	."\",
				cattype=\"".sqller($par["type"])		."\",
				lng=\"".	sqller($par["lang"])		."\",
				isvis=\"".trim($par["hot$i"])."\"") or die(conn_error());

			}
		}
		if (conn_affected_rows($q21)) {
			$depot['oks'][]=$dd." ".$depot["tx"]["ok_recordsadded"]; 
		}
		else {
			$depot['errors'][]=$depot["tx"]["al_recordsadded"];
					
		}
		freecache(4);
		return cats_view();
	}

	$ttop.= "
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=lang value=\"".$par['lang']."\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=id value=\"".@$par['id']."\">";
	return $ttop;

}



function cats_edit(){
	global $par,$depot;
	$ttop='';

	if (!isset($par['sudir'])){
		
		
		$q11=conn_sql_query("SELECT * FROM ".CATS." WHERE id=\"".$par['id']."\"");
		$q1=conn_fetch_array($q11, PDO::FETCH_ASSOC);
		if (!conn_sql_num_rows($q11)){
			$depot['errors'][]=$depot["tx"]['al_chooseedit'];
			return cats_view();
		}

		$ttop.="<h2>".@$lngs[$q1['lang']][0]."</h2>";
		$ttop.= "<table width=\"100%\"><tr><td class=heaad>".$depot["tx"]['he_titlename']."</td>";
		$ttop.= "<td class=heaad>".$depot["tx"]['he_param']."</td>";
        if($par['type'] == 3) {
            $ttop .= "<td class=heaad> Опис </td>";
        }
		$ttop.= "<td class=heaad>".$depot["tx"]['he_visible']."</td></tr>";

	
		$ttop.= "<tr><td class=tdrow><INPUT type=text name=langtitle style=\"width:280px;\" value=\"".htmlspecialchars($q1['title'])."\"></td>";

		$ttop.= "<td class=tdrow><INPUT type=text name=idword style=\"width:280px;\" value=\"".htmlspecialchars($q1['param'])."\"></td>";

		if($par['type'] == 3) {
            $ttop .= "<td class=tdrow><textarea  name=description style=\"width:280px;\">" . htmlspecialchars($q1['description']) . "</textarea></td>";
        }



		$ttop.= "<td class=tdrow>";
		$ttop.= "<input type='checkbox' value='1' name=isactive ";
		if ($q1['isvis']) $ttop.='checked';
		$ttop.="></td>";
		$ttop.="</tr></table>";
	
	} else if ($par['sudir']=='gosavechange'){
		if (!isset($par["isactive"])) $par["isactive"]=0;

		$description = isset($par["description"])?$par["description"]:'';

		$res_ = conn_sql_query("UPDATE ".CATS." SET 
		title=\"".sqller($par["langtitle"])."\",
		param=\"".sqller($par["idword"])."\",
		description=\"".sqller($description)."\",
		isvis=\"".trim($par["isactive"])."\" WHERE id=\"".$par['id']."\"
		") or $depot['errors'][]=conn_error();

		if (conn_affected_rows($res_)) {
			$depot['oks'][]=$depot["tx"]['ok_edited'];
		}
		else {
			$depot['errors'][]=$depot["tx"]['al_edited'];
		}
		freecache(4);
		return cats_view();
	}


	$ttop.= "
	<input type=hidden name=su value=\"edit\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=id value=\"".$par['id']."\">
	<div class=sbm><input type=button value=\"".$depot["tx"]['bt_save']."\" class='save' id=submt onClick=\"sbm('','','gosavechange')\"></div>
		";
	return $ttop;
}




function cats_del(){
	global $par,$depot;
	$ttop='';

    $res_ = conn_sql_query("DELETE FROM ".CATS." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($depot['oks'],$depot["tx"]['ok_del1']);
	} else {
		array_unshift($depot['errors'],$depot["tx"]['al_norecs']."<br><br>");
	}
	freecache(4);
	$ttop.=cats_view();
	return $ttop;
}




function move_record(){
	global $par, $depot;

	$sql=conn_sql_query("SELECT title,id,orderid FROM ".CATS." WHERE cattype=\"".$par['type']."\" ORDER BY orderid");
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
			$depot['errors'][]=$depot["tx"]['al_topbranch'];
			return;
		}
		$old=$same_home[($j-1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["title"],$depot["tx"]["ok_movedup"]);
			
	
	} else if ($par['su']=="movedown"){
	
		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$depot["tx"]['al_lowbranch'];
			return;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["title"],$depot["tx"]["ok_moveddown"]);

	} else {
		return;
	}
	conn_sql_query("UPDATE ".CATS." SET orderid=\"".$old["orderid"]."\" WHERE id=\"".$new["id"]."\"");
	conn_sql_query("UPDATE ".CATS." SET orderid=\"".$new["orderid"]."\" WHERE id=\"".$old["id"]."\"");
	return;
}


function cats_change(){
	global $par,$depot;
	$ttop='';

    $res_ = conn_sql_query("UPDATE ".CATS." SET isvis=MOD((isvis+1),2) WHERE id=\"".$par['id']."\"") or die(conn_error());
	if (conn_affected_rows($res_)) {
		$depot['oks'][]=$depot["tx"]["ok_activated"];
	} else {
		$depot['errors'][]=$depot["tx"]["al_chng"];
	}
	$ttop.=cats_view();
	return $ttop;
}



function cats_js(){
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
