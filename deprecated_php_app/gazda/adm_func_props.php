<?

global $a2,$b2,$p,$previndex,$allangs;
//$js="js_lang";
function aget_center(){
		
		global $par,$errors,$oks, $depot,$allangs;
		$ttop=pic_js();
		$ttop.= "<h1 class='fixed'>".iho("������� ����������")."</h1><hr><form name='ad' method=post enctype=\"multipart/form-data\" >";

		if (!require_level('ac_props')){
			$depot['errors'][]=$depot["tx"]['in_noaccess'];
			return;
		}


		if (!isset($par['su'])) $par['su']='v';
		switch ($par['su']){
			case "v": 
			case "changeenviro":$ttop.= prop_enviro();break;
			case "add": $ttop.= prop_add();break;
			case "remove": $ttop.= prop_del();break;
		}

		
		$ttop.= "</form>";
		return $ttop;

}



function prop_enviro(){
	global $par,$b2, $depot, $enviro;

	
	if ($par['su'] == "changeenviro"){
		
		list($v,$shit)=explode("___",$par['arrayname']);
        $res_ = conn_sql_query("UPDATE ".ENVIRO." SET envalue = \"".$par[$par['arrayname']]."\" WHERE envid = \"$v\"");
		if (conn_affected_rows($res_)>0){
			$depot['oks'][]=iho("�������� ��������� ���������");
			freecache(6);
			$enviro=conn_fetch_array(conn_sql_query("SELECT * FROM ".ENVIRO.""));
		}
	}


	$ttop="<a href=\"JavaScript:sbm('add','0','');\" style='float:left;margin:10px 0;'><img src=\"img/bt_add.gif\" alt=\"".$depot["tx"]["he_add"]."\" title=\"".$depot["tx"]["he_add"]."\" border=0 style='margin-right:15px;margin-bottom:-5px;'> ".$depot["tx"]["he_add"]."</a>";

	$ttop.="<table width=100% cellpadding=5><tr>";
	$ttop.="<td class=heaad width=40%>".iho('�����������')."</td>";
	$ttop.="<td class=heaad width=20%>".iho('���������')."</td>";
	$ttop.="<td class=heaad width=20%>".iho('��������')."</td>";
	$ttop.="<td class=heaad width=20%>".iho('��������')."</td></tr>";

	$esql=conn_sql_query("SELECT * FROM ".ENVIRO." ORDER BY title");
	for ($i=0;$i<conn_sql_num_rows($esql);$i++){
		$res=conn_fetch_assoc($esql);
		$idname=$res['envid']."___enviro";
		$ttop.="
			<tr>
				<td class=bord>".$res['title']."</td>
				<td class=bord style='background-color:#EEE'>".$res['envid']."</td>
				<td class=bord ><div id=".$idname." name=".$idname." class=grn>".$res['envalue']."</div></td>
				<td class=bord>
				<span id='".$idname."___buttenv' name='".$idname."___buttenv' ><a href=\"JavaScript:editenv('$idname')\"  id=butt class=edit></a>
				<a href=\"JavaScript:rr('".$res['id']."')\" id=butt class=del title=\"".$depot["tx"]["ti_delete"]."\" style='float:right;'></a></span>
			</td>

			</tr>";
		
	}
	$ttop.="</table>";

	$ttop.=  "<input type=hidden name=act value=\"props\"><input type=hidden name=su value=\"\"><input type=hidden name=arrayname value=\"\"><input type=hidden name=id value=\"\">";
	return $ttop;
}


function prop_add(){
	global $par, $errors, $oks, $depot;
	$ttop='';

	
	$ly=1;

	if (!isset($par['sudir'])){

		$ttop.= "<table width=100%><tr><td rowspan=2 valign=top><br>".$depot["tx"]["in_adding"]."<br></td><td width=50 rowspan=2>&nbsp;</td><td>";
		$ttop.= "<TEXTAREA style='width:640px;height:200px;' name=list></textarea></td></tr><tr><td class=haader>
		<br><input type=button value=\"".$depot["tx"]["bt_proceed"]."\"  id=submt onClick=\"sbm('','','proceed')\"></td></tr></table>";


	} else if ($par['sudir']=="proceed"){
		$allo=explode("\n",$par['list']);
		$ttop.= "<table width=\"100%\"><tr>
					<td width=\"50%\" class=heaad>".$depot["tx"]['he_using']."</td>
					<td class=heaad width=\"25%\">".$depot["tx"]['he_param']."</td>
					<td class=heaad width=\"25%\">".$depot["tx"]['he_value']."</td></tr>";
		$i=0;

		foreach ($allo as $k=>$v){
			if (!trim($v)) continue;
			$ttop.= "<tr><td class=tdrow><INPUT type=text name=title".$i." style=\"width:340px;\" value=\"".htmlspecialchars($v)."\"></td>";
			$ttop.= "<td  class=tdrow><INPUT type=text name=idword".$i." style=\"width:250px;\"></td>";
			$ttop.= "<td  class=tdrow><INPUT type=text name=envalue".$i." style=\"width:250px;\"></td>";
			$i++;
		}
		$ttop.="<input type=hidden name=list value='".$par['list']."'>";
		$ttop.= "</table><br><input type=button value=\"".$depot["tx"]["bt_proceed"]."\" id='submt' onClick=\"sbm('','','gosave')\"><input type=hidden name=qty value=\"$i\">";
	} else if  ($par['sudir']=="gosave"){

		$dd=0;

		for ($i=0;$i<$par['qty'];$i++){
			/*-----------------*/
			$ison=conn_fetch_row(conn_sql_query("SELECT * FROM ".ENVIRO." WHERE envid=\"".conn_real_escape_string(trim($par["idword$i"]))."\""));
			if ($ison[0]){
				$depot['errors'][]="Parameter envid for ".conn_real_escape_string(trim($par["idword$i"]))." duplicates one in DB. It should be unique";
			}
		}

		if ($errors) {
			$par['sudir']="proceed";
			return prop_add();
		}



		for ($i=0;$i<$par['qty'];$i++){
			$dd++;
			
			$q21=conn_sql_query("INSERT INTO ".ENVIRO." SET 
			title=\"".conn_real_escape_string(stripslashes($par["title$i"]))."\",
			envid=\"".conn_real_escape_string(stripslashes($par["idword$i"]))."\",
			envalue=\"".conn_real_escape_string(stripslashes($par["envalue$i"]))."\"") or die(conn_error());

			
		}
		if (conn_affected_rows($q21)) {
			$depot['oks'][]=$dd." ".$depot["tx"]["ok_recordsadded"];
			freecache(6);
			return prop_enviro();
		}
		else {
			$depot['errors'][]=$depot["tx"]["al_recordsadded"];

					
		}
		
	}

	$ttop.= "<input type=hidden name=act value=\"props\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=id value=\"".$par['id']."\">";
	return $ttop;

}



function prop_del(){
	global $par,$depot,$oks,$b;
	$ttop='';

    $res_ = conn_sql_query("DELETE FROM ".ENVIRO." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($depot['oks'],$depot["tx"]['ok_del1']);
	} else {
		array_unshift($depot['errors'],$depot["tx"]['al_norecs']."<br><br>");
	}

	$ttop.=prop_enviro();
	return $ttop;
}




function pic_js(){
	global $ctime;
$r=<<<JSCR

 <script language="javaScript">

		  <!--
		
		function setvalue(name,value){
				var obj = document.getElementById ? document.getElementById(name) : null;
				obj.innerHTML = value;
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
?>
