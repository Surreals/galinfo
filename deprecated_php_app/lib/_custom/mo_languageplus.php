<?
$vars['mod_result']=get_langplus();



function get_langplus(){
	global $par,$errors,$oks,$vars;
	//variables to play with: link,class,caption
	$arr=array();
	foreach ($vars['langs'] as $k=>$v){
		if ($v['lang'] == $par['lng']) $class=" class='active'"; else $class='';
		//langset is the link
		$arr['langset'][]=array(
								"link"		=>	"/".$v['lang']."/",
								"class"		=>	$class,
								"caption"	=>	getfromsql($v['langtitle'],$par['lng'])
							);
		$arr['rsslink']='/'.$par['lng']."/rss/";
	}
	return parse_local($arr,'_choooselang');
}
