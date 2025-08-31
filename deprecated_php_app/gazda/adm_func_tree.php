<?

global $a,$p,$previndex,$pattlist,$pattlist1,$pattset,$pattlevel;
function aget_center(){

		global $par,$errors,$oks, $depot,$lngs;
		$ttop='';
		if (!require_level('ac_site')){
			$depot['errors'][]=$depot["tx"]['in_noaccess'];
			return;
		}


		foreach ($par as $k=>$v){
			//echo $k.'===>'.$v."<br>";
		}

		$ttop.= "<h1 class='fixed'>".$depot["tx"]['he_site_str']."</h1><hr><form name='ad' method=post onSubmit=\"alertremove();\">";
		$lang_pars=array_keys($lngs);
		if (!isset($par['lang']) || !isset($lngs[$par['lang']][0])) $par['lang']=$lang_pars[0];
		if (!isset($par['id'])) $par['id']=generate_unique("32");
		
		if (!isset($par['su']) || ($par['su']=='')) $par['su']='v';
		switch ($par['su']){
			case "v": 
			case "moveup":
			case "movedown":$ttop.= cat_view();break;
			case "add": $ttop.= cat_add();break;
			case "edit": $ttop.= cat_edit();break;
			case "remove": $ttop.= cat_del();break;
			case "clean" : $ttop.=cat_clean();break;
			case "goclean" : $ttop.=cat_clean();break;
			case "content" : $ttop.=tree_content();break;
		}

		$ttop.="<input type=hidden name='act' value='".$par['act']."'>";
		$ttop.= "</form>";
		return $ttop;

}




function cat_view(){
	global $par,$b, $depot, $lngs;
	$ttop='';
	
	if ($par['su'] == "moveup" || $par['su'] == "movedown"){
		move_record();
	}
	foreach ($lngs as $k=>$v) {
		$l[]=$k;
		$l[]=$v[0];
	}
	$ttop.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'onChange = "chng_lang()"');
	$ttop.="</div>";
	
	if (!isset($par['viewtype'])) $par['viewtype'] = 'compact';
	if ($par['viewtype'] == 'full') 
		$ttop.=view_full();
	else $ttop.=view_compact();
	
	return $ttop;
}

function view_full(){
	global $par,$b, $depot;
	$ttop='';

	subselect1();
	$datas=array(0,'SELECT CATEGORIES');
	$ttop.="<table width=100% cellpadding=5><tr><td class=heaad width=70%>";
	
	$view_types = array('full',$depot["tx"]['he_tree_open'],'compact',$depot["tx"]['he_tree_comp']);
	$ttop.=bd_popup($view_types,'viewtype','width:150px','',"onChange = sbm('v','','');");

	$ttop.="</td><td width=30% class=heaad>".$depot["tx"]["he_operations"]."</td></tr>";
	$ttop.="<tr><td class=bord style=\"text-align:center !important;border-left:#CCC solid 1px;border-right:#CCC solid 1px; ;background:#FFFF66;\" height=30 colspan=2>";
	$ttop.="<a href=\"JavaScript:sbm('add','0','');\"><img src=\"img/bt_add.gif\" alt=\"".$depot["tx"]["ti_addroot"]."\" title=\"".$depot["tx"]["ti_addroot"]."\" border=0> ".$depot["tx"]["ti_addroot"]."</a>&nbsp;&nbsp;&nbsp;&nbsp;";
	$ttop.="<a href=\"JavaScript:sbm('clean','0','');\"><img src=\"img/bt_swap.gif\" style=\"margin-left:30px;\" alt=\"".$depot["tx"]["ti_clearroot"]."\" title=\"".$depot["tx"]["ti_clearroot"]."\" border=0>".$depot["tx"]["ti_clearroot"]."</a>";
	$ttop.="</td></tr>";

	$rulerwidth=90;

	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$next_pair=array(1,"dseryse5y5y5su6u");
	
	foreach ($b as $cat){ 
		
		$currcolor=(@$colors[($cat['level']-1)]) ? $colors[($cat['level']-1)] : $colors[(count($colors)-1)];
		if (isset($par['id']) && ($par['id'] == $cat['idword'])) $currcolor="#FFFF66"; 
		
		$ttop.="<tr><td class=bord style=\"padding-left:".(($cat['level']-1)*20+10)."px;background-color:".$currcolor."; background-image: url(img/ruler.gif);background-position: ".(($cat['level']-1)*20-80)." -3px; background-repeat:no-repeat;\">&#8226;&nbsp;".stripslashes($cat['title'])."</td><td class=bord>";
		$ttop.=get_acts($cat);
		if ($cat["visible"]=="0") {
			$ttop.="<img src=\"img/bt_inv.gif\" border=0></a>";
		}

		

		$ttop.="</td></tr>";
		$datas[]=$cat['idword'];
		$datas[]=str_repeat(" > ", ($cat['level']-1)).$cat['title'];
	}
	$ttop.="</table>";


	$ttop.=  "<input type=hidden name=act value=\"tree\"><input type=hidden name=su value=\"".$par['su']."\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"".$par['id']."\">";
	return $ttop;
}


