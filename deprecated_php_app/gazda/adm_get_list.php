<?
header ("Pragme: no-cache\n");
?>
<html>
<head>
    <title>Tip</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <style type="text/css">
        * {margin: 0; padding: 0;}
        body, td{font-family: tahoma, verdana, arial,  helvetica, sans-serif;font-size: 9px;text-align: left;}
    </style>
<body>
<?

$parent_loader=1;
require_once("../lib/etc/conf.php");
require_once("../lib/etc/conn.php");
require_once("../lib/etc/core.php");
require_once("adm_func.php");
require_once("adm_func_prodhelpers.php");

global $a,$b,$previndex;
$html='';

switch ($_REQUEST['upd']){
	case "patt":		$html=get_patt();break;
	case "meta":		$html=get_meta();break;
	case "free":		$html=get_free();break;
	case "fxd":			$html=get_fxd();break;
	case "enviro":
	case "enviroheadline":
		$html=get_enviro();break;
	case "pictype":		$html=get_pictype();break;
	case "addimage":	$html=get_addimage();break;
	case "teaser":		$html=get_teaser();break;
	case "newslike":	$html=get_newslike();break;
	case "gbook":		$html=get_gbook();break;
	case "lang":		$html=get_lang();break;
	case "upddate":		$html=get_upddate();break;


	case "listimagestree":	$html=gallery_images_selectview();break;
	case "commontree":		$html=get_structureItem();break;
	case "uploadmedia":		$html=uploadMedia();break;
	case "viewmedia":		$html=viewMedia();break;


}

echo $html;



function uploadMedia(){
	global $par,$enviro,$depot;

	$t="";
	$given_arr=explode("_",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	$var='';
	$html='';

	$depot['currt']=array(

		'header'	=>array (
			'video' =>	iho("Відео"),
			'audio'	=>	iho("Аудіо")
		),
		'dbstate'	=>array (
			'video' =>	1,
			'audio'	=>	2
		),
		'dbname'	=>array (
			'video' =>	MEDIA,
			'audio'	=>	MEDIA
		),

	);






	if (count($given_arr) == 2){ /* НОВИЙ ЕЛЕМЕНТ */

		/*if (!require_level('ac_admin')) {
			return "<script language=JavaScript>window.top.setvalue(\"".$given_arr[0]."\",\"".puttojs(errors())."\");</script>";
		}*/

		$checked1=$checked2="";

		if ($given_arr[1] == 'video'){
			$legend= iho("Відеофайл, розширення .flv ");
			list($checked1,$checked2)=array("","checked");
		} else {
			$legend= iho("Аудіофайл, розширення .mp3");
			list($checked1,$checked2)=array("checked","");
		}

		$var.="
				<div style='text-align:center'>
					<div style='margin:50px auto;width:900;padding:10px;border:#FFF 1px solid;background:#EEE'>
						<table align=center width=900 cellspacing=10>

						<td colspan=2>
							<Table width=100%>

								<tr>
									<td width='30%'>".$legend."</td>
									<td width='5%'><h2>".iho("АБО")."</h2></td>
									<td width='30%'>".iho("Назва файлу на сервері (без розширення)")."</td>
									<td width='5%'><h2>".iho("АБО")."</h2></td>
									<td width='30%'>".iho("Код YouTube")."</td>
								</tr>

								<tr>
									<td><INPUT TYPE='FILE' name='kino' style=\"width:90%;border:#CC0000 solid 1px;\" value=\"".@$par['kino']."\">
									</td>
									
									<td colspan=2><INPUT TYPE='text' name='filename' style=\"width:90%;border:#CC0000 solid 1px;\" value=\"".@$par['filename']."\"></td>
							
									<td colspan=2><INPUT TYPE='text' name='youtubec' style=\"width:90%;border:#CC0000 solid 1px;\" value=\"".@$par['youtubec']."\"></td>

								</tr>


								<tr>

									<td>
										&nbsp;
									</td>

									<td>";



		$var.="							<input type='radio' name='usetype'  value=\"1\" $checked1>
										<br><input type='radio' name='usetype'  value=\"2\" $checked2>
									</td>
									
									<td colspan=3>
										".iho('Свій плеєр')."
										<br>".iho('YouTube плеєр')."
									</td>
									
								</tr>


							</table>
						</td>




						<tr><td colspan=2><h3>".iho("<br>+<hr>")."</h3></td></tr>
						";



		if ($given_arr[1] == 'video'){

			$var.="		
						<tr>
							<td width=30%>".iho("Файл зображення для ілюстації")."</td>
							<td width=70%>
							<INPUT TYPE='FILE' name='picfile' style=\"width:60%;border:#CC0000 solid 1px;\" value=\"".@$par['picfile']."\">
							<p class=rem style='float:left;padding-left:20px;color:#996600;'>".iho('.JPG, .PNG, .GIF')."</p>
							</td>
						</tr>
			";

		}




		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);

			$var.="<tr><td>".iho('Інформація про матеріал')."</td>";
			$var.="<td>". build_multilang_field("titlee","VARCHAR","90%")."</td></tr>";

		}



		$var.='		

					<tr>
						<td>
						</td>
						<td>
							<a href="JavaScript:savetype(\''.$par["pattidvar"].'\',\'uploadmedia\')"><img src="img/bt_save.gif" alt="'.$depot['tx']["ti_save"].'" title="'.$depot['tx']["ti_save"].'" border=0></a></td></tr><tr><td colspan=2 height=10> 
						</td>
					</tr>

				</table>
			</div>
		</div>
		';

		$html.= "<script language=JavaScript>window.top.setvalue(\"".$given_arr[0]."\",\"".puttojs($var)."\");</script>";
	} else { /* РЕДАГУВАННЯ */


		/*if (!require_level('ac_admin')) {
			return "<script language=JavaScript>window.top.setvalue(\"".$given_arr[0]."\",\"".puttojs(errors())."\");</script>";
		}*/

		$curr=conn_fetch_array(
			conn_sql_query("
								SELECT * FROM ".$depot['currt']['dbname'][$given_arr[2]]." 
								WHERE id=\"".$given_arr[1]."\"
							"),PDO::FETCH_ASSOC);

		$var.="
					<INPUT TYPE='hidden' name='oldfilename'	 value=\"".$curr['filename']."\">
					<INPUT TYPE='hidden' name='oldpicfilename' value=\"".$curr['picfile']."\">
			";

		if ($given_arr[2] == 'video'){
			$legend= iho("Відеофайл, розширення .flv ");
		} else {
			$legend= iho("Аудіофайл, розширення .mp3");
		}

		$var.="
				<div style='text-align:center'>
					<div style='margin:50px auto;width:900;padding:10px;border:#FFF 1px solid;background:#F1E6FF'>
						<table align=center width=900 cellspacing=10>

						<td colspan=2>
							<Table width=100%>

								<tr>
									<td width='30%'>".iho("Відео файл")."</td>
									<td width='5%'><h2>".iho("АБО")."</h2></td>
									<td width='30%'>".iho("Назва файлу на сервері (без розширення)")."</td>
									<td width='5%'><h2>".iho("АБО")."</h2></td>
									<td width='30%'>".iho("Код YouTube")."</td>
								</tr>

								<tr>
									<td><INPUT TYPE='FILE' name='kino' style=\"width:90%;border:#CC0000 solid 1px;\" value=\"".@$curr['kino']."\">
									<p class=rem style='float:left;padding-left:20px;color:#996600;'>".$legend."</p></td>
									
									<td colspan=2><INPUT TYPE='text' name='filename' style=\"width:90%;border:#CC0000 solid 1px;\" value=\"".@$curr['filename']."\"></td>
							
									<td colspan=2><INPUT TYPE='text' name='youtubec' style=\"width:90%;border:#CC0000 solid 1px;\" value=\"".@$curr['youtubec']."\"></td>

								</tr>


								<tr>

									<td>
										&nbsp;
									</td>

									<td>
										<input type='radio' name='usetype'  value=\"1\" ".($curr['usetype']==1?'checked':'').">
										<br><input type='radio' name='usetype'  value=\"2\" ".($curr['usetype']==2?'checked':'').">
									</td>
									
									<td colspan=3>
										".iho('Свій плеєр')."
										<br>".iho('YouTube плеєр')."
									</td>
									
								</tr>


							</table>
						</td>




						<tr><td colspan=2><h3>".iho("<br>+<hr>")."</h3></td></tr>

						<tr>
							<td width=30%>".iho("Файл зображення для ілюстації")."</td>
							<td width=70%>
							<INPUT TYPE='FILE' name='picfile' style=\"width:60%;border:#CC0000 solid 1px;\" value=\"".@$curr['picfile']."\">
							<p class=rem style='float:left;padding-left:20px;color:#996600;'>".iho('.JPG, .PNG, .GIF')."</p>
							</td>
						</tr>

					
						
						";


		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			$par['titlee_'.$res['lang']]=$curr['title_'.$res['lang']];
			$var.="<tr><td>".iho('Інформація про матеріал')."</td>";
			$var.="<td>". build_multilang_field("titlee","VARCHAR","90%")."</td></tr>";

		}



		$var.='		

					<tr>
						<td>
						</td>
						<td>
							<a href="JavaScript:savetype1(\''.$par["pattidvar"].'\',\'saveeditmedia\')"><img src="img/bt_save.gif" alt="'.$depot['tx']["ti_save"].'" title="'.$depot['tx']["ti_save"].'" border=0></a></td></tr><tr><td colspan=2 height=10> 
						</td>
					</tr>

				</table>
			</div>
		</div>
		';
		//$html.=$var;
		$html.= "<script language=JavaScript>window.top.setvalue(\"".$given_arr[0]."_".$given_arr[1]."\",\"".puttojs($var)."\");</script>";
	}
	return $html;
}




