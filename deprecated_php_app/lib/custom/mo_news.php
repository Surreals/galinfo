<?

require_once("mo_news_func.php");

/*
	MAIN NEWS HANDLER

	###################
	ntype - NEWS TYPE
	1 - Новина
	2 - Аналітика (Стаття)
	3 - Фоторепортаж
	4 - Відеоновина


	##################
	nweight	 - NEWS PRIORITY
	0 - Звичайна новина
	1 - Важлива новина (виділення жирним)
	2 - Топ новина (слайдшоу)
	3 - Фотоновина (для стрічки, для рубрик в якості головної)
	4 - Ілюструюча новина

	Все, чого бракує -- тут:
	/lib/stuff.php
	/lib/stuffrare.php

*/


defineRubrics();
$depot['vars']['mod_result']=get_news();


function get_news(){
	global $par,$depot;
	$html="";
	defineHeadlineEnviro();

	if (!isset($_COOKIE['lastnewsid'])) {
		cleanLastIDCookie();
		$depot['vars']['lastidset'] = true;
	} else {
		$depot['vars']['morejs'][] = "<script>var lastNewsID = ".$_COOKIE['lastnewsid'].";</script>";
	}
	
	if (!isset($par['articletype'])) {
		if (isset($par['filterNews'])) return get_filteredArticles();
		else return get_newshome();
	}

	if (isset($par['articletype'])){
		if (!in_array($par['articletype'],$depot['article_types']) && $par['articletype']!=='chat') err404();
	}	

	switch ($par['articletype']){
		case	"news":
			if (!isset($depot['vars']['lastidset'])) {
				cleanLastIDCookie();
			}
			$html.=bringArticles();
			break;
		case	"articles":
		case	"blogs":
		case	"video":
		case	"interview":
		case	"photo":
		case	"photo-video":
		case	"ljlive":
		case	"announces":
		case	"mainmedia":
				$html.=bringArticles();
				break;
		
		case 'chat':		$html.=get_chat();break;
		case 'print':		$html.=readnews();break;
		case 'search':		$html.=get_search();break;
	}
	return  $html;
}