function view_compact(){
	global $par,$depot;
	$ttop='';
	
	if (!isset($par['curr_par_id']) || $par['curr_par_id']=='') $par['curr_par_id']="0";
	subselect1(); 
	$datas=array(0,'SELECT CATEGORIES');
	$ttop.="<table width=100% cellpadding=5><tr><td class=heaad width=70%>";
	
	$view_types = array('full',$depot["tx"]['he_tree_open'],'compact',$depot["tx"]['he_tree_comp']);
	$ttop.=bd_popup($view_types,'viewtype','width:150px','',"onChange = sbm('v','','');");

	$ttop.="</td><td width=30% class=heaad>".$depot["tx"]["he_operations"]."</td></tr>";
	$ttop.="<tr><td class=bord  height=50>";
	$ttop.=get_full_path1($par['curr_par_id']);
	$ttop.="</td><td class=bord style=\"text-align:center !important;border-left:#CCC solid 1px;border-right:#CCC solid 1px;background:#FFFF66; \" height=30 >";
	$ttop.="<a href=\"JavaScript:sbm('add','".$par['curr_par_id']."','');\"><img src=\"img/bt_add.gif\"border=0> ".$depot["tx"]["he_add_subcat"]."</a>&nbsp;&nbsp;&nbsp;&nbsp;";
	$ttop.="</td></tr>";

	$rulerwidth=90;
	
	foreach ($depot['b'] as $cat){ 
		$currcolor="#FFFFFF";
		if($cat['parentword'] !== $par['curr_par_id']) continue;
		if (isset($par['id']) && ($par['id'] == $cat['idword'])) $currcolor="#FFFF66"; 
		$ttop.="<tr><td class=bord style=\"background-color:".$currcolor."\";>";

		if ($cat["haschild"]) {
			$ttop.="<a href=\"\" onClick=\"return sbmt('curr_par_id','".$cat['idword']."')\">".stripslashes($cat['title'])."</a>";
		} else {
			$ttop.=stripslashes($cat['title']);
		}
		if ($cat["visible"]=="0") {
				$ttop.="&nbsp;&nbsp;<img src=\"img/bt_inv.gif\" border=0>";
		}
		$ttop.="</td><td class=bord>";

		$ttop.=get_acts($cat);

		$ttop.="</td></tr>";
		$datas[]=$cat['idword'];
		$datas[]=str_repeat(" > ", ($cat['level']-1)).$cat['title'];
	}
	$ttop.="</table>";
	

	$ttop.=  "<input type=hidden name=act value=\"tree\"><input type=hidden name=curr_par_id value=\"".$par['curr_par_id']."\"><input type=hidden name=su value=\"".$par['su']."\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"".$par['id']."\">";
	return $ttop;
}



function get_acts($cat){
	global $depot, $par;
	$ttop='';
	
	$ttop.="<a href=\"JavaScript:sbm('moveup','".$cat['idword']."','')\" title=\"".$depot["tx"]["ti_moveup"]."\"  id=butt class=up></a>";

	$ttop.="<a href=\"JavaScript:sbm('movedown','".$cat['idword']."','')\" title=\"".$depot["tx"]["ti_movedown"]."\" id=butt class=down></a>";

	$ttop.="<a href=\"JavaScript:sbm('edit','".$cat['idword']."','')\" title=\"".$depot["tx"]["ti_edit"]."\" id=butt class=edit></a>";
	
	if ($cat["haschild"]) {
		$ttop.="<a href=\"JavaScript:sbm('add','".$cat['idword']."','')\" title=\"".$depot["tx"]["ti_add"]."\" id=butt class=add></a>";
	} else {
		$ttop.="<a href=\"JavaScript:sbm('add','".$cat['idword']."','')\" title=\"".$depot["tx"]["ti_noadd"]."\" id=butt class=addi></a>";
	}

	if ($cat["content"]=="1") {
		$ttop.="<a href=\"JavaScript:redi('tree','".$cat['idword']."')\" title=\"".$depot["tx"]["he_content"]."\" id=butt class=content></a>";
	} else {
		$ttop.="<a href=\"JavaScript:redi('tree','".$cat['idword']."')\" title=\"".$depot["tx"]["he_content"]."\" id=butt class=contentm></a>";
	}

	$ttop.="<a href=\"JavaScript:r('".$cat['idword']."')\" style='float:right;' title=\"".$depot["tx"]["ti_delete"]."\"  id=butt class=del></a>";
	return $ttop;
}

function subselect(){
	global $a,$b,$previndex, $depot;
	$a=array();
	$b=array();
	$previndex=array(0);
	$sql=conn_sql_query("SELECT * FROM ".TREE." ORDER BY level,id");
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$s=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		$a[$s['parentword']][]=$s;
	}
	reverse(0);

}


