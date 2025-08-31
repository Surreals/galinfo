<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){

	global $par,$depot,$oks, $tx,$lngs;
	$html=pollres_js();
	$lang_pars=array_keys($lngs);
	if (!isset($par['lang']) || !isset($lngs[$par['lang']][0])) $par['lang']=$lang_pars[0];


	$html.= "<h1>".iho('Редагування голосування')."</h1><hr><form name='ad' method=post>";
	if (!isset($par['su']) || ($par['su']=='')) $par['su']='view';
	switch ($par['su']){
		case "view":
		case "moveup":
		case "movedown":
		case "savelex":$html.= pollres_view();break;
		case "save": $html.= pollres_save();break;
		//case "edit": $html.= pollres_edit();break;
		case "remove": $html.= pollres_del();break;
		case "chng" : $html.=pollres_change();break;
	}

	$html.="<input type=hidden name='pollid' value='".$par['pollid']."'>";
	$html.="<input type=hidden name='act' value='".$par['act']."'>";

	$html.= "</form>";
	return $html;

}




function pollres_view(){
	global $par,$b, $tx, $depot, $lngs;
	$html='';

	if ($par['su'] == "moveup" || $par['su'] == "movedown"){
		move_record();
	}



	/*$html.="<a href='' onClick='sbm(\"add\",\"\",\"\"); return false;'><img src='/adm/img/bt_add.gif' style='margin-right:15px;margin-bottom:-5px;'>".iho('������')."</a>";*/
	$cu_poll=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".POLL." WHERE id = \"".sqller($par['pollid'])."\""));
	$par['subject'] = $cu_poll['subject'];
	$par['projectid'] = $cu_poll['projectid'];

	$html.="<br>
			<table width=100% cellpadding=5 cellspacing=1>
				<tr>
					<td width=80%>".iho('Тема голосування')."</td>
					<td>".bd_tf(@$par['subject'],'subject','text','width:600px;','','')."</td>
				</tr>

				
			</table>
			<br>
			<br>";
	$html.="<table width=100% cellpadding=0 cellspacing=1><tr><td class=heaad width=60%>".iho('Варіанти відповідей')."</td><td width=20% class=heaad>".iho("Кількість голосів")."</td><td width=20% class=heaad>".$tx["he_operations"]."</td></tr>";

	$rulerwidth=90;

	$colors=array("#FFE8E8","#F9FAFF","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql=conn_sql_query("SELECT * FROM ".POLLRES." WHERE poll_id=\"".$par['pollid']."\" ORDER BY orderid");
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}


	if (!conn_sql_num_rows($sql)){
		$html.= "<tr><td colspan=5 class=bord style=\"text-align:center !important;\"> * * * * * * * * * * * * * * * </td></tr>";
	} else {
		$qty=0;
		foreach ($b as $cat){
			$qty++;
			$currcolor=$colors[1];
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66";

			$html.="<tr><td class=bord style=\"padding-left:10px;background-color:".$currcolor."; background-image: url(img/ruler.gif);background-position: -80px -3px; background-repeat:no-repeat;\"><input type=text name=variant_".$cat['id']." style='width:550px;' value=\"".htmlspecialchars(stripslashes($cat['variant']))."\"><input type=hidden name='theid[]' value='".$cat['id']."'></td><td class=bord><input type=text name=qty_".$cat['id']." style='width:80px;' value=\"".htmlspecialchars(stripslashes($cat['qty']))."\"></td>";



			$html.="<td class=bord><a href=\"JavaScript:sbm('moveup','".$cat['id']."','')\"  title=\"".$tx["ti_moveup"]."\" id=butt class=up></a>";

			$html.="<a href=\"JavaScript:sbm('movedown','".$cat['id']."','')\"  title=\"".$tx["ti_movedown"]."\" id=butt class=down></a>";


			$html.="<a href=\"JavaScript:rr('".$cat['id']."')\" id=butt class=del title=\"".$tx["ti_delete"]."\" style='float:right;'></a>";

			$html.="</td></tr>";


		}

		$html.="<tr><td colspan=3 class=bord>".iho("<br><br>Додати варіант відповіді")."</td></tr>";
		$html.="<tr><td class=bord style=\"padding-left:10px;background-color:".$currcolor."; background-image: url(img/ruler.gif);background-position: -80px -3px; background-repeat:no-repeat;\"><input type=text name=variant_new style='width:550px;' value=\"\"></td><td class=bord><input type=text name=qty_new style='width:80px;' value=\"0\"></td>";
		$html.="<td class=bord>&nbsp;</td></tr>";

	}
	$html.="</table>";
	$html.="<br><input type=button value=\"".iho("ЗБЕРЕГТИ")."\"  id=submt onClick=\"sbm('save','','')\">";
	$html.="<div name='langlex' id='langlex'></div>";
	$html.=  "<input type=hidden name=su value=\"view\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"\">";
	return $html;
}


