<?

function tplSearchValue(){
	global	$par,$depot;

	if (isset($par['q']) && trim($par['q'])) {
		$arr['searchvalue']= htmlspecialchars(addslashes($par['q']));
		$script='<script type="text/javascript">allowSearch=true;</script>';
	} else {
		$arr['searchvalue']= $depot['lxs']['searchvalue'];
		$script='';
	}
	return parse_local($arr,'searchform',1);
}

function getRubrics(){
	return getCats(1);
}

function getRegions(){
	return getCats(3,'region');
}

function getCats($catID,$url=''){
	global $par,$depot;
	$rubric=array();
	$zclass='';
	if (!isset($depot['cats'])){
		$sql_str="
			SELECT * 
			FROM ".CATS." 
			WHERE lng = \"".$depot['vars']['langid']."\" 
			AND isvis=1
			AND cattype <> 2
			ORDER BY orderid
		";
		$sql=sqlquery_cached($sql_str,1000,4);

		foreach ($sql as $res){
			$depot['cats'][$res['id']]=$res;
			$depot['catss'][$res['param'].$res['cattype']]=$res['id'];
		}
	}

	foreach ($depot['cats'] as $v){
		if ($catID != $v['cattype']) continue;
		$class='';
		switch ($catID){
			case 1:
				if (isset($par['rubric_id']) && $par['rubric_id'] == $v['param'] && $par['rubric_id'] <>'0') $class=' class="active"';
				$rubric['items'][]=array(
					'link'		=>	"https://".$depot['vars']['domain'].$depot['vars']['language_link'].$v['param'].'/',
					'class'		=>	$class,
					'caption'	=>	mb_strtoupper(getfromsql($v['title'],$par['lng']),"UTF8")
				);
			break;

			case 3:
				if (isset($par['region_id']) && $par['region_id'] == $v['param'] && $par['region_id'] <>'0') $class=' class="active"';
				$rubric['items'][]=array(
					'link'		=>	"https://".$depot['vars']['domain'].$depot['vars']['language_link'].$url.'/'.$v['param'].'/',
					'class'		=>	$class,
					'caption'	=>	mb_strtoupper(getfromsql($v['title'],$par['lng']),"UTF8")
				);
			break;
		}
	}
	/*LAST ITEM*/
	$rubric['items'][(count($rubric['items'])-1)]['class']='  class="mr0"';
	return parse_local($rubric,'rubricmenu',1);
}



function loginForm(){
	global $depot;
	$logtolocation="";
	if ($_SERVER['REQUEST_URI'] !== "/")
		$logtolocation='https://'.$depot['vars']['domain'].$_SERVER['REQUEST_URI'];
	else
		$logtolocation='https://'.$depot['vars']['domain']."/myaccount/";

	if (!authenticated())
	return "
		<a href=\"https://".$depot['vars']['domain']."/login/?logtolocation=".base64_encode($logtolocation)."\"  class=\"svlink myacc\">
			<svg version=\"1.1\" id=\"itw\" xmlns=\"https://www.w3.org/2000/svg\" xmlns:xlink=\"https://www.w3.org/1999/xlink\"  viewBox=\"0 0 35 35\"  xml:space=\"preserve\" >
				<use xlink:href=\"/im/svglib.svg#login\"></use>	
			</svg>
		</a>
		";

	else return "
		<a href='https://".$depot['vars']['domain']."/?logout=now' class='svlink' style='text-align:center;line-height:41px;color:#FFF'>x</a>
		<a href=\"https://".$depot['vars']['domain']."/myaccount/\"  class=\"svlink\">
			<svg version=\"1.1\" id=\"itw\" xmlns=\"https://www.w3.org/2000/svg\" xmlns:xlink=\"https://www.w3.org/1999/xlink\"  viewBox=\"0 0 35 35\"  xml:space=\"preserve\" >
				<use xlink:href=\"/im/svglib.svg#login\" style=\"fill:#00ccff\"></use>	
			</svg>
		</a>
					
	";
}