function reverse($pa){
	global $a,$b,$previndex, $depot;
	
	if (!isset($a[$pa])) return;

	if (count($a[$pa])){
		$b_temp=array_shift($a[$pa]);
		$b[]=$b_temp;
	}
	


	if (@count($a[$b_temp['idword']])){
		$nextparent=$b_temp['idword'];
		array_push($previndex,$b_temp['parentword']);
		//echo "Fist"."<br>";

	} else if (count($a[$pa])){
		$nextparent=$pa;
		//echo "Second"."<br>";

	} else if (@count($a[$previndex[(count($previndex)-1)]])){
		$nextparent=array_pop($previndex);
		//echo "Third"."<br>";

	} else if(count($previndex) && @$b_temp['parentword']){ 
		$nextparent=array_pop($previndex);
		//echo "Forth"."<br>";

	}	else { 
		return;
	}

	//echo count($previndex)."/".$nextparent."<br>";
	reverse($nextparent);
}


function cat_add(){
	global $par, $errors, $oks, $depot, $lngs;
	$ttop='';
	$ttop.="<input type=hidden name=viewtype value=\"".@$par['viewtype']."\">";
	$ttop.="<input type=hidden name=curr_par_id value=\"".@$par['id']."\">";

	if ($par['id']!=="0"){
			$sql_text="SELECT * FROM ".TREE." WHERE idword=\"".$par['id']."\" AND lng = \"".$par['lang']."\"";
			//echo $sql_text;
			$sql=conn_sql_query($sql_text);
			$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			if (!conn_sql_num_rows($sql)){
				$depot['errors'][]=$depot["tx"]["al_wrongpar"];
				$ttop.=cat_view();
				return $ttop;
			}
			$h2=str_replace("{|thevar|}",$res['title'],$depot["tx"]["he_childstep1"]);
			$ly=$res['level']+1;
	} else {
			$h2=str_replace("{|thevar|}",$depot["tx"]['he_root_dir'],$depot["tx"]["he_childstep1"]);
			$ly=1;
	}


	if (!isset($par['sudir'])){

		$ttop.= "<table width=100%><tr><td rowspan=2 valign=top><h2>".@$lngs[$par['lang']][0]."</h2><br>".$depot["tx"]["in_adding"]."<br></td><td width=50 rowspan=2>&nbsp;</td><td>";
		$ttop.= "<TEXTAREA style='width:640px;height:200px;' name=list></textarea></td></tr><tr><td class=haader>
		<br><input type=button value=\"".$depot["tx"]["bt_proceed"]."\"  id=submt onClick=\"sbm('','','proceed')\"></td></tr></table>";

	} else if ($par['sudir']=="proceed"){
		$allo=explode("\n",$par['list']);


		$ttop.="$h2";
		$ttop.= "<table width=\"100%\"><tr><td width=\"15%\" class=heaad>".$depot["tx"]['he_titlename']."</td>";
		$ttop.= "<td class=heaad width=\"15%\">".$depot["tx"]['he_par']."</td>";
		$ttop.= "<td class=heaad width=\"15%\">".$depot["tx"]['he_content']."</td>";
		$ttop.= "<td class=heaad  width=\"8%\">".$depot["tx"]['he_ischild']."</td>";
		$ttop.= "<td class=heaad  width=\"8%\">".$depot["tx"]['he_visible']."</td></tr>";
		$i=0;
		
		$cont=array("1",$depot["tx"]['he_my_cont'],"2",$depot["tx"]['he_ch_cont']);

		foreach ($allo as $k=>$v){
			if (!trim($v)) continue;
			$ttop.= "<tr><td class=tdrow><INPUT type=text name=title".$i." style='width:200px;' value=\"".htmlspecialchars($v)."\"></td>";
			
			$ttop.= "<td class=tdrow><INPUT type=text name=idword".$i." style='width:200px;' value=\"".str_replace(array(" ","'","\"","/","\\"),array('-',"","","",""),trim(translit($v)))."\"></td>";

			$ttop.= '<td class=tdrow>'.bd_popup($cont,"content$i", "width:200px;","","").'</td>';

			$ttop.= "<td class=tdrow>
			
					<input type='checkbox' value='1' name=hc".$i.">
					</td>";
			$ttop.= "<td class=tdrow>
			
					<input type='checkbox' value='1' name=hot".$i." checked>
					</td></tr>";
			$i++;
		}
		$ttop.= "</table><br><input type=button value=\"".$depot["tx"]["bt_proceed"]."\" id='submt' onClick=\"sbm('','','gosave')\"><input type=hidden name=qty value=\"$i\">";
	} else if  ($par['sudir']=="gosave"){

		$dd=0;
		for ($i=0;$i<$par['qty'];$i++){
			if (!isset($par["hc$i"])) $par["hc$i"]=0;
			if (!isset($par["hot$i"])) $par["hot$i"]=0;
			
			
	
			$ison=conn_fetch_row(conn_sql_query("SELECT * FROM ".TREE." WHERE wkey=\"".conn_real_escape_string(trim($par["idword$i"]))."\" AND parentword = \"".conn_real_escape_string(stripslashes($par["id"]))."\" AND lng=\"".$par['lang']."\""));
			if ($ison[0]){
				$depot['errors'][]="Parameter idword for ".conn_real_escape_string(trim($par["title$i"]))." duplicates one in DB. It should be unique";
			}
			else {
				$dd++;				
				$pio = mt_rand(1,time());
				$generated_idword = md5($pio);
				$full_path=get_full_path($par["id"]);
				if ($full_path) $full_path.=",".trim($par["idword$i"]); else $full_path=trim($par["idword$i"]);

				$q21=conn_sql_query("INSERT INTO ".TREE." SET 
						level=\"".trim($ly)."\",
						title=\"".trim(conn_real_escape_string(stripslashes($par["title$i"])))."\",
						wkey=\"".trim(conn_real_escape_string(stripslashes($par["idword$i"])))."\",
						idword=\"$generated_idword\", 
						parentword=\"".trim(conn_real_escape_string(stripslashes($par["id"])))."\",
						haschild=\"".trim($par["hc$i"])."\",
						visible=\"".trim($par["hot$i"])."\",
						content=\"".trim($par["content$i"])."\",
						fullpath=\"".conn_real_escape_string(stripslashes($full_path))."\",
						lng=\"".$par['lang']."\"
						
						") or die(conn_error());

				$sqla=conn_fetch_assoc(conn_sql_query("SELECT * FROm ".LANG." WHERE isactive <> 0 ORDER BY id LIMIT 1"));
				conn_sql_query("INSERT INTO ".METAS." SET 
						page = \"".conn_real_escape_string(stripslashes($generated_idword))."\",
						linkname_".$sqla['lang']." = \"".puttodb($par["title$i"],$sqla['lang'])."\", 
						title_".$sqla['lang']." = \"".puttodb($par["title$i"],$sqla['lang'])."\", 
						kwords_".$sqla['lang']." = \"".puttodb($par["title$i"],$sqla['lang'])."\", 
						descr_".$sqla['lang']." = \"".puttodb($par["title$i"],$sqla['lang'])."\"") or die(conn_error());


			}
		}
		if (conn_affected_rows($q21)>0) {
			$depot['oks'][]=$dd." ".$depot["tx"]["ok_recordsadded"];
			freecache(2);
		}else {
			$depot['errors'][]=$depot["tx"]["al_recordsadded"];
					
		}
		$par['su']='v';
		return cat_view();
	}

	$ttop.= "<input type=hidden name=act value=\"tree\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=lang value=\"".$par['lang']."\">
	<input type=hidden name=su value=\"add\">
	<input type=hidden name=id value=\"".$par['id']."\">";
	return $ttop;

}



function cat_edit(){
	global $par,$errors,$oks, $depot, $lngs;
	$ttop='';
	$ttop.="<input type=hidden name=viewtype value=\"".@$par['viewtype']."\">";
	$ttop.="<input type=hidden name=curr_par_id value=\"".@$par['curr_par_id']."\">";

	if (!isset($par['sudir'])){	
		
		
		$q11=conn_sql_query("SELECT * FROM ".TREE." WHERE idword=\"".$par['id']."\"");
		$q1=conn_fetch_array($q11, PDO::FETCH_ASSOC);
		if (!conn_sql_num_rows($q11)){
			$depot['errors'][]=$depot["tx"]['al_chooseedit'];
			return cat_view();
		}

		$ttop.="<br><h3>".$depot["tx"]['he_editelement']." ".$q1['title']."</h3><h2>(".@$lngs[$par['lang']][0].")</h2>";
		$ttop.= "<table width=\"100%\"><tr><td width=\"15%\" class=heaad>".$depot["tx"]['he_titlename']."</td>";
		$ttop.= "<td class=heaad width=\"15%\">".$depot["tx"]['he_par']."</td>";
		$ttop.= "<td class=heaad width=\"15%\">".$depot["tx"]['he_content']."</td>";
		$ttop.= "<td class=heaad  width=\"8%\">".$depot["tx"]['he_ischild']."</td>";
		$ttop.= "<td class=heaad  width=\"8%\">".$depot["tx"]['he_visible']."</td></tr>";

	
		$ttop.= "<tr><td class=tdrow><INPUT type=text name=title style=\"width:200px;\" value=\"".htmlspecialchars($q1['title'])."\"></td>";
	
		$ttop.= "<td class=tdrow><INPUT type=text name=idword style=\"width:200px;\" value=\"".trim($q1['wkey'])."\"></td>";
		
		$cont=array("1",$depot["tx"]['he_my_cont'],"2",$depot["tx"]['he_ch_cont']);
		$par['content']=$q1['content'];
		$ttop.= '<td class=tdrow>'.bd_popup($cont,"content", "width:200px;","","").'</td>';

		
		$ttop.= "<td class=tdrow>";
		$ttop.="<input type='checkbox' value='1' name=haschild ";
		if ($q1['haschild']) $ttop.='checked';
		$ttop.="></td>";
		
		$ttop.= "<td class=tdrow>";
		$ttop.= "<input type='checkbox' value='1' name=visible ";
		if ($q1['visible']) $ttop.='checked';
		$ttop.="></td>";
		$ttop.="</tr><tr><td style='text-align:center !important;' height=50 colspan=4 >";
		$ttop.="<input type=hidden name=id value=".$q1['idword'].">";
		$ttop.="<input type=hidden name=old_wkey value=".$q1['wkey'].">";
	
	} else if ($par['sudir']=='gosavechange'){

		if (!isset($par["haschild"])) $par["haschild"]=0;
		if (!isset($par["visible"])) $par["visible"]=0;
		$full_path=get_full_path($par["id"]);
        $res_ = conn_sql_query("UPDATE ".TREE." SET
		title=\"".conn_real_escape_string(stripslashes($par["title"]))."\",
		wkey=\"".conn_real_escape_string(stripslashes($par["idword"]))."\",
		haschild=\"".trim($par["haschild"])."\",
		visible=\"".trim($par["visible"])."\",
		content=\"".trim($par["content"])."\",
		fullpath=\"".conn_real_escape_string(stripslashes($full_path))."\",
		lng=\"".$par['lang']."\" WHERE idword=\"".$par["id"]."\"
		") or die(conn_error());
	
		if (conn_affected_rows($res_)) {
			$depot['oks'][]=$depot["tx"]['ok_edited'];
			freecache(2);
		}
		else {
			$depot['errors'][]=$depot["tx"]['al_edited'];
		}

		/* �������� � ��� �������  */

		
		
		if($par['idword'] !== $par['old_wkey']) {
			$sq_d=conn_sql_query("SELECT * FROM ".TREE." WHERE FIND_IN_SET('".$par['old_wkey']."',fullpath)>0") or die(conn_error());
			for ($i=0;$i<conn_sql_num_rows($sq_d);$i++){
				$ress=conn_fetch_assoc($sq_d);
				$full_path=get_full_path($ress["idword"]);
				conn_sql_query("UPDATE ".TREE." SET fullpath = \"$full_path\" WHERE id = \"".$ress['id']."\"");
			}
		}

		
		if (@$i){
			$depot['oks'][]=$i." ".$depot["tx"]['ok_editedchilds'];
		} else {
			$depot['oks'][]=$depot["tx"]['al_editedchilds'];
		}
		$par['su']='v';
		return cat_view();
	}


	$ttop.= "
	<input type=button value=\"".$depot["tx"]['bt_savechanges']."\" id=submt  onClick=\"sbm('','','gosavechange')\">
	<input type=hidden name=act value=\"tree\">
	<input type=hidden name=su value=\"edit\">
	<input type=hidden name=lang value=\"".$par['lang']."\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=id value=\"".$par['id']."\"></td></tr></table>";
	return $ttop;
}



function get_subtree($idword){
	global $a,$b,$previndex, $depot;
	$a=array();
	$b=array();
	$previndex=array(0);
	$sql1=conn_sql_query("SELECT * FROM ".TREE." WHERE idword=\"".$idword."\"") or die(conn_error());

	if (!conn_sql_num_rows($sql1)) return;

	$cu=conn_fetch_array($sql1);
	$a[$idword][]=$cu;

	$sql=conn_sql_query("SELECT * FROM ".TREE." WHERE level > \"".$cu['level']."\" ORDER BY level,id");

	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$s=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		$a[$s['parentword']][]=$s;
	}
		

	reverse($idword);

	
}



function cat_del(){
	global $par,$errors,$oks,$b, $depot;
	$ttop='';
	//
	get_subtree($par['id']);
	foreach ($b as $cat){
        $res_ = conn_sql_query("DELETE FROM ".TREE." WHERE idword=\"".$cat['idword']."\"");
		if (conn_affected_rows($res_)) {
			$depot['oks'][]=str_repeat(" - &raquo; ", ($cat['level']-1)).stripslashes($cat['title']);
		} else {
			$depot['errors'][]=$depot["tx"]["al_del1"].stripslashes($cat['title']);
		}
	}
	
	if (count($oks)) array_unshift($depot['errors'],$depot["tx"]['ok_del']); 
	else array_unshift($depot['errors'],$depot["tx"]['al_norecs']."<br><br>"); 
	freecache(2);
	$ttop.=cat_view();
	return $ttop;
}

function move_record(){
	global $par,$errors,$oks, $depot;
	$sql=conn_sql_query("SELECT parentword FROM ".TREE." WHERE idword=\"".$par['id']."\"");
	$curr_par=conn_fetch_row($sql);
	 
	$sql=conn_sql_query("SELECT * FROM ".TREE." WHERE parentword=\"".$curr_par[0]."\" AND lng = \"".$par['lang']."\" ORDER BY id");
	$same_home=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$same_home[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}

	$j=0;
	foreach($same_home as $radio){
		if ($radio["idword"] == $par["id"]){
			break;
		}
		$j++;
	}

	if ($par['su']=="moveup"){
		if (!isset($same_home[($j-1)])){
			$depot['errors'][]=$depot["tx"]['al_topbranch'];
			return;
		}
		$old=$same_home[($j-1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["title"],$depot["tx"]["ok_movedup"]);
			
	
	} else if ($par['su']=="movedown"){
	
		if (!isset($same_home[($j+1)])){
			$depot['errors'][]=$depot["tx"]['al_lowbranch'];
			return;
		}
		$old=$same_home[($j+1)];
		$new=$same_home[$j];
		$depot['oks'][]=str_replace("{|thevar|}",$new["title"],$depot["tx"]["ok_moveddown"]);

	} else {
		return;
	}
	conn_sql_query("UPDATE ".TREE." SET id=0 WHERE idword=\"".$old["idword"]."\"");
	conn_sql_query("UPDATE ".TREE." SET id=\"".$old["id"]."\" WHERE idword=\"".$new["idword"]."\"");
	conn_sql_query("UPDATE ".TREE." SET id=\"".$new["id"]."\" WHERE idword=\"".$old["idword"]."\"");
	freecache(2);
	return;
}


/*#############################################################################################################*/


function cat_clean(){
	global $par,$errors,$oks, $depot;
	$ttop='';
	$sql=conn_sql_query("SELECT MAX(level) FROM ".TREE) or die(conn_error());
	$max=conn_fetch_row($sql);
	$idwords=array();

	for ($i=2;$i<=$max[0];$i++){
			$inarray=array();
			$list_sql=conn_sql_query("SELECT idword FROM ".TREE." WHERE level=\"".($i-1)."\"");
			for ($j=0;$j<conn_sql_num_rows($list_sql);$j++){
				$wd = conn_fetch_row($list_sql);
				if (!in_array($wd[0],$idwords)) 
					$inarray[]="'".$wd[0]."'";
			}

			$list=implode(",",$inarray);
			if ($list){
				$ee="SELECT idword FROM ".TREE." WHERE parentword NOT IN (".$list.") AND level=$i";
			} else {
				$ee="SELECT idword FROM ".TREE." WHERE level=$i";
			}
			$broken_sql=conn_sql_query($ee);// or die($ee."<br>".$i);

			if (conn_sql_num_rows($broken_sql)){
				for ($g=0;$g<conn_sql_num_rows($broken_sql);$g++){
					$pw=conn_fetch_row($broken_sql);
					$idwords[]=$pw[0];
				}
			}

	}
	
	if ($par['su']=='clean'){
		$ttop="<div>";
		if (count($idwords)){
			foreach ($idwords as $e){
				$ttop.=$e."<br>";
			}
		} else {
			$depot['errors'][]=$depot["tx"]["al_nobind"];
			return cat_view();
		}
		$ttop.="<div style=\"text-align:center;\"><input type=button name=su5 value=\"CLEAN\" class='submit' onClick=\"cl();\">
			<input type=hidden name=act value=\"tree\">
			<input type=hidden name=su value=\"\">
			<input type=hidden name=par value=\"".$par['id']."\"></div></div>";
		return $ttop;
	} else {
		$deleted=0;
		foreach  ($idwords as $e) {
            $res_ = conn_sql_query("DELETE FROM ".TREE." WHERE idword=\"".$e."\"");
			if (conn_affected_rows($res_)>0){
				$depot['oks'][]="$e deleted ...";
				$deleted++;
			} else {
				$depot['errors'][]="Problem deleteing $e ...";
			}
		}
		
		$depot['oks'][]="------------------------------------";
		$depot['oks'][]="Table cleaned successfully. $deleted categories/products deleted.";
		freecache(2);
		return cat_view();
	}
}


/*#############################################################################################################*/


function get_full_path($idword){
	$pat_arr=array();
	//$parent_word=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".CATS." WHERE idword = \"".$idword."\""));
	//$pword=$parent_word['parentword'];
	while ($idword <> "0"){
		$parent_word=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".TREE." WHERE idword = \"".$idword."\""));
		array_unshift($pat_arr,$parent_word['wkey']);
		$idword=$parent_word['parentword'];
	}
	return implode(",",$pat_arr);
	
}