function pollres_save(){
	global $par, $depot, $oks, $tx,$lngs;
	$html='';

	/*UPDATE HEADER*/
	conn_sql_query("
				UPDATE ".POLL." 
				SET 
				subject = \"".sqller($par['subject'])."\", 
				projectid = \"".sqller(@$par['projectid'])."\"
				WHERE id = \"".sqller($par['pollid'])."\"");

	/*UPDATE CURRENT*/
	foreach ($par['theid'] as $k){
		conn_sql_query("UPDATE ".POLLRES." SET 
			variant=\"".sqller($par['variant_'.$k])."\",
			qty=\"".sqller($par['qty_'.$k])."\"
			WHERE id = \"".sqller($k)."\"
		");
	}

	/*ADD NEW*/
	if (trim($par['variant_new'])){

		$get_last = conn_fetch_row(conn_sql_query("SELECT orderid FROM ".POLLRES." WHERE poll_id = \"".sqller($par['pollid'])."\" ORDER by orderid DESC LIMIT 1" ));

		conn_sql_query("INSERT INTO ".POLLRES." SET
			variant=\"".sqller($par['variant_new'])."\",
			qty=\"".sqller($par['qty_new'])."\",
			poll_id=\"".sqller($par['pollid'])."\",
			orderid=\"".($get_last[0]+1)."\"
		") or die(conn_error());
	}

	$depot['oks'][]=iho("Зміни збережено");
	return pollres_view();

}





function pollres_del(){
	global $par,$depot,$oks,$b, $tx;
	$html='';

    $res_ = conn_sql_query("DELETE FROM ".POLLRES." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($oks,$tx['ok_del1']);
	} else {
		array_unshift($errors,$tx['al_norecs']."<br><br>");
	}

	$html.=pollres_view();
	return $html;
}




function move_record(){
	global $par,$depot,$oks, $tx;

	$sql=conn_sql_query("SELECT variant,id,orderid FROM ".POLLRES." WHERE poll_id=\"".$par['pollid']."\" ORDER BY orderid") or die(conn_error());
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
			$depot['errors'][]=$tx['al_topbranch'];
			return;
		}
		$old=$same_home[($j-1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["variant"],$tx["ok_movedup"]);

	} else if ($par['su']=="movedown"){

		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$tx['al_lowbranch'];
			return;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["variant"],$tx["ok_moveddown"]);

	} else {
		return;
	}
	conn_sql_query("UPDATE ".POLLRES." SET orderid=\"".$old["orderid"]."\" WHERE id=\"".$new["id"]."\"");
	conn_sql_query("UPDATE ".POLLRES." SET orderid=\"".$new["orderid"]."\" WHERE id=\"".$old["id"]."\"");
	return;
}




function pollres_js(){
	$r=<<<JSCR

 <script language="javaScript">

		  <!--
			
			function editlex(pattidvar,ttype,lng){
				var obj = document.getElementById ? document.getElementById(pattidvar) : null;
				var objScript = document.getElementById ? document.getElementById("updscript") : null;
				hide_mess();
				obj.innerHTML ="<div style='text-align:center;'><img src=\"img/clock.gif\"></div>";
				objScript.src = "/adm/adm_get_list.php?pattidvar="+pattidvar+"&upd="+ttype+"&lng="+lng;

				
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
