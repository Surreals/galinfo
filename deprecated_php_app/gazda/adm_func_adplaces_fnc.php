<?

global $a,$p,$previndex;
//$js="js_lang";
function get_module_result(){

		global $par,$errors,$oks, $depot;
		$html='';
		$html.= "<form name='ad' method=post>";
		
		if (!isset($par['su']) || !$par['su']) $par['su']='viewmedia';
			//echo $par['su'];
	
		switch ($par['su']){
			case "viewmedia":			$html.= adplaces_view();break;
			case "add":					$html.= adplaces_add();break;
			case "edit": 
			case "saveedit": 			$html.= adplaces_edit();break;
			case "saveaddsub": 	
			case "saveeditsub": 	
			case "editsub": 		
			case "addsub": 				$html.= adplaces_addsub();break;
			case "removebannplaces":	$html.= adplaces_del();break;

			case "exchange":			$html.= media_items_exchange();	break;

			case "listbanners":
			case "removefromplace"	:	$html.= adplaces_viewbanners();break;
			case "addbanner":		
			case "editbanner":			$html.= adplaces_addbanner();break;
			case "savebanner":		
			case "saveeditbanner":		$html.= adplaces_savebanner();break;

		}

		$html.=  "
				<input type=hidden name=act value=\"adplaces\">
				<input type=hidden name=su value=\"".@$par['su']."\">
				<input type=hidden name=dirid value=\"".@$par['dirid']."\">
				<input type=hidden name=sudir value=\"\">
				<input type=hidden name=par value=\"\">";
		$html.= "</form>";
		return $html;

}

function adplaces_viewbanners(){
	global $par,$b, $depot;
	$html='';


	if ($par['su']=="removefromplace"){
		
			conn_sql_query("DELETE FROM ".ADMANAGE." WHERE id = \"".sqller($par['id'])."\"");
			$oks[]='One banner has been removed from ad place';
	}


	$html.="<a href=\"JavaScript:sbm('addbanner','0','');\" style='line-height:30px;height:30px;'><img src=\"img/bt_add.gif\" alt=\"".$depot['tx']["he_add"]."\" title=\"".$depot['tx']["he_add"]."\" border=0 style='margin-right:15px;margin-bottom:-5px;'> ".$depot['tx']["he_add"]."</a>";

	$name=conn_fetch_row(conn_sql_query("SELECT placename FROM ".ADPLACES." WHERE id = \"".$par['grid']."\""));
	$html.="<h2>".stripslashes($name[0])." / <a href='/gazda/?act=adplaces'>".iho('�� ��������')."</a></h2> ";

	$html.="<table width=100% cellpadding=5><tr>
		<td class=heaad width=35%>".$depot['tx']["he_bannername"]."</td>
		<td class=heaad width=8%>".$depot['tx']["he_type"]."</td>
		<td class=heaad width=5%>".iho('�������')."</td>
		<td class=heaad width=15%>".iho('������')."</td>
		<td class=heaad width=10%>".iho('���� ')."</td>
		<td width=20% class=heaad>".$depot['tx']["he_operations"]."</td>
	</tr>";
	$activ=array('1'=>iho('��������'),'2'=>iho('³���������'));
	$rulerwidth=90;
	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql_t="	
				SELECT	".BANNERS.".*,
						".ADMANAGE.".id AS manid, 
						".ADMANAGE.".percent, 
						".ADMANAGE.".active,
						".ADMANAGE.".usetimer,
						IF (".ADMANAGE.".dfrom <> '0000-00-00 00:00:00', DATE_FORMAT(dfrom,'%H:%i %d.%m.%Y'),0) as start, 
						IF (".ADMANAGE.".dto <> '0000-00-00 00:00:00', DATE_FORMAT(dto,'%H:%i %d.%m.%Y'),0) as end 
				FROM ".ADMANAGE." JOIN ".BANNERS." 
				ON bannerid = ".BANNERS.".id AND placeid = \"".$par['grid']."\"
				";
	
	
	$sql=conn_sql_query($sql_t) or die(conn_error());
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_assoc($sql);
	}

	if (!conn_sql_num_rows($sql)){
		$html.= "<tr><td colspan=5 class=bord style=\"text-align:center !important;\"><br><br><br><br> * * * * * * * * * * * * * * * <br><br><br></td></tr>";
	} else {
		$type=array('1'=>'FILE','2'=>'HTML');
		$currcolor='#FBF2FF';
		foreach ($b as $cat){ 
			
			$timer='------- ';
			if ($cat['start'] && $cat['end']){
				$timer="<b class='tfrom'>{$cat['start']}</b><br><b class='tto'>{$cat['end']}</b>";
			}

			$usebannercolor = ($cat['usetimer']) ? "#CCFF33" : $currcolor;

			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66"; 


			$html.="<tr>
			<td class=bord style=\"background-color:".$currcolor.";\"><a href=\"JavaScript:sbm('editbanner','".$cat['manid']."','')\"  title=\"".$depot['tx']["ti_edit"]."\">".stripslashes($cat['bname'])."</a></td>
			<td class=bord style=\"background-color:".$currcolor.";\"><a href=\"/gazda/viewbanner.php?id={$cat['id']}\" title=\"".iho("�����������")."\" target=\"_blank\"><img src=\"img/bt_images.gif\"></a>&nbsp;".$type[$cat['btype']]."</td>
			<td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['percent'])."%</td>
			<td class=bord style=\"background-color:".$usebannercolor.";\">".$timer."</td>
			<td class=bord style=\"background-color:".$currcolor.";\">".$activ[$cat['active']]."</td>";

			$html.="<td><a href=\"JavaScript:sbm('editbanner','".$cat['manid']."','')\" id=butt class=edit title=\"".$depot['tx']["ti_edit"]."\"></a>";

			$html.="<a href=\"JavaScript:rr('".$cat['manid']."','fromplace')\" style='margin-left:50px;'><img src=\"img/bt_del.gif\" alt=\"".$depot['tx']["ti_delete"]."\" title=\"".$depot['tx']["ti_delete"]."\" border=0></a>";
			$html.="</td></tr>";
		}

	}
	$html.="</table><input type=hidden name=id value=\"\">";
	$html.="</table><input type=hidden name=grid value=\"".$par['grid']."\">";
	return $html;
}