/*#############################################################################################################*/



function get_full_path1($idword){
	global $par;
	$pat_arr=array();
	//$parent_word=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".CATS." WHERE idword = \"".$idword."\""));
	//$pword=$parent_word['parentword'];
	while ($idword <> "0"){
		$parent_word=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".TREE." WHERE idword = \"".$idword."\""));
		array_unshift($pat_arr,array($parent_word['title'],$parent_word['idword']));
		$idword=$parent_word['parentword'];
	}
	array_unshift($pat_arr,array('root','0'));
	$ttop="<img src='img/arr.gif'>";
	foreach ($pat_arr as $k){
		if ($par['curr_par_id'] !== $k[1]) 
		$ttop.="<a href='' onClick = \"return sbmt('curr_par_id','".$k[1]."')\">".$k[0]."</a> / ";
		else $ttop.="<b class=currb>".$k[0]."</b>";
	}
	return $ttop;
}



/*#############################################################################################################*/



function tree_content(){
	global $par;
	
	$def=array("n0",iho('........... ������� ...........'));
	$sql1=conn_sql_query("SELECT pattid,pattname FROM ".PATT." ORDER BY pattname");
	
	for($i=0;$i<conn_sql_num_rows($sql1);$i++){
		$res=conn_fetch_assoc($sql1);
		$def[]=$res['pattid'];
		$def[]=$res['pattname'];
	}

	$def[]="n1";$def[]=" ";$def[]="n2";$def[]=iho('........... ����˲ ...........');
	$sql2=conn_sql_query("SELECT modpar,modname FROM ".MODS." ORDER BY modname");
	for($i=0;$i<conn_sql_num_rows($sql2);$i++){
		$res=conn_fetch_assoc($sql2);
		$def[]=$res['modpar'];
		$def[]=$res['modname'];
	}
	
	$def[]="n1";$def[]="************************************************************";$def[]="htm";$def[]=iho('³����� �������');
	$pageset_sql=conn_fetch_assoc(conn_sql_query("SELECT id,pattpars,title FROM ".TREE." WHERE idword = \"".$par['id']."\""));
	$pageset=unserialize(stripslashes($pageset_sql['pattpars']));
	
	if (!isset($par['proceedpatt'])) {
		if (!is_array($pageset)) return addset_content($pageset_sql,$def); 
		else {
			foreach($pageset as $k=>$v){
				$par['par_'.$k] = $v;
				

				if ($v=='htm'){
					//echo "SELECT * FROM ".FREE." WHERE fid = \"".$k.$par['id']."\"";
					$free=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".FREE." WHERE fid = \"".$k.$par['id']."\""));
					$par['htm_'.$k.$par['id']]=htmlspecialchars(stripslashes($free['content']));
				}
				
			}
			$par['proceedpatt']=1;
			return addset_content($pageset_sql,$def);
		}
	} else {
		return addset_content($pageset_sql,$def);
	}
}



