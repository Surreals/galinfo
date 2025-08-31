<?
$vars['mod_result']=get_chats();



function get_chats(){
	global $par,$errors,$oks,$vars,$lxs;
	//variables to play with: date, time, nick,pager,no,commentid,comment SET=commset
	$ttop='';
	$arr=array();
	$arr['empty']	='';
	$arr['pager'] = '';
	$vars['title']=@$lxs['he_zik']." - ".@$lxs['he_chatconf'];

	if (!isset($par['chid'])) return list_chats(); 
	else return view_chat();


	/*	news id maybe fetched from UPD ajax*/
	if (isset($vars['active_news']['id'])) {
		$newsid=$vars['active_news']['id']; 
		$arr['commhead'] = "<h2 class=plus>".$lxs['he_comments']."</h2>";
	} else {
		$newsid=$par['commentnewsid'];
		$arr['commhead'] = '';
	}

	$sql="SELECT COUNT(*) FROM ".COMMENTS." WHERE newsid = \"".sqller($newsid)."\"";
	$count1=mysql_fetch_row(mysql_query($sql));

	list($arr['pager'],$from,$to) = get_pager($count1,$newsid);
	if (!$count1[0]) {
		$arr['empty']	=$lxs['he_nocomments'];
		$arr['commset']='';
		$ttop.=parse_local($arr,'_comments');
		$ttop.=get_commform();
		return $ttop;
	}

	$sql="
			SELECT	DATE_FORMAT(ddate,'%d.%m.%y') AS mydate,
					DATE_FORMAT(ddate,'%H:%i') AS mytime,
					nick,
					comment
			FROM ".COMMENTS." 
			WHERE newsid = \"".sqller($newsid)."\" 
			ORDER BY ddate DESC ";
	if ($to) $sql.=" LIMIT $from,$to";
	$sql_run=sqlquery($sql);
	while ($res = mysql_fetch_assoc($sql_run)){
	
		$arr['commset'][]=array(
								"date"		=>	$res['mydate'],
								"time"	=>	$res['mytime'],
								"nick"		=>	getfromsql($res['nick'],$par['lng']),
								"comment"	=>	getfromsql($res['comment'],$par['lng'])
							);
	}
	
	$ttop = parse_local($arr,'_comments');
	if (isset($vars['active_news']['id'])) $ttop.=get_commform();
	return $ttop;
}




function get_chatform(){
	global $par,$errors,$oks,$vars,$lxs;
	$arr['no'] = unique_guest_no(15);
	$arr['chatid'] = $par['chid'];
	$arr['namevalue']='';
	if (isset($_COOKIE['myname'])) {

		$arr['namevalue']=$_COOKIE['myname'];
	}
	return parse_local($arr,'_chatform');
}



function get_pager($count,$newsid){
	global $par, $vars, $enviro, $lxs; 
	$ttop='';
	if (!isset($par['pg'])) $par['pg']=0;
	$perpage=$enviro['qty_comments_perpage'];

	$pages=($count[0]%$perpage) ? (int)($count[0]/$perpage+1) : $count[0]/$perpage;

	if ($pages <2) return array($ttop,0,0);
	$path='';
	$ppg=$enviro['qty_comments_pages'];
	$pppages=($pages%$ppg) ? (int)($pages/$ppg+1) : $pages/$ppg;
	$curr_ppg=(int)($par['pg']/$ppg);

	$start_page=$curr_ppg*$ppg;
	$end_page=($curr_ppg*$ppg+$ppg>$pages) ? $pages : $curr_ppg*$ppg+$ppg;
	//$path=$par['pphtm'];
	//foreach ($_SERVER as $k=>$v) echo "$k = > $v<br>";
	
	if ($curr_ppg!=0) {
		$prev_page="<a href=\"\" class=nxt onClick = \"return chPg('comments', '".$newsid."', '".($curr_ppg*$ppg-1)."', '".$par['lng']."', 1)\">&lt;</a>"; 
		$pprev_page="<a href=\"\"  class=nxt onClick = \"return chPg('comments', '".$newsid."', '0', '".$par['lng']."', 1)\">&#8230;</a>"; 
	}	else 
	{
		$prev_page="";
		$pprev_page="";
	}
	if ($curr_ppg!= ($pppages-1) && $pppages!==0) {
		$next_page="<a href=\"\"  class=nxt onClick = \"return chPg('comments', '".$newsid."', '".(($curr_ppg+1)*$ppg)."', '".$par['lng']."', 1)\">&gt;</a>"; 
		$nnext_page="<a href=\"\"  class=nxt onClick = \"return chPg('comments', '".$newsid."', '".($pages-1)."', '".$par['lng']."', 1)\">&#8230;</a>";
	} else 
	{
		$next_page="";
		$nnext_page="";
	}
		
	if ($pages>1) {
		$ttop.="<div class=pager><b>".$lxs['he_page'].":</b>";
		$ttop.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$ttop.= "<a href=\"\" onClick = \"return chPg('comments', '".$newsid."', '".$i."', '".$par['lng']."', 1)\">".($i+1)."</a>";
			else $ttop.= "<span>".($i+1)."</span>";
		}
		$ttop.= $next_page.$nnext_page;
		$ttop.="</div>";
	} 
	$limitfrom =	$par['pg']*$perpage;
	$limitto =		$perpage;
	return array($ttop,$limitfrom,$limitto);
}