function adplaces_addbanner(){
	global $par, $errors, $oks, $depot;
	$html='';
	$html.="<table width=100% cellpadding=5><tr>
		<td class=heaad width=35%>".$depot['tx']["he_bannername"]."</td>
		<td class=heaad width=15%>".iho('������� ������ "%"')."</td>
		<td width=20% class=heaad>".iho('��������')."</td>
	</tr>";
	$su='savebanner';
	if ($par['su'] == 'editbanner') {
		$curr=conn_fetch_assoc(conn_sql_query("
		
						SELECT * ,
								DATE_FORMAT(dfrom,	'%d.%m.%Y.%H.%i')	AS sd,
								DATE_FORMAT(dto,	'%d.%m.%Y.%H.%i')	AS ed
						FROM ".ADMANAGE." 
						WHERE id = \"".$par['id']."\"
					"));
		foreach ($curr as $k=>$v) $par[$k]=$v;

		list(	$par['day'],
				$par['month'],
				$par['year'],
				$par['hour'],
				$par['min']) = explode(".",$par['sd']);
		list(	$par['day1'],
				$par['month1'],
				$par['year1'],
				$par['hour1'],
				$par['min1']) = explode(".",$par['ed']);


		$su='saveeditbanner';
	}


	$all_banns=conn_sql_query("SELECT id,bname FROM ".BANNERS." ORDER BY bname");
	$bn_pop=array('0','-------------');
	
	while ($res = conn_fetch_assoc($all_banns)){
		$bn_pop[]=$res['id'];
		$bn_pop[]=stripslashes($res['bname']);
	}


	/*FOR TIMER*/
	$timer="";
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
		$month[]=$depot['tx'][$mo_tx[($i-1)]];
	}
	$time=time();
	foreach (array('year','year1','year2') as $v) {
		if (!isset($par[$v])) $par[$v]=date("Y",$time);
		$curryear=date("Y",$time);
		$year=array();
		for ($i=($par[$v]-3);$i<=($curryear+1);$i++){
			$year[]=$i;
			$year[]=$i;
		}
	}

	

	$timer.= bd_chk('usetimer',"1",1,"")."&nbsp;&nbsp;<b>".iho('������')."</b><br><br><b class='tfrom'>".	iho('�������')."</b><br>";
	if (!isset($par['hour'])) $par['hour']=date("H",$time);
	$timer.=bd_popup($hour,	'hour',	'width:50px;',	1,	'')." : ";
	if (!isset($par['min'])) $par['min']=date("i",$time);
	$timer.=bd_popup($min,	'min',	'width:50px',	1,	'')."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	if (!isset($par['day'])) $par['day']=date("d",$time);
	$timer.=bd_popup($day,	'day',	'width:50px',	1,	'')." / ";
	if (!isset($par['month'])) $par['month']=date("m",$time);
	$timer.=bd_popup($month,	'month', 'width:100px',	1,	'')." / ";
	$timer.=bd_popup($year,	'year', 'width:60px',	1,	'')."<br>";
	
	$timer.="<b class='tto'><br>".	iho('ʳ����')."</b><br>";
	if (!isset($par['hour1'])) $par['hour1']=date("H",$time);
	$timer.=bd_popup($hour,	'hour1',	'width:50px;',	1,	'')." : ";
	if (!isset($par['min1'])) $par['min1']=date("i",$time);
	$timer.=bd_popup($min,	'min1',	'width:50px',	1,	'')."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	if (!isset($par['day1'])) $par['day1']=date("d",$time);
	$timer.=bd_popup($day,	'day1',	'width:50px',	1,	'')." / ";
	if (!isset($par['month1'])) $par['month1']=date("m",$time);
	$timer.=bd_popup($month,	'month1', 'width:100px',	1,	'')." / ";
	$timer.=bd_popup($year,	'year1', 'width:60px',	1,	'')."<br>";
	

	$html.="<tr>
				<td class=bord rowspan=3>".bd_popup($bn_pop,"bannerid",'width:400px;','','')."</td>
				<td class=bord>".bd_tf(@$par['percent'],"percent",'text','width:150px;','','')."</td>
				<td class=bord>".bd_popup(array('1',iho('��������'),'2',iho('³���������')),"active",'width:250px;','','')."</td>
			</tr>

			<tr>
				<td colspan=2 style='padding:10px;background:#FBEDBB'>$timer</td>
			</tr>
			<tr>
				<td colspan=2><br><input type=button value=\"".$depot['tx']["bt_proceed"]."\" id='submt' onClick=\"sbm('$su','','')\"></td>
			</tr>
		</table>

		<input type=hidden name=grid value=\"".$par['grid']."\">
		<input type=hidden name=dirid value=\"".$par['dirid']."\">
		<input type=hidden name=id value=\"".$par['id']."\">";

	return $html;

}

function adplaces_savebanner(){
	global $par, $errors, $oks, $depot;
	$html='';
	$addon='';
	if ($par['su'] == 'savebanner'){
		$sql='INSERT INTO '.ADMANAGE." SET ";
	} else {
		$sql='UPDATE '.ADMANAGE." SET ";
		$addon=" WHERE id = \"".$par['id']."\"";
	}
	
	$ddate=	$par['year']."-".$par['month']."-".$par['day']." ".$par['hour'].":".$par['min'].":00";
	$ddate1=	$par['year1']."-".$par['month1']."-".$par['day1']." ".$par['hour1'].":".$par['min1'].":00";


	$sql.=" 
			placeid=\"".	sqller($par['grid'])."\",
			bannerid=\"".	sqller($par['bannerid'])."\",
			percent=\"".	sqller($par['percent'])."\",
			active=\"".		sqller($par['active'])."\",
			dfrom=	\""	.	sqller($ddate)."\",
			dto	=	\""	.	sqller($ddate1)."\",
			usetimer=\"".	sqller(@$par['usetimer'])."\"
			$addon
	
	";



	conn_sql_query($sql) or die(conn_error());
	

	conn_sql_query("
				UPDATE ".ADMANAGE." SET qty = 0 WHERE placeid=\"".	sqller($par['grid'])."\"
	") or die(conn_error());

	if (!conn_error()){
		$oks[]='Record processed ok';
		$par['su']='listbanners';
		return adplaces_viewbanners();
	} else {
		$errors[]='Problem adding/editing record';
		$par['su']='addbanners';
		return adplaces_addbanner();

	}
} 

function adplaces_view(){
	global $par,$b, $depot;
	$html=placesTools();

	$html.="<table width=100% cellpadding=5><tr>
		<td class=heaad width=35%>".iho('������� ����')."</td>
		<td class=heaad width=5%>".iho('���������')."</td>
		<td class=heaad width=5%>".iho('������')."</td>
		<td class=heaad width=35%>".iho('������ ������ �� ��������')."</td>
		<td class=heaad width=5%>".iho('����')."</td>
		<td width=15% class=heaad>***</td>
	</tr>";



	$add_sql='';
	$path="/gazda/?act=bannplaces&su=viewmedia&dirid=".$par['dirid'];
	if (@$par['keyword']) {
		$add_sql=" AND (A1.placename LIKE \"%".sqller($par['keyword'])."%\" OR A1.adid LIKE \"%".sqller($par['keyword'])."%\")";
		$path.="&keyword=".$par['keyword'];
	}

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
				WHERE dirid = ".sqller($par['dirid'])."
				$add_sql
				ORDER BY A1.adid, A1.id
				";

	$sql=conn_sql_query($sql_t) or die(conn_error());
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_assoc($sql);
	}

	if (!conn_sql_num_rows($sql)){
		$html.= "<tr><td colspan=7 class=bord style=\"text-align:center !important;\"><br><br><br><br> * * * * * * * * * * * * * * * <br><br><br></td></tr>";
	} else {

		foreach ($b as $cat){ 

			$currcolor="#CCFF99";
			if ($cat['parentid']) $currcolor="#FFFFCC";
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66"; 


			if (!$cat['bnqty']) $cat['bnqty']='0';
			if (!$cat['langids']) $cat['langids']=iho("******");
			/*if (!$cat['regionis']) $cat['regionis']=iho("******");*/
			if (!$cat['rubrics']) $cat['rubrics']=iho("******");
			if ($cat['parentid']) {
				$check="";
				$marg=30;
			} else {
				$marg=10;
				$check="<input type=checkbox name='mediaid[]' value=\"".$cat['id']."\" class=chkbx >&nbsp;&nbsp;";
			}



				/*SELECT ACTIVE BANNERS*/
			$banners_sql="
					SELECT 
							".BANNERS.".id ,
							".BANNERS.".bname

					FROM 
							".BANNERS.", 
							".ADMANAGE."
					WHERE 
							".BANNERS.".id =  ".ADMANAGE.".bannerid
					AND		".ADMANAGE.".placeid = \"".$cat['id']."\"
					AND		active=1
					AND		(
								(
								".ADMANAGE.".dfrom < NOW()
								AND 
									(
										".ADMANAGE.".dto > NOW() 
										OR 
										".ADMANAGE.".dto =\"0000-00-00 00:00:00\" 
									)
								) OR ".ADMANAGE.".usetimer = 0 
							)";
				
			$banners_sql_run=conn_sql_query($banners_sql);
			$active_banners="";
			$i=1;
			while ($res=conn_fetch_assoc($banners_sql_run)){
				$active_banners.="$i.&nbsp;&rarr;&nbsp;&nbsp;<a href='/gazda/viewbanner.php?id=".$res['id']."' target=\"_blank\">".$res['bname']."</a><br>";
				$i++;
			}

			if (!$active_banners) $active_banners="xxx";

			$html.="<tr>
			<td class=bord style=\"padding-left:".$marg."px;background-color:".$currcolor."; background-image: url(img/ruler.gif);background-position: ".($marg-90)." -3px; background-repeat:no-repeat;\" valign=top>$check<a href='/gazda/?act=adplaces&su=listbanners&grid=".$cat['id']."'  style='font-size:11px;'>".stripslashes($cat['placename'])."</a></td>
			<td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['adid'])."</td>
			<td class=bord style=\"background-color:".$currcolor.";\"><b>".stripslashes($cat['bnqty'])."</b></td>
			<td class=bord style=\"background-color:".$currcolor.";\" id=rem>".$active_banners."</td>
			<td class=bord style=\"background-color:".$currcolor.";\" id=rem>".stripslashes($cat['langids'])."</td>
			

			<td class=bord>";
			
			if (!$cat['parentid']){

				$html.="<a href=\"JavaScript:sbm('edit','".$cat['id']."','')\" id=butt class=edit title=\"".$depot['tx']["ti_edit"]."\"></a>";
				$html.="<a href=\"JavaScript:sbm('addsub','".$cat['id']."','')\" id=butt class=add title=\"".$depot['tx']["ti_add"]."\"></a>";
			} else {
				
				$html.="<a href=\"JavaScript:sbm('editsub','".$cat['id']."','')\" id=butt class=edit title=\"".$depot['tx']["ti_edit"]."\"></a>";
				$html.="<img src='/gazda/img/bt_addi.gif' style='float:left;'>";
			}



			$html.="<a href=\"JavaScript:rr('".$cat['id']."','bannplaces')\" style='margin-left:40px;'><img src=\"img/bt_del.gif\" alt=\"".$depot['tx']["ti_delete"]."\" title=\"".$depot['tx']["ti_delete"]."\" border=0></a>";
				
			$html.="</td></tr>";
		}

	}
	$html.="</table><input type=hidden name=id value=\"\">";
	return $html;
}


