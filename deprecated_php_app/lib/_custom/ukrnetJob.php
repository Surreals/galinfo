<?


$depot['vars']['mod_result']=get_ukrnetJob();

function get_ukrnetJob()
{
	global $depot,$par;

	$outert1 = getmcrotime();
	include('../var/ukrnet/job_9q0248thqpiugsdkljse/joblinks.php'); 
	$content=getJobInormer();
	$outert2 = getmcrotime();
	$depot['vars']['outer'] = isset($depot['vars']['outer']) ? ($depot['vars']['outer']+$outert2-$outert1) : ($outert2-$outert1);
	return $content;
	
}




?>