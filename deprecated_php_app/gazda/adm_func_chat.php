<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){
		global $par,$depot,$lngs;
		$ttop='';
		/*if (!require_level('ac_chat')){
			$depot['errors'][]=$depot['tx']['he_addchat'];
			return;
		}*/



		$lang_pars=array_keys($lngs);
		if (!isset($par['lang']) || !isset($lngs[$par['lang']][0])) $par['lang']=$lang_pars[0];

		if (!isset($par['su']) || !trim($par['su'])) $par['su']='v';
		
		switch ($par['su']){
			case "v": 
					$ttop.=chat_view();	break;

			case "a": 	
					$ttop.=chat_add();	break;

			case "e": 
					$ttop.=chat_add();	break;

			case "sa": 
			case "se": 
					$ttop.=chat_save();	break;

			case "remove": 
					$ttop.= chat_del();break;

		}
		$ttop= "<h1>".$depot['tx']['he_chat']."</h1><hr><form name='ad' method=post><div style='padding:5px;background:#EEE;'>".$ttop;

		$ttop.= "</div></form>";
		return $ttop;

}


/*	*	VIEW CHATS	*	*/


function chat_view(){
	global $depot,$par,$lngs;
	$ttop='';
	
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'v';

	foreach ($lngs as $k=>$v) {
		$l[]=$k;
		$l[]=$v[0];
	}
	
	//if ($errors) $ttop.=errors();

	if ($par['su'] == 'add')
		$ttop.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'onChange = "chng_lang()"');
	else if ($par['su'] == 'edit')
		$ttop.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'');

	$ttop.="</div>";


	$path="/gazda/index.php?act=chat&lang=".$par['lang']."&su=".$par['su'];
	
	$sql_qty=" SELECT COUNT(*) FROM ".CHATL." WHERE lang=\"".$par['lang']."\"";
	$count1=conn_sql_query($sql_qty) or die(conn_error());

	if (!isset($par['pg'])) $par['pg']=0;
	//$perpage=$enviro['news_per_page'];
	$perpage=20;
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
			SELECT id,nguest,DATE_FORMAT(chatdate,'%d.%m.%y %H:%i') as ddate,lang 
			FROM ".CHATL." 
			WHERE lang=\"".$par['lang']."\"
			ORDER BY chatdate DESC 
			LIMIT		".$par['pg']*$perpage.",".$perpage;
	//echo $sql1;
	
	$ttop.="<a href='' onClick='sbm(\"a\",\"\",\"\"); return false;' style='float:right;margin-top:-40px;'><img src='/gazda/img/bt_add.gif' style='margin-right:15px;margin-bottom:-5px;'>".iho('������')."</a>";

	$qry=conn_sql_query($sql1) or die(conn_error());
	if (!conn_sql_num_rows($qry))$ttop.="<h2><br><br><br>".$depot['tx']['he_norecords']."</h2>";
	else {
	
		$ttop.="<table width=100% cellpadding=5 cellspacing=0 style='clear:both;'><tr>
						<td width=15% class=heaad>&nbsp;
						</td>
						<td class=heaad width=75%>&nbsp;
						</td>
						<td width=15%  class=heaad>&raquo;
						</td></tr>";

		for ($i=0;$i<conn_sql_num_rows($qry);$i++){
			$res=conn_fetch_assoc($qry);
			if ($i%2) $bg=" bgcolor=#EEEEEE"; else $bg="";
			$ttop.="
					<tr>
						<td  class=bord  $bg  style='padding:7px;'>".$res['ddate']."</td>
						<td  class=bord  $bg style='padding:7px;'>";
			$ttop.="<a href='/gazda/?act=chatrun&su=v&chid=".$res['id']."'>".$res['nguest']."</b>";
			$ttop.="</a></td><td  class=bord  $bg>";
			
			$ttop.="<a href=\"JavaScript:sbm('e','".$res['id']."','')\" id=butt class=edit title=\"".$depot['tx']["ti_edit"]."\"></a>";
			$ttop.="<a href=\"JavaScript:rr('".$res['id']."')\" id=butt class=del title=\"".$depot['tx']["ti_delete"]."\" style='float:right;'></a>";
			$ttop.="</td></tr>";
		}
		$ttop.="</table>";
	}

	$ttop.="<input type=hidden name=oldsu value=\"".@$par['su']."\"><input type = hidden name='act' value='".$par['act']."'>";
	$ttop.="<input type = hidden name='su' value=''> <input type = hidden name='id' value=''>";
	return $ttop;
}



