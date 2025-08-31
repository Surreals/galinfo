<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){

		global $par,$errors,$oks, $tx;
		$ttop='';
		$ttop.= "<h1 class='fixed'>".$tx['he_adplaces']."</h1><hr><form name='ad' method=post>";
		
		if (!isset($par['su'])) $par['su']='v';
			//echo $par['su'];
		switch ($par['su']){
			case "v":			$ttop.= adplaces_view();break;
			case "add":			$ttop.= adplaces_add();break;
			case "edit": 
			case "saveedit": 	$ttop.= adplaces_edit();break;
			case "saveaddsub": 	
			case "saveeditsub": 	
			case "editsub": 		
			case "addsub": 		$ttop.= adplaces_addsub();break;
			case "remove":		$ttop.= adplaces_del();break;

			case "listbanners":		$ttop.= adplaces_viewbanners();break;
			case "addbanner":		
			case "editbanner":	$ttop.= adplaces_addbanner();break;
			case "savebanner":		
			case "saveeditbanner":		$ttop.= adplaces_savebanner();break;

		}

		$ttop.=  "
				<input type=hidden name=act value=\"adplaces\">
				<input type=hidden name=su value=\"".@$par['su']."\">
				<input type=hidden name=sudir value=\"\">
				<input type=hidden name=par value=\"\">";
		$ttop.= "</form>";
		return $ttop;

}

function adplaces_viewbanners(){
	global $par,$b, $tx;
	$ttop='';
	$ttop.="<a href=\"JavaScript:sbm('addbanner','0','');\" style='line-height:30px;height:30px;'><img src=\"img/bt_add.gif\" alt=\"".$tx["he_add"]."\" title=\"".$tx["he_add"]."\" border=0 style='margin-right:15px;margin-bottom:-5px;'> ".$tx["he_add"]."</a>";

	$name=conn_fetch_row(conn_sql_query("SELECT placename FROM ".ADPLACES." WHERE id = \"".$par['grid']."\""));
	$ttop.="<h2>".stripslashes($name[0])." / <a href='/gazda/?act=adplaces'>".iho('�� ��������')."</a></h2> ";

	$ttop.="<table width=100% cellpadding=5><tr>
		<td class=heaad width=35%>".$tx["he_bannername"]."</td>
		<td class=heaad width=10%>".$tx["he_type"]."</td>
		<td class=heaad width=15%>".iho('������� ������ %')."</td>
		<td class=heaad width=15%>".iho('���� ')."</td>
		<td width=20% class=heaad>".$tx["he_operations"]."</td>
	</tr>";
	$activ=array('1'=>iho('��������'),'2'=>iho('³���������'));
	$rulerwidth=90;
	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql_t="	
				SELECT ".BANNERS.".*,".ADMANAGE.".id AS manid, ".ADMANAGE.".percent, ".ADMANAGE.".active
				FROM ".ADMANAGE." JOIN ".BANNERS." 
				ON bannerid = ".BANNERS.".id AND placeid = \"".$par['grid']."\"
				";

	$sql=conn_sql_query($sql_t) or die(conn_error());
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_assoc($sql);
	}

	if (!conn_sql_num_rows($sql)){
		$ttop.= "<tr><td colspan=5 class=bord style=\"text-align:center !important;\"><br><br><br><br> * * * * * * * * * * * * * * * <br><br><br></td></tr>";
	} else {
		$type=array('1'=>'FILE','2'=>'HTML');
		$currcolor='#FBF2FF';
		foreach ($b as $cat){ 
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66"; 
			$ttop.="<tr>
			<td class=bord style=\"background-color:".$currcolor.";\"><a href=\"JavaScript:sbm('editbanner','".$cat['manid']."','')\"  title=\"".$tx["ti_edit"]."\">".stripslashes($cat['bname'])."</a></td>
			<td class=bord style=\"background-color:".$currcolor.";\">".$type[$cat['btype']]."</td>
			<td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['percent'])."</td>
			<td class=bord style=\"background-color:".$currcolor.";\">".$activ[$cat['active']]."</td>";

			$ttop.="<td><a href=\"JavaScript:sbm('editbanner','".$cat['manid']."','')\" id=butt class=edit title=\"".$tx["ti_edit"]."\"></a>";

			$ttop.="<a href=\"JavaScript:rr('".$cat['manid']."')\" style='margin-left:50px;'><img src=\"img/bt_del.gif\" alt=\"".$tx["ti_delete"]."\" title=\"".$tx["ti_delete"]."\" border=0></a>";
			$ttop.="</td></tr>";
		}

	}
	$ttop.="</table><input type=hidden name=id value=\"\">";
	$ttop.="</table><input type=hidden name=grid value=\"".$par['grid']."\">";
	return $ttop;
}


