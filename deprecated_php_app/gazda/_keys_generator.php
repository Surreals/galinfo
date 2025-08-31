<?

$parent_loader=1;
header("Pragma: no-cache;\n");
require_once("../lib/etc/conf.php");
require_once("../lib/etc/conn.php");

$processer="
			<form method='post'>
				<br><br><br><input type=\"submit\" name=\"process\" id=\"process\" value=\"Process Now !!!\">
			</form>
";


echo $processer;

/*$d=splitByDirectories("8.jpg",$depot['path'],"100");
print_r($d);*/


if (!isset($_REQUEST["process"])) die();


$sql=conn_sql_query("
		SELECT 
				".NEWSHEAD.".nheader,
				".NEWSHEAD.".nteaser,
				".NEWSB.".nbody,
				".NEWS.".id
		FROM ".NEWS." 
		left join ".NEWSHEAD."
		using (id)

		left join ".NEWSB."
		using (id)
		order by ".NEWS.".id DESC
	

") or die(conn_error());



if (!isset($depot['filterout'])){
	$r=file($_SERVER['DOCUMENT_ROOT']."/var/tls/filterjunkout.txt");
	foreach ($r as $rr) $depot['filterout'][trim($rr)]=true;
}

	

while ($res=conn_fetch_assoc($sql)){
	

	echo "<h2>".$res['nheader']."</h2>";

	$words=array();

	$text=$res['nheader']." ".$res['nteaser']." ".$res['nbody'];

	foreach(array('nheader','nteaser','nbody') as $part){
	
		foreach (explode(" ",cleanIndex($res[$part])) as $wor){
			$wor=trim($wor);
			
			if (!$wor || $wor=="&#13;") continue;
			
			if (isset($depot['filterout'][mb_strtolower($wor,"UTF-8")])) continue;
			if (substr($wor,0,1)=="&") continue;
			
			if (!isset($words[$wor])) $words[$wor]=1;
			else $words[$wor]++;
		}

	}
	echo cleanIndex($text)."<hr>";/**/

	arsort($words);
	
	$words=array_slice($words,0,10); 
	$keys=array();
	foreach ($words as $k=>$v){
		if ($k===0) continue;
		$keys[]=htmlspecialchars($k);
	}

	echo "<hr>";

	/*conn_sql_query("
		
					UPDATE ".NEWS."
					SET 
					urlkey = \"".sqller(safeUrlStr($res['nheader']))."\"
					WHERE id = ".$res['id']
			
	
				) or die(conn_error());*/


	ob_flush();
}


function cleanIndex($str){
	global $depot;

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
	$pattern=mb_convert_encoding('/[\^\?��\'",\[\]\}\{\\n\\r��\!�\:\(\)*\.(\t+)]/su',"UTF-8");

	$str=preg_replace($pattern,' ',$str);
	$str=str_replace(array('&raquo;','&laquo;','&quot;', '&nbsp;'),'',$str);

	return $str;

}

?>