function viewMedia(){
	global $tx,$par,$enviro,$depot;
	$t="";
	$given_arr=explode("_",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");

	include("../lib/getvideo.php");
	$var=getVideo($given_arr[3]);

	/*if ($given_arr[2] == 'video'){
		$var=str_replace(array('{{filename}}','{{timestamp}}'),array($given_arr[3],time()),$depot['flv_player']);
	} else {
		 $var=str_replace(array('{{filename}}','{{timestamp}}'),array($given_arr[3],time()),$depot['mp3_player']);
	}*/

	$zheight=(@$given_arr[2]=='video') ? '405' : '53';

	$var="<div style='text-align:center;'>
					<div style='margin:10px auto;background:#FFFF99;width:100%;;border:#FFCC00 1px solid;'>
						<iframe width=\"710px\" height=\"$zheight\" src=\"$var\" frameborder=\"0\" allowfullscreen>
						</iframe>
						<a href='' style='float:right;clear:both;background:#F00;color:#FFF;margin:-40px 20px 20px 0;padding:3px 10px;' href='' onClick='destrAndHide(\"".$given_arr[0]."_".$given_arr[1]."\");return false;'>".iho('Закрити')."</a>
					</div>
		</div>
	";
	$html= "<script language=JavaScript>window.top.setvalue(\"".$given_arr[0]."_".$given_arr[1]."\",\"".puttojs($var)."\");</script>";

	return $html;
}



function get_structureItem(){
	global $tx,$par,$depot;
	$html="";
	$given_arr=explode("_",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	$var='';


	if (count($given_arr) == 2){

		$var.="<table width=100%><tr><td width=30%>".iho("Ключ для пошуку")."</td>";
		$var.="<td>".bd_tf(@$par['kwd'],'kwd','text','width:400px;border:#CC0000 solid 1px;',1,'')."</td></tr>";

		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			/*$var.="<tr><td width=30%>".iho('Назва (').$res['langtitle'].")</td>";*/
			$var.="<tr><td width=30%>".iho('Назва ')."</td>";

			$var.="<td>".bd_tf(@$par['name_'.$res['lang']],'name_'.$res['lang'],'text','width:400px;border:#CC0000 solid 1px;',($i+1),'')."</td></tr>";

		}



		$var.='<tr><td>'.iho("Батьківський елемент").'</td><td>';

		$datas = getCommonTree(CTREE,$given_arr[1],0);



		$var.=bd_popup($datas,'parentword','width:400px;border:#CC0000 solid 1px;',10,'').'</td></tr>';

		$var.='<tr><td></td><td><br><a href="JavaScript:savetype(\''.$par["pattidvar"].'\',\'savetype\')"><img src="img/bt_save.gif" alt="'.$depot['tx']["ti_save"].'" title="'.$depot['tx']["ti_save"].'" border=0></a></td></tr>';

		$var.="</table>";
		$var="<div style='background:#FFECB3;border:#FFCC66 1px solid;padding:20px;width:680px;'>$var</div>";
		$html.= "<script language=JavaScript>window.top.setvalue(\"".$given_arr[0]."\",\"".puttojs($var)."\");</script>";

	} else {

		$fromdb=conn_fetch_array(conn_sql_query("
													SELECT * 
													FROM ".CTREE." 
													WHERE id = \"".$given_arr[1]."\"
				"),PDO::FETCH_ASSOC);


		$par['id']=htmlspecialchars($fromdb['id']);
		$par['kwd']=htmlspecialchars($fromdb['kwd']);
		$par['isvisible']=$fromdb['isvisible'];
		$par['parentword']=$fromdb['parentword'];


		$var.="<table width=100%><tr><td width=30%>".iho("Ключ для пошуку")."</td>";
		$var.="<td>".bd_tf(@$par['kwd'],'kwd','text','width:400px;border:#CCCCCC solid 1px;color:#CCCCCC;',1,'')."</td></tr>";
		$var.="<input type='hidden' name='id' value='".sqller($par['id'])."'>";


		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			$par['name_'.$res['lang']]=$fromdb['name_'.$res['lang']];
			$var.="<tr><td width=30%>".iho('Назва ')."</td>";
			$var.="<td>".bd_tf(getfromdb(@$par['name_'.$res['lang']],$res['lang']),'name_'.$res['lang'],'text','width:400px;border:#CC0000 solid 1px;',($i+1),'')."</td></tr>";

		}


		$var.='<tr><td>'.iho("Батьківський елемент").'</td><td>';

		$datas = getCommonTree(CTREE,$given_arr[2],0);



		$var.=bd_popup($datas,'parentword','width:400px;border:#CC0000 solid 1px;',10,'').'</td></tr>';

		$var.='<tr><td></td><td><a href="JavaScript:savetype(\''.$par["pattidvar"].'\',\'savetype\')"><img src="img/bt_save.gif" alt="'.$depot['tx']["ti_save"].'" title="'.$depot['tx']["ti_save"].'" border=0></a></td></tr>';
		$var.="</table>";
		$var="<div style='background:#FFECB3;border:#FFCC66 1px solid;padding:20px;width:680px;'>$var</div>";
		$html.= "<script language=JavaScript>window.top.setvalue(\"".$given_arr[0]."_".$given_arr[1]."\",\"".puttojs($var)."\");</script>";

	}


	return $html;

}


function gallery_images_selectview(){
	global $par,$b, $tx, $enviro,$errors,$oks, $allangs;
	$html='';
	/*if (!isset($par['id'])) return;
	$vis="display:none;";
	$sql="SELECT name_".$allangs[0]." FROM ".PICTYPE." WHERE kwd=\"".$par['id']."\"";
	$curr_type=conn_fetch_row(conn_sql_query($sql));*/

	if (conn_error()) die(conn_error());

	if (!isset($par['action'])) $par['action']='imagelib';

	if (@$par['show'] !== 'thumb') {
		$onclick="commonAx(\"imagestree\",\"updscript\",[\"upd=listimagestree\",\"id=".$par['id']."\",\"show=thumb\",\"action=".$par['action']."\"]);";
	} else {
		$onclick="commonAx(\"imagestree\",\"updscript\",[\"upd=listimagestree\",\"id=".$par['id']."\",\"action=".$par['action']."\"]);";
	}

	switch ($par['action']){
		case  'imagelib' :		$aonclick='window.top.pass';break;
		case  'imageintxt' :	$aonclick='window.top.passURL';break;
	}

	$html.="<div id=errmess></div>

			<div style='position:relative;top:0;left:0;width:100%;background:#FFCC00;border:#FF9933;text-align:left;'>
				<a href='' onClick='".$onclick." return false;' alt='".iho('Відображати/Приховувати зображення')."' style='float:left;padding:2px;'><img src='/gazda/img/mbs/mb_view.gif'></a>
				<a href='' onClick='switchImagesTreeVis(0);return false;' style='float:right;margin-right:10px;'><img src='/gazda/img/bt_close.gif'></a>

			</div>
			<table width=100%><tr>	
				<td></td>
			</tr>";
	$sql=conn_sql_query("SELECT * FROM ".PICS." WHERE pic_type=\"".$par['id']."\" ORDER BY id DESC");
	if (!conn_sql_num_rows($sql)){
		$html.="<tr><td><h2> No Images</h2></td></tr>";

	}
	$html.="<tr><td>";
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		if (@$par['show'] == 'thumb') {
			$html.="<span class='imginline75' style='float:left;'><a href='' onClick='JavaScript:$aonclick(\"".$res['id']."\",\"".getImagePath($res['filename']).$res['filename']."\");return false;' ><img src=\"/media/gallery/tmb/".getImagePath($res['filename']).$res['filename']."\" width=63></a><span style='clear:both;width:65px;float:left;font-size:11px;color:#000 !important;'>".$res['filename']."</span></span>";
		} else {
			$html.="<span style='clear:both;width:100%;float:left;'><a href='' onClick='JavaScript:$aonclick(\"".$res['id']."\",\"".getImagePath($res['filename']).$res['filename']."\");return false;' class=imname>".$res['filename']."</a></span> ";
		}
	}
	$html.="</td></tr></table>";
	$html.= "
				<script language=JavaScript>
						window.parent.switchImagesTreeVis(1);
						window.parent.setvalueAx(\"imageslist\",\"".puttojs($html)."\");
				</script>";
	return $html;
}



function get_patt(){
	list($pageid,$pattid1,$varid,$langid)=explode("___",$_REQUEST['pattidvar']);

	$occupied_tables=array();
	$parnt=conn_fetch_row(conn_sql_query("SELECT patterns_".$langid." FROM ".METAS." WHERE page=\"$pageid\""));
	$parchk=$parnt[0];


	$patts=array();
	$listed_patterns[]=$parnt[0];
	$patts[]=$parnt[0];
	while (count($patts)){
		$pattid=array_shift($patts);
		if ($pattid == $pattid1) break;
		$sql=conn_sql_query("SELECT * FROM ".$pattid." WHERE page=\"".$pageid."\"");
		$all_content=conn_fetch_array($sql,PDO::FETCH_ASSOC);

		$sql=conn_sql_query("SELECT * FROM ".PATT." WHERE pattid=\"".$pattid."\"");
		$current_patternt=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		$depot=explode(":",$current_patternt['pattvars']);

		foreach ($depot as $first){
			$value=$all_content[$first."_".$langid];
			if (preg_match("/^patt_(\w+)$/",$value)){
				if (!in_array($value,$listed_patterns)){
					$listed_patterns[]=$value;
					array_push($patts,$value);
				}
			}
		}
	}


	$sql_patt=conn_sql_query("SELECT * FROM ".PATT." WHERE pattid=\"$pattid\"") or die(conn_error());
	$res_patt=conn_fetch_array($sql_patt,PDO::FETCH_ASSOC);

	$active_vars=explode(":",$res_patt['pattvars']);
	$drop_down=array("","","",iho("- - - - - - -  Шаблони:"));

	$sql_pats=conn_sql_query("SELECT * FROM ".PATT."") or die(conn_error());



	for ($i=0;$i<conn_sql_num_rows($sql_pats);$i++){
		$res=conn_fetch_array($sql_pats, PDO::FETCH_ASSOC);
		if ($varid !== "0"){
			if (!in_array($res['pattid'],$listed_patterns)){
				$drop_down[]=$res['pattid'];
				$drop_down[]=$res['pattname'];
			}
		} else {
			$drop_down[]=$res['pattid'];
			$drop_down[]=$res['pattname'];
		}
	}





	$drop_down[]="";
	$drop_down[]="";
	$drop_down[]="";
	$drop_down[]=iho("- - - - - - -  Модулі:");

	$sql_mods=conn_sql_query("SELECT * FROM ".MODS."") or die(conn_error());
	for ($i=0;$i<conn_sql_num_rows($sql_mods);$i++){
		$res=conn_fetch_array($sql_mods, PDO::FETCH_ASSOC);
		$drop_down[]=$res['modpar'];
		$drop_down[]=$res['modname'];
	}

	$drop_down[]="";
	$drop_down[]="";
	$drop_down[]="[[FREE_CONTENT]]";
	$drop_down[]=iho("Вільний контент. (Статичний, без використання змінних.)");


	$drop=bd_popup($drop_down,$_REQUEST['pattidvar']."___submit","width:235px;", 1,'OnChange=changeval("'.$_REQUEST['pattidvar'].'___submit","'.$_REQUEST['pattidvar'].'")');


	return "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".addslashes($drop)."\");</script>";
}





function get_meta(){
	global $tx;
	$html="";
	list($pageid,$langid)=explode("___",$_REQUEST['pattidvar']);

	$sql=conn_sql_query("SELECT * FROM ".METAS." WHERE page=\"$pageid\"");
	$all=conn_fetch_array($sql, PDO::FETCH_ASSOC);

	$var='<input type=text name="'.$_REQUEST['pattidvar'] .'___linkname___submit" value="'.htmlspecialchars(getfromdb($all["linkname_".$langid],$langid)).'" style="border:#000000 solid 1px;width:450px;">';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."___linkname\",\"".puttojs($var)."\");</script>";

	$var='<input type=text name="'.$_REQUEST['pattidvar'] .'___title___submit" value="'.htmlspecialchars(getfromdb($all["title_".$langid],$langid)).'" style="border:#000000 solid 1px;width:450px;">';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."___title\",\"".puttojs($var)."\");</script>";

	$var='<textarea name="'.$_REQUEST['pattidvar'] .'___kwords___submit" style="border:#000000 solid 1px;width:450px;height:80px;">'. htmlspecialchars(getfromdb($all["kwords_".$langid],$langid)).'</textarea>';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."___kwords\",\"".puttojs($var)."\");</script>";


	$var='<textarea name="'.$_REQUEST['pattidvar'] .'___descr___submit" style="border:#000000 solid 1px;width:450px;height:80px;">'. htmlspecialchars(getfromdb($all["descr_".$langid],$langid)).'</textarea>';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."___descr\",\"".puttojs($var)."\");</script>";

	$var='<a href="JavaScript:savemeta(\''.$_REQUEST['pattidvar'].'\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a>';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".puttojs($var)."\");</script>";
	return $html;
}


function get_free(){
	global $tx;
	$html="";
	list($pageid,$pattid,$varid,$langid)=explode("___",$_REQUEST['pattidvar']);


	$freeid=conn_fetch_row(conn_sql_query("SELECT ".$varid."_".$langid." FROM ".$pattid." WHERE page=\"$pageid\""));

	$freeid_content='';
	preg_match("/^\[\[FREE(\w{16})FREE\]\]$/",$freeid[0],$match);
	$content=conn_fetch_row(conn_sql_query("SELECT * FROM ".FREE." WHERE id=\"".$match[1]."\""));

	if (count($content)){
		$freeid_content.=$content[1];
	}

	$var="<div>".iho("Замінити ENTER на символи &lt;BR&gt;");
	$var.='<input TYPE="radio" NAME="'.$_REQUEST['pattidvar'] .'___br"'.' value=1>'.iho("Так");
	$var.='<input TYPE="radio" NAME="'.$_REQUEST['pattidvar'] .'___br"'.' value=0 checked>'.iho("Ні")."</div>";

	$var.='<textarea name="'.$_REQUEST['pattidvar'] .'___free" style="border:#000000 solid 1px;width:550px;height:400px;">'. htmlspecialchars(getfromdb($freeid_content,$langid)).'</textarea>';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."___free\",\"".puttojs($var)."\");</script>";

	$var='<a href="JavaScript:savefree(\''.$_REQUEST['pattidvar'].'\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a>';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."___buttfree\",\"".puttojs($var)."\");</script>";
	return $html;

}

function get_fxd(){
	global $tx,$par;
	$html="";

	list($pageid,$pattid,$langid)=explode("___",$_REQUEST['pattidvar']);
	$pageid=str_replace("t_h_e_d_a_s_h","-",$pageid);
	$pattid=str_replace("t_h_e_d_a_s_h","-",$pattid);

	$fixedid=conn_fetch_array(conn_sql_query("SELECT * FROM ".PATT." WHERE pattid=\"$pattid\""),PDO::FETCH_ASSOC);
	$depot=explode(":",$fixedid['fixedpattvars']);
	$forms=explode(":",$fixedid['formelements']);
	$fixedvals=array();
	$fixedvals=conn_fetch_array(conn_sql_query("SELECT * FROM ".$pattid." WHERE page=\"$pageid\""), PDO::FETCH_ASSOC);

	$var='<a href="JavaScript:savefxd(\''.$_REQUEST['pattidvar'].'\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a>';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."___butt\",\"".puttojs($var)."\");</script>";

	if (count($depot) != count($forms)){
		$var="<h2>".iho("Шаблон покоджений")."<h2>";
		$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."___fxd\",'$var');</script>";
		return $html;
	}

	$imgsql=conn_sql_query("SELECT * FROM ".TREE);
	$images=array(0,"- - - - - - - - - - - - - - - - ");
	for ($i=0;$i<conn_sql_num_rows($imgsql);$i++){
		$obj=conn_fetch_array($imgsql, PDO::FETCH_ASSOC);
		$images[]=$obj['idword'];
		$images[]=$obj['title'];
	}

	$width=650;

	$frm='<h2>'.iho("Параметри фіксованих змінних").'</h2>';
	$all_except_images="";
	$all_images="";
	$im_qty;
	/*
	$all_except_images.="<div style=\"border:#CC0000 solid 1px;\">".iho("Замінити ENTER на символи &lt;BR&gt;; &nbsp;&nbsp;&nbsp;");
	$all_except_images.='<input TYPE="radio" NAME="'.$_REQUEST['pattidvar'] .'___br"'.' value=1 >'.iho("Так&nbsp;&nbsp;&nbsp;");
	$all_except_images.='<input TYPE="radio" NAME="'.$_REQUEST['pattidvar'] .'___br"'.' value=0 checked>'.iho("Ні&nbsp;&nbsp;&nbsp;")."</div>";*/

	for ($i=0;$i<count($depot);$i++){

		$name=$depot[$i]."_".$langid;

		$vl=htmlspecialchars(getfromdb($fixedvals[$name],$langid));
		$nm=$_REQUEST['pattidvar']."___".$depot[$i];


		switch ($forms[$i]){
			case "tf":
				$all_except_images.="<br><br><span class=bk>".$depot[$i]."</b><br>";
				$all_except_images.="<input type='text' name='$nm' value=\"$vl\" style=\"width:".$width."px;border:#3333FF solid 1px;\">";
				break;
			case "imploded":
				$all_except_images.="<br><br><span class=bk>".$depot[$i]."</b><br>";
				$all_except_images.=bd_edit_menu($nm,$width);
				$all_except_images.="<textarea name='$nm' id='$nm' style=\"width:".$width."px;height:60px;border:#3333FF solid 1px;\">$vl</textarea>";
				break;
			case "ta1":
				$all_except_images.="<br><br><span class=bk>".$depot[$i]."</b><br>";
				$all_except_images.=bd_edit_menu($nm,$width);
				$all_except_images.="<textarea name='$nm' id='$nm' style=\"width:".$width."px;height:60px;border:#3333FF solid 1px;\">$vl</textarea>";
				break;
			case "ta2":
				$all_except_images.="<br><br><span class=bk>".$depot[$i]."</b><br>";
				$all_except_images.=bd_edit_menu($nm,$width);
				$all_except_images.="<textarea name='$nm'  id='$nm' style=\"width:".$width."px;height:300px;border:#3333FF solid 1px;\">$vl</textarea>";
				break;
			/*case "im":
			case "tmb":
				$all_images.="<td width=60 valign=top>";
				$imgname=$nm."_imo";
				if (trim($vl)){
					$img=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".PICS." WHERE id=\"$vl\""));
					$all_images.="<a href=\"JavaScript:selectimage('$nm')\"><img class=tmb name=$imgname id=$imgname src=\"/gallery/tmb/".$img['filename']."\"></a><br>";
					$all_images.="<a href=\"JavaScript:clearimage('$nm')\"><img src=\"/gallery/tmb/no_image_rem.gif\" border=0></a>";
				} else {
					$all_images.="<a href=\"JavaScript:selectimage('$nm')\"><img class=tmb name=$imgname id=$imgname src=\"/gallery/tmb/no_image.gif\"></a>";
				}

				$par[$nm]=$vl;
				//$images=get_images_list();
				$all_images.="<input type=hidden name='$nm' value=\"$vl\">";
				$all_images.="</td>";
				//$frm.=bd_popup($images,$nm,"width:".$width."px;border:#3333FF solid 1px;",'','');
				break;*/
		}


		//$frm.="<br><br>";
	}
	/*
	if ($all_images){
		$frm.="<h3>".iho('Використані зображення')."</h3><table><tr>";
		$frm.=$all_images;
		$frm.="</tr></table>";
	}*/



	$frm.=$all_except_images;
	$frm.=image_maker($fixedvals['selimgs_'.$langid],$pattid);
	/*$frm.="<div class=imgsrc1>".iho("База зображень")."</div>";

	$frm.="<div class=editmenu style='width:100%;'>";
	$frm.="<img src='/gazda/img/mbs/mb_separ.gif'>";
	$frm.="<a href='/gazda/imagesrc.php' target=imgsrc><img src='/gazda/img/mbs/mb_open.gif'></a>";
	$frm.="<img src='/gazda/img/mbs/mb_separ.gif'>";
	$frm.="</div>";

	$frm.="<iframe src=\"/gazda/imagesrc.php\" name=\"imgsrc\" id=\"imgsrc\" width=\"670px\" border=0 height=\"200px\" scrolling=\"auto\" class=ii></iframe>";



	$frm.="<div class=imgsrc2>".iho("Вибрані для сторінки зображення")."</div>";

	$frm.="<div class=editmenu style='width:100%;'>";
	$frm.="<img src='/gazda/img/mbs/mb_separ.gif'>";
	$frm.="<a href='' onClick='return destroyImage()'><img src='/gazda/img/mbs/mb_del.gif'></a>";
	$frm.="<a href='' onClick='deselect(); return false;'><img src='/gazda/img/mbs/mb_desel.gif'></a>";
	$frm.="<img src='/gazda/img/mbs/mb_separ.gif'>";
	$frm.="</div>";

	$frm.="<div class=presel style='width:670px;'>";
	$frm.="<div id=selectedi name=selectedi>";
	if (isset($fixedvals['selimgs_'.$langid]) && $fixedvals['selimgs_'.$langid] !==''){
		foreach (explode(',',$fixedvals['selimgs_'.$langid]) as $img_id){
			$img_sql=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".PICS." WHERE id = \"$img_id\""));
			$frm.="<a href='' onClick='activateLoaded(\"$img_id\"); return false;' rel='loadedHref' id=loadedHref".$img_id." class=imginline75>";
			$frm.="<img src='/gallery/tmb/".$img_sql['filename']."' id=loadedImage".$img_id."></a> ";
		}
	}
	$frm.="<input type=hidden name=whereto value='selimgs_$pattid'>";
	$frm.="<input type=hidden name='selimgs_$pattid' value='".@$fixedvals['selimgs_'.$langid]."'>";
	$frm.="<input type=hidden name=currselected value=''>";
	$frm.="<input type=hidden name=currselectedimage value=''>";
	$frm.="</div></div>";*/




	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."___fxd\",\"".puttojs($frm)."\");</script>";


	return $html;

}

function get_enviro(){
	global $enviro,$par,$tx;
	$html='';
	list($v,$shit)=explode("___",$par["pattidvar"]);
	$var='<a href="JavaScript:saveenviro(\''.$par["pattidvar"].'\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a>';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$par["pattidvar"]."___buttenv\",\"".puttojs($var)."\");</script>";
	$var='<input type="text" name="'.$par["pattidvar"].'" value="'.$enviro[$v].'" style="width:200px;border:#CC0000 solid 1px;">';
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$par["pattidvar"]."\",\"".puttojs($var)."\");</script>";
	return $html;
}




function get_pictype(){
	global $par,$depot;
	$t="";
	$given_arr=explode("___",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	$var='';

	subselect2();
	$datas=array();
	foreach ($depot['b2'] as $cat){
		$datas[]=$cat['id'];
		$datas[]=str_repeat(' | . . . . ', ($cat['level']-1)).$cat['name_'.$par['lng']];
	}

	array_unshift($datas,iho("Коренева категорія"));array_unshift($datas,0);

	if (count($given_arr) == 1){


		$var.="<table width=100%>";/*<tr><td width=30%>".iho("Ключ для пошуку")."</td>";
			$var.="<td>".bd_tf(@$par['kwd'],'kwd','text','width:400px;border:#CC0000 solid 1px;',1,'')."</td></tr>";*/

		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			$var.="<tr><td width=30%>".iho('Назва (').$res['langtitle'].")</td>";
			$var.="<td>".bd_tf(@$par['name_'.$res['lang']],'name_'.$res['lang'],'text','width:400px;border:#CC0000 solid 1px;',($i+1),'')."</td></tr>";

		}

		/*$var.='<tr><td>'.iho("Відображати в галереї").'</td><td>';
		if (!isset($par['isvisible'])) $par['isvisible']='1';
		$var.=bd_popup(array('1',iho("Так"),'0',iho("Ні")),'isvisible','width:400px;border:#CC0000 solid 1px;',10,'').'</td></tr>';*/

		$var.='<tr><td>'.iho("Батьківський елемент").'</td><td>';

		$var.=bd_popup($datas,'parentword','width:400px;border:#CC0000 solid 1px;',10,'').'</td></tr>';

		$var.='<tr><td></td><td><br><a href="JavaScript:savetype(\''.$par["pattidvar"].'\',\'savetype\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a></td></tr>';

		$var.="</table>";
		$var="<div style='background:#FFECB3;border:#FFCC66 1px solid;padding:20px;width:680px;'>$var</div>";
		$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".puttojs($var)."\");</script>";
	} else {

		$fromdb=conn_fetch_array(conn_sql_query("SELECT * FROM ".PICTYPE." WHERE id = \"".$given_arr[1]."\""),PDO::FETCH_ASSOC);
		$par['kwd']=htmlspecialchars($fromdb['kwd']);
		$par['isvisible']=$fromdb['isvisible'];


		$var.="<table width=100%>";/*<tr><td width=30%>".iho("Ключ для пошуку")."</td>";
		$var.="<td>".bd_tf(@$par['kwd'],'kwd','text','width:400px;border:#CCCCCC solid 1px;color:#CCCCCC;',1,'')."</td></tr>";*/

		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			$par['name_'.$res['lang']]=$fromdb['name_'.$res['lang']];
			$var.="<tr><td width=30%>".iho('Назва (').$res['langtitle'].")</td>";
			$var.="<td>".bd_tf(getfromdb(@$par['name_'.$res['lang']],$res['lang']),'name_'.$res['lang'],'text','width:400px;border:#CC0000 solid 1px;',($i+1),'')."</td></tr>";

		}

		/*$var.='<tr><td>'.iho("Відображати в галреї").'</td><td>';
		$var.=bd_popup(array('1',iho("Так"),'0',iho("Ні")),'isvisible','width:400px;border:#CC0000 solid 1px;',10,'').'</td></tr>';*/


		$var.='<tr>
					<td>'.iho("Батьківський елемент").'</td>
					<td>'.bd_popup($datas,'parentword','width:400px;border:#CC0000 solid 1px;',10,'').'</td>
				</tr>
				<tr>
					<td></td>
					<td><a href="JavaScript:savetype(\''.$par["pattidvar"].'\',\'savetype\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a></td>
				</tr>
			</table>
				';
		$var="<div style='background:#FFECB3;border:#FFCC66 1px solid;padding:20px;width:680px;'>$var</div>";
		$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".puttojs($var)."\");</script>";

	}


	return $html;

}



/*function get_addimage(){
	global $tx,$par;
	$t="";
	$given_arr=explode("___",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	$var='';
	$html='';

	if (count($given_arr) == 1){
		$var.="<table width=60% align=center><tr><td colspan=2 height=50> </td></tr><tr><td width=50%>".iho("Файл зображення")."</td>";
		$var.="<td>";
		$var.="<INPUT TYPE='FILE' name='filename' style=\"width:300px;border:#CC0000 solid 1px;\" value=\"".@$par['filename']."\">";
		$var.="</td></tr>";
		$var.="<tr><td width=50%>".iho("Назва файлу на сервері (без розширення).")."</td>";
		$var.="<td>".bd_tf(@$par['newfilename'],'newfilename','text','width:300px;border:#CC0000 solid 1px;',2,'')."</td></tr>";
		$var.="<tr><td width=50%></td>";
		$var.="<td>".iho("Для назви файлу використовуйте лише латинські літери та цифри. Допускається використання знаків '-','_' ")."</td></tr>";

		$var.="<tr><td colspan=2>&nbsp;</td></tr>";
		$var.="<tr><td>".iho("Марка для зображення")."</td>";
		$var.="<td><input type=text name=mark value='zik.com.ua' style='width:300px;border:#CC0000 solid 1px;'></td></tr>";

		$var.='<tr><td></td><td><a href="JavaScript:savetype(\''.$par["pattidvar"].'\',\'saveimage\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a></td></tr><tr><td colspan=2 height=50> </td></tr>';
		$var.="</table>";

		$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".puttojs($var)."\");</script>";
	} else {

		$curr=conn_fetch_array(conn_sql_query("SELECT * FROM ".PICS." WHERE filename=\"".$given_arr[1]."\""),PDO::FETCH_ASSOC);
		$var.="<table width=90%><tr><td width=50% rowspan=".(conn_sql_num_rows($sql)+2)."><img src=\"/gallery/intxt/".getImagePath($curr['filename']).$curr['filename']."?timestamp=".time()."\"></td>";
		$var.="<INPUT TYPE='hidden' name='filename' style=\"width:380px;border:#CC0000 solid 1px;\" value=\"".@$par['filename']."\">";



		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			$par['titlee_'.$res['lang']]=getfromdb($curr['title_'.$res['lang']],$res['lang']);
			$var.="<tr><td width=30%>".iho('(').$res['langtitle'].")</td>";
			$var.="<td>". bd_tf(@$par['titlee_'.$res['lang']],'titlee_'.$res['lang'],'text','width:380px;border:#CC0000 solid 1px;',($i+3),'')."</td></tr>";

		}

		$var.='</tr>';

		$var.='<tr><td></td><td><a href="JavaScript:savetype1(\''.$par["pattidvar"].'\',\'saveeditedimage\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a></td></tr>';
		$var.="</table>";
		//$html.=$var;
		$html.= "<script language=JavaScript>window.top.setvalue(\"".$given_arr[0]."\",\"".puttojs($var)."\");</script>";
	}




	return $html;

}*/


function get_addimage(){
	global $tx,$par,$enviro,$depot;
	$t="";
	$given_arr=explode("___",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
	$var='';
	$html='';

	if (count($given_arr) == 1){
		$var.="
				<div style='text-align:center'>
					<div style='margin:50px auto;background:#FFFF99;width:80%;padding:10px;border:#FFCC00 1px solid;'>
						<table align=center width=100% cellspacing=10>
						<tr>
							<td width=50%>".iho("Файл зображення")."</td>
							<td width=50%>
							<INPUT TYPE='FILE' name='filename' style=\"width:300px;border:#CC0000 solid 1px;\" value=\"".@$par['filename']."\">
							</td>
						</tr>

						<tr>
							<td width=50%>".iho("Ширина великого зображення")."</td>
							<td width=50%>
							<INPUT TYPE='text' name='real_large_width' style=\"width:60px;border:#CC0000 solid 1px;float:left;\" value=\"".$enviro['large_im_size']."\"><p class=rem style='float:left;padding-left:20px;color:#996600;'>".iho("По замовчуванню - ").$enviro['large_im_size']." px</p>
							</td>
						</tr>
						

						
						<tr>
							<td width=50%>".iho("Залишити оригінальні розміри")."</td>
							<td width=50%>
							<INPUT TYPE='checkbox' name='save_original' value='1'>
							</td>
						</tr>
						

						<tr>
							<td><p class=rem>".iho("Назва файлу на сервері (без розширення)")."</p></td>
							<td>".bd_tf(@$par['newfilename'],'newfilename','text','width:200px;border:#CCC solid 1px;',2,'')."<p class=rem style='color:#C00;'>".iho("Латинські літери та цифри, знаки '-' та'_'")."</p>
							</td>
						</tr>

						<tr>
							<td><p>".iho("Ключові слова (через пробіл, макс ~< 50 символів)")."</p></td>
							<td>".bd_tf(@$par['tags'],'tags','text','width:400px;border:#CCC solid 1px;',2,'')."
							</td>
						</tr>

		
				<tr><td colspan=2>&nbsp;</td></tr>
				<tr>
					<td>".iho("Марка для зображення")."</td>
					<td><input type=text name=mark value='' style='width:300px;border:#CCC solid 1px;'></td>
				</tr>

				<tr>
					<td>".iho("Розмістити водяний знак")."</td>
					<td>
					<INPUT TYPE='checkbox' name='watermark' value='1'>
					</td>
				</tr>";

		$var.='<tr><td></td><td><a href="JavaScript:savetype(\''.$par["pattidvar"].'\',\'saveimage\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a></td></tr><tr><td colspan=2 height=50> </td></tr>';
		$var.="</table></div></div>";

		$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".puttojs($var)."\");</script>";
	} else {

		$curr=conn_fetch_array(conn_sql_query("SELECT * FROM ".PICS." WHERE filename=\"".$given_arr[1]."\""),PDO::FETCH_ASSOC);
		$var.="<table width=100% cellpadding=3 cellspacing=2 border=0><tr><td width=40% rowspan=".(conn_sql_num_rows($sql)+6)."><img src=\"/media/gallery/intxt/".getImagePath($curr['filename']).$curr['filename']."?timestamp=".time()."\"></td>";
		$var.="<INPUT TYPE='hidden' name='oldfilename' style=\"width:380px;border:#CC0000 solid 1px;\" value=\"".$curr['filename']."\">";

		$var.="
			<td width=20% bgcolor='#FFCCFF'>".iho("Новий файл зображення")."</td><td width=40%  bgcolor='#FFCCFF'>
				<INPUT TYPE='FILE' name='filename' style=\"width:300px;border:#CC0000 solid 1px;\" value=\"".@$par['filename']."\">
			</td>
			</tr>

			<tr><td width=20% bgcolor='#FFCCFF'>".iho("Марка для зображення")."</td><td width=40%  bgcolor='#FFCCFF'>
				<input type=text name=mark value='' style='width:300px;border:#CC0000 solid 1px;'>
			</td>

			<tr>
					<td>".iho("Розмістити водяний знак")."</td>
					<td>
					<INPUT TYPE='checkbox' name='watermark' value='1'>
					</td>
				</tr>

			<tr>
					<td><p>".iho("Ключові слова  ~< 50 симв.")."</p></td>
						<td>".bd_tf(@$curr['tags'],'tags','text','width:400px;border:#CCC solid 1px;',2,'')."
						</td>
					</tr>


			</tr>
				<tr>
					<td>".iho("Ширина великого зображення")."</td>
					<td>
					<INPUT TYPE='text' name='real_large_width' style=\"width:60px;border:#CC0000 solid 1px;float:left;\" value=\"".$enviro['large_im_size']."\"><p class=rem style='float:left;padding-left:20px;color:#996600;'>".iho("По замовчуванню - ").$enviro['large_im_size']." px</p>
					</td>
				</tr>
				
				<tr>
					<td>".iho("Залишити оригінальні розміри")."</td>
					<td>
					<INPUT TYPE='checkbox' name='save_original' value='1'>
					</td>
				</tr>

			<tr><td colspan=2><br><br>
			</td>
			</tr>
			
			
			";

		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
			$par['titlee_'.$res['lang']]=getfromdb($curr['title_'.$res['lang']],$res['lang']);
			$var.="<tr><td>".iho('(').$res['langtitle'].")</td>";
			$var.="<td>". bd_tf(@$par['titlee_'.$res['lang']],'titlee_'.$res['lang'],'text','width:300px;border:#CC0000 solid 1px;',($i+3),'')."</td></tr>";

		}

		$var.='</tr>';

		$var.='<tr><td></td><td><a href="JavaScript:savetype1(\''.$par["pattidvar"].'\',\'saveeditedimage\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a></td></tr>';
		$var.="</table>";
		//$html.=$var;
		$html.= "<script language=JavaScript>window.top.setvalue(\"".$given_arr[0]."\",\"".puttojs($var)."\");</script>";
	}
	return $html;
}


function get_teaser(){
	global $tx,$par,$a,$b;
	$t="";
	$given_arr=explode("___",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG."");
	$var='';

	$suffix='';
	if (count($given_arr) > 1){
		$curr=conn_fetch_array(conn_sql_query("SELECT * FROM ".TEASERS." WHERE id=\"".$given_arr[1]."\""),PDO::FETCH_ASSOC);
		$suffix="___".$given_arr[1];
		foreach ($curr as $k=>$v) $par[$k.$suffix]=$v;
	}

	$var.="<table width=100%><tr><td width=30% class=bord1>".iho("Текст анонсу")."</td>";
	$var.="<td  class=bord1>".bd_tar_edit(@$par['teasertext'.$suffix],'teasertext'.$suffix,'400px;','100px;',1)."</td></tr>";

	$var.="<tr><td  class=bord1>".iho("Зображення")."</td>";
	$nm='teaserimage'.$suffix;
	$imgname=$nm."_imo";


	$var.="<td class=bord1>";

	if($par[$nm])
	{
		$img=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".PICS." WHERE id=\"$par[$nm]\""));
		$var.="<a href=\"JavaScript:selectimage('$nm')\"><img class=tmb name=$imgname id=$imgname src=\"/gallery/tmb/".$img['filename']."\"></a>&nbsp;&nbsp;&nbsp;";
		$var.="<a href=\"JavaScript:clearimage('$nm')\"><img src=\"/gallery/tmb/no_image_rem.gif\" border=0></a>";
	} else {
		$var.="<a href=\"JavaScript:selectimage('$nm')\"><img class=tmb name=$imgname id=$imgname src=\"/gallery/tmb/no_image.gif\"></a>";
	}


	$var.="<input type=hidden name=\"$nm\" value=\"$par[$nm]\"></td></tr>";
	if (!isset($b)) subselect1();
	$datas=array();
	foreach ($b as $cat){
		$datas[]=$cat['idword'];
		$datas[]=str_repeat(">", ($cat['level']-1)).$cat['title'];
	}

	$var.="<tr><td width=30% class=bord1>".iho("Звязок із сторінкою")."</td>";
	$var.="<td class=bord1>".bd_popup($datas,'teaserlink'.$suffix,'width:400px;border:#CC0000 solid 1px;',3,'')."</td></tr>";

	$var.="<tr><td  class=bord1>".iho("Текст для лінку")."</td>";
	$var.="<td class=bord1>".bd_tf(@$par['textforlink'.$suffix],'textforlink'.$suffix,'text','width:400px;border:#CC0000 solid 1px;',4,'')."</td></tr>";

	$langs=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql,PDO::FETCH_ASSOC);
		$langs[]=$res['lang'];
		$langs[]=$res['langtitle'];
	}

	$var.="<tr><td  class=bord1>".iho("Мова")."</td>";
	$var.="<td class=bord1>".bd_popup($langs,'teaserlang'.$suffix,'width:400px;border:#CC0000 solid 1px;',5,'')."</td></tr>";

	$var.="<tr><td  class=bord1>".iho("Вага тізера")."</td>";

	foreach (range(0,9) as $v) {
		$w[]=$v;
		$w[]=$v;
	}
	$var.="<td class=bord1>".bd_popup($w,'teaserweight'.$suffix,'width:400px;border:#CC0000 solid 1px;',6,'')."</td></tr>";

	$var.='<tr><td class=bord1>&nbsp;</td><td class=bord1><a href="JavaScript:saveteaser(\''.$par["pattidvar"].'\',\'saveteaser\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a></td></tr>';
	$var.="</table>";
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".puttojs($var)."\");</script>";


	return $html;

}