function list_chats(){
	global $par,$errors,$oks,$vars,$lxs;
	//link,image,month,year,listhead,teaser


	$ttop='';
	$sql = "
			SELECT	
					".CHATL.".*, 
					DATE_FORMAT(chatdate,'%d.%m.%Y') AS ddate,
					GROUP_CONCAT(".PICS.".filename) AS ims 
			FROM ".CHATL." 
			LEFT JOIN ".PICS."
			ON FIND_IN_SET(".PICS.".id, ".CHATL.".images)
			WHERE lang = \"".$vars['langs'][$par['lng']]['id']."\" AND chatdate < NOW()
			GROUP BY ".CHATL.".id
			ORDER BY chatdate DESC
	";
	

	$sql_run=sqlquery($sql) or die(mysql_error());
	$arr=array();
	$arr['listhead']="<h1>".$lxs['he_guests']."</h1>";
	for ($i=0;$i<mysql_num_rows($sql_run);$i++){
		$imas=array();
		$res=mysql_fetch_assoc($sql_run);

		$image='';
		if ($res['ims']) {
			$imas=explode(',',$res['ims']);
			$image="<img src='/gallery/tmb/".$imas[0]."'>";
		}
		list ($day,$month,$year) = explode('.',$res['ddate']);
		$arr['chatlist'][]=array(
				'link'		=>	"/".$par['lng']."/chat/".$res['id'],
				'image'		=>	$image,
				'day'		=>	$day,
				'month'		=>	$lxs['mona_'.$month],
				'year'		=>	$year,
				'nguest'	=>	getfromsql($res['nguest'],$vars['lang']),
				'teaser'	=>	getfromsql($res['teaser'],$vars['lang'])
			
		);

	}
	return main_chat().parse_local($arr,'_chatlist');
}