function adplaces_add(){
	global $par, $errors, $oks, $depot;
	$html='';
	$ly=1;
	if (!@$par['sudir']){

		$html.= "<table width=100%><tr><td rowspan=2 valign=top><br>".$depot['tx']["in_adding"]."<br></td><td width=50 rowspan=2>&nbsp;</td><td>";
		$html.= "<TEXTAREA style='width:640px;height:200px;' name=list></textarea></td></tr><tr><td class=haader>
		<br><input type=button value=\"".iho('������')."\"  id=submt onClick=\"sbm('','','proceed')\"></td></tr></table>";


	} else if ($par['sudir']=="proceed"){
		$allo=explode("\n",$par['list']);


		$html.="<h3><br>".iho('! ID ���������� ������� ���� ������ "candyplace_"+ ���������')."<br></h3>";
		$html.= "<table width=\"100%\"><tr><td width=\"20%\" class=heaad>".$depot['tx']['he_titlename']."</td>";
		$html.= "<td class=heaad width=\"10%\">".$depot['tx']['he_param']."</td>";
		$html.= "<td class=heaad width=\"30%\">".iho("³���������� ��� ����������")."</td>";
		$html.= "<td class=heaad width=\"30%\">".iho("����������� ��� ����������")."</td></tr>";
		$i=0;

		foreach ($allo as $k=>$v){
			if (!trim($v)) continue;
			$html.= "<tr><td class=tdrow><INPUT type=text name=modname".$i." style=\"width:240px;\" value=\"".htmlspecialchars($v)."\"></td>";
			$html.= "<td  class=tdrow><INPUT type=text name=idword".$i." style=\"width:80px;\"></td>";
			$html.= "<td  class=tdrow>".
				bd_tar(@$par['holdstart'.$i],'holdstart'.$i,'300px','50px','','')."</td>";
			$html.= "<td  class=tdrow>".
				bd_tar(@$par['holdend'.$i],'holdend'.$i,'300px','50px','','')."</td></tr>";


			$i++;
		}
		$html.="<input type=hidden name=list value='".$par['list']."'>";
		$html.= "</table><br><input type=button value=\"".$depot['tx']["bt_proceed"]."\" id='submt' onClick=\"sbm('','','gosave')\"><input type=hidden name=qty value=\"$i\">";
	} else if  ($par['sudir']=="gosave"){

		$dd=0;


		for ($i=0;$i<$par['qty'];$i++){
			/*-----------------*/
			$ison=conn_fetch_row(conn_sql_query("SELECT * FROM ".ADPLACES." WHERE adid=\"".sqller($par["idword$i"])."\""));
			if ($ison[0]){
				$errors[]="Parameter adid for ".sqller($par["modname$i"])." duplicates one in DB. It should be unique";
			}
		}

		if ($errors) {
			$par['sudir']="proceed";
			return adplaces_add();
		}
		$q21='';
		for ($i=0;$i<$par['qty'];$i++){
			$dd++;
			
			$q21=conn_sql_query("INSERT INTO ".ADPLACES." SET 
			placename=\"".sqller($par["modname$i"])."\",
			adid=\"".	sqller($par["idword$i"])."\",
			dirid=\"".sqller($par["dirid"])."\",
			holdend=\"".	sqller($par["holdend$i"])."\",
			holdstart=\"".	sqller($par["holdstart$i"])."\",
			parentid=0");

			
		}
		if (conn_affected_rows($q21)) {
			$oks[]=$dd." ".$depot['tx']["ok_recordsadded"]; 
			return adplaces_view();
		}
		else {
			$errors[]=$depot['tx']["al_recordsadded"];

					
		}
		
	}
	$html.= "
					<input type=hidden name=id value=\"".$par['id']."\">
		";
	return $html;

}


function adplaces_edit(){
	global $par, $errors, $oks, $depot;
	$html='';
	
	if ($par['su']=="edit"){
		$html.="<h3><br>".iho('! ID ���������� ������� ���� ������ "candyplace_"+ ���������')."<br></h3>";

		$record=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".ADPLACES." WHERE id =\"".$par['id']."\""));

		$html.= "<table width=\"100%\"><tr><td width=\"20%\" class=heaad>".$depot['tx']['he_titlename']."</td>";
		$html.= "<td class=heaad width=\"10%\">".$depot['tx']['he_param']."</td>";
		$html.= "<td class=heaad width=\"30%\">".iho("³���������� ��� ����������")."</td>";
		$html.= "<td class=heaad width=\"30%\">".iho("����������� ��� ����������")."</td></tr>";

		$html.= "<tr><td class=tdrow><INPUT type=text name=placename style=\"width:240px;\" value=\"".htmlspecialchars($record['placename'])."\"></td>";
		$html.= "<td  class=tdrow><INPUT type=text name=adid style=\"width:80px;\" value=\"".htmlspecialchars($record['adid'])."\"></td>";
		$par['holdstart']=$record['holdstart'];
		$par['holdend']=$record['holdend'];
		$html.= "<td  class=tdrow>".
				bd_tar(@$par['holdstart'],'holdstart','300px','50px','','')."</td>";
		$html.= "<td  class=tdrow>".
				bd_tar(@$par['holdend'],'holdend','300px','50px','','')."</td></tr>";

		$html.="<input type=hidden name=id value='".$record['id']."'>";
		$html.= "</table><br><input type=button value=\"".$depot['tx']["bt_proceed"]."\" id='submt' onClick=\"sbm('saveedit','','')\">";
	} else if  ($par['su']=="saveedit"){
		$re="
						UPDATE ".ADPLACES." SET 
						placename=\"".sqller($par["placename"])."\",
						adid=\"".	sqller($par["adid"])."\",
						holdend=\"".	sqller($par["holdend"])."\",
						holdstart=\"".	sqller($par["holdstart"])."\"
						WHERE id = \"".$par['id']."\"
						";
		$q21=conn_sql_query($re) or die(conn_error());

		if (conn_affected_rows($q21)) {
			$oks[]=$depot['tx']["ok_edited"]; 
			return adplaces_view();
		}

		else {
			$errors[]=$depot['tx']["al_edited"];		
		}
	}
	return $html;

}

