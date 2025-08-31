<?
global $formvars, $actives, $lngs, $accessr,$lngs1,$acts;
require_once("adm_auth.php");
require_once("../lib/etc/forms.php");
require_once("../lib/etc/export.php");
$lexfile=file($_SERVER["DOCUMENT_ROOT"]."/var/tls/lex.hash");
foreach ($lexfile as $line){
	if (trim($line)){
		$tmp=explode("{:}",$line);
		$depot["tx"][trim($tmp["0"])]=ceho(trim($tmp[1]));
		//$depot["tx"][trim($tmp["0"])]=trim($tmp[1]);
	}
}


/* GLOBALS FOR MENU */
$acts=array(
			'news'		=>1,	
			'default'	=>1,	
			'announce'	=>1,
			'slide'		=>1,
			'comments'	=>1,
			'tags'		=>1,

			'gallery'	=>2,
			'media'		=>2,

			'site'		=>3,	
			'tree'		=>3,	
			'pattern'	=>3,	
			'modules'	=>3,	
			'polls'		=>3, 
			'pollres'	=>3,  
			'cats'		=>3,  

			'chat'		=>1,
			'langs'		=>5,

			'props'		=>6,
			'propsheadline'	=>6,	
			'censor'	=>6,	
			'services'	=>6,	
			'bann'		=>6,	
			'cache'		=>6,

			'users'		=>7,	
			'community'	=>7,	
			'ustat'		=>7,

			'brs'		=>8,	
			'banners'	=>8,	
			'adplaces'	=>8, 
			'bannstats'	=>8
);

$actives=array();
$found_index=0;
foreach ($acts as $k=>$v) {
	if (@$par['act'] == $k) {
		$actives[$v] = array('style="display:inline;"','class=active'); 
		$found_index=1;
	}
	else {
		if (!isset($actives)) $actives[$v] = array('','');
	}
}
if (!$found_index) $actives[1]=array('style="display:inline;"','class=active');




/*		ACCESS PERMISSION  */

$accessr=array(
		"ac_newsadd"		=>	$depot["tx"]['ac_newsadd'],
		"ac_newsadmin"		=>	$depot["tx"]['ac_newsadmin'],

		"ac_announce"		=>	$depot["tx"]['ac_announce'],
		"ac_newscomment"	=>	$depot["tx"]['ac_newscomment'],
		"ac_picsadd"		=>	$depot["tx"]['ac_picsadd'],
		"ac_picadmin"		=>	$depot["tx"]['ac_picadmin'],
		"ac_usermanage"		=>	$depot["tx"]['ac_usermanage'],
		"ac_filemanage"		=>	$depot["tx"]['ac_filemanage'],
		"ac_history"		=>	$depot["tx"]['ac_history'],
		"ac_site"			=>	$depot["tx"]['ac_site'],
		"ac_props"			=>	$depot["tx"]['ac_props'],
		"ac_add_tags"		=>	$depot["tx"]['ac_add_tags']
);



/*		HISTORY CODES		*/
$hist=array();
for ($i=0;$i<31;$i++) $hist[]=@$depot["tx"]['hi_'.$i];


$lngssql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
for ($i=0;$i<conn_sql_num_rows($lngssql);$i++) {
	$g=conn_fetch_assoc($lngssql);
	$lngs[$g['id']]=array($g['langtitle'],$g['lang']);
	$lngs1[$g['lang']]=array($g['langtitle'],$g['id']);
}

$formvars=array(
	"tf", "Заголовок",
	"ta1", "Короткий текст",
	"ta2", "Довгий текст",
	"im", "Зображення",
	"tmb", "Іконка",
	"imploded","Склеєні змінні"
);

$formvars=array(
	"tf","Заголовок",
	"ta1","Короткий текст",
	"ta2","Довгий текст",
	"imploded","Склеєні змінні"
);




