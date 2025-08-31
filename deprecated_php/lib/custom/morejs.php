<?
$depot['vars']['mod_result']=get_morejs();

function get_morejs(){
	global $par,$depot;
	$html="";
	if (isset($depot['vars']['morejs'])) {
		$html.=implode(" ",$depot['vars']['morejs']);
	}

	if (!isset($_COOKIE['splashed']) && !isset($_COOKIE['zmliked']) && $_SERVER['REQUEST_URI']!=="/"){
		setcookie('splashed',1,time()+3600*24*5,'/');
		$html.="<script type=\"text/javascript\">domesplash=true</script>";
	}

	return $html;
}


/*makeUkrnetLink()*/