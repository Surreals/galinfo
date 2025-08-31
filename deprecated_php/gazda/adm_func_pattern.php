<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){

		global $par,$depot;
		///$ttop=patt_js();
		$ttop='';
		$ttop.= "<h1>".$depot['tx']['he_patterns']."</h1><hr><form name='ad' method=post>";
		
		if (!isset($par['su']) || ($par['su']=='')) $par['su']='v';
		switch ($par['su']){
			case "v": 
			case "moveup":
			case "movedown":
			case "savelex":$ttop.= patt_view();break;
			case "add": 
			case "save":	
			case "saveedit":
			case "edit": $ttop.= patt_add();break;
			case "remove": $ttop.= patt_del();break;
			case "chng" : $ttop.=patt_change();break;
		}

		$ttop.="<input type=hidden name='act' value='".$par['act']."'>";
		$ttop.= "</form>";
		return $ttop;

}




function patt_view(){
	global $par,$b, $depot;
	$ttop='';

	$ttop.="<a href='' onClick='sbm(\"add\",\"\",\"\"); return false;'><img src='/gazda/img/bt_add.gif' style='margin-right:15px;margin-bottom:-5px;'>".$depot['tx']['he_add']." ".$depot['tx']['he_pattern']."</a>";
	$ttop.="<table width=100% cellpadding=5 cellspacing=1><tr>
			<td class=heaad width=55%>".$depot['tx']["he_pattname"]."</td>
			<td width=25% class=heaad>".$depot['tx']["he_pattpar"]."</td>
			<td width=20% class=heaad>".$depot['tx']["he_operations"]."</td>
	</tr>";
	$rulerwidth=90;

	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql=conn_sql_query("SELECT * FROM ".PATT." ORDER BY pattname");
	$b=array();
	
	

	if (!conn_sql_num_rows($sql)){
		$ttop.= "<tr><td colspan=5 class=bord style=\"text-align:center !important;\"> * * * * * * * * * * * * * * * </td></tr>";
	} else {
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
				$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			}
		foreach ($b as $cat){ 

			$currcolor=$colors[1];
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66"; 
		
			$ttop.="<tr class='datarow'>
					<td class=bord style=\"padding-left:10px;\">".stripslashes($cat['pattname'])."</td>
					<td class=bord><b class=grn>
						".$cat['pattid']."	
					</b></td>
					<td class=bord>";

				$ttop.="<a href=\"JavaScript:sbm('edit','".$cat['id']."','')\" id=butt class=edit title=\"".$depot['tx']["ti_edit"]."\"></a>";
				

				$ttop.="<a href=\"JavaScript:rr('".$cat['id']."')\" id=butt class=del title=\"".$depot['tx']["ti_delete"]."\" style='float:right;'></a>";

			$ttop.="</td></tr>";

			
		}

	}
	$ttop.="</table>";
	$ttop.="<div name='langlex' id='langlex'></div>";
	$ttop.=  "<input type=hidden name=su value=\"v\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"\">";
	return $ttop;
}