function imageRow($i,$uniquetemp,$dbData=array(),$ifmain=true){
	global $depot,$par;


	if (count($dbData)){

		if ($dbData['ismain']) $par['mainimage'] = $dbData['id']; 

		$image="<a href='/media/avatars/".$dbData['filename']."?ts=".time()."' target='_blank' class='tmbhold'><img class='tmb' src='/media/avatars/".$dbData['filename']."?ts=".time()."' /></a>";

		
		$titles_array=array();
		foreach ($depot['vars']['langs'] as $lang=>$langarr){
			
			$titles_array[$lang] = $dbData['title_'.$lang];

		}
		
		$phoinfo=getPhotoInfo($i,$titles_array,$dbData['id']);


		/*$radio=bd_radio('mainimage',$dbData['id']);*/

		if ($ifmain) $radio="<input type='hidden' name='mainimage' value='".$dbData['id']."'>";
		else $radio='';


		$takenfield=$dbData['id'];
		$delete_button="<a href=\"\" onClick=\"getA('act=remprodimg&index=$i&id=".$dbData['id']."',false,true);return false;\"  id=butt class=del ></a>";
	
	} else {
		
		list($image,$radio,$takenfield,$delete_button,$phoinfo)=array('<img src="/im/noimage.jpg">','',0,'','');

	}

	$delbutt="<div id='operation$i'>$delete_button</div>"; 


	return "



			<div id=\"upload_area$i\">$image</div>
			$delbutt
			<!--<input type='hidden' name='putmark$i' value='0'>-->
			<input type='file' name='filename$i' onchange=\"ajaxUpload(this.form,'/apphlp/ajaxuploadfront.php?&amp;index=$i&unique=".$uniquetemp."','upload_area$i',$i); return false;\" style='width:200px;'/ >

			<div id=\"phoinfo$i\">$phoinfo</div>
			<div id='radio$i'>$radio</div>
			<input type='hidden' name='takenimagefield$i' value='$takenfield'>
	
	";
}




function getPhotoInfo($index,$titlepic,$dbID,$department="",$isactive=true){
	global $depot,$par;
	/*IMAGE TITLES*/
	$phoinfo_text=$phoinfo_fields='<div style="width:100%">';
	$langs_=array();
	foreach ($depot['vars']['langs'] as $lang=>$langarr){
		$just_text=($titlepic[$lang]) ? ($titlepic[$lang]) : $depot['lxs']['defaultphototitle'];

		$phoinfo_text.=$just_text;
		$phoinfo_fields.=	"<input type='text' value='".htmlspecialchars($just_text)."' id='title_".$lang.$index."' class='phototextinput'>";
		$langs_[]=$lang;
	}
	$phoinfo_text.="</div>";
	$phoinfo_fields.="</div>";
	$phoinfo="
		<div id='titletext$index' class='phototitlefield' style='display:block'>
			".($isactive ? "<a href=\"\" onClick=\"chngvis('titletext$index','none');chngvis('titlefields$index','block');return false;\"  id='butt' class='edit'></a>" : "")."<div class='phototitle'>
				$phoinfo_text  
			</div>
		</div>

		<div id='titlefields$index' class='phototitlefield'>
			<a href=\"\" onClick=\"savePhotoTitles($dbID,$index,'".implode(',',$langs_)."','$department');return false;\"  id='butt' class=save></a>	  $phoinfo_fields
		</div>
		<div class='clean'></div>
	";
	return $phoinfo;
}


function topThemes(){
	global $par,$depot;


	$sql="
			SELECT ".CATS.".*
			FROM ".CATS."
			/*LEFT JOIN
					(
						SELECT DISTINCT id, theme
						FROM ".NEWS."
						WHERE	approved =1 
						AND		theme>0
						AND		{$depot['mysql_time_factor']} 
						GROUP BY theme
						ORDER BY udate DESC
						
					) AS T1*/
			/*ON ".CATS.".id = T1.theme*/
			WHERE /*T1.theme IS NOT NULL
			AND*/ ".CATS.".isvis =1
			AND ".CATS.".cattype = 2
			LIMIT 5
	";

	
	//if (isset($par['debug'])) echo $sql;

	$themecollection=sqlquery_cached($sql,500,1);
	
	if (!count($themecollection)) return;
	$arr=array();

	foreach ($themecollection as $v){
		$arr['items'][]=array(
								
							"link"	=>	"https://".$depot['vars']['domain'].$depot['vars']['language_link']."topthemes/".$v['param']."/",
							"title"	=>	$v['title']
		);
	}
	return parse_local($arr,"topthemes",1);
}



/*
*
*		BUILD META KEYWORDS
*
*/

