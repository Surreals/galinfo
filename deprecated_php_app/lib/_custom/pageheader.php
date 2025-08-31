<?
	
$depot['vars']['mod_result']=get_pageHeader();	

function get_pageHeader(){

	global $par;
	$pattern="pageheader";
	if (isset($par['print'])) $pattern.="-print";
	return parse_local(array("rubric"=>@$par['rubric_id']?$par['rubric_id']."/":""),$pattern,1);
}