function get_newslike(){
	global $tx,$par,$a,$b;
	$t="";
	$given_arr=explode("___",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG."");
	$var='';

	$suffix='';
	if (count($given_arr) > 1){
		$curr=conn_fetch_array(conn_sql_query("SELECT * FROM ".NEWS." WHERE id=\"".$given_arr[1]."\""),PDO::FETCH_ASSOC);
		$suffix="___".$given_arr[1];
		foreach ($curr as $k=>$v) $par[$k.$suffix]=$v;
	}



	$var.="<table width=100%>";

	$var.="<tr><td width=60 class=bord1>".iho("Заголовок")."</td>";
	$var.="<td width=600 class=bord1>".bd_tf(@$par['newsheader'.$suffix],'newsheader'.$suffix,'text','width:600px;border:#CC0000 solid 1px;',1,'')."</td></tr>";

	$var.="<tr><td class=bord1>".iho("Анонс")."</td>";
	$var.="<td class=bord1>".bd_tar_edit(@$par['newsteaser'.$suffix],'newsteaser'.$suffix,'600px;','60px;',2)."</td></tr>";

	$var.="<tr><td class=bord1>".iho("Повний текст")."</td>";
	$var.="<td class=bord1>".bd_tar_edit(@$par['newsbody'.$suffix],'newsbody'.$suffix,'600px;','400px;',3)."</td></tr>";

	$langs=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql,PDO::FETCH_ASSOC);
		$langs[]=$res['lang'];
		$langs[]=$res['langtitle'];
	}

	$var.="<tr><td colspan=2>";

	$var.=image_maker(@$par["image".$suffix],'newslike');

	$var.='</tr><tr><td class=bord1 colspan=2 style=\'background:#FFCC00;padding:5px;\' ><a href="JavaScript:savenews(\''.$par["pattidvar"].'\',\'savenews\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a></td></tr>';
	$var.="</table>";
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".puttojs($var)."\");</script>";

	return $html;

}