function adplaces_addbanner(){
	global $par, $errors, $oks, $tx;
	$ttop='';
	$ttop.="<table width=100% cellpadding=5><tr>
		<td class=heaad width=35%>".$tx["he_bannername"]."</td>
		<td class=heaad width=15%>".iho('������� ������ "%"')."</td>
		<td width=20% class=heaad>".iho('��������')."</td>
	</tr>";
	$su='savebanner';
	if ($par['su'] == 'editbanner') {
		$curr=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".ADMANAGE." WHERE id = \"".$par['id']."\""));
		foreach ($curr as $k=>$v) $par[$k]=$v;
		$su='saveeditbanner';
	}


	$all_banns=conn_sql_query("SELECT id,bname FROM ".BANNERS);
	$bn_pop=array('0','-------------');
	
	while ($res = conn_fetch_assoc($all_banns)){
		$bn_pop[]=$res['id'];
		$bn_pop[]=stripslashes($res['bname']);
	}


	$ttop.="<tr><td class=bord>".bd_popup($bn_pop,"bannerid",'width:400px;','','')."</td>";
	$ttop.="<td class=bord>".bd_tf(@$par['percent'],"percent",'text','width:150px;','','')."</td>";
	$ttop.="<td class=bord>".bd_popup(array('1',iho('��������'),'2',iho('³���������')),"active",'width:250px;','','')."</td></tr>";
	$ttop.="<tr><td colspan=3><br><input type=button value=\"".$tx["bt_proceed"]."\" id='submt' onClick=\"sbm('$su','','')\">";
	
	$ttop.="</td></tr></table>";
	$ttop.= "<input type=hidden name=grid value=\"".$par['grid']."\">";
	$ttop.= "<input type=hidden name=id value=\"".$par['id']."\">";

	return $ttop;

}

function adplaces_savebanner(){
	global $par, $errors, $oks, $tx;
	$ttop='';
	$addon='';
	if ($par['su'] == 'savebanner'){
		echo "1";
		$sql='INSERT INTO '.ADMANAGE." SET ";
	} else {
		echo "2";
		$sql='UPDATE '.ADMANAGE." SET ";
		$addon=" WHERE id = \"".$par['id']."\"";
	}
	
	$sql.=" 
			placeid=\"".	sqller($par['grid'])."\",
			bannerid=\"".	sqller($par['bannerid'])."\",
			percent=\"".	sqller($par['percent'])."\",
			active=\"".		sqller($par['active'])."\" 
			$addon
	
	";
    $res_ = conn_sql_query($sql) or die(conn_error());
	freecache(8);
	if (conn_affected_rows($res_)>0){
		$oks[]='Record processed ok';
		$par['su']='listbanners';
		return adplaces_viewbanners();
	} else {
		$errors[]='Problem adding/editing record<hr>'.conn_error()."<hr>".$sql;
		$par['su']='addbanners';
		return adplaces_addbanner();

	}
} 

