<?

$a_pages=array(); //all pages

$prevword='0129341029r%2sjdv0i23jq023fwe-*gkjq203gjq2039qjyt024jherkfbm,fmb;sdlfkbdfkmblaskdfo3';


/*echo $par['pphtm'];die();*/
require_once('utfstuff.php');
initDefaults();



function initDefaults(){
	global $depot,$par;

	

	initLocalization();
	defineDictionary();
	initDepends();	/*	conf.php	*/

	if (@$par['pphtm']=='catalog' && $par['ns']=='search'){
	
		if (@$par['t']=='news') {
					$par['pphtm']='news';
		}
		
	}

	if (isset($par['pphtm'])) $par['pphtm']=mb_convert_encoding(@$par['pphtm'],"utf-8","windows-1251");

	$depot['vars']['title']					=$depot['lxs']['def_title'];
	$depot['vars']['keywords']				=$depot['lxs']['def_keywords'];
	$depot['vars']['description']			=$depot['lxs']['def_description'];
	$depot['vars']['hostname']				=$_SERVER['HTTP_HOST'];

	buildSiteTree(); 
	require_once("stuff.php");

}



function initLocalization(){
	global $par,$depot,$language;

	/*$par['lng']='ua';*/

	$all_langs_sql = sqlquery_cached("SELECT * FROM ".LANG." WHERE isactive<>0 ORDER BY id",1000,5);
	$ord_lng=array();

	
	foreach ($all_langs_sql as $res){
		$depot['vars']['langs'][$res['lang']]=$res;
		$depot['vars']['langids'][$res['id']]=$res['lang'];
		$ord_lng[]=$res['lang'];
	}

	$depot['vars']['default_language']=$depot['vars']['langs'][$ord_lng[0]]['lang'];

	if (!isset($par['lng']) || !isset($depot['vars']['langs'][$par['lng']])) {
		$par['lng'] = $depot['vars']['default_language'];
	}

	list(		$language,
				$depot['encd'],
				$lexencd,
				$depot['mencd'],
				$depot['vars']['langid']
	)			=
	array(		
				$par['lng'],
				$depot['vars']['langs'][$par['lng']]['site_charset'],
				$depot['vars']['langs'][$par['lng']]['lex_charset'],
				$depot['vars']['langs'][$par['lng']]['mail_charset'],
				$depot['vars']['langs'][$par['lng']]['id']
	);
	
	/*new language identificator*/
	$depot['vars']['language']=$language;


	$depot['vars']['language_link']=
		$par['lng'] == $ord_lng[0]
		
		? "/" : "/".$par['lng']."/";

}



function buildSiteTree(){
	 global $par,$depot,$a_pages,$language;


	 /* all pages */


	/*				!!!!!!!!!!!!!!!!!!!!!! CACHED ---- CHANGE BACK
	$sql_all_pages=sqlquery_cached("SELECT * FROM ".TREE." WHERE lng=\"".$depot['vars']['langs'][$par['lng']]['id']."\"  ORDER BY level,id",100);
	$for_menu=array();
	$default_idword='';
	foreach ($sql_all_pages as $s) {
		$a_pages[$s['idword']] = $s;
		if($s['wkey'] == 'homepage') $default_idword=$s['idword'];
		$for_menu[$s['parentword']][] = $s;
	}
	*/
	/*NO CACHED REQUEST   --  REPLACE AFTER DEV */
	$sql_all_pages=sqlquery("
							SELECT * 
							FROM ".TREE." 
							WHERE lng=\"".$depot['vars']['langs'][$par['lng']]['id']."\"  
							ORDER BY level,id"
						);
	$for_menu=array();
	$default_idword='';
	while ($s = conn_fetch_assoc($sql_all_pages)) {
		$a_pages[$s['idword']] = $s;
		if($s['wkey'] == 'homepage') $default_idword=$s['idword'];
		$for_menu[$s['parentword']][] = $s;
	}

	
	$depot['vars']['parentBranch']="";

	if (!@$par['pphtm']) {
		$par['phtm']=$default_idword;
	}
	else {
		$pphtm_array=explode('/',$par['pphtm']);
		
		$depot['vars']['parentBranch'] = $pphtm_array[0];	
		$pphtm_normal=array();
		$pare=0;
		$got_item=0;
		$ind=0;
		
		foreach($pphtm_array as $v){
			//echo $v."<br>";
			$k=trim($v);
			if ($k=='') continue;
			$pphtm_normal[$ind]=$k;
			$ind++;
			if ($got_item) continue;
			if (in_array($k,$depot['vars']['reserved_vars'])) {
				$got_item=1;
				$item_ind=$ind;
				subselect4();
			}
			
			$e="SELECT * FROM ".TREE." WHERE wkey = \"$k\" AND parentword= \"$pare\" AND lng=\"".$depot['vars']['langs'][$par['lng']]['id']."\"";
			
			$query=sqlquery($e);
			$sql0=conn_fetch_assoc($query);

			$activewkey[$sql0['idword']] = $k;
			$pare = $sql0['idword'];
		}
		$prevword=$sql0['wkey'];
		$par['phtm'] = $pare;

		if ($got_item) {
			if(isset($pphtm_normal[$item_ind])) $par['itemid'] = array_pop($pphtm_normal);
		}
	}
									
	$depot['vars']['charset']=$depot['encd'];
	$depot['vars']['lang']=$language;
	getMetaForPage();
		
	/******************menu array***********************/		


	$hascontent=2;
	$layer=2;
	$menu=array();

	/*�� ������� ���� ������� ��� �������� ...
	foreach ($a_pages as $k=>$v){
		echo $k."  --->  ".$v['title']."<br><br><br>";
	}*/ 

	if (!isset($a_pages[$par['phtm']])) {
		/*echo __LINE__."***".$par['phtm'];*/
		err404();

	}

	while ($hascontent == 2){
		$sl1=$a_pages[$par['phtm']];
		$global_level=$sl1['level'];
		if (!is_array($sl1)) {
			//header('Location: /404.php');
			die();
		}
		$hascontent=$sl1['content'];
		if(!$sl1['haschild']) break; 
		else 
		{ 
			if ($hascontent == 2) {
				$sql2=$for_menu[$par['phtm']][0];
				if (!is_array($sql2)) {	
					/*echo __LINE__."***".$par['phtm'];	*/
					err404();
					die();
				}
				$par['phtm'] = $sql2['idword'];
				$global_level=$sql2['level'];
			}
		}
	}	

	$currentidword=$par['phtm'];
	$global_parent=$current_parent=$sl1['parentword'];
	$depot['active_pars']=array();
	$currentwkey=0;

	while ($layer>1){
		$sl=@$for_menu[$current_parent];
		if (!count($sl)) {
			/*echo __LINE__."***".$par['phtm'];*/
			/*echo $par['phtm'];*/
			break;
			err404();
			die();
		}
		if (count($menu)){
			foreach ($menu as $j=>$e){
				for ($d=0;$d<count($menu[$j]);$d++){
					$menu[$j][$d]['link']="/".$currentwkey.$menu[$j][$d]['link'];
					$menu_quick[$menu[$j][$d]['idword']]=$menu[$j][$d]['link'];
				}
			}
		}
		
		for ($i=0;$i<count($sl);$i++){
			$res=$sl[$i];
			$res['link']="/".$res['wkey']."/";
			if ($res['visible']) {
				$menu[$res['level']][]=$res;
				$menu_quick[$currentidword]=$res['link'];
				//$menu[$res['level']]['idword']."-".$res['level']."<br>";
			}
			if ($res['idword'] == $currentidword){
					if (($res['haschild'] || in_array($res['wkey'],$depot['vars']['reserved_vars']))&& $currentidword==$par['phtm']) {
						if (!in_array($res['wkey'],$depot['vars']['reserved_vars'])) {
						$global_level++;
						$global_parent = $currentidword;
							$cl1=$res;
							$sl=@$for_menu[$currentidword];
							for ($j=0;$j<count($sls);$j++){
								$ress=$sls[$j];
								$ress['link']="/".$prevword."/".$ress['wkey']."/";
								//if ($ress['visible']) {
									$menu[$ress['level']][]=$ress;
									$menu_quick[$currentidword]=$ress['link'];
								//}
								$depot['active_pars'][$ress['level']]=$currentidword;
							}
						} else {
							$cl1=$res;
							$global_level++;
							$global_parent = $currentidword;
							$menu[$res['level']][]=$res;
							$menu_quick[$currentidword]=$res['link'];
						}
					}
					$depot['active_pars'][$res['level']]=$currentidword;
					$layer=$res['level'];
					$sl2=@$a_pages[$current_parent];
					$currentidword=$current_parent;
					$current_parent=$sl2['parentword'];
					$currentwkey=$sl2['wkey'];
			}
		}
	}
	$depot['menu'] = $menu;
}




