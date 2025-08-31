<?

//mb_internal_encoding("UTF-8");


$parent_loader=1;
require_once(dirname(__FILE__)."/../lib/etc/conf.php");
require_once(dirname(__FILE__)."/../lib/etc/conn.php");


if(isset($_GET['letters'])){
	
	$letters=$_GET['letters'];


	if (!mb_check_encoding($letters,"UTF-8")) {
		$letters= mb_convert_encoding($letters,"UTF-8","windows-1251");
	}


	$allwordsRaw=explode(",",$letters);
	if (trim($allwordsRaw[(count($allwordsRaw)-1)]) =="") exit();

	foreach ($allwordsRaw as $word){
		if (trim($word) !=="") $allwords[]=trim($word);
	}


	$sqlrun=conn_sql_query("
					SELECT tag
					from a_tags
					where 
					tag like \"".conn_real_escape_string(array_pop($allwords))."%\"
					order by tag
	");

	
	
	$test_array=array();
	$jsonArray=array();


	while ($res=conn_fetch_row($sqlrun)){
		$jsonArray['items'][]=$res[0]/*mb_convert_encoding($res[0],"UTF-8","windows-1251")*/;
	}

	if (strpos(@$proposedWord,@$letters) === 0){

		/*Function to set selection range
		$jsonArray['setElementRange']="setInputSelection('tags', '".htmlspecialchars($proposedWord)."', ".mb_strlen($letters).", ".mb_strlen($proposedWord).")";*/
	}

	echo json_encode($jsonArray);

}

?>