function adplaces_addsub(){
	global $par, $errors, $oks, $depot, $lngs;
	$html='';
	
	if ($par['su']=="addsub" || $par['su']=="editsub"){	
		$record=conn_fetch_assoc(conn_sql_query("
						SELECT * 
						FROM ".ADPLACES." 
						WHERE id =\"".$par['id']."\"
				"));

		$html.="<h3><br>".iho('������ ���� ���������� ���� "'.$record['adid'].'"')."<br></h3>";
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

		$html.= "<table width=\"100%\"><tr><td width=\"50%\" class=heaad>".$depot['tx']['he_titlename']."</td>";
		$html.= "<td class=heaad width=\"20%\">".iho('������ ������')."</td>";
		$html.= "<td class=heaad width=\"20%\">".iho('�������')."</td>";
		$html.="</tr>";
		if ($par['su']=="addsub")
			$html.= "<tr><td class=tdrow><INPUT type=text name=placename style=\"width:300px;\" value=\"".htmlspecialchars($record['placename'])." (".iho('����').")\"></td>";
		else $html.="<tr><td class=tdrow>".bd_tf(@$par['placename'],'placename','text','width:300px;','','')."</td>";


		$html.= "<td  class=tdrow>".bd_popup($l,'langfilter','width:150px;',1,'onChange = "chng_lang(\''.$par['su'].'\')"')."</td>";


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
					case '1'	:	$rubs[]=$res['0'];$rubs[]=$res['1'];break;
					case '2'	:	$tems[]=$res['0'];$tems[]=$res['1'];break;
				}
			}

			$regions = bd_multipopup($regs,'region','height:128px;width:99%',3,'');
			$rubrics= bd_multipopup($rubs,'rubric','height:128px;width:99%',3,'');

		} else {
			$rubrics = iho ('������ ����');
		}
		$html.= "
				<td  class=tdrow>".$rubrics."</td>
				<input type=hidden name=id value='".$record['id']."'>
				</table><br><input type=button value=\"".$depot['tx']["bt_proceed"]."\" id='submt' onClick=\"sbm('save".$par['su']."','','')\">";
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
									(adid,dirid,placename,parentid,lang,region,rubric)
									SELECT	adid,
											dirid,
									\"".sqller($par['placename'])."\",
									\"".$par['id']."\",
									\"".$par['langfilter']."\",
									\"".$e_region."\",
									\"".$e_rubric."\" 
									FROM ".ADPLACES." AS C1 WHERE id = \"".$par['id']."\"";

	

					$q21=conn_sql_query($re) or die(conn_error());

					if (conn_affected_rows($q21)) {
						$oks[]='1'.$depot['tx']["ok_recordsadded"]; 
						$par['su']='v';
						return adplaces_view();
					}

					else {
						$errors[]=$depot['tx']["al_al"];		
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
						$oks[]=$depot['tx']["ok_edited"]; 
						$par['su']='v';
						return adplaces_view();
					}

					else {
						$errors[]=$depot['tx']["al_edited"];		
					}		
		}
	}
	return $html;

}


