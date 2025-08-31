<?

//include("modulfetcher.php");
$parent_loader=1;


foreach (explode(",","conf,conn,core,forms,initstart,get_auth,checkcookie") as $m)
require_once(dirname(__FILE__)."/../lib/etc/$m.php");

authenticated();	

///lets try to get data off ...

require_once(dirname(__FILE__)."/../lib/etc/upd_functions.php");

if (@$par['passed']) {
	$pairs=explode('&',$par['passed']);
	foreach ($pairs as $k){
		$pair=explode('=',$k);
		$par[$pair[0]] = unescape(@$pair[1]);
	}
}

switch (@$par['act']){

	case "renew":					$html=get_renewpassword();	break;
	case "login":					$html=get_logmein();			break;
	case "register":				$html=get_register();		break;
	case "addcomment":				$html=get_comment();			break;
	case "votecomment":				$html=get_commentvote();		break;

	case "chpage":					$html=get_reviewpage();		break;
	case "askchat":					$html=get_askchat();			break;
	//case "pollaction":				$html=get_poll();			break;
	case "listAnalytics"	:		$html=get_analytics_ajax();	break;
	case "sendme"	:				$html=getSent();				break;

	case "remprodimg":		$html=get_remprodimg();		break;	
	case "savephototitles":	$html=get_savePhotoTitles();break;
	case "listblock":		$html=get_articlesListblocks();	break;
	case "pollaction"	:	$html=get_pollAction();	break;


}

$closeHTML=$startHTML="";

if (!@$depot['vars']['noajaxheader']) {
	$startHTML="<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></head><body>
		<form name=upd method=post action='/apphlp/upd.php'>
			<input type=hidden name=act value=''>
			<input type=hidden name=passed value=''>
		</form>
	";

	$closeHTML="</body></html>";
}

if (@$depot['vars']['uno']) {
	$set_rr['cde'] = $depot['vars']['uno'];
	$set_rr['usr'] = @$par['myname'];
	$str=serialize($set_rr);

	if (isset($_COOKIE['uno']) && isset($_COOKIE['myname'])){

		setcookie( 'uno' ,		$_COOKIE['uno'],		time()+60*60*24*30,'/');
		setcookie( 'myname',	$par['myname'],			time()+60*60*24*30,'/');
	} else {

		setcookie( 'uno' ,		$depot['vars']['uno'],	time()+60*60*24*30,'/');
		setcookie( 'myname',	$par['myname'],			time()+60*60*24*30,'/');
	}
}

//LLoad("initstart");
echo $startHTML.$html.$closeHTML;



?>