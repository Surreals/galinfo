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
	foreach (array('year','year1','year2') as $v) {
		if (!isset($par[$v])) $par[$v]=date("Y",$time);
		$curryear=date("Y",$time);
		$year=array();
		for ($i=($par[$v]-3);$i<=($curryear+1);$i++){
			$year[]=$i;
			$year[]=$i;
		}
	}

	

	if (!isset($par['day'])) $par['day']=date("d",$time);
	$tfrom.=bd_popup($day,	'day',	'width:50px',	1,	'')." / ";
	if (!isset($par['month'])) $par['month']=date("m",$time);
	$tfrom.=bd_popup($month,	'month', 'width:100px',	1,	'')." / ";
	$tfrom.=bd_popup($year,	'year', 'width:60px',	1,	'')."<br>";
	
	if (!isset($par['day1'])) $par['day1']=date("d",$time);
	$tto.=bd_popup($day,	'day1',	'width:50px',	1,	'')." / ";
	if (!isset($par['month1'])) $par['month1']=date("m",$time);
	$tto.=bd_popup($month,	'month1', 'width:100px',	1,	'')." / ";
	$tto.=bd_popup($year,	'year1', 'width:60px',	1,	'')."<br>";


	
	$html.="
		<table width=100% cellpadding=5>
			<tr>
			<td class=heaad width=30%>".$tfrom."</td>
			<td class=heaad width=30%>".$tto."</td>
			<td class=heaad width=20%>".bd_popup(array("1",iho("������"),2,iho("������� ����")),"itemtype",'width:100%',1,'')."</td>
			<td width=20% class=heaad><input type=submit name=srch value='".iho('Գ���������')."' id=submt></td>
			</tr>
		</table>
		
		";

		
	if (@$par['srch']) {

		$from=	$par['year']."-".$par['month']."-".$par['day'];
		$to=	$par['year1']."-".$par['month1']."-".$par['day1'];


		if ($par['itemtype']==2){

			$sql=conn_sql_query("
								
						SELECT 
								".BANSTATS.".*,
								".ADPLACES.".placename AS itemname
						FROM 
								".BANSTATS." 
						LEFT JOIN
								".ADPLACES."
						ON
								".BANSTATS.".itemid = ".ADPLACES.".id
						WHERE
								".BANSTATS.".itemtype = 2
						AND
								".BANSTATS.".ddate >= '$from'
						AND
								".BANSTATS.".ddate <= '$to'
						ORDER BY 
								".BANSTATS.".ddate
			") or die(conn_error());



		} else if ($par['itemtype']==1){
			
			$sql=conn_sql_query("
								
						SELECT 
								".BANSTATS.".*,
								".BANNERS.".bname AS itemname
						FROM 
								".BANSTATS." 
						LEFT JOIN
								".BANNERS."
						ON
								".BANSTATS.".itemid = ".BANNERS.".id
						WHERE
								".BANSTATS.".itemtype = 1
						AND
								".BANSTATS.".ddate >= '$from'
						AND
								".BANSTATS.".ddate <= '$to'
						ORDER BY 
								".BANSTATS.".ddate
			") or die(conn_error());
		}

		$data=array();
		$available=array();
		$names=array();

		while ($res=conn_fetch_assoc($sql)){
			$data[$res['ddate']][] =$res; 
			$available[$res['itemid']][$res['ddate']] =$res;
			$names[$res['itemid']]=$res['itemname'];
		}
		
		$html.="<div class='statss'><table cellspacing=0 style='font-size:11px'><tr><td width=200 style='width:200px !important;' class='bord' bgcolor='#FFFF66'>Name / Date</td>";

	
		foreach ($data as $k=>$v){
			
			$da=explode("-",$k);

			$html.="<td class='bord' bgcolor='#FFFF66'>".$da[2]."<br>".$da[1]."</td>";
		}
		
		$html.="<td class='bord' bgcolor='#CCFF33'>TOTAL</td>";

		$html.="</tr>";

		foreach ($available as $id=>$v1){
			if (!$names[$id]) continue;
			$html.="<tr  class=\"datarow\"><td class='bord'>".$names[$id]."</td>";
			$total=0;
			foreach ($data as $k=>$v){
				
				if (isset($v1[$k])){
					$d=$v1[$k]['showcount'];
					$total+=$d;
				} else {
					$d="&nbsp;";
				}
				
				$html.="<td class='bord'>$d</td>";

			}
			$html.="<td class='bord' bgcolor='#CCFF33'><b>$total</b></td>";
			$html.="</tr>";
		}

		$html.="</table></div><br><br><br><br>";
		

	}





	$html.=  "
			<input type=hidden name=act value=\"bannstats\">
			<input type=hidden name=sudir value=\"\">
			<input type=hidden name=par value=\"\">";
	$html.= "</form>";
	return $html;

}


?>
