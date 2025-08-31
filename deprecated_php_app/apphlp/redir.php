<?
$str='';
foreach($_GET as $k=>$v){
		if ($k !='zikurl'){
			$str.="&".$k."=".$v;
		}
}
$url=$_GET['zikurl'];
if ($str) $url.='?'.$str;
header ("Location: http://".$url);
?>