function adplaces_view(){
	global $par,$b, $tx;
	$ttop='';
	$ttop.="<a href=\"JavaScript:sbm('add','0','');\" style='line-height:30px;height:30px;'><img src=\"img/bt_add.gif\" alt=\"".$tx["he_addadplaces"]."\" title=\"".$tx["he_addadplaces"]."\" border=0 style='margin-right:15px;margin-bottom:-5px;'> ".$tx["he_addadplaces"]."</a>";
	$ttop.="<table width=100% cellpadding=5><tr>
		<td class=heaad width=45%>".$tx["he_adplaces"]."</td>
		<td class=heaad width=10%>".$tx["he_par"]."</td>
		<td class=heaad width=5%>".iho('������')."</td>
		<td class=heaad width=15%>".iho('�������')."</td>
		<td width=20% class=heaad>".$tx["he_operations"]."</td>
	</tr>";
	$rulerwidth=90;
	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql_t="	
				SELECT A1.*, T1.langids,  T7.rubrics, T2.regionis, T6.bnqty
				FROM ".ADPLACES." AS A1
				LEFT JOIN (
						   SELECT COUNT(*) as bnqty, placeid
						   FROM ".ADMANAGE."
						   GROUP BY placeid
						   ) AS T6
				ON A1.id = T6.placeid
				LEFT JOIN (
						   SELECT GROUP_CONCAT(".LANG.".lang SEPARATOR ', ') AS langids, T4.id
						   FROM ".LANG.", ".ADPLACES." AS T4
						   WHERE FIND_IN_SET(".LANG.".id,T4.lang)
						   GROUP BY T4.id
						   ) AS T1
				ON A1.id = T1.ID
				LEFT JOIN (
						  SELECT GROUP_CONCAT(C2.param SEPARATOR ', ') AS rubrics, T8.id
						  FROM ".CATS." AS C2, ".ADPLACES." AS T8
						  WHERE cattype = 'rubric'
						  AND FIND_IN_SET(C2.id,T8.rubric)
						  GROUP BY T8.id
						  ) AS T7
				ON A1.id = T7.ID
				LEFT JOIN (
						  SELECT GROUP_CONCAT(C1.param SEPARATOR ', ') AS regionis, T5.id
						  FROM ".CATS." AS C1, ".ADPLACES." AS T5
						  WHERE cattype = 'region'
						  AND FIND_IN_SET(C1.id,T5.region)
						  GROUP BY T5.id
						  ) AS T2
				ON A1.id = T2.ID
				ORDER BY A1.adid, A1.id
				";

	$sql=conn_sql_query($sql_t) or die(conn_error());
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_assoc($sql);
	}

	if (!conn_sql_num_rows($sql)){
		$ttop.= "<tr><td colspan=7 class=bord style=\"text-align:center !important;\"><br><br><br><br> * * * * * * * * * * * * * * * <br><br><br></td></tr>";
	} else {

		foreach ($b as $cat){ 

			$currcolor="#CCFF99";
			if ($cat['parentid']) $currcolor="#FFFFCC";
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66"; 


			if (!$cat['bnqty']) $cat['bnqty']='0';
			if (!$cat['langids']) $cat['langids']=iho("******");
			if (!$cat['regionis']) $cat['regionis']=iho("******");
			if (!$cat['rubrics']) $cat['rubrics']=iho("******");
			if ($cat['parentid']) $marg=30; else $marg=10;

			$ttop.="<tr>
			<td class=bord style=\"padding-left:".$marg."px;background-color:".$currcolor."; background-image: url(img/ruler.gif);background-position: ".($marg-90)." -3px; background-repeat:no-repeat;\" valign=top>&#8226;&nbsp; <a href='/gazda/?act=adplaces&su=listbanners&grid=".$cat['id']."'>".stripslashes($cat['placename'])."</a></td>
			<td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['adid'])."</td>
			<td class=bord style=\"background-color:".$currcolor.";\"><b>".stripslashes($cat['bnqty'])."</b></td>
			<td class=bord style=\"background-color:".$currcolor.";\" id=rem>".stripslashes($cat['rubrics'])."</td>

			<td class=bord>";
			
			if (!$cat['parentid']){

				$ttop.="<a href=\"JavaScript:sbm('edit','".$cat['id']."','')\" id=butt class=edit title=\"".$tx["ti_edit"]."\"></a>";
				$ttop.="<a href=\"JavaScript:sbm('addsub','".$cat['id']."','')\" id=butt class=add title=\"".$tx["ti_add"]."\"></a>";
			} else {
				
				$ttop.="<a href=\"JavaScript:sbm('editsub','".$cat['id']."','')\" id=butt class=edit title=\"".$tx["ti_edit"]."\"></a>";
				$ttop.="<img src='/gazda/img/bt_addi.gif' style='float:left;'>";
			}



			$ttop.="<a href=\"JavaScript:rr('".$cat['id']."')\" style='margin-left:40px;'><img src=\"img/bt_del.gif\" alt=\"".$tx["ti_delete"]."\" title=\"".$tx["ti_delete"]."\" border=0></a>";
				
			$ttop.="</td></tr>";
		}

	}
	$ttop.="</table><input type=hidden name=id value=\"\">";
	return $ttop;
}


