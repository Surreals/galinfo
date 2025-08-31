<?
$depot['vars']['mod_result']=get_chats();



function get_chats(){
	global $par,$depot;
	//variables to play with: date, time, nick,pager,no,commentid,comment SET=commset
	$ttop='';
	$arr=array();
	$arr['empty']	='';
	$arr['pager'] = '';
	$depot['title']=@$depot['lxs']['he_zik']." - ".@$depot['lxs']['he_chatconf'];

	if (!isset($par['chid'])) return list_chats(); 
	else return view_chat();


	/*	news id maybe fetched from UPD ajax
	if (isset($depot['active_news']['id'])) {
		$newsid=$depot['active_news']['id']; 
		$arr['commhead'] = "<h2 class=plus>".$depot['lxs']['he_comments']."</h2>";
	} else {
		$newsid=$par['commentnewsid'];
		$arr['commhead'] = '';
	}

	$sql="SELECT COUNT(*) FROM ".COMMENTS." WHERE newsid = \"".sqller($newsid)."\"";
	$count1=conn_fetch_row(conn_sql_query($sql));

	list($arr['pager'],$from,$to) = get_pager($count1,$newsid);
	if (!$count1[0]) {
		$arr['empty']	=$depot['lxs']['he_nocomments'];
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
	while ($res = conn_fetch_assoc($sql_run)){
	
		$arr['commset'][]=array(
								"date"		=>	$res['mydate'],
								"time"	=>	$res['mytime'],
								"nick"		=>	getfromsql($res['nick'],$par['lng']),
								"comment"	=>	getfromsql($res['comment'],$par['lng'])
							);
	}
	
	$ttop = parse_local($arr,'comments',1);
	if (isset($depot['active_news']['id'])) $ttop.=get_commform();
	return $ttop;*/
}