/*#############################################################################################################*/


function addset_content($pg,$drops){
	global $par,$pattlist,$pattlist1,$pattset,$depot;
	$ttop='';
	$pattlist=$pattlist1=array();


	
	$found_var=1;
	$a_patt='main';
	if (!isset($par['proceedpatt'])) {
		$ttop.= "<h2>".$depot["tx"]['he_page_str']." <span style='color:#FFF;size:24px;background:#C00;padding:2px 5px;'>".$pg['title']."</span></h2>";
		$ttop.="<div class=notice>".iho("������ ������ � ����� ���������")."</div><br>";
		$ttop.=bd_popup($drops,'par_main','width:400px',1,'onChange = "proceed_patt(\'main\')"');
	} else {

		$pattlist[]=array('main',1,0);
		$pattlist1[]=array('main',1,0);
		get_tpl_local();
		if (isset($par['savepatt'])) {
			if (save_patt($par['id'],$pattset)) return cat_view();	
		}
		$ttop.= "<h2>".$depot["tx"]['he_page_str']." <span style='color:#FFF;size:24px;background:#C00;padding:2px 5px;'>".$pg['title']."</span></h2>";


		$ttop.="<table width=100%><tr><td class=heaad width=70%>".iho("������ �������")."</td><td class=heaad width=30%>".iho("���������")."</td></tr>";
		$no_unset=1;
		foreach ($pattlist1 as $v){
			if (in_array($pattset[$v[0]],array('n0','n1','n2')) || $pattset[$v[0]] == 'unset') $no_unset=0;
			$ttop.="<tr><td class=bord style=\"padding-left:".(($v[1]-1)*20+10)."px;background-image: url(img/ruler.gif);background-position: ".(($v[1]-1)*20-80)." -3px; background-repeat:no-repeat;\">";
			$ttop.=bd_popup($drops,'par_'.$v[0],'width:400px',1,'onChange = "proceed_patt(\''.$v[0].'\')"')."</td>";
			$ttop.="<td class=bord ><b>".$v[0]."</b></td></tr>";

			if ($pattset[$v[0]] == 'htm'){
				$ttop.="<tr><td class=bord style=\"padding-left:".(($v[1])*20+10)."px;background-image: url(img/ruler.gif);background-position: ".(($v[1])*20-80)." -3px; background-repeat:no-repeat;\" colspan=2>".bd_tar(@$par['htm_'.$v[0].$par['id']],'htm_'.$v[0].$par['id'],'800px','300px','','')."
				
				<script language=\"javascript1.2\">
				  CKEDITOR.replace( 'htm_".$v[0].$par['id']."');
				</script>

				</td></tr>";
			}
		}
		$ttop.="</table>";
		if ($no_unset) {
			$ttop.=
			metaBlock().	
			"<br><br><input name=savepatt type=submit value=\"".$depot["tx"]["bt_proceed"]."\"  id=submt>";
		}
	}

	$ttop.="<input type=hidden name=proceedpatt value='1'>";
	$ttop.="<input type=hidden name=su value='content'>";
	$ttop.="<input type=hidden name=currpatt value=''>";
	$ttop.="<input type=hidden name=lang value='".$par['lang']."'>";
	$ttop.="<input type=hidden name=id value='".$par['id']."'>";
	return $ttop;
	
}