function aget_menu1(){
	global $actives,$logged_user,$depot,$par,$acts;
	$pp='';
	

	$stats=conn_fetch_assoc(conn_sql_query("SELECT *, DATE_SUB(NOW(), INTERVAL 24 HOUR)>indexed AS needindex
	FROM ".STATS));
	
	
	if(isset($logged_user)) $pp.="<div style='text-align:right;float:right;'><a href='/gazda/?act=logout' style='margin:3px 5px 3px;' title='".$depot["tx"]['he_logout']."'><img src='/gazda/img/bt_close.gif' alt='".$depot["tx"]['he_logout']."'></a></div>";
	
/*
		!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! INDEXING ALERT


if ($stats['needindex'] && @$par['su']!=='reindex') $pp.="<a href='/gazda/?act=services' style='float:left;margin-top:5px;color:#E00;text-decoration:none;line-height:20px;font-weight:bold;font-size:10px;'><img src='/gazda/img/alrt.gif' style='margin-right:10px'>".iho('З моменту останнього оновлення індексу минуло понад 24 години !')."</a>";*/


	$pp.= '	
		<div class=menu>

		<a href="" onClick="return chvis(1,\'h\',this)" rel="mm" '.@$actives[1][1].'>Новини / Статті</a>

		<a href=""  onClick="return chvis(2,\'h\',this)" rel="mm" '.@$actives[2][1].'>Галерея</a>
			
		<a href=""  onClick="return chvis(3,\'h\',this)" rel="mm" '.@$actives[3][1].'>Сайт</a>

		<a href=""  onClick="return chvis(5,\'h\',this)" rel="mm" '.@$actives[5][1].'>Мови</a>

		<a href=""  onClick="return chvis(6,\'h\',this)" rel="mm" '.@$actives[6][1].'>Властивості</a>

		<a href=""  onClick="return chvis(7,\'h\',this)" rel="mm" '.@$actives[7][1].'>Користувачі</a>

		<a href=""  onClick="return chvis(8,\'h\',this)" rel="mm" '.@$actives[8][1].'>Реклама</a>
		
		<iframe src="" name="updscript" id="updscript"></iframe></div>	
	';

	return $pp;
}


function aget_menu2(){
	global $actives,$par,$depot;
	/* filter possible parameters */
	$parameters="tree pattern modules gallery users props bann services langs address movie anatomy exercise clinic clinicman therapist patient clinicat adplaces banners mailtemp news faq catalog fixpars articles cht sets chtsrch appcheats gam con pub dev gen feedcheats categories running merchants pprops products enviro synchro cache backup ads orders customers mailtempl mailbulk mailaddr searchstat slide reports coupons bonuses orderservice userservice reviews comments addnews clients media uservideo contest audio bannstats ustat propsheadline mediabox tags";
	$cool_array=explode(" ",$parameters);
	$pa=array();
	foreach ($cool_array as $k){
		if ($par['act']==$k){
			$pa[$k]=' class=active';
		} else {
			$pa[$k]='';
		}
	}

	return  '
		<div class=menu2 id=h1 rel=submenu '.@$actives[1][0].'>
			<a href="/gazda/?act=addnews&su=view">Неопубліковані</a>
			<a href="/gazda/?act=addnews&su=viewpub">Опубліковані</a>
			<a href="/gazda/?act=addnews">Додати статтю</a>
			<a href="/gazda/?act=announce">Анонси</a>
			<a href="/gazda/?act=slide">Топи на головній</a>
			<a href="/gazda/?act=comments">Коментарі</a>
			<a href="/gazda/?act=mediabox">Фотоколаж на головній</a>
			<a href="/gazda/?act=tags">Теги</a>

		</div>
		
		<div class=menu2 id=h2 rel=submenu '.@$actives[2][0].'>
			<a href="/gazda/?act=gallery" '.	$pa["gallery"].'>'.$depot['tx']["he_gallery"].'</a>	
			<!--a href="/gazda/?act=media" '.	$pa["media"].' >'.$depot['tx']["he_videogallery"].'</a-->
		</div>

		<div class=menu2 id=h3 rel=submenu  '.@$actives[3][0].'>
			<a href="/gazda/?act=tree">Дерево</a>
			<a href="/gazda/?act=pattern">Шаблони</a>
			<a href="/gazda/?act=modules">Модулі</a>
			<a href="/gazda/?act=cats&type=1">Рубрики</a>
			<a href="/gazda/?act=cats&type=2">Теми</a>
			<a href="/gazda/?act=cats&type=3">Регіони</a>
			<a href="/gazda/?act=polls">Голосування</a>
		</div>

		<!--div class=menu2 id=h4 rel=submenu  '.@$actives[4][0].'>
			<a href="/gazda/?act=chat&su=v">Перелік</a>
			<a href="/gazda/?act=chat&su=a">Додати чат</a>
		</div-->
		
		<div class=menu2 id=h5 rel=submenu  '.@$actives[5][0].'>
			<a href="/gazda/?act=langs&su=view">Перелік</a>
			<a href="/gazda/?act=langs&su=add">Додати мову</a>
			<a href="JavaScript:syncro();">Синхронізувати БД</a>
		</div>

		<div class=menu2 id=h6 rel=submenu  '.@$actives[6][0].'>
			<a href="/gazda/?act=props">Загальні властивості</a>
			<a href="/gazda/?act=propsheadline">Головна стрічка</a>
			<a href="/gazda/?act=bann">Заборона користувачів</a>
			<a href="/gazda/?act=services">Сервісні операції</a>
			<a href="/gazda/?act=cache">HTML кеш</a>
		</div>

		<div class=menu2 id=h7 rel=submenu  '.@$actives[7][0].'>
			<a href="/gazda/?act=users&su=view">Редакція</a>
			<a href="/gazda/?act=community">Спільнота</a>
			<a href="/gazda/?act=ustat">Статистика</a>

		</div>

		<div class=menu2 id=h8 rel=submenu  '.@$actives[8][0].'>
			<a href="/gazda/?act=adplaces">Рекламні місця</a>
			<a href="/gazda/?act=banners">Банери</a>
			<a href="/gazda/?act=bannstats">Статистика</a>
		</div>
	';
}

function aget_top(){ 
	global $par,$errors,$oks,$var_top;
	$var_t="<div id='head'><a href=\"/\"><img src=\"/im/pix.gif\" width=250 height=109 border=0 style=\"padding:0;margin:0;\"></a>

	</div>
  	";
	return $var_t;
}

function aget_right(){
		global $par,$gamename;
		$ttop="<a href=\"/\">HOME PAGE</a>";
		return $ttop;
	
}


function aget_bottom(){
		$top="";
		return $top;

}


function JS11(){
$ttop=<<<ENDJS

<SCRIPT LANGUAGE=JAVASCRIPT>
	function find_admcheats(){
		document.forms['admsrch'].submit();
}
</SCRIPT>

ENDJS;
return $ttop;
}

function translit($word){
	//global $con;
	//$word=$con->Convert ($word, "utf-8", "windows-1251", false);
	$word=mb_strtolower($word,"UTF-8");
	//$word=mb_convert_encoding($word, "windows-1251", "UTF-8");
	$word=strtolower($word);
	$u="а,б,в,г,д,е,є,ж,з,и,і,ї,й,к,л,м,н,о,п,р,с,т,у,ф,х,ц,ч,ш,щ,ю,я,ь,ъ,э,ё,ы";
	$a="a,b,v,g,d,e,e,zh,z,y,i,yi,y,k,l,m,n,o,p,r,s,t,u,f,h,ts,ch,sh,shch,yu,ya,,,e,yo,y";
	$ukr=explode(",",$u);
	$eng=explode(",",$a);
	$word=str_ireplace($ukr,$eng,$word);
	//$word1=mb_convert_encoding($word, "UTF-8", "windows-1251");
	return $word;
	//return $con->Convert ($word1, "windows-1251", "utf-8", false);;
}


function getfromdb($var,$lang){
	global $par;
	$sql=conn_sql_query("SELECT * FROM ".LANG." WHERE lang=\"$lang\"");
	$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	if (strtoupper($res['site_charset']) !== "UTF-8"){
		//echo "3<br><br><br>";
		return mb_convert_encoding($var, "UTF-8", $res['site_charset']);
	}
	else {
		//echo "4<br><br><br>";
		return $var;
	}
}


function getfromlex($var,$lang){
	global $par;
	$sql=conn_sql_query("SELECT * FROM ".LANG." WHERE lang=\"$lang\"");
	$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	if (strtoupper($res['lex_charset']) !== "UTF-8"){
		//echo "3<br><br><br>";
		return mb_convert_encoding($var, "UTF-8", $res['lex_charset']);
		
	}
	else {
		//echo "4<br><br><br>";
		return $var;

	}
}

function puttodb($var,$lang){
	global $par;

	$sql=conn_sql_query("SELECT * FROM ".LANG." WHERE lang=\"$lang\"");
	$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	if (strtoupper($res['site_charset']) !== "UTF-8"){
		//echo "1<br><br><br>";
		return trim(sqller(mb_convert_encoding($var, $res['site_charset'],"UTF-8")));
	}
	else {
		//echo "2<br><br><br>";
		return trim(sqller($var));
	}
}


function langs_ok($table){
	global $allangs,$errors,$oks;
	$needalter=array();
	$alter_SQL = "ALTER TABLE $table";
	$sql=conn_sql_query("SHOW COLUMNS FROM ".$table." LIKE \"%\_default\"");
	$needed=array();
	$allneed=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$rs=conn_fetch_assoc($sql);
		preg_match("/^(\w+)_default$/",$rs['Field'],$matches);
		$allneed[$matches[1]] = $rs;
	}

	foreach ($allangs as $k) {
		$sql=conn_sql_query("SHOW COLUMNS FROM ".$table." LIKE \"%\_$k\"");
		$currneed=array();
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$rs=conn_fetch_assoc($sql);
			preg_match("/^(\w+)_$k$/",$rs['Field'],$matches);
			$currneed[$matches[1]] = $rs;
		}

		foreach ($allneed as $kk=>$vv) {
			$sql1='';
			if (!isset($currneed[$kk])) {
				/*Prepare SQL*/
				$sql1.=" ADD ".$kk."_".$k." ".strtoupper($vv['Type']);
				if ($vv['Null']) $sql1.=" NULL"; else $sql1.=" NOT NULL";
				if ($vv['Default']) $sql1.=" DEFAULT".$vv['Default'];
				$needalter[]=$sql1;
			}
		}
	}

	if	($needalter) {
		$alter_SQL.=implode(", ",$needalter);		
		conn_sql_query($alter_SQL) or die(conn_error());
		if (conn_error()) $depot['errors'][] = conn_error(); else $oks[] = "Table structure was changed";
	}

}


