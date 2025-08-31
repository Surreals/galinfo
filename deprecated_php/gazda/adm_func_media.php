<?

global $a2,$b2,$p,$previndex,$allangs;
//$js="js_lang";



/*#########################################################################################################################*/




function aget_center(){

		global  $par,$depot, $allangs,$depot;
		$html=pic_js();
		if (!isset($par['type'])) $par['type']='video';
		$depot['currt']=array(
			
								'header'	=>array (
													'video'		=>	iho("³���"),
													'audio'		=>	iho("����"),
													'banners'	=>	iho("������"),
													'bannplaces'	=>	iho("������ ����"),
													),
								'dbstate'	=>array (
													'video'		=>	1,
													'audio'		=>	2,
													'banners'	=>	3,
													'bannplaces'=>	4
													),
								'dbname'	=>array (
													'video'		=>	MEDIA,
													'audio'		=>	MEDIA,
													'banners'	=>	BANNERS,
													'bannplaces'=>	BANNERS
													),
								'color1'	=>array (
													'video'		=>	'#00CC00',
													'audio'		=>	'#FF9900',
													'banners'	=>	'#9966FF',
													'bannplaces'=>	'#FF9900'
													),

		);

		$html.= "<h1 class='fixed'>".$depot['currt']['header'][$par['type']]."</h1><hr><form name='ad' method=post enctype=\"multipart/form-data\" >";
		

		$langsql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
		for ($i=0;$i<conn_sql_num_rows($langsql);$i++){
			$rs=conn_fetch_assoc($langsql);
			$allangs[]=$rs['lang'];

		}

		/*

		foreach ($par as $k=>$v)  echo $k."====>".$v."<br>";*/
		

		if (!isset($par['su'])) $par['su']='v';
		switch ($par['su']){
			case "v": 
			case "moveup":
			case "changeenviro":
			case "movedown":	$html.= media_view();break;
			case "savetype":	$html.= media_savetype();break;
			case "remove":		$html.= media_del();break;
			case "chng" :		$html.=media_change();break;

			default		:		$html.= getSubAction();
								break;

		}

		
		$html.= "</form>";
		return $html;

}


function getSubAction(){
	global $par;
	require_once("adm_func_prodhelpers.php");

	if (!isset($par['dirid']))$par['dirid']=@$par['id'];
	switch	($par['type']){
		case "banners" :	require_once("adm_func_banners_fnc.php");		break;
		case "bannplaces" : require_once("adm_func_adplaces_fnc.php");	break;
		default : require_once("adm_func_mediaitems.php"); break;
	}
	

	return get_module_result();
}



/*#########################################################################################################################*/

