<?

global $a,$p,$previndex;

function aget_center(){
		global $par,$errors,$oks, $depot;
		
		if (!require_level('ac_usermanage')){
			$errors[]=$depot["tx"]['in_noaccess'];
			return;
		}

		$html=lang_js();
		$html.= "<h1>".$depot["tx"]['he_users']."</h1><hr><form name='ad' method=post>";
		
		if (!isset($par['su'])) $par['su']='view';
		switch ($par['su']){
			case "view":	$html.= users_view();	break;
			case "add":		$html.= users_add();	break;
			case "edit":	$html.= users_add();	break;
			case "remove":	$html.= users_del();	break;

		}
		$html.= "</form>";
		return $html;

}



function users_view(){
	global $par,$b, $depot, $oks;
	$html='';
	$html.="<a href=\"/gazda/?act=users&su=add\" style='float:right;margin-top:-45px;position:relative;' class=addsome><span>Додати</span></a>";
	
	$html.="<table width=100% cellpadding=5 cellspacing=1>
			<tr>
				<td class=heaad width=25%>".$depot["tx"]["he_user"]."</td>
				<td class=heaad width=15%>".$depot["tx"]["he_login"]."</td>
				<td class=heaad width=40%>".$depot["tx"]["he_permission"]."</td>
				<td class=heaad>".$depot["tx"]["he_operations"]."</td>
			</tr>";

	$rulerwidth=90;

	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql=conn_sql_query("SELECT * FROM ".USERS." ORDER BY id");
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	

	if (!conn_sql_num_rows($sql)){
		$html.= "<tr><td colspan=5 class=bord style=\"text-align:center !important;\"> * * * * * * * * * * * * * * * </td></tr>";
	} else {

		foreach ($b as $cat){ 

			$currcolor=$colors[1];
			if (!$cat['active'])  $currcolor="#FFDFDF"; 
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66"; 
			
			
			$permission='';
					
			foreach (unserialize($cat['perm']) as $k=>$v){
				if ($v == 1) $class='acc'; else $class='noacc';
				$permission.="<a class=$class title='".$depot["tx"][$k]."'></a>";
				
			}



			$html.="<tr><td class=bord style=\"padding-left:10px;background-color:".$currcolor."; background-image: url(img/ruler.gif);background-position: -80px -3px; background-repeat:no-repeat;\">&#8226;&nbsp;".stripslashes($cat['uname_ua'])."</td><td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['uname'])."</td><td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($permission)."</td><td class=bord>";


				$html.="<a href=\"JavaScript:sbm('edit','".$cat['id']."','')\" id=butt class=edit title=\"".$depot["tx"]["ti_edit"]."\"></a>";
				
				

				$html.="<a href=\"JavaScript:rr('".$cat['id']."')\" id=butt class=del title=\"".$depot["tx"]["ti_delete"]."\" style='margin-left:20px;'></a>";

			$html.="</td></tr>";

			
		}

	}
	$html.="</table>";
	$html.="<div name='langlex' id='langlex'></div>";
	$html.=  "<input type=hidden name=act value=\"users\"><input type=hidden name=su value=\"\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"\">";
	return $html;
}


