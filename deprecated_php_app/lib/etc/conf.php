<?
global $depot,$par,$enviro,$fhsql;
//$_SERVER["DOCUMENT_ROOT"].= "/store";

/* CACHE IDS

1 - стрічка новин
2 - дерево сайту
3 - шаблони
4 - категорії
5 - анонси
6 - властивості
7 - мови
8 -	реклама
*/



/*

	1 - Новина
	2 - Стаття
	3 - Фоторепортаж
	4 - Відео
	5 - Аудіо
	6 - Анонс
	10 - Бібліотека
	11 - Довідник
	20 - Блог
*/


/**********          DATABASE CONST           **********/
define("ANNO",		"a_announces");
define("ADPLACES",	"a_adplaces");
define("ADMANAGE",	"a_admanage");
define("BANN",		"a_bann");
define("BANNERS",	"a_adbanners");
define("BANSTATS",	"a_banstats");
define("BLOCKED",	"a_blocked");
define("CATS",		"a_cats");
define("CACHE",		"a_cache");
define("CONT",		"a_containers");
define("COMMENTS",	"a_comments");
define("COMMRATING","a_commentsrating");
define("CTREE",		"a_commontree");
define("CHATL",		"a_chatl");
define("CHATQ",		"a_chatq");
define("CHATP",		"a_chatpublish");
define("DROPS",		"a_drops");
define("ENVIRO",	"a_enviro");
define("ENVIROHEADLINE",	"a_environews");
define("FREE",		"a_freecontent");
define("FLOGGEDU",	"a_loggedu");
define("FUSERS",	"a_users");;
define("HIST",		"a_hist");
define("LANG",		"a_lang");
define("MEDIA",		"a_media");
define("MEDIABOX",	"a_mediablock");
define("METAS",		"a_metas");
define("MODS",		"a_modules");
define("NEWS",		"a_news");
define("NEWSB",		"a_news_body");
define("NEWSHEAD",	"a_news_headers");
define("SPECIALIDS","a_news_specialids");
define("NEWSSLIDEHEAD",	"a_news_slideheaders");
define("NEWSI",		"a_newsindex");
define("NEWSMETA",	"a_newsmeta");
define("AUTHOUT",	"a_authout");
define("PICTYPE",	"a_pictype");
define("PICS",		"a_pics");
define("PATT",		"a_patterns");
define("POLL",		"a_polls");
define("POLLRES",	"a_pollres");
define("RESERVED",	"a_reserved");
define("STATVIEW",	"a_statview");
define("STATCOMM",	"a_statcomm");
define("STATS",		"a_stats");
define("TREE",		"a_tree");
define("TEASERS",	"a_teasers");
define("TAGS",		"a_tags");
define("TAGMAP",	"a_tags_map");
define("USERS",		"a_powerusers");
define("VOTERS",	"a_poll_voters");
define("SRCHS",		"a_searches");
define("LOGGEDA",	"a_loggedadm");
define("PICSU",		"a_picsu");

define("RDIR",		$_SERVER['DOCUMENT_ROOT']);
/**
initialise global depot array
*/
initGlobalDepot();



$depot['mysql_time_factor']= NEWS.".udate < UNIX_TIMESTAMP() ";
$depot['agent']=isset($_SERVER['HTTP_USER_AGENT']) ? strtolower($_SERVER['HTTP_USER_AGENT']) : "";


/*****************    FETCHING START     ***************/
function getmcrotime(){ 
	$mt=microtime();
    list($usec, $sec) = explode(" ",$mt); 
	//echo "<h2>$mt</h2>";
    return ((float)$usec + (float)$sec); 
} 


/*common cookie*/
if (!isset($_COOKIE['visitor'])){
	setcookie( 'visitor',	md5(time().$_SERVER['REMOTE_ADDR']), time()+60*60*24*30);
}



