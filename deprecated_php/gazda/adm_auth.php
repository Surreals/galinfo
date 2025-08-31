<?
function try_login(){
	global  $par,$logged_user,$vars,$depot;
		

		if (isset($_SESSION['newsmaker'])) unset($_SESSION['newsmaker']);
		
		if ($par['username'] == 'username' && $par['password'] = 'password'){
			$depot['errors'][]="Wrong username / password.";
			return false;
		}

		$msql=conn_sql_query("SELECT * FROM ".USERS." WHERE uname=\"".$par['username']."\" AND upass=\"".md5($par['password'])."\" ") or die(conn_error());
		$r=conn_fetch_assoc($msql);
		if (is_array($r) && count($r)>1) {

				if (!$r['active']){
					$depot['errors'][] = $depot["tx"]['in_nonactive'];
					return false;
				}

				$newid=md5($par['password'].$par['username'].time());
				conn_sql_query("INSERT INTO ".LOGGEDA." SET 
					usid=\"".$r['id']."\", 
					logtime= NOW(), 
					usname=\"".$r['uname']."\", 
					perm=\"".sqller($r['perm'])."\", 
					sesskey=\"".$newid."\"") or die(conn_error());
				
			
				conn_sql_query("DELETE FROM ".LOGGEDA." WHERE logtime < DATE_SUB(NOW(), INTERVAL 2 HOUR)") or die(conn_error());
				//echo date('H:i:s',$vars['ctime'])."|||".date('H:i:s',($vars['ctime']-60*60*2));


				$realip=$_SERVER['REMOTE_ADDR'];
				if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
					$realip.=":".$_SERVER['HTTP_X_FORWARDED_FOR'];
				}

				/*
				$poi=conn_fetch_row(conn_sql_query ("SELECT COUNT(*) FROM ".BANNIP." WHERE ip=\"$realip\""));
				if (!$poi[0]){
					conn_sql_query("UPDATE ".USERS." SET lastip=\"$realip\" WHERE id=\"".$r['id']."\"");
				} else {
					$depot['errors'][]="The ip you're going to log in from ($realip) is banned.";
					return 0;
				}
				}*/
				
				session_destroy();
				if (isset($_SESSION['newsmaker'])) unset($_SESSION['newsmaker']);
				session_name("newsmaker");
				session_start();
				$_SESSION['newsmaker']=$newid;
				header("Location: /gazda/?act=addnews&su=viewpub");
				return $newid;
						
						/*if (!isset($par['gomy'])) header("Location: ".$_SERVER["HTTP_REFERER"]);

						if (isset($par['gofor'])){
								$ll=$par['gofor'];

						} else $ll="/index.php?phtm=myacc";

						header("Location: $ll");*/
					
			
		}

		else {
			$depot['errors'][]=$depot["tx"]['in_wrongauth'];
			return false;
		}
}


function authenticated(){
	global $logged_user,$vars; 
	if (isset($_SESSION['newsmaker'])){
		$logged_user=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".LOGGEDA." WHERE sesskey=\"".$_SESSION['newsmaker']."\""));
		if (count($logged_user)>1) {
			conn_sql_query("UPDATE ".LOGGEDA." SET logtime = NOW() WHERE sesskey=\"".$_SESSION['newsmaker']."\"") or die(conn_error());
			setcookie('ediID', md5($_SESSION['newsmaker']."abra"), time()+300*60, '/');
			return true; 
		} else return false;
	} else return false;	
}


function require_level($var){
	global $logged_user;
	$rights=unserialize($logged_user['perm']);
	if (@$rights[$var]) return true; else return false;
}

?>