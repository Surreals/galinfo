<html>
<head>
<?
include("modulfetcher.php");
$parent_loader=1;
LLoad("conf");
LLoad("conn");
LLoad("core");
//LLoad("initstart");

?>

<meta http-equiv="Content-Type" content="text/html; charset=<?=$vars['langs'][$par['lng']]['site_charset'];?>">
</					
<body>
<?
$ttop="";

switch ($par['act']){
	case "gallery":$ttop=get_gallerytext();break;
	default:largimage();
}

function get_gallerytext(){
	global $par,$errors,$gerrors,$lxs;
	$ttop='';



	list($lngg,$idd)=explode("___",$par['id']);
	$sql="SELECT * FROM ".PICS." WHERE id = \"".$idd."\"";
	$textt=conn_fetch_assoc(sqlquery($sql));
	$ttop.="<script language=JavaScript>";

	$par['lng']=$lngg;

	if(is_array($textt) && $textt["title_".$lngg]) {
		$ttop.="window.top.setvalue(\"text\",\"".puttojs("<p>".$textt["title_".$lngg])."</p>"."\");";
	} else {
		$ttop.="window.top.setvalue(\"text\",\"<p>***</p>\");";
	}

	if ($textt['raw']) {
		$size=filesize($_SERVER['DOCUMENT_ROOT']."/gallery/raw/".$textt['filename']);
		$kb_size=sprintf("%.2f",($size/1024));
		$download="<a href='/gallery/raw/".$textt['filename']."' target='_blank'>".$lxs['he_downraw']." ($kb_size ".$lxs['he_kb'].")</a>";
	} else {
		$download='';
	}
	$ttop.="window.top.setvalue(\"download\",\"".puttojs($download)."\");";

	$ttop.="</script>";
	return $ttop;

}


function largeimage(){
	global $par,$errors,$gerrors;
	$ttop='';
	list($iim,$ihea) = get_large_image($par['imageid'],$par['ulang']);
	$var=$iim."<h3>".$ihea."</h3>";
	$var=getfromdb($var,$par['ulang']);
	$ttop.= "<script language=JavaScript>window.top.setvalue(\"fullimage\",\"".puttojs($var)."\");</script>";

}

echo $ttop;

?>
</body>
<html>