function adplaces_add(){
	global $par, $errors, $oks, $tx;
	$ttop='';
	$ly=1;
	if (!@$par['sudir']){

		$ttop.= "<table width=100%><tr><td rowspan=2 valign=top><br>".$tx["in_adding"]."<br></td><td width=50 rowspan=2>&nbsp;</td><td>";
		$ttop.= "<TEXTAREA style='width:640px;height:200px;' name=list></textarea></td></tr><tr><td class=haader>
		<br><input type=button value=\"".$tx["bt_proceed"]."\"  id=submt onClick=\"sbm('','','proceed')\"></td></tr></table>";


	} else if ($par['sudir']=="proceed"){
		$allo=explode("\n",$par['list']);


		$ttop.="<h3><br>".iho('! ID ���������� ������� ���� ������ "bannplace_"+ ���������')."<br></h3>";
		$ttop.= "<table width=\"100%\"><tr><td width=\"20%\" class=heaad>".$tx['he_titlename']."</td>";
		$ttop.= "<td class=heaad width=\"10%\">".$tx['he_param']."</td>";
		$ttop.= "<td class=heaad width=\"30%\">".iho("³���������� ��� ����������")."</td>";
		$ttop.= "<td class=heaad width=\"30%\">".iho("����������� ��� ����������")."</td></tr>";
		$i=0;

		foreach ($allo as $k=>$v){
			if (!trim($v)) continue;
			$ttop.= "<tr><td class=tdrow><INPUT type=text name=modname".$i." style=\"width:240px;\" value=\"".htmlspecialchars($v)."\"></td>";
			$ttop.= "<td  class=tdrow><INPUT type=text name=idword".$i." style=\"width:80px;\"></td>";
			$ttop.= "<td  class=tdrow>".
				bd_tar(@$par['holdstart'.$i],'holdstart'.$i,'300px','50px','','')."</td>";
			$ttop.= "<td  class=tdrow>".
				bd_tar(@$par['holdend'.$i],'holdend'.$i,'300px','50px','','')."</td></tr>";


			$i++;
		}
		$ttop.="<input type=hidden name=list value='".$par['list']."'>";
		$ttop.= "</table><br><input type=button value=\"".$tx["bt_proceed"]."\" id='submt' onClick=\"sbm('','','gosave')\"><input type=hidden name=qty value=\"$i\">";
	} else if  ($par['sudir']=="gosave"){

		$dd=0;


		for ($i=0;$i<$par['qty'];$i++){
			/*-----------------*/
			$ison=conn_fetch_row(conn_sql_query("SELECT * FROM ".ADPLACES." WHERE adid=\"".conn_real_escape_string(trim($par["idword$i"]))."\""));
			if ($ison[0]){
				$errors[]="Parameter adid for ".conn_real_escape_string(trim($par["modname$i"]))." duplicates one in DB. It should be unique";
			}
		}

		if ($errors) {
			$par['sudir']="proceed";
			return adplaces_add();
		}

		for ($i=0;$i<$par['qty'];$i++){
			$dd++;
			
			$q21=conn_sql_query("INSERT INTO ".ADPLACES." SET 
			placename=\"".conn_real_escape_string(stripslashes($par["modname$i"]))."\",
			adid=\"".	conn_real_escape_string(stripslashes($par["idword$i"]))."\",
			holdend=\"".	conn_real_escape_string(stripslashes($par["holdend$i"]))."\",
			holdstart=\"".	conn_real_escape_string(stripslashes($par["holdstart$i"]))."\",
			parentid=0");

			
		}
		if (conn_affected_rows($q21)) {
			$oks[]=$dd." ".$tx["ok_recordsadded"]; 
			return adplaces_view();
		}
		else {
			$errors[]=$tx["al_recordsadded"];

					
		}
		
	}
	freecache(8);
	$ttop.= "<input type=hidden name=id value=\"".$par['id']."\">";
	return $ttop;

}


function adplaces_edit(){
	global $par, $errors, $oks, $tx;
	$ttop='';
	
	if ($par['su']=="edit"){
		$ttop.="<h3><br>".iho('! ID ���������� ������� ���� ������ "bannplace_"+ ���������')."<br></h3>";

		$record=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".ADPLACES." WHERE id =\"".$par['id']."\""));

		$ttop.= "<table width=\"100%\"><tr><td width=\"20%\" class=heaad>".$tx['he_titlename']."</td>";
		$ttop.= "<td class=heaad width=\"10%\">".$tx['he_param']."</td>";
		$ttop.= "<td class=heaad width=\"30%\">".iho("³���������� ��� ����������")."</td>";
		$ttop.= "<td class=heaad width=\"30%\">".iho("����������� ��� ����������")."</td></tr>";

		$ttop.= "<tr><td class=tdrow><INPUT type=text name=placename style=\"width:240px;\" value=\"".htmlspecialchars($record['placename'])."\"></td>";
		$ttop.= "<td  class=tdrow><INPUT type=text name=adid style=\"width:80px;\" value=\"".htmlspecialchars($record['adid'])."\"></td>";
		$par['holdstart']=$record['holdstart'];
		$par['holdend']=$record['holdend'];
		$ttop.= "<td  class=tdrow>".
				bd_tar(@$par['holdstart'],'holdstart','300px','50px','','')."</td>";
		$ttop.= "<td  class=tdrow>".
				bd_tar(@$par['holdend'],'holdend','300px','50px','','')."</td></tr>";

		$ttop.="<input type=hidden name=id value='".$record['id']."'>";
		$ttop.= "</table><br><input type=button value=\"".$tx["bt_proceed"]."\" id='submt' onClick=\"sbm('saveedit','','')\">";
	} else if  ($par['su']=="saveedit"){
		$re="
						UPDATE ".ADPLACES." SET 
						placename=\"".conn_real_escape_string(stripslashes($par["placename"]))."\",
						adid=\"".	conn_real_escape_string(stripslashes($par["adid"]))."\",
						holdend=\"".	conn_real_escape_string(stripslashes($par["holdend"]))."\",
						holdstart=\"".	conn_real_escape_string(stripslashes($par["holdstart"]))."\"
						WHERE id = \"".$par['id']."\"
						";
		$q21=conn_sql_query($re) or die(conn_error());

		if (conn_affected_rows($q21)) {
			$oks[]=$tx["ok_edited"]; 
			return adplaces_view();
		}

		else {
			$errors[]=$tx["al_edited"];		
		}
	}

	freecache(8);
	return $ttop;

}

