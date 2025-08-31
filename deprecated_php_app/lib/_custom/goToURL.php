<?
	
$depot['vars']['mod_result']=getGoToURL();	

function getGoToURL(){
	global $par;
	return parse_local(array('href'=>base64_decode(@$par['pphtmsu'])),'redirect',1);
}

?>