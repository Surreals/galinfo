<?
$parent_loader=1;
header("Pragma: no-cache;\n");
require_once("../lib/etc/conf.php");
require_once("../lib/etc/conn.php");
require_once("../lib/etc/core.php");
require_once("adm_func.php");

	$current_banner=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".BANNERS." WHERE id = \"".sqller($par['id'])."\""));
	$depot['bannerloaders']=array();
	$ttop="";

	/*ON SITE*/
	if ($current_banner['btype']==1) { /*if is file based*/
		preg_match('/(.*)(\.swf)$/',$current_banner['bfile'],$mymtch);
		if (isset($mymtch[2])) { /*if is swf*/
			$code=str_replace(
						array('[[filename]]','[[width]]','[[height]]'),
						array(	$current_banner['bfile'].$current_banner['bpar'],
								$current_banner['bwidth'],
								$current_banner['bheight'] ),$depot['default_flash_pattern']);
		} else {
			$code="<a href=\"".$current_banner['blink']."\"><img src=\"/var/things/".$current_banner['bfile']."\"></a>";
		}

		if ($current_banner['loadtype'] == 1){
			if (!$current_banner['loadcode'])
				$depot['bannerloaders'][]='<script type="text/javascript">setvalue("testbanner","'.puttojs($code).'")</script>';
			else 
				$depot['bannerloaders'][]=$current_banner['loadcode'];

			$code='';
		}
	} else {
		$code=getfromsql($current_banner['onsitecode'],0);
		if ($current_banner['loadtype'] == 1){

			if (!$current_banner['loadcode']){
				$depot['bannerloaders'][]='<script type="text/javascript">setvalue("testbanner","'.puttojs($code).'")</script>';
				$code='';
			}
			else $depot['bannerloaders'][]=$current_banner['loadcode'];

			/*$code='';*/
		}
	}
	$ttop.=$code;


?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>БАНЕР</title>
	<meta http-equiv="refresh" content="300">
	<meta name="description" content="" />
	<meta name="keywords" content="" />
	<meta name="generator" content="zmolo.com" />
	<link rel="stylesheet" type="text/css" href="/css/zik.css" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<link rel="shortcut icon" href="/gazda/img/favicon.ico" type="image/x-icon"/>	
		<script language='javascript' type="text/javascript"  src='js/ajaxupload.js'></script>
		<script language='javascript' type="text/javascript"  src='js/adm_default.js'></script>
		<script language='javascript' type="text/javascript"  src='adm_js.php'></script>
		<script language='javascript' type="text/javascript"  src='js/popups.js'></script>
		<script language='javascript' type="text/javascript"  src='ckeditor/ckeditor.js'></script>
		<script type="text/javascript" src="/gazda/js/ajax.js"></script>
		<script type="text/javascript" src="/gazda/js/ajax-dynamic-list-keydown.js"></script>
		<script type="text/javascript" src="../js/jquery.js"></script>
		<script type="text/javascript" src="/gazda/js/initjs.js"></script>
	<script>
		function setvalue(name,value){
			var obj = document.getElementById ? document.getElementById(name) : null;
			if (obj == null) return;
			
			obj.innerHTML = value;
		}
	</script>
</head>
<body style='background:#FFF;text-align:left;'>
	<div id='testbanner'>
	<?=$code?>
	</div>
</body>
<?=implode("\n",$depot['bannerloaders'])?>
</html>
