<?

global $a2,$b2,$p,$previndex,$allangs;
//$js="js_lang";
function aget_center(){

	global $par,$depot;
	$ttop= "<h1 class='fixed'>".iho("Сервісні операції")."</h1><hr><form name='ad' method=post enctype=\"multipart/form-data\" >";

	if (!require_level('ac_props')){
		$depot['errors'][]=$depot['tx']['in_noaccess'];
		return;
	}

	if (isset($par['su'])){
		switch (isset($par['su'])){
			case 'reindex': reindex();break;
		}
	}




	$ar=conn_fetch_assoc(conn_sql_query("SELECT DATE_FORMAT(indexed, '%d.%m.%Y %H:%i:%s')as ltime FROM a_stats"));
	$ttop.="<table width=99% cellspacing=10><tr><td width=60% class=bord height=40><a href=\"/gazda/?act=services&su=reindex\" style=\"padding-left:30px;background:url(/gazda/img/bt_exchange.gif) center left no-repeat;height:20px;line-height:20px;display:block;\">".iho('Поновити індекс для пошуку')."</a><span class=rem style='margin-left:30px;display:block;'>".iho('Процес поновлення індексу за великий проміжок може збільшити навантаження на сервер. В таких випадках обирайте оптимальний час для проведення цієї операції.')."</span></td><td class=bord> ".iho('останнє поновлення: <b>').$ar['ltime']."</b></td></tr>";
	$ttop.="</table>";

	$ttop.= "</table></form>";
	return $ttop;

}



function reindex(){
	global $par,$depot;

	$limit=5;
	$sql0=conn_sql_query("
						SELECT ".NEWS.".id 
						FROM ".NEWS."
							LEFT JOIN ".NEWSI."
							USING (id)
							WHERE  ".NEWSI.".id IS NULL	
							LIMIT $limit
	
	");

	$added=0;
	while ($res=conn_fetch_assoc($sql0)) {

		$sql1=conn_sql_query("
			SELECT 
					
					".NEWSHEAD.".nheader,
					".NEWSHEAD.".nsubheader,
					".NEWSHEAD.".nteaser,
					".NEWSB.".nbody

			FROM ".NEWSB." 
			LEFT JOIN ".NEWSHEAD."
			USING(id)
			WHERE ".NEWSB.".id = ".$res['id']."
			
		") or die(conn_error());

		$res1=conn_fetch_assoc($sql1);

		if (!$res1) continue;

        $res_ = conn_sql_query("
				
				INSERT INTO ".NEWSI." 
				SET
				id = ".$res['id'].",
				indexed = \"".sqller(cleanIndex(implode(" ",$res1)))."\"
			
		") or die(conn_error());

		if (conn_affected_rows($res_)>0){
			$added++;
		}

	}
	if ($added)
		$depot['oks'][]=iho('новин додано до індексу: ').$added;
	else
		$depot['oks'][]=iho(' До індекса не додано жодної новини');


	/*$sql="
			INSERT INTO ".NEWSI." (id,indexed)
			SELECT ".NEWSB.".id, CONCAT_WS(' ',nteaser,nheader,nbody)
			FROM ".NEWSB."
			LEFT JOIN ".NEWSI." AS INDO
			USING(id)
			WHERE INDO.id IS NULL
	";
	conn_sql_query($sql); */


	$sql="
			DELETE ".NEWSI." FROM ".NEWSI."
			LEFT JOIN ".NEWSB."
			USING (id)
			WHERE  ".NEWSB.".id IS NULL
	";

	$res_ = conn_sql_query($sql) or die(conn_error());
	if (conn_affected_rows($res_)>0){
		$depot['oks'][]=iho(' З індекса видалено новин: ' .mysql_affected_rows());
	}

	conn_sql_query("UPDATE ".STATS." SET indexed=NOW()") or die(conn_error());

}


function cleanIndex($str){
	$str=str_replace("&nbsp;",' ',$str);
	$str=strip_tags($str);
	/*$array_t=array(

		"#",
		"^",
		"&",
		"»",
		"«",
		"'",
		"\"",
		".",
		",",
		"[",
		"]",
		"{",
		"}",
		"`",
		"\n",
		"\t",
		"”",
		"„",
		"?",
		"!",
		"’"
		);

	$str=str_replace($array_t,'',$str);
	mb_internal_encoding("UTF-8");
	mb_regex_encoding("UTF-8");	*/
	$pattern=mb_convert_encoding('/[#\^\&\?»«\'",\[\]\}\{\\n\\r”„\!’\:\(\);*\.]/su',"UTF-8");

	$str=preg_replace($pattern,'',$str);
	return $str;
}


?>
