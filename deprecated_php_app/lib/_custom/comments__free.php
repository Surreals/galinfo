<?
$depot['vars']['mod_result']=get_comments();
						   


function get_comments(){
	global $par,$errors,$oks,$depot,$lxs;
	//variables to play with: date, time, nick,pager,no,commentid,comment SET=commset

	return "";

	$html='';
	$arr=array();
	$arr['empty']	='';
	$arr['pager'] = '';
	$authok=false;
	
	/*	news id maybe fetched from UPD ajax*/

	if (isset($depot['current_article']['id'])) {
		$newsid = $depot['current_article']['id'];
	} else {
		$newsid=$par['commentnewsid'];
	}

	$sql="SELECT COUNT(*) FROM ".COMMENTS." WHERE newsid = \"".sqller($newsid)."\"";
	$count1=mysql_fetch_row(mysql_query($sql));


	if (isset($depot['current_article']['id'])) {
		$newsid=$depot['current_article']['id']; 

		$arr['commhead'] = "
							
									<span class=\"boxheader centered\"><b>".$depot['lxs']['he_comments']." (".$count1[0].")</b></span>
							
		";

		$pattern='_comments';
	} else {
		$newsid=$par['commentnewsid'];
		$arr['commhead'] = '';
		$pattern='_commentlist';
	}


	$sql="SELECT COUNT(*) FROM ".COMMENTS." WHERE newsid = \"".sqller($newsid)."\" AND  parent = 0 ";
	$count1=mysql_fetch_row(mysql_query($sql));


	
	if (@$newsid) {

		$arr['addcommentform']=get_commform();
		$arr['addcommentlink']="<h1>OH MY DEAR</h1>";
		$arr['addcommentlink']="<a href='' onClick='showCommentForm();return false;' id='addcomment' >+<p>".$depot['lxs']['he_addcomment']."</p></a>";
		$authok=true;
	}


	list($arr['pager'],$from,$to) = get_pager($count1,$newsid);
	if (!$count1[0]) {
		$arr['addcommentlink'].="<div id='emptycomm'></div>";
		$arr['commset']=array();
	}  else {




		if ($to) $limit=" LIMIT $from,$to"; else $limit="";

		/*SELECTION MAP*/	
		$sql_map="

				SELECT
					  t1.id AS lev1,
					  t2.id as lev2,
					  t3.id as lev3,
					  t4.id as lev4
					  
				FROM (
							SELECT *
							FROM ".COMMENTS."
							where parent = 0
							AND newsid=\"".sqller($newsid)."\" 
	
							order by id desc
							$limit

				) AS t1

				LEFT JOIN (
							SELECT id,parent
							FROM a_comments
							where parent <> 0
							AND newsid=\"".sqller($newsid)."\"
							

				) AS t2 ON t2.parent = t1.id
				
				LEFT JOIN (
							SELECT id,parent
							FROM a_comments
							where parent <> 0
							AND newsid=\"".sqller($newsid)."\"
							

				) AS t3 ON t3.parent = t2.id
				
				LEFT JOIN (
							SELECT id,parent
							FROM a_comments
							where parent <> 0
							AND newsid=\"".sqller($newsid)."\"
							

				) AS t4 ON t4.parent = t3.id


				order by
					  t1.id desc,
					  t2.id desc,
					  t3.id desc,
					  t4.id desc
				
		
		";

		if (isset($par['berimor'])) echo $sql_map;
		
		$sql_map_query=sqlquery($sql_map);
		
		$tree_map=array();
		$order_list=array();


		while($rem=mysql_fetch_row($sql_map_query)){
			for ($i=0;$i<4;$i++){
			
				if ($rem[$i] && !isset($tree_map[$rem[$i]])) {
					$tree_map[$rem[$i]]=$i;
					$order_list[]=$rem[$i];
				}

			}
		}

		if (!count($order_list)) return;

		$sql="
				SELECT	DISTINCT
						DATE_FORMAT(ddate,'%d.%m.%Y') AS mydate,
						DATE_FORMAT(ddate,'%H:%i') AS mytime,
						nick,
						".FUSERS.".name,
						".PICSU.".filename,
						comment,
						".COMMENTS.".id

				FROM ".COMMENTS." 
				LEFT JOIN ".FUSERS."
				ON ".FUSERS.".id = ".COMMENTS.".authorid
		
				LEFT JOIN ".PICSU."
				ON	".FUSERS.".id = ".PICSU.".userid

				WHERE /*newsid = \"".sqller($newsid)."\"*/
						".COMMENTS.".id IN(".implode(",",$order_list).")

				ORDER BY FIELD(".COMMENTS.".id,".implode(",",$order_list).") 
				
				
				";
		//if ($to) $sql.=" LIMIT $from,$to";
		$sql_run=sqlquery($sql);
		while ($res = mysql_fetch_assoc($sql_run)){
			
			list($aday,$amonth,$ayear)=explode(".",$res['mydate']);

			$image = ($res['filename']) ? "/media/avatars/tmb/".$res['filename'] : "/im/user.gif";
			
			
			if ($tree_map[$res['id']]<3)	{

				if ($authok)	
					$replylink="<a href='' onClick='showCommentForm({$res['id']});return false;' class='commentreply'>".$depot['lxs']['replycomment']."</a>";
				else
				{
					$logtolocation=htmlspecialchars('http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
				
					$replylink="<a href='/login/?logtolocation=".base64_encode($logtolocation)."' class='commentreply needlogin cboxElement' >".$depot['lxs']['replycomment']."</a>";
				}
			} else {
				$replylink="";
			}

			$arr['commset'][]=array(
									"date"		=>	"<b>".sprintf("%d",$aday)." ".$depot['lxs']['mona_'.$amonth]." ".$ayear." <em>".$res['mytime']."</em></b>",
									"datetime"	=>	str_replace(" ","T",$res['mydate']),
									"time"	=>	$res['mytime'],
									"nick"		=>	$res['name'] ? strip_tags(getfromsql($res['name'],$par['lng'])) :  strip_tags(getfromsql($res['nick'],$par['lng'])),
									"comment"	=>	 strip_tags(getfromsql($res['comment'],$par['lng']),"<br><br/>"),
									"image"		=>	"<img src='$image'>",
									"class"		=>	"level".@$tree_map[$res['id']],
									"replylink"	=>	$replylink
								);
		}
	}
	
	$html = parse_local($arr,$pattern,1);
	return $html;
}




function get_commform(){
	global $par,$depot;
	$arr['no'] = unique_guest_no(15);
	$arr['commentid'] = $depot['current_article']['id'];
	$arr['namevalue']='';
	if (isset($_COOKIE['myname'])) {
		$arr['namevalue']=$_COOKIE['myname'];
	}

	return parse_local($arr,'_commform',1);
}



function get_pager($count,$itemid){
	global $par, $depot, $enviro, $lxs; 
	$html='';
	if (!isset($par['pg'])) $par['pg']=0;
	$perpage=(@$depot['enviro']['qty_comments_perpage']) ? $depot['enviro']['qty_comments_perpage'] : 50;

	$pages=($count[0]%$perpage) ? (int)($count[0]/$perpage+1) : $count[0]/$perpage;

	if ($pages <2) return array($html,0,0);
	$path='';
	$ppg=10;
	$pppages=($pages%$ppg) ? (int)($pages/$ppg+1) : $pages/$ppg;
	$curr_ppg=(int)($par['pg']/$ppg);

	$start_page=$curr_ppg*$ppg;
	$end_page=($curr_ppg*$ppg+$ppg>$pages) ? $pages : $curr_ppg*$ppg+$ppg;
	//$path=$par['pphtm'];
	//foreach ($_SERVER as $k=>$v) echo "$k = > $v<br>";
	
	if ($curr_ppg!=0) {
		$prev_page="<a href=\"\" class=nxt onClick = \"return chPg('comments', '".$itemid."', '".($curr_ppg*$ppg-1)."', '".$par['lng']."', 1)\">&lt;</a>"; 
		$pprev_page="<a href=\"\"  class=nxt onClick = \"return chPg('comments', '".$itemid."', '0', '".$par['lng']."', 1)\">&#8230;</a>"; 
	}	else 
	{
		$prev_page="";
		$pprev_page="";
	}
	if ($curr_ppg!= ($pppages-1) && $pppages!==0) {
		$next_page="<a href=\"\"  class=nxt onClick = \"return chPg('comments', '".$itemid."', '".(($curr_ppg+1)*$ppg)."', '".$par['lng']."', 1)\">&gt;</a>"; 
		$nnext_page="<a href=\"\"  class=nxt onClick = \"return chPg('comments', '".$itemid."', '".($pages-1)."', '".$par['lng']."', 1)\">&#8230;</a>";
	} else 
	{
		$next_page="";
		$nnext_page="";
	}
		
	if ($pages>1) {
		$html.="<div class=pager><b>".$depot['lxs']['he_page'].":</b>";
		$html.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$html.= "<a href=\"\" onClick = \"return chPg('comments', '".$itemid."', '".$i."', '".$par['lng']."', 1)\">".($i+1)."</a>";
			else $html.= "<span>".($i+1)."</span>";
		}
		$html.= $next_page.$nnext_page;
		$html.="</div>";
	} 
	$limitfrom =	$par['pg']*$perpage;
	$limitto =		$perpage;
	return array($html,$limitfrom,$limitto);
}