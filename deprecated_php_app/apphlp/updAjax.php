<?
foreach (explode(",","conf,conn") as $m)
require_once(dirname(__FILE__)."/../lib/etc/$m.php");

switch (@$par['act']){
	case "lastNewsIDCheck":	echo lastIDCheck();	break;
}

function lastIDCheck() {
	global $depot, $par;
	/*	define last news id */
	if (!isset($par['nid'])) return;

	$sql_last = "
		SELECT COUNT(*)
		FROM ".NEWS."
		WHERE 
		{$depot['mysql_time_factor']}
		AND approved = 1
		AND udate > \"".sqller($par['nid'])."\"
	";

	$sql_last_r = conn_fetch_row(sqlquery($sql_last));
	return json_encode(array("diff"=>$sql_last_r));
}