function metaBlock(){
	global $par,$lngs;
	
	$language=$lngs[$par['lang']][1];
	$sql=conn_sql_query("SELECT * FROM ".METAS." WHERE page=\"".$par['id']."\"");
	//echo "SELECT * FROM ".METAS." WHERE page=\"".$par['id']."\"";
	$all=conn_fetch_array($sql, PDO::FETCH_ASSOC);

	if (!isset($par['linkname_'.$language]))	$par['linkname_'.$language] =  $all['linkname_'.$language];
	if (!isset($par['title_'.$language]))	$par['title_'.$language] =  $all['title_'.$language];
	if (!isset($par['descr_'.$language]))	$par['descr_'.$language] =  $all['descr_'.$language];

	$ttop="
			<br><br><h2>".iho('���� ���')."</h2>
			<table width=100%>
				<tr>
					<td colspan=3></td>
				</tr>

				<tr>
					<td width=30% class=heaad> 
						 ".iho('���������� ����')."
					</td>

					<td width=30% class=heaad>
						".iho('��������� ������� (TITLE)')."
					</td>

					<td width=40% class=heaad>
						".iho('�������� ���� (DESCRIPTION)')."
					</td>
				</tr>


				<tr>
					<td valign=top> 
						 ".bd_tf(@$par['linkname_'.$language],'linkname_'.$language,'text','width:95%','','')."
					</td>

					<td>
						".bd_tar(@$par['title_'.$language],'title_'.$language,'95%','80px','','')."
					</td>

					<td>
						".bd_tar(@$par['descr_'.$language],'descr_'.$language,'95%','80px','','')."
					</td>
				</tr>

			</table>
	";
	return $ttop;
}


