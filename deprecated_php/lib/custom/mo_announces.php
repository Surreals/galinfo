<?

function announces(){
	global $par,$depot;
	$html="";
	$placed=0;
	$currdate='crazy';
	$arr=array();
	$addon=$addon1=$addon2='';

	$hd='';
	
	//if (!isset($par['cityid'])) $par['cityid']='lviv';
	/*if (@$par['cityid']) {
		if (!@$depot['catss'][$par['cityid'].'city']) {
			die($par['cityid'].'city');
			err404();
		}
		$addon = " AND FIND_IN_SET(\"".$depot['catss'][$par['cityid'].'city']."\", ".ANNO.".region) ";
		$hd=" / ".$depot['cats'][$depot['catss'][$par['cityid'].'city']]['title'];
	}*/

	if ($par['pphtm']=='print'){
		preg_match("/^(\d{4})\-(\d{2})\-(\d{2})$/sU",@$par['date'],$matches);
		if (count($matches)<4) err404();
		else {
			$addon1=" AND DATE(ddate) = \"".sqller($par['date'])."\" ";
		}
	} else {
		$addon1="AND DATE(ddate) >= DATE(NOW())";
	}
	
	$sql1="	SELECT	id,
					DATE_FORMAT(ddate,'%H.%i.%d.%m.%Y') AS mydate,
					DATE_FORMAT(ddate,'%w') AS wday,
					DATE(ddate) as tdate, 
					gps,
					place,
					announce,
					atext ,
					(ddate<NOW())as gohide,
					notice
			FROM	".ANNO." 
			WHERE 1 /*lang = \"".$depot['vars']['langs'][$par['lng']]['id']."\"*/
					 ".
					$addon.$addon1.$addon2."
			ORDER BY ddate";
			//.$depot['enviro']['news_qty_main'];


	$sql=sqlquery_cached($sql1,0,2);
	


	/*$ss="		SELECT	id,
						param, 
						title 

				FROM ".CATS." 
				WHERE cattype='city' 
				AND isvis = 1 
				AND lng=\"".$depot['vars']['langs'][$par['lng']]['id']."\" 
				ORDER BY orderid
			";

	$style_list=sqlquery($ss);*/

	$path='/announce/';
	$pathprint='/announceprint/';

	/*while ($res = conn_fetch_assoc($style_list)) {
		$styles[$res['param']] = $res;
	}*/
	/*if (isset($par['cityid'])) {
		$addon = " AND city = \"".sqller(@$styles[$par['aid']]['id'])."\"";
		$path.=$par['cityid'].'/';
		$pathprint.=$par['cityid'].'/';
		$hdadd=" / ".sqller(@$styles[$par['cityid']]['title']);
	} else {*/
			$addon="";
			$hdadd="";
	/*}*/
	

	if (count($sql)==0) {
		$depot['errors'][]="<h2>".$depot['lxs']['he_norecords']."<br><br><br></h2>";
	} else {
		$i=1;
		foreach ($sql as $res){
			$datecut="";
			list($hour,$min,$arr['date'],$month,$arr['year'])=explode('.',$res['mydate']);
			//$arr['month'] = $depot['lxs']["mona_".$month];
			
			$pad=" pt30";
			if ($currdate !== $res['tdate']) {
				if ($i==1) {
					$annotitle="<span class='annoheader'>".$depot['lxs']['he_announces']."</span> ";
					$pad="";
				} else $annotitle="";

				$currdate=$res['tdate'];
				$datecut="<span class='clean $pad'></span><header>$annotitle".$depot['lxs']['dw_'.$res['wday']].", ".$arr['date']." ".$depot['lxs']['mona_'.$month].", ". $arr['year']."</header>
						";
			}

			
			//if ($res['nweight']) $class=' class=passed'; else $class='';
			/*	if ($par['pphtm']=='print')
			$arr['date']="<h2>".$arr['date']." ".$arr['month']." ".$arr['year']."</h2>";*/
			//if ($res['gohide']) $class=' class=passed'; else $class='';

			if ($res['notice']) $class=' class="noticed"'; else $class='';
			$style=/*($i%2)?" style='background:#EEE'" : */"";
			
			$googlelink="";

			if ($res['gps']) $googlelink="
					https://maps.google.com/maps?q={$res['gps']}&hl=uk&ll={$res['gps']}&sll={$res['gps']}&t=h&z=16
			";


			$arr['newsline'][]=array(
									'class'		=>	$class,
									'time'		=>	$hour.":".$min,
									'addr'		=>	($res['gps']? "<a href='$googlelink' title='{$res['gps']}' class='annoaddr'>".getfromsql($res['place'],$par['lng'])."</a>" : "<span class='annoaddr'>".getfromsql($res['place'],$par['lng'])."</span>"),
									'announce'	=>	nl2br(getfromsql($res['announce'],$par['lng'])),
									'atext'		=>	trim($res['atext']) ? getfromsql($res['atext'],$par['lng'])."" : "",
									'datecut'	=>	$datecut,
									'style'		=> $style
			);

			$i++;
		}
	}
	
	/*$arr['annomenu']=get_anno_menu($styles);*/
	
	
	/*
	$start="	<div class=\"col-narrow\">
					<h1>".$depot['lxs']['he_announces']."</h1>
					<div id='prevnext-read'>
						".get_anno_menu($styles)."
					</div>
				</div>";*/
	if (@$depot['errors']) $arr['error']=errors();

	if (count($arr)) return parse_local($arr,'announces_list',1);

	//$html.=parse_local($arr1,'_annolist');
	//if ($par['pphtm']=='print') $start='';
	//return $start.$html;
}