function get_gbook(){
	global $tx,$par,$a,$b;
	$t="";
	$given_arr=explode("___",$par['pattidvar']);
	$sql=conn_sql_query("SELECT * FROM ".LANG."");
	$var='';

	$suffix='';
	if (count($given_arr) > 1){
		$curr=conn_fetch_array(conn_sql_query("SELECT * FROM ".GBOOK." WHERE id=\"".$given_arr[1]."\""),PDO::FETCH_ASSOC);
		$suffix="___".$given_arr[1];
		foreach ($curr as $k=>$v) $par[$k.$suffix]=$v;
	}



	$var.="<table width=100%>";

	$var.="<tr><td width=30%  class=bord1>".iho("Імя")."</td>";
	$var.="<td class=bord1>".bd_tf(@$par['guestname'.$suffix],'guestname'.$suffix,'text','width:500px;',1,'')."</td></tr>";

	$var.="<tr><td class=bord1>".iho("Країна, місто")."</td>";
	$var.="<td class=bord1>".bd_tf(@$par['guestfrom'.$suffix],'guestfrom'.$suffix,'text','width:500px;',2,'')."</td></tr>";

	$var.="<tr><td class=bord1>".iho("Повний текст")."</td>";
	$var.="<td class=bord1>".bd_tar_edit(@$par['guesttext'.$suffix],'guesttext'.$suffix,'500px;','300px;',3,'')."</td></tr>";

	$langs=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql,PDO::FETCH_ASSOC);
		$langs[]=$res['lang'];
		$langs[]=$res['langtitle'];
	}

	$var.="<tr><td  class=bord1>".iho("Мова")."</td>";
	$var.="<td class=bord1>".bd_popup($langs,'lang'.$suffix,'width:500px;border:#CC0000 solid 1px;',4,'')."</td></tr>";

	$var.="<tr><td  class=bord1>".iho("Показувати в книзі")."</td>";
	$var.="<td class=bord1>".bd_popup(array(0,iho('Ні'),1,iho('Так')),'visible'.$suffix,'width:500px;',5,'')."</td></tr>";

	$var.='<tr><td class=bord1>&nbsp;</td><td class=bord1><a href="JavaScript:savegbook(\''.$par["pattidvar"].'\',\'savegbook\')"><img src="img/bt_save.gif" alt="'.$depot["tx"]["ti_save"].'" title="'.$depot["tx"]["ti_save"].'" border=0></a></td></tr>';
	$var.="</table>";
	$html.= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".puttojs($var)."\");</script>";

	return $html;

}