function get_chatform(){
	global $par,$errors,$oks,$depot,$lxs;
	$arr['no'] = unique_guest_no(15);
	$arr['chatid'] = $par['chid'];
	$arr['namevalue']='';
	

	if (authenticated()) {

		/*$arr['addcommentform']=get_commform();*/
		$arr['addcommentlink']="<h1>OH MY DEAR</h1>";
		$arr['addcommentlink']="<a href='' onClick='showCommentForm();return false;' id='addcomment' >+<p>".$depot['lxs']['he_ask']."</p></a>";
		$authok=true;

		return parse_local($arr,'_chatform',1);
	
	}	else {
		
			if ($_SERVER['REQUEST_URI'] !== "/")
				$logtolocation=htmlspecialchars('http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
			else
				$logtolocation=htmlspecialchars('http://'.$_SERVER['HTTP_HOST']."/myaccount/");
			
			$arr['addcommentlink']="<a href='/login/?logtolocation=".base64_encode($logtolocation)."' id='addcomment' class='needlogin'  style='margin:20px 0;border:0;'>+<p>".$depot['lxs']['he_ask']."</p></a>";
		
		return $arr['addcommentlink'];


	
	}




	return parse_local($arr,'_chatform',1);
}



function get_pager($count,$newsid){
	global $par, $depot, $enviro, $lxs; 
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
		$ttop.="<div class=pager><b>".$depot['lxs']['he_page'].":</b>";
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
	global $par,$depot;
	//link,image,month,year,listhead,teaser

	$sql_count="
			SELECT	COUNT(*) AS qty 
			FROM ".CHATL." 
			WHERE lang = \"".$depot['vars']['langid']."\" AND chatdate < NOW()";

	$sql_count_run=sqlquery_cached($sql_count,1000,6);
	$count=$sql_count_run[0];
	list($from,$to,$pages) = pager_calc(10,10,$count['qty']);

	$depot['vars']['title']=$depot['lxs']['he_chatconf'];

	$ttop='';
	$sql = "
			SELECT	
					".CHATL.".*, 
					DATE_FORMAT(chatdate,'%d.%m.%Y') AS ddate,
					GROUP_CONCAT(".PICS.".filename) AS ims 
			FROM ".CHATL." 
			LEFT JOIN ".PICS."
			ON FIND_IN_SET(".PICS.".id, ".CHATL.".images)
			WHERE lang = \"".$depot['vars']['langid']."\" AND chatdate < NOW()
			GROUP BY ".CHATL.".id
			ORDER BY chatdate DESC

	";


	$sql = "
			SELECT	".CHATL.".*,
					DATE_FORMAT(chatdate,'%d.%m.%Y') AS ddate

            FROM ".CHATL." USE KEY (PRIMARY)
			WHERE lang = \"".$depot['vars']['langid']."\" AND chatdate < NOW()

			ORDER BY chatdate DESC

	";
	if ($to) $sql.=" LIMIT $from,$to";
	$path=$depot['vars']['language_link'].'chat/';

	$sql_run=sqlquery($sql) or die(conn_error());
	$arr=array();

	for ($i=0;$i<conn_sql_num_rows($sql_run);$i++){
		$imas=array();
		$res=conn_fetch_assoc($sql_run);


		if ($res['images'])	{
			$images=get_selected_images($res['images'],$par['lng']);
			if (count($images)) {
				$image="<img src='/media/gallery/tmb/".$images[0]['filename']."' alt='newsimage' />";
			} else {
				$image="<img src='/img/noimagesq.gif'>";
			}
		} else {
			$image="<img src='/img/noimagesq.gif'>";
		}

		/*$image='';
		if ($res['ims']) {
			$imas=explode(',',$res['ims']);
			$image="<img src='/gallery/tmb/".getImagePath($imas[0]).$imas[0]."'>";
		} else {
			$image="<img src='/im/noimage.gif'>";
		}  */
		list ($day,$month,$year) = explode('.',$res['ddate']);
		$arr['chatlist'][]=array(
				'link'		=>	"/chat/".$res['id'],
				'image'		=>	$image,
				'day'		=>	$day,
				'month'		=>	$depot['lxs']['mona_'.$month],
				'year'		=>	$year,
				'nguest'	=>	getfromsql($res['nguest'],$par['lng']),
				'teaser'	=>	getfromsql($res['teaser'],$par['lng'])
			
		);

	}
	
	$arr['pager']=pager($path,$pages,10,array('id'=>'y'));

	return main_chat().parse_local($arr,'chatList',1);
}


function main_chat(){
	global $par,$errors,$oks,$gerrors,$depot,$lxs;
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
				WHERE lang = \"".$depot['vars']['langid']."\" 
				AND (startdate < NOW() AND enddate > NOW())
				GROUP BY ".CHATL.".id
				ORDER BY chatdate DESC
	";
	$res=conn_fetch_assoc(sqlquery($sql));
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
				WHERE lang = \"".$depot['vars']['langid']."\" 
				AND (startdate > NOW())
				GROUP BY ".CHATL.".id
				ORDER BY chatdate DESC
		";
		$res=conn_fetch_assoc(sqlquery($sql));
		if (count($res)<3) return;
		else {
			$headnews = $depot['lxs']["he_nextchat"];
			$what=2;
		}
		
	} else {
		$headnews = $depot['lxs']["he_activechat"];
		$what=1;
	}

	
	
	list ($day,$month,$year) = explode('.',$res['ddate']);
	$t1=explode('.',$res['d1']);
	$t2=explode('.',$res['d2']);
	$t3=explode('.',$res['d3']);
	
	/*if ($what==2) {
		$image='';
		if ($res['ims']) {
			$imas=explode(',',$res['ims']);
			$image="<img src='/media/gallery/intxt/".getImagePath($imas[0]).$imas[0]."' class=imglnk>";
		}
		$arr=array(
					'cstart'	=>	'<b class=not><em>'.$t1[0].":".$t1[1]."</em> ".$t1[2]." ".$depot['lxs']['mona_'.$t1[3]]." ".$t1[4]."</b><br>",
					'timefrom'	=>	'<b class=not><em>'.$t2[0].":".$t2[1]."</em> ".$t2[2]." ".$depot['lxs']['mona_'.$t2[3]]." ".$t2[4]."</b>",
					'timeto'	=>	'<b class=not><em>'.$t3[0].":".$t3[1]."</em> ".$t3[2]." ".$depot['lxs']['mona_'.$t3[3]]." ".$t3[4]."</b>",
					'confstart'	=>	$depot['lxs']['he_chattime'],
					'timeinfo'	=>	$depot['lxs']['he_chattime1'],
					'headnews'	=>	$headnews,
					'link'		=>	"/".$par['lng']."/chat/".$res['id'],
					'image'		=>	$image,
					'day'		=>	$day,
					'month'		=>	$depot['lxs']['mona_'.$month],
					'year'		=>	$year,
					'header'	=>	getfromsql($res['nguest'],$depot['lang']),
					'teaser'	=>	getfromsql($res['teaser'],$depot['lang'])
			
		);
		return parse_local($arr,'_nextchat');
	}	 else if ($what==1) {*/
		$image='';
		if ($res['ims']) {
			$imas=explode(',',$res['ims']);
			$image="<img src='/media/gallery/intxt/".getImagePath($imas[0]).$imas[0]."'>";
		}
		$teaser="<p>".getfromsql($res['teaser'],$depot['vars']['language'])."</p><br><a href='/chat/".$res['id']."' class=button>".$depot['lxs']['he_ask']."</a>";
		$arr=array(	
					'timeto'	=>	'<b class=not><em>'.$t3[0].":".$t3[1]."</em> ".$t3[2]." ".$depot['lxs']['mona_'.$t3[3]]." ".$t3[4]."</b>",
					'headnews'	=>	$headnews,
					'link'		=>	"/chat/".$res['id'],
					'image'		=>	$image,
					'day'		=>	$day,
					'month'		=>	$depot['lxs']['mona_'.$month],
					'year'		=>	$year,
					'header'	=>	getfromsql($res['nguest'],$depot['vars']['language']),
					'teaser'	=>	$teaser,
					'cstart'	=>	$t1[0].":".$t1[1]."<br>",
		
		);
		return parse_local($arr,'chatODay',1);
	/*}*/
}


