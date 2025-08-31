<?


function aget_center(){
	global $par,$errors,$oks, $tx,$depot;
	$html='';
	$html.= "<form name='ad' method=post><h1>".iho("����������")."</h1>";

	$tfrom="";
	$tto="";

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
		$month[]=sprintf("%02d",$i);
		$month[]=$depot["tx"][$mo_tx[($i-1)]];
	}

	$time=time();
	foreach (array('year1') as $v) {
		if (!isset($par[$v])) $par[$v]=date("Y",$time);
		$curryear=date("Y",$time);
		$year=array();
		for ($i=($par[$v]-3);$i<=($curryear+1);$i++){
			$year[]=$i;
			$year[]=$i;
		}
	}

	
	$timefrom=$time-3600*24*31;
	if (!isset($par['day']))	$par['day']=date("d",$timefrom);
	$tfrom.=bd_popup($day,	'day',	'width:50px',	1,	'')." / ";
	if (!isset($par['month']))	$par['month']=date("m",$timefrom);
	$tfrom.=bd_popup($month,	'month', 'width:100px',	1,	'')." / ";
	if (!isset($par['year']))	$par['year']=date("Y",$timefrom);
	$tfrom.=bd_popup($year,	'year', 'width:60px',	1,	'')."<br>";
	
	
	if (!isset($par['day1'])) $par['day1']=date("d",$time);
	$tto.=bd_popup($day,	'day1',	'width:50px',	1,	'')." / ";
	if (!isset($par['month1'])) $par['month1']=date("m",$time);
	$tto.=bd_popup($month,	'month1', 'width:100px',	1,	'')." / ";
	if (!isset($par['year1'])) $par['year1']=date("Y",$time);
	$tto.=bd_popup($year,	'year1', 'width:60px',	1,	'')."<br>";


	
	$html.="
		<table width=100% cellpadding=5>
			<tr>
			<td class=heaad width=30%>".$tfrom."</td>
			<td class=heaad width=30%>".$tto."</td>
			<td class=heaad width=20%>".bd_popup(array("1",iho("��������"),2,iho("��������")),"itemtype",'width:100%',1,'')."</td>
			<td width=20% class=heaad><input type=submit name=srch value='".iho('��������')."' id=submt></td>
			</tr>
		</table>
		
		";

		
	if (@$par['srch']) {

		$from=	$par['year']."-".$par['month']."-".$par['day'];
		$to=	$par['year1']."-".$par['month1']."-".$par['day1'];


		if ($par['itemtype']==1){

			$sql=conn_sql_query("
								
						SELECT 
								".USERS.".uname_ua as usrnm,
								COUNT(*) AS ncount,
								SUM(CHAR_LENGTH(".NEWSI.".indexed)) AS charsqty,
								SUM(".STATVIEW.".qty) AS stt,
								COUNT(".COMMENTS.".id) AS comqty

						FROM 
								".USERS." 
						LEFT JOIN	".NEWS."	ON	".NEWS.".nauthor = ".USERS.".id 
						LEFT JOIN	".NEWSI."	ON	".NEWS.".id = ".NEWSI.".id
						LEFT JOIN	".STATVIEW." ON	".NEWS.".id = ".STATVIEW.".id
						LEFT JOIN	".COMMENTS." ON	".NEWS.".id = ".COMMENTS.".newsid
						WHERE ndate >= '$from' AND ndate <= '$to'
						GROUP BY ".USERS.".id
						HAVING ncount >0
						ORDER BY ncount DESC
			") or die(conn_error());



		} else if ($par['itemtype']==2){
			
			$sql=conn_sql_query("				
						SELECT 
								".FUSERS.".name as usrnm,
								COUNT(*) AS ncount,
								SUM(CHAR_LENGTH(".NEWSI.".indexed)) AS charsqty,
								SUM(".STATVIEW.".qty) AS stt,
								COUNT(".COMMENTS.".id) AS comqty
						FROM 
								".FUSERS." 
						LEFT JOIN	".NEWS."	ON	".NEWS.".userid = ".FUSERS.".id 
						LEFT JOIN	".NEWSI."	ON	".NEWS.".id = ".NEWSI.".id
						LEFT JOIN	".STATVIEW." ON	".NEWS.".id = ".STATVIEW.".id
						LEFT JOIN	".COMMENTS." ON	".NEWS.".id = ".COMMENTS.".newsid
						WHERE ndate >= '$from' AND ndate <= '$to'
						GROUP BY ".FUSERS.".id
						HAVING ncount >0
						ORDER BY ncount DESC
			") or die(conn_error());

		}

	
		$html.="
					<table cellspacing=5 width=100%>
						<tr>
							<td width=50% class='heaad'>".iho('����������')."</td>
							<td width=15% class='heaad'>".iho('���������')."</td>
							<td width=15% class='heaad'>".iho('�����')."</td>
							<td width=15% class='heaad' style='color:#777'>".iho('���������')."</td>
							<td width=15% class='heaad' style='color:#777'>".iho('���������')."</td>
						</tr>	
						";

		while ($res=conn_fetch_assoc($sql)){
			$html.="
					<tr class='datarow' style='padding:10px;'>
						<td class='bord'>".$res['usrnm']."</td>
						<td class='bord'><b>".$res['ncount']."</b></td>
						<td class='bord'>".$res['charsqty']."</td>
						<td class='bord' style='color:#777'>".$res['stt']."</td>
						<td class='bord' style='color:#777'>".$res['comqty']."</td>
					</tr>
			";
		}
		$html.="</table><br><br><br><br>";	
	}


	$html.=  "
			<input type=hidden name=act value=\"ustat\">
			<input type=hidden name=sudir value=\"\">
			<input type=hidden name=par value=\"\">";
	$html.= "</form>";
	return $html;

}


?>