function media_view(){
	global $par,$b2, $tx, $enviro,$allangs,$depot;
	$html='';
	$html.="<a href=\"JavaScript:add_newitem('".$depot['currt']['dbstate'][$par['type']]."','commontree','additem','block');\" style='float:right;margin-top:-35px;position:relative;' class='addsome'><span> ".iho('������ �����')."</span></a>";

	$html.="<ul class='dropselect'>
				<li id = 'additem_tbody'>
							<span id='additem' name='additem'></span>
				</li>

		";
	$rulerwidth=90;

	$lngs2=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".LANG." ORDER BY id LIMIT 1"));

	if ($par['su'] == "moveup" || $par['su'] == "movedown"){
		move_record();
	}

	/*PISDJETS*/
	$order=	array(
		
				'db'	=>	CTREE,
				'orderby'	=>	'orderid',
				'cond'	=>	'AND `type`="'.$depot['currt']['dbstate'][$par['type']].'"',
				'node'	=>0,
				'limitlevel'=>0
	);
	order_uni($order); 

	if (!count($depot['b_uni'])){
		$html.= "<h2> No Items</h2>";
	} else {
		$currentLevel=1;
		$currentParent='0';

		/*foreach ($b2 as $cat){*/ 
		for ($i=0;$i<count($depot['b_uni']);$i++){
			
			$cat=$depot['b_uni'][$i];

			/*$currcolor=$colors[1];
			if (isset($par['id']) && ($par['id'] == $cat['kid'])) $currcolor="#FFFF66";*/ 
			
			$class='closed';							
			if($currentLevel<$cat['level']){

				$html.="<li id='branch".$currentParent."' style='display:none;'><ul>";
			}
			else if ($currentLevel>$cat['level']){

				$qty=$currentLevel-$cat['level'];

				while($qty>0){

					$html.="</ul></li>";
					$qty--;
				}
			}

			if(!isset($depot['b_uni'][($i+1)]) ||  $depot['b_uni'][($i+1)]['level']<=$cat['level']) $class='opened'; 
			
			$html.="
			
				<li class='astree' style=\"padding-left:".(($cat['level']-1)*20+10)."px;background-position:".(($cat['level']-1)*20-80)."px -3px;border-bottom:#EEE solid 1px;width:700px;\" >";
			
			$html.="<span class='galleryTools'><a href=\"JavaScript:sbm('moveup','".$cat['kwd']."','')\"><img src=\"img/bt_up.gif\" alt=\"".$depot['tx']["ti_moveup"]."\" title=\"".$depot['tx']["ti_moveup"]."\" border=0></a>";

			$html.="<a href=\"JavaScript:sbm('movedown','".$cat['id']."','')\"><img src=\"img/bt_down.gif\" alt=\"".$depot['tx']["ti_movedown"]."\" title=\"".$depot['tx']["ti_movedown"]."\" border=0></a>";

			$html.="<a href=\"JavaScript:add_newitem('".$depot['currt']['dbstate'][$par['type']]."','commontree','additem_".$cat['id']."','block')\"><img src=\"img/bt_edit.gif\" alt=\"".$depot['tx']["ti_edit"]."\" title=\"".$depot['tx']["ti_edit"]."\" border=0></a>";

			$html.="<a href=\"JavaScript:rr('".$cat['id']."')\"><img src=\"img/bt_del.gif\" alt=\"".$depot['tx']["ti_delete"]."\" title=\"".$depot['tx']["ti_delete"]."\" border=0></a>";
			
			if ($cat["isvisible"]) {
				$html.="<a href=\"JavaScript:sbm('chng','".$cat['id']."','')\"><img src=\"img/bt_act.gif\" alt=\"".$depot['tx']["ti_changestatus"]."\" title=\"".$depot['tx']["ti_changestatus"]."\" border=0></a>";
			} else {
				$html.="<a href=\"JavaScript:sbm('chng','".$cat['id']."','')\"><img src=\"img/bt_deact.gif\" alt=\"".$depot['tx']["ti_changestatus"]."\" title=\"".$depot['tx']["ti_changestatus"]."\" border=0></a>";
			}

					

			$html.="	</span>";


			
			
			$html.="
					<a href='' class='$class' onclick='return expandBranch(\"branch".$cat['id']."\",this);'></a><a href=\"\" 
					onClick =\"sbm('viewmedia','".$cat['id']."',''); return false;\">".getfromdb(stripslashes($cat['name_'.$allangs[0]]),$allangs[0])."
					</a></li>
				";


			
				
				
			$html.="	<li id = 'additem_".$cat['id']."_tbody' style='display:none;clear:both;'>
							<div id='additem_".$cat['id']."' name='additem_".$cat['id']."'></div>
					</li>	
			
			


				";

			/*$html.="
			
				<li class='astree' style=\"padding-left:".(($cat['level']-1)*20+10)."px;background-position:".(($cat['level']-1)*20-80)."px -3px;\" >
					<a href='' class='$class' onclick='return expandBranch(\"branch".$cat['id']."\",this);'></a><a href=\"\" onClick=\"JavaScript:sbm('viewimages','".$cat['id']."','')\"'>".getfromdb(stripslashes($cat['name_'.$allangs[0]]),$allangs[0])."
					</a>
					
				</li>
				
				
				"; */
			
			
			$currentLevel= $cat['level'];
			$currentParent=$cat['id'];
		}

		}
	
	
	$html.="</ul></div>";

	$html.=  "
					<input type=hidden name=act value=\"".$par['act']."\">
					<input type=hidden name=su value=\"\">
					<input type=hidden name=arrayname value=\"\">
					<input type=hidden name=id value=\"\">
					<input type=hidden name=par value=\"\">
					<input type=hidden name='openbranch' value='".@$par['openbranch']."'>
					";
	return $html;
}


/*#########################################################################################################################*/