function adplaces_del(){
	global $par,$depot;
	$html='';
	if (!isset($par['grid'])){

		$ispar = conn_fetch_assoc(conn_sql_query("SELECT * FROM ".ADPLACES." WHERE id = \"".$par['id']."\""));
		if ($ispar['parentid']) {
            $res_ = conn_sql_query("DELETE FROM ".ADPLACES." WHERE id = \"".$par['id']."\"");
			if (conn_affected_rows($res_)) {
				conn_sql_query("DELETE FROM ".ADMANAGE." WHERE placeid = \"".$par['id']."\"");
				array_unshift($depot['oks'],$depot['tx']['ok_del1']);
			} else {
				array_unshift($errors,$depot['tx']['al_norecs']."<br><br>");
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
				array_unshift($depot['oks'],$depot['tx']['ok_del1']);
			} else {
				array_unshift($depot['errors'],$depot['tx']['al_norecs']."<br><br>");
			}


		}
		$html.=adplaces_view();
	} else {
		conn_sql_query("DELETE FROM ".ADMANAGE." WHERE id = \"".$par['id']."\"") or die(conn_error());
		return adplaces_viewbanners();
	}
	return $html;
}



function placesTools(){
	global  $par,$b2, $depot, $enviro,$depot, $allangs,$depot,$HTTP_POST_FILES;
	$vis="display:none;";
	
	$num_colls=8;

	$DB=$depot['currt']['dbname'][$par['type']];
	$curr_sql="SELECT name_".$allangs[0]." FROM ".CTREE." WHERE id=\"".$par['dirid']."\"";
	$curr_type=conn_fetch_row(conn_sql_query($curr_sql));
	
	$html="<h2 style='padding:5px;background:#CCFF66;display:inline;'>".getfromdb($curr_type[0],$allangs[0])."</h2>";
	
	/*$html.="<a href=\"JavaScript:add_newitem('".$par['type']."','uploadmedia','additem','');\" style='margin-top:5px;float:left;' class='addsome'><span> ".iho('������  ����')."</span></a>";*/
	$html.="<a href=\"JavaScript:sbm('add','0','');\" style='line-height:30px;height:30px;margin-left:20px;'><img src=\"img/bt_add.gif\" alt=\"".$depot['tx']["he_addadplaces"]."\" title=\"".$depot['tx']["he_addadplaces"]."\" border=0 style='margin-right:15px;margin-bottom:-5px;'> ".$depot['tx']["he_addadplaces"]."</a>";

	/*$html.="<a href=\"JavaScript:dlm();\" style='float:right;margin-top:-30px;'><img src=\"img/bt_del.gif\" alt=\"".iho('�������� ������')."\" title=\"".iho('�������� ������')."\" border=0> ".iho('�������� ������')."</a>";*/

	$html.="<div style='clear:both;width:100%;'></div><div class='quick1' style='background:#FFDE93;'><table width=100%><tr><td width=60% valign=top>";

	$datas = getCategories(CTREE,$depot['currt']['dbstate'][$par['type']],0);

	$html.="<a href=\"JavaScript:sbm('exchange','','');\" style='margin-bottom:10px;display:block;'><img src=\"img/bt_exchange.gif\" alt=\"".iho("��������� ������")."\" title=\"".iho("��������� ������")."\" border=0> ".iho('��������� ������')."</a>";

	$par['typeid']=$par['dirid'];
	$html.=bd_popup($datas,'typeid','width:200px;border:#CC0000 solid 1px;',0,'');
	$html.="</td>";

	$html.="<td align=right width=40%>".iho('������ �� �������� ������')."<br>";
	$html.=bd_tf(@$par['keyword'],'keyword','text','width:200px','','')."<input type=submit name=srch value='".iho('������')."' id=sbmt><br>";
	if (@$par['findall']) $checked='checked'; else $checked='';
	$html.="<input type=checkbox name=findall value=1 $checked>&nbsp;&nbsp;".iho("������ � ��� ������");

	$html.="</td>";
	$html.="</tr></table></div>";

	return $html;
}


/*#########################################################################################################################*/


function media_items_exchange(){
	global  $par,$b, $depot, $enviro,$depot, $depot,$errros, $oks;

	$html='';
	$r=0;

	if (!count(@$par['mediaid'])){
		$errors[]=iho("�� ������� ������� �����");
	}

	if (!$par['typeid']){
		$errors[]=iho("�� ������� �����");
	}

	if (@$errors) return banners_view();

	foreach ($par['mediaid'] as $v){
		$sql="
					UPDATE ".ADPLACES." 
					SET 
					dirid = \"".conn_real_escape_string($par['typeid'])."\" 
					WHERE 
					id=\"".$v."\"
					OR
					parentid=\"".$v."\"
					";
		conn_sql_query($sql);


		$r++;
	}

	$oks[]=iho("$r �������� ����������");
	$par['su']="viewmedia";
	return adplaces_view();
	
}


/*#########################################################################################################################*/



?>
