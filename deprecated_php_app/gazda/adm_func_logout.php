<?
function aget_center(){
	global $par,$errors,$gerrors,$logged_user,$isauth;
	$ttop='';
	$isauth=authenticated();
	$toret='<script language=JavaScript>';
	if (!$isauth) {
		$toret.="chgLoc(\"/gazda/\");";
	} else {
		//$newid=generate_unique(16);
		//conn_sql_query("UPDATE ".USERS." SET sessionid=\"$newid\" WHERE uname=\"".$logged_user['uname']."\"");
		session_destroy();
		setcookie('ediID', md5($_SESSION['newsmaker']), time()-600, '/');
		$toret.="chgLoc(\"/gazda/\");";
	}
	$toret.="</script>";
	return $toret;

}

?>