function users_add(){
	global $par, $errors, $oks, $depot, $lngs1, $accessr;
	$html='';
	$ly=1;


	if (!isset($par['sudir'])){

		/*------------------------------------*/
		if($par['su'] == 'edit') {
			$q11=conn_sql_query("SELECT * FROM ".USERS." WHERE id=\"".$par['id']."\"");
			$q1=conn_fetch_array($q11, PDO::FETCH_ASSOC);
			foreach ($q1 as $k=>$v)	{
				$par[$k]=$v;
			}

			$ass_q=unserialize($par['perm']);
			foreach ($ass_q as $k=>$v) $par[$k]=$v;
		}

		/*-------------------------------------*/


		$html.="<h2>Створити користувача</h2>";

		$html.= "<table width=\"100%\">";
		$html.="<tr><td width=\"50%\" class=heaad>Деталі</td><td width=\"50%\" class=heaad>Права</td></tr>";
		$html.="<tr><td><h3><br>".$depot["tx"]['he_personal']."</h3><hr>";
		$html.="<table width=100%>";
		foreach($lngs1 as $k=>$v) 
			$html.="<tr><td width=50%><b>".$depot["tx"]['he_fullname']." / <span class=red>".$k."</span></b></td><td>".bd_tf(@$par['uname_'.$k],'uname_'.$k,'text','width:300px;','','1')."</td></tr>";
		$html.="<tr><td width=50%><b>".$depot["tx"]['he_agency']."</b> </td><td>".bd_tf(@$par['uagency'],'uagency','text','width:300px;','','1')."</td></tr>";
		$html.="</table>";

		
		$html.="<h3><br>".$depot["tx"]['he_auth']."</h3><hr>";

		if ($par['su']=='add'){
			$html.="<table>";
			$html.="<tr><td width=50%><b>".$depot["tx"]['he_username']."</b> (6-20)</td><td>".bd_tf(@$par['uname'],'uname','text','width:300px;','','1')."</td></tr>";
			$html.="<tr><td><b>".$depot["tx"]['he_pass']."</b> (6-20)</td><td>".bd_tf(@$par['upass'],'upass','text','width:300px;','','1')."</td></tr>";

			$html.="<tr><td></td><td><div class=notice>".$depot["tx"]['in_passalert']."</div></td></tr>";
			$html.="</table>";
		} else {
			$html.="<table width=100%>";
			$html.="<tr><td width=35%><b>".$depot["tx"]['he_username']."</b></td><td><div class=inact>".@$par['uname']."</div></td></tr>";
			$html.="<tr><td><b>".
				$depot["tx"]['he_pass']."</b></td><td>".
				bd_tf('','upass','text','width:100px;','','1').
				bd_chk('chngpass','1','','')."<label class=in>".$depot["tx"]['he_chngpass']."</label>".
				"</td></tr>";
			$html.="</table>";		
		}

		



		$html.="</td><td width=50% valign=top>"; 

		$html.="<br><table width=100% cellpadding=0 cellspacing=0>";
		foreach ($accessr as $k=>$v)
		$html.="<tr><td width=40>&nbsp;</td><td>".bd_chk($k,'1','','')."<label class=in>".$v."</label></td></tr>";

		$html.="<tr><td>&nbsp;</td><td><hr></td></tr>";
		$html.="<tr><td>&nbsp;</td><td>".bd_chk('active','1','','')."<label for='active'  class=in>".$depot["tx"]['he_active']."</label></td></tr>";

		$html.="</table>";

		$html.="</td></tr></table>";
		

		$html.= "<div class=sbm><input type=button value=\"".$depot["tx"]["bt_save"]."\" id=submt class='save' onClick=\"sbm('','','save')\"></div>";
	} else if  ($par['sudir']=="save"){
		if($par['su'] == 'add') {
			chk_req("uname",$depot["tx"]['he_username']);
			chk_length("uname",$depot["tx"]['he_username'],"4","20");
			chk_valid_plus("uname",$depot["tx"]['he_username']);
			chk_occupied("uname",USERS,"uname",$depot["tx"]['he_username']);

			chk_req("upass",$depot["tx"]['he_pass']);
			chk_length("upass",$depot["tx"]['he_pass'],"6","20");
			chk_valid("upass",$depot["tx"]['he_pass']);
		}
		
		if ($errors) {
			unset($par['sudir']);
			return users_add();

		}
		
		$acc_db=array();
		//reset($accessr);
		foreach ($accessr as $a=>$aa){
			if (@$par[$a]) $acc_db[$a]=1; else $acc_db[$a]=0;
		}

		$active = (@$par['active']) ? 1 : 0;
		
		if($par['su'] == 'add') {
			$sql="INSERT INTO ".USERS." SET ";
			foreach ($lngs1 as $l=>$o) $sql.="uname_".$l."=\"".sqller($par['uname_'.$l])."\",";
			$sql.="	
					uagency =	\"".	sqller($par['uagency']).	"\",
					uname =		\"".	sqller($par['uname']).		"\",
					upass =		\"".	md5($par['upass']).			"\",
					perm=		\"".	sqller(serialize($acc_db)).	"\",
					active=		\"$active\"";
            $res_ = conn_sql_query($sql) or die(conn_error());
			if (conn_affected_rows($res_)>0) {
				hist(1,conn_insert_id());
				$oks[]='1 '.$depot["tx"]['ok_recordsadded'];
			}


		} else {
			$sql="UPDATE ".USERS." SET ";
			foreach ($lngs1 as $l=>$o) $sql.="uname_".$l."=\"".sqller($par['uname_'.$l])."\",";
			$sql.="	
					uagency =	\"".	sqller($par['uagency']).	"\",
					perm=		\"".	sqller(serialize($acc_db)).	"\",
					active=		\"$active\"";
			if (@$par['chngpass'] && $par['upass']) $sql.=", upass =\"".	md5($par['upass']).	"\"";
			$sql.=" WHERE id=\"".sqller($par['id'])."\"";
            $res_ = conn_sql_query($sql) or die(conn_error());
			if (conn_affected_rows($res_)>0) {
				conn_sql_query("UPDATE ".LOGGEDA." SET perm = \"".	sqller(serialize($acc_db)).	"\" WHERE usid=\"".sqller($par['id'])."\"");


				$oks[]=$depot["tx"]['ok_edited'];
				hist(2,$par['id']);
			}

		}
	

		return users_view();
	}

	$html.= "<input type=hidden name=act value=\"users\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=su value=\"".$par['su']."\">
	<input type=hidden name=id value=\"".@$par['id']."\">";
	return $html;

}



function users_del(){
	global $par,$errors,$oks,$b, $depot;
	$html='';

    $res_ = conn_sql_query("DELETE FROM ".USERS." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($oks,$depot["tx"]['ok_del1']);
		hist(3,$par['id']);
	} else {
		array_unshift($errors,$depot["tx"]['al_norecs']."<br><br>");
	}

	$html.=users_view();
	return $html;
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