function chat_add(){
	global $par,$lngs1,$lngs,$logged_user,$depot;
	$ttop='';
	$nnow=time();
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'v';
	
	if ($par['su'] == 'e') {
		/*		CHECK AVAILABILITY		*/
		$toedit=conn_fetch_assoc(conn_sql_query("
						SELECT	*,
								DATE_FORMAT(chatdate,	'%d.%m.%Y.%H.%i')	AS cd,
								DATE_FORMAT(startdate,	'%d.%m.%Y.%H.%i')	AS sd,
								DATE_FORMAT(enddate,	'%d.%m.%Y.%H.%i')	AS ed
						FROM		".CHATL." 
						WHERE		".CHATL.".id = \"".sqller($par['id'])."\""));

		if (count($toedit)<3) {
			$depot['errors'][]=$depot['tx']['al_noid'];
			$par['su']=$toview;
			return chat_view();
		}
		$do_not_affect=array('lang');
		$awaiting_array=array("region","rubric","theme");
		foreach ($toedit as $k=>$v){
			if (!in_array($k,$do_not_affect)) {
				if (!in_array($k,$awaiting_array)) {
					$par[$k] = stripslashes($v);
				} else {
					$par[$k] = explode(',',stripslashes($v));
				}
			}
		}
		list(	$par['day'],
				$par['month'],
				$par['year'],
				$par['hour'],
				$par['min']) = explode(".",$par['cd']);
		list(	$par['day1'],
				$par['month1'],
				$par['year1'],
				$par['hour1'],
				$par['min1']) = explode(".",$par['sd']);
		list(	$par['day2'],
				$par['month2'],
				$par['year2'],
				$par['hour2'],
				$par['min2']) = explode(".",$par['ed']);


		$par['lang'] =$lngs[$toedit['lang']][1];;
	} else $par['published'] = '1';


	foreach ($lngs1 as $k=>$v) {
		$l[]=$k;
		$l[]=$v[0];
	}
	
	//if ($errors) $ttop.=errors();
	$ttop.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'');
	$ttop.="</div>";
	$ttop.="
		<table width=100% cellpadding=5 cellspacing=1>
			<tr><td width=600 valign=top>";
				
	$ttop.="<label for=nheader>".iho('ó���')."</label>".bd_tf(@$par['nguest'],'nguest','text','width:600px','',1);
	$ttop.="<label for=nteaser>".iho('����� ���-�����������')."</label>".bd_tar(@$par['teaser'],'teaser','600px;','100px',2);
	
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
	$ttop.="<table width=99% cellspacing=10 style='border-bottom:#CCC solid 1px;background-color:#FFFFCC;'>";
	$ttop.="<tr><td width=30%>".	iho('������� �����������')."</td><td width=70%>";
	if (!isset($par['hour'])) $par['hour']=date("H",$time);
	$ttop.=bd_popup($hour,	'hour',	'width:50px;',	1,	'')." : ";
	if (!isset($par['min'])) $par['min']=date("i",$time);
	$ttop.=bd_popup($min,	'min',	'width:50px',	1,	'')."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	if (!isset($par['day'])) $par['day']=date("d",$time);
	$ttop.=bd_popup($day,	'day',	'width:50px',	1,	'')." / ";
	if (!isset($par['month'])) $par['month']=date("m",$time);
	$ttop.=bd_popup($month,	'month', 'width:100px',	1,	'')." / ";
	$ttop.=bd_popup($year,	'year', 'width:60px',	1,	'')."</td></tr>";
	
	$ttop.="<tr><td width=30%>".	iho('������� ������� ��������')."</td><td width=70%>";
	if (!isset($par['hour1'])) $par['hour1']=date("H",$time);
	$ttop.=bd_popup($hour,	'hour1',	'width:50px;',	1,	'')." : ";
	if (!isset($par['min1'])) $par['min1']=date("i",$time);
	$ttop.=bd_popup($min,	'min1',	'width:50px',	1,	'')."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	if (!isset($par['day1'])) $par['day1']=date("d",$time);
	$ttop.=bd_popup($day,	'day1',	'width:50px',	1,	'')." / ";
	if (!isset($par['month1'])) $par['month1']=date("m",$time);
	$ttop.=bd_popup($month,	'month1', 'width:100px',	1,	'')." / ";
	$ttop.=bd_popup($year,	'year1', 'width:60px',	1,	'')."</td></tr>";
	
	$ttop.="<tr><td width=30%>".	iho('ʳ���� ������� ��������')."</td><td width=70%>";
	if (!isset($par['hour2'])) $par['hour2']=date("H",$time);
	$ttop.=bd_popup($hour,	'hour2',	'width:50px;',	1,	'')." : ";
	if (!isset($par['min2'])) $par['min2']=date("i",$time);
	$ttop.=bd_popup($min,	'min2',	'width:50px',	1,	'')."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	if (!isset($par['day2'])) $par['day2']=date("d",$time);
	$ttop.=bd_popup($day,	'day2',	'width:50px',	1,	'')." / ";
	if (!isset($par['month2'])) $par['month2']=date("m",$time);
	$ttop.=bd_popup($month,	'month2', 'width:100px',	1,	'')." / ";
	$ttop.=bd_popup($year,	'year2', 'width:60px',	1,	'')."</td></tr>";
	$ttop.="</table>";


	$ttop.="<div class=dframe><div class=bod><table width=97% cellpadding=2 cellspacing=0 border=0>";
	$ttop.="<tr><td width=40>".bd_chk('published','1',10,'')."</td><td>".iho('&nbsp;&nbsp;���������� ����������� �� ����')."</td></tr>";
	$ttop.="</table></div></div>";

	if (require_level('ac_newsadmin')){
		if (@$par['id'])
			$ttop.="<input type=button name=addne id='submt' value='".iho('��������')."' style='margin:10px 0 20px 0px !important;' onClick=\"JavaScript:r('".$par['id']."')\">";
	}
	$ttop.="<input type=submit name=addne id='submt' class=save value='".iho('��������')."' style='margin:10px 0 20px 250px !important;'>";
	$ttop.="</td>";
	$ttop.="<td width=350 valign='top'>";
	$ttop.=image_maker(@$par['images'],'images');
	$ttop.="<a href='' onClick='showP(\"imageManagerPopup\");return false;' class='camera'><span id='imageqty'>".$depot['var']['imagesqty']."</span></a>";

	$ttop.="</td></tr></table>";
	$ttop.="<hr>";
		
	$ttop.="<div name='langlex' id='langlex'></div>";
	$ttop.=  "<input type=hidden name=act value=\"chat\">";
	
	$ttop.="<input type=hidden name=su value=\"s".$par['su']."\"><input type=hidden name=id value=\"".@$par['id']."\"><input type=hidden name=par value=\"\">";
	$ttop.="<input type=hidden name=oldsu value=\"".@$par['oldsu']."\">";
	return $ttop;
}


