<?
$depot['vars']['mod_result']=register();




function register(){
	global $par,$depot;
	require_once(dirname(__FILE__)."/../etc/forms.php");
	/*if (@$par['su']=='confirm') return get_confirm();	*/
	if (!isset($par['sd'])) return reg_form();
	else return check_form();

}

/*----------------------------------------------*/
/*				MEMBER REGISTRATION FORM		*/
/*----------------------------------------------*/
function reg_form(){
	global $par,$depot, $lxs;
	
	$no=unique_guest_no(15);  
	$functions=array('1',$depot['lxs']['ask_blog'])	 ;


	$arr=array(
				'password'	=>bd_tf(@$par['upass'],'upass','password','width:288px;',2,''),
				'password1'	=>bd_tf(@$par['upass1'],'upass1','password','width:288px;',3,''),
				'email'		=>bd_tf(@$par['uname'],'uname','text','width:288px;',1,''),
				'name'		=>bd_tf(@$par['name'],'name','text','width:288px;',4,''),
				'precode'	=>$no,
				'verify'	=>bd_tf(@$par['seccode'], 'seccode', 'text','width:288px;',5,''),
				'ask'		=> bd_multiselect($functions,'services','',6,'')

	);

	return parse_local($arr,'register',1);

}


/*----------------------------------------------*/
/*				VALIDATE FORM INPUT				*/
/*----------------------------------------------*/
function check_form(){
	global $par,$depot;
	$ttop='';
				
	chk_req("uname",$depot['lxs']['emailerr']);
	chk_length("uname",$depot['lxs']['emailwrong'],"0","25");
	chk_occupied("uname",FUSERS,"uname",$depot['lxs']['emailoccupied']);

	$disallowed=array('anonymous','default');
	if (in_array($par['uname'],$disallowed)) $depot['errors'][]="Username you've choosen is disallowed.";

	if (!check_email_valid($par["uname"])){
		$depot['errors'][]=$depot['lxs']['wrongemail'];
	}


	chk_req("upass",$depot['lxs']['passworderr']);

	if (@$par['upass']!=@$par['upass1']) {
		$depot['errors'][]=$depot['lxs']['passnotcon'];
		$depot['gerrors'][]="upass";
		$depot['gerrors'][]="upass1";
	}


	chk_req("name",$depot['lxs']['fullnameerr']);

	$par['humancheck']=substr(MD5($par['precode']."otholerazastavyly"),0,20);
	$dodocount=conn_fetch_row(conn_sql_query("SELECT COUNT(*) FROM ".FUSERS." WHERE humancheck = \"".$par['humancheck']."\""));
	if ($dodocount[0]) {
		$depot['errors'][]=$depot['lxs']['wrongcode'];
		$depot['gerrors'][]='seccode';
	}




	if (!check_ver($par['precode'],$par['seccode'],5))  {
		$depot['errors'][]=$depot['lxs']['wrongcode'];
		$depot['gerrors'][]='seccode';
	} 

	
	if (count($depot['errors'])) {
		$ttop.=reg_form();
	} else {
		$ttop.=reg_save();
	}
	return $ttop;
}


/*----------------------------------------------*/
/*				SAVE MEMEBER TO DB				*/
/*----------------------------------------------*/
function reg_save(){
	global $par,$depot;
	$ttop='';
	

	require_once(dirname(__FILE__)."/../etc/mailers.php");
	$par['uniqueid']=generate_unique(32);
	$seed=generate_unique(16);
	$par_s=array('uname','name','uniqueid',/*'services',*/'humancheck');

	$sql="INSERT INTO ".FUSERS." SET ";
	foreach ($par_s as $field){
		$field=trim($field);

		if (is_array(@$par[$field])){
				/*$sql.="$field=\"".sqller(':'.join(':',@$par[$field]).':')."\",";*/
				  $sql.="$field=\"".sqller(join(',',@$par[$field]))."\",";
			}
			else 
			{
				$sql.="$field=\"".sqller(@$par[$field])."\",";
		}

	}
	//echo $sql;
	$sql.=" 
			upass=MD5(\"".$par['upass'].$seed."\"), 
			seed=\"".$seed."\", 
			ulang = \"".sqller($depot['vars']['langid'])."\"

	";
    $res_ = qlquery($sql) or die($sql."<br><br>".conn_error());
	if (!conn_affected_rows($res_)) {
		$depot['errors'][]=$depot['lxs']['problemsaving'];
		return reg_form();
	} else {

		$arr=array(
				'link'	=>"http://".$_SERVER['HTTP_HOST'].'/myaccount/?conid='.$par['uniqueid'],
				'uname'	=> $par['uname'],
				'upass'	=>	$par['upass']
			);
		
		$t=parse_local($arr,'emailRegister_'.$depot['vars']['lang'],1);

		if (superMail($par['uname'],mb_convert_encoding($depot['lxs']['subjectregistered'],'windows-1251','UTF-8'),$t,'text/plain')){

			$depot['oks'][]=$depot['lxs']['regfinished'];

			$ttop.=parse_local(array(),'registrationOkMess_'.$par['lng'],1);
			return $ttop;

		} else {
			$depot['errors'][]=$depot['lxs']['errorsendingmail'];
			sqlquery("DELETE FROM ".FUSERS." WHERE uniqueid = \"".$par['uniqueid']."\"");
			return reg_form();
		}
		
	}

}


/*----------------------------------------------*/
/*				FINAL MESSAGE	+ EMAIL 		*/
/*----------------------------------------------*/
function reg_success(){
	global $par,$depot;
	$ttop='';

	$mailbody=replace_names('REG_USER_CONFIRMATION',$par);
	list($subj,$body)=array($mailbody[0],$mailbody[1]);
	
	/*	SEND EMAIL CONFIRMATION	*/
	$tosend=array('firstname'=>htmlspecialchars($par['firstname']),'uniqueid'=>$par['uniqueid']);
	$full_name=str_replace(',','',htmlspecialchars($par['firstname']." ".$par['lastname']));
	$realmail=addslashes($full_name)." <".$par['email'].">";

	if (!quick_mail($par['email'],$subj,$body,$depot['enviro']['daemon_name'],$depot['enviro']['daemon_address'])){
		$depot['errors'][]="There has been a problem. Either you have entered the wrong email address or the servers email system is temporarily experiencing problems. Please try to complete registration again in 5 minutes.";
		sqlquery("DELETE FROM ".FUSERS." WHERE id = \"".conn_insert_id()."\"");
		return reg_form();
	} else {
		
		$arr['messageheader']=	$depot['lxs']['he_congratulations'];
		$arr['messagetext']=	$depot['lxs']['txt_approve_emai'];
		return parse_local($arr,'_largemessage');
	}
}


/*----------------------------------------------*/
/*				FINAL MESSAGE	+ EMAIL 		*/
/*----------------------------------------------*/

function get_confirm(){
	global $par, $depot;
	$ttop="";
	$arr=array();
	$arr['messageheader']='Account Activation';

	if (!@$par['key']) {
		$arr['messagetext']="No activation key inside URL!";
	} else {

        $res_ = conn_sql_query("UPDATE ".FUSERS." SET approved = 1, uniqueid=NULL WHERE uniqueid = \"".sqller($par['key'])."\" AND approved=0");
		if (conn_affected_rows($res_)>0){
			$arr['messagetext']="<b>Success!</b><br><br>Your registration process is complete now.";
		} else {
			$arr['messagetext']="Wrong acivation key!";
		}
	}

	return parse_local($arr,'_largemessage');
}
?>