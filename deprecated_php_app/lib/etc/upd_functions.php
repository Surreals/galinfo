<?

function get_renewpassword() {
	global $par,$depot;
	$toret='<script language=JavaScript>';
	$exists_user=conn_fetch_assoc(sqlquery("SELECT uname,uniqueid FROM ".FUSERS." WHERE uname =\"".sqller($par['email'])."\""));

	if (!isset($exists_user['uname'])){
		/*$toret.="window.top.Calert(\"".puttojs(errors_c())."\");";*/
		$depot['errors'][]=$depot['lxs']['wronguseremail'];
		$t="<div class='errmess'>".errors(0)."</div>";
		$toret.="window.top.setvalue(\"loginmessage\",\"".puttojs($t)."\");".'window.top.$.colorbox.resize()';
	} else {

		$arr=array(
			'link'=>"https://".$_SERVER['HTTP_HOST'].'/'.$par['langid'].'/myaccount/?renewid='.$exists_user['uniqueid']	
		);
		$t=parse_local($arr,'emailRenew_'.$par['langid'],1);

		if (superMail($exists_user['uname'],mb_convert_encoding($depot['lxs']['newpasswordsubject'],'windows-1251','UTF-8'),$t,'text/plain')){

			$toret.="window.top.setvalue(\"loginform\",\"".puttojs("<div class='lpanel'><h2 class='h2b3'>".$depot['lxs']['okrrenewsent']."</h2></div>")."\");".'window.top.$.colorbox.resize()';
		} else {
			$depot['errors'][]=$depot['lxs']['errorsendingmail'];
			$t="<div class='errmess'>".errors(0)."</div>";
			$toret.="window.top.setvalue(\"regmessage\",\"".puttojs($t)."\");".'window.top.$.colorbox.resize()';
			sqlquery("DELETE FROM ".FUSERS." WHERE uniqueid = \"".$depot['vars']['runique']."\"");
		}

	}
	$toret.="</script>";
	return $toret;
}





function get_logmein(){
	global $par,$depot,$logged_im;
	$ttop='';

	$toret='<script language=JavaScript>';
	if (!try_login()){
		/*$toret.="window.top.Calert(\"".puttojs(errors_c())."\");";*/
		$t="<div class='errmess'>".errors(0)."</div>";
		$toret.="window.top.setvalue(\"loginmessage\",\"".puttojs($t)."\");".'window.top.$.colorbox.resize()';
	} else {

		/**/if (!@$par['logtolocation'])

			$toret.="window.top.location.href='/myaccount/';";
		
		else $toret.="window.top.location.href='".base64_decode($par['logtolocation'])."';";
		
		/*$toret.="window.top.setvalue(\"myblock\",\"\");";
		$toret.="window.top.setvalue(\"mymenu\",\"".puttojs(myAccountMenu())."\");";
		$toret.="window.top.location.reload();";*/

	}
	$toret.="</script>";
	return $toret;

}



function get_analytics_ajax(){
	global $par,$depot;
	Lload('mo_analytics');
	$message=anaheads_ajaxed();
	$toret='<script language=JavaScript>';
	$toret.="window.top.setvalue(\"analyticsList\",\"".puttojs($message)."\");";
	$toret.="</script>";
	return $toret;
}