function get_anno_menu($res){
	global $par,$depot;
	$t=array();
	
	$depot['vars']['title']=@$depot['lxs']['he_zik']." - ".@$depot['lxs']['he_announces'];
	foreach ($res as $k1=>$k){
		if($k['param'] == @$par['cityid']) {
			$depot['vars']['title']=@$depot['lxs']['he_zik']." - ".@$depot['lxs']['he_announces']." | ".$k['title'];
			$class="class=\"active\"" ;
		} else {
			$class="";
		}
		$t['anal'][]=array(
						'class'		=>		$class,
						'link'		=>		'/'.$par['lng'].'/announce/'.$k['param'].'/',
						'caption'	=>		$k['title']
			);
		
	}
	
	$class=(!(@$par['cityid'])) ? "class=\"active\"" : "";
	$t['anal'][]=array(
						'class'		=>		$class,
						'link'		=>		'/'.$par['lng'].'/announce/',
						'caption'	=>		$depot['lxs']['he_allanno']
			);

	return parse_local($t,'announces_menu','3.0');
}



function annoshort(){
	global $par,$depot;
	$html="";
	$placed=0;
	$currdate='crazy';
	$arr=array();
	$addon = ""/*" AND FIND_IN_SET(\"".$depot['catss']['lvivcity']."\", ".ANNO.".region) "*/;
	
	$sql1="	SELECT	id,DATE_FORMAT(ddate,'%H.%i.%d.%m.%Y') as mydate,place,announce,notice
							FROM	".ANNO." 
							WHERE lang = \"".$depot['vars']['langs'][$par['lng']]['id']."\"
							AND ddate >= NOW() 
							".$addon."
			ORDER BY ddate limit ".$depot['enviro']['qty_anno_homepage'];
			//.$depot['enviro']['news_qty_main'];

	$sql=sqlquery($sql1);

	while ($res = conn_fetch_assoc($sql)){
		
		list($hour,$min,$date,$month,$year)=explode('.',$res['mydate']);
		
		if ($res['notice'])		$class=" class=note";else $class="";

		$arr['item'][]=array(
								'time'		=>	$hour.":".$min,
								'class'		=>	$class,
								'date'		=>  $date,
								"month"		=>	 $depot['lxs']["monas_".$month],
								'header'	=>	getfromsql($res['announce'],$par['lng'])
		);
		
	}
	if (count($arr)) return parse_local($arr,'anno_box',"3.0");
	//$html.=parse_local($arr1,'_annolist');
	return $html;
}