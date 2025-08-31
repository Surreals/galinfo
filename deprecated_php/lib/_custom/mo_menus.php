<?
function menu1(){
	global $par,$depot;
	$t='';
	$hed='';

	$parents=array();
	if (!count(@$depot['menu'][2])) return;
	foreach ($depot['menu'][2] as $m1object){
		$parents[$m1object['idword']]=$m1object['title'];
	}

	if (isset($depot['menu'][2])){
		foreach ($depot['menu'][2]as $k){
			if (!$k['visible']) continue;
			if ($k['idword'] == $depot['active_pars'][1]){
				$class=" class=active";
				
				$link_arr=explode("/",$k['link']);
				$tmp=array_pop($link_arr);
				if (!$tmp) array_pop($link_arr);
				$newlink=implode('/',$link_arr).'/';

				/*$hed= "<h2><a href=\"/$language".$newlink."\">".$captions[$k['parentword']]."</a></h2>"; */


			} else {
				$class="";
			}
			$t.="<li><a href=\"".$k['link']."\" $class>".$k['title']."</a></li>\n";
			
		}
	} else {
		return;
	}

	$t="	
		<ul class='lmenu'>
			$t
		</ul>
	";

	return $t;
}