function extractKeywords($res){
	global $depot;
	
	if (!isset($depot['filterout'])){
		$r=file($_SERVER['DOCUMENT_ROOT']."/var/tls/filterjunkout.txt");
		foreach ($r as $rr) $depot['filterout'][trim($rr)]=true;
	}


	foreach(array('nheader','nteaser','nbody') as $part){
	
		foreach (explode(" ",cleanJunk($res[$part])) as $wor){
			$wor=trim($wor);
			
			if (!$wor || $wor=="&#13;") continue;
			
			if (isset($depot['filterout'][mb_strtolower($wor,"UTF-8")])) continue;
			if (substr($wor,0,1)=="&") continue;
			
			if (!isset($words[$wor])) $words[$wor]=1;
			else $words[$wor]++;
		}

	}
	arsort($words);
	$words=array_slice($words,0,7); 
	$keys=array();
	foreach ($words as $k=>$v){
		if ($k===0) continue;
		$keys[]=htmlspecialchars($k);
	}

	return implode(", ",$keys);

}


function cleanJunk($str){
	global $depot;
	$str=str_replace("&nbsp;",' ',$str);
	$str=strip_tags($str);
	$pattern=mb_convert_encoding('/[\^\?��\'",\[\]\}\{\\n\\r��\!�\:\(\)*\.(\t+)]/su',"UTF-8");
	$str=preg_replace($pattern,' ',$str);
	$str=str_replace(array('&raquo;','&laquo;','&quot;', '&nbsp;'),'',$str);
	return $str;
}





/*
	##############################  SOCIAL LINKS IN HEADER ###########################
*/


function socialsTop(){
	global $depot;
	return "
		<div class='socials'>
			<a href='http://vkontakte.ru/share.php' class='vc' title='� ".$depot['lxs']['vc']."' target='_blank'  rel='nofollow'><b>".$depot['lxs']['vc']."</b></a>
			<a href='http://www.livejournal.com/update.bml?subject=' class='lj' title='".$depot['lxs']['lj']."' target='_blank'  rel='nofollow'><b>".$depot['lxs']['lj']."</b></a>
			<a href='http://twitter.com/home/?status=' class='tw' title='".$depot['lxs']['tw']."' target='_blank'  rel='nofollow'><b>".$depot['lxs']['tw']."</b></a>
			<a href='http://www.facebook.com/sharer.php?u=' class='fb' title='".$depot['lxs']['fb']."' target='_blank'  rel='nofollow'><b>".$depot['lxs']['fb']."</b></a>
		</div>";

}

/*
	############################## SOCIAL BUTTONS FOR LIKE/REPOST #####################
*/

function socialButtons(){
	global $depot;
	return"
				<div class='socials-items'>
					<div class='socials-items-item' style='height: auto'>

						<div id=\"fb-root\"></div>

						<script>(function(d, s, id) {
							  var js, fjs = d.getElementsByTagName(s)[0];
							  if (d.getElementById(id)) return;
							  js = d.createElement(s); js.id = id;
							  js.src = \"//connect.facebook.net/uk_UA/all.js#xfbml=1&appId=".$depot['secrets']['fb_appId']."\";
							  fjs.parentNode.insertBefore(js, fjs);
							}(document, 'script', 'facebook-jssdk'));
						</script>

						<div class=\"fb-like\" data-href=\"http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']."\" data-send=\"false\"  data-action=\"like\"  data-share=\"true\" data-layout=\"box_count\" data-width=\"140\" data-show-faces=\"false\"></div>
					</div>

					<div class='socials-items-item gooitem'><g:plusone size=\"medium\"></g:plusone></div>


					<div class='socials-items-item twitem'>
						<a href=\"https://twitter.com/share\" class=\"twitter-share-button\" data-lang=\"uk\" data-width=\"88\">Tweet</a>
						<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
					</div>
					
				</div>";

}



function socialButtonsMobile(){
	global $depot;
	return"
		<div class='socials-items-mobile'>
			<div class='socials-items-item' style='height: auto'>

				<div id=\"fb-root\"></div>

				<script>(function(d, s, id) {
					  var js, fjs = d.getElementsByTagName(s)[0];
					  if (d.getElementById(id)) return;
					  js = d.createElement(s); js.id = id;
					  js.src = \"//connect.facebook.net/uk_UA/all.js#xfbml=1&appId=".$depot['secrets']['fb_appId']."\";
					  fjs.parentNode.insertBefore(js, fjs);
					}(document, 'script', 'facebook-jssdk'));
				</script>

				<div class=\"fb-like\" data-href=\"http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']."\" data-send=\"false\"  data-action=\"like\" data-layout=\"button_count\" data-show-faces=\"false\"></div>

			</div>

			<div class='socials-items-item gooitem'><g:plusone size=\"medium\"></g:plusone></div>


			<div class='socials-items-item twitem'>
				<a href=\"https://twitter.com/share\" class=\"twitter-share-button\" data-lang=\"uk\" data-width=\"88\">Tweet</a>
				<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
			</div>
			
		</div>
	";
}


