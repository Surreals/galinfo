<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){

		global $par,$depot,$oks, $tx,$lngs;
		$html=poll_js();
		$types=explode(",","region,rubric,theme,city");
		if (!isset($par['type']) || !in_array($par['type'],$types)) $par['type']=$types[0];
		$lang_pars=array_keys($lngs);
		if (!isset($par['lang']) || !isset($lngs[$par['lang']][0])) $par['lang']=$lang_pars[0];
		$html.= "<h1>".iho("���������� �� ����")."</h1><hr><form name='ad' method=post>";
		
		if (!isset($par['su']) || ($par['su']=='')) $par['su']='view';
		switch ($par['su']){
			case "view": 
			case "moveup":
			case "movedown":
			case "savelex":$html.= poll_view();break;
			case "add": $html.= poll_add();break;
			//case "edit": $html.= poll_edit();break;
			case "remove": $html.= poll_del();break;
			case "chng" : $html.=poll_change();break;
		}

		$html.="<input type=hidden name='type' value='".$par['type']."'>";
		$html.="<input type=hidden name='act' value='".$par['act']."'>";
		$html.= "</form>";
		return $html;

}




function poll_view(){
	global $par,$b, $depot, $oks, $lngs;
	$html='';
	
	if ($par['su'] == "moveup" || $par['su'] == "movedown"){
		move_record();
	}



	$addon="";
	if (@$par['fproject']){
		$addon.=" AND ".POLL.".projectid = \"".sqller($par['fproject'])."\" ";
		$path.="&fproject=".$par['fproject'];
	}




	foreach ($lngs as $k=>$v) {
		$l[]=$k;
		$l[]=$v[0];
	}
	$html.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'onChange = "chng_lang()"')."</div>";

	
	

	$rulerwidth=90;

	$html.="		
	
					<a href='' onClick='sbm(\"add\",\"\",\"\"); return false;' style='float:right;margin-top:-35px;margin-right:300px;'><img src='/gazda/img/bt_add.gif' style='margin-right:15px;margin-bottom:-5px;'>".iho('������')."</a>
					
					";
	$html.="<table width=100% class='smart' cellspacing=0><tr><td class=heaad width=80%>".$depot['tx']["he_titlename"]."</td><td width=20% class=heaad>".$depot['tx']["he_operations"]."</td></tr>";

	$path="/gazda/?act=polls&su=view";
	$sql_qty="SELECT COUNT(*) FROM ".POLL." WHERE lang=\"".$par['lang']."\"";
	//echo $sql_qty;
	$count1=conn_sql_query($sql_qty) or die(conn_error());

	if (!isset($par['pg'])) $par['pg']=0;
	//$perpage=$enviro['comments_per_page'];
	$perpage=30;
	$count=conn_fetch_row($count1);
	$pages=($count[0]%$perpage) ? (int)($count[0]/$perpage+1) : $count[0]/$perpage;

	$ppg=10;
	$pppages=($pages%$ppg) ? (int)($pages/$ppg+1) : $pages/$ppg;
	$curr_ppg=(int)($par['pg']/$ppg);

	$start_page=$curr_ppg*$ppg;
	$end_page=($curr_ppg*$ppg+$ppg>$pages) ? $pages : $curr_ppg*$ppg+$ppg;
	//$path=$par['pphtm'];
	//foreach ($_SERVER as $k=>$v) echo "$k = > $v<br>";
	
	if ($curr_ppg!=0) {
		$prev_page="<a href=\"$path&pg=".($curr_ppg*$ppg-1)."\">&lt;</a>"; 
		$pprev_page="<a href=\"$path&pg=0\">&laquo;</a>"; 
	}	else 
	{
		$prev_page="";
		$pprev_page="";
	}
	if ($curr_ppg!= ($pppages-1) && $pppages!==0) {
		$next_page="<a href=\"$path&pg=".(($curr_ppg+1)*$ppg)."\">&gt;</a>"; 
		$nnext_page="<a href=\"$path&pg=".($pages-1)."/\">&raquo;</a>";
	} else 
	{
		$next_page="";
		$nnext_page="";
	}
		
	//echo $count[0];
	if ($pages>1) {
		$html.="<div class=pager>";
		$html.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$html.= "<a href=\"$path&pg=$i\">".($i+1)."</a>";
			else $html.= "<span>".($i+1)."</span>";
		}
		$html.= $next_page.$nnext_page;

		$html.="<div style='padding-left:50px;font-size:18px;float:left;'>/ ".$count[0]."</div>";
		$html.="</div>";
	} else {
		$html.="<div style='font-size:18px;float:left;'>/ ".$count[0]."</div>";
	}


	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql=conn_sql_query("SELECT * FROM ".POLL." WHERE lang=\"".$par['lang']."\" ORDER BY orderid DESC LIMIT	".$par['pg']*$perpage.",".$perpage);
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	

	if (!conn_sql_num_rows($sql)){
		$html.= "<tr><td colspan=5 style=\"text-align:center !important;\"> * * * * * * * * * * * * * * * </td></tr>";
	} else {

		foreach ($b as $cat){ 

			$currcolor=$colors[1];
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66"; 
		
			$html.="<tr><td><a href=\"/gazda/?act=pollres&pollid=".$cat['id']."\">".stripslashes($cat['subject'])."</a></td><td>";


				$html.="<a href=\"JavaScript:sbm('moveup','".$cat['id']."','')\"  title=\"".$depot['tx']["ti_moveup"]."\" id=butt class=up></a>";

				$html.="<a href=\"JavaScript:sbm('movedown','".$cat['id']."','')\"  title=\"".$depot['tx']["ti_movedown"]."\" id=butt class=down></a>";

				$html.="<a href=\"/gazda/?act=pollres&pollid=".$cat['id']."\" id=butt class=edit title=\"".$depot['tx']["ti_edit"]."\"></a>";


				if ($cat["isvis"]) {
					$html.="<a href=\"JavaScript:sbm('chng','".$cat['id']."','')\" id=butt class=act title=\"".$depot['tx']["ti_changestatus"]."\" style='margin-left:20px;'></a>";
				} else {
					$html.="<a href=\"JavaScript:sbm('chng','".$cat['id']."','')\" id=butt class=deact title=\"".$depot['tx']["ti_changestatus"]."\" style='margin-left:20px;'></a>";
				}
				
				

				$html.="<a href=\"JavaScript:rr('".$cat['id']."')\" id=butt class=del title=\"".$depot['tx']["ti_delete"]."\" style='float:right;'></a>";

			$html.="</td></tr>";

			
		}

	}
	$html.="</table>";
	$html.="<div name='langlex' id='langlex'></div>";
	$html.=  "<input type=hidden name=su value=\"view\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"\">";
	return $html;
}