function getMetaForPage(){
	global $par,$depot;
	$pageset=sqlquery_cached("SELECT * FROM ".METAS." WHERE page=\"".$par['phtm']."\"",120,4);

	if (!count($pageset))  return;


	if (@$pageset[0]['title_'.$par['lng']])		$depot['vars']['title']	=		@$pageset[0]['title_'.$par['lng']];
	if (@$pageset[0]['descr_'.$par['lng']])		$depot['vars']['description']=	@$pageset[0]['descr_'.$par['lng']];
	if (@$pageset[0]['keywords_'.$par['lng']])	$depot['vars']['keywords']=		@$pageset[0]['keywords_'.$par['lng']];

}




function defineDictionary(){
	global $depot, $par;
	$lexfile=file($_SERVER["DOCUMENT_ROOT"]."/var/tls/lex.front_".$depot['vars']['langs'][$par['lng']]['lang']);
	foreach ($lexfile as $line){
		
		if (substr($line,1)=="*") continue;

		if (trim($line)){
			$tmp=explode("{:}",$line);
			$depot['lxs'][trim($tmp["0"])]=trim(@$tmp[1]);
			//$tx[trim($tmp["0"])]=trim($tmp[1]);
		}
	}
}



function ceho($string){
	global $default_encoding;
	/* �������� ���� global $con;
	return $con->Convert ($string, "windows-1251", "utf-8", false);*/
	return mb_convert_encoding($string, "UTF-8", "windows-1251");
}

function iho($string){
	/* �� ��� global $con;
	return $con->Convert ($string, "windows-1251", "utf-8", false);*/
	return mb_convert_encoding($string, "UTF-8", "UTF-8");
}

function secho($string){
	global $encd,$lexencd;
	if (strtoupper($encd) == strtoupper($lexencd)) return $string;
	return mb_convert_encoding($string, $encd, $lexencd);
}

function meho($string){
	global $depot;

	if (strtoupper($depot['encd']) == strtoupper($depot['mencd'])) return $string;
	return mb_convert_encoding($string, $depot['mencd'], $depot['encd']);
}


function parse_page(){
	global $par,$depot;
	
	$pageset_sql=conn_fetch_row(sqlquery("SELECT pattpars FROM ".TREE." WHERE idword = '".$par['phtm']."'"));
	$depot['pattset']=unserialize(stripslashes($pageset_sql[0]));
	/*foreach ($depot['pattset'] as $k=>$v) echo $k."=".$v."<br>";*/
	if (preg_match("/mo_(\w+)/",$depot['pattset']['main'])) {
		require_once(dirname(__FILE__)."/../custom/".$depot['pattset']['main'].".php");
		$outy = $depot['vars']['mod_result'];
		return $outy;

	}

	//$tt=getmcrotime();

	/*replace free content pages*/
	if (!is_array($depot['pattset'])) die("Link is broken");
	foreach ($depot['pattset'] as $k=>$v){
		if ($v=='htm'){
			$n=get_freecontent($k.$par['phtm']);
			$depot['pattset'][$k]="ZMLFREE:".$n;
		}
	}
	$ttop = get_tpl($depot['pattset']['main'],$depot['pattset']);
	preg_match_all($depot['vars']['default_pattern'], $ttop, $matches, PREG_SET_ORDER);	
	if(count($matches)) { 
		for ($i = 0; $i < count($matches); $i++) {
			switch($matches[$i][1]) {
				case ('var'):
					$depot['vars']['var_result']=@$depot['vars'][$matches[$i][2]];
					$ttop = str_replace($matches[$i][0],@$depot['vars']['var_result'],$ttop);
					break;
			}
		}

	}

	//$tt2=getmcrotime();
	//$depot['testotal']=(isset($depot['testotal'])) ? ($depot['testotal']+$tt2-$tt) : ($tt2-$tt);
	//echo "<h1>".sprintf('%.6f',($tt2-$tt))." --- ".@$template." = ".sprintf('%.6f',$depot['testotal'])."</h1>";

	return $ttop;
}