function get_lang(){
	global $tx,$par,$a,$b;
	$t="";
	$var='';

	$currlang=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".LANG." WHERE lang=\"".$par['lng']."\""));
	$suffix='';

	$fh=fopen($_SERVER['DOCUMENT_ROOT']."/tls/lex.front_".$par['lng'],"r");
	$t4x="";
	while ($c = fread($fh,1024)){
		$t4x.=$c;
	}
	fclose($fh);
	$par['lextext']=getfromlex($t4x,$par['lng']);
	$par['encoding']=$currlang['lex_charset'];
	$var.="<h2><br>".iho('Словник для ').$currlang['langtitle']."<h2>";
	$var.="<table width=100%>";

	$var.="<tr><td width=150  class=bord1>".iho("Кодування")."</td>";
	$var.="<td class=bord1>".bd_popup(array("windows-1251","windows-1251","utf-8","utf-8"),'encoding','width:750px;',1,'')."</td></tr>";

	$var.="<tr><td class=bord1>".iho("Зміст словника")."</td>";
	$var.="<td class=bord1>".bd_tar_edit(@$par['lextext'],'lextext','750px','500px;',2,'')."</td></tr>";

	$var.='<tr><td class=bord1>&nbsp;</td><td class=bord1>
	<input type=button id=submt class=save onClick="savelex(\''.$par["pattidvar"].'\',\'savelex\')" title="'.$depot["tx"]["ti_save"].'" value="'.iho('ЗБЕРЕГТИ').'"></td></tr>';
	$var.="</table><input type=hidden name=thelang value='".$par['lng']."'>";
	$html= "<script language=JavaScript>window.top.setvalue(\"".$_REQUEST['pattidvar']."\",\"".puttojs($var)."\");</script>";

	return $html;

}

function get_upddate(){
	global $par,$depot;


	if ($par['which'] == 'server'){
		$thetime = date('H:i:d:m:Y',time());

	} else if ($par['which'] == 'last' || $par['which'] == 'lastpub' ){

		$addon = "";

		if ($par['which'] == 'lastpub') {
			$addon = " AND {$depot['mysql_time_factor']}  ";
		}

		$sql="SELECT CONCAT_WS(':',TIME_FORMAT(ntime,'%H:%i'),DATE_FORMAT(ndate,'%d:%m:%Y'))
		FROM ".NEWS." 
		WHERE lang = \"".$par['lnng']."\"
			AND approved=1
			$addon
		ORDER BY ndate DESC, ntime DESC
		LIMIT 1";

		echo $sql;
		$date_sq=conn_fetch_row(conn_sql_query($sql));
		$thetime=$date_sq[0];

	}

	$html= "<script language=JavaScript>window.top.setDate(\"".puttojs($thetime)."\");</script>";
	return $html;

}

?>
</body>
<html>