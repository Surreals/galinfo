<?php
die;
require_once("lib/etc/conf.php");
require_once("lib/etc/conn.php");
require_once("lib/etc/stuff.php");

require_once("lib/etc/core.php");
/*


header('HTTP/1.1 503 Service Temporarily Unavailable');
header('Status: 503 Service Temporarily Unavailable');

*/


$par['lng']='ua';

$obj=explode("/",$_SERVER['REQUEST_URI']);
$news=explode(".",$obj[(count($obj)-1)]);
$news_id=$news[0];


$query="SELECT * FROM ".NEWS." WHERE  old_id = \"".$news_id."\" ";


$rubrics=array(
	'politic'	=>1,
	'economic'	=>2,
	'svit'		=>3,
	'zhyttya'	=>4,
	'kultura'	=>5,
	'sport'		=>6,
	'turizm'	=>7
);


$types=array(
	"fotoday"	=>3,
	"videoday"	=>4,
	"blog"		=>20
);


if (isset($rubrics[$obj[1]])) {
	$query.="
			AND rubric = \"".$rubrics[$obj[1]]."\"
	";
	if ($obj[2]== "news") {
		$query.=" AND ntype = 1 ";
	} else if ($obj[2]== "party_news"){
		$query.=" AND pressrelease = 1 ";
	}else {
		$query.=" AND ntype = 2 ";
	}

} else if (@$types[$obj[1]]) {
	$query.="
			AND ntype = \"".$types[$obj[1]]."\"
	";

} else if ($obj[1]=='events') {
	$query.="
			AND _event = 1
	";
}


$sql=sqlquery($query);
if (!conn_sql_num_rows($sql)) {
	/*try to relocate*/
	$obj=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".NEWS." WHERE id = \"".$news_id."\""));
	if ($obj['id'])  {
		header ('HTTP/1.1 301 Moved Permanently');
		header ('Location: '.articleLink($obj));
	}
}
else {
	$res=conn_fetch_assoc($sql);

	/*echo articleLink($res);*/
	header ('HTTP/1.1 301 Moved Permanently');
	header ('Location: '.articleLink($res));
}



$rubric=0;

?>

