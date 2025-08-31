<?php

if ($_SERVER['REMOTE_ADDR']=="127.0.0.1" && isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $_SERVER['REMOTE_ADDR']=$_SERVER['HTTP_X_FORWARDED_FOR'];
}


$parent_loader=1;
if ($_SERVER['REMOTE_ADDR'] =='194.44.192.110') {
	error_reporting(E_ALL);
	ini_set ('display_errors', "1");
}

function addressToCache(){
	global $depot;
	$a=explode("?",$_SERVER['REQUEST_URI']);
	if (!isset($a[1])) return md5($_SERVER['REQUEST_URI']);
	
	$newparam=array();
	foreach(explode("&",$a['1']) as $pair){
		
		$b=explode("=",$pair);
		switch ($b[0]){
			case 'pg'	:
							if (preg_match("/^(\d+)$/sU",$b[1]) && $b[1]<100) $newparam['pg']=$b[1];
							break;
			
			case 'o'	:
							if (in_array($b[1],array("popular","commented"))) $newparam['o']=$b[1];
							break;

			case 'print' :	$newparam['print']="anything";
							break;
								
		}

	}

	if (!count($newparam)) return  md5($a[0]);
	return md5($a[0]."?".implode("&",$newparam));
}




try {

	require_once("lib/etc/conf.php");

	require_once("lib/etc/conn.php");

	require_once("lib/etc/route.php");

	$time_start = getmcrotime();
	
	require_once("lib/etc/core.php");

	/**	
	*	TOTAL CACHING OR CLEAR OUTPUT
	*/

	$md_name= addressToCache();
	$htmlfilename=$_SERVER['DOCUMENT_ROOT']."/var/cache/htmlcache/".$md_name;

	require_once("lib/custom/banners.php");
	require_once("lib/etc/initstart.php");
	require_once("lib/etc/get_auth.php");
	require_once("lib/etc/checkcookie.php");
	authenticated();


	if (
		file_exists($htmlfilename) 
			&&	$depot['enviro']['if-cachehtml'] 
			&&	filemtime($htmlfilename)>(time()-$depot['enviro']['if-cachehtml']*60) 
			&&  !isset($par['commentid'])
			&&	!isset($par['berimor'])
			&&	!isset($_COOKIE['fresher'])
			&&	!isset($depot['vars']['loggeduser']['name'])
		) {
		
		$fhtml=fopen($htmlfilename,'r');
		$out = fread($fhtml, filesize($htmlfilename));
		fclose($fhtml);

	} else {

		$depot['vars']['uritocache']=$_SERVER['REQUEST_URI'];
		if (!isset($out)) $out=parse_page();
		if (
				$depot['enviro']['if-cachehtml'] 
			&&	!isset($depot['vars']['loggeduser']['name'])
			&&	!$depot['vars']['imbot']
			&&	!isset($par['q'])
			&&	(!isset($par['pg']) || @$par['pg']<100)
		) {
			$fhtml=fopen($htmlfilename,'w');
			
			fwrite($fhtml, $out);
			fclose($fhtml);
		}
	}


	$time_end = getmcrotime();
	$time = $time_end - $time_start;
	/**/if ($depot['vars']['imadmin'])  $tttime = getScriptTime($time);

	//if ($_SERVER['REMOTE_ADDR'] !=='194.44.192.110' && $_SERVER['REMOTE_ADDR'] !=='127.0.0.128');

	header("Pragma: no-cache\n");
	echo $out.@$tttime/**/;

	if ($depot['vars']['imadmin']) {
		trackSQL();
		/*print_r($_SERVER);*/
	}

} catch (Exception $e) {
    echo 'Something wrong ... : ',  $e->getMessage(), "\n";
}
