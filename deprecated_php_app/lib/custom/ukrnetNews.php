<?


$depot['vars']['mod_result']=get_ukrnetNews();

function get_ukrnetNews()
{
	global $depot,$par;

	$outert1 = getmcrotime();
	include('../var/ukrnet/news_ksdufhwot9349234/novinator.php'); 
	$content=Novinator_get();
	$outert2 = getmcrotime();
	$depot['vars']['outer'] = isset($depot['vars']['outer']) ? ($depot['vars']['outer']+$outert2-$outert1) : ($outert2-$outert1);
	return $content;
	
}




?>