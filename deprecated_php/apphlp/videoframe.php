<? include("modulfetcher.php");
$parent_loader=1;

$time_start = getmcrotime();
$player="";

/**/
LLoad("conf");
LLoad("conn");


if (isset($par['videofile'])) {

	$flvfile="http://".$_SERVER['HTTP_HOST']."/media/video/{$par['videofile']}.flv";
	$stillImage=$flvTitle="";
} else if (isset($par['audiofile'])) {

	$flvfile="http://".$_SERVER['HTTP_HOST']."/media/audio/{$par['videofile']}.mp3";
	$stillImage=$flvTitle="";

} else {
	$sql="SELECT * FROM ".MEDIA." WHERE filecode =\"".sqller($par['videoid'])."\"";
	$res = conn_fetch_assoc(conn_sql_query($sql));
	
	if (!isset($res['filecode'])) {
		echo "No video";
		die();
	}
	
	$stillImage='';
	if ($res['usetype']==2 /*video*/){
		$flvfile="http://".$_SERVER['HTTP_HOST']."/media/video/{$res['filename']}.flv";
		$player="/media/video";
		if ($res['picfile']) $stillImage="http://".$_SERVER['HTTP_HOST']."/media/videotmb/full/".$res['picfile'];
		
	} else {
		$player="/media/audio";
		$flvfile="http://".$_SERVER['HTTP_HOST']."/media/audio/{$res['filename']}.mp3";
	}

	$flvTitle = urlencode($res['title_ua']);

}

?>


<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>TvoeMisto.tv</title>
<script language="javascript">AC_FL_RunContent = 0;</script>
<script src="/js/AC_RunActiveContent.js" language="javascript"></script>
</head>
<body bgcolor="#555555" style='padding:0;margin:0;overflow:visible;'>




<script language="javascript">
	if (AC_FL_RunContent == 0) {
		alert("This page requires AC_RunActiveContent.js.");
	} else {
		AC_FL_RunContent(
			'codebase', 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0',
			'width', '100%',
			'height', '100%',
			'src', 'http://<?=$_SERVER["HTTP_HOST"]?><?=$player?>',
			'quality', 'high',
			'pluginspage', 'http://www.macromedia.com/go/getflashplayer',
			'align', 'middle',
			'play', 'true',
			'loop', 'true',
			'scale', 'showall',
			'wmode', 'window',
			'devicefont', 'false',
			'id', 'player',
			'bgcolor', '#ffffff',
			'name', 'player',
			'menu', 'false',
			'allowFullScreen', 'true',
			'allowScriptAccess','sameDomain',
			'movie', 'http://<?=$_SERVER["HTTP_HOST"]?><?=$player?>',
			'salign', '',
			'FlashVars','file=<?=$flvfile?>&vtitle=<?=$flvTitle?>&vimage=<?=$stillImage?>'
			); //end AC code
	}
</script>
<noscript>
	<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="100%" height="100%" id="player" align="middle">
	<param name="allowScriptAccess" value="sameDomain" />
	<param name="allowFullScreen" value="true" />
	<param name="movie" value="http://<?=$_SERVER["HTTP_HOST"]?><?=$player?>.swf?file=<?=$flvfile?>&vtitle=<?=$flvTitle?>&vimage=<?=$stillImage?>" /><param name="menu" value="false" /><param name="quality" value="high" /><param name="bgcolor" value="#ffffff" />	<embed src="http://<?=$_SERVER["HTTP_HOST"]?><?=$player?>.swf?file=<?=$flvfile?>" menu="false" quality="high" bgcolor="#ffffff" width="100%" height="100%" name="player" align="middle" allowScriptAccess="sameDomain" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />
	</object>
</noscript>
</body>
</html>