function poll_add(){
	global $par, $depot, $oks, $tx,$lngs;
	$html='';

	//$h2=str_replace("{|thevar|}",iho(" ����."),$depot['tx']["he_addlang"]);
	$ly=1;

	if (!isset($par['sudir'])){

	


		$html.= "<br><br><h2>".@$lngs[$par['lang']][0]."</h2><table width=100%>

		

		<tr><td><b>".iho('���� ����������')."</b></td>
		<td width=50>&nbsp;</td><td>".bd_tf(@$par['subject'],'subject','text','width:640px;','','')."</td></tr>


		<tr><td rowspan=2 valign=top><br><b>".iho('������� ��������')."</b><br>".$depot['tx']["in_adding"]."</td><td width=50 rowspan=2>&nbsp;</td><td>";
		$html.= "<TEXTAREA style='width:640px;height:200px;' name=list></textarea></td></tr><tr><td class=haader>
		<br><input type=button value=\"".iho("����������")."\"  id=submt onClick=\"sbm('','','proceed')\"></td></tr></table>";
	} else if ($par['sudir']=="proceed"){
		$allo=explode("\n",$par['list']);
		$alloc=array();
		foreach ($allo as $e){
			if (trim($e)){
				$alloc[]=trim($e);
			}
		}
		if (count($alloc) == 0) {
			unset($par['sudir']);
			return poll_add();
		}
			
		$last=conn_fetch_row(conn_sql_query("SELECT orderid FROM ".POLL." WHERE lang = \"".$par['lang']."\" ORDER BY orderid DESC LIMIT 1"));
		if (!@$last[0]) $last[0]=0;

        $res_ = conn_sql_query("INSERT INTO ".POLL." SET 	
			orderid=\"".($last[0]+1)."\",
			subject=\"".sqller($par['subject'])."\",
			lang=\"".sqller($par['lang'])."\",
			unique_id=\"".md5($par['subject'].time())."\",
			projectid = \"".sqller(@$par['projectid'])."\",
			ddate=NOW()
		") or die(conn_error());
		
		if (conn_affected_rows($res_)>0){
			$vote_is=conn_insert_id();
			$start=1;
			foreach ($alloc as $it ){
                $res_ = conn_sql_query("INSERT INTO ".POLLRES." SET 
					orderid = $start,
					poll_id = $vote_is,
					variant = \"".sqller($it)."\" 
				");

				$start++;
			}

			if (conn_affected_rows($res_)) {
				$depot['oks'][]=$start." ".$depot['tx']["ok_recordsadded"]; 
			}
			else {
				$depot['errors'][]=$depot['tx']["al_recordsadded"];		
			}
		} else {
			$depot['errors'][]="Problem adding subject";
		}
		return poll_view();
	} 

	$html.= "
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=lang value=\"".$par['lang']."\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=id value=\"".@$par['id']."\">";
	return $html;

}



function poll_edit(){
	global $par,$depot,$oks, $tx,$lngs;
	$html='';

	$q11=conn_sql_query("SELECT * FROM ".POLL." WHERE id=\"".$par['id']."\"");
	$q1=conn_fetch_array($q11, PDO::FETCH_ASSOC);
	if (!conn_sql_num_rows($q11)){
		$depot['errors'][]=$depot['tx']['al_chooseedit'];
		return poll_view();
	}

	$html.="<h2>".$q1['subject']."</h2>";
	$html.= "<table width=\"100%\"><tr><td class=heaad>".$depot['tx']['he_titlename']."</td>";
	$html.= "<td class=heaad>".$depot['tx']['he_param']."</td>";
	$html.= "<td class=heaad>".$depot['tx']['he_visible']."</td></tr>";


	$html.= "<tr><td class=tdrow><INPUT type=text name=langtitle style=\"width:280px;\" value=\"".htmlspecialchars($q1['title'])."\"></td>";

	$html.= "<td class=tdrow><INPUT type=text name=idword style=\"width:280px;\" value=\"".htmlspecialchars($q1['param'])."\"></td>";

	$html.= "<td class=tdrow>";
	$html.= "<input type='checkbox' value='1' name=isactive ";
	if ($q1['isvis']) $html.='checked';
	$html.="></td>";
	$html.="</tr></table>";
	

	$html.= "
	<input type=hidden name=su value=\"edit\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=id value=\"".$par['id']."\">
	<div class=sbm><input type=button value=\"".$depot['tx']['bt_save']."\" class='save' id=submt onClick=\"sbm('','','gosavechange')\"></div>
		";
	return $html;
}




function poll_del(){
	global $par,$depot,$b, $tx;
	$html='';$res_1='';

    $res_ = conn_sql_query("DELETE FROM ".POLL." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)>0) $res_1 = conn_sql_query("DELETE FROM ".POLLRES." WHERE poll_id=\"".$par['id']."\"");
	if (conn_affected_rows($res_1)) {
		array_unshift($depot['oks'],$depot['tx']['ok_del1']);
	} else {
		array_unshift($depot['errors'],$depot['tx']['al_norecs']."<br><br>");
	}

	$html.=poll_view();
	return $html;
}




function move_record(){
	global $par,$depot,$oks, $tx;

	$sql=conn_sql_query("SELECT subject,id,orderid FROM ".POLL." WHERE lang=\"".$par['lang']."\" ORDER BY orderid") or die(conn_error());
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
	if ($par['su']=="movedown"){
		if (!isset($same_home[($j-1)])){
			$depot['errors'][]=$depot['tx']['al_lowbranch'];
			return;
		}
		$old=$same_home[($j-1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["subject"],$depot['tx']["ok_moveddown"]);
			
	} else if ($par['su']=="moveup"){
	
		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$depot['tx']['al_topbranch'];
			return;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["subject"],$depot['tx']["ok_movedup"]);

	} else {
		return;
	}
	conn_sql_query("UPDATE ".POLL." SET orderid=\"".$old["orderid"]."\" WHERE id=\"".$new["id"]."\"");
	conn_sql_query("UPDATE ".POLL." SET orderid=\"".$new["orderid"]."\" WHERE id=\"".$old["id"]."\"");
	return;
}


function poll_change(){
	global $par,$depot,$oks,$b, $tx;
	$html='';

    $res_ = conn_sql_query("UPDATE ".POLL." SET isvis=MOD((isvis+1),2) WHERE id=\"".$par['id']."\"") or die(conn_error());
	if (conn_affected_rows($res_)) {
		$depot['oks'][]=$depot['tx']["ok_activated"];
	} else {
		$depot['errors'][]=$depot['tx']["al_chng"];
	}
	$html.=poll_view();
	return $html;
}



function poll_js(){
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
