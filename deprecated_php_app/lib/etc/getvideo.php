<?
function getVideo($videoID){
	global $depot, $par;
	
	$sql="SELECT * FROM ".MEDIA." WHERE filecode =\"".sqller($videoID)."\"";
	$res = conn_fetch_assoc(conn_sql_query($sql));
	
	if (!isset($res['filecode'])) return "No video";

	if ($res['usetype'] == 2) {
		return "http://www.youtube.com/embed/{$res['youtubec']}?hl=uk&fs=1";
	} if ($res['usetype'] == 1) {
		return "http://".$_SERVER['HTTP_HOST']."/embed/{$res['filecode']}";
	}

	return "$videoID";
	
}

?>