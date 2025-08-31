<?
require_once(dirname(__FILE__).'/../etc/forms.php');
$depot['vars']['mod_result']=get_myaccount();


function get_myaccount(){

	global $par,$lxs,$logged_im,$depot;
	$ttop="";



	if (isset($par['conid'])	&& !authenticated()) return tryConfirm();
	if (isset($par['renewid'])	&& !authenticated()) return tryRenew();

	if (!authenticated()) {
		
		$logtolocation='';

		return parse_local(
							array(
									'language'	=>$depot['vars']['language'],
									'logtolocation'	=>$logtolocation
									),"notAuthenticated",1);
	}

	//if (!isset($par['ns'])) err404();

	if (!isset($par['action'])) $par['action']='profile';

	switch (@$par['action']){
		case 'profile':		$ttop.=myProfile();break;
		case 'images':		$ttop.=myImages();break;
		case 'articles':	$ttop.=myArticles();break;
		case 'blog':		$ttop.=myBlog();break;
		case 'news':		$ttop.=myNews();break;
		case 'offers':		$ttop.=myOffers();break;

		default:			$ttop.=myProfile();break;

	}

	return  "		<script type='text/javascript' src='/var/wwigs/ckeditor/ckeditor.js'></script>
					<script type='text/javascript' src='/js/fuploads.js'></script>
					<div class='col pt20'>".mymenu()."</div>
					<div class='myholder'>
					<h1>".$depot['lxs']['my'.$par['action']]."</h1>".
						errors().oks().$ttop."</div><div class='clean pt100'></div>";

}



function tryRenew(){
	global $depot,$par;

	$query = sqlquery("SELECT * FROM ".FUSERS." WHERE uniqueid = \"".sqller($par['renewid'])."\"");
	if (mysql_num_rows($query)>0){
		
		$res=mysql_fetch_assoc($query);
		$uid=generate_unique(32);
		$upass=generate_unique(5);
		mysql_query("
						UPDATE ".FUSERS."
						SET
						uniqueid = \"$uid\",
						upass=\"".md5($upass)."\"
						WHERE uniqueid = \"".sqller($par['renewid'])."\"
		");
		
		$arr=array(
			'link'=>$upass,	
		);
		$t=parse_local($arr,'emailRenewOk_'.$depot['vars']['language'],1);

		if (superMail($res['uname'],mb_convert_encoding($depot['lxs']['newpasswordsentsubject'],'windows-1251','UTF-8'),$t,'text/plain')){

				$arr=array(
				'messageHeader' => $depot['lxs']['okrenewheader'],
				'messageText' => $depot['lxs']['okrenewtext']
			);

		
			return parse_local($arr,'message',1);
		}


		
	} else {
		return parse_local(array('message'=>$depot['lxs']['confirmerror']),'quickMessage',1);
	}

}


function tryConfirm(){
	global $depot,$par;

	$query = sqlquery("SELECT * FROM ".FUSERS." WHERE uniqueid = \"".sqller($par['conid'])."\" AND approved = ''");
	if (mysql_num_rows($query)>0){
		
		$res=mysql_fetch_assoc($query);
		$approved=substr(md5($res['uname'].$depot['enviro']['login-key']),0,10);
		$uid=generate_unique(32);
		mysql_query("
						UPDATE ".FUSERS."
						SET approved = \"$approved\",
						uniqueid = \"$uid\"
						WHERE uniqueid = \"".sqller($par['conid'])."\"
		");
		


		$arr=array(
			'messageHeader' => $depot['lxs']['confirmedh'],
			'messageText' => $depot['lxs']['confirmedt']
		);

	

		/*if ($res['refferer']){
			$id = $res['refferer'];
			$re1=mysql_fetch_assoc(sqlquery("SELECT * FROM ".FUSERS." WHERE id = \"".sqller($id)."\"")); 
				
			if (isset($re1['uniqueid'])){

				sqlquery("
					INSERT INTO ".BONUSES."
					SET customerid = \"".sqller($id)."\",
					reason = 1,
					amount = \"".$depot['enviro']['bonus-reg']."\",
					stamp = \"".md5($depot['enviro']['key-bonus'].$depot['enviro']['bonus-reg'].$id)."\"
				
				");

				if (mysql_affected_rows()){
					sqlquery("
							UPDATE ".FUSERS."
							SET
							bonuses = bonuses + \"".$depot['enviro']['bonus-reg']."\",
							bonuschecksum = \"".md5($depot['enviro']['key-bonus'].($re1['bonuses']+$depot['enviro']['bonus-reg']).$id)."\"
							WHERE id = \"".sqller($id)."\"
					");
				}
			}
		}*/

		return parse_local($arr,'message',1);
	} else {
		return parse_local(array('message'=>$depot['lxs']['confirmerror']),'quickMessage',1);
	}

}

function common(){
	return "MY ACCOUNT";
}


function mymenu(){
	global $par,$depot;
	if (@$par['action']=='purchase') return;
	$html="<div class='myaccmenu'><h2>".$depot['lxs']['myaccount']."</h2>";


	
	$av_menu=array('profile','blog','images');


	

	$html.="	
				<ul class='mymenu'>
	";
	
	foreach ($av_menu as $v){
		if(@$par['action']==$v) {
			$active=' class="active"';
		} else {
			$active="";
		}

		$html.="<li$active><a href='/myaccount/$v/'>".$depot['lxs']['my'.$v]."</a></li>";
		
	}

	$html.="	</ul>
			<span class='spacer'></span>
			</div>
				";

	$mypage='';
	return $html;
	
}




function myProfile(){

	require_once('myprofile.php');

	
	return myProfileResult();
}



function myImages(){
	
	/*if (!check_auth_bus_acc(true)) return;*/
	require_once('myimages.php');

	return myImagesResult();
}



function myArticles(){
	/*if (!check_auth_bus_acc(true)) return;*/
	require_once('myarticles.php');

	return myArticlesResult();
}


function myBlog(){
	/*if (!check_auth_bus_acc(true,1)) return;*/
	require_once('myblog.php');
	return myBlogResult();
}

function myNews(){
	if (!check_auth_bus_acc(true)) return;
	require_once(dirname(__FILE__).'/../etc/mynews.php');

	return myNewsResult();
}


function myOffers(){
	if (!check_auth_bus_acc(true,1)) return;
	require_once(dirname(__FILE__).'/../etc/myoffers.php');

	return myOffersResult();
}

?>