function view_chat(){
	//variables to play with: link,image,day,month,year,header,teaser
	global $par,$errors,$oks,$gerrors,$depot,$lxs;
	$addon='';
	$ttop="";
	$arr=array();
	$headnews='';
	$active=0;
	$what=0;
	$hdr='';


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

	$res=conn_fetch_assoc(sqlquery($sql));
	$shortinfo='';
	$depot['vars']['title']=@$depot['lxs']['he_dtitle']." - ".@$depot['lxs']['he_chatconf'].' | '.$res['nguest'];
	$depot['vars']['description']=$res['teaser'];

	$imas=array();
	$ava='';
	if ($res['images']) {
		$imas=get_selected_images($res['images'],$par['lng']);
		foreach ($imas as $im){
			$ava.="<img src='/media/gallery/tmb/".$im['filename']."' class='chatava'>";
		}
	}

	if ($depot['vars']['ctime']  > $res['d2'] && $depot['vars']['ctime'] < $res['d3']) {
		
		$active=1;
		$arr=array();
		//$arr['listhead']="<h1>".$depot['lxs']['he_activechat']."</h1>";
		
		list ($day,$month,$year) = explode('.',$res['ddate']);
		$arr['chatlist'][]=array(
				'link'		=>	$depot['vars']['language_link']."chat/".$res['id'],
				'image'		=>	$ava,
				'day'		=>	$day,
				'month'		=>	$depot['lxs']['mona_'.$month],
				'year'		=>	$year,
				'nguest'	=>	getfromsql($res['nguest'],$par['lng']),
				'teaser'	=>	getfromsql($res['teaser'],$par['lng'])
			
		);
		$ttop.=parse_local($arr,'chatListActiveChat',1);

		/*	GET FORM*/
		if ($active) $ttop.="<div class='clean'></div>".get_chatform()."<div class='clean'></div>";

	} else {
		list ($day,$month,$year) = explode('.',$res['ddate']);
		$hdr=$res['teaser'];
		$hdr0=$res['nguest'];
		$notice="<span class=notice>".$day." ".$depot['lxs']['mona_'.$month]." ".$year."</span>";
	}

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
	while ($res = conn_fetch_assoc($sql_run)) {

		$image='';
		if ($res['images']) {
			$imas=get_selected_images($res['images'],$par['lng']);
			foreach ($imas as $im){
				$image.="<div class=\"img-post left\"><img src='/media/gallery/intxt/".$im['filename']."'  class=imgrnk></div>";
			}
		}

		$nick='***';
		if ($res['uid']) $nick=getfromsql($res['uid'],$par['lng']);
		$arr1['hdr']="$ava<h1>".@$hdr0."</h1><h2>".@$hdr."</h2><span class='spacer'></span>";
		$arr1['notice']=@$notice;
		$arr1['textlist'][]=array(
				'image'		=>	$image,
				'nick'		=>	$nick,
				'question'	=>	getfromsql($res['question'],$par['lng']),
				'answer'	=>	getfromsql($res['answer'],$par['lng']),
		);
	}
	$ttop.=parse_local($arr1,'chatText',1);
	
	/*	GET questions*/
	
	$sql="SELECT * FROM ".CHATQ." WHERE chatid = \"".$par['chid']."\" ORDER BY id";
	$sql_run=sqlquery($sql);

	if (conn_sql_num_rows($sql_run)){
		$ttop.="<header>".$depot['lxs']['he_questions']."</header><ul class='normal'>";
		while ($res = conn_fetch_assoc($sql_run)) {
			$ttop.="<li><b>?</b>".getfromsql($res['question'],$par['lng'])."</li>";
		}
		$ttop.="</ul>";
	}


	
	return $ttop;
}