function initGlobalDepot(){
	global $par,$depot;

	$depot['vars']=array();
	$depot['vars']['mod_result']			='';
	$depot['vars']['default_charset']		="UTF-8";
	$depot['vars']['default_pattern']		="/\{\<ZML:(\w+):([\w,]+)\>\}/eU";
	$depot['vars']['default_pattern_man']	="/\{\<ZML:man:([\w,]+)\>\}/eU";
	$depot['vars']['css']					="compare-default.css";
	$depot['vars']['reserved_vars']			=array();
	$depot['vars']['domain']				=$_SERVER["HTTP_HOST"];

	/*current time*/
	$depot['vars']['ctime']=time();
	$depot['vars']['loctime']=date('H:i',$depot['vars']['ctime']);
	$depot['vars']['locdate']=date('d',$depot['vars']['ctime']);


	$depot['path']=array(
						'full'	=>'/media/gallery/full/',
						'intxt'	=>'/media/gallery/intxt/',
						'tmb'	=>'/media/gallery/tmb/',
						'tmp'	=>'/media/gallery/tmp/',
						'raw'	=>'/media/gallery/raw/'
					);

	$depot['vars']['domain']=		$_SERVER['HTTP_HOST']?$_SERVER['HTTP_HOST']:'galinfo.com.ua';
	$depot['vars']['subdomain1']=	$_SERVER['HTTP_HOST']?$_SERVER['HTTP_HOST']:'galinfo.com.ua';


	$depot['default_flash_pattern']='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0"  width="[[width]]" height="[[height]]"><param name="movie" value="/var/things/[[filename]]"><param name="quality" value="high"><param name="wmode" value="opaque"><embed src="/var/things/[[filename]]" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash"  width="[[width]]" height="[[height]]" wmode="opaque"></embed></object>';

	$depot['videoiframe']="<iframe frameborder=\"0\" fullscreen=\"\" height=\"400\" src=\"{FRAMESOURCE}\" width=\"710\"></iframe>";

	$depot['fext']=".html";
	$enviro=array();
	$par=array();
	$depot['errors']=array();
	$depot['oks']=array();

	$depot['t_par']=array();
	$depot['page_path'] = array();

	/*picture type for community*/
	$depot['var']['communitytype']=182;


	/*articles types
	$depot['article_types']=	array(
			'news'=>1,
			'videonews'=>2,
			'afisha'=>10,
			'tvoetv'=>20
	);*/


	$depot['article_types']=	
			array(
						1=>"news",
						2=>"articles",
						3=>"photo",
						4=>"video",
						6=>"announces",
						7=>"pressrelease",
						8=>"events",
						20=>"blogs",
						21=>"mainmedia"

			);

	$depot['article_keys']=array();
	foreach ($depot['article_types'] as $k=>$v){
		$depot['article_keys'][$v]=$k;
	}


	$depot['vars']['socials']=array(
				0," * * * * * ",
				1,"FaceBook",
				2,"Twitter",
				3,"Live Journal"
	);

	$depot['extractedIds']=array();

	foreach ($_REQUEST as $k=>$v) {
		$par[$k]=$v;

	}

	$depot['vars']['ogimage']="<meta property=\"og:image\" content=\"http://".$_SERVER['HTTP_HOST']."/im/defaultog.jpg\" />";
	
	$depot['secrets']=array(
					
						'fb_appId'  =>	'371755279700434',
						'fb_secret' =>	'bbef1862191b48c681d1adf8efa12462',
						'tw_appId'  =>	'k0crMVKEcDEIgaiF53E1rw',
						'tw_secret'	=>	'mMgNArpwEi5XLu532IprT90vUO7L2zsFNPElXE3Qw',
						'vk_appId'  =>	'4951296',
						'vk_secret'	=>	'slXn68DVnxATdCMYH83B',
						'goo_clientId'  =>'439049017209-809ratcus7lu5lle91t57i1hd914vnhs.apps.googleusercontent.com',
						'goo_secret'	=>	'vHJDR_zZ6JzXkWUaN2SYRGQX',
						'goo_uri'  =>	'http://'.$_SERVER["HTTP_HOST"]."/apphlp/authout.php"

	);
	
	$depot['vars']['imadmin']=($_SERVER['REMOTE_ADDR'] =='194.44.192.110' || $_SERVER['REMOTE_ADDR'] =='127.0.0.49' || @$_REQUEST['berimor']=='debugload') ? true: false;
}



function initDepends(){
	global $depot;
	$depot['vars']['locdate']=date("d",$depot['vars']['ctime'])." ".$depot['lxs']["mona_".date('m',$depot['vars']['ctime'])];

	list($cd,$cwd,$cm)=explode("/",date('d/w/m',$depot['vars']['ctime']));
	$depot['vars']['locdatefull']=$depot['lxs']["dw_".date('w',$depot['vars']['ctime'])].", ".date("d",$depot['vars']['ctime'])." ".$depot['lxs']["mona_".date('m',$depot['vars']['ctime'])];

	$depot['vars']['today_weekday']=@$depot['lxs']['dw_'.date("N",$depot['vars']['ctime'])];
	$depot['vars']['today_verbalmonth']=$depot['lxs']['mona_'.date("m",$depot['vars']['ctime'])];

}


/*	measure function time */
function inTime($function,$timesection,$parameter=false){
	global $par,$depot;
	$t1 = getmcrotime();
	call_user_func($function,$parameter);
	$t2 = getmcrotime();
	$depot['vars'][$timesection] = isset($depot['vars'][$timesection]) ? ($depot['vars'][$timesection]+$t2-$t1) : ($t2-$t1);
}


function itrack($var) {
	global $depot;
	if ($depot['vars']['imadmin']){
		print_r($var);
	}
}