function image_maker($sql_result,$pattid){
	global $par,$depot;
	$depot['var']['imagesqty']=0;

	if ($pattid) $pname='selimgs_'.$pattid; else $pname='selimgs';

	$ttop='';

	 $ttop.="
	<div style='width:700px;height:480px;z-index:100;display:none;position:absolute;top:0;left:0;' id='imageManagerPopup'>
		
		<div style='float:left;width:300px;height:400px;'>
		
		<div class=toolbar1 style='width:100%;padding-top:2px;'>
			<img src='/gazda/img/mbs/mb_separ.gif'>
			<a href='/gazda/picsrc.php' target=imgsrc ><img src='/gazda/img/mbs/mb_open.gif'></a>
		</div>

		<iframe src=\"/gazda/picsrc.php\" name=\"imgsrc\" id=\"imgsrc\" frameborder=0 scrolling=\"auto\"></iframe>
		
		</div>
		
		<div style='float:right;width:380px;height:400px;'>
		<div class=toolbar3 style='width:100%;'>
			<img src='/gazda/img/mbs/mb_separ.gif' style='float:left;margin-left:12px;margin-top:3px;'>
			
			<a href='' onClick='deselect(); return false;' style='float:left;margin-top:3px;'><img src='/gazda/img/mbs/mb_desel.gif'></a>
			<a href='' onClick='return destroyImage()' style='float:right;margin-right:20px;margin-top:3px;'><img src='/gazda/img/mbs/mb_del.gif'></a>
		</div>
		<div class=presel>";


	$ttop.="
			<div id='selectedi' name='selectedi' data-images='".(isset($sql_result) && $sql_result !==''?sizeof(explode(',',$sql_result)):0)."'>";
	if (isset($sql_result) && $sql_result !==''){
		foreach (explode(',',$sql_result) as $i=>$img_id){
			$img_sql=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".PICS." WHERE id = \"$img_id\""));
			$ttop.="<div class='image_popup_item selectedHolder' id='loadedHolder".$img_id."'><a href='' onClick='activateLoaded(\"$img_id\"); return false;' rel='loadedHref' id=loadedHref".$img_id." class='imginline75' title=\"".$img_sql['filename']."\">";
			$ttop.="<span class='image_popup_count'>".($i+1)."</span>";
			$ttop.="<img src='/media/gallery/tmb/".getImagePath($img_sql['filename']).$img_sql['filename']."' id=loadedImage".$img_id." width=75 alt=\"".$img_sql['filename']."\"></a><span id='objFilename".$img_id."'>".$img_sql['filename']."</span></div>";

			$depot['var']['imagesqty']++;
		}
	}
	$ttop.="
				<input type=hidden name=whereto value='$pname'>
				<input type=hidden name='$pname' value='".@$sql_result."'>
				<input type=hidden name=currselected value=''>
				<input type=hidden name=currselectedimage value=''>
			</div>
		</div>

		</div>

		 <input type=\"button\" name=\"buttnon\" id=\"buttnon\" value=\"OK\" class=buttonok style='clear:both;float:right;margin-top:10px !important;' onClick='return destrpopcont();'>
	</div>";

	return $ttop;

}


