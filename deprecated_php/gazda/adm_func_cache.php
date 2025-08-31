<?

function aget_center(){

		global $par,$depot;
		///$ttop=cache_js();
	
		$ttop='';
		$ttop.= "<h1>".iho("Кеш HTML сторінок")."</h1><hr><form name='ad' method=post enctype=\"multipart/form-data\" >";
		
		if (!isset($par['su']) || ($par['su']=='')) $par['su']='v';
		switch ($par['su']){
			case "v"		:	
			case "goclean"		:	$ttop.= cache_view();		break;
			
		}

		$ttop.="<input type=hidden name='act' value='".$par['act']."'>";
		$ttop.= "</form>";
		return $ttop;

}




function cache_view(){
	global $par,$depot,$oks,$errors;
	$ttop='';
	$disall=array('.','..','.htaccess','Thumbs.db');

	$dirname=$_SERVER['DOCUMENT_ROOT']."/var/cache/htmlcache";

	if ($par['su']=='goclean'){
				
			if ($dir = opendir($dirname)) {
				$d_qty=0;
			
				while (($file = readdir($dir)) !== false) {

					if (in_array($file,$disall)) continue;
					
					unlink($dirname."/".$file);
					$d_qty++;
				}
			}
			$oks[]=iho('Видалено файлів: '.$d_qty);

	}

	


	if ($dir = opendir($dirname)) {
		$qty=0;
		$total=0;


		while (($file = readdir($dir)) !== false) {

				if (in_array($file,$disall)) continue;
				
				$qty++;
				$total+=filesize($dirname."/".$file);
				
			}
	}

	$ttop.="<table width=100% cellpadding=5 cellspacing=1><tr>
			<td class=heaad width=55%>&nbsp;</td>
			<td class=heaad width=55%>&nbsp;</td>
	</tr>
	<tr>
		<td>
			<h2 style='padding-top:70px;'>".iho("Інформація про кеш:")."</h2>
			<table width=60%>
				
				<tr>
					<td><b>".iho("Кількість кешованих запитів").": </b>
					</td>

					<td><span style='font-size:16px'>$qty</span>
					</td>
				</tr>

				<tr>
					<td><b>".iho("Загальний обєм").": </b>
					</td>

					<td><span style='font-size:16px'>".sprintf('%d',($total/1024))." Kb</span>
					</td>
				</tr>


			</table>
			
			<br> <br><br><br><br>



			

		</td>
				
		<td  style=\"text-align:center !important;border-right:#CCC solid 1px;background:#EEE; \">   
				<br><br><br><br><a href='/adm?act=cache&su=goclean' style='padding:50px 0;display:block;font-size:14px;'>&rarr;".iho("Очистити кеш повністю")."</a> <br><br><br><br>
		</td>
	</tr>
	
	
	
	";

	$ttop.="</table>";
	$ttop.=  "<input type=hidden name=su value=\"upload\">";
	return $ttop;
}










?>
