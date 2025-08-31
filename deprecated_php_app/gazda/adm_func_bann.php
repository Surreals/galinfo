<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){
		global $depot,$par;
		$ttop='';
		/*if (!require_level('ac_newsadd')){
			$depot['errors'][]=$depot["tx"]['in_noaccess'];
			return;
		}*/

		//$ttop=lang_js();

		$ttop= "<h1>".iho("�������� �����������")."</h1><hr><form name='ad' method=post>";
	
		if (!isset($par['su']) || !trim($par['su'])) $par['su']='view';
		switch ($par['su']){
			case "view": $ttop.=bann_view();break;
			case "add": $ttop.=bann_add();break;
			case "save": $ttop.=bann_save();break;
			case "remove": 
							$ttop.=bann_del();break;
		}
		
		$ttop.= "</form>";
		return $ttop;

}

function bann_add(){
	global $par,$depot;
	$ttop='';

	$ttop.= "<table width=100%><tr><td rowspan=2 valign=top>".$depot["tx"]["in_adding"]."<br></td><td width=50 rowspan=2>&nbsp;</td><td>";
		$ttop.= "<TEXTAREA style='width:640px;height:200px;' name=list></textarea></td></tr><tr><td class=haader>
		<br><input type=button value=\"".$depot["tx"]["bt_proceed"]."\"  id=submt onClick=\"sbm('save','','')\"></td></tr></table>";
	$ttop.= "
	<input type=hidden name=su value=\"\">";
	return $ttop;
}



function bann_save(){
	global $par,$logged_user,$depot;
	$allo=explode("\n",$par['list']);
	$alloc=array();
    $res_='';
	foreach ($allo as $e){
		if (trim($e)){
			$alloc[]=trim($e);
		}
	}
	if (count($alloc) == 0) {
		$par['su'] = 'View';
		$depot['errors'][]='No changes where made';
		return bann_view();
	}
	$start=0;
	foreach ($alloc as $it){
		$val=0;
		if (preg_match('/^(\d{0,3})\.(\d{0,3})\.(\d{0,3})\.(\d{0,3})$/',$it)) $val=1;

        $res_ = conn_sql_query("INSERT INTO ".BANN." SET 
			value = \"".sqller($it)."\",
			kind = $val
		");
		if (conn_affected_rows($res_)>0)
		$start++;
	}

	if (conn_affected_rows($res_)) {
		$depot['oks'][]=$start." ".$depot["tx"]["ok_recordsadded"]; 
	}
	else {
		$depot['errors'][]=$depot["tx"]["al_recordsadded"];		
	}

	$par['su'] = 'view';
	return bann_view();
}


/*	*	*	*	*	*	*	*	*	VIEW NEWS	*	*	*	*	*	*	*	*	*/


function bann_view(){
	global $depot,$lngs,$lngs1,$par,$logged_user;
	$ttop='';

	$ttop.="<div style='padding:5px;background:#EEE;'>";
	$ttop.="<table><tr>";
	$ttop.="<td width=20>&nbsp;</td><td width=190>".iho('IP ��� ��� cookies:')."</td>";
	$ttop.="<td>";
	$ttop.=bd_tf(@$par['kwd'],	'kwd','text', 'width:150px',	1,	'')."</td>";
	$ttop.="<td width=20>&nbsp;</td><td width=60><input type=submit name=io id='submt' value='".iho('Գ���������')."'></td>";

	$ttop.="</tr></table></div>";


	$ttop.="<a href='' onClick='sbm(\"add\",\"\",\"\"); return false;' style='float:right;margin:10px;'><img src='/gazda/img/bt_add.gif' style='margin-right:15px;margin-bottom:-5px;'>".iho('������')."</a>";

	$path="/gazda/index.php?act=announce&su=".$par['su'];
	$addon='';
	$addsql='';

	if (@$par['kwd']) {
			$addsql.=" AND ".BANN.".value LIKE \"%".sqller($par['kwd'])."%\"";
			$path.="&kwd=".htmlspecialchars($par['kwd']);
	}

	
	$sql_qty=" SELECT COUNT(*) FROM ".BANN." WHERE 1 ".$addsql;
	$count1=conn_sql_query($sql_qty) or die(conn_error());

	if (!isset($par['pg'])) $par['pg']=0;
	//$perpage=$enviro['bann_per_page'];
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
		
	if ($pages>1) {
		$ttop.="<div class=pager>";
		$ttop.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$ttop.= "<a href=\"$path&pg=$i\">".($i+1)."</a>";
			else $ttop.= "<span>".($i+1)."</span>";
		}
		$ttop.= $next_page.$nnext_page;

		$ttop.="<div style='padding-left:50px;font-size:18px;float:left;'>/ ".$count[0]."</div>";
		$ttop.="</div>";
	} else {
		$ttop.="<div style='font-size:18px;float:left;'>/ ".$count[0]."</div>";
	}

	$sql1="
			SELECT	* FROM ".BANN." 
			WHERE 1 $addsql
			ORDER BY id DESC 
			LIMIT	".$par['pg']*$perpage.",".$perpage;
	//echo $sql1;

	$qry=conn_sql_query($sql1) or die(conn_error());
	if (!conn_sql_num_rows($qry)) {
		$ttop.="<h2><br><br><br>".$depot["tx"]['he_norecords']."</h2>";
	} else {
	
			$ttop.="<table width=100% cellpadding=15 cellspacing=1  style='clear:both;'><td width=10%  class=heaad>&raquo;</td><td class=heaad width=90%>".iho("IP / CODE / E-mail / USER ID")."</td></tr>";

			for ($i=0;$i<conn_sql_num_rows($qry);$i++){
				$res=conn_fetch_assoc($qry);
				
				if ($i%2) $bg=" bgcolor=#EEEEEE"; else $bg="";
				$ttop.="<tr><td class=bord width=30><a href=\"JavaScript:rr('".$res['id']."')\" id=butt class=del title=\"".$depot["tx"]["ti_delete"]."\"></a>";
				$ttop.="</td>";
				$ttop.="
						
						<td  class=bord>";
				$ttop.="<b>".$res['value']."</b>";
					
				
				$ttop.="</td></tr>";
				
			}
	}
	$ttop.="
				<input type=hidden name=oldsu value=\"".@$par['su']."\">
				<input type = hidden name='act' value='".$par['act']."'>
				<input type = hidden name='su' value=''>
				<input type = hidden name='id' value=''>
	</table>";

	return $ttop;
}


function bann_del(){
	global $par,$depot;
	$ttop='';
	
	if (isset($par['id'])) {
		$sql="DELETE FROM ".BANN." WHERE id=\"".$par['id']."\"";	
	}

    $res_ = conn_sql_query($sql) or die(conn_error());
	if (conn_affected_rows($res_)) {
			array_unshift($depot['oks'],$depot["tx"]['ok_del1']);
	} else {
		array_unshift($depot['errors'],$depot["tx"]['al_norecs']."<br><br>");
	}
	$ttop.=bann_view();
	return $ttop;
}



function lang_js(){
$r=<<<JSCR

 <script language="javaScript">

		  <!--

		function setvalue(name,value){
				var obj = document.getElementById ? document.getElementById(name) : null;
				obj.innerHTML = value;
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