function main_chat(){
	global $par,$errors,$oks,$gerrors,$vars,$lxs;
	//variables to play with: link,image,day,month,year,header,teaser
	$addon='';
	$ttop="";
	$arr=array();
	$headnews='';
	$what=0;
	$sql = "
				SELECT	
						".CHATL.".*, 
						DATE_FORMAT(chatdate,'%d.%m.%Y') AS ddate,
						DATE_FORMAT(chatdate,'%H.%i.%d.%m.%Y') AS d1,
						DATE_FORMAT(startdate,'%H.%i.%d.%m.%Y') AS d2,
						DATE_FORMAT(enddate,'%H.%i.%d.%m.%Y') AS d3,
						GROUP_CONCAT(".PICS.".filename) AS ims 
				FROM ".CHATL." 
				LEFT JOIN ".PICS."
				ON FIND_IN_SET(".PICS.".id, ".CHATL.".images)
				WHERE lang = \"".$vars['langs'][$par['lng']]['id']."\" 
				AND (startdate < NOW() AND enddate > NOW())
				GROUP BY ".CHATL.".id
				ORDER BY chatdate DESC
	";
	$res=mysql_fetch_assoc(sqlquery($sql));
	if (count($res)<3) {
		$sql = "
				SELECT	
						".CHATL.".*, 
						DATE_FORMAT(chatdate,'%d.%m.%Y') AS ddate,
						DATE_FORMAT(chatdate,'%H.%i.%d.%m.%Y') AS d1,
						DATE_FORMAT(startdate,'%H.%i.%d.%m.%Y') AS d2,
						DATE_FORMAT(enddate,'%H.%i.%d.%m.%Y') AS d3,
						GROUP_CONCAT(".PICS.".filename) AS ims 
				FROM ".CHATL." 
				LEFT JOIN ".PICS."
				ON FIND_IN_SET(".PICS.".id, ".CHATL.".images)
				WHERE lang = \"".$vars['langs'][$par['lng']]['id']."\" 
				AND (startdate > NOW())
				GROUP BY ".CHATL.".id
				ORDER BY chatdate DESC
		";
		$res=mysql_fetch_assoc(sqlquery($sql));
		if (count($res)<3) return;
		else {
			$headnews = "<h1>".$lxs["he_nextchat"]."</h1>";
			$what=2;
		}
		
	} else {
		$headnews = "<h1>".$lxs["he_activechat"]."</h1>";
		$what=1;
	}

	
	
	list ($day,$month,$year) = explode('.',$res['ddate']);
	$t1=explode('.',$res['d1']);
	$t2=explode('.',$res['d2']);
	$t3=explode('.',$res['d3']);
	
	if ($what==2) {
		$image='';
		if ($res['ims']) {
			$imas=explode(',',$res['ims']);
			$image="<img src='/gallery/intxt/".$imas[0]."' class=imglnk>";
		}
		$arr=array(
					'cstart'	=>	'<b class=not><em>'.$t1[0].":".$t1[1]."</em> ".$t1[2]." ".$lxs['mona_'.$t1[3]]." ".$t1[4]."</b><br>",
					'timefrom'	=>	'<b class=not><em>'.$t2[0].":".$t2[1]."</em> ".$t2[2]." ".$lxs['mona_'.$t2[3]]." ".$t2[4]."</b>",
					'timeto'	=>	'<b class=not><em>'.$t3[0].":".$t3[1]."</em> ".$t3[2]." ".$lxs['mona_'.$t3[3]]." ".$t3[4]."</b>",
					'confstart'	=>	$lxs['he_chattime'],
					'timeinfo'	=>	$lxs['he_chattime1'],
					'headnews'	=>	$headnews,
					'link'		=>	"/".$par['lng']."/chat/".$res['id'],
					'image'		=>	$image,
					'day'		=>	$day,
					'month'		=>	$lxs['mona_'.$month],
					'year'		=>	$year,
					'header'	=>	getfromsql($res['nguest'],$vars['lang']),
					'teaser'	=>	getfromsql($res['teaser'],$vars['lang'])
			
		);
		return parse_local($arr,'_nextchat');
	}	 else if ($what==1) {
		$image='';
		if ($res['ims']) {
			$imas=explode(',',$res['ims']);
			$image="<img src='/gallery/intxt/".$imas[0]."'>";
		}
		$teaser=getfromsql($res['teaser'],$vars['lang'])."<div class=frm2>".$lxs['he_activechat1']."<br><br><a href='"."/".$par['lng']."/chat/".$res['id']."' class=big>".$lxs['he_ask']."</a></div>";
		$arr=array(	
					'timeto'	=>	'<b class=not><em>'.$t3[0].":".$t3[1]."</em> ".$t3[2]." ".$lxs['mona_'.$t3[3]]." ".$t3[4]."</b>",
					'headnews'	=>	$headnews,
					'link'		=>	"/".$par['lng']."/chat/".$res['id'],
					'image'		=>	$image,
					'day'		=>	$day,
					'month'		=>	$lxs['mona_'.$month],
					'year'		=>	$year,
					'header'	=>	getfromsql($res['nguest'],$vars['lang']),
					'teaser'	=>	$teaser
		
		);
		return parse_local($arr,'_newsoday');
	}
}