function get_tpl($template,$pattset=0,$fromfile=0){
	global $depot, $par;
	
	if (!isset($depot['testotal1'])) $depot['testotal1']=getmcrotime();

	if (preg_match('/^ZMLFREE:(.*)/s',$template,$mat)){
		$outy = $mat[1];

	} else {	
			/*
			if ($pattset !== 'quit') {
				$outy1=conn_fetch_row(sqlquery("SELECT patternbody FROM ".PATT." WHERE pattid = \"".$template."\""));
				$outy=$outy1[0];
				$parents[$template]=1;
			} else if ($pattset == 'quit') {
				$outy = $template;
			} */

			


			if ($pattset !== 'quit' && !$fromfile) {
				$outy1=conn_fetch_row(sqlquery("SELECT patternbody FROM ".PATT." WHERE pattid = \"".$template."\""));
				$outy=$outy1[0];
				$parents[$template]=1;
			} else if ($pattset == 'quit') {
				$outy = $template;
			} 

			if ($fromfile){
				$filename=$_SERVER['DOCUMENT_ROOT']."/lib/tpl/$template.tpl";
				$fh=fopen($filename,'r');
				$outy = fread($fh, filesize($filename));
				fclose($fh);
			}

			
	}
	
	preg_match_all($depot['vars']['default_pattern'], $outy, $matches, PREG_SET_ORDER);	
	if(count($matches)) { 
		for ($i = 0; $i < count($matches); $i++) {
			//echo $matches[$i][1]."<br>";
			switch($matches[$i][1]) {
				case ('man'):
					if (!preg_match("/mo_(\w+)/",$pattset[$matches[$i][2]])) {
						$outy = str_replace($matches[$i][0],get_tpl($pattset[$matches[$i][2]],$pattset),$outy);
						//echo "--".$pattset[$matches[$i][2]]."<br>";
						qtime(__LINE__,$template,$matches[$i][0]);
					}
					else {
						include_once("lib/custom/".$pattset[$matches[$i][2]].".php");
						$outy = str_replace($matches[$i][0],$depot['vars']['mod_result'],$outy);
						//echo "++".$pattset[$matches[$i][2]]."<br>";
						qtime(__LINE__,$template,$matches[$i][0]);
					}
					break;
				case ('tpl'):
					
					/*if ($pattset[$matches[$i][2]] !== 'htm')*/
					$constructor=explode(',',$matches[$i][2]);
					if (@$constructor[1]) $fromfile=1; else 	$fromfile=0;

					$outy = str_replace($matches[$i][0],get_tpl($constructor[0],$pattset,$fromfile),$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					/*else {
						$free_content=get_freecontent($matches[$i][2].$par['phtm']);
						$outy = str_replace($matches[$i][0],$free_content,$outy);
					}*/
					break;
				case ('mod'):
					/*$depot['mod_result']='';*/
					include_once("lib/custom/".$matches[$i][2].".php");
					$outy = str_replace($matches[$i][0],$depot['vars']['mod_result'],$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;
				case ('fnc'):
					$constructor=explode(',',$matches[$i][2]);
					$func_name=	array_shift($constructor);
					$functParameter= (@implode(',',$constructor)) ? implode(',',$constructor) : '';
					
					if (count($constructor)){
						$depot['fnc_result']=call_user_func($func_name,$constructor);
					}
					else 
						$depot['fnc_result']=call_user_func($func_name); 
					$outy = str_replace($matches[$i][0],$depot['fnc_result'],$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;

				case ('ivideo'):
					$outy = str_replace($matches[$i][0],getVideoIcon($matches[$i][2]),$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;

				case ('env'):
					$outy = str_replace($matches[$i][0],@$depot['enviro'][$matches[$i][2]],$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;
				case ('ban'):

					include_once("lib/custom/banners.php");
					$outy = str_replace($matches[$i][0],getbanner($matches[$i][2]),$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;
				case ('par'):
					if (isset($par[$matches[$i][2]])) $po=  htmlspecialchars($par[$matches[$i][2]]);
					else $po = '';
					$outy = str_replace($matches[$i][0],$po,$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;
				case ('dvar'):	/*DEFINED VARIABLE in $depot array*/
					$outy = str_replace($matches[$i][0],@$depot['vars'][$matches[$i][2]],$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;
				
				case ('svar'):	/*DEFINED VARIABLE in $depot array*/
					$outy = str_replace($matches[$i][0],$_SERVER[$matches[$i][2]],$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;
				
				
				case ('lmod'):
					include_once("lib/custom/".$matches[$i][2].".php");
					$outy = str_replace($matches[$i][0],'',$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;

				case ('lxs'):

					if (preg_match($depot['vars']['default_pattern'], @$depot['lxs'][$matches[$i][2]])) {
						$outy = str_replace($matches[$i][0],get_tpl(@$depot['lxs'][$matches[$i][2]],'quit'),$outy);
					} else 
						
					$outy = str_replace($matches[$i][0],@$depot['lxs'][$matches[$i][2]],$outy);
					qtime(__LINE__,$template,$matches[$i][0]);
					break;
			}
			
		}
	} 
	if (isset($par['sh0wbl0cks'])) $s="<p class='debugblock'>$template</p>"; else  $s='';

	



	return $s.$outy;
}

function parse_local($arr_pars,$template,$fromfile=0){
	global $depot;

	
	$outy=get_tpl($template,0,$fromfile);
	$pattern_array=	'/\{\[\<ZML:(.+):(\w+)\>\]\}/sU';

	while (preg_match($pattern_array,$outy,$m)){
		$outy=str_replace ($m[0],replace_array($arr_pars,$m[1],$m[2]),$outy);
	}
	$outy = parse_simple($arr_pars,$outy);
	return $outy;
}


function parse_simple($arr_pars,$template_parsed){
	$pattern= '/\{\<ZML:(\w+)\>\}/s';
	
	while (preg_match_all($pattern, $template_parsed, $matches, PREG_SET_ORDER)){
		$rfrom=array();
		$rto=array();
		if(count($matches)) { 
			for ($i = 0; $i < count($matches); $i++) {
				if (!isset($arr_pars[$matches[$i][1]])) $arr_pars[$matches[$i][1]]=""/*"<b style='color:#F00'>MISSED: ".$matches[$i][1]."</b>"*/;

				$rfrom=$matches[$i][0];
				$rto=$arr_pars[$matches[$i][1]];
			}
		}

		$template_parsed=str_replace ($rfrom,$rto,$template_parsed);
	}	

	return $template_parsed;
}


function parse_simple_old($arr_pars,$template_parsed){
	$pattern= '/\{\<ZML:(\w+)\>\}/seU';
	while(preg_match($pattern,$template_parsed))
	$template_parsed=preg_replace ($pattern,'@$arr_pars["\\1"]',$template_parsed);
	return $template_parsed;
}

function replace_array($arr_pars,$position,$v){
	$ttop='';
	if (is_array(@$arr_pars[$v])){
		foreach ($arr_pars[$v] as $e){
			$ttop.=parse_simple($e,$position);
		}
	}
	return $ttop;
}


function get_freecontent($id){
	$rd=conn_fetch_row(sqlquery("SELECT * FROM ".FREE." WHERE fid=\"$id\""));
	return get_tpl($rd[1],'quit');
}


function get_large_image($id,$lannng){
	global $par,$language;
	$img=conn_fetch_assoc(sqlquery("SELECT * FROM ".PICS." WHERE id=$id"));
	if (!is_array($img)) return array('','');
	else return array("<img id=\"bigim\" name=\"bigim\" src=\"/gallery/full/".$img['filename']."\" alt=\"".htmlspecialchars($img['title_'.$lannng])."\" title=\"".htmlspecialchars($img['title_'.$lannng])."\">",htmlspecialchars($img['title_'.$lannng]));
}



/*--------------------------- ERRORS--------------------------------*/
function errors(){
	global $depot;
	$ttop='';

	if (isset($depot['errors']) && is_array($depot['errors']) && count(@$depot['errors'])){
		
		$ttop.="<div id='errors'>";
		$ttop.="<ul style=\"clear:both;\">";
		while (count($depot['errors'])){
			$ttop.="<li>".array_shift($depot['errors']);
		}

		$ttop.="</ul></div><div class='clean pt20'></div>";
	}	

	return $ttop;
}

function oks(){
	global $depot;
	$ttop='';
	if (count(@$depot['oks'])){
		$ttop.="<div id='oks'>";
		$ttop.="<ul style=\"clear:both;\">";
		
		while (count($depot['oks'])){
			$ttop.="<li>".array_shift($depot['oks']);
		}
		$ttop.="</ul></div><div class='clean pt20'></div>";
	}	
	return $ttop;

}

function errors1(){
	global $depot;
	if (count(@$depot['errors'])){
			return "<div class=errholder>".errors()."</div>";
	}
}


function oks1(){
	global $depot;
	if (count(@$depot['oks'])){
			return "<div class=okholder>".oks()."</div>";
	}
}
/*+++++++++++++++++++++++++++   CHECKERS     +++++++++++++++++*/	
function chk_occupied($name,$tbname,$fieldname,$message){
	global $par,$depot;
	$res1=sqlquery("SELECT COUNT(*) FROM $tbname WHERE $fieldname=\"".trim(@$par[$name])."\"") or die(conn_error());

	$res=conn_fetch_row($res1);
	//echo $res;
	if ($res[0]) {
		$depot['errors'][]=$message;
		$depot['gerrors'][]=$name;
	}
}


function chk_occupied1($name,$capt,$tbname,$fieldname,$iid){
	global $par,$depot;
	$res1=sqlquery("SELECT COUNT(*) FROM $tbname WHERE $fieldname=\"".@$par[$name]."\" AND id <> $iid") or die(conn_error());
	$res=conn_fetch_row($res1);
	if ($res[0]) {
		$depot['errors'][]="the information in field \"$capt\" duplicates one in our database. Please chose another $capt.";
		$depot['gerrors'][]=$name;
	}
}



function chk_req($name,$capt){
	
	global $par,$depot;
	if (!isset($par[$name])||!@$par[$name]||@$par[$name]==""){
		$depot['errors'][]=$capt; 
		$depot['gerrors'][]=$name;
	}
}



function chk_length($name,$capt,$min,$max){
	global $par,$depot;
	$length=strlen(@$par[$name]);
	if (($length)>$max) {
		$depot['errors'][]="the length of field \"$capt\" should not exceed $max symbols";
		$depot['gerrors'][]=$name;
	}
	if ($min && $length){
		if (($length)<$min) {
			$depot['errors'][]="the length of field \"$capt\" should be at least $min symbols";
			$depot['gerrors'][]=$name;
		}
	}
}



function chk_valid($name,$capt){
	global $par,$depot;
	if (!preg_match('/^[(\w\s)-]*$/',@$par[$name])){
		$depot['errors'][]="field \"$capt\" contains disallowed symbols"; 
		$depot['gerrors'][]=$name;
	}
}

function chk_valid_strict($name,$capt){
		global $depot,$par;
		if (!preg_match('/^[a-zA-Z0-9_-]+$/',@$par[$name])){
			$depot['errors'][]="field \"$capt\" contains disallowed symbols"; 
			$depot['gerrors'][]=$name;
		}
	}

function chk_int($name,$capt){
	global $par,$depot;
	if (!preg_match('/^[(\d)]+$/',@$par[$name])){

		$depot['errors'][]="value \"$capt\" should be an INTEGER value"; 
		$depot['gerrors'][]=$name;
	}
}

function chk_valid_plus($name,$capt){
	global $par,$depot;
	if (!preg_match('/^[(\w)]*$/',@$par[$name])){
		$depot['errors'][]="\"$capt\" contains disallowed characters. You can use letters and/or numbers. Instead of space \" \" you can use \"_\" "; 
		$depot['gerrors'][]=$name;
	}
}

function check_ver($numb,$entered,$length){

	$start_pos=substr($numb,3,1);
	$code=md5($numb."THATSALLABOUTMYSECRET");
	$code=strtoupper(substr($code,$start_pos*2,$length));
	$code=str_replace(explode(" ","A B C D E F"),explode(" ","9 1 8 2 7 3"),$code);
	if (strtoupper($entered) == $code) return true; else return false;

}


function check_email_valid($email){
	if (preg_match("~^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$~", $email)) return true; else return false;
}


function generate_unique($length){
	$str='';
	$numbers = range(0,9);
	$cletters=range("A","Z");
	$sletters=range("a","z");
	$numbers=array_merge($numbers,$cletters,$sletters);
	shuffle($numbers);
	//mt_srand ((float)microtime());
	$s=count($numbers)-1;
	for($i=0;$i<$length;$i++){
		$str.=$numbers[rand(0,$s)];
	}
	return $str;
}



function unique_guest_no($length){
	$str='';
	$numbers = range(1,9);
	mt_srand ((float)microtime());
	$s=count($numbers)-1;
	for($i=0;$i<$length;$i++){
		$str.=$numbers[rand(0,$s)];
	}
	return $str;
}


function ddate($ddate){
	return date("d-M-Y H:i",$ddate);
}



function getvalue($param,$search_by,$fields,$db){
	//returns ARRAY of ARRAYs
	$rlt=array();
	$sql=sqlquery("SELECT * FROM $db WHERE $search_by=\"$param\"");
	if (is_array($fields)){
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$io=array();
			$row=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			foreach ($fields as $k) $io[$k]=$row[$k];
			$rlt[]=$io;
		}
	}
	else if ($fields==0){
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$rlt[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		}
	} 
	return $rlt;

}



function teaser(){
	global $par,$errors,$oks, $teass;
	$tearr=conn_fetch_array($teass, PDO::FETCH_ASSOC);
	$ttop='';
	$ttop.="<div class='teaser'><IMG SRC=\"/teas/".$tearr['im']."\" width=158><div><strong>".$tearr['headline']."</strong><br>".str_replace("\n","<br>",$tearr['text'])."</div><div>&raquo; <a href=\"".$tearr['link']."\">".$tearr['linktext']."</a></div></div>";
	
	return $ttop;
}


function getImagePath($filename){
	$mtch=array('1','2');
	preg_match("/^(.+)(\.)(\w+)$/",$filename,$mtch);
	if (!isset($mtch[1])) return '';
	$substr=substr($mtch[1],0,2);
	$letetrs_string= chunk_split($substr,1,'{OOO}');
	$string=  array_slice(explode('{OOO}',$letetrs_string), 0, 2);
	for ($i=0;$i<2;$i++){
	   if(isset($string[$i])){
		   
			preg_match("/([A-Za-z0-9]{1})/",$string[$i],$matches);
			if (!isset($matches[0])) $string[$i]='other'; 
	   } else {
			$string[$i]='other';
	   }
	}
	return implode("/",$string)."/";
}



function getfromdb1($var,$lang){
	global $par,$language,$encd;
	$indbenc=conn_fetch_assoc(sqlquery("SELECT * FROM ".LANG." WHERE lang=\"$lang\""));
	
	if (strtoupper($indbenc['site_charset']) !== strtoupper($encd)){
		return mb_convert_encoding($var, $encd, $indbenc['site_charset']);
	}
	else {
		return $var;
	}
}



function getfromsql($var,$lang){
	global $par,$language,$encd;
	return stripslashes($var);
}


/*	BEGIN TREE ORDERING	*/
function subselect1(){
	global $depot, $par;
	$depot['a']=array();
	$depot['b']=array();
	$depot['previndex']=array(0);
	$sql=sqlquery("SELECT * FROM ".TREE." WHERE lng=\"".$par['lang']."\" ORDER BY level,id");
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$s=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		$depot['a'][$s['parentword']][]=$s;
	}
	reverse1(0);

}

function reverse1($pa){
	global $depot;
	if (!isset($depot['a'][$pa])) return;
	if (count($depot['a'][$pa])){
		$b_temp=array_shift($depot['a'][$pa]);
		$depot['b'][]=$b_temp;
	}
	if (@count($depot['a'][$b_temp['idword']])){
		$nextparent=$b_temp['idword'];
		array_push($depot['previndex'],$b_temp['parentword']);
	} else if (count($depot['a'][$pa])){
		$nextparent=$pa;

	} else if (@count($depot['a'][$depot['previndex'][(count($depot['previndex'])-1)]])){
		$nextparent=array_pop($depot['previndex']);

	} else if(count($depot['previndex'])/*&& @$b_temp['parentword']*/){ 
		$nextparent=array_pop($depot['previndex']);

	}	else return;
	reverse1($nextparent);
}
/* END TREE ORDERING */


/*	BEGIN PICTURE TYPES ORDERING*/
function subselect2($parent=0){
	global $depot;
	$depot['a2']=array();
	$depot['b2']=array();
	$depot['previndex']=array(0);

	$parentCoondition = $parent ? " WHERE parentword = \"$parent\" " : "";

	$sql=sqlquery("SELECT * FROM ".PICTYPE." $parentCoondition ORDER BY level,orderid");
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$s=conn_fetch_assoc($sql);
		$depot['a2'][$s['parentword']][]=$s;
		$depot['c2'][$s['id']] = $s['level'];
	}
	reverse2($parent);
}


function reverse2($pa){
	global $depot;
	if (!isset($depot['a2'][$pa])) return;
	if (count($depot['a2'][$pa])){
		$b_temp=array_shift($depot['a2'][$pa]);
		$depot['b2'][]=$b_temp;
	}
	if (@count($depot['a2'][$b_temp['id']])){
		$nextparent=$b_temp['id'];
		array_push($depot['previndex'],$b_temp['parentword']);
		//echo "Fist"."<br>";
	} else if (count($depot['a2'][$pa])){
		$nextparent=$pa;
		//echo "Second"."<br>";
	} else if (@count($depot['a2'][$depot['previndex'][(count($depot['previndex'])-1)]])){
		$nextparent=array_pop($depot['previndex']);
		//echo "Third"."<br>";
	} else if(count($depot['previndex'])){ 
		$nextparent=array_pop($depot['previndex']);
		//echo "Forth"."<br>";
	} else return;
	reverse2($nextparent);
}
/*	END PICTURE TYPES ORDERING*/



/*	BEGIN UNIVERSAL GROUP ORDERING BASED ON ID*/
function order_uni($order,$variable='b_uni'){
	global $depot,$par;

	$depot[$variable.'names']=array();
	$depot[$variable.'parents']=array();
	$depot[$variable.'spy']=array();
	$depot[$variable.'previndex']=array(0);
	$depot[$variable.'haschildren']=array(0);
	$depot[$variable]=array();

	if (!isset($depot[$variable.'a_uni'])) {
		$depot[$variable.'a_uni']=array();		
		$depot[$variable.'uni_pairs']=array();

		$query="SELECT * FROM ".$order['db']." WHERE 1 ".$order['cond']." ORDER BY ".$order['orderby'];

		if (isset($order['cacheid'])) {
			$sql=sqlquery_cached($query,300,$order['cacheid']);
		} else {
			$sql=sqlquery_cached($query,0,0);
		}
		
		foreach ($sql as $s){
			$depot[$variable.'a_uni'][$s['parentword']][]=$s;
			$depot[$variable.'names'][$s['kwd']]=@$s['name_'.$depot['vars']['language']];
			$depot[$variable.'uni_pairs'][$s['id']] = $s; /*array($s['kwd'],$s['level'],$s['parentword'],$s['name_'.$par['lng']],$s['tablename'],$s['available_fields']);*/			$depot[$variable.'haschildren'][$s['id']]=0;
		}
	}


	if (!isset($order['limitlevel'])) $order['limitlevel']=0;
	if (!isset($order['node'])) $order['node']=0;
	/*print_r($depot[$variable.'a_uni']); */
	order_get_tree($order['node'],$order['limitlevel'],$variable);
	/*print_r($depot[$variable]);	 */
}


function order_get_tree($startnode,$limitlevel,$variable){
	global $depot;
	if (!isset($depot[$variable.'a_uni'][$startnode])) return;


	if ($limitlevel){
		/*		��� ������� ������ ����� */
		/*echo $limitlevel."---".@$depot[$variable.'a_uni'][$startnode][0]['level'] ."/".$startnode."<br>";*/
		if ($limitlevel >= @$depot[$variable.'a_uni'][$startnode][0]['level'] ) {
			return;
		}
	}

	if (count($depot[$variable.'a_uni'][$startnode])){	/*	���� � �������� � ²���²���� ������ � ����Ҳ ����ʲ������	*/
		$b_temp=array_shift($depot[$variable.'a_uni'][$startnode]);
		
		if (!in_array($startnode,$depot[$variable.'spy'])) $depot[$variable.'spy'][]=$startnode;
		/*$b_temp['parents']=implode(',',$depot[$variable.'spy']); */
		$b_temp['parents']=$depot[$variable.'spy'];
		$depot[$variable][]=$b_temp;
		$depot[$variable.'parents'][$b_temp['id']]=$depot[$variable.'spy'];
	}

	if (@count($depot[$variable.'a_uni'][$b_temp['id']])){
		$nextparent=$b_temp['id'];
		array_push($depot[$variable.'previndex'],$b_temp['parentword']);
		$depot[$variable.'haschildren'][$b_temp['id']]=1;
		//echo "Fist"."<br>";
	} else if (count($depot[$variable.'a_uni'][$startnode])){
		$nextparent=$startnode;
		//echo "Second"."<br>";
	} else if (@count($depot[$variable.'a_uni'][$depot[$variable.'previndex'][(count($previndex)-1)]])){
		$nextparent=array_pop($depot[$variable.'previndex']);
		array_pop($depot[$variable.'spy']);
		//echo "Third"."<br>";
	} else if(count($depot[$variable.'previndex'])){ 
		$nextparent=array_pop($depot[$variable.'previndex']);
		array_pop($depot[$variable.'spy']);
		//echo "Forth"."<br>";
	} else return;
	order_get_tree($nextparent,$limitlevel,$variable);
}
/*	END UNIVERSAL GROUP ORDERING*/



function get_selected_images($selimgs_list,$language){
		$selimgs=array();
		$selimgs0=array();
		if ($selimgs_list) {

			if(strstr($selimgs_list,","))
				$allimages=sqlquery("SELECT * FROM ".PICS." WHERE id IN (".$selimgs_list.")");
			else
				$allimages=sqlquery("SELECT * FROM ".PICS." WHERE id=".$selimgs_list."");

			for ($d=0;$d<conn_sql_num_rows($allimages);$d++){
				$selimgs_res=conn_fetch_assoc($allimages);
//				$fn=preg_replace('/(\.(\w+))$/eU','strtolower("\\1")',$selimgs_res['filename']);
                $fn=preg_replace_callback('/(\.(\w+))$/U',
                    function ($matches) {
                        foreach ($matches as $match) {
                            return strtolower($match);
                        }
                    },
                    $selimgs_res['filename']);
				$selimgs_res['filename']=getImagePath($fn).rawurlencode($fn);
				//echo strtolower($selimgs_res['filename'])."<br>";
				$selimgs0[$selimgs_res["id"]]=$selimgs_res;
			}
			foreach(explode(',',$selimgs_list) as $inde) {
				if (isset($selimgs0[trim($inde)])) $selimgs[]=$selimgs0[trim($inde)];
			}
		}	
		return $selimgs;
}



function unescape($strIn, $iconv_to = 'UTF-8') {
  $strOut = '';
  $iPos = 0;
  $len = strlen ($strIn);
  while ($iPos < $len) {
    $charAt = substr ($strIn, $iPos, 1);
    if ($charAt == '%') {
      $iPos++;
      $charAt = substr ($strIn, $iPos, 1);
      if ($charAt == 'u') {
        // Unicode character
        $iPos++;
        $unicodeHexVal = substr ($strIn, $iPos, 4);
        $unicode = hexdec ($unicodeHexVal);
        $strOut .= code2utf($unicode);
        $iPos += 4;
      }
      else {
        // Escaped ascii character
        $hexVal = substr ($strIn, $iPos, 2);
        if (hexdec($hexVal) > 127) {
          // Convert to Unicode 
          $strOut .= code2utf(hexdec ($hexVal));
        }
        else {
          $strOut .= chr (hexdec ($hexVal));
        }
        $iPos += 2;
      }
    }
    else {
      $strOut .= $charAt;
      $iPos++;
    }
  }
  if ($iconv_to != "UTF-8") {
    $strOut = iconv("UTF-8", $iconv_to, $strOut);
  }   
  return $strOut;
}


function puttojs($string){
	return str_replace(array("\r","\n"),array('\r','\n'),addslashes($string));
	
}


function errors_c(){
	global $depot,$lxs;
	$ttop='';
	if (count($depot['errors'])){
		
		$ttop.="<ul>".$depot['lxs']['err_errors'];
			
		while (count($depot['errors'])){
			$ttop.="<li>".array_shift($depot['errors'])."</li>";
		}
		$ttop.="</ul>";
	}	
	return $ttop;
}

function oks_c(){
	global $depot;
	$ttop='';
	if (count(@$depot['oks'])){
		
		$ttop.="<ul>";
			
		while (count($depot['oks'])){
			$ttop.="<li>".array_shift($depot['oks'])."</li>";
		}
		$ttop.="</ul>";
	}	
	return $ttop;
}


function errors_popup(){
	global $depot,$lxs;
	$ttop='';
	if (count(@$depot['vars']['errors'])){
		
		$ttop.="<ul>".$lxs['err_errors'];
			
		while (count($depot['vars']['errors'])){
			$ttop.="<li>".array_shift($depot['vars']['errors'])."</li>";
		}
		$ttop.="</ul>";
		return "<script>errmessage= '".$ttop."';</script>";
	}	
	
}


function oks_popup(){
	global $depot,$lxs;
	$ttop='';
	if (count(@$depot['vars']['oks'])){
		
		$ttop.="<ul>";
			
		while (count($depot['vars']['oks'])){
			$ttop.="<li>".array_shift($depot['vars']['oks'])."</li>";
		}
		$ttop.="</ul>";
		return "<script>okmessage= '".$ttop."';</script>";
	}	
	
}


function limit_text($text, $limitstr) {
  if (mb_strlen($text,'UTF-8') > $limitstr) {


	  $words = explode(' ',strip_tags($text));
	  $t='';
	  $i=0;
	  foreach ($words as $word){
		$t.=trim($word);

		if (mb_strlen($t,'UTF-8') > $limitstr) break;
		$i++;
	  }
	  $words=array_splice($words,0,$i);
	  return implode(" ",$words)."...";
  }

  return $text;
}

function trim_text($text, $limitstr) {
  if (strlen($text) > $limitstr) {
	  return (substr($text,0, $limitstr)."...");
  }

  return $text;
}


function pager_calc($perpage,$ppg,$count){
	global $par, $depot, $lxs; 
	if (!isset($par['pg'])) $par['pg']=0;
	$pages=($count%$perpage) ? (int)($count/$perpage+1) : $count/$perpage;
	if ($pages <2) return array(0,0,0,0,0,0);
	$limitfrom =	$par['pg']*$perpage;
	$limitto =		$perpage;
	return array($limitfrom,$limitto,$pages);
}


function pager($path,$pages,$ppg,$arr_parr){
	global $par, $depot; 
	
	if($pages>100) $pages=100;

	$ttop='';
	/*if ($pages<2) return;*/
	if (!isset($par['pg'])) $par['pg']=0;
	$pppages=($pages%$ppg) ? (int)($pages/$ppg+1) : $pages/$ppg;

	$curr_ppg=(int)($par['pg']/$ppg);
	$start_page=$curr_ppg*$ppg;
	$end_page=($curr_ppg*$ppg+$ppg>$pages) ? $pages : $curr_ppg*$ppg+$ppg;

	if ($par['pg'] >= $ppg/2) {
		$start_page_new = $par['pg'] - (int)($ppg/2);
		
		if ($start_page_new + $ppg < $pages) {
			$start_page = $start_page_new;
			$end_page = $start_page + $ppg; 
		}
	}

	//$path=$par['pphtm'];
	//foreach ($_SERVER as $k=>$v) echo "$k = > $v<br>";
	if (strrchr($path,'?')) $path.='&'; else $path.='?';

	if ($curr_ppg!=0) {
		$prev_page="<a href=\"".$path."pg=".($curr_ppg*$ppg-1)."\" class=nxt>&larr;</a>"; 
		$pprev_page="<a href=\"".$path."pg=0\"  class=nxt>&#8230;</a>"; 
	}	else 
	{
		$prev_page="";
		$pprev_page="";
	}
	if ($curr_ppg!= ($pppages-1) && $pppages!==0) {
		$next_page="<a href=\"".$path."pg=".(($curr_ppg+1)*$ppg)."\"  class=nxt>&rarr;</a>"; 
		$nnext_page="<a href=\"".$path."pg=".($pages-1)."\" class=nxt>&#8230;</a>";
	} else 
	{
		$next_page="";
		$nnext_page="";
	}
	if ($pages>1) { /*UNCOMMENT FOR PAGE CHECKING!!!! */
		$ttop.="<div class=\"pager\">";
		$ttop.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$ttop.= "<a href=\"".$path."pg=".$i."\">".($i+1)."</a>";
			else $ttop.= "<span>".($i+1)."</span>";
		}
		$ttop.= $next_page.$nnext_page;
		$ttop.="</div>";
	} /**/
	return $ttop;
}



/*
*
*		SERVICE PAGES
*/

function err404(){
	header("HTTP/1.x 404 Not Found");
	//header('Location: /404.php');
	require_once('404.php');
	die();
}


function r301($location){
		header("HTTP/1.x 301 Moved Permanently\n");
		header("Status: 301 Moved Permanently\n");
		header("Location: ".$location."\n");
}

function checksumApprovedBus($uname){
	global $depot;
	return substr(md5($depot['enviro']['login-key'].$uname),0,10);
}

function checksumApproved($uname){
	global $depot;
	return substr(md5($uname.$depot['enviro']['login-key']),0,10);
}

function loadbanners(){
	global $depot;
	$line='';
	if (@$depot['vars']['bannerloaders']) {
		foreach ($depot['vars']['bannerloaders'] as $v) $line.=$v;
		return $line;
	}
	return;
}



function jsloader($str,$objectid){
	global $vars;
	$jscontent='/*JSloader*/
				setvalue("'.$objectid.'","'.puttojs($str).'")';
	$md5= md5($jscontent);
	$filename=$_SERVER['DOCUMENT_ROOT']."/var/jscache/".$md5.'.js';


	if (file_exists($filename)) {
		if (filemtime($filename)<($vars['ctime']-10*60)){
			
			
			$fh=fopen($filename,'w');
			fwrite($fh, $jscontent);
			fclose($fh);
		}
		
	} else {
		$fh=fopen($filename,'w');
		fwrite($fh, $jscontent);
		fclose($fh);	
	}

	return $script="<script type='text/javascript' src='/var/jscache/$md5.js'></script>\n";

	/*return addslashes('<script type="text/javascript">setvalue("'.$objectid.'","'.puttojs($str).'")</script>');*/
}




/*	*	*	*	*	*	MAIL	*	*	*	*	*	*/
function mailextract($mailvar,$lang){
	
	/*returns array mailbody,subj*/
	$sql=conn_sql_query("SELECT subj_$lang,mailbody_$lang FROM ".MAILS." WHERE id=\"$mailvar\"");
	$res=conn_fetch_row($sql);

	/*replacing environment variables*/
	$res[0]=@preg_replace('/(\[\[([^\]]+)\]\])/eU', '$_SERVER["\\2"]' ,$res[0]);
	$res[1]=@preg_replace('/(\[\[([^\]]+)\]\])/eU', '$_SERVER["\\2"]' ,$res[1]);

	return $res;
}



function replace_names($layout,$result,$lang){
	$whatchange=array();
	$tochange=array();
	foreach ($result as $k=>$v){
		if (!is_array($v)){
		$tochange[]=$v;
		$whatchange[]="::".$k."::";
		}
	}

	list($subj,$body)=mailextract($layout,$lang);
	$body=str_replace($whatchange,$tochange,$body);
	$subj=str_replace($whatchange,$tochange,$subj);

	return array($subj, $body);
}




function bd_date($name,$date,$range,$w1,$w2,$w3){
	global $par,$lxs;
	
	list($day,$mo,$year)=explode(":",date("d:n:Y",$date));
	$mo1=array();
	$months=explode(" ","mon_01 mon_02 mon_03 mon_04 mon_05 mon_06 mon_07 mon_08 mon_09 mon_10 mon_11 mon_12");
	$vyso = ($year%4) ? 28 : 29;
	$dys=explode(" ","31 $vyso 31 30 31 30 31 31 30 31 30 31");
	foreach ($months as $m){
		$mo1[]=$lxs[$m];
	}
	
	$da1=range('1','31');
	$ye1=range($year,($year-$range));

	
	$t="<SELECT name=d".$name." style=\"margin-right:2px;width:$w1;\">";
	foreach ($da1 as $d){
		$selected = ($d==$day) ? " selected" : "";
		$t.= "<OPTION value=$d $selected>$d</OPTION>";
	}
	$t.="</SELECT>";

	$t.="<SELECT name=m".$name." style=\"margin-right:2px;width:$w2;\">";
	$i=1;
	foreach ($mo1 as $d){
		$selected = ($i == $mo) ? " selected" : "";
		$t.= "<OPTION value=$i $selected>$d</OPTION>";
		$i++;
	}
	$t.="</SELECT>";
	
	$t.="<SELECT name=y".$name." style=\"width:$w3;\">";
	foreach ($ye1 as $d){
		$selected = ($d==$year) ? " selected" : "";
		$t.= "<OPTION value=$d $selected>$d</OPTION>";
	}
	$t.="</SELECT>";

	return $t;

}

function safeurl($val){
	$val= strtolower(preg_replace('/&([#\w]+);/s','',$val));
	return preg_replace('/[^\w]+/s','-',$val);
}

function safetotal($val){
	$val=	strtolower(strip_tags($val));
	$val=	preg_replace('/&([#\w]+);/s','',$val);
	return	preg_replace('/[^\w]+/s','',$val);
}


function getUrlDefault($url,$username,$password){
	$e="";
	$myHeader = array(
						"MIME-Version: 1.0",
							"Content-type: text/plain; charset=utf-8",
	"Content-transfer-encoding: text\n",				 
	);

	$c = curl_init();
	curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($c, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($c, CURLOPT_HTTPHEADER, $myHeader);
	curl_setopt($c, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.7.8) Gecko/20050516 Firefox/1.0.4");
	curl_setopt($c, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
	curl_setopt($c, CURLOPT_USERPWD, "$username:$password");
	curl_setopt($c, CURLOPT_HEADER, 0);
	curl_setopt($c, CURLOPT_URL, $url);
	$e = curl_exec($c);
	curl_close($c);
	return $e;
}




function cc($word){
	return ucwords(trim($word));
}



function checkIfordersExist(){

	if (isset($_SESSION['regularuser'])){
		$totals_sql = sqlquery("	
	
						SELECT SUM(".ORDERS.".qty) as	total_qty,
							   SUM(".ORDERS.".total) as total_total
						FROM ".ORDERS."
						WHERE sessionid = \"".sqller($_SESSION['regularuser'])."\"
						GROUP BY sessionid	
						
		") or die(conn_error());
	
		$totals= conn_fetch_assoc($totals_sql);
		if (!$totals) return false;
	} else return false;

}


function makeMeYT($rawCode){
	/*DEFINE VIDEO CODE*/
	$youtubeCode='';


	preg_match("/youtu\.be\/([\w-]+)/s",$rawCode,$matches);
	if (isset($matches[1])){
		$youtubeCode=$matches[1];
		return $youtubeCode;
	}

	preg_match("/youtube\.com\/watch\?v\=([\w-]+)/s",$rawCode,$matches);
	if (isset($matches[1])){
		$youtubeCode=$matches[1];
		return $youtubeCode;
	}

	preg_match("/youtube\.com\/embed\/([\w-]+)/s",$rawCode,$matches);
	if (isset($matches[1])){
		$youtubeCode=$matches[1];
		return $youtubeCode;
	}
	
	preg_match("/youtube\.com\/v\/([\w-]+)\?/",$rawCode,$matches);
	if (isset($matches[1])){
		$youtubeCode=$matches[1];
		return $youtubeCode;
	}

	
	/*if (!$youtubeCode){
		preg_match("/^(\w+)$/s",$rawCode,$matches);
		if (isset($matches[1])){
			$youtubeCode=$matches[1];
		}
	}*/

	return $youtubeCode;
}



function parseVideoInFrame($rawCode){
	/*DEFINE VIDEO CODE*/
	$inFrameCode='';


	preg_match("/<iframe([^<>]+)src=[\"']([^'\"]+)['\"]/sU",$rawCode,$matches);

	/*if (@$_REQUEST['debug']) print_r($matches);*/
	if (isset($matches[2])){
		$inFrameCode=$matches[2];
	}

	
	return $inFrameCode;
}





function qtime($line,$template,$pattern){
	global $depot;
	return;
	$tt2=getmcrotime();
	//$taken=(isset($depot['testotal1'])) ? ($depot['testotal1']+$tt2-$tt) : ($tt2-$tt);

	$taken=(isset($depot['testotal1'])) ? ($tt2-$depot['testotal1']) : 0;
	$depot['takentotoal']=isset($depot['takentotoal']) ? $depot['takentotoal']+sprintf('%.6f',$taken) : sprintf('%.6f',$taken);

	$depot['testotal1']=$tt2;

	echo "<div style='text-align:left;'><b>".sprintf('%.6f',$taken)."</b> --- ".$template." #$line====".$depot['takentotoal']."+++++++[".htmlspecialchars($pattern)."]</div><br>";
}




function getScriptTime($time){
	global $par,$depot;
	return  "
		<div style='background:#FFFF00;text-align:left;color:#000;position:absolute;top:0px;left:0;padding:2px;font-size:8px;line-height:10px;font-family:\"Verdana\",Courier'>
			<span style='background:#D00;color:#FFF;padding:2px 5px;'>DEBUG</span><br><br>
			<b>".sprintf('%.4f',$time)."</b><br>
			clr:".@$depot['vars']['qry']."	<br>
			cch:".(@$depot['vars']['cqry'] ? @$depot['vars']['cqry'] : "-no-")."		<br>
			<span style='color:#D00'>sql:".sprintf('%.4f',@$depot['vars']['qrytime'])." </span><br>
			csql:".sprintf('%.4f',@$depot['vars']['cqrytime'])." <br>
			out: ".sprintf('%.4f',@$depot['vars']['outer'])."</b>
			<br>..........<br>
			M: ".number_format(memory_get_peak_usage())."<br>
			m: ".number_format(memory_get_usage())."<br>			
		
		</div>";
}



function trackSQL(){
	global $par,$depot;
	$ttt=$ttqty=0;
	@fclose($fh_sql);	
	$filename=$_SERVER['DOCUMENT_ROOT']."/var/mysql_log_ordered.txt";
	$fh_sql1=fopen($filename,'w');

	ksort($depot['vars']['mysql_tracking']);
	foreach ($depot['vars']['mysql_tracking'] as $key=>$value) {

		fwrite($fh_sql1, "TIME: [ ".($key/100000)." ]\r\n ".$value."\r\n\r\n\r\n");
		$ttt+=$key/100000;
		$ttqty++;
	}
	fclose($fh_sql1);
}