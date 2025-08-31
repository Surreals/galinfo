<?
/*	 */
$depot['vars']['mod_result']=get_morejs();


function get_morejs(){
	global $par,$depot;
	$html="";

	if(@$par['pphtm'] == 'myaccount') $html.="<script type=\"text/javascript\" src=\"/js/fuploads.js\"></script>";

	return $html;
}



		
	
	

/*makeUkrnetLink()*/