function view_chat(){
	//variables to play with: link,image,day,month,year,header,teaser
	global $par,$errors,$oks,$gerrors,$vars,$lxs;
	$addon='';
	$ttop="";
	$arr=array();
	$headnews='';
	$active=0;
	$what=0;
	$hdr='';
	/*$sql = "
				SELECT	
						".CHATL.".*, 
						DATE_FORMAT(chatdate,'%d.%m.%Y') AS ddate,
						UNIX_TIMESTAMP(chatdate) AS d1,
						UNIX_TIMESTAMP(startdate) AS d2,
						UNIX_TIMESTAMP(enddate) AS d3,
						GROUP_CONCAT(".PICS.".filename) AS ims 
				FROM ".CHATL." 
				LEFT JOIN ".PICS."
				ON FIND_IN_SET(".PICS.".id, ".CHATL.".images)
				WHERE ".CHATL.".id=".$par['chid']."
				GROUP BY ".CHATL.".id
				ORDER BY chatdate DESC
	";*/

	$sql = "
				SELECT	
						".CHATL.".*, 
						DATE_FORMAT(chatdate,'%d.%m.%Y') AS ddate,
						UNIX_TIMESTAMP(chatdate) AS d1,
						UNIX_TIMESTAMP(startdate) AS d2,
						UNIX_TIMESTAMP(enddate) AS d3
				FROM ".CHATL." 
				WHERE ".CHATL.".id=".$par['chid']."
				GROUP BY ".CHATL.".id
				ORDER BY chatdate DESC
	";

	$res=mysql_fetch_assoc(sqlquery($sql));
	$shortinfo='';
	$vars['title']=@$lxs['he_zik']." - ".@$lxs['he_chatconf'].' | '.$res['nguest'];
	$vars['description']=$res['teaser'];
	if ($vars['ctime'] > $res['d2'] && $vars['ctime'] < $res['d3']) {
		
		$active=1;
		$arr=array();
		$arr['listhead']="<h1>".$lxs['he_activechat']."</h1>";
		$imas=array();
		$image='';
		if ($res['images']) {
			$imas=get_selected_images($res['images'],$par['lng']);
			foreach ($imas as $im){
				$image.="<img src='/gallery/tmb/".$im['filename']."'>";
			}
		}
		list ($day,$month,$year) = explode('.',$res['ddate']);
		$arr['chatlist'][]=array(
				'link'		=>	"/".$par['lng']."/chat/".$res['id'],
				'image'		=>	$image,
				'day'		=>	$day,
				'month'		=>	$lxs['mona_'.$month],
				'year'		=>	$year,
				'nguest'	=>	getfromsql($res['nguest'],$vars['lang']),
				'teaser'	=>	getfromsql($res['teaser'],$vars['lang'])
			
		);
		$ttop.=parse_local($arr,'_chatlist');
	} else {
		list ($day,$month,$year) = explode('.',$res['ddate']);
		$hdr="<h1>".$res['teaser']."</h1><span class=notice>".$day." ".$lxs['mona_'.$month]." ".$year."</span>";
	}


	/*GET TEXT*/
	/*$sql = "
				SELECT	
						".CHATP.".*, 
						GROUP_CONCAT(".PICS.".filename) AS ims 
				FROM ".CHATP." 
				LEFT JOIN ".PICS."
				ON FIND_IN_SET(".PICS.".id, ".CHATP.".images)
				WHERE ".CHATP.".chatid=".$par['chid']."
				AND ".CHATP.".published=1
				GROUP BY ".CHATP.".id
				ORDER BY ".CHATP.".id
	";*/


	$sql = "
				SELECT	
						".CHATP.".*
				FROM ".CHATP." 
				WHERE ".CHATP.".chatid=".$par['chid']."
				AND ".CHATP.".published=1
				GROUP BY ".CHATP.".id
				ORDER BY ".CHATP.".id";

	$sql_run=sqlquery($sql);
	$arr1=array();
	while ($res = mysql_fetch_assoc($sql_run)) {

		$image='';
		if ($res['images']) {
			$imas=get_selected_images($res['images'],$par['lng']);
			foreach ($imas as $im){
				$image.="<img src='/gallery/intxt/".$im['filename']."'  class=imgrnk>";
			}
		}

		$nick='[ ******* ]';
		if ($res['uid']) $nick="[ ".getfromsql($res['uid'],$vars['lang'])." ] ";
		$arr1['hdr']=$hdr;
		$arr1['textlist'][]=array(
				'image'		=>	$image,
				'nick'		=>	$nick,
				'question'	=>	getfromsql($res['question'],$vars['lang']),
				'answer'	=>	getfromsql($res['answer'],$vars['lang']),
		);
	}
	$ttop.=parse_local($arr1,'_chattext');
	
	/*	GET questions*/
	
	$sql="SELECT * FROM ".CHATQ." WHERE chatid = \"".$par['chid']."\"";
	$sql_run=sqlquery($sql);

	if (mysql_num_rows($sql_run)){
		$ttop.="<h1>".$lxs['he_questions']."</h1><ul class=normal>";
		while ($res = mysql_fetch_assoc($sql_run)) {
			$ttop.="<li>".getfromsql($res['question'],$vars['lang']);
		}
		$ttop.="</ul>";
	}


	/*	GET FORM*/
	if ($active) $ttop.=get_chatform();
	return $ttop;
}