function patt_add(){
	global $par, $depot,$lngs;
	$ttop='';
	$ly=1;
	$affected=0;
	if ($par['su'] == 'add' || $par['su'] == 'edit'){
		if ($par['su'] == 'edit') {
			$res=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".PATT." WHERE id=\"".$par['id']."\""));
			if (!(count($res)>0)) {
				$depot['errors'][]='WRONG ID';
				return;
			}

			foreach($res as $k=>$v){
				/*$par[$k]=htmlspecialchars($v);					!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1 */
				$par[$k]=htmlspecialchars($v);
			}
			$par_to_save='saveedit';
		} else {
			$par_to_save='save';
		}

		$ttop.= "
		<table width=\"100%\" cellspacing=1>
				<tr>
					<td width=\"60%\" class=heaad><label for=patt_name>".$depot['tx']['he_pattname']."</label>
					".bd_tf(@$par['pattname'],'pattname','text','width:500px',1,'')."</td>
					<td width=\"30%\" class=heaad><label for=pattid>".$depot['tx']['he_pattpar']."</label>
					".bd_tf(@$par['pattid'],'pattid','text','width:300px',2,'')."</td>
				</tr>
				<tr>
					<td colspan=2><label for=pattern>".$depot['tx']['he_pattern']."</label>".bd_tar(@$par['patternbody'],'patternbody','960px','400px',3)."
					</td>
				</tr>
				";
		
		$checked=(@$par['stayhere']) ? "checked" : "";
		$ttop.= "</table><div class=sbm><input type=button value=\"".$depot['tx']["bt_save"]."\" id=submt class='save' onClick=\"sbm('$par_to_save','','')\">&nbsp;&nbsp;<input type=checkbox name='stayhere' value='1' $checked class='clear'>".iho('���������� �����������')."</div>";
	
	} else if ($par['su']=="save"){
		$ison=conn_fetch_row(
			conn_sql_query("
					SELECT * FROM ".PATT." WHERE 
						pattid=\"".conn_real_escape_string(trim($par["pattid"]))."\"
		"));
		if ($ison[0]){
			$depot['errors'][]=iho("��������� ��� ".conn_real_escape_string(trim($par["pattname"]))." ��� ����. ������ �������.");
		}
		else {
			$q21=conn_sql_query("INSERT INTO ".PATT." SET 
				pattname=\"".		sqller($par["pattname"])	."\",
				pattid=\"".			sqller($par["pattid"])			."\",
				patternbody =\"".	sqller($par["patternbody"])		."\"
			") or die(conn_error());
			$affected=conn_affected_rows($q21);
		}
		
		if ($affected>0) 
		{
			$depot['oks'][]="1 ".$depot['tx']["ok_recordsadded"]; 
			freecache(3);
		}
		else 
		{
			$depot['errors'][]=$depot['tx']["al_recordsadded"];
					
		}
		
		return patt_view();
	} else if ($par['su']=="saveedit"){
		$ison=conn_fetch_row(
			conn_sql_query("
					SELECT * FROM ".PATT." WHERE 
						pattid=\"".conn_real_escape_string(trim($par["pattid"]))."\" AND id <> \"".$par['id']."\"
		"));
		if ($ison[0]){
			$depot['errors'][]=iho("��������� ��� \"<b>").conn_real_escape_string(trim($par["pattname"])).iho("</b>\" ��� ����. ������ �������.");
		}
		else 
		{
			$order=conn_fetch_row(conn_sql_query("SELECT MAX(orderid) FROM ".CATS));
			$q21=conn_sql_query("UPDATE ".PATT." SET 
				pattname=\"".		conn_real_escape_string(($par["pattname"]))	."\",
				pattid=\"".			sqller($par["pattid"])			."\",
				patternbody =\"".	sqller($par["patternbody"])		."\" WHERE id = \"".$par['id']."\"
			") or die(conn_error());
				
			$affected=conn_affected_rows($q21);
		}
		if ($affected>0) 
		{
			$depot['oks'][]="1 ".$depot['tx']["ok_edited"]; 
			freecache(3);
		}
		else 
		{
			$depot['errors'][]=$depot['tx']["al_edited"];
					
		}
		if (!isset($par['stayhere']))
			return patt_view();
		else {
		   $par['su'] = 'edit';
		   return patt_add();
		}
	}
	$ttop.= "
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=id value=\"".@$par['id']."\">";
	return $ttop;
}



function patt_edit(){
	global $par,$errors,$oks, $depot,$lngs;
	$ttop='';

	if (!isset($par['sudir'])){	
		
		
		$q11=conn_sql_query("SELECT * FROM ".CATS." WHERE id=\"".$par['id']."\"");
		$q1=conn_fetch_array($q11, PDO::FETCH_ASSOC);
		if (!conn_sql_num_rows($q11)){
			$depot['errors'][]=$depot['tx']['al_chooseedit'];
			return patt_view();
		}

		$ttop.="<h2>".@$lngs[$q1['lang']][0]."</h2>";
		$ttop.= "<table width=\"100%\"><tr><td class=heaad>".$depot['tx']['he_titlename']."</td>";
		$ttop.= "<td class=heaad>".$depot['tx']['he_param']."</td>";
		$ttop.= "<td class=heaad>".$depot['tx']['he_visible']."</td></tr>";

	
		$ttop.= "<tr><td class=tdrow><INPUT type=text name=langtitle style=\"width:280px;\" value=\"".htmlspecialchars($q1['title'])."\"></td>";

		$ttop.= "<td class=tdrow><INPUT type=text name=idword style=\"width:280px;\" value=\"".htmlspecialchars($q1['param'])."\"></td>";

		$ttop.= "<td class=tdrow>";
		$ttop.= "<input type='checkbox' value='1' name=isactive ";
		if ($q1['isvis']) $ttop.='checked';
		$ttop.="></td>";
		$ttop.="</tr></table>";
	
	} else if ($par['sudir']=='gosavechange'){
		if (!isset($par["isactive"])) $par["isactive"]=0;

        $res_ = conn_sql_query("UPDATE ".CATS." SET 
		title=\"".sqller($par["langtitle"])."\",
		param=\"".sqller($par["idword"])."\",
		isvis=\"".trim($par["isactive"])."\" WHERE id=\"".$par['id']."\"
		") or $depot['errors'][]=conn_error();
	
		if (conn_affected_rows($res_)) {
			$depot['oks'][]=$depot['tx']['ok_edited'];
		}
		else {
			$depot['errors'][]=$depot['tx']['al_edited'];
		}
		return patt_view();
	}


	$ttop.= "
	<input type=hidden name=su value=\"edit\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=id value=\"".$par['id']."\">
	<div class=sbm><input type=button value=\"".$depot['tx']['bt_save']."\" class='save' id=submt onClick=\"sbm('','','gosavechange')\"></div>
		";
	return $ttop;
}




function patt_del(){
	global $par,$errors,$oks,$b, $depot;
	$ttop='';

    $res_ = conn_sql_query("DELETE FROM ".PATT." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($depot['oks'],$depot['tx']['ok_del1']);
		freecache(3);
	} else {
		array_unshift($depot['errors'],$depot['tx']['al_norecs']."<br><br>");
	}

	$ttop.=patt_view();
	return $ttop;
}


function patt_change(){
	global $par,$errors,$oks,$b, $depot;
	$ttop='';

    $res_ = conn_sql_query("UPDATE ".CATS." SET isvis=MOD((isvis+1),2) WHERE id=\"".$par['id']."\"") or die(conn_error());
	if (conn_affected_rows($res_)) {
		$depot['oks'][]=$depot['tx']["ok_activated"];
		freecache(3);
	} else {
		$depot['errors'][]=$depot['tx']["al_chng"];
	}
	$ttop.=patt_view();
	return $ttop;
}



function patt_js(){
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