function media_savetype(){
	global $tx, $par,  $depot;
	$html="";
	
	$given_arr=explode("_",$par['arrayname']);

	$sql=conn_sql_query("SELECT * FROM ".LANG."");
	if (count($given_arr) == 2){
		$order=conn_fetch_row(conn_sql_query("SELECT MAX(orderid) FROM ".CTREE));
		$sql1="
					INSERT INTO ".CTREE." SET 
					orderid=\"".($order[0]+1)."\",
					kwd = \"".conn_real_escape_string(stripslashes($par['kwd']))."\",
		";
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
				$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
				$val=puttodb($par['name_'.$res['lang']],$res['lang']);
				$sql1.='name_'.$res['lang'].' = "'.$val.'",';
		}

		if ($par['parentword'] == "0"){
			$level=1;
		} else {
			$the_lev=conn_fetch_assoc(
								conn_sql_query("
											SELECT * FROM ".CTREE." 
											WHERE id=\"".$par['parentword']."\"
											AND `type`=\"".sqller($depot['currt']['dbstate'][$par['type']])."\""
					));
			if (!is_array($the_lev)) return "ERROR";
			$level=$the_lev['level']+1;
		}

		$sql1.=" level=\"".$level."\",";
		$sql1.=" type=\"".sqller($depot['currt']['dbstate'][$par['type']])."\",";
		$sql1.=" parentword=\"".sqller($par['parentword'])."\"";


        $res_ = conn_sql_query($sql1);
		if (conn_error()){
			$depot['errors'][]= conn_error();
			return media_view();
		}
		if (conn_affected_rows($res_)>0){
			$depot['oks'][]=iho("���� ����� ������.");
		}
		return media_view();
	} else {
		$sql1="UPDATE ".CTREE." SET ";
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
				$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
				$val=puttodb($par['name_'.$res['lang']],$res['lang']);
				$sql1.='name_'.$res['lang'].' = "'.$val.'",';
		}
		$sql1=substr($sql1,0,-1)." WHERE id=\"".$given_arr[1]."\"";

        $res_ = conn_sql_query($sql1) or die(conn_error()."<br>".$sql1);
		if (conn_affected_rows($res_)>0){
			$vars['oks'][]=iho("���� ����� ����������.");
		}
		return media_view();
	}

}



/*#########################################################################################################################*/




function media_del(){
	global  $par,$depot,$tx,$depot,$depot;
	$html='';

	$sql_pre= "SELECT * FROM ".CTREE." WHERE id = \"".$par['id']."\"" ;
	$current = conn_fetch_assoc(conn_sql_query($sql_pre));



	$order=	array(
		
				'db'	=>	CTREE,
				'orderby'	=>	'orderid',
				'cond'	=>	'AND `type`="'.$depot['currt']['dbstate'][$par['type']].'"',
				'node'	=>$par['id'],
				'limitlevel'=>$current['level']
	);
	order_uni($order);
	$ids=array($par['id']);

	if (count($depot['b_uni']))	{
		foreach ($depot['b_uni'] as $cat){
			$ids[]=$cat['id'];
		}
	}

	/* echo implode('|||',$ids);*/


    $res_ = conn_sql_query("DELETE FROM ".CTREE." WHERE id IN(".implode(',',$ids).")");


	if (conn_affected_rows($res_)) {
		array_unshift($depot['oks'],$depot['tx']['ok_deln'].conn_affected_rows($res_));
	} else {
		array_unshift($depot['errors'],$depot['tx']['al_norecs']."<br><br>");
	}

	unset($depot['b_unia_uni']);

	  
	$html.=media_view();
	return $html;
}




/*#########################################################################################################################*/




