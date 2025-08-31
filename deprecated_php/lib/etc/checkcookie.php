<?

/*REFERRER COOKIE*/
if (isset($_SERVER['HTTP_REFERER'])) {
	$pos=strpos($_SERVER['HTTP_REFERER'],$_SERVER['SERVER_NAME']);
	if ($pos===false){
		$depot['referrer']=	$_SERVER['HTTP_REFERER'];
		setRefererCookie($_SERVER['HTTP_REFERER']);
	} else {
		if (isset($_COOKIE['tpreferer'])){
			$depot['http_referer'] = $_COOKIE['tpreferer'];
		}
	}
} else {
	if (isset($_COOKIE['tpreferer'])){
		$depot['http_referer'] = $_COOKIE['tpreferer'];
	}
}



if (isset($_GET['refid'])){
	setcookie('refid',$_GET['refid'],time()+3600*24*30,'/');
}

function setRefererCookie($cookieString){
	setcookie('tpreferer',$cookieString,time()+3600*24*30,'/');
}
