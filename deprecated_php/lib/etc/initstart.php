<?

ob_start();
session_name("zM010bEEt1e");
session_start();
ini_set ('display_errors', "1");

if (!isset($_SESSION['zM010bEEt1e']))	$_SESSION['zM010bEEt1e']=generate_unique(32);

if (!isset($_COOKIE['visitorID']) || !isset($_COOKIE['visitorCSUM'])){
	setcookie('visitorID',$_SESSION['zM010bEEt1e'],time()+3600*24*30,'/');
	$visitor_sum=md5($_SESSION['zM010bEEt1e'].'someseeedhere');
	setcookie('visitorCSUM',$visitor_sum,time()+3600*24*30,'/');
}

if (isset($_REQUEST['logout'])) {

	session_name("zM010bEEt1e");
	session_destroy();


	
	if (isset($_COOKIE['OAID'])){
		setcookie('OAID',$_SESSION['zM010bEEt1e'],time()-3600*24*30,'/');
	}



	echo "
	
	<div id=\"fb-root\"></div>
    <script>
      window.fbAsyncInit = function() {
        FB.init({
          appId: '".$depot['secrets']['fb_appId']."',
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
        var e = document.createElement('script');
        e.type = 'text/javascript';
        e.src = document.location.protocol +
            '//connect.facebook.net/en_US/all.js';
        e.async = true;
        document.getElementById('fb-root').appendChild(e);
    }());

	FB.logout();
	window.location('/apphlp/boomer.php?language=".$depot['vars']['language']."');
    </script>

	";

	header("Location: /apphlp/boomer.php?language=".$depot['vars']['language']);
}