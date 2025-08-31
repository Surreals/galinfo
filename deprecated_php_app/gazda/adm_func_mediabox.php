<?

function aget_center(){
	global $par;
	$html= "
		<h1 class='fixed'>Фотоколаж на головній</h1><hr>
		<form name='ad' method=post enctype=\"multipart/form-data\" >
	";
	if (!isset($par['su'])) $par['su']='v';
	if (!isset($par['type'])) $par['type']=1;

	switch ($par['su']){
		case "v":			
		case "chng" :		$html.= mediabox_view();		break;

		case "add":		
		case "edit":		$html.= mediabox_edit();			break;

		case "sedit":		
		case "sadd":		$html.= mediabox_sadd();		break;

		case "remove":		$html.= mediabox_rem();	break;
	}
	return $html."</form>";
}



function mediabox_view(){
	global $par,$depot;
	$path="/gazda/?act=mediabox";
	$query="
		SELECT 
				".MEDIABOX.".*,
				".PICS.".filename

		FROM ".MEDIABOX."
		LEFT JOIN ".PICS."
		ON ".MEDIABOX.".imageid = ".PICS.".id
		ORDER BY id DESC
	";

	$sql=conn_sql_query($query) or die(conn_error());
	$b=array();
		
	$html = "
		<a href='' onClick='sbm(\"add\",\"\",\"\"); return false;' style='margin: 0 0 15px;display: block'><img src='/gazda/img/bt_add.gif' style='margin:15px;margin-bottom:-5px;'>ДОДАТИ</a>

		<table class='smart' cellspacing = 0>
			<tr class='header'>
				<td width=10%>Зображення</td>
				<td width=70%>Текст</td>
				<td with=20%>»</td>
			</tr>	
	";
	
	while  ($res = conn_fetch_assoc($sql)) {
		$html.= "
			<tr class='radarow'>
				<td>
					<img src='/media/gallery/tmb/".getImagePath($res['filename']).$res['filename']."'  style='height:30px;' />
				</td>
				<td width=70%>
					<a href='".$path."&su=edit&id=".$res['id']."' style='font-size: 14px;'>".(trim($res['title']) ? $res['title'] : "!!! Без підпису")."</a>
				</td>
				<td with=20%>
					<a href=\"JavaScript:rr('".$res['id']."')\" id=butt class=del title=\"".$depot["tx"]["ti_delete"]."\" style='float:right;'></a>
				</td>
			</tr>
		";
	}

	return  $html."
			<input type = hidden name='act' value='".$par['act']."'>
			<input type = hidden name='su' value=''>
			<input type = hidden name='id' value=''>
		</table>
	";	
}


function mediabox_edit(){
	global $par,$b, $tx, $depot;

	if ($par['su'] == 'edit') {
		$sql = "
			SELECT * 
			FROM ".MEDIABOX."
			WHERE id = \"".sqller($par['id'])."\"
		";

		$sql_run = conn_sql_query($sql) or die(conn_error());
		
		if (!conn_sql_num_rows($sql_run)) return "Epty set";
		else {
			$res = conn_fetch_assoc($sql_run);
			$par['title'] = $res['title'];
			$par['imageid'] = $res['imageid'];
		}
	}
	return "
		<table width=100% cellspacing=0 class='smart'>
			<tr>						
					<td class=heaad width=20%>Параметр</td>
					<td width=80% class=heaad>Значення</td>
			</tr>

			<tr>
				<td class=bord>
					Текст до фото
				</td>
				<td>
					".bd_tar(@$par['title'],'title','100%','100px',0)."
				</td>
			</tr>
			<tr>
				<td class=bord>
					Фото
				</td>
				<td>
					".image_maker(@$par['imageid'],'imageid')."
					<a href='' onClick='showP(\"imageManagerPopup\");return false;' class='camera'><span id='imageqty'>".$depot['var']['imagesqty']."</span></a>
				</td>
			</tr>
			<tr>
				<td class=bord>
				&nbsp;
				</td>
				<td>
					<br><br><input type=submit name=s value='Зберегти'  class=save id='submt'>
					<a href='/gazda/?act=mediabox'  class=cancel id='submt' style='float:right'>Скасувати</a>
				</td>
			</tr>
		</table>
		<input type=hidden name=act value=\"".$par['act']."\">
		<input type=hidden name=su value=\"s".$par['su']."\">
		<input type=hidden name=id value=\"".@$par['id']."\">
	";
}


function mediabox_sadd(){
	global $par, $oks, $errors,$depot;
	
	if ($par['su'] == 'sedit') {
		conn_sql_query("
			UPDATE ".MEDIABOX." 
			SET
			title		=	\"".sqller($par['title'])."\",
			imageid		=	\"".sqller($par['selimgs_imageid'])."\"
			WHERE 
			id = \"".sqller($par['id'])."\"
					
		") or die(conn_error());
	} else {
		conn_sql_query("
			INSERT IGNORE INTO ".MEDIABOX." 
			SET
			title		=	\"".sqller($par['title'])."\",
			imageid		=	\"".sqller($par['selimgs_imageid'])."\"					
		") or die(conn_error());

		if (!conn_insert_id()) {
			$depot['errorі'][] = "Цю фотографію вже використано. Оберіть інакшу, або замініть слайд.";
		}
	}
	
	$limit = 100;
	$cnt = conn_fetch_row(conn_sql_query("SELECT count(*) from ".MEDIABOX." "));
	
	$rest = $cnt[0] - $limit;
	if ($rest > 0 ){
		/*delete extra positions*/
		conn_sql_query("
			DELETE 
			FROM ".MEDIABOX."
			ORDER BY id 
			LIMIT $rest
		");
	}

	$depot['oks'][]="Зміни збережено";
	return mediabox_view();
}


function mediabox_rem(){
	global $par,$depot;
	$ttop='';
	
	if (isset($par['id'])) {
		$sql="DELETE FROM ".MEDIABOX." WHERE id=\"".$par['id']."\"";	
	}

    $res_ = conn_sql_query($sql) or die(conn_error());
	if (conn_affected_rows($res_)) {
			array_unshift($depot['oks'],$depot["tx"]['ok_del1']);
	} else {
		array_unshift($depot['errors'],$depot["tx"]['al_norecs']."<br><br>");
	}
	$ttop.=mediabox_view();
	return $ttop;
}