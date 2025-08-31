<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){

		global $par,$errors,$oks, $depot;
		$ttop='';
		$ttop.= "<h1 class='fixed'>".$depot["tx"]['he_mds']."</h1><hr><form name='ad' method=post>";
		
		if (!isset($par['su'])) $par['su']='v';
		switch ($par['su']){
			case "v":$ttop.= mods_view();break;
			case "add": $ttop.= mods_add();break;
			case "remove": $ttop.= mods_del();break;
		}

		
		$ttop.= "</form>";
		return $ttop;

}



function mods_view(){
	global $par,$b, $depot;
	$ttop='';
	$ttop.="<a href=\"JavaScript:sbm('add','0','');\"><img src=\"img/bt_add.gif\" alt=\"".$depot["tx"]["he_addmod"]."\" title=\"".$depot["tx"]["he_addmod"]."\" border=0 style='margin-right:15px;margin-bottom:-5px;'> ".$depot["tx"]["he_addmod"]."</a>";
	$ttop.="<table width=100% cellpadding=5><tr><td class=heaad width=60%>".$depot["tx"]["he_mds"]."</td><td class=heaad width=20%>".$depot["tx"]["he_par"]."</td><td width=20% class=heaad>".$depot["tx"]["he_operations"]."</td></tr>";
	$rulerwidth=90;
	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql=conn_sql_query("SELECT * FROM ".MODS." ORDER BY modname");
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	

	if (!conn_sql_num_rows($sql)){
		$ttop.= "<tr><td colspan=3 class=bord style=\"text-align:center !important;\"><br><br><br><br> * * * * * * * * * * * * * * * <br><br><br></td></tr>";
	} else {

		foreach ($b as $cat){ 

			$currcolor=$colors[1];
			if (isset($par['id']) && ($par['id'] == $cat['modpar'])) $currcolor="#FFFF66"; 
		
			$ttop.="<tr><td class=bord style=\"background-color:".$currcolor.";\">&#8226;&nbsp;".stripslashes($cat['modname'])."</td><td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['modpar'])."</td><td class=bord>";

			$ttop.="<a href=\"JavaScript:rr('".$cat['modpar']."')\"><img src=\"img/bt_del.gif\" alt=\"".$depot["tx"]["ti_delete"]."\" title=\"".$depot["tx"]["ti_delete"]."\" border=0></a>";
				
			$ttop.="</td></tr>";
		}

	}
	$ttop.="</table>";
	$ttop.=  "<input type=hidden name=act value=\"modules\"><input type=hidden name=su value=\"\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"\">";
	return $ttop;
}


function mods_add(){
	global $par, $errors, $oks, $depot;
	$ttop='';

	
	$ly=1;

	if (!isset($par['sudir'])){

		$ttop.= "<table width=100%><tr><td rowspan=2 valign=top><br>".$depot["tx"]["in_adding"]."<br></td><td width=50 rowspan=2>&nbsp;</td><td>";
		$ttop.= "<TEXTAREA style='width:640px;height:200px;' name=list></textarea></td></tr><tr><td class=haader>
		<br><input type=button value=\"".$depot["tx"]["bt_proceed"]."\"  id=submt onClick=\"sbm('','','proceed')\"></td></tr></table>";


	} else if ($par['sudir']=="proceed"){
		$allo=explode("\n",$par['list']);


		$ttop.="<h3><br>".$depot["tx"]["in_modadd"]."<br></h3>";
		$ttop.= "<table width=\"100%\"><tr><td width=\"40%\" class=heaad>".$depot["tx"]['he_titlename']."</td>";
		$ttop.= "<td class=heaad width=\"40%\">".$depot["tx"]['he_param']."</td>";
		$ttop.= "<td class=heaad width=\"20%\">".$depot["tx"]['ti_editable']."</td></tr>";
		$i=0;

		foreach ($allo as $k=>$v){
			if (!trim($v)) continue;
			$ttop.= "<tr><td class=tdrow><INPUT type=text name=modname".$i." style=\"width:340px;\" value=\"".htmlspecialchars($v)."\"></td>";
			$ttop.= "<td  class=tdrow><INPUT type=text name=idword".$i." style=\"width:340px;\"></td>";
			$ttop.= "<td  class=tdrow><INPUT type=checkbox name=editable".$i." value=\"1\"></td>";
			$i++;
		}
		$ttop.="<input type=hidden name=list value='".$par['list']."'>";
		$ttop.= "</table><br><input type=button value=\"".$depot["tx"]["bt_proceed"]."\" id='submt' onClick=\"sbm('','','gosave')\"><input type=hidden name=qty value=\"$i\">";
	} else if  ($par['sudir']=="gosave"){

		$dd=0;
		for ($i=0;$i<$par['qty'];$i++){
			/*-----------------*/
			if (!preg_match("/^mo_(\w+)$/",$par["idword$i"])){
				$depot['errors'][]=$depot["tx"]["in_modadd"];
				$par['sudir']="proceed";
				return mods_add();
				
			}
		}

		for ($i=0;$i<$par['qty'];$i++){
			/*-----------------*/
			$ison=conn_fetch_row(conn_sql_query("SELECT * FROM ".MODS." WHERE modpar=\"".conn_real_escape_string(trim($par["idword$i"]))."\""));
			if ($ison[0]){
				$depot['errors'][]="Parameter idword for ".conn_real_escape_string(trim($par["modname$i"]))." duplicates one in DB. It should be unique";
			}
		}

		if ($errors) {
			$par['sudir']="proceed";
			return mods_add();
		}



		for ($i=0;$i<$par['qty'];$i++){
			$dd++;
			
			$q21=conn_sql_query("INSERT INTO ".MODS." SET 
			modname=\"".conn_real_escape_string(stripslashes($par["modname$i"]))."\",
			modpar=\"".conn_real_escape_string(stripslashes($par["idword$i"]))."\",
			editable=\"".@$par["editable$i"]."\"") or die(conn_error());

			
		}
		if (conn_affected_rows($q21)) {
			$depot['oks'][]=$dd." ".$depot["tx"]["ok_recordsadded"]; 
			return mods_view();
		}
		else {
			$depot['errors'][]=$depot["tx"]["al_recordsadded"];

					
		}
		
	}

	$ttop.= "<input type=hidden name=act value=\"modules\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=id value=\"".$par['id']."\">";
	return $ttop;

}




function mods_del(){
	global $par,$errors,$oks,$b, $depot;
	$ttop='';

    $res_ = conn_sql_query("DELETE FROM ".MODS." WHERE modpar=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($oks,$depot["tx"]['ok_del1']);
	} else {
		array_unshift($errors,$depot["tx"]['al_norecs']."<br><br>");
	}
	$ttop.=mods_view();
	return $ttop;
}


?>
