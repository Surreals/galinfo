<?

if (!isset($par['carrier'])){

	$class1="class='active'";
	$class2="";

	$hclass1="";
	$hclass2=" hidden";

	if (isset($par['register'])){
		$class2="class='active'";
		$class1="";
		$hclass1=" hidden";
		$hclass2="";
	}


	if (!@$par['logtolocation']) $par['logtolocation']=base64_encode("http://".$_SERVER["HTTP_HOST"].$_SERVER["REQUEST_URI"]);


	echo "

		
		<div id='loginform' style=\"display:block;text-align:left;width:320px;padding:30px;\">
			<div id=\"loginmessage\"></div>
			<div class='clean'></div>
			<form name='enter' class='enter'>
				
				<div>
					<h2 style='text-transform:uppercase'>".$depot['lxs']['authorization']."</h2><br>
					<div>
						<p>".$depot['lxs']['email']."</p>
						<input type='text' name='username' id='username' onkeypress=\"return sbmtr('enter','loginbutton',event)\" style=\"width:160px;\">

						
						<p style='margin-top:10px;'>".$depot['lxs']['password']."</p>
						<input type='password' name='password' id='password' onkeypress=\"return sbmtr('enter','loginbutton',event)\" style=\"width:160px;\">

					</div>

					<a href=\"\" class=\"sbmt\" name=\"loginbutton\" id=\"loginbutton\" onclick=\"return chUp('login','enter',1)\" style=\"float:right;margin-top:-32px;\">Ok</a>
					<br><a href=\"/register/\" style=\"color:#F00\">".$depot['lxs']['goregister']."</a>

					<div class='clearfix'></div>
				</div>
				
		

				<div style='margin-top:20px;'>
					
					<div style=\"margin-bottom:15px;font-size:.9em;line-height:120%;\">".$depot['lxs']['entersocial1']."</div>
					<div class=\"soclogin\">
						<a href=\"/login/?carrier=facebook&authref=".$par['logtolocation']."\"><img src=\"/im/fb.png\"></a>
						<a href=\"/login/?carrier=twitter&authref=".$par['logtolocation']."\"><img src=\"/im/twitter.png\"></a>
						<a href=\"/login/?carrier=google&authref=".$par['logtolocation']."\"><img src=\"/im/gp.png\"></a>
					</div>
									
				</div>

				<div class='clearfix'></div>
				<input type='hidden' name='processing' />
				<input type='hidden' name='langid' value='".$depot['vars']['language']."' />
				<input type='hidden' name='logtolocation' value='".@$par['logtolocation']."' />
			</form>
		</div>
";

} else authOutside();


function authOutside(){
	global $par,$depot;
	
	if (!in_array($par['carrier'],array("facebook","twitter","google"))) $par['carrier']="facebook";

	$par['uniqueidauth']=md5(time());
	sqlquery(
			"insert into ".AUTHOUT."
			set 
			id = \"".sqller($par['uniqueidauth'])."\",
			address = \"".sqller($par['authref'])."\",
			carrier	= \"".sqller($par['carrier'])."\"
	");

	switch ($par['carrier']){
		case "facebook" :	authFacebook(); break;
		case "twitter" :	authTwitter(); break;
		//case "vkontakte" :	authVK(); break;
		case "google" :		authGoogle(); break;
	}
}




function authFacebook(){
	global $par,$depot;

	$location ="https://www.facebook.com/dialog/oauth?client_id=".$depot['secrets']['fb_appId']."&redirect_uri=". urlencode("http://".$_SERVER["HTTP_HOST"]."/apphlp/authout.php?authid=".$par['uniqueidauth'])."&scope=email";
	header("Location: ".$location);
}

function authVK(){
	global $par,$depot;
	$url = 'http://oauth.vk.com/authorize';
    $params = array(
        'client_id'     => $depot['secrets']['vk_appId'],
        'redirect_uri'  => $depot['secrets']['goo_uri'],
        'response_type' => 'code',
		'display'		=> 'page'
    );
	$_SESSION['authid']=$par['uniqueidauth'];
	$location= $url.'?'.urldecode(http_build_query($params));
	header("Location: ".$location);
}


function authGoogle(){
	global $par,$depot;
	

	$_SESSION['authid']=$par['uniqueidauth'];
	$location ="https://accounts.google.com/o/oauth2/auth?response_type=code&redirect_uri=".urlencode($depot['secrets']['goo_uri'])."&client_id=". $depot['secrets']['goo_clientId']."&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&access_type=offline&approval_prompt=force";
	header("Location: ".$location);
}


function authTwitter(){
	global $par,$depot;
	require_once('../apphlp/oauth/twitteroauth/twitteroauth.php');

	$callback="http://".$_SERVER["HTTP_HOST"]."/apphlp/authout.php?authid=".$par['uniqueidauth'];
	$twitteroauth = new TwitterOAuth($depot['secrets']['tw_appId'], $depot['secrets']['tw_secret']);  
	$request_token = $twitteroauth->getRequestToken($callback);  

	// Saving them into the session  
	$_SESSION['oauth_token'] = $request_token['oauth_token'];  
	$_SESSION['oauth_token_secret'] = $request_token['oauth_token_secret'];  
	  
	if($twitteroauth->http_code==200){  
		$url = $twitteroauth->getAuthorizeURL($request_token['oauth_token']); 
		header('Location: '. $url); 
	} else { 
		// It's a bad idea to kill the script, but we've got to know when there's an error.  
		die('Its impossible to connect Twitter OAuth processor '.__LINE__);  
	}

}



?>