function adplaces_addsub(){
	global $par, $errors, $oks, $tx, $lngs;
	$ttop='';
	
	if ($par['su']=="addsub" || $par['su']=="editsub"){	
		$record=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".ADPLACES." WHERE id =\"".$par['id']."\""));
		$ttop.="<h3><br>".iho('������ ���� ���������� ���� "'.$record['adid'].'"')."<br></h3>";
		if ($par['su']=="editsub"){
			foreach (array("lang","region","rubric","placename") as $v) $par[$v]=$record[$v];
			if (!@$par['langfilter'])$par['langfilter'] = $par['lang'];
			$par['region'] = explode(',',stripslashes($par['region']));
			$par['rubric'] = explode(',',stripslashes($par['rubric']));
		}
		
		$l[]='0';
		$l[]=iho('�� �����������');

		foreach ($lngs as $k=>$v) {
			$l[]=$k;
			$l[]=$v[0];
		}

		$ttop.= "<table width=\"100%\"><tr><td width=\"30%\" class=heaad>".$tx['he_titlename']."</td>";
		$ttop.= "<td class=heaad width=\"20%\">".iho('������ ������')."</td>";
		$ttop.= "<td class=heaad width=\"20%\">".iho('������')."</td>";
		$ttop.= "<td class=heaad width=\"20%\">".iho('�������')."</td>";
		$ttop.="</tr>";
		if ($par['su']=="addsub")
			$ttop.= "<tr><td class=tdrow><INPUT type=text name=placename style=\"width:300px;\" value=\"".htmlspecialchars($record['placename'])." (".iho('����').")\"></td>";
		else $ttop.="<tr><td class=tdrow>".bd_tf(@$par['placename'],'placename','text','width:300px;','','')."</td>";


		$ttop.= "<td  class=tdrow>".bd_popup($l,'langfilter','width:150px;',1,'onChange = "chng_lang(\''.$par['su'].'\')"')."</td>";


		if (@$par['langfilter']) {
			$sql='SELECT id, title, cattype FROM '.CATS.' WHERE lng="'.$par['langfilter'].'" ORDER BY orderid';
			$regs=array(0,'-----');
			$rubs=array(0,'-----');
			$tems=array(0,'-----');

			$query=conn_sql_query($sql) or die(conn_error());
			for ($i=0;$i<conn_sql_num_rows($query);$i++) {
				$res=conn_fetch_row($query);
				switch ($res[2]) {
					case 'region'	:	$regs[]=$res['0'];$regs[]=$res['1'];break;
					case 'rubric'	:	$rubs[]=$res['0'];$rubs[]=$res['1'];break;
					case 'theme'	:	$tems[]=$res['0'];$tems[]=$res['1'];break;
				}
			}

			$regions = bd_multipopup($regs,'region','height:128px;width:99%',3,'');
			$rubrics= bd_multipopup($rubs,'rubric','height:128px;width:99%',3,'');

		} else {
			$regions = iho ('������ ����');
			$rubrics = iho ('������ ����');
		}
		$ttop.= "<td  class=tdrow>".$regions."</td>";
		$ttop.= "<td  class=tdrow>".$rubrics."</td>";
		$ttop.="<input type=hidden name=id value='".$record['id']."'>";
		$ttop.= "</table><br><input type=button value=\"".$tx["bt_proceed"]."\" id='submt' onClick=\"sbm('save".$par['su']."','','')\">";
	} else if  ($par['su']=="saveaddsub" || $par['su']=="saveeditsub"){
		
		if (!@$par['langfilter']){
			$par['su']="addsub";
			$errors[]=iho('�� ������ ����� �����');
			return adplaces_addsub();
		}

		$e_region =	(@$par['region']) ? sqller(implode(',',$par['region'])) : '';
		$e_rubric =	(@$par['rubric']) ? sqller(implode(',',$par['rubric'])) : '';


	
		if  ($par['su']=="saveaddsub" ){
					$re="			INSERT INTO  ".ADPLACES." 
									(adid,placename,parentid,lang,region,rubric)
									SELECT adid,
									\"".sqller($par['placename'])."\",
									\"".$par['id']."\",
									\"".$par['langfilter']."\",
									\"".$e_region."\",
									\"".$e_rubric."\" 
									FROM ".ADPLACES." AS C1 WHERE id = \"".$par['id']."\"";

	

					$q21=conn_sql_query($re) or die(conn_error());

					if (conn_affected_rows($q21)) {
						$oks[]='1'.$tx["ok_recordsadded"]; 
						$par['su']='v';
						return adplaces_view();
					}

					else {
						$errors[]=$tx["al_al"];		
					}
		} else {
					$re="			UPDATE  ".ADPLACES." SET
							
									placename= \"".sqller($par['placename'])."\",
									lang=\"".$par['langfilter']."\",
									region=\"".$e_region."\",
									rubric=\"".$e_rubric."\" 
									WHERE id = \"".$par['id']."\"";

		

					$q21=conn_sql_query($re) or die(conn_error());

					if (conn_affected_rows($q21)) {
						$oks[]=$tx["ok_edited"]; 
						$par['su']='v';
						return adplaces_view();
					}

					else {
						$errors[]=$tx["al_edited"];		
					}		
		}
	}
	freecache(8);
	return $ttop;

}


