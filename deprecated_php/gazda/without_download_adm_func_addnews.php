<?

global $a,$p,$previndex;
//$js="js_lang";

function aget_center(){
	global $tx,$lngs,$lngs1,$par,$depot;
	$html='';

	$lang_pars=array_keys($lngs1);
	if (!isset($par['lang']) || !isset($lngs1[$par['lang']][0])) $par['lang']=$lang_pars[0];
	$html=lang_js();

	$depot['newsypes']=	array(
		'1',	'Новина',
		'2',	'Стаття',
		'3',	'Фоторепортаж',
		'4',	'Відео',
		'20',	'Блог'
	);

	if (!isset($par['su']) || !trim($par['su'])) $par['su']='add';
	$atype='news';

	if (@$par['articletype'] == 'blog')	{
		$atype='blog';
		if (!require_level('ac_blogs')) return;
	} else {
		if (!require_level('ac_newsadd')) return;
	}



	switch ($par['su']){
		case "view":	$par['hder']=$depot["tx"]["he_".$atype."nopub"];

			$html.=news_view();break;
		case "viewpub":
			$par['hder']=$depot["tx"]["he_".$atype."pub"];
			$html.=news_view();break;
		case "add":
			$par['hder']=$depot["tx"]["he_add".$atype];
			$html.=news_add();break;
		case "edit":
			$par['hder']=$depot["tx"]["he_edit".$atype];
			$html.=news_add();break;
		case "svadd":
		case "svedit":
			$par['hder']=$depot["tx"]["he_add".$atype];
			$html.=news_save();break;
		case "remove":
			$html.=news_del();break;
	}
	$html= "<h1>".@$par['hder']."</h1><hr><form id='ad' name='ad' method=post>".$html;

	$html.= "</form>";
	return $html;

}