function chat_save(){
	global $par,$depot,$logged_user,$lngs1;
	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'v';

	$ddate=	$par['year']."-".$par['month']."-".$par['day']." ".$par['hour'].":".$par['min'].":00";
	$ddate1=	$par['year1']."-".$par['month1']."-".$par['day1']." ".$par['hour1'].":".$par['min1'].":00";
	$ddate2=	$par['year2']."-".$par['month2']."-".$par['day2']." ".$par['hour2'].":".$par['min2'].":00";
	//echo $lngs1[$par['lang']][1];return;


	switch ($par['su']) {
		case "sa":	
						$sql=	"INSERT INTO ".CHATL."	SET ";
						break;
		case "se":
						$sql=	"UPDATE ".CHATL."	SET ";
						break;
	}

	if (isset($par['published'])) $pub=1; else $pub=0;

	$sql.="
			nguest		=	\"".sqller($par['nguest'])."\",
			teaser		=	\"".sqller($par['teaser'])."\",
			images		=	\"".sqller($par['selimgs_images'])."\",
			chatdate	=	\"".sqller($ddate)."\",
			startdate	=	\"".sqller($ddate1)."\",
			enddate		=	\"".sqller($ddate2)."\",
			published	=	\"".$pub."\",
			lang		=	\"".sqller($par['lang'])."\"";
	

	//
	$where='';

	if($par['su'] == 'se'){
		$where =" WHERE id = \"".sqller($par['id'])."\"";	
	}
	$sql.=$where;
    $res_ = conn_sql_query($sql) or die (conn_error());
	if (conn_affected_rows($res_)>0) {
		if ($par['su'] == 'sa') $oks[] = "1 ".$depot['tx']['ok_recordsadded'];
		else $oks[] = $depot['tx']['ok_edited'];
	} else {
		$depot['errors'][]=$depot['tx']['al_recordsadded'];
	}
	$par['su'] = $toview;
	freecache(6);
	return chat_view();

}

function chat_del(){
	global $par,$errors,$oks,$depot;
	$ttop='';

    $res_ = conn_sql_query("DELETE FROM ".CHATL." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($oks,$depot['tx']['ok_del1']);
	} else {
		array_unshift($errors,$depot['tx']['al_norecs']."<br><br>");
	}

	$ttop.=chat_view();
	freecache(6);
	return $ttop;
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