function adplaces_del(){
	global $par,$errors,$oks,$b, $tx;
	$ttop='';
	if (!isset($par['grid'])){
		$ispar = conn_fetch_assoc(conn_sql_query("SELECT * FROM ".ADPLACES." WHERE id = \"".$par['id']."\""));
		if ($ispar['parentid']) {
            $res_ = conn_sql_query("DELETE FROM ".ADPLACES." WHERE id = \"".$par['id']."\"");
			if (conn_affected_rows($res_)) {
				conn_sql_query("DELETE FROM ".ADMANAGE." WHERE placeid = \"".$par['id']."\"");
				array_unshift($oks,$tx['ok_del1']);
			} else {
				array_unshift($errors,$tx['al_norecs']."<br><br>");
			}
		} else {
			conn_sql_query("
							DELETE ".ADMANAGE.",".ADPLACES." FROM ".ADMANAGE."
							WHERE ".ADMANAGE.".placeid = ".ADPLACES.".id
							AND (".ADPLACES.".parentid = \"".$par['id']."\"
							OR ".ADPLACES.".id = \"".$par['id']."\")
			
			");

            $res_ = conn_sql_query ("DELETE FROM ".ADPLACES." WHERE ".ADPLACES.".parentid = \"".$par['id']."\"
							OR ".ADPLACES.".id = \"".$par['id']."\"");


			if (conn_affected_rows($res_)) {
				array_unshift($oks,$tx['ok_del1']);
			} else {
				array_unshift($errors,$tx['al_norecs']."<br><br>");
			}


		}
		$ttop.=adplaces_view();
	} else {
		conn_sql_query("DELETE FROM ".ADMANAGE." WHERE id = \"".$par['id']."\"") or die(conn_error());
		return adplaces_viewbanners();
	}
	freecache(8);
	return $ttop;
}


?>
