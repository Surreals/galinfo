<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){
	global $par, $depot;
	
	$qty=4;
	$ttop= "<h1>".iho("�����-���� �� �������")."</h1><hr><form name='ad' method=post>";
	
	if (!isset($par['su'])) $par['su']='view';
	if ($par['su']=='save') {
		saveSlide($qty);
	}
	
	$slides=array();
	$sql=conn_sql_query("SELECT * FROM ".SPECIALIDS." WHERE section=1 ORDER BY id");
	$m=0;
	while ($res=conn_fetch_assoc($sql)){
		$slides[$m]=$res;
		$m++;
	}
	
	$ttop.="<table width=100%><tr>";
	for ($i=0;$i<$qty;$i++){
		$ttop.="<td  class=heaad width=16%>ID $i</td>";
	}

	$ttop.="</tr><tr>";
	
	for ($i=0;$i<$qty;$i++){
		if (isset($slides[$i])){
			$par["slide".$i]=$slides[$i]['newsid'];
			$par["slideid".$i]=$slides[$i]['id'];
		} else {
			$par["slide".$i]="";
			$par["slideid".$i]=0;
		}

		$ttop.="<td>".bd_tf($par["slide".$i],"slide".$i,"text","width:80%","","")."
					<input type='hidden' name='slideid$i' value='".$par["slideid".$i]."'>
				</td>";
	}

	$ttop.="
			</tr>
		</table>

		<div class=sbm><input type=submit value=\"".$depot["tx"]['bt_save']."\" class='save' id=submt></div>
		<input type='hidden' name='su' value='save'>

	";

	return $ttop."</form>";
}



function saveSlide($qty){
	global $par, $depot;

	for ($i=0;$i<$qty;$i++){
		if ($par['slideid'.$i]){
			conn_sql_query("
							UPDATE ".SPECIALIDS." 
							SET newsid = \"".sqller($par['slide'.$i])."\" 
							WHERE id = \"".sqller($par['slideid'.$i])."\"
							AND section = 1
							
							");
		} else {
			conn_sql_query("
							INSERT INTO ".SPECIALIDS." 
							SET 
							newsid = \"".sqller($par['slide'.$i])."\",
							section = 1
							
			");
		}
	}

	$depot['oks'][]=iho("���� ���������");
}


?>