function mediaIcon($newsObj){
	global $par,$depot;
	$html="";
	if ($newsObj['ntype'] == 3 || $newsObj['photo'])	$html.="<em class=\"inline-ico photo\"></em>";
	if ($newsObj['ntype'] == 4 || $newsObj['video'])	$html.="<em class=\"inline-ico video\"></em>";
	return $html;
}

function articleLink($articleObj, $domainNeeded = true){
	global $depot;
	
	$domain = "";
	if ($domainNeeded) {
		if ($depot['article_types'][$articleObj['ntype']] == "blogs") {
			$domain="https://". trim($depot['vars']['subdomain1'],'/');
		} else {
			$domain="https://".trim($depot['vars']['domain'],'/') ;
		}
	}

	$link= $domain.$depot['vars']['language_link'].$depot['article_types'][$articleObj['ntype']]."/".$articleObj['urlkey']."_".$articleObj['id'].$depot['fext'];
	$link = str_replace('///','//',$link);
	return $link;
}


function monthCalendar($year,$month,$link,$addParam,$active){
	global $par,$depot;
	$ttop="";

	$givendate=mktime(0,0,0,$month,1,$year);
	$days=date('t',$givendate);
	$first_wday=date("w",$givendate);
	$last_wday=date("w",mktime(0,0,0,$month,$days,$year));

	
	$crrentMonth=(date("m-Y",$givendate) == date("m-Y",time())) ? true : false;
	$todayDay=(int)date("d",time());


	if ($first_wday==0) {
		$first_wday=6;
	} else $first_wday-=1;


	$week=explode (" ", "mo tu we th fr sa su");
	foreach ($week as $d){
		$class=($d == 'su') ? 'nobdr' : 'nobd';
		$ttop.="<div class=$class>".$depot['lxs'][$d]."</div>";
	}

	for ($i=0;$i<$first_wday;$i++){
		$ttop.="<div class='noord'>&nbsp;</div>";
	}

	for($i=1;$i<=$days;$i++){
		if ($i==$active) $class='class="active"'; else $class='';	

		if ($crrentMonth && $i>$todayDay)
			$ttop.="<p>$i</p>";
		else
			$ttop.="<a href='$link".sprintf('%02d',$i)."/$addParam' $class>$i</a>";
		
	}

	$first_day=$year."-".$month."-01";
	$last_day=$year."-".$month."-".$days;

	return "<div id='calendar'>".$ttop."</div>";
}



function zmocopy(){
	global $depot;
	if ($_SERVER["REQUEST_URI"]=="/") return "<a href='http://zmolo.com' id=\"zmolo\" title='".$depot['lxs']['he_zmolo']."'><img src='/im/zmolo.com.gif' alt='".$depot['lxs']['he_zmolo']."'></a>";
}

function moreMeta(){
	global $depot;
	if ($_SERVER["REQUEST_URI"]=="/") return "<meta http-equiv=\"refresh\" content=\"600\">";
}


function topBanner(){
	global $par;
	$pattern="topBanner";
	if (isset($par['print'])) $pattern.="-print";
	return parse_local(array(),$pattern,1);
}


function nightAd(){
	

	$hour=date("G",time());
	if ($hour < 22 && $hour > 7 ) return;

	return "
			<script async src=\"//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js\"></script>
			<!-- Test 468 -->
			<ins class=\"adsbygoogle\"
				 style=\"display:inline-block;width:468px;height:60px\"
				 data-ad-client=\"ca-pub-1581732686933234\"
				 data-ad-slot=\"2211670122\"></ins>
			<script>
			(adsbygoogle = window.adsbygoogle || []).push({});
			</script>
	";


}



function candyAd(){

	$hour=date("G",time());
	if ($hour > 6 ) return;
	return "
			<span class='clean pt15'></span>
			<script async src=\"//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js\"></script>
			<!-- 336x280 - night -->
			<ins class=\"adsbygoogle\"
				 style=\"display:inline-block;width:336px;height:280px\"
				 data-ad-client=\"ca-pub-1581732686933234\"
				 data-ad-slot=\"9285340122\"></ins>
			<script>
			(adsbygoogle = window.adsbygoogle || []).push({});
			</script>
	";

}
