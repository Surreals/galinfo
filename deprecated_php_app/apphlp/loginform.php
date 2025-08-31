<?
//include("modulfetcher.php");
$parent_loader=1;



foreach (explode(",","conf,conn,core,forms,initstart,get_auth,checkcookie") as $m)
require_once(dirname(__FILE__)."/../lib/etc/$m.php");

$time_start = getmcrotime();

authenticated();	

//LLoad("mo_loginform");
require_once(dirname(__FILE__)."/../lib/custom/mo_loginform.php");


?>
