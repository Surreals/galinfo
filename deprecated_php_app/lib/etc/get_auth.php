<?
function try_login(){
	global  $par,$depot;
	
		if (isset($_SESSION['zM010bEEt1e'])) unset($_SESSION['zM010bEEt1e']);
		
		if ($par['username'] == '' || $par['password'] == ''){
			return wrong_login($depot['lxs']['wronglogin']);
		}

		$msql=conn_sql_query("SELECT * FROM ".FUSERS." WHERE uname=\"".$par['username']."\"");
		$r=conn_fetch_assoc($msql);
		if (count($r)>1) {
				
				if (md5($par['password'].$r['seed']) !== $r['upass'])
					return wrong_login($depot['lxs']['wronglogin']);
				

				if ($r['approved'] !== substr(md5($par['username'].$depot['enviro']['login-key']),0,10)){

					return wrong_login($depot['lxs']['notapproved']);
				
				}

				$depot['vars']['loggeduser']=$r;
				$newid=md5($par['password'].$par['username'].time());

				$adinfo_vars="name approved services";
				$adinfo=array();
				foreach (explode(" ", $adinfo_vars) as $t){
					$adinfo[$t]=$r[$t];
				}

				conn_sql_query("INSERT INTO ".FLOGGEDU." SET 
					usid=\"".$r['id']."\", 
					logtime= NOW(), 
					usname=\"".$r['uname']."\", 
					perm = \"".$r['services']."\",
					sesskey=\"".$newid."\",
					adparam=\"".sqller(serialize($adinfo))."\"") or die(conn_error());
				
			
				conn_sql_query("DELETE FROM ".FLOGGEDU." WHERE logtime < DATE_SUB(NOW(), INTERVAL 1 DAY)");
				//echo date('H:i:s',$depot['vars']['ctime'])."|||".date('H:i:s',($depot['vars']['ctime']-60*60*2));

				conn_sql_query("
							UPDATE ".FUSERS." 
							SET logqty=logqty+1 ,
							logged = NOW()
							WHERE id=\"".$r['id']."\"
				") or die (conn_error());

				/*conn_sql_query("INSERT INTO ".ACTIV." SET user_id = \"".$r['id']."\", login_date = NOW()") or die(conn_error());*/

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
				if (isset($_SESSION['zM010bEEt1e'])) unset($_SESSION['zM010bEEt1e']);
				session_name("zM010bEEt1e");
				session_start();
				$_SESSION['zM010bEEt1e']=$newid;

				//echo $_SESSION['zM010bEEt1e'];
				return $newid;
						
						/*if (!isset($par['gomy'])) header("Location: ".$_SERVER["HTTP_REFERER"]);

						if (isset($par['gofor'])){
								$ll=$par['gofor'];

						} else $ll="/index.php?phtm=myacc";

						header("Location: $ll");*/
					
			
		}

		else {
			return wrong_login($depot['lxs']['wronglogin']);
		}
}


function authenticated(){
	global $depot; 
	/*if (isset($depot['vars']['loggeduser'])) return true;*/

	if (isset($depot['vars']['loggeduser']['name']) && @$depot['logged_user']['sesskey']==@$_SESSION['zM010bEEt1e']) return true;

	if (isset($_SESSION['zM010bEEt1e'])){
		$depot['logged_user']=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".FLOGGEDU." WHERE sesskey=\"".$_SESSION['zM010bEEt1e']."\""));
		$depot['vars']['loggeduser']=unserialize($depot['logged_user']['adparam']);
		$depot['vars']['perm']=explode(',',$depot['logged_user']['perm']);

		if (is_array($depot['logged_user']) && count($depot['logged_user'])>1) {
			conn_sql_query("UPDATE ".FLOGGEDU." SET logtime = NOW() WHERE sesskey=\"".$_SESSION['zM010bEEt1e']."\"");
			return true; 
		} else return false;/**/
		if (count($depot['logged_user'])>1) return true; else return false;
	} else {return false;}	
}


/*function require_level($right,$level){
	global $depot;
	$need=0;
	if ($right){
		$allrights=unserialize($depot['logged_user']['perm']);
		if (@$allrights[$right]) $need++;
	};
	if ($depot['logged_user']['level']>=$level) $need++;
	return $need;
}
*/


function wrong_login($s){
	global  $depot;
	$depot['errors'][]=$s;
	$depot['vars']['errors'][]=$s;
	return false;
}
?>