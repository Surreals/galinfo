<?

/*
	USERBASE
	1 - facebook
	2 - twitter
	3 - google
	4 - vk
*/




$parent_loader=1;

/**/
require_once("../lib/etc/conf.php");
require_once("../lib/etc/conn.php");
require_once("../lib/etc/core.php");
require_once("../lib/etc/initstart.php");


if (!isset($par['authid'])) {
	if (!isset($_SESSION['authid'])) die("There is authentication process ID");
	$par['authid']=$_SESSION['authid'];
}

$result=	sqlquery("	
					SELECT * 
					FROM ".AUTHOUT." 
					WHERE id = \"".sqller($par['authid'])."\"
");

if (!conn_sql_num_rows($result)>0) die("There is a problem providing registration through OAuth algorithm");

$res=conn_fetch_assoc($result);

switch ($res['carrier']){
	case ("facebook") : oAuthFacebook($res);	break;
	case ("twitter") :	oAuthTwitter($res);		break;
	case ("google") :	oAuthGoogle($res);		break;
	case ("vkontakte") :		oAuthVk($res);		break;
	default : die("The provided carrier is not approved within our system!");
}


/**
*	Facebook authentication/registration	
*/
function oAuthFacebook($route){
	global $par, $depot;

	require 'oauth/fboauth/facebook.php';
	$facebook = new Facebook(array(
		'appId'  => $depot['secrets']['fb_appId'],
		'secret' => $depot['secrets']['fb_secret'],
		'cookie' =>true
	));


	

	$user = $facebook->getUser();
	if ($user) {
	  try {
		$user_profile = $facebook->api('/me');
	  } catch (FacebookApiException $e) {
		error_log($e);
		$user = null;
	  }
	}
	
	echo "
	<div id=\"fb-root\"></div>
    <script>
      window.fbAsyncInit = function() {
        FB.init({
          appId: '{$facebook->getAppID()}',
          cookie: true,
          xfbml: true,
          oauth: true
        });
        FB.Event.subscribe('auth.login', function(response) {
          window.location.reload();
        });
        FB.Event.subscribe('auth.logout', function(response) {
          window.location.reload();
        });
      };
      (function() {
        var e = document.createElement('script'); e.async = true;
        e.src = document.location.protocol +
          '//connect.facebook.net/en_US/all.js';
        document.getElementById('fb-root').appendChild(e);
      }());
    </script>
	";


	if (!$user) {
		echo ("<small>Verifying authentication ...</small>");
		return;
	}
	
	$r=sqlquery("SELECT * FROM ".FUSERS." WHERE fbid = \"".$user_profile['id']."\"");
	
	print_r($user_profile);
	die();
	if (!conn_sql_num_rows($r)){
		
		/*register*/
		if (!$user_profile['email']) return err404();
		if (
			!oRegister(
				
				array(
						'uname'		=>$user_profile['email'],
						'name'		=>$user_profile['name'],
						'uniqueid'	=>generate_unique(32),
						'seed'		=>generate_unique(16),
						'approved'	=>substr(md5($user_profile['email'].$depot['enviro']['login-key']),0,10),
						'fbid'		=>$user_profile['id'],
						'services'	=>'',
						'userbase'	=>1
				), "https://graph.facebook.com/{$user_profile['id']}/picture"
			)
		) {

            $res_ = sqlquery("UPDATE ".FUSERS." SET fbid = \"".$user_profile['id']."\" WHERE uname = \"".$user_profile['email']."\"");
			if (!conn_affected_rows($res_)) die("There is a problem with your record in DB");
			
		}
		
		$r=sqlquery("SELECT * FROM ".FUSERS." WHERE fbid = \"".$user_profile['id']."\"");

	}

	
	oLetMeIn(conn_fetch_assoc($r),$route);
	
}



/**
*	Twitter auth/reg
*/

function oAuthTwitter($route){
	global $par, $depot;

	require_once('oauth/twitteroauth/twitteroauth.php');
	$twitteroauth = new TwitterOAuth($depot['secrets']['tw_appId'], $depot['secrets']['tw_secret'], $_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);  

	$access_token = $twitteroauth->getAccessToken($_REQUEST['oauth_verifier']); 
	$_SESSION['access_token'] = $access_token; 
	$user_info = $twitteroauth->get('account/verify_credentials'); 

	
	if (!@$user_info->id) die("Session has been expired");

	$r=sqlquery("SELECT * FROM ".FUSERS." WHERE twid = \"".$user_info->id."\"");
	if (!conn_sql_num_rows($r)){
		
		/*register*/
		if (
			!oRegister(
				
				array(
						'uname'		=>"@".$user_info->screen_name,
						'name'		=>$user_info->name." ".$user_info->screen_name,
						'uniqueid'	=>generate_unique(32),
						'seed'		=>generate_unique(16),
						'approved'	=>substr(md5("@".$user_info->screen_name.$depot['enviro']['login-key']),0,10),
						'twid'		=>$user_info->id,
						'services'	=>'',
						'userbase'	=>2

				), $user_info->profile_image_url
			)
		) {

            $res_ = sqlquery("UPDATE ".FUSERS." SET twid = \"".$user_info->id."\" WHERE uname = \""."@".$user_info->screen_name."\"");
			if (!conn_affected_rows($res_)) die("There is a problem with your record in DB");
		}
		$r=sqlquery("SELECT * FROM ".FUSERS." WHERE twid = \"".$user_info->id."\"");
	}
	oLetMeIn(conn_fetch_assoc($r),$route);
}




/**
*	Facebook authentication/registration	
*/
function oAuthGoogle($route){
	global $par, $depot;

	require_once 'oauth/googleoauth/src/apiClient.php';
	require_once 'oauth/googleoauth/src/contrib/apiOauth2Service.php';

	$client = new apiClient();
	$client->setApplicationName("Google UserInfo PHP Starter Application");

	$client->setClientId($depot['secrets']['goo_clientId']);
	$client->setClientSecret($depot['secrets']['goo_secret']);
	$client->setRedirectUri($depot['secrets']['goo_uri']);
	
	$oauth2 = new apiOauth2Service($client);

	if (isset($_GET['code'])) {
	  $client->authenticate();
	  $_SESSION['token'] = $client->getAccessToken();
	  $redirect = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'];
	  header('Location: ' . filter_var($redirect, FILTER_SANITIZE_URL));
	  return;
	}

	if (isset($_SESSION['token'])) {
	 $client->setAccessToken($_SESSION['token']);
	}


	if ($client->getAccessToken()) {
	  $user = $oauth2->userinfo->get();
		//print_r($user);
	  // These fields are currently filtered through the PHP sanitize filters.
	  // See http://www.php.net/manual/en/filter.filters.sanitize.php
	 // $email = filter_var($user['email'], FILTER_SANITIZE_EMAIL);
	 // $img = filter_var($user['picture'], FILTER_VALIDATE_URL);
	 // $personMarkup = "$email<div><img src='$img?sz=50'></div>";

	  // The access token may have been updated lazily.
	  $_SESSION['token'] = $client->getAccessToken();
	  
	} 



	if (!$user) {
		echo ("<small>Verifying authentication ...</small>");
		return;
	}
	
	$r=sqlquery("SELECT * FROM ".FUSERS." WHERE gooid = \"".$user['id']."\"");

	if (!conn_sql_num_rows($r)){
		
		/*register*/

		if (
			!oRegister(
				
				array(
						'uname'		=>$user['email'],
						'name'		=>$user['name'],
						'uniqueid'	=>generate_unique(32),
						'seed'		=>generate_unique(16),
						'approved'	=>substr(md5($user['email'].$depot['enviro']['login-key']),0,10),
						'gooid'		=>$user['id'],
						'services'	=>'',
						'userbase'	=>3
				), @$user['picture']
			)
		) {

            $res_= sqlquery("
						UPDATE ".FUSERS." 
						SET 
							gooid = \"".$user['id']."\",
							logged=NOW()
						WHERE uname = \"".$user['email']."\"
			");
			if (!conn_affected_rows($res_)) die("There is a problem with your record in DB");
			
		}
		
		$r=sqlquery("SELECT * FROM ".FUSERS." WHERE gooid = \"".$user['id']."\"");

	}
	oLetMeIn(conn_fetch_assoc($r),$route);
	
}





/**
*	VK auth/reg
*/

function oAuthVk($route){
	global $par, $depot;
	die("Session has been expired");

	
	$result = false;
	$params = array(
		'client_id'		=> $depot['secrets']['vk_appId'],
		'client_secret' => $depot['secrets']['vk_secret'],
		'code'			=> $_GET['code'],
		'redirect_uri'	=> $depot['secrets']['goo_uri']
	);

	$token = json_decode(getpage('https://oauth.vk.com/access_token' . '?' . urldecode(http_build_query($params))), true);

	if (isset($token['access_token'])) {
		$params = array(
			'uids'         => $token['user_id'],
			'fields'       => 'uid,first_name,last_name,screen_name,sex,bdate,photo_100',
			'access_token' => $token['access_token']
		);

		$userInfo = json_decode(getpage('https://api.vk.com/method/users.get' . '?' . urldecode(http_build_query($params))), true);
		if (isset($userInfo['response'][0]['uid'])) {
			$userInfo = $userInfo['response'][0];
			$result = true;
		}
	}

	if (!$result) die("Session has been expired");

	$r=sqlquery("SELECT * FROM ".FUSERS." WHERE vkid = \"".$userInfo['uid']."\"");
	if (!conn_sql_num_rows($r)){
		
		/*register*/
		if (
			!oRegister(
				
				array(
						'uname'		=>$userInfo['screen_name'],
						'name'		=>$userInfo['first_name']." ".$userInfo['last_name'],
						'uniqueid'	=>generate_unique(32),
						'seed'		=>generate_unique(16),
						'approved'	=>substr(md5($userInfo['screen_name'].$depot['enviro']['login-key']),0,10),
						'vkid'		=>$userInfo['uid'],
						'services'	=>'',
						'userbase'	=>4

				), $userInfo['photo_100']
			)
		) {

            $res_ = sqlquery("UPDATE ".FUSERS." SET vkid = \"".$userInfo['uid']."\" WHERE uname = \"".$userInfo['screen_name']."\"");
			if (!conn_affected_rows($res_)) die("There is a problem with your record in DB");
		}
		$r=sqlquery("SELECT * FROM ".FUSERS." WHERE vkid = \"".$userInfo['uid']."\"");
	}
	oLetMeIn(conn_fetch_assoc($r),$route);
}



function oRegister($userObj,$pic=false){
	$sql="";

	foreach ($userObj as $k=>$v){
		$sql.=" $k = \"".sqller($v)."\", ";
	}
    $res_ = sqlquery("
				INSERT IGNORE 
				INTO ".FUSERS."
				SET $sql
				regdate=NOW()

	");

	if (!conn_affected_rows($res_)) return false;
	else {
		if ($pic) {
			 tryProcessImage($pic,$userObj['userbase'],conn_insert_id());
			 return true;
		}
		else return true;
	}
}


function tryProcessImage($pic,$carrier,$userid){
	
	/*fafcebook redirect*/

	if ($carrier==1)	{
		$pic=getRedirectURL($pic);
	}

	$image=getpage($pic);

	if ($image) {
		$filename = generate_unique(15);
		$fl=	fopen($_SERVER['DOCUMENT_ROOT']."/media/avatars/tmb/".$filename.'.jpg', 'w+');
		$fl1=	fopen($_SERVER['DOCUMENT_ROOT']."/media/avatars/".$filename.'.jpg', 'w+');
		fputs($fl,$image);fputs($fl1,$image);
		
		sqlquery("
					INSERT IGNORE INTO ".PICSU." 
					SET
						filename = \"".$filename.".jpg\",
						userid = \"".$userid."\",
						ismain = 1
		");
		fclose($fl);
		fclose($fl1);
	}
	
}



function getpage($path){
	$c = curl_init();
	curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
	//curl_setopt($c, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($c, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.7.8) Gecko/20050516 Firefox/1.0.4");
	curl_setopt($c, CURLOPT_HEADER, false);
	curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($c, CURLOPT_URL, $path);
	$e = curl_exec($c);
	curl_close($c);
	return $e;
}




function getRedirectURL($path){
	$c = curl_init();
	curl_setopt($c, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.7.8) Gecko/20050516 Firefox/1.0.4");
	curl_setopt($c, CURLOPT_HEADER, true);
	curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($c, CURLOPT_URL, $path);
	$e = curl_exec($c);
	curl_close($c);
	
	$headers=explode("\n",$e);
	foreach ($headers as $h){
		preg_match("/Location: (.*)$/sU",$h,$m);
		if (isset($m[1])) return $m[1];
	}
	return $path;
}




function oLetMeIn($r,$route){
	global $depot,$par;

	
	$depot['vars']['loggeduser']=$r;
	$newid=md5(time().$r['uniqueid']);

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


	$realip=$_SERVER['REMOTE_ADDR'];
	if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
		$realip.=":".$_SERVER['HTTP_X_FORWARDED_FOR'];
	}
	
	session_destroy();
	if (isset($_SESSION['zM010bEEt1e'])) unset($_SESSION['zM010bEEt1e']);
	session_name("zM010bEEt1e");
	session_start();
	$_SESSION['zM010bEEt1e']=$newid;

	/*DElETE ROUTE RECORD*/
	sqlquery("
				DELETE FROM ".AUTHOUT." 
				WHERE id = \"".sqller($par['authid'])."\"
				OR t < DATE_SUB(NOW(), INTERVAL 3 DAY )
				
			");

		/*echo $route['address']."<hr>".base64_decode($route['address']);*/

	header("Location: ".base64_decode($route['address'])."\n");
}


?>