function hist($actcode,$affectedcode){
	global $par,$logged_user,$errors;
	conn_sql_query("INSERT INTO ".HIST." SET
			usrid=\"".sqller($logged_user['usid'])."\",
			actcode=\"".sqller($actcode)."\",
			affcode=\"".sqller($affectedcode)."\"
	") or $depot['errors'][]=conn_error();
}


function replaceWords($str)	{
	return $str;
	/*return preg_replace('/(vlaskor\.net)(?!([^<>]+)>)(?!(<\/a>))/sUi',"<a href='/'>\\1</a>",$str);*/
}

function bd_multipopup($data,$name,$style,$tab,$script,$descr = null){
	global $par,$sess,$errors,$gerrors;
	$ttop='';
	$ttop.= "<SELECT name=\"".$name."[]\"  size=\"100\" multiple style=\"$style\">";
	//if (!isset($par[$name])) $par[$name]=array(0,0);
	$all=@$par[$name];
	$sel="";
	for ($i=0;$i<count($data);$i++){
        $description = '';
		if(isset($par[$name])){
			if (in_array($data[$i], $all) && $data[$i]!==0) $sel="selected"; else $sel='';
		}

        if($name == 'region' && isset($descr[$data[$i]])) {
            $description = 'data-description="Новини '.$descr[$data[$i]].' "';
        }

		$ttop.="<OPTION $description  VALUE=\"".stripslashes(htmlspecialchars(trim($data[$i])))."\" $sel>" .stripslashes(htmlspecialchars(trim($data[$i+1])))."</OPTION>";
		$i++;
	}
	$ttop.= "</SELECT>";
	return $ttop;
}