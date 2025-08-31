<?
	
$depot['vars']['mod_result']=get_pageBanner();	

function get_pageBanner(){

	global $par;
	$bannerplace="Regular";

	if (!isset($par['articletype']) && !isset($par['filterNews']) && !isset($par["rubric_id"])) $bannerplace="Home";

	
	return parse_local(array(),"topBanner".$bannerplace,1);
}

?>