function get_articlesListblocks(){
	global $par,$depot;
	$html='';
	$limit=" limit 5 ";
	$addon="";
	if ($par['value'] !== 'all'){
		$addon.=" AND rubric = \"".sqller($par['value'])."\"";
		$sql_rubric=sqlquery_cached("SELECT * FROM ".CATS." WHERE id=\"".sqller($par['value'])."\"",100,4);
		
		$arr['title']=$sql_rubric[0]['title'];
		$arr['alllink']=$depot['vars']['language_link']."media/".$sql_rubric[0]['param']."/";
	} else {
		$arr['title']=$depot['lxs']['latest'];
		$arr['alllink']=$depot['vars']['language_link']."media/all/";
	}
	

	$sql1="
			SELECT		subnews.id,
						subnews.udate, 
						subnews.images,
						subnews.ntype,
						".NEWSHEAD.".nheader,
						".NEWSHEAD.".nteaser,
						subnews.nweight

			FROM		(
							SELECT	id,udate,nweight,images,ntype
							FROM	".NEWS." 
							WHERE lang = \"".$depot['vars']['langid'][$par['lng']]."\" 
							AND approved	= 1 
							AND ntype	= 2 
							AND		{$depot['mysql_time_factor']} 
							$addon
							ORDER BY udate DESC ". 
							$limit."
						) AS subnews
				
			LEFT JOIN	".NEWSHEAD."
			USING		(id)
			ORDER BY udate DESC ";

	$sql=sqlquery_cached($sql1,100,1);
	$index=1;

	foreach ($sql as $res){
		
		if ($index==1){
			$image='';
			if ($res['images'])	{
				$images=get_selected_images($res['images'],$depot['vars']['language']);
				if (count($images)) {
					$image="<img src='/media/gallery/intxt/".$images[0]['filename']."' />";			}
			}

			$arr=array(
								'alink'		=>	articleLink($res),
								'alead'		=>	getfromsql($res['nteaser'],$depot['vars']['language']),
								'atitle'	=>	getfromsql($res['nheader'],$depot['vars']['language']),
								'aimage'		=>	$image
			);
			$index++;
			continue;
		
		}


		$image='<img src="/im/default-tmb.gif">';
		if ($res['images'])	{
			$images=get_selected_images($res['images'],$depot['vars']['language']);
			if (count($images)) {
				$image="<img src='/media/gallery/tmb/".$images[0]['filename']."' />";			}
		}

				
		$news_head= getfromsql($res['nheader'],$par['lng']);

		$arr['medias'][]=array(
								'link'		=>	articleLink($res),
								'header'	=>	$news_head,
								'image'		=>	$image,
								'cleaner'	=> ($index==3) ? "<div class='clean pt20'></div>" : ""
			);
		$index++;
	}

	$arr['title']=$depot['lxs']['latest'];
	$arr['alllink']="/".$depot['vars']['language']."/all/";


	$html=parse_local($arr,"homeAllArticlesList",1);


	$toret="<script type=\"text/javascript\">
				window.top.setvalue(\"holdholder\",\"".puttojs($html)."\");
	";

	//$toret.= "window.top.setvalue(\"".$par['targetid']."\",\"".puttojs($drop)."\");";
	$toret.="</script>";
	return $toret;
}


function get_comment_original(){
	global $par,$depot;
	$ttop='';
	$toret='<script language=JavaScript>';

	$par['myname'] = htmlspecialchars(@$par['myname']);
	$par['message'] = htmlspecialchars($par['message']);

	/* COMMENT NEXT LINE FOR AUTHH ONLY*/
	if (!$par['myname']) $depot['errors'][] = $depot['lxs']['err_name'];

	if (!trim($par['message'])) $depot['errors'][] = $depot['lxs']['err_comment'];


	if (!isset($_COOKIE['visitor'])) {
		$depot['errors'][] = "Cookies disabled. You are not allowed to place comment with cookies disabled.";
	}

	if (!check_ver($par['precode'],$par['seccode'],5))  {
		$depot['errors'][] = $depot['lxs']['err_vrify'];
	}


	check_bann();
	/*$toret.="window.top.Calert(\"".$par['myname'].$par['message']."\");";	 */


	/**
	*	UNCOMMENT FOR AUTH ONLY  !!!
	*	if (!authenticated()) $depot['errors'][]="You are not logged in!";
	*/

	if (count(@$depot['errors'])){
		//$toret.="window.top.Calert(\"".puttojs(errors_c())."\");";
		$message=errors();

		$toret.="window.top.setvalue(\"errmess\",\"".puttojs($message)."\");";


	}else {

		$depot['vars']['uno'] = substr(MD5($par['seccode']),0,20);
		
		if (isset($_COOKIE['uno'])) $cd= $_COOKIE['uno']; else $cd=$depot['vars']['uno'];

		$parent=  (@$par['replyto']) ? @$par['replyto'] : 0;

		$sql="
				INSERT INTO ".COMMENTS." 
				SET 
					newsid		= \"".sqller($par['commentid'])."\",
					nick		= \"".censor(sqller(@$par['myname']))."\",
					comment		= \"".censor(sqller(process_comment($par['message'])))."\",
					authorid	= \"".$depot['logged_user']['usid']."\",
					ddate		= NOW(),
					ipaddr		= \"".sprintf("%u",ip2long($_SERVER['REMOTE_ADDR']))."\",
					uniqueno	=\"".$cd."\",
					parent		=\"".sqller($parent)."\" ";

		$res_ = sqlquery($sql);
		if (conn_affected_rows($res_)>0) {
            $res_1 = conn_sql_query("UPDATE ".STATCOMM." SET qty=qty+1 WHERE id = \"".sqller($par['commentid'])."\"");
			if (!(conn_affected_rows($res_1)>0)) {
				conn_sql_query("INSERT INTO ".STATCOMM." SET id = \"".sqller($par['commentid'])."\"");
			}

		}

		$depot['oks'][]=$depot['lxs']['ok_comment'];
		//$toret.="window.top.Cmessage(\"".puttojs(oks_c())."\",1);";
		$toret.="window.top.sbmt(\"".$par['frm']."\");";
		//$toret.= "window.top.setvalue(\"".$par['targetid']."\",\"".puttojs($drop)."\");";
	}
	
	$toret.="</script>";/*
	$fh=fopen("_1ooooooooooo.txt","w+");
	fputs ($fh,$toret);
	fclose ($fh);*/
	return $toret;
}



function get_commentvote(){
	global $par,$depot;
	
	$depot['vars']['noajaxheader']=true;

	if (!authenticated()
		|| !isset($par['cid'])
		|| !isset($par['mark'])
			
	) return @$par['currentrating'];

	$marks=array('up'=>1,'down'=>-1);

	if (!isset($marks[$par['mark']])) return @$par['currentrating'];

	preg_match('/markid(\d+)$/',$par['cid'],$matches);

	if (!isset($matches[1]))  return $par['currentrating'];

	$res_ = sqlquery("
				INSERT IGNORE
				INTO ".COMMRATING." 
				SET 
					commentid	= \"".sqller($matches[1])."\",
					userid	= \"".$depot['logged_user']['usid']."\",
					mark		=\"".$marks[$par['mark']]."\"
	");

	if (!conn_affected_rows($res_)) return @$par['currentrating'];

	$totalSQL = sqlquery("SELECT SUM(mark) FROM ".COMMRATING." WHERE commentid	= \"".$matches[1]."\"");

	$total=conn_fetch_row($totalSQL);
	
	sqlquery("
				UPDATE ".COMMENTS."
				SET rating = \"".$total[0]."\"
				WHERE id = ".$matches[1]."
	");
	
	return $total[0];
}






function get_comment(){
	global $par,$depot;
	$ttop='';
	
	if (!isset($par['section'])) $par['section']="news";

	switch($par['section']){
		case "news"		:	$table=COMMENTS;
							$tablestat=STATCOMM;
							break;

		case "video"	:	$table=TVCOMMENTS;
							$tablestat=TVSTATCOMM;
							break;

		default	:	$table=COMMENTS;
					$tablestat=STATCOMM;
	}

	$toret='<script language=JavaScript>';

	$par['myname'] = htmlspecialchars(@$par['myname']);
	$par['message'] = htmlspecialchars(@$par['message']);

	/*if (!$par['myname']) $depot['errors'][] = $depot['lxs']['err_name'];*/
	if (!trim($par['message'])) $depot['errors'][] = $depot['lxs']['err_comment'];


	if (!isset($_COOKIE['visitor'])) {
		$depot['errors'][] = "Cookies disabled. You are not allowed to place comment with cookies disabled.";
	}

	/*if (!check_ver($par['precode'],$par['seccode'],5))  {
		$depot['errors'][] = $depot['lxs']['err_vrify'];
	}*/


	check_bann();
	/*$toret.="window.top.Calert(\"".$par['myname'].$par['message']."\");";	 */


	if (!authenticated()) $depot['errors'][]="You are not logged in!";

	if (count(@$depot['errors'])){
		//$toret.="window.top.Calert(\"".puttojs(errors_c())."\");";
		$message=errors();

		$toret.="window.top.setvalue(\"errmess\",\"".puttojs($message)."\");";


	}else {

		$depot['uno'] = substr(MD5($par['seccode']),0,20);
		
		if (isset($_COOKIE['uno'])) $cd= $_COOKIE['uno']; else $cd=$depot['uno'];

		$parent=  (@$par['replyto']) ? @$par['replyto'] : 0;

		$sql="
				INSERT INTO ".$table." 
				SET 
					newsid		= \"".sqller($par['commentid'])."\",
					nick		= \"".censor(sqller(@$par['myname']))."\",
					comment		= \"".censor(sqller(process_comment($par['message'])))."\",
					authorid	= \"".$depot['logged_user']['usid']."\",
					ddate		= NOW(),
					ipaddr		= \"".sprintf("%u",ip2long($_SERVER['REMOTE_ADDR']))."\",
					uniqueno	=\"".$cd."\",
					parent		=\"".sqller($parent)."\" ";

        $res_ = sqlquery($sql);
		if (conn_affected_rows($res_)>0) {
            $res_1 = conn_sql_query("UPDATE ".$tablestat." SET qty=qty+1 WHERE id = \"".sqller($par['commentid'])."\"");
			if (!(conn_affected_rows($res_1)>0)) {
				conn_sql_query("INSERT INTO ".$tablestat." SET id = \"".sqller($par['commentid'])."\"");
			}

		}

		$depot['oks'][]=$depot['lxs']['ok_comment'];
		//$toret.="window.top.Cmessage(\"".puttojs(oks_c())."\",1);";
		$toret.="window.top.sbmt(\"".$par['frm']."\");";
		//$toret.= "window.top.setvalue(\"".$par['targetid']."\",\"".puttojs($drop)."\");";
	}
	
	$toret.="</script>";/*
	$fh=fopen("_1ooooooooooo.txt","w+");
	fputs ($fh,$toret);
	fclose ($fh);*/
	return $toret;
}




function process_comment($comm){
	$comm = preg_replace('/([\r\n]+)/','<br>',$comm);
	return $comm;
}



function check_bann(){
	global $par,$depot;

	if (!isset($_COOKIE['uno'])) $_COOKIE['uno']='DO NOT TRACK';

	/*if (isset($_COOKIE['uno'])) {*/
		$sql="
				SELECT COUNT(*) FROM ".BANN."
				WHERE value IN('".sqller(@$_COOKIE['uno'])."','".$_SERVER['REMOTE_ADDR']."','".$depot['logged_user']['usname']."','".$depot['logged_user']['usid']."')
		";
	/*} else {
		
		$sql="		
				SELECT COUNT(*) FROM ".BANN."
				WHERE value =\"".$_SERVER['REMOTE_ADDR']."\"";
	}*/
	$sql_run=sqlquery($sql) or die(conn_error());
	$count=conn_fetch_row($sql_run);
	if ($count[0]) $depot['errors'][]=$depot['lxs']['youarenotallowed'];
}


function get_reviewpage(){
	global $par,$depot;
	$ttop='';
	$toret='<script type="text/javascript">';
	require_once(dirname(__FILE__).'/../custom/comments.php');
	$drop=$depot['vars']['mod_result'];
	

	//$depot['oks'][]=$depot['lxs']['ok_comment'];
	//$toret.="window.top.Cmessage(\"".puttojs(oks_c())."\",1);";
	$toret.="window.top.updatetip(\"".$par['contid']."\",\"".puttojs($drop)."\");";
	//$toret.= "window.top.setvalue(\"".$par['targetid']."\",\"".puttojs($drop)."\");";
	$toret.="</script>";/*
	$fh=fopen("_1ooooooooooo.txt","w+");
	fputs ($fh,$toret);
	fclose ($fh);*/
	return $toret;
}



function get_poll(){
	global $par,$depot,$lxs;
	$ttop='';
	$toret='<script language=JavaScript>';

	if (!isset($_COOKIE['visitor'])) {
		$depot['errors'][] = "Cookies disabled. You are not allowed to place comment with cookies disabled.";
	}

	$sql="SELECT ".POLLRES.".*,".POLL.".unique_id, ".POLL.".id As pollid  FROM ".POLLRES.", ".POLL." WHERE ".POLLRES.".id = \"".sqller($par['myvote'])."\" AND ".POLL.".id = poll_id AND isvis = 1";
	$run=conn_fetch_assoc(sqlquery($sql));
	if (count($run)<2){
		$depot['errors'][] = 'Wrong poll ID';
	}


	if (count(@$depot['errors'])){
		$toret.="window.top.setvalue(\"pollsection\",\"".puttojs(errors_c())."\");";
	} else {
		if (isset($_COOKIE['dspoll'.$run['poll_id']])) {
			$depot['oks'][] = $depot['lxs']['he_pollvoted'];
			
			return "<script type='text/javascript'>window.top.setvalue(\"pollsection\",\"".puttojs(oks_c())."\");</script>";

		} else {
			setcookie( 'dspoll'.$run['poll_id'], $run['unique_id'],time()+60*60*24*30);
			$sql="
				UPDATE ".POLLRES." 
				SET qty=qty+1 
				WHERE id = \"".sqller($par['myvote'])."\" ";

			sqlquery($sql);
		}

		$toret.="window.top.sbmt(\"".$par['frm']."\");";
		//$toret.= "window.top.setvalue(\"".$par['targetid']."\",\"".puttojs($drop)."\");";
	}
	
	$toret.="</script>";/*
	$fh=fopen("_1ooooooooooo.txt","w+");
	fputs ($fh,$toret);
	fclose ($fh);*/
	return $toret;
}




function get_askchat(){
	global $par,$depot;
	$ttop='';
	$toret='<script language=JavaScript>';

	/*$par['myname'] = htmlspecialchars(@$par['myname']);*/
	$par['message'] = htmlspecialchars($par['message']);

	/*if (!$par['myname']) $depot['errors'][] = $depot['lxs']['err_name'];*/
	if (!trim($par['message'])) $depot['errors'][] = $depot['lxs']['err_comment'];


	if (!isset($_COOKIE['visitor'])) {
		$depot['errors'][] = "Cookies disabled. You are not allowed to place comment with cookies disabled.";
	}


	check_bann();
	/*$toret.="window.top.Calert(\"".$par['myname'].$par['message']."\");";	 */

	$sql = "
				SELECT	COUNT(*)
				FROM	".CHATL." 
				WHERE ".CHATL.".id=".$par['chatid']."
				AND (startdate < NOW() AND enddate > NOW())";

	$count=conn_fetch_row(sqlquery($sql));
	if (!$count[0]) $depot['errors'][] = $depot['lxs']['err_nochat'];


	if (!authenticated()) $depot['errors'][]="You are not logged in!";

	if (count(@$depot['errors'])){
		//$toret.="window.top.Calert(\"".puttojs(errors_c())."\");";
		$message=errors();

		$toret.="window.top.setvalue(\"errmess\",\"".puttojs($message)."\");";

	
	}else {

		$vars['uno'] = substr(MD5($par['seccode']),0,20);
		if (isset($_COOKIE['uno'])) $cd= $_COOKIE['uno']; else $cd=$vars['uno'];

		

		$sql="
				INSERT INTO ".CHATQ." 
				SET 
					chatid = \"".sqller($par['chatid'])."\",
					uid = \"".censor(sqller($depot['vars']['loggeduser']['name']))."\",
					question = \"".censor(sqller(process_comment($par['message'])))."\",
					ipaddr = \"".sprintf("%u",ip2long($_SERVER['REMOTE_ADDR']))."\",
					uniqueno=\"".$cd."\"";

		sqlquery($sql) or die(conn_error());

		$depot['oks'][]=$depot['lxs']['ok_ask'];
		//$toret.="window.top.Cmessage(\"".puttojs(oks_c())."\",1);";
		$toret.="window.top.sbmt(\"".$par['frm']."\");";
		//$toret.= "window.top.setvalue(\"".$par['targetid']."\",\"".puttojs($drop)."\");";
	}
	
	$toret.="</script>";/*
	$fh=fopen("_1ooooooooooo.txt","w+");
	fputs ($fh,$toret);
	fclose ($fh);*/
	return $toret;
}




function code2utf($number)
    {
        if ($number < 0)
            return FALSE;
        
        if ($number < 128)
            return chr($number);
        
        // Removing / Replacing Windows Illegals Characters
        if ($number < 160)
        {
                if ($number==128) $number=8364;
            elseif ($number==129) $number=160; // (Rayo:) #129 using no relevant sign, thus, mapped to the saved-space #160
            elseif ($number==130) $number=8218;
            elseif ($number==131) $number=402;
            elseif ($number==132) $number=8222;
            elseif ($number==133) $number=8230;
            elseif ($number==134) $number=8224;
            elseif ($number==135) $number=8225;
            elseif ($number==136) $number=710;
            elseif ($number==137) $number=8240;
            elseif ($number==138) $number=352;
            elseif ($number==139) $number=8249;
            elseif ($number==140) $number=338;
            elseif ($number==141) $number=160; // (Rayo:) #129 using no relevant sign, thus, mapped to the saved-space #160
            elseif ($number==142) $number=381;
            elseif ($number==143) $number=160; // (Rayo:) #129 using no relevant sign, thus, mapped to the saved-space #160
            elseif ($number==144) $number=160; // (Rayo:) #129 using no relevant sign, thus, mapped to the saved-space #160
            elseif ($number==145) $number=8216;
            elseif ($number==146) $number=8217;
            elseif ($number==147) $number=8220;
            elseif ($number==148) $number=8221;
            elseif ($number==149) $number=8226;
            elseif ($number==150) $number=8211;
            elseif ($number==151) $number=8212;
            elseif ($number==152) $number=732;
            elseif ($number==153) $number=8482;
            elseif ($number==154) $number=353;
            elseif ($number==155) $number=8250;
            elseif ($number==156) $number=339;
            elseif ($number==157) $number=160; // (Rayo:) #129 using no relevant sign, thus, mapped to the saved-space #160
            elseif ($number==158) $number=382;
            elseif ($number==159) $number=376;
        } //if
        
        if ($number < 2048)
            return chr(($number >> 6) + 192) . chr(($number & 63) + 128);
        if ($number < 65536)
            return chr(($number >> 12) + 224) . chr((($number >> 6) & 63) + 128) . chr(($number & 63) + 128);
        if ($number < 2097152)
            return chr(($number >> 18) + 240) . chr((($number >> 12) & 63) + 128) . chr((($number >> 6) & 63) + 128) . chr(($number & 63) + 128);
        
        
        return FALSE;
    } //code2utf()


function censor($rawtext){
	$lines=array();
	$lines = file ($_SERVER['DOCUMENT_ROOT']."/var/tls/censor.txt");
	/*while (!feof ($fd)) 
	{
		$basta=trim(fgets($fd, 256));
		if ($basta) $lines[] = '/'.trim(fgets($fd, 4096)).'/i';
	   
	}
	fclose ($fd);*/
	$j=0;
	$linesg=array();
	for ($i=0;$i<count($lines);$i++){
		if (trim($lines[$i])) {
			$linesg[$j]='/'.addslashes(trim($lines[$i])).'/Uui';
			$j++;
		}
	}
	//foreach ($lines as $l) echo $l."<br>";
	//$uy=str_replace($lines,'***',$rawtext);
	$uy=preg_replace($linesg,'[***]',$rawtext);
	return $uy;
}


function getSent(){
	global $depot,$par;
	$errors=array();
	$toret='<script language=JavaScript>';

	$par['name'] = htmlspecialchars($par['name']);
	$par['email'] = htmlspecialchars($par['email']);
	$par['message'] = htmlspecialchars($par['message']);

	if (!$par['name'])	$depot['errors'][] = $depot['lxs']['err_name'];
	if (!$par['email']) $depot['errors'][] = $depot['lxs']['err_email'];
	if (!$par['message'])	$depot['errors'][] = $depot['lxs']['err_text'];

	if (count(@$depot['errors'])){
		//$toret.="window.top.Calert(\"".puttojs(errors_c())."\");";
		$message="<div class='errmess'>".errors_c()."</div>";

		$toret.="window.top.setvalue(\"errmess\",\"".puttojs($message)."\");";


	}else {
		$headers =	"From: yo@zmolo.com\n";
		$headers .= "Content-Type: text/plain; format=flowed; delsp=yes; charset=utf-8\n";
		$headers .= "Mime-Version: 1.0\n";  
		$headers .= "User-Agent: Zmolo.com (Exclusive Edition 0.2/8)";
$text="
NAME:      ".$par['name']."\n
EMAIL:     ".$par['email']."\n 
********************************************\n
MESSAGE:   ".$par['message']."\n 
";

		mail($depot['enviro']['e-mail-notify'],"ONLINE REQUEST",$text,$headers);

		$message="<div class='okmess'>".$depot['lxs']['messagesent']."</div>";
		$toret.="window.top.setvalue(\"varblock\",\"".puttojs($message)."\");";

	}

	$toret.="</script>";
	return $toret;

}

function sendErr($mess){
	$t="<div class=error>$mess</div>";
	echo "<script>window.top.setvalue('message','".puttojs($t)."');</script>";
}

function sendOk($mess){
	$t="<div class=ok>$mess</div>";
	echo "<script>window.top.setvalue('ad','".puttojs($t)."');window.top.setvalue('message','');</script>";
}


function get_savePhotoTitles(){
	global $par,$depot;

	if (!$par['dept']){
		$query="UPDATE ".PICSU." SET ";
	} else if ($par['dept']=='contest'){
		$query="UPDATE ".CONTESTIMG." SET ";
	}

	$titlepic=array();
	$query_set=array();
	foreach ($depot['vars']['langs'] as $lang=>$langarr){
			$query_set[]=" title_$lang = \"".sqller($par["title_$lang"])."\"";
			$titlepic[$lang]=$par["title_$lang"];

	}
	$sql=$query.implode(',',$query_set)." WHERE id = \"".sqller($par['id'])."\" ";
	if (@$par['dept']=='contest'){
		$sql.=" AND userid = \"".sqller($depot['logged_user']['usid'])."\"";
	}

	conn_sql_query($sql);

	require_once('stuff.php');
	$element=getPhotoInfo($par['index'],$titlepic,$par['id'],@$par['dept']);


	return "<script language=JavaScript>window.top.setvalue(\"phoinfo".$par['index']."\",\"".puttojs($element)."\");</script>";
}


function get_remprodimg(){
	global $par,$depot;
	$ttop='';

	$check_sql="
					
		SELECT COUNT(*) 
		FROM	".PICSU."	
		WHERE
		userid = \"".sqller($depot['logged_user']['usid'])."\"";

	$count=conn_fetch_row(conn_sql_query($check_sql));
		

	if (!$count[0])
	return "<script language=JavaScript>window.top.alert('The picture you are going to delete seems doesnt belong to you');</script>";


	$image=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".PICSU."  WHERE id= \"".$par['id']."\""));
	
	$res_ = conn_sql_query("DELETE FROM ".PICSU." WHERE id= \"".$par['id']."\"");
	
	if(conn_affected_rows($res_)>0){
		@unlink($_SERVER['DOCUMENT_ROOT']."/media/avatars/".$image['filename']);
		@unlink($_SERVER['DOCUMENT_ROOT']."/media/avatars/tmb/".$image['filename']);
	}

	$ttop= "<script language=JavaScript>window.top.remove1('imagefield".$par['index']."');</script>";

	return $ttop;

}


function get_changeVideo(){
	global $par,$depot;
	LLoad('stuff');

	$itemid=conn_fetch_row(sqlquery("SELECT itemid FROM ".VIDEO." WHERE filecode = \"".sqller($par['videoid'])."\""));


	return "<script language=JavaScript>window.top.setvalue(\"videoframe\",\"".puttojs(getItemVideos($itemid[0]))."\");window.top.initAnchors();</script>";
}



function get_pollAction(){
	global $par,$depot,$lxs;
	$ttop='';
	$toret='<script language=JavaScript>';

	if (!isset($_COOKIE['visitorCSUM']) || !isset($_COOKIE['visitorID'])) {
		$depot['errors'][]="Cookies disabled. You are not allowed to place comment with cookies disabled.";
		$toret.="window.top.setvalue(\"pollsection\",\"".puttojs(errors())."\")</script>";
		
		return $toret;
	} else {
		$visitor_sum=md5($_COOKIE['visitorID']."someseeedhere");
		if ($_COOKIE['visitorCSUM'] !== $visitor_sum) $depot['errors'][] = "There is a problem authorising vote request.";
	}

	$sql="
			SELECT 
				".POLLRES.".*,
				".POLL.".unique_id, 
				".POLL.".id As pollid  

			FROM	
				".POLLRES.", 
				".POLL." 
			WHERE 
				".POLLRES.".id = \"".sqller($par['myvote'])."\" 
			AND ".POLL.".id = poll_id 
			AND isvis = 1
	";


	$run=conn_fetch_assoc(sqlquery($sql));
	if (count($run)<2){
		$depot['errors'][] = 'Wrong poll ID';
		$toret.="window.top.setvalue(\"pollsection\",\"".puttojs(errors())."\");</script>";
		return $toret;

	}



	/*	UNIQUE ID CHECK	*/
	$par['humancheck']=substr($_COOKIE['visitorID'],0,20);
	$dodocount=conn_fetch_row(conn_sql_query("
		SELECT COUNT(*) 
		FROM ".VOTERS." 
		WHERE humancheck = \"".$par['humancheck']."\"
		AND articleid = \"".sqller($run['pollid'])."\"
	"));

	if ($dodocount[0]) {
		$depot['errors'][]=$depot['lxs']['he_pollvoted'];
		$toret.="window.top.setvalue(\"poll\",\"".puttojs(pollRes($run['pollid']))."\");</script>";
		return $toret;
	}
	
	/*	IP	CHECK	*/
	$cnt=sqlquery(
				"
		SELECT COUNT(*) 
		FROM ".VOTERS."
		WHERE articleid = \"".sqller($run['pollid'])."\" 
		AND ip = \"".sprintf("%u",ip2long($_SERVER['REMOTE_ADDR']))."\"
		"	
	);

	$ipqty=conn_fetch_row($cnt);
	if ($ipqty[0]>4) {
		$depot['errors'][]=$depot['lxs']['he_pollvoted'];
		$toret.="window.top.setvalue(\"poll\",\"".puttojs(pollRes($run['pollid']))."\");</script>";
		return $toret;
	}	
	

	/*		VOTERS UPDATE	*/
	$insert_sql="
			INSERT IGNORE 
			INTO ".VOTERS."
			set 
				csum=\"".substr(md5($par['humancheck'].$run['pollid']."someseeedhere"),0,16)."\",
				articleid = \"".sqller($run['pollid'])."\",
				ip = \"".sprintf("%u",ip2long($_SERVER['REMOTE_ADDR']))."\",
				humancheck = \"".$par['humancheck']."\",
				client=\"".sqller(@$_SERVER['HTTP_USER_AGENT'])."\"
			";

	$res_ = conn_sql_query($insert_sql);


	if (!(conn_affected_rows($res_)>0)){
		$depot['errors'][]=$depot['lxs']['he_pollvoted'];
		$toret.="window.top.setvalue(\"poll\",\"".puttojs(pollRes($run['pollid']))."\");</script>";
		return $toret;
	}

	$current_votes=conn_fetch_row(
	sqlquery("
					SELECT COUNT(*) 
					FROM ".VOTERS." 
					WHERE 
					articleid = \"".sqller($run['pollid'])."\"
		")
	);

	$sql="
		UPDATE ".POLLRES." 
		SET qty=qty+1 
		WHERE id = \"".sqller($par['myvote'])."\" ";

	sqlquery($sql);
	

	/*if (count(@$depot['errors'])){
		$toret.="window.top.setvalue(\"pollsection\",\"".puttojs(errors_c())."\");";
	} else {
		if (isset($_COOKIE['dspoll'.$run['poll_id']])) {
			$depot['oks'][] = $depot['lxs']['he_pollvoted'];
			
			return "<script type='text/javascript'>window.top.setvalue(\"pollsection\",\"".puttojs(oks_c())."\");</script>";

		} else {
			setcookie( 'dspoll'.$run['poll_id'], $run['unique_id'],time()+60*60*24*30);
			$sql="
				UPDATE ".POLLRES." 
				SET qty=qty+1 
				WHERE id = \"".sqller($par['myvote'])."\" ";

			sqlquery($sql);
		}*/

		return "<script type='text/javascript'>window.top.setvalue(\"poll\",\"".puttojs(pollRes($run['pollid']))."\");</script>";

/*	}*/
	
	$toret.="</script>";
	return $toret;
}


function pollRes($myvote){
	global $par,$depot;
	$sql="
		SELECT ".POLLRES.".*,ho.subject
		FROM ".POLLRES.", 
							(
								SELECT	".POLL.".subject, 
										".POLL.".id 
								FROM	".POLL."	
								WHERE	isvis = 1
								AND  id = \"".sqller($myvote)."\"
								ORDER BY orderid DESC LIMIT 1
							) AS ho

		WHERE ".POLLRES.".poll_id = ho.id
		ORDER BY ".POLLRES.".orderid
	";

	$res=sqlquery_cached($sql,10,0);
	
	if (!count($res)) return $sql;
	$arr=array();
	$total=0;

	foreach ($res as $r) {
		$total=$total+$r['qty'];
	}
	
	foreach ($res as $r) {
		$arr['items'][]=array(
						'width'	=>		$r['qty']/$total*100,
						'votetitle'=>	$r['variant'],
						'qty'	=>	$r['qty']
		);
	}

	
	return parse_local($arr,'pollres','3.0');

}