/*#############################################################################################################*/



function changeset_content($pgset,$drops){
	global $par;
	$ttop='';
	$ttop.= "<h2>".$pgset['title']."</h2>";
	$ttop.="<div class=notice>".iho("������ ������ � ����� ���������")."</div><br>";
	$ttop.=bd_popup($drops,'main','width:400px',1,'');
	return $ttop;
	
}



/*#############################################################################################################*/



function get_tpl_local(){

	global $depot,$pattlist,$pattset,$pattlevel,$pattlist1,$par;

	$te=array_shift($pattlist);
	if (isset($par["par_".$te[0]])) $aa_pt =  $par["par_".$te[0]] ; else $aa_pt = '';
	$outy=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".PATT." WHERE pattid = \"".$aa_pt."\""));
	
	if (isset($par['par_'.$te[0]])) $pattset[$te[0]] = $par['par_'.$te[0]]; else $pattset[$te[0]] = 'unset';
	preg_match_all($depot['vars']['default_pattern_man'], $outy['patternbody'], $matches, PREG_SET_ORDER);	
	
	$mt=array();
	if(count($matches)) {
		$level=$te[1]+1;
		for ($i = 0; $i < count($matches); $i++) {
			$pattlist[]=array($matches[$i][1],$level,$te[0]);
			$mt[]=array($matches[$i][1],$level,$te[0]);
		}

		$tempo=array();
		$tempo=$pattlist1;
		$pattlist1=array();
		$gotit=0;
		foreach ($tempo as $v){
			$pattlist1[]=$v;
			if ($v[0] == $te[0])  {
				foreach ($mt as $v1){
					$pattlist1[]=$v1;
				}
				
			}
		}
	} 

	if (count($pattlist1)>40) {
		$depot['errors'][]='Wrong parameter';
		return;
	}

	if($pattlist) get_tpl_local();
}


