<?
	
$depot['vars']['mod_result']=get_pageFooter();	

function get_pageFooter(){

	global $par;
	$pattern="footer";
	if (isset($par['print'])) $pattern.="-print";
	return parse_local(array(),$pattern,1);
}

?>