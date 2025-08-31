<?
require_once("mo_news.php");
$depot['vars']['mod_result']=get_poll();



function get_poll(){
	global $par,$depot;

	$ttop='';
	if (@$par['pphtm'] !== 'poll')	$ttop.=poll_form();
	else	$ttop.=poll_res();

	return $ttop;
}



function poll_form(){
	global $par,$depot;

	$sql="
		SELECT ".POLLRES.".*,ho.subject
		FROM ".POLLRES.", 
			(
				SELECT	".POLL.".subject, 
						".POLL.".id 
				FROM	".POLL."	
				WHERE	lang = \"".sqller($depot['vars']['langid'])."\"
				AND isvis = 1
				ORDER BY orderid DESC LIMIT 1
			) AS ho
		WHERE ".POLLRES.".poll_id = ho.id
		ORDER BY ".POLLRES.".orderid
	";

	$res=sqlquery_cached($sql,10,1);
	$header='';
	
	if (!count($res)) return;
	$arr=array();
	
	foreach ($res as $r) {
		$arr['items'][]=array(
						'voteid'	=>	$r['id'],
						'votetitle'=>	$r['variant']
		);
		$title=$r['subject'];
	}
	$arr['polltitle']=$title;
	return parse_local($arr,'poll','1');
}

function poll_res(){
	global $par,$depot;
	$ttop='';
	$arr=array();
	$content='';
	
	if (@$par['gid']) {
		$content.='<header class="accenttitle calm">'.$depot['lxs']['he_poll']."</header>";
		$depot['vars']['description']=$depot['lxs']['he_poll'];
		
		$content.=get_graph($par['gid']);
	}
	
	$content.="<header class=\"accenttitle calm\">".$depot['lxs']['he_pollold']."</header>";
	$content.=poll_list();
	
	if (!isset($depot['title'])) $depot['title']=$depot['lxs']['he_pollold'];
	if (!isset($depot['description'])) $depot['description']=$depot['lxs']['he_pollold']." ".$depot['lxs']['he_zik'];

	$arr['content'] = $content;
	$arr['aside'] = parse_local($arr,"aside_poll",1);
	$ttop = parse_local($arr,'commonPattern','1');
	return $ttop;
}


function get_graph($gid){
	global $par,$depot;
	$ttop='';
	$sql="
		SELECT ".POLLRES.".*,ho.subject,ho.ddate
		FROM ".POLLRES.", 
			(
				SELECT	".POLL.".subject, 
						".POLL.".id,
						".POLL.".ddate
				FROM	".POLL."	
				WHERE	id = \"".sqller($par['gid'])."\"
			) AS ho
		WHERE ".POLLRES.".poll_id = ho.id
		ORDER BY ".POLLRES.".qty DESC, ".POLLRES.".orderid
	";

	$sql_run=sqlquery($sql);
	$total=0;
	$header='';
	$width=640;
	$max=0;
	$items=array();
	$fordate="";
	for($i=0;$i<mysql_num_rows($sql_run);$i++){
		$r=mysql_fetch_assoc($sql_run);
		if (!$header) {
			$header = $r['subject'];
			$ttop.="<h1>".$header."</h1>";
			$depot['vars']['title']=$header;
			$depot['vars']['description'].= $header;
		}
		$total+=$r['qty'];
		if ($r['qty']>$max) $max=$r['qty'];
		$items[]=array($r['variant'],$r['qty']);
		$fordate=$r["ddate"];
	}

	list($y,$m,$d)=explode("-",$fordate);
	$ttop.="<time style='float:right;color:#999'>".$d." ".$depot['lxs']['mona_'.$m]." $y</time>";

	$ttop.=$depot['lxs']['he_pollqty']." <b class='total'>$total</b><br><br><div class=pollres>";
	foreach ($items as $i){
		
		if ($max)
			$w=sprintf('%d',($i[1]/$max)*$width); else $w=0;
		if ($total)
			$percent=sprintf('%d',($i[1]/$total)*100); else $percent=0;
		$ttop.="<span>".$i[0]."</span> - <strong>".$percent."%</strong>";
		$ttop.="<div style='width:".$percent."%;'></div>";
	}
	$ttop.="</div>";
	return $ttop;
}


function poll_list(){
	global $par,$depot;
	$ttop='';


	$sql_count="SELECT COUNT(*)
			FROM ".POLL."	
			WHERE lang = \"".sqller($depot['vars']['langid'])."\"";
	$count_run=sqlquery($sql_count);
	$cnt=mysql_fetch_row($count_run);

	list($from,$to,$pages) = pager_calc(20,10,$cnt[0]);

	if ($to) $limit=" LIMIT $from,$to"; else $limit='';

	$sql="
			SELECT *
			FROM ".POLL."	
			WHERE lang = \"".sqller($depot['vars']['langid'])."\"
			ORDER BY orderid DESC $limit
		
	";
	
	$sql_run=sqlquery($sql);
	$ttop.='<ul class="polls_list">';

	for($i=0;$i<mysql_num_rows($sql_run);$i++){
	
		$r=mysql_fetch_assoc($sql_run);
		list($y,$m,$d)=explode("-",$r['ddate']);

		if (@$par['gid'] == $r['id']) $class=' class=active'; else $class='';
		$ttop.="<li".$class.">";
		if (@$par['pg']) $pg="?pg=".$par['pg']; else $pg='';
		$ttop.="<a href='".$depot['vars']['language_link']."poll/".$r['id']."/$pg'>".$r['subject']."</a>
			<time>".$d." ".$depot['lxs']['mona_'.$m]." $y</time>
		</li>";
	}
	
	$ttop.="</ul>";
	$link=$depot['vars']['language_link'].'poll/';
	$ttop.=pager($link,$pages,10,array('id'=>'yuuuu'));
	return $ttop;
}
