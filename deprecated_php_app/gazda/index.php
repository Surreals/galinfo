<?
//include("adm_modloader.php");
$parent_loader=1;
header("Pragma: no-cache;\n");
require_once("../lib/etc/conf.php");
require_once("../lib/etc/conn.php");
require_once("../lib/etc/core.php");

require_once("adm_func.php");

ob_start();
session_name("newsmaker");
session_start();
ini_set ('display_errors', "1");


$isauth=authenticated();
$pagetitle	=	"ADMINISTRATOR";
$pagedecr	=	"ADMINISTRATOR";
$pagekeys	=	"ADMINISTRATOR";


if (!$isauth || isset($par['gologin'])){
	$par['act']='login';
} else {
	if (!isset($par['act'])) $par['act']='default';

}





require_once("adm_func_".$par['act'].".php");

list($var_menu1,$var_menu2)=array('','');

if ($isauth) {
	$var_menu1=		aget_menu1();
	$var_menu2=		aget_menu2();
}
$var_center=	aget_center();
/*$var_errors=	errors();
$var_oks=		oks();*/


require_once('adm_templ.php');
?>