/*
*	add news
*/
function news_add(){
	global $par,$b, $tx,  $lngs1,$lngs,$logged_user,$depot;
	$html='';
	$nnow=time();

	$admin=0;
	if (@$par['articletype'] !== 'blog')	{
		if (require_level('ac_newsadmin')){
			$admin=1;
			/*unset($depot['errors']); */
		}
	}

	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'view';

	if ($par['su'] == 'edit') {

		/*		CHECK AVAILABILITY		*/

		$gentNewsSql ="
						SELECT		".NEWS.".*, 
									".NEWSHEAD.".nheader,
									".NEWSHEAD.".nsubheader,
									".NEWSHEAD.".nteaser,
									".NEWSB.".nbody,
									".NEWSMETA.".ntitle,
									".NEWSMETA.".ndescription,
									".NEWSMETA.".nkeywords

						FROM		".NEWS." 
						LEFT JOIN	".NEWSB."		USING		(id)
						LEFT JOIN	".NEWSHEAD."	USING		(id)
						LEFT JOIN	".NEWSMETA."	USING		(id)

						
						WHERE		".NEWS.".id = \"".sqller($par['id'])."\"
				";
		$sql_run=conn_sql_query($gentNewsSql) or die(conn_error());

		$toedit=conn_fetch_assoc($sql_run);

		if (count($toedit)<3) {
			$depot['errors'][]=$depot["tx"]['al_noid'];
			$par['su']=$toview;
			return news_view();
		}


		/*SPECIAL HEADERS*/
		$stoedit=conn_fetch_assoc(conn_sql_query("
					SELECT		".NEWSSLIDEHEAD.".sheader,
								".NEWSSLIDEHEAD.".steaser
								
					FROM		".NEWSSLIDEHEAD." 
					WHERE		id = \"".sqller($par['id'])."\"
			"));

		$headershere=0;

		if (is_array($stoedit)) {
			foreach ($stoedit as $k=>$v){
				$par[$k]=$v;
				$headershere=1;
			}
		}

		/*		CHECK AUTHORITY		*/
		if (!$admin && @$par['articletype'] !== 'blog'){
			if ($toedit['nauthor'] !==  $logged_user['usid']) {
				$depot['errors'][] = $depot["tx"]['al_notmy'];
				$par['su']=$toview;
				return news_view();
			}

			/*		CHECK PUBLISH SETTING   */
			if ($toedit['approved']) {
				$depot['errors'][] = $depot["tx"]['al_nopub'];
				$par['su']=$toview;
				return news_view();
			}
		}

		/*		CHECK BLOCKING		*/
		$blocked = conn_fetch_assoc(conn_sql_query("
		
						SELECT 
								".BLOCKED.".*, 
								".USERS.".uname_ua AS name
						FROM ".BLOCKED." 
						LEFT JOIN ".USERS." 
						ON ".BLOCKED.".nauthor = ".USERS.".id
						WHERE newsid = \"".sqller($par['id'])."\"
							
			"));

		if (count($blocked)>1){
			if ($blocked['endtime'] >$nnow){
				if ($blocked['nauthor'] !== $logged_user['usid']) {
					$depot['errors'][] = $depot["tx"]['al_blocked'].date("i:s",($blocked['endtime']-$nnow))."<br>USER: ".$blocked['name'];
					$par['su']=$toview;
					return news_view();
				}
			} else {
				conn_sql_query("UPDATE ".BLOCKED." SET 
							nauthor = \"".sqller($logged_user['usid'])."\",
							endtime = \"".($nnow+600)."\" 
							WHERE newsid = \"".sqller($par['id'])."\"
						");
			}
		} else {
			conn_sql_query("INSERT INTO ".BLOCKED." SET 
							newsid	= \"".sqller($par['id'])."\",
							nauthor = \"".sqller($logged_user['usid'])."\",
							endtime = \"".($nnow+600)."\"
						") or die(conn_error());
		}


		/*	GET  TAGS*/
		$tags='';
		$sql_tags="
						SELECT GROUP_CONCAT(".TAGS.".tag separator ',') 
						FROM 
							".TAGMAP." LEFT JOIN  ".TAGS." 
							ON tagid = id 
							WHERE newsid = \"".sqller($par['id'])."\" 
						GROUP BY 'newsid'
		";
		$tags_row=conn_fetch_row(conn_sql_query($sql_tags));


		/*		FINALLY		*/
		$do_not_affect=array('lang');
		$awaiting_array=array("region","rubric"/*,"theme"*/);
		foreach ($toedit as $k=>$v){
			if (!in_array($k,$do_not_affect)) {
				if (!in_array($k,$awaiting_array)) {
					$par[$k] = stripslashes($v);
				} else {
					$par[$k] = explode(',',stripslashes($v));
				}
			}
		}

		list($par['year'],$par['month'],$par['day']) = explode("-",$par['ndate']);
		list($par['hour'],$par['min'],$par['sec']) = explode(":",$par['ntime']);
		$par['lang'] =$lngs[$toedit['lang']][1];
		$par['tags']=$tags_row[0];

	} else {

		if (!isset($par['addne']) && $admin) {
			$par['rated']=1;
			$par['approved']=1;
		}

	}

	foreach ($lngs1 as $k=>$v) {
		$l[]=$k;
		$l[]=$v[0];
	}

	//if ($errors) $html.=errors();

	if ($par['su'] == 'add')
		$html.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'onChange = "chng_lang()"');
	else if ($par['su'] == 'edit')
		$html.="<div class=lang>".bd_popup($l,'lang','width:200px;',1,'');


	$html.="</div>";


	$html.=image_maker(@$par['images'],'images');

	$html.="
		<table width=100% cellpadding=5 cellspacing=1>
			<tr>
				<td valign=top>

					<div class=\"tabSwitchers\">
						<a href=\"\" onClick=\"switchTab('headswitcher','headholder',1,3);return false;\" id=\"headswitcher1\" class=\"active\">Основні заголовки</a>
						<a href=\"\" onClick=\"switchTab('headswitcher','headholder',2,3);return false;\" id=\"headswitcher2\">Для TOP БЛОКІВ</a>
						<a href=\"\" onClick=\"switchTab('headswitcher','headholder',3,3);return false;\" id=\"headswitcher3\">Мета дані</a>

					</div>

					<div class=\"clean\"></div>
					<div id='headholder1' class='tabholder'>
						<div style='float:left;width:99%'>
							<label for=nheader class=mn>Заголовок</label>".bd_tar(@$par['nheader'],'nheader','99%','45px',1)."
						</div>

						<!--<div style='float:right;width:39%'>
							<label for=nsubheader>Підзаголовок</label>".bd_tar(@$par['nsubheader'],'nsubheader','99%','45px',1)."
						</div>-->
						<input type='hidden' name='nsubheader' value=''>
						
						<div class='clean'></div>

						<label for=nteaser class=mn>Лід</label>".bd_tar(@$par['nteaser'],'nteaser','99%;','80px',2)."
					</div>

					<div id='headholder2' class='tabholder' style='display:none;'>
						<div style='float:left;width:99%'>
							<label>Заголовок</label>".bd_tar(@$par['sheader'],'sheader','99%','45px',1)."
						</div>
						<div class='clean'></div>
						<!--<label>Лід</label>".bd_tar(@$par['steaser'],'steaser','99%;','80px',2)."-->
						<input type='hidden' name='steaser' value=''>
						<input type='hidden' name='headershere' value='".@$headershere."'>
					</div>

					<div id='headholder3' class='tabholder' style='display:none;background:#FFF9D5'>
						<div style='float:left;width:58%'>
							<label>Title</label>".bd_tar(@$par['ntitle'],'ntitle','99%','45px',1)."
						</div>
						
						<div class='clean'></div>
						<label>Description</label>".bd_tar(@$par['ndescription'],'ndescription','99%;','80px',1)."

						<div class='clean'></div>
						<label>Keywords</label>".bd_tar(@$par['nkeywords'],'nkeywords','99%;','80px',1)."

						<input type='hidden' name='metahere' value='".@$metahere."'>
					</div>

					<br><br>
					<label for=nbody class=mn>Повний текст новини</label>
					<div style='width: 99%'>
						<textarea id=\"nbody\" name=\"nbody\" style=\"height:400px;width:600px;\">".@$par['nbody']."</textarea>
					</div>
				</td>
				<td valign=top width=320 style='background:#F0F0F0;padding:10px;font-size:11px;'>
	";

	if (@$par['articletype'] !== 'blog') {
		$html.="<a href='' onClick='showP(\"imageManagerPopup\");return false;' class='camera'><span id='imageqty'>".$depot['var']['imagesqty']."</span></a>";
	}

	$html.="
		<fieldset style='float:right;width:55%;margin-bottom:5px !important;'><legend>Тип статті</legend>
		".bd_popup($depot['newsypes'],'ntype','width:97%;font-size:11px;',3,'')."
		</fieldset>
		<div class='clean'></div>
	";

	$html.="";
	$sql='SELECT id, title, cattype FROM '.CATS.' WHERE lng="'.$lngs1[$par["lang"]][1].'" ORDER BY orderid';

	$regs=array('0',"...");
	$rubs=array('0',"...");
	$tems=array('0',"...");
	$reviews=array('0',"* * * *");

	$query=conn_sql_query($sql) or die(conn_error());
	for ($i=0;$i<conn_sql_num_rows($query);$i++) {
		$res=conn_fetch_row($query);
		switch ($res[2]) {
			case 3	:	$regs[]=$res['0'];$regs[]=$res['1'];break;
			case 1	:	$rubs[]=$res['0'];$rubs[]=$res['1'];break;
			case 2	:	$tems[]=$res['0'];$tems[]=$res['1'];break;
			case 4	:	$reviews[]=$res['0'];$reviews[]=$res['1'];break;
		}
	}

	if (@$par['articletype'] !== 'blog')
		$themes_list=array();

	$html.="
			<div style='width:48%;float:left;clear:both;margin-bottom:5px;'>
				<fieldset style=''><legend>Рубрики</legend>
					".bd_multipopup($rubs,'rubric','height:140px;width:100%;font-size:11px;overflow:auto;',5,'')."
				</fieldset>
			</div>


			<div style='width:48%;float:right;'>

				<fieldset style=''><legend>Регіон</legend>
					".bd_multipopup($regs,'region','height:85px;width:100%;font-size:11px;overflow:auto;',5,'')."
				</fieldset>

				<fieldset style=''><legend>Тема</legend>
					".bd_popup($tems,'theme','width:100%;font-size:11px;',6,'')."
				</fieldset>

			</div>

			<div class=\"clean\"></div>

			<fieldset style=''><legend>Теги (,)</legend>
				".bd_tar(@$par['tags'],'tags','98%;','40px;font-size:11px !important',7,'onkeydown="ajax_showOptions(this,\'getCountriesByLetters\',event)"')."
			</fieldset>
			<script>addLoadEvent(cancelFFauto);</script>
			<div class=\"clean\"></div>	
	";


	if ($admin && @$par['articletype'] !== 'blog') {

		$sql='SELECT id, uname_'.$par['lang'].' FROM '.USERS.' ORDER BY uname_'.$par['lang'];

		$usrs=array(0,'-----');

		$query=conn_sql_query($sql) or die(conn_error());
		for ($i=0;$i<conn_sql_num_rows($query);$i++) {
			$res=conn_fetch_row($query);
			$usrs[]=$res[0];
			$usrs[]=$res[1];

		}
		if (!isset($par['nauthor'])) $par['nauthor'] = $logged_user['usid'];


		/*ALL USERS*/

		$sqlusers=conn_sql_query("SELECT id,name,services FROM ".FUSERS." WHERE services<>''");
		$users_arr2=array(0," ************ журналісти ");
		$users_arr1=array(0," ************ блогери ");

		while($ures=conn_fetch_assoc($sqlusers)){
			if (in_array(2,explode(',',$ures['services']))){
				$users_arr2[]=$ures['id'];
				$users_arr2[]=$ures['name'];
			}

			if (in_array(1,explode(',',$ures['services']))){
				$users_arr1[]=$ures['id'];
				$users_arr1[]=$ures['name'];
			}
		}
		$users_arr=array_merge($users_arr2,$users_arr1);
		$html.="
				
			<div class='clean pt5'></div>
			<fieldset style=''><legend>Автор</legend>
				<table width=97% cellpadding=0 cellspacing=0 border=0 style='margin-top:0;'>
					<tr>
						<td width=50% style='font-size:11px;'>Редактор:
							".bd_popup($usrs,'nauthor','width:99%;font-size:11px;',3,'')."
						</td>

						<td width=50% style='font-size:11px;'>
							&nbsp;&nbsp;Автор / журналіст:".
			bd_popup($users_arr,'userid','width:99%;font-size:11px;',3,'')."
						</td>
					</tr>

					<tr>
						<td colspan=2 style='font-size:11px;padding-top:5px;'>
							".bd_chk('showauthor','1',8,'')."&nbsp;&nbsp;Відображати інформацію про автора
						</td>
					</tr>
				</table>
			</fieldset>";
	}

	$html.="	
		<div class='clean pt10'></div>
		<div style='float:left;width:49%'>
			<fieldset><legend >Пріоритет статті</legend>
				".bd_popup(
			array(
				0,'Звичайний',
				1,'Важливий',
				2,'ТОП! Слайдшоу'
			),'nweight','width:97%;font-size:11px;',9,'')."
			</fieldset>
		</div>

		<div style='float:right;width:49%'>
			<fieldset><legend >Шаблон</legend>".bd_popup(
			array(
				'0','По замовчуванню',
				'1','Малі фото',
				'2','Фотослайд',
				'3','Фото в тексті/після тексту',
				'10','Без фото'
			),'layout','width:97%;font-size:11px;',9,'')."
			</fieldset>
		</div>	
	";

	if ($admin) {
		$html.="	
			<div class='clean pt10'></div>
	
			<fieldset style=''><legend>Додакові параметри</legend>


			<div style='width:49%;float:left;'>	
				<div class='clean pt10'></div>
				".bd_chk('rated','1',10,'','')."&nbsp;&nbsp;Головна стрічка

				<div class='clean pt5'></div>
				".bd_chk('headlineblock','1',10,'','')."&nbsp;&nbsp;Блок в головній стрічці

				<div class='clean pt5'></div>
				".bd_chk('hiderss','1',11,'','')."&nbsp;&nbsp;<b style='color:red'>НЕ</b> транслювати в RSS
				
				<div class='clean pt5'></div>
				".bd_chk('nocomment','1',11,'')."&nbsp;&nbsp;Заборонити коментарі
				
				<div class='clean pt5'></div>
				".bd_chk('maininblock','1',10,'','')."&nbsp;&nbsp;Головна в блоці рубрик
			</div>	


			<div style='width:49%;float:left;'>	
				
				<div class='clean pt10'></div>
				<select style=\"width:100%\" name=\"idtotop\">
					<option value=0>ID —> TOP</option>
					<option value=1>#1</option>
					<option value=2>#2</option>
					<option value=3>#3</option>
					<option value=4>#4</option>
				</select>

				<div class='clean pt5'></div>
				".bd_chk('suggest','1',10,'','')."&nbsp;&nbsp;Блок ВИБРАНЕ

				<div class='clean pt5'></div>
				".bd_chk('photo','1',10,'','')."&nbsp;&nbsp;Позначати «з фото»

				<div class='clean pt5'></div>
				".bd_chk('video','1',10,'','')."&nbsp;&nbsp;Позначати «з відео»
			</fieldset>
		";
	}

	/*TIME*/
	$hours	=	range(0,23);
	foreach ($hours as $d) {$hour[]=sprintf("%02d",$d);$hour[]=sprintf("%02d",$d);}
	$mins	=	range(0,59);
	foreach ($mins as $d) {$min[]=sprintf("%02d",$d);$min[]=sprintf("%02d",$d);}
	$days	=	range(1,31);
	foreach ($days as $d) {$day[]=sprintf("%02d",$d);$day[]=sprintf("%02d",$d);}

	$mo_tx=explode(" ","mon_jan mon_feb mon_mar mon_apr mon_may mon_jun mon_jul mon_aug mon_sep mon_oct mon_nov mon_dec");
	$month=array();
	for ($i=1;$i<=count($mo_tx);$i++){
		$month[]=sprintf("%02d",$i);
		$month[]=$depot["tx"][$mo_tx[($i-1)]];
	}
	$time=time();
	if (!isset($par['year'])) $par['year']=date("Y",$time);
	$curryear=date("Y",$time);
	$year=array();
	for ($i=($par['year']-1);$i<=($curryear+1);$i++){
		$year[]=$i;
		$year[]=$i;
	}

	$html.="<div class='clean pt10'></div>
				<fieldset style=''><legend>Час публікації</legend>";


	$html.="<div id=\"dateholder\"><table width=97% style='margin:0;'>
				<tr>
					<td width=15%  style='font-size:11px;'>Годин<br>";

	if (!isset($par['hour'])) $par['hour']=date("H",$time);
	$html.=bd_popup($hour,	'hour',	'width:50px;font-size:11px;',	1,	'')."</td>";

	$html.="<td width=15% style='font-size:11px;'>Хвилин<br>";
	if (!isset($par['min'])) $par['min']=date("i",$time);
	$html.=bd_popup($min,	'min',	'width:50px;font-size:11px;',	1,	'')."</td>";

	$html.="<td width=15% style='font-size:11px;'>Число<br>";
	if (!isset($par['day'])) $par['day']=date("d",$time);
	$html.=bd_popup($day,	'day',	'width:50px;font-size:11px;',	1,	'')."</td>";

	$html.="<td width=35% style='font-size:11px;'>Місяць<br>";
	if (!isset($par['month'])) $par['month']=date("m",$time);
	$html.=bd_popup($month,	'month', 'width:100px;font-size:11px;',	1,	'')."</td>";

	$html.="<td width=20% style='font-size:11px;'>Рік<br>";
	$html.=bd_popup($year,	'year', 'width:60px;font-size:11px;',	1,	'')."</td></tr>";

	$html.="
		<tr>
			<td colspan=5>
				<a href='' onClick = 'return updDate(\"last\",\"".sqller($lngs1[$par['lang']][1])."\");' style='display: block;margin: 10px;' title='Час останньої новини'>» Час останньої новини</a>
				<a href='' onClick = 'return updDate(\"lastpub\",\"".sqller($lngs1[$par['lang']][1])."\");'   title='Час останньої опублікованої' style='display: block;margin: 10px; color: #060'>&hearts; Час останньої опублікованої</a>
				<a href='' onClick = 'return updDate(\"server\",\"".sqller($lngs1[$par['lang']][1])."\");'   title='Час на сервері' style='display: block; margin: 10px;'>&curren; Час на сервері</a>
			</td>
		</tr>
	</table>
	</div>
	</fieldset>
	";

	if ($admin) {

		$par['to_twitter'] = !isset($par['twitter_status']) || $par['twitter_status']=='wait';
		$twitter_checkbox = !(isset($par['twitter_status'])&&$par['twitter_status'] == 'published');
		$twitter_text = 'Не опубліковано';
		if(isset($par['twitter_status'])){
			switch($par['twitter_status']){
				case 'wait': $twitter_text = 'Очікує публікації'; break;
				case 'published': $twitter_text = 'Опубліковано'; break;
			}
		}

		$html.="	
			<div class='clean pt5'>
			</div>
			
			<div class=dframe style='background:#0099FF'>
				<div class=bod>
					 ".bd_chk('approved','1',11,'')."&nbsp;&nbsp;&nbsp;&nbsp;<b>Опублікувати на сайті</b>
				</div>
			</div>";

		$html.="
			<div class='clean pt5'>
			</div>

			<div class=dframe style='background:#9BD4FB'>
				<div class=bod>
					 ". ($twitter_checkbox?bd_chk('to_twitter','1',12,''):'<input checked type="checkbox" disabled>')."&nbsp;&nbsp;&nbsp;&nbsp;<b>Опублікувати в Twitter (".$twitter_text.")</b>
				</div>
			</div>";



	}

	$html.="<div class='clean pt10'></div><div class='clean pt10'></div>";

	if ($admin){
		if (@$par['id'])
			$html.="<input type=button name=delne id='submt' value='Видалити' style='margin:10px 0 20px 0px !important;float:right;' onClick=\"JavaScript:r('".$par['id']."')\">";
	}
	$html.="<input type=submit name='addne' id='submt'  class='save' value='Зберегти' style='margin:10px 0 20px !important;float:left;'>";
	if (@$par['id'])
		$html.="<input type=submit name='unlock' value='*' style='margin-left:20px !important;float:left;background:url(/gazda/img/unlock.gif) top left no-repeat;border:none;width:35px;height:39px;'>";




	$html.="</td></tr></table>
			<div name='langlex' id='langlex'></div>
			
			<input type=hidden name=act value=\"".$par['act']."\">
			<input type=hidden name=su value=\"sv".$par['su']."\"><input type=hidden name=id value=\"".@$par['id']."\"><input type=hidden name=par value=\"\">
			<input type=hidden name=oldsu value=\"".@$par['oldsu']."\">
			<input type=hidden name=callback value=\"".@$par['callback']."\">

			<script>
				  CKEDITOR.replace( 'nbody' );

					$('input[name=\"approved\"]').change(function(){
						if(!$(this).is(':checked')){
						 $('input[name=\"to_twitter\"]').prop('checked',false)
						}
					})

			</script>";
	return $html;
}





function unlockNews(){
	global $par,$b, $tx, $oks,$lngs1,$depot,$errors,$logged_user;

	/*		CHECK BLOCKING		*/
	if (check_authority()) {

		conn_sql_query("DELETE FROM ".BLOCKED." WHERE newsid = \"".$par['id']."\"");
		$depot['oks'][]='Новину розблоковано';
	}  else array_unshift($errors,'THERE IS A PROBLEM DELETING RECORD (mo=addnews,fun=news_del)'."<br><br>");

	if (@$par['approved']) $toview='viewpub'; else $toview='view';
	$par['su'] = $toview;
	//foreach ($par as $k=>$v) echo $k."=))".$v."<br>";
	return news_view();

}




/*
##########################################################################

					S    A    V     E

##########################################################################
*/

function news_save(){
	global $par, $tx,$logged_user,$lngs1,$depot;

	if (isset($par['unlock'])) return unlockNews();

	chk_req("nheader",$depot["tx"]['he_nheader']);
	if ( $depot['enviro']['disallow_notags']) {
		chk_req("tags",$depot["tx"]['he_tag']);
	}


	/*if (@$par['articletype'] !== 'blog' && (int)($par['ntype']) !== (int)($depot['newstype']['civilreporter']))
	chk_req("rubric",$depot["tx"]['he_rubric']);*/

	$cachelevel = 1;

	$toview=(@$par['oldsu']) ? $par['oldsu'] : 'view';



	$wrong_tags = [];
	$tags_ids = [];
	if (trim(@$par['tags'])){
		$raw_tags=explode(",",$par['tags']);

		$wrong_tags = [];
		foreach ($raw_tags as $v){
			$v = trim($v);

			if ($v){
				if(require_level('ac_add_tags')){
					conn_sql_query("
							INSERT IGNORE
							INTO ".TAGS."
							SET tag = \"".sqller($v)."\"
					");
				}

				$tag_id_q = conn_sql_query("SELECT	id
							FROM	".TAGS."
							WHERE	tag = \"".sqller($v)."\"");
				$tag_id = conn_fetch_assoc($tag_id_q);

				if($tag_id){
					$tags_ids[] = $tag_id['id'];
				}else{
					$wrong_tags[] = $v;
				}
			}
		}
		if($wrong_tags){
			$depot['oks'][] = "Наступні теги не було додано через відсутність прав: ".implode(', ', $wrong_tags);
		}
		if(empty($tags_ids)){
			$depot['errors'][] = $depot["tx"]['he_tag'];
		}
	}








	if (@$depot['errors']) {
		if ($par['su'] == 'svadd') $par['su'] = 'add'; else $par['su'] = 'edit';
		return news_add();
	}

	$ddate=	$par['year']."-".$par['month']."-".$par['day'];
	$time=	$par['hour'].":".$par['min'].":00";

	//echo $lngs1[$par['lang']][1];return;

	switch ($par['su']) {
		case "svadd":
			$sql=	"INSERT INTO ".NEWS."		SET ";
			$sql2=	"INSERT INTO ".NEWSB."		SET ";
			$sql3=	"INSERT INTO ".NEWSHEAD."	SET ";
			$sql4=	"INSERT INTO ".NEWSSLIDEHEAD." SET ";
			$sql5=	"INSERT INTO ".NEWSMETA." SET ";


			break;
		case "svedit":
			$sql=	"UPDATE ".NEWS."		SET ";
			$sql2=	"UPDATE ".NEWSB."		SET ";
			$sql3=	"UPDATE ".NEWSHEAD."	SET ";
			$sql4=	"UPDATE ".NEWSSLIDEHEAD." SET ";
			$sql5=	"REPLACE ".NEWSMETA." SET ";
			$sql4a=	"INSERT INTO ".NEWSSLIDEHEAD." SET ";

			if (!check_authority()){
				$par['su'] = $toview;
				return news_view();
			}
			break;
	}
	$sql.="
			images		=	\"".sqller($par['selimgs_images'])."\",
			ndate		=	\"".sqller($ddate)."\",
			ntime		=	\"".sqller($time)."\",
			ntype		=	\"".sqller($par['ntype'])."\",
			lang		=	\"".sqller($lngs1[$par['lang']][1])."\",
			layout		=	\"".sqller($par['layout'])."\",
			udate		=	UNIX_TIMESTAMP(CONCAT_WS(' ','".sqller($ddate)."','".sqller($time)."')),
			youcode		=	\"".makeMeYT($par['nbody'])."\",";

	/*RUBRIC*/
	foreach (array('rubric','region') as $v) {
		if (@$par[$v]) {
			$sql.="$v =	\"".sqller(implode(',',$par[$v]))."\",";
		}
	}

	/*THEME*/
	$sql.="theme			=	\"".sqller(@$par['theme'])."\",";

	if (require_level('ac_newsadmin')){
		unset($depot['errors']);
		$sql.="
			nauthor			=	\"".sqller(@$par['nauthor'])."\",
			userid		=	\"".sqller(@$par['userid'])."\",
			nweight		=	\"".sqller($par['nweight'])."\",
			ispopular	=	\"".sqller(@$par['ispopular'] ? 1 : 0)."\",
			";

		foreach (explode(" ","showauthor hiderss rated photo video approved nocomment printsubheader topnews suggest headlineblock maininblock") as $v){

			if (isset($par[$v]))	$sql.="$v		=	\"1\","; else $sql.="$v		=	\"0\",";

		}

	} else {

		$sql.="rated			=	\"1\",";
		$sql.="nauthor			=	\"".sqller($logged_user['usid'])."\",";
	}



	$where='';

	if($par['su'] == 'svedit'){

		$where =" WHERE id = \"".sqller($par['id'])."\"";
	} else {

		/*NEWS PROPERTIES*/
		$sql.="	urlkey		 =	\"".sqller(safeUrlStr($par['nheader']))."\",";
	}


	$sql=substr($sql,0,-1).$where;
    $res_ = conn_sql_query($sql) or die (conn_error());
	$no=0;

	if($par['su'] == 'svadd'){
		if (conn_affected_rows($res_)>0){
			$no=conn_insert_id();

			/*HANDLE NEWS BODIES*/
			$sql2.="	
					id			=	\"".$no."\",
					nbody		=	\"".sqller(replaceWords($par['nbody']))."\"";


			/*HANDLE NEWS HEADERS*/
			$sql3.="	
					id			=	\"".$no."\",
					nheader		=	\"".sqller($par['nheader'])."\",
					nsubheader	=	\"".sqller($par['nsubheader'])."\",
					nteaser		=	\"".sqller(replaceWords($par['nteaser']))."\"";


			/*HANDLE NEWS SPECIAL HEADERS*/
			$sql4.="	
					id			=	\"".$no."\",
					sheader		=	\"".sqller(@$par['sheader'])."\",
					steaser		=	\"".sqller(replaceWords(@$par['steaser']))."\"";

			/*HANDLE NEWS SPECIAL HEADERS*/
			$sql5.="	
					id				=	\"".$no."\",
					ntitle			=	\"".sqller(@$par['ntitle'])."\",
					ndescription	=	\"".sqller(replaceWords(@$par['ndescription']))."\",
					nkeywords		=	\"".sqller(replaceWords(@$par['nkeywords']))."\"
					";

            $res_ = conn_sql_query($sql2);

			if (!(conn_affected_rows($res_)>0)) {
				conn_sql_query("DELETE FROM ".NEWS." WHERE id = $no");
				$depot['errors'][]="Problem adding NEWS body";
				$depot['errors'][]=$depot["tx"]['al_edited'];
				return;
			} else {
				conn_sql_query($sql3);
				$depot['oks'][]="1 ".$depot["tx"]['ok_recordsadded'];

				/*	ADD SPECIAL HEADERS FOR SLIDE BLOCK	*/
				if (@$par['sheader'] || @$par['steaser']) conn_sql_query($sql4);
			}

		} else {
			$depot['errors'][]="Problem adding NEWS information";
			$depot['errors'][]=$depot["tx"]['al_edited'];
			return;
		}
	} else {
		$no=sqller($par['id']);

		$sql2.="	
					nbody		=	\"".replaceWords(sqller($par['nbody']))."\"
					WHERE id = \"$no\"	
					";

		$sql3.="	
					nheader		=	\"".sqller($par['nheader'])."\",
					nsubheader	=	\"".sqller($par['nsubheader'])."\",
					nteaser		=	\"".sqller(replaceWords($par['nteaser']))."\"
					WHERE id = \"$no\"	
					";

		$sql4.="	
					sheader		=	\"".sqller(@$par['sheader'])."\",
					steaser		=	\"".sqller(replaceWords(@$par['steaser']))."\"
					WHERE id = \"$no\"
				";


		$sql4a.="	
					id			=	\"".$no."\",
					sheader		=	\"".sqller(@$par['sheader'])."\",
					steaser		=	\"".sqller(replaceWords(@$par['steaser']))."\"";


		$sql5.="	
					id			=	\"".$no."\",
					ntitle			=	\"".sqller(@$par['ntitle'])."\",
					ndescription	=	\"".sqller(replaceWords(@$par['ndescription']))."\",
					nkeywords		=	\"".sqller(replaceWords(@$par['nkeywords']))."\"
					";


		conn_sql_query($sql2);
		conn_sql_query($sql3);

		if (@$par['sheader'] ||	@$par['steaser']){

			/*HEADERS ALREADY EXIST*/
			if ($par['headershere'])	conn_sql_query($sql4);

			else {
				/*ADD HEADERS*/
				conn_sql_query($sql4a) or die(conn_error());

			}
		}


		/*	META DATA	*/
		if (trim(@$par['ntitle']) || trim(@$par['ndescription']) || trim(@$par['nkeywords']))
			conn_sql_query($sql5);
		else
			conn_sql_query("DELETE FROM ".NEWSMETA." WHERE id	=	\"".$no."\"");



		conn_sql_query("DELETE FROM ".TAGMAP."		WHERE newsid = \"$no\"");
		conn_sql_query("DELETE FROM ".BLOCKED."	WHERE newsid = \"$no\"");
		$depot['oks'][]=$depot["tx"]['ok_edited'];
	}

	foreach ($tags_ids as $tags_id){
		conn_sql_query("
							INSERT
							INTO ".TAGMAP."
							SET
								tagid = \"".$tags_id."\",
								newsid=\"$no\"
					") or die(conn_error());
	}


	/*	copy newsid to top container*/
	if (@$par['idtotop']) {
		sqlquery("UPDATE ".SPECIALIDS." SET newsid = $no where id= \"".sqller($par['idtotop'])."\"");
	}

	freecache($cachelevel);

	if(isset($par['to_twitter']) && $par['to_twitter']){
		sqlquery("UPDATE ".NEWS." SET twitter_status = 'wait' where twitter_status<>'published' AND  id=".$no);
	};

	if($par['su']=='svedit' && !isset($par['to_twitter'])){
		sqlquery("UPDATE ".NEWS." SET twitter_status = 'not_published' where twitter_status<>'published' AND  id=".$no);
	};

	if (@$par['approved']) $toview='viewpub'; else $toview='view';
	$par['su'] = $toview;
	//foreach ($par as $k=>$v) echo $k."=))".$v."<br>";

	if (@$par['callback']) header("Location: ".$par['callback']."\n");
	else return news_view();

}



function toTwitter($news_id){
	global $depot;
	$article_q = sqlquery("SELECT * FROM ".NEWS." LEFT JOIN ".NEWSHEAD." USING(id) where id=".$news_id);
	$article = conn_fetch_assoc($article_q);
	if($article){
		require_once 'libs/codebird.php';
		\Codebird\Codebird::setConsumerKey($depot['enviro']['twitter_api_key'], $depot['enviro']['twitter_api_s_key']);
		$cb = \Codebird\Codebird::getInstance();
		$cb->setToken($depot['enviro']['twitter_access_token'],$depot['enviro']['twitter_access_s']);


		$twit_images = [];
		$images=get_selected_images($article['images']);
		if($images){
			$image = "http://".$depot['vars']['domain'].'/media/gallery/full/'.$images[0]['filename'];
			try {
				$reply = $cb->media_upload([
					'media' => $image
				]);
				if($reply->httpstatus=='200'){
					$twit_images[]=$reply->media_id_string;
				}

			} catch (Exception $e) {
				//$depot['oks'][] = "Помилка завантаження зображення в твіттер";
			}
		}

		$twit = [
			'status' => $article['nheader'].' '.articleLink($article,true),
		];

		if($twit_images){
			$twit['media_ids'] = implode(',',$twit_images);
		}


		$reply = $cb->statuses_update($twit);


		if($reply->httpstatus!='200'){
			$errors = [];
			foreach($reply->errors as $error){
				$errors[] = $error->message;
			}
			$errors = $errors?' ('.implode(' | ',$errors).')':'';
			$depot['oks'][] = "Помилка публікації в твіттер".$errors;
		}else{
			sqlquery("UPDATE ".NEWS." SET twittered = 1 where id=".$news_id);
		}
	}
}


function newTheme($theme){
	global $depot,$par;

	require_once("../lib/etc/utfstuff.php");

	/*check if exist*/
	$ishere=conn_fetch_assoc(conn_sql_query("SELECT id FROM ".CATS." WHERE cattype='2' AND title = '".sqller(trim($theme))."'"));
	if (@$ishere['id']) return $ishere['id'];

	/*get last order no*/

	$maxorderid=conn_fetch_row(conn_sql_query("SELECT MAX(orderid) FROM ".CATS." WHERE cattype='2'"));

	$idword=str_replace(array(" ","'","\"","/","\\"),array('-',"","","",""),trim(TranslitAll($theme)));

	conn_sql_query("
		INSERT INTO ".CATS." SET 
		orderid=\"".($maxorderid[0]+1)."\",
		title=\"".	sqller($theme)		."\",
		param=\"".	sqller($idword)	."\",
		cattype=2,
		lng=\"".sqller($depot['vars']['langs'][$par['lang']]['id'])."\",
		isvis=1
	") or die(conn_error());

	return conn_insert_id();


}


/*
##########################################################################

					V    I    E    W

##########################################################################
*/


function news_view(){
	global $tx,$lngs,$lngs1,$par,$logged_user,$depot;
	$html='';
	$admin=0;
	if (require_level('ac_newsadmin')){
		$admin=1;
	}

	$not_published_sql="SELECT COUNT(*) FROM ".NEWS." WHERE approved=0 ";
	if(@$par['articletype'] == 'blog'){
		$not_published_sql.= " AND ntype = \"20\"";
	} else if(!isset($par['articletype'])){
		$not_published_sql.= " AND ntype < 20";
	}
	$not_published=conn_fetch_row(conn_sql_query($not_published_sql));


	$html.="<div class=lang style='margin-top:-55px;height:'>";
	$html.="<table width=150 cellpadding=0 cellspacing=o><tr>";

	if (@$par['articletype'] !== 'blog') {
		$html.="<td width=50><a href='/gazda/?act=".$par['act']."&lang=".$par['lang']."' title='Додати новину'><img src='/gazda/img/bt_add1.gif'></a></td>";
		$backg='#EEE;';
	} else {
		$backg='#CDF1E7';
	}

	$html.="
		<td width=50>
			<a href='/gazda/?act=".$par['act']."&su=viewpub&lang=".$par['lang']."' title='Опубліковані'><img src='/gazda/img/bt_pub.gif'></a>
		</td>
		<td width=50>
			<a href='/gazda/?act=".$par['act']."&su=view&lang=".$par['lang']."' title='Неопубліковані'><img src='/gazda/img/bt_unpub.gif'></a>
		</td>
	</tr>
	</table></div>
	";


	if ($par['su']=='viewpub') $html.="<a href=\"/gazda/?act=".$par['act']."&su=view\" style='float:right;font-size:16px;margin-right:250px;margin-top:-40px;display:inline;position:relative;color:#FFF;background:#E00;padding:5px;'>Неопублікованих: ".$not_published[0]."</a>
	";

	$html.="<div style='padding:5px;background:$backg'>";

	$days	=	range(1,31);
	$day=array(0,"---");
	foreach ($days as $d) {$day[]=sprintf("%02d",$d);$day[]=sprintf("%02d",$d);}

	$mo_tx=explode(" ","mon_jan mon_feb mon_mar mon_apr mon_may mon_jun mon_jul mon_aug mon_sep mon_oct mon_nov mon_dec");
	$month=array(0,"---");
	for ($i=1;$i<=count($mo_tx);$i++){
		$month[]=$i;
		$month[]=$depot["tx"][$mo_tx[($i-1)]];
	}
	$time=time();
	$curryear=date("Y",$time);
	$year=array(0,"---");
	for ($i=($curryear-1);$i<=($curryear);$i++){
		$year[]=$i;
		$year[]=$i;
	}

	$html.="
		<table cellspacing=3>
			<tr>
				<td width=30>
						Дата:
				</td>

				<td>".
		bd_popup($day,	'sday',	'width:50px',	1,	'')."
				</td>

				<td>".
		bd_popup($month,	'smonth', 'width:100px',	1,	'')."
				</td>

				<td>".
		bd_popup($year,	'syear', 'width:60px',	1,	'')."
				</td>
				<td width=30>&nbsp;</td>

				<td width=90>
					Ключове&nbsp;слово:
				</td>

				<td>
				
				".bd_tf(@$par['kwd'],	'kwd','text', 'width:150px',	1,	'')."
				</td>
				
				<td width=30>&nbsp;</td>
			
				
				<td width=60>
					ID&nbsp;Новини:
				</td>
				
				<td>
					".bd_tf(@$par['sid'],	'sid','text', 'width:100px',	1,	'')."
				</td>
				
				<td>
					<a href='' onClick='return clear_form()'>Очистити фільтр</a>
				</td>
				
				<td width=150>";


	foreach ($lngs1 as $k=>$v) {
		$l[]=$k;
		$l[]=$v[0];
	}

	$html.=bd_popup($l,'lang','width:100px;float:right;',1,'onChange = "chng_lang(\''.$par['su'].'\')"');
	$sql='SELECT id, uname_'.$par['lang'].' FROM '.USERS.' ORDER BY uname_'.$par['lang'];

	$usrs=array(0,'-----');

	$query=conn_sql_query($sql) or die(conn_error());
	for ($i=0;$i<conn_sql_num_rows($query);$i++) {
		$res=conn_fetch_row($query);
		$usrs[]=$res[0];
		$usrs[]=$res[1];

	}
	$html.="</td>

				<td width=90>
					Автор статті:
				</td>

				<td>
				
				".bd_popup($usrs,'nauthor','width:99%;font-size:11px;',3,'')."
				</td>
</tr>";




	$sql='SELECT id, title, cattype FROM '.CATS.' WHERE lng="'.$lngs1[$par["lang"]][1].'" ORDER BY orderid';

	$regs=array(0,'-----');
	$rubs=array(0,'-----');
	$tems=array(0,'-----');

	$query=conn_sql_query($sql) or die(conn_error());
	for ($i=0;$i<conn_sql_num_rows($query);$i++) {
		$res=conn_fetch_row($query);
		switch ($res[2]) {
			case 'region'	:	$regs[]=$res['0'];$regs[]=$res['1'];break;
			case 1	:		$rubs[]=$res['0'];$rubs[]=$res['1'];break;
			case 2	:		$tems[]=$res['0'];$tems[]=$res['1'];break;
		}
	}

	$html.="<tr><td colspan=12 height=3 bgcolor=#DDDDDD> </td></tr>";
	$html.="<tr><td colspan=12><table width=100%><tr>";





	/*$html.="<td align=right>".iho('Регіон: ')."</td><td>";
	$html.=bd_popup($regs,'sregion','width:100px',3,'');
	$html.="</td>";	*/
	if (@$par['articletype'] == 'blog'){

		$fusers=array(0,'---');

		$users_all=conn_sql_query('SELECT * FROM '.FUSERS);
		while ($fres=conn_fetch_assoc($users_all)){
			$fusers[]=$fres['id'];
			$fusers[]=$fres['name'];
		}

		$html.="<td align=right>Користувач: </td><td>".
			bd_popup($fusers,'fuser','width:100px',3,'').
			"</td>
		<td align=right>&nbsp;</td><td>&nbsp;</td>";
	}

	else if (!isset($par['articletype'])) {

		$html.=	"<td align=right>Тип статті: </td><td>".
			bd_popup(array_merge((array)array(0,"Всі статті"),(array)$depot['newsypes']),'sntype','width:100px',3,'').
			"</td><td align=right>"."Рубрика: </td><td>".
			bd_popup($rubs,'srubric','width:100px',3,'').
			"</td>
		<td align=right>Тема: </td><td>".
			bd_popup($tems,'stheme','width:100px',3,'').
			"</td>";
	}

	$arr_perpage=array(
		30,'30 записів на сторінку',
		50,'50 записів на сторінку',
		100,'100 записів на сторінку',
		'all','Всі записи');

	$html.="
							<td width=150>
								".bd_popup($arr_perpage,'perpage','width:150px','','')."
							</td>

							<td width=50>&nbsp;</td>
							<td width=30 colspan=3>&nbsp;</td>
							<td width=60>
								<input type=submit name=io id='submt' value='Фільтрувати'>
							</td>
						</tr>
					</table>
				</tr>
			</table>
		</div>";




	$path="/gazda/index.php?act=".$par['act']."&su=".$par['su']."&lang=".$par['lang'];
	$addon='';
	$addsql='';
	/*if (!$admin) {
		$addon = " AND nauthor = \"".$logged_user['usid']."\"";
	} */

	if ($par['su'] == 'view') {
		$addsql.=" AND ".NEWS.".approved = 0";
	} else {
		$addsql.=" AND ".NEWS.".approved = 1";
	}

	if(@$par['articletype'] == 'blog'){
		$addsql.= " AND ntype = \"20\"";
	} else if(isset($par['sntype'])){
		if ($par['sntype'] !=="0" ) {
			$addsql.= " AND ntype = \"{$par['sntype']}\"";
			$path.="&sntype=".$par['sntype'];
		}  else {
			$addsql.= " AND ntype < 20";
		}

	}

	if(@$par['fuser']){
		$addsql.= " AND userid = \"".$par['fuser']."\"";
	}

	if (@$par['syear'] && @$par['smonth'] && @$par['sday']) {
		$addsql.= " AND ndate = \"".implode('_',array($par['syear'],$par['smonth'],$par['sday']))."\"";
		$path.="&syear=".$par['syear']."&smonth=".$par['smonth']."&sday=".$par['sday'];
	}
	else if (@$par['syear'] && @$par['smonth']) {
		$addsql.= " AND YEAR(ndate) = \"".$par['syear']."\" AND MONTH(ndate) = \"".$par['smonth']."\"";
		$path.="&syear=".$par['syear']."&smonth=".$par['smonth'];
	}
	else if (@$par['syear'] ) {
		$addsql.= " AND YEAR(ndate) = \"".$par['syear']."\"";
		$path.="&syear=".$par['syear'];
	}

	if(@$par['nauthor']){
		$addsql .= " AND nauthor=".$par['nauthor'];
		$path.="&nauthor=".$par['nauthor'];
	}


	if (@$par['srubric']) {
		$path.="&srubric=".$par['srubric'];
		$addsql.=" AND FIND_IN_SET(\"".$par['srubric']."\",rubric) ";
	}
	if (@$par['stheme']) {
		$path.="&stheme=".$par['stheme'];
		$addsql.=" AND FIND_IN_SET(\"".$par['stheme']."\",theme) ";
	}
	//echo $par['lang'];
	if ($par['lang']) $langsql=" AND lang = \"".$lngs1[$par["lang"]][1]."\""; else $langsql="";

	/*$sql_qty="
				SELECT COUNT(*)
				FROM ".NEWS."
				LEFT JOIN ".NEWSHEAD." USING (id)
				LEFT JOIN ".NEWSI."	USING (id)

				WHERE 1 ".$addon.$addsql.$langsql;*/

	$sql_qty="	
				SELECT COUNT(*) 
				FROM ".NEWS."
				WHERE 1 ".$addon.$addsql.$langsql;

	/*if (@$par['kwd']) {
			$addsql_kwd=" WHERE MATCH(".NEWSHEAD.".nheader) AGAINST ('".sqller($par['kwd'])."' IN BOOLEAN MODE)";
			$sql_qty="	SELECT COUNT(*)  FROM ".NEWSB."
						JOIN ".NEWS."
						USING (id)
						$addsql_kwd ".$addon.$addsql;

			$path.="&kwd=".htmlspecialchars($par['kwd']);
	}*/



	if (@$par['kwd']) {
		$addsql_kwd=" WHERE MATCH(".NEWSI.".indexed) AGAINST ('".sqller($par['kwd'])."' IN BOOLEAN MODE)";

		$sql_qty="	SELECT COUNT(*)  
						FROM ".NEWS."
						LEFT JOIN ".NEWSHEAD." USING (id)
						LEFT JOIN ".NEWSI."	USING(id)
						
						$addsql_kwd ".$addon.$addsql;

		$path.="&kwd=".htmlspecialchars($par['kwd']);
	}

	if (@$par['sid']) {
		$addsql=" AND ".NEWS.".id = \"".sqller($par['sid'])."\"";
	}
	$count1=conn_sql_query($sql_qty) or die(conn_error()."<hr>".$sql_qty);
	$count=conn_fetch_row($count1);
	if (!isset($par['pg']) || isset($par['io'])) $par['pg']=0;
	//$perpage=$enviro['news_per_page'];
	$perpage=@$par['perpage'];
	if (@$par['perpage']=='all' && $count[0]<=1000){
		$perpage=$count[0];
	} else if (@$par['perpage']=='all' && $count[0]>1000) {
		$perpage=30;
		$depot['oks'][]="Результат запиту більше ніж 1000 записів. Такий вивід може призвести до великого трафіку. Вивід розбито на сторінки по замовчуванню.";
	} else if (!@$par['perpage']) {
		$perpage=30;
	}


	$pages=($count[0]%$perpage) ? (int)($count[0]/$perpage+1) : $count[0]/$perpage;

	$ppg=20;
	$pppages=($pages%$ppg) ? (int)($pages/$ppg+1) : $pages/$ppg;
	$curr_ppg=(int)($par['pg']/$ppg);

	$start_page=$curr_ppg*$ppg;
	$end_page=($curr_ppg*$ppg+$ppg>$pages) ? $pages : $curr_ppg*$ppg+$ppg;
	//$path=$par['pphtm'];
	//foreach ($_SERVER as $k=>$v) echo "$k = > $v<br>";

	if ($curr_ppg!=0) {
		$prev_page="<a href=\"$path&pg=".($curr_ppg*$ppg-1)."\">&lt;</a>";
		$pprev_page="<a href=\"$path&pg=0\">&laquo;</a>";
	}	else
	{
		$prev_page="";
		$pprev_page="";
	}
	if ($curr_ppg!= ($pppages-1) && $pppages!==0) {
		$next_page="<a href=\"$path&pg=".(($curr_ppg+1)*$ppg)."\">&gt;</a>";
		$nnext_page="<a href=\"$path&pg=".($pages-1)."/\">&raquo;</a>";
	} else
	{
		$next_page="";
		$nnext_page="";
	}

	if ($pages>1) {
		$html.="<div class=pager>";
		$html.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
				$html.= "<a href=\"$path&pg=$i\">".($i+1)."</a>";
			else $html.= "<span>".($i+1)."</span>";
		}
		$html.= $next_page.$nnext_page;

		$html.="<div style='padding-left:50px;font-size:18px;float:left;'>/ ".$count[0];

		$html.="</div>";


		$html.="</div>";
	} else {
		$html.="<div style='font-size:18px;float:left;'>/ ".$count[0]."</div>";
	}

	if ($par['pg'] !== 'all'){
		$limit="LIMIT	".$par['pg']*$perpage.",".$perpage;
	} else $limit='';

	$sql1="
			SELECT		NIDSRES.id, 
						NIDSRES.userid,
						NIDSRES.images,
						NIDSRES.ntype,
						NIDSRES.urlkey,
						".STATVIEW.".qty views,
						udate,

						DATE_FORMAT(ndate,'%d.%m.%y') AS ndatef,
						ntime, 
						".NEWSHEAD.".nheader, 
						lang, 
						nweight,
						".USERS.".uname_ua,
						".FUSERS.".name
			FROM (
					SELECT id, userid, images,ndate,ntime,lang,nweight,nauthor,udate,ntype,urlkey
					FROM ".NEWS." USE KEY (ndate,ntime)
					WHERE 1 ".$addon.$addsql.$langsql." 
					ORDER BY udate DESC 
					$limit

			) AS NIDSRES

			
			LEFT JOIN	".NEWSHEAD." USE KEY (PRIMARY)	USING	(id)
			LEFT JOIN	".USERS."		ON	nauthor=".USERS.".id
			LEFT JOIN	".FUSERS."		ON	userid=".FUSERS.".id
			LEFT JOIN	".STATVIEW."	ON	NIDSRES.id=".STATVIEW.".id
			";
	//echo $sql1;

	if (@$par['kwd'] && !@$par['sid']) {
		$addsql_kwd=" AND MATCH(".NEWSI.".indexed) AGAINST ('".sqller($par['kwd'])."' IN BOOLEAN MODE)";

		$sql1="
			SELECT		".NEWS.".id,
						".NEWS.".userid,
						".NEWS.".images,
						".NEWS.".ntype,
						".NEWS.".urlkey,
						".STATVIEW.".qty views,
						udate,
						DATE_FORMAT(ndate,'%d.%m.%y') AS ndatef,
						ntime, 
						".NEWSHEAD.".nheader, 
						lang, 
						nweight,
						".USERS.".uname_ua,
						".FUSERS.".name
			FROM ".NEWSI." 
			LEFT JOIN	".NEWSHEAD."	USING		(id)
			LEFT JOIN	".NEWS."		USING		(id)
			LEFT JOIN	".USERS."	ON	nauthor=".USERS.".id 
			LEFT JOIN	".FUSERS."	ON	userid=".FUSERS.".id
			LEFT JOIN	".STATVIEW."	ON	".NEWS.".id=".STATVIEW.".id
			WHERE 1 ".$addon.$addsql.$addsql_kwd.$langsql." 
			ORDER BY	udate DESC 
			$limit";
	}


	$qry=conn_sql_query($sql1) or die(conn_error());
	if (!conn_sql_num_rows($qry)) $html.="<h2><br><br><br>".$depot["tx"]['he_norecords']."</h2>";

	else {
		$html.="
			<table width=100% cellpadding=15 cellspacing=1  style='clear:both;'>
				<tr>
					<td width=10% class=heaad>&nbsp;</td>
					<td class=heaad width=75%>".$depot["tx"]['he_header']."</td>
					<td class=heaad  width=5%>".$depot["tx"]['he_lang']."</td>
					<td class=heaad  width=10%>".$depot["tx"]['he_author']."</td>
				</tr>";

		for ($i=0;$i<conn_sql_num_rows($qry);$i++){
			$res=conn_fetch_assoc($qry);
			$delete_on_place=0;
			if ($i%2) $bg=" bgcolor=#EEEEEE"; else $bg="";

			$trclass="";
			if ($res['nweight']==1)
				$trclass=' class="importantNews"';
			elseif ($res['nweight']==2)
				$trclass=' class="topNews"';

			$link_class=($res['udate']>time()) ? " delayed" : "";

			$preview="<a href=\"/editor".articleLink($res,false)."\" class=\"preview\" target=\"_blank\"><b>Перегляд</b></a>";

			$html.="
					<tr $trclass>
						<td  class='bord first'><b>".$res['ndatef']."</b><em>".substr($res['ntime'],0,5)."</em></td>
						<td  class='bord$link_class'  $bg style='padding:10px;'>";
			/*if ($res['nweight']) $lnk="<b class=blk>".$res['nheader']."</b>";
					else*/ $lnk=$res['nheader'];

			if (!$res['nheader']) {

				$delete_on_place = 1;
			}

			if ($par['su'] == 'viewoub'){
				if ($admin) {
					$html.="$preview<a href=\"JavaScript:sbm('edit','".$res['id']."','')\" title=\"".$depot["tx"]["ti_edit"]."\" class=llink><span style='color:#777'>".$res['id']."</span>  $lnk ".($res['images']?" <img src='/gazda/img/pic-ico.gif' style=''>":"")."</a>";

				}
			} else {
				$html.="$preview<a href=\"JavaScript:sbm('edit','".$res['id']."','')\" title=\"".$depot["tx"]["ti_edit"]."\" class=llink><span style='color:#777'>".$res['id']."</span>  $lnk ".($res['images']?" <img src='/gazda/img/pic-ico.gif' style=''>":"")."</a>";
			}

			if ($delete_on_place){
				$html.="<b class=red>[ E R R O R ! ! ! ! ]</b>";
				$html.="<input type=button name=addne id='submt' value='Видалити' style='margin:10px 0 20px 0px !important;' onClick=\"JavaScript:r('".$res['id']."')\">";
			}


			if ($res['userid'] > 1) {
				$aname="<i class='uuser'>";
				if (!isset($res['name'])) $aname.="ADMIN"; else
					$aname.=$res['name'];
				$aname.="</i>";
			} else {
				$aname=$res['uname_ua']	;
			}

			$html.="<span style='font-size:14px;color:#F66'>".$res['views']."</span></td>
						<td  class=bg".$res['lang'].">".$lngs[$res['lang']][0]."</td>
						<td  class=bord  $bg>".$aname."</td>
						";
			$html.="</tr>";
		}
	}

	$html.="
			<input type=hidden name=oldsu value=\"".@$par['su']."\">
			<input type = hidden name='act' value='".$par['act']."'>
			<input type = hidden name='su' value='".$par['su']."'>
			<input type = hidden name='id' value=''></table>";

	return $html;
}




function check_authority(){
	global $par,$b, $tx,  $lngs1,$logged_user,$depot;
	$nnow=time();

	$admin=0;
	if (require_level('ac_newsadmin')){
		$admin=1;
	}

	/*		CHECK AVAILABILITY		*/
	$toedit=conn_fetch_assoc(conn_sql_query("
					SELECT		".NEWS.".*, 
								".NEWSHEAD.".nheader,
								".NEWSHEAD.".nteaser,
								".NEWSB.".nbody
					FROM		".NEWS." 
					LEFT JOIN	".NEWSB."		USING	(id)
					LEFT JOIN	".NEWSHEAD."	USING	(id)
					WHERE		".NEWS.".id = \"".sqller($par['id'])."\"
			"));


	if (count($toedit)<3) {
		$depot['errors'][]=$depot["tx"]['al_noid'];
		$par['su']='view';
		return false;
	}


	/*		CHECK AUTHORITY		*/
	if (!$admin){
		if ($toedit['author'] !==  $logged_user['usid']) {
			$depot['errors'][] = $depot["tx"]['al_notmy'];
			$par['su']='view';
			return false;
		}



		/*		CHECK PUBLISH SETTING   */
		if ($toedit['approved']) {
			$depot['errors'][] = $depot["tx"]['al_nopub'];
			$par['su']=$toview;
			return news_view();
		}
	}



	/*		CHECK BLOCKING		*/
	$blocked = conn_fetch_assoc(conn_sql_query("
						SELECT ".BLOCKED.".*, ".USERS.".uname_ua AS name
						FROM ".BLOCKED." LEFT JOIN ".USERS." ON ".BLOCKED.".nauthor = ".USERS.".id
						WHERE newsid = \"".sqller($par['id'])."\"
				"));
	if (count($blocked>1)){
		if ($blocked['endtime'] >$nnow){
			if ($blocked['nauthor'] !== $logged_user['usid']) {
				$depot['errors'][] = $depot["tx"]['al_blocked'].date("i:s",($blocked['endtime']-$nnow))."<br>USER: ".$blocked['name'];
				$par['su']='view';
				return false;
			}
		}
	}

	return true;

}

function news_del(){
	global $par, $b, $tx,$depot;
	$html='';
	$cachelevel = (@$par['articletype'] !== 'blog')	? 1 : 5;
	if (isset($par['id'])) {
		if (check_authority()) {
			$sql="
			DELETE 
					".NEWS.",
					".NEWSB.", 
					".NEWSHEAD." 

			FROM ".NEWS." 

			LEFT JOIN ".NEWSB."		USING	(ID) 
			LEFT JOIN ".NEWSHEAD."	USING	(ID)
			WHERE ".NEWS.".id=\"".$par['id']."\"";

            $res_ = conn_sql_query($sql) or die(conn_error());
			if (conn_affected_rows($res_)) {
				array_unshift($depot['oks'],$depot["tx"]['ok_del1']);
				freecache($cachelevel);
			} else {
				array_unshift($depot['errors'],$depot["tx"]['al_norecs']."<br><br>");
			}
		} else array_unshift($depot['errors'],'THERE IS A PROBLEM DELETING RECORD (mo=addnews,fun=news_del)'."<br><br>");

	} else {
		array_unshift($depot['errors'],'NO ID PASSED FOR REMOVAL (mo=addnews,fun=news_del)'."<br><br>");
	}


	$par['hder']=$depot["tx"]['he_newsnopub'];
	$par['su']	=$par['oldsu'];
	$html.=news_view();
	return $html;
}


function lang_js(){
	$r=<<<JSCR

 <script language="javaScript">

		  <!--

		function setvalue(name,value){
				var obj = document.getElementById ? document.getElementById(name) : null;
				obj.innerHTML = value;
		}
		  

		function savelex(pattidvar,suvalue){
			var obj = document.getElementById ? document.getElementById(pattidvar) : null;
			document.forms['ad'].su.value=suvalue;
			document.forms['ad'].submit();
			obj.innerHTML ="<img src=\"img/clock.gif\">";

			
		}
			
			
		function clearimage(formobj){
		
			eval("document.ad."+formobj+".value = ''");
			eval("document.ad."+formobj+"_imo.src ='/media/gallery/tmb/no_image.gif'");
		}


		function clear_form(){
			var allpop =new Array('sday','smonth','syear','sregion','stheme','srubric');
			var alltxt =new Array('kwd','sid');
			for (var i=0;i<allpop.length;i++) {
				eval("document.forms['ad']."+allpop[i]+".value = 0");
			}

			for (var i=0;i<alltxt.length;i++) {
				eval("document.forms['ad']."+alltxt[i]+".value = ''");
			}
			return false;
		}


		//-->
		 </script>
JSCR
	;

	return $r;
}


?>
