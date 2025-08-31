<?
$depot['mod_result']=get_poll();



function get_poll(){
	global $par,$errors,$oks,$depot,$lxs;
	//variables to play with: date, time, nick,pager,no,commentid,comment SET=commset
	$ttop='';
	if (@$par['pphtm'] !== 'poll'){
		$ttop.=poll_form();
	} else {
		$ttop.=poll_res();
	}
	return $ttop;
}



function poll_form(){
	global $par,$errors,$oks,$depot,$lxs;
	$ttop='';
	$sql="
			SELECT ".POLLRES.".*,ho.subject
			FROM ".POLLRES.", 
								(
									SELECT	".POLL.".subject, 
											".POLL.".id 
									FROM	".POLL."	
									WHERE	lang = \"".sqller($depot['langid'])."\"
									AND isvis = 1
									ORDER BY orderid DESC LIMIT 1
								) AS ho
			WHERE ".POLLRES.".poll_id = ho.id
			ORDER BY ".POLLRES.".orderid
	";

	$res=sqlquery_cached($sql,1);
	$header='';
	
	if (!count($res)) return;

	$ttop.="<h1>".$lxs['he_poll']."</h1><div class=poll>";
	$ttop.="<form name=pollform method=post action='/".$par['lng']."/poll/'>";
	$theid=0;
	foreach ($res as $r) {
		if (!$header) {
			$header = $r['subject'];
			$theid=$r['poll_id'];
			$ttop.="<h2>".$header."</h2>";
		}
		$ttop.="<a href='' onClick = 'setvalue1(\"pollform\",\"myvote\",\"".$r['id']."\"); return chUp(\"pollaction\",\"pollform\",0)'>".$r['variant']."</a>";
		
		
	}
	$ttop.="<input type=hidden name=myvote value=''><input type=hidden name=pollid value='".$theid."'></form>";
	$ttop.="</div>";

	return $ttop;
}

function poll_res(){
	global $par,$errors,$oks,$depot,$lxs;
	$ttop='';
	$arr=array();
	$content='';
	
	if (isset($par['pollid'])) {
		$content.='<h1>'.$lxs['he_poll']."</h1>";
		$content.=get_graph($par['pollid']);
	}
	
	$content.="<br><br><h1>".$lxs['he_pollold']."</h1>";
	$content.=poll_list();

	$arr['content'] = $content;
	$ttop = parse_local($arr,'_commonwide');
	return $ttop;

}



function get_graph($pollid){
	global $par,$errors,$oks,$depot,$lxs;
	$ttop='';
	$sql="
			SELECT ".POLLRES.".*,ho.subject
			FROM ".POLLRES.", 
								(
									SELECT	".POLL.".subject, 
											".POLL.".id 
									FROM	".POLL."	
									WHERE	id = \"".sqller($par['pollid'])."\"
								) AS ho
			WHERE ".POLLRES.".poll_id = ho.id
			ORDER BY ".POLLRES.".qty DESC, ".POLLRES.".orderid
	";

	$sql_run=sqlquery($sql);
	$total=0;
	$header='';
	$width=670;
	$max=0;
	$items=array();
	for($i=0;$i<conn_sql_num_rows($sql_run);$i++){
		$r=conn_fetch_assoc($sql_run);
		if (!$header) {
			$header = $r['subject'];
			$ttop.="<h2>".$header."</h2>";
		}
		$total+=$r['qty'];
		if ($r['qty']>$max) $max=$r['qty'];
		$items[]=array($r['variant'],$r['qty']);
	}
	$ttop.=$lxs['he_pollqty']." <b>$total</b><br><br><div class=pollres>";
	foreach ($items as $i){
		
		if ($max)
			$w=sprintf('%d',($i[1]/$max)*$width); else $w=0;
		if ($total)
			$percent=sprintf('%d',($i[1]/$total)*100); else $percent=0;
		$ttop.="<b>".$i[0]."</b> - <strong>".$percent."%</strong>";
		$ttop.="<div style='width:".$w."px;'></div>";
	}
	$ttop.="</div>";
	return $ttop;
}





function poll_list(){
	global $par,$errors,$oks,$depot,$lxs;
	$ttop='';


	$sql_count="SELECT COUNT(*)
			FROM ".POLL."	
			WHERE lang = \"".sqller($depot['langid'])."\"";
	$count_run=sqlquery($sql_count);
	$cnt=conn_fetch_row($count_run);

	list($from,$to,$pages) = pager_calc(20,10,$cnt[0]);

	if ($to) $limit=" LIMIT $from,$to"; else $limit='';

	$sql="
			SELECT *
			FROM ".POLL."	
			WHERE lang = \"".sqller($depot['langid'])."\"
			ORDER BY orderid DESC $limit
		
	";
	
	$sql_run=sqlquery($sql);
	$ttop.='<ul class=pollist>';
	for($i=0;$i<conn_sql_num_rows($sql_run);$i++){
		$r=conn_fetch_assoc($sql_run);
		if (@$par['pollid'] == $r['id']) $class=' class=active'; else $class='';
		$ttop.="<li".$class.">";
		if (@$par['pg']) $pg="?pg=".$par['pg']; else $pg='';
		$ttop.="<a href='/".$par['lng']."/poll/".$r['id']."/$pg'>".$r['subject']."</a>";
	}
	
	$ttop.="</ul><br><br>";
	$link='/'.$par['lng'].'/poll/';
	$ttop.=pager($link,$pages,10,array());
	return $ttop;
}
?>