/*#############################################################################################################*/



function save_patt($id,$set){
	global $errors,$oks,$par;
	conn_sql_query("UPDATE ".TREE." SET pattpars = \"".sqller(serialize($set))."\" WHERE idword = \"".$id."\"") or die(conn_error());
	updateMetas($id);
	foreach ($set as $k=>$v){
	
		if ($v == 'htm'){	
				conn_sql_query("
								REPLACE ".FREE." 
								SET fid=\"".sqller($k.$id)."\",
								content = \"".sqller($par['htm_'.$k.$id])."\"
				
				") or die(conn_error());
		}
	}


	if (!conn_error()) {
		$depot['oks'][]='Ok';
		freecache(3);
		return true; 
	}
	else {
		$depot['errors'][]='error '.$id;
		return false;
	}
}


function updateMetas($pageid){
	global $par,$lngs;	
	$language=$lngs[$par['lang']][1];

	conn_sql_query("REPLACE INTO ".METAS." SET 
						page = \"".conn_real_escape_string(stripslashes($pageid))."\",
						linkname_".$language."	= \"".puttodb($par["linkname_".$language],$language)."\", 
						title_".$language."		= \"".puttodb($par["title_".$language],$language)."\", 
						descr_".$language."		= \"".puttodb($par["descr_".$language],$language)."\"") or die(conn_error());
	freecache(2);
}

?>
