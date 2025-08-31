<?

global $a,$p,$previndex,$current_chat;
//$js="js_lang";
function aget_center(){
		global $depot,$lngs,$lngs1,$par,$current_chat;
		$ttop='';
		/*if (!require_level('ac_chat')){
			$depot['errors'][]=$depot['tx']['he_addchat'];
			return;
		}*/
		if(!(isset($par['kind']))) $par['kind'] = 'p';
		$current_chat=conn_fetch_assoc(conn_sql_query("
				SELECT *,DATE_FORMAT(chatdate,'%d.%m.%y %H:%i') as ddate 
				FROM ".CHATL." 
				WHERE id = \"".$par['chid']."\"
		"));


//foreach ($par as $k=>$v) echo $k."---".$v."<br>";
		$image=get_selected_images($current_chat['images'],$lngs[$current_chat['lang']][1]);
		
		global $par,$errors,$oks, $depot;
		if (!isset($par['su']) || !trim($par['su'])) $par['su']='v';
		
		switch ($par['su']){
			
			case "v": 
			case "moveup":
			case "movedown":
			case "sedit":
					$ttop.=chatrun_view();	break;

			case "a": 	
					$ttop.=chatrun_add();	break;

			case "e": 
					$ttop.=chatrun_add();	break;
			case "edit": 
					$ttop.=chatrun_edit();	break;

			case "sa": 
			case "se": 
					$ttop.=chatrun_save();	break;

			case "remove": 
					$ttop.= chatrun_del();break;

		}
		$ttop1= "<h1>".$depot['tx']['he_chat']."</h1><hr><form name='ad' method=post>";
		$ttop1.="<div class=dframe style='padding:20px;background:#EEE;'><table><tr><td width=50%>";
		
		if (count($image))
		$ttop1.="<img src='/media/gallery/tmb/".$image[0]['filename']."' style='float:left;margin-right:20px;'>";


		$ttop1.="<h3>".$current_chat['ddate']."</h3>";
		$ttop1.="<h2>".getfromsql($current_chat['nguest'],$current_chat['lang'])."</h2>";
		
		$ttop1.=getfromsql($current_chat['teaser'],$current_chat['lang']);
		$ttop1.="</td><td width=50%>";
		
		$ttop1.="</td></tr></table></div>";
		
		$classp=$classu='';
		if ($par['kind'] == 'p') $classp='class=active'; 
		else if ($par['kind'] == 'u') $classu='class=active'; 
		$path='/gazda/?act=chatrun&su=v&id=834&chid='.$par['chid'];
		$ttop1.="<a href='$path&kind=u' id=abutt $classu>".iho('������������ �������')."</a>";
		$ttop1.="<a href='$path&kind=p' id=abutt $classp>".iho('���������� �������')."</a>";
		
		
		$ttop=$ttop1.$ttop;
		$ttop.="<input type=hidden name=oldsu value=\"".@$par['su']."\"><input type = hidden name='act' value='".$par['act']."'><input type=hidden name=kind value=\"".@$par['kind']."\">";
		$ttop.= "</form>";
		return $ttop;

}


function chatrun_edit(){
	global $par,$b, $depot, $oks,$lngs1,$lngs,$errors,$logged_user;
	$ttop='';

	$admin=0;
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'view';
	$toedit=conn_fetch_assoc(conn_sql_query("
		SELECT *
		FROM ".CHATQ." 
		WHERE id = \"".$par['id']."\" 
		ORDER BY id
	"));

	if (count($toedit)<3) {
		$depot['errors'][]=$depot['tx']['al_noid'];
		$par['su']=$toview;
		return chatrun_view();
	}
	

	foreach ($toedit as $k=>$v){
		$par[$k] = stripslashes($v);	
	}



	foreach ($lngs as $k=>$v) {
		$l[]=$k;
		$l[]=$v[0];
	}
	
	
	$ttop.="
		<table width=100% cellpadding=5 cellspacing=1>
			<tr><td width=600 valign=top>";
	$ttop.="<label for=nbody>".iho('�����')."</label>";	
	$ttop.=bd_tf(@$par['uid'],'uid','text','width:600px;','','');
	$ttop.="<label for=nbody>".iho('���������')."</label>";
	$def_cont=(@$par['question']) ? $par['question'] : '-';
	$ttop.="<textarea id=\"question\" name=\"question\" style=\"height:200px;width:600px;\">$def_cont</textarea>";
	$ttop.="</td></tr><tr><td valign=top>";
	
	if (@$par['id'])
			$ttop.="<input type=submit name=rem_q id='submt' value='".iho('��������')."' style='margin:10px 0 20px 0px !important;'>";
	
	$ttop.="<input type=submit name=addne id='submt' class=save value='".iho('��������')."' style='margin:10px 0 20px 250px !important;'>";
	
	$ttop.="</td></tr></table>";

		
	$ttop.="<div name='langlex' id='langlex'></div>";
	$ttop.=  "
				<input type=hidden name=act value=\"chatrun\">
				<input type=hidden name=su value=\"sedit\">	
				<input type=hidden name=kind value=\"u\">	
				<input type=hidden name=id value=\"".@$par['id']."\">
				<input type=hidden name=chid value=\"".@$par['chid']."\">
	";
	return $ttop;


}

/*	*	VIEW CHATS	*	*/


function chatrun_view(){
	global $depot,$lngs,$lngs1,$par,$logged_user,$current_chat;
	$ttop='';
	if ($par['kind'] == 'u') return chatrun_unpub();

	if ($par['su'] == "moveup" || $par['su'] == "movedown"){
		move_record();
	}


	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'v';
	$sql1="
			SELECT *
			FROM ".CHATP." 
			WHERE chatid = \"".$par['chid']."\"
			ORDER BY id
	";
	$qry=conn_sql_query($sql1) or die(conn_error());
	if (!conn_sql_num_rows($qry))$ttop.="<h2><br><br><br>".$depot['tx']['he_norecords']."</h2>";
	else {
	
		$ttop.="<table width=100% cellpadding=5 cellspacing=0 style='clear:both;'><tr>
						<td width=10% bgcolor=#333333>&nbsp;
						</td>
						<td width=75% bgcolor=#333333>&nbsp;
						</td>
						<td width=15%   bgcolor=#333333>&nbsp;
						</td></tr>";

		for ($i=0;$i<conn_sql_num_rows($qry);$i++){
			$actim='';
			$res=conn_fetch_assoc($qry);
			if ($i%2) $bg=" bgcolor=#EEEEEE"; else $bg="";
			if ($res['images']) {
				$actim=get_selected_images($res['images'],$lngs[$current_chat['lang']][1]);
			}
			$ttop.="
					<tr>
						<td  class=bord  style='padding:7px;font-size:11px;' valign=top>".$res['uid']."</td>
						<td  class=bord  $bg style='padding:7px;'>";


			if ($actim) {
				$ttop.="<img src='/media/gallery/tmb/".$actim[0]['filename']."' style='float:left;margin-right:20px !important;width:50px;'>";
			}
			
			$ttop.="<a href='/gazda/?act=chatrun&su=e&id=".$res['id']."&chid=".$par['chid']."' class='clr'>".$res['question']."</b>";
			$ttop.="</a></td><td  class=bord  $bg>";
			
			
			$ttop.="<a href=\"JavaScript:sbm('moveup','".$res['id']."','')\"  title=\"".$depot['tx']["ti_moveup"]."\" id=butt class=up></a>";

			$ttop.="<a href=\"JavaScript:sbm('movedown','".$res['id']."','')\"  title=\"".$depot['tx']["ti_movedown"]."\" id=butt class=down></a>";


			$ttop.="<a href=\"JavaScript:rr('".$res['id']."')\" id=butt class=del title=\"".$depot['tx']["ti_delete"]."\" style='float:right;'></a>";
			$ttop.="</td></tr>";
		}
		$ttop.="</table>";
	}

	
	$ttop.="<input type = hidden name='su' value='v'><input type = hidden name='chid' value='".$par['chid']."'><input type = hidden name='id' value=''>";
	return $ttop;
}



function chatrun_unpub(){
	global $depot,$lngs,$lngs1,$par,$logged_user,$current_chat,$oks,$errors;
	$ttop='';
	

	if ($par['su'] == 'sedit'){
		if (@$par['rem_q']) {
			$sql="DELETE FROM ".CHATQ." WHERE id = \"".sqller($par['id'])."\"";
            $res_ = conn_sql_query($sql) or die (conn_error());
			if (conn_affected_rows($res_)>0){
					freecache(6);
					$oks[]="1 ".$depot['tx']['ok_del1'];
			} else {
				$depot['errors'][]="Problem deleting QUESTION information";
			}
		} else {
			$sql=	"UPDATE ".CHATQ."	SET ";
			$sql.="
					uid		=	\"".sqller($par['uid'])."\",
					question		=	\"".sqller($par['question'])."\"
					WHERE id = \"".sqller($par['id'])."\"";



            $res_ = conn_sql_query($sql) or die (conn_error());
			if (conn_affected_rows($res_)>0){
					$oks[]="1 ".$depot['tx']['ok_recordsadded'];
					freecache(6);
			} else {
				$depot['errors'][]="Problem editing QUESTION information";
				$depot['errors'][]=$depot['tx']['al_edited'];
			}
		}
		$par['su'] = 'v';
	}


	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'v';
	$sql1="
			SELECT *
			FROM ".CHATQ." 
			WHERE chatid = \"".$par['chid']."\" 
			ORDER BY id
	";
	$qry=conn_sql_query($sql1) or die(conn_error());
	if (!conn_sql_num_rows($qry))$ttop.="<h2><br><br><br>".$depot['tx']['he_norecords']."</h2>";
	else {
	
		$ttop.="<table width=100% cellpadding=5 cellspacing=0 style='clear:both;'><tr>
						<td width=15% class=heaad>&nbsp;<br>&nbsp;<br>
						</td>
						<td class=heaad width=70%>&nbsp;
						</td>
						<td width=15%  class=heaad>&nbsp;
						</td></tr>";

		for ($i=0;$i<conn_sql_num_rows($qry);$i++){
			$actim='';
			$res=conn_fetch_assoc($qry);
			if ($i%2) $bg=" bgcolor=#EEEEEE"; else $bg="";
			$ttop.="
					<tr>
						<td  class=bord  style='padding:7px;background:#900;' valign=top><b class=wh>".$res['uid']."<br>IP: ".long2ip($res['ipaddr'])."<br>".$res['uniqueno']."</b></td>
						<td  class=bord  $bg style='padding:7px;'>";



			
			$ttop.="<a href='/gazda/?act=chatrun&su=a&qid=".$res['id']."&chid=".$par['chid']."&kind=u' class='clr'>".$res['question']."</b>";
			$ttop.="</a></td><td  class=bord  $bg valign=middle>";
			


			$ttop.="<a href=\"JavaScript:sbm('edit','".$res['id']."','')\" id=butt class=edit title=\"".$depot['tx']["ti_edit"]."\"></a><a href=\"JavaScript:rr('".$res['id']."')\" id=butt class=del title=\"".$depot['tx']["ti_delete"]."\" style='margin-left:40px;'></a>";
			$ttop.="</td></tr>";
		}
		$ttop.="</table>";
	}

	
	$ttop.="<input type = hidden name='su' value='v'><input type=hidden name=qu value=\"1\"><input type = hidden name='chid' value='".$par['chid']."'><input type = hidden name='qid' value='noproblem'><input type = hidden name='id' value=''>";
	return $ttop;
}


function chatrun_add(){
	global $par,$b, $depot, $oks,$lngs1,$lngs,$errors,$logged_user,$vars;
	$ttop='';
	$nnow=time();
	$def_cont='';
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'v';
	
	if ($par['su'] == 'e') {
		/*		CHECK AVAILABILITY		*/
		$toedit=conn_fetch_assoc(conn_sql_query("
						SELECT	* 
						FROM		".CHATP." 
						WHERE		".CHATP.".id = \"".sqller($par['id'])."\""));

		if (count($toedit)<3) {
			$depot['errors'][]=$depot['tx']['al_noid'];
			$par['su']=$toview;
			return chatrun_view();
		}
		
		
	} else {
		$par['published'] = '0';
		/*		CHECK AVAILABILITY		*/
		$toedit=conn_fetch_assoc(conn_sql_query("
						SELECT	* 
						FROM		".CHATQ." 
						WHERE		".CHATQ.".id = \"".sqller($par['qid'])."\""));
	}

	$do_not_affect=array();
	$awaiting_array=array();
	foreach ($toedit as $k=>$v){
		if (!in_array($k,$do_not_affect)) {
			if (!in_array($k,$awaiting_array)) {
				$par[$k] = stripslashes($v);
			} else {
				$par[$k] = explode(',',stripslashes($v));
			}
		}
	}


	$def_cont = isset($par['answer']) ? htmlspecialchars(@$par['answer']) : '-';

	$ttop.="
		<table width=100% cellpadding=5 cellspacing=0 style='margin:0'>
			<tr><td colspan=2 bgcolor=#333333>&nbsp;<br>&nbsp;<br></td></tr>
			<tr><td width=600 valign=top>";
				
	$ttop.="<label for=uid>".iho('�����')."</label>".bd_tf(@$par['uid'],'uid','text','width:600px','',1);
	$ttop.="<label for=question>".iho('��������� ���-�����������')."</label>".bd_tar(@$par['question'],'question','600px;','100px',2);
	$ttop.="<label for=answer>".iho('³������')."</label><textarea id=\"answer\" name=\"answer\" style=\"height:300px;width:600px;\">$def_cont</textarea></td>";
	$ttop.="</td>";
	$ttop.="<td width=350 valign='top'>";
	$ttop.=image_maker(@$par['images'],'images');
	$ttop.="<a href='' onClick='showP(\"imageManagerPopup\");return false;' class='camera'><span id='imageqty'>".$vars['var']['imagesqty']."</span></a>";

	$ttop.="<div class='dframe' style='clear:both;margin-top:20px;'><div class=bod><table width=97% cellpadding=2 cellspacing=0 border=0>";
	$ttop.="<tr><td width=40>".bd_chk('published','1',10,'')."</td><td>".iho('&nbsp;&nbsp;���������� ��������� �� ����')."</td></tr>";
	$ttop.="</table></div></div>";


	if ($par['su'] == 'e') {
		$ttop.="<input type=submit name=addne id='submt' class=save value='".iho('��������')."' style='margin:10px 0 20px 5px !important;'>";
		$ttop.="<input type=button name=addne id='submt' value='".iho('��������')."' style='margin:10px 0 20px 50px !important;' onClick=\"JavaScript:r('".$par['id']."')\">";
	} else if ($par['su'] == 'a'){
		$ttop.="<input type=submit name=addne id='submt' class=save value='".iho('��������')."' style='margin:10px 0 20px 5px !important;'>";
		$ttop.="<input type=button name=addne id='submt' value='".iho('��������')."' style='margin:10px 0 20px 50px !important;' onClick=\"JavaScript:r('".$par['qid']."')\">";
		$ttop.="<input type=hidden name=qid value=\"".$par['qid']."\">";
	}
		$ttop.="</td></tr></table>";
	$ttop.="<hr>";
		
	$ttop.="<div name='langlex' id='langlex'></div>";
	$ttop.=  "<input type=hidden name=act value=\"chat\">";
	
	$ttop.="
					<input type=hidden name=su value=\"s".$par['su']."\">
					<input type=hidden name=id value=\"".@$par['id']."\">
					<input type=hidden name=oldsu value=\"".@$par['oldsu']."\">";

	$ttop.="<script language=\"javascript1.2\">
			
				  CKEDITOR.replace( 'answer' );
		
				</script>";
	return $ttop;
}


function chatrun_save(){
	global $par,$errors,$oks,$depot,$logged_user;
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'v';
	
	//echo $lngs1[$par['lang']][1];return;
	//echo $par['lang'];
	if (isset($par['published'])) $pub=1; else $pub=0;
	switch ($par['su']) {
		case "sa":	
						
		
						if ($pub){
							$sql=	"
									INSERT INTO ".CHATP."	SET 
									chatid		=	\"".sqller($par['chid'])."\",
									question	=	\"".sqller($par['question'])."\",
									answer		=	\"".sqller($par['answer'])."\",
									uid			=	\"".sqller($par['uid'])."\",
									images		=	\"".sqller($par['selimgs_images'])."\",
									published	=	\"".$pub."\"";
                            $res_ = conn_sql_query($sql) or die (conn_error());
							if (conn_affected_rows($res_)>0) {
								conn_sql_query("DELETE FROM ".CHATQ." WHERE id = \"".$par['qid']."\"");
								freecache(6);
								if ($par['su'] == 'sa') $oks[] = "1 ".$depot['tx']['ok_recordsadded'];
								else $oks[] = $depot['tx']['ok_edited'];
							} else {
								$depot['errors'][]=$depot['tx']['al_recordsadded'];
							}
						} else {
								
							$sql=	"
									UPDATE ".CHATQ."	SET 
									question	=	\"".sqller($par['question'])."\",
									uid			=	\"".sqller($par['uid'])."\",
									answer		=	\"".sqller($par['answer'])."\" 

									WHERE id = \"".$par['qid']."\"";
							conn_sql_query($sql) or die (conn_error());
							$oks[] = $depot['tx']['ok_edited'];

						}

						break;
		case "se":
						if ($pub){
							$sql=	"
									UPDATE		".CHATP."	SET 
									question	=	\"".sqller($par['question'])."\",
									answer		=	\"".sqller($par['answer'])."\",
									uid			=	\"".sqller($par['uid'])."\",
									images		=	\"".sqller($par['selimgs_images'])."\",
									published	=	\"".$pub."\"
									WHERE id	=	\"".sqller($par['id'])."\"";

                            $res_ = conn_sql_query($sql) or die (conn_error());
							if (conn_affected_rows($res_)>0) {
								freecache(6);
								$oks[] = $depot['tx']['ok_edited'];
							}
							else $depot['errors'][]=$depot['tx']['al_recordsadded'];
						} else {
							
							 $sql=	"
									INSERT INTO ".CHATQ."	SET 
									chatid		=	\"".sqller($par['chid'])."\",
									question	=	\"".sqller($par['question'])."\",
									answer		=	\"".sqller($par['answer'])."\",
									uid			=	\"".sqller($par['uid'])."\"";
                            $res_ = conn_sql_query($sql) or die (conn_error());
							if (conn_affected_rows($res_)>0) {
								conn_sql_query("DELETE FROM ".CHATP." WHERE id = \"".sqller($par['id'])."\"");
								freecache(6);
								$oks[] = $depot['tx']['ok_edited'];
							} else {
								$depot['errors'][]=$depot['tx']['al_recordsadded'];
							}
						}
						break;
	}

	$par['su'] = $toview;
	return chatrun_view();

}

function chatrun_del(){
	global $par,$errors,$oks,$b, $depot;
	$ttop='';
	
	if ($par['kind'] == 'u') {
		$sql="DELETE FROM ".CHATQ." WHERE id=\"".$par['id']."\"";	
	} else {
		$sql="DELETE FROM ".CHATP." WHERE id=\"".$par['id']."\"";
			
	}
    $res_ = conn_sql_query($sql);
	if (conn_affected_rows($res_)) {
			array_unshift($oks,$depot['tx']['ok_del1']);
			freecache(6);
	} else {
		array_unshift($errors,$depot['tx']['al_norecs']."<br><br>");
	}

	$ttop.=chatrun_view();
	return $ttop;
}


function move_record(){
	global $par,$errors,$oks, $depot;

	$sql=conn_sql_query("SELECT id FROM ".CHATP." WHERE chatid = \"".$par['chid']."\" ORDER BY id");
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
		$oks[]=str_replace("{|thevar|}",$new["id"],$depot['tx']["ok_movedup"]);
			
	
	} else if ($par['su']=="movedown"){
	
		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$depot['tx']['al_lowbranch'];
			return;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$oks[]=str_replace("{|thevar|}",$new["id"],$depot['tx']["ok_moveddown"]);

	} else {
		return;
	}
	//echo $old["id"]."/".$new["id"];
	conn_sql_query("UPDATE ".CHATP." SET id=0 WHERE id=\"".$old["id"]."\"");
	conn_sql_query("UPDATE ".CHATP." SET id=\"".$old["id"]."\" WHERE id=\"".$new["id"]."\"");
	conn_sql_query("UPDATE ".CHATP." SET id=\"".$new["id"]."\" WHERE id=\"0\"");
	freecache(6);
	
	
	return;
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