function move_record_old(){
	global  $par,$depot,  $tx,$depot;

	$thegroup=conn_fetch_row(conn_sql_query("SELECT parentword FROM ".PICTYPE." WHERE kwd = \"".$par['id']."\""));

	$sql=conn_sql_query("SELECT * FROM ".PICTYPE." WHERE parentword = \"".$thegroup[0]."\" ORDER BY orderid");
	$same_home=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$same_home[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	$j=0;
	foreach($same_home as $radio){
		if ($radio["kwd"] == $par["id"]){
			break;
		}
		$j++;
	}

	if ($par['su']=="moveup"){
		if (!isset($same_home[($j-1)])){
			$depot['errors'][]=$depot['tx']['al_topbranch'];
			return;
		}
		$old=$same_home[($j-1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["name_".$par['lng']],$depot['tx']["ok_movedup"]);
			
	
	} else if ($par['su']=="movedown"){
	
		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$depot['tx']['al_lowbranch'];
			return;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["name_".$par['lng']],$depot['tx']["ok_moveddown"]);

	} else {
		return;
	}
	
	conn_sql_query("UPDATE ".PICTYPE." SET orderid=0 WHERE kwd=\"".$old["kwd"]."\"");
	conn_sql_query("UPDATE ".PICTYPE." SET orderid=\"".$old["orderid"]."\" WHERE kwd=\"".$new["kwd"]."\"");
	conn_sql_query("UPDATE ".PICTYPE." SET orderid=\"".$new["orderid"]."\" WHERE kwd=\"".$old["kwd"]."\"");
	return;
}




function move_record(){
	global  $par,$depot,$tx, $depot;

	$thegroup=conn_fetch_row(conn_sql_query("SELECT parentword FROM ".CTREE." WHERE id = \"".$par['id']."\" AND `type`=\"".sqller($depot['currt']['dbstate'][$par['type']])."\""));

	$sql=conn_sql_query("SELECT * FROM ".CTREE." WHERE parentword = \"".$thegroup[0]."\" AND `type`=\"".sqller($depot['currt']['dbstate'][$par['type']])."\" ORDER BY orderid");
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
			$depot['errors'][]=$depot['tx']['al_topbranch'];
			return;
		}
		$old=$same_home[($j-1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["name_".$par['lng']],$depot['tx']["ok_movedup"]);
			
	
	} else if ($par['su']=="movedown"){
	
		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$depot['tx']['al_lowbranch'];
			return;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["name_".$par['lng']],$depot['tx']["ok_moveddown"]);

	} else {
		return;
	}
	
	conn_sql_query("UPDATE ".CTREE." SET orderid=0 WHERE kwd=\"".$old["id"]."\"");
	conn_sql_query("UPDATE ".CTREE." SET orderid=\"".$old["orderid"]."\" WHERE id=\"".$new["id"]."\"");
	conn_sql_query("UPDATE ".CTREE." SET orderid=\"".$new["orderid"]."\" WHERE id=\"".$old["id"]."\"");
	return;
}

/*#########################################################################################################################*/





function media_change(){
	global  $par,$depot, $b, $tx;
	$html='';

    $res_ = conn_sql_query("UPDATE ".CTREE." SET isvisible=MOD((isvisible+1),2) WHERE id=\"".$par['id']."\"") or die(conn_error());
	if (conn_affected_rows($res_)) {
		$depot['oks'][]=$depot['tx']["ok_activated"];
	} else {
		$depot['errors'][]=$depot['tx']["al_chng"];
	}
	$html.=media_view();
	return $html;
}


/*#########################################################################################################################*/




function pic_js(){
	global $ctime;
$r=<<<JSCR

 <script language="javaScript">

		  <!--
			
			function add_newitem(pattidvar,ttype,container,visibility){
				var tbd = document.getElementById ? document.getElementById(container+'_tbody') : null;
				//window.alert(pattidvar+'___tbody');
				tbd.style.display=visibility;
				
				var obj = document.getElementById ? document.getElementById(container) : null;
				var objScript = document.getElementById ? document.getElementById("updscript") : null;
				obj.innerHTML ="<span style='text-align:center;'><img src=\"/gazda/img/clock.gif\"></span>";
				objScript.src = "/gazda/adm_get_list.php?pattidvar="+container+"_"+pattidvar+"&upd="+ttype+"&timest="+Math.random(); 

				
			}

			function add_type1(pattidvar,ttype){
				var tbd = document.getElementById ? document.getElementById('addimage___tbody') : null;
				tbd.style.display='';
				var obj = document.getElementById ? document.getElementById('addimage') : null;
				var objScript = document.getElementById ? document.getElementById("updscript") : null;
				obj.innerHTML ="<div style='text-align:center;'><img src=\"img/clock.gif\"></div>";
				objScript.src = "/gazda/adm_get_list.php?pattidvar="+pattidvar+"&upd="+ttype+"&timest="+Math.random();

				
			}

		function setvalue(name,value){
				var obj = document.getElementById ? document.getElementById(name) : null;
				obj.innerHTML = value;
		}
		  

		function savetype(pattidvar,suvalue){
			
			var obj = document.getElementById ? document.getElementById(pattidvar) : null;

			document.forms['ad'].su.value=suvalue;
			document.forms['ad'].arrayname.value=pattidvar;
			document.forms['ad'].submit();
			obj.innerHTML ="<img src=\"img/clock.gif\">";

			
		}

		function savetype1(pattidvar,suvalue){
			
			var obj = document.getElementById ? document.getElementById('addimage') : null;
			document.forms['ad'].su.value=suvalue;
			document.forms['ad'].arrayname.value=pattidvar;
			document.forms['ad'].submit();
			obj.innerHTML ="<img src=\"img/clock.gif\">";

			
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




/*#########################################################################################################################*/



?>
