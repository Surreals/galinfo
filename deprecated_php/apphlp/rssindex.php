<?
$parent_loader=1;
foreach (explode(",","conf,conn,core,forms,initstart") as $m)
require_once(dirname(__FILE__)."/../lib/etc/$m.php");

$out=parse_page();
header("Content-Type: text/xml");
echo $out;
@conn_sql_query("UPDATE ".STATS." SET rss_read = rss_read+1");
?>
