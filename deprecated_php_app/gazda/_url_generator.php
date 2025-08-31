<?
$parent_loader=1;
header("Pragma: no-cache;\n");
require_once("../lib/etc/conf.php");
require_once("../lib/etc/conn.php");
require_once("../lib/etc/core.php");

$limit=60000;

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
		SELECT ".NEWSHEAD.".nheader,
				".NEWS.".id
		FROM ".NEWS." left join ".NEWSHEAD."
		using (id)
		WHERE ".NEWS."._stage=2
		LIMIT $limit
") or die(conn_error());



while ($res=conn_fetch_assoc($sql)){
	

	echo $res['nheader']."<br><b>".safeUrlStr($res['nheader'])."</b><hr>";
	

	conn_sql_query("
		
					UPDATE ".NEWS."
					SET 
					urlkey = \"".sqller(safeUrlStr($res['nheader']))."\",
					_stage=3
					WHERE id = ".$res['id']."
					
					"
			
	
				) or die(conn_error());
	echo $res['id']."<br>";


	ob_flush();
}


?>


