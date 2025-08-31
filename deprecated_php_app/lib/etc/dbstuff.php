<?

function initEnviro(){
	global $depot,$enviro;

	sqlquery("SELECT * FROM ".ENVIRO) or die(conn_error());
	$enviro_sql=conn_sql_query("SELECT * FROM ".ENVIRO);
	for ($i=0;$i<conn_sql_num_rows($enviro_sql);$i++){
		$e=conn_fetch_assoc($enviro_sql);
		$depot['enviro'][$e['envid']] = stripslashes($e['envalue']);
		$enviro[$e['envid']] = stripslashes($e['envalue']);
	}

}



function sqlquery($sql){
	global $depot, $par;

    if (isset($_SERVER["REMOTE_ADDR"]) && $_SERVER["REMOTE_ADDR"] == '178.210.132.156') {
        $filename = $_SERVER['DOCUMENT_ROOT']."/var/mysql_log.txt";
        file_put_contents($filename, $sql."\r\n\r\n\r\n", FILE_APPEND);
    }

	$depot['vars']['qry'] = isset($depot['vars']['qry']) ? ($depot['vars']['qry']+1) : 1;
	$t1 = getmcrotime();
	
	$fullSQL="";
	//if (isset($par['debug'])) $fullSQL="<hr><pre>".$sql."</pre>".var_dump(debug_backtrace());

	$p = conn_sql_query($sql) or (die(conn_error()));

	$t2 = getmcrotime();
	$depot['vars']['qrytime'] = isset($depot['vars']['qrytime']) ? ($depot['vars']['qrytime']+$t2-$t1) : ($t2-$t1);

	//echo $t1."<br>".$t2."<hr>";
	
	lastSQL($sql,$t1,$t2);
	return $p;
}



function lastSQL($sql,$t1,$t2){	
	global $depot;

	if ($depot['vars']['imadmin']) {
		fwrite($depot['fh_sql'], "************************TIME: [ ".($t2-$t1)." ]************************\r\n\r\n ".$sql."\r\n\r\n\r\n");
		$depot['vars']['mysql_tracking'][(($t2-$t1)*100000)]=$sql;
	}
	
}



function sqlquery_cached($sql,$timeout,$re_cache_id=0,$forceNoCache=false){

	global $depot,$enviro,$par;

    if (isset($_SERVER["REMOTE_ADDR"]) && $_SERVER["REMOTE_ADDR"] == '178.210.132.156') {
        $filename = $_SERVER['DOCUMENT_ROOT']."/var/mysql_log.txt";
        file_put_contents($filename, $sql."\r\n\r\n\r\n", FILE_APPEND);
    }

    $t1 = getmcrotime();

	$md_name= md5($sql);
	$filename=$_SERVER['DOCUMENT_ROOT']."/var/cache/sqlcache/".$md_name;
	$result=array();
	if (file_exists($filename) && $depot['enviro']['if-cache'] && $timeout && !$forceNoCache) {

		/*if	(false) {  */
		if (filemtime($filename)>($depot['vars']['ctime']-$timeout*60) || $timeout==1000){  

			$fh=fopen($filename,'r');
			$content = fread($fh, filesize($filename));
			fclose($fh);
			$result=unserialize($content);
			
			$t2 = getmcrotime(); 
			$depot['vars']['cqry'] = isset($depot['vars']['cqry']) ? ($depot['vars']['cqry']+1) : 1;
			$depot['vars']['cqrytime'] = isset($depot['vars']['cqrytime']) ? ($depot['vars']['cqrytime']+$t2-$t1) : ($t2-$t1);
			//echo 'Cashhe';
		} else {

			$p = sqlquery($sql);
			while ($res=conn_fetch_assoc($p)){
				$result[]=$res;
			}  
			//echo 'Changed';
			$fh=fopen($filename,'w');
			fwrite($fh, serialize($result));
			fclose($fh);
			setcacheid($md_name,$re_cache_id);
		}
		
	} else {

		
			$p = sqlquery($sql);
			while ($res=conn_fetch_assoc($p)){
				$result[]=$res;
			}
			//echo 'Created';

			if (!$forceNoCache && $depot['enviro']['if-cache'])	{
				$fh=fopen($filename,'w');
				fwrite($fh, serialize($result));
				fclose($fh);
				setcacheid($md_name,$re_cache_id);
			}/**/
	}
	
	/*$t2 = getmcrotime(); 
	$depot['vars']['qrytime'] = isset($depot['vars']['qrytime']) ? ($depot['vars']['qrytime']+$t2-$t1) : ($t2-$t1);
	
	print_r($result);
	die();   */
	return $result;
}



function setcacheid($cachekey,$recacheid){
   sqlquery("REPLACE INTO ".CACHE." SET
				cachekey = \"".$cachekey."\",
				recache  = \"".$recacheid."\"
   ");
}



function freecache($recacheid){
	 global $vars;
	 $filepath=$_SERVER['DOCUMENT_ROOT']."/var/cache/sqlcache/";

	 $sql=sqlquery("SELECT * FROM ".CACHE." WHERE recache = \"".sqller($recacheid)."\" OR  ddate < DATE(DATE_SUB(NOW(), INTERVAL 2 DAY))") or die(conn_conn_error());
	 
	 while ($res = conn_fetch_assoc($sql)){
		@unlink($filepath."/".$res['cachekey']);
		 
	 }

	sqlquery("DELETE FROM ".CACHE." WHERE recache = \"".sqller($recacheid)."\" OR  ddate < DATE(DATE_SUB(NOW(), INTERVAL 2 DAY))");
}


function sqller($parameter){
	return conn_real_escape_string(stripslashes($parameter));
}

function sqller_html($parameter){
	return conn_real_escape_string(stripslashes(htmlspecialchars($parameter)));
}



function dsb($e = 'DB Error') {
	header('HTTP/1.1 500 Internal Server Error');
	echo "<h1>There's a problem connecting to database.</h1><hr><h4>".$e."</h4>";
}
?>