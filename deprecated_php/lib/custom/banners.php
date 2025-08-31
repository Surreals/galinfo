<?


function getbanner($plid){
	global $par,$depot;
	$ttop='';
	$place=getbannerplace($plid);
	
	if (!$place) return;

	$banners_sql="
					SELECT 
							".BANNERS.".* ,
							".ADMANAGE.".percent,
							".ADMANAGE.".qty, 
							".ADMANAGE.".id AS mid, 
							".ADMANAGE.".ddate, 
							DATE(NOW()) as ndate

					FROM 
							".BANNERS.", 
							".ADMANAGE."
					WHERE 
							".BANNERS.".id =  ".ADMANAGE.".bannerid
					AND		".ADMANAGE.".placeid = \"".$place['id']."\"
					AND		active=1
					AND		(
								(
								".ADMANAGE.".dfrom < NOW()
								AND 
									(
										".ADMANAGE.".dto > NOW() 
										OR 
										".ADMANAGE.".dto =\"0000-00-00 00:00:00\" 
									)
								) OR ".ADMANAGE.".usetimer = 0 
							)";

	$banners_run=sqlquery($banners_sql);
	if (!conn_sql_num_rows($banners_run)) return;
	$opentag=$closetag='';
	

	/*echo conn_sql_num_rows($banners_run)."<br>";*/
	if (conn_sql_num_rows($banners_run)==1){
		$current_banner=conn_fetch_assoc($banners_run);
	} else {
		$in=0;
		$min=0;
		while ($res=conn_fetch_assoc($banners_run)) {
			$index=$res['qty']/$res['percent'];
			if ($in==0) {
				$min=$index;
				$current_banner = $res;
			}
			else {
				if ($index<$min){

					$min=$index;
					$current_banner = $res;
				}
			}

			$in=1;
		}
	}
	
	if ($current_banner['ddate'] !== $current_banner['ndate'])	sqlquery("UPDATE ".ADMANAGE." SET ddate=NOW(), qty=0");

	sqlquery("	UPDATE ".ADMANAGE." 
				SET qty=qty+1 
				WHERE id=\"".$current_banner['mid']."\"
			");

	updateBannerStats($place['id'],2);
	updateBannerStats($current_banner['id'],1);

	//oops
	$tags_SQL="SELECT holdstart, holdend FROM ".ADPLACES." WHERE adid=\"".$place['adid']."\" AND parentid=0";
	if(!$place['holdstart'] && !$place['holdstart']) {
		$tags_run=sqlquery($tags_SQL);
		$tags=conn_fetch_row($tags_run);
	} else {
		$tags=array($place['holdstart'],$place['holdend']);
	}
	
	/*ON SITE*/
	$ttop.=getfromsql($tags[0],0);
	if ($current_banner['btype']==1) { /*if is file based*/
		preg_match('/(.*)(\.swf)$/',$current_banner['bfile'],$mymtch);
		if (isset($mymtch[2])) { /*if is swf*/
			$code=str_replace(
						array('[[filename]]','[[width]]','[[height]]'),
						array(	$current_banner['bfile'].$current_banner['bpar'],
								$current_banner['bwidth'],
								$current_banner['bheight'] ),$depot['default_flash_pattern']);
		} else {
			$style="";
			if ($current_banner['bwidth']) {
				$style.="width:".$current_banner['bwidth']."px;";
			}

			if ($current_banner['bheight']) {
				$style.="height:".$current_banner['bheight']."px";
			}

			if ($style) $style="style=\"$style\"";

			$code="<a href=\"".$current_banner['blink']."\"><img src=\"/var/things/".$current_banner['bfile']."\" $style></a>";
		}

		if ($current_banner['loadtype'] == 1){
			if (!$current_banner['loadcode'])
				$depot['vars']['bannerloaders'][]=jsloader(stripslashes($code),'candyplace_'.$place['adid']);
			else 
				$depot['vars']['bannerloaders'][]=$current_banner['loadcode'];

			$code='';
		}
	} else {
		$code=getfromsql($current_banner['onsitecode'],0);
		if ($current_banner['loadtype'] == 1){

			if (!$current_banner['loadcode']){
				$depot['vars']['bannerloaders'][]=jsloader(stripslashes($code),'candyplace_'.$place['adid']);
				$code='';
			}
			else $depot['vars']['bannerloaders'][]=$current_banner['loadcode'];

			/*$code='';*/
		}
	}
	$ttop.=$code;
	$ttop.=getfromsql($tags[1],0);
	//foreach ($place as $k=>$v) $ttop.= "$k;$v"."<br>";
	return $ttop;
}



function getbannerplace($plid){
	global $par,$depot;
	$sql="SELECT * FROM ".ADPLACES." WHERE adid = \"$plid\" ORDER BY parentid";
	$sql_run=sqlquery($sql);
	$active_place=array();
	$res=array();
	for ($i=0;$i<conn_sql_num_rows($sql_run);$i++){
		$res[]=conn_fetch_assoc($sql_run);
	}


	
	if (!count($res))return false;
	if (count($res)==1){
		return $res[0];
	} else {
		/*FILTER places*/
		$res_filtered0=array();
		foreach ($res as $k){
			if ($k['lang'] == $depot['vars']['langid'][$par['lng']]){
				$res_filtered0[]=$k;
			}
		}

		if (count($res_filtered0)) {
			$res_filtered1=array();
			
			foreach ($res_filtered0 as $k1){
				
				if (!$k1['rubric'] && !$k1['region']) {
					$res_filtered1[0]=$k1;
				} else if($k1['rubric'] || $k1['region']){

					if (@$par['rubric_id'] && in_array(@$par['rubric_id'],explode(',',$k1['rubric']))){
						$res_filtered1[1]=$k1;
					}

					if (@$par['region_id'] && in_array(@$par['region_id'],explode(',',$k1['region']))){
						$res_filtered1[1]=$k1;
					}

				} 
				
			}
			
			if (count($res_filtered1)) {
				if (isset($res_filtered1[0])) return $res_filtered1[0];
				if (isset($res_filtered1[1])) return $res_filtered1[1];
			} else {
				return $res[0];
			}

	
			
		} else {
			return $res[0];
		}
	}
	return false;

}



function updateBannerStats($id,$type){ /*TYPE 1 - banner, 2 - banner place*/
	global $depot;
	if (!acceptibleAgent($depot['agent'])) return;

    $res_ = sqlquery("
				UPDATE ".BANSTATS."
				SET showcount = showcount+1
				WHERE		
						itemid = \"".sqller($id)."\"
				AND
						itemtype = \"".sqller($type)."\"
				AND		
						ddate = DATE(NOW())

	
	");



	if (!conn_affected_rows($res_)>0){
		sqlquery("
				INSERT IGNORE INTO ".BANSTATS."
				SET 
						itemid = \"".sqller($id)."\",
						itemtype = \"".sqller($type)."\",
						ddate = NOW(),			
						showcount=1
	
	");

	}

}


function acceptibleAgent($agent){
	$agents=explode(",","opera,chrome,safari,konqueror,playstation,wii,netscape,windows,msie");
	foreach ($agents as $k){
		if (stristr($agent,$k)) return true;
	}
	return false;

}
?>