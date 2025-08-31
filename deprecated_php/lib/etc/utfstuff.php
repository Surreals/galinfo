<?

function TranslitAll($st)
  {
    $st=strtr_utf8($st,"абвгґдеёзиійклмнопрстуфхъыэ_","abvggdeezyiyklmnoprstufh'iei");
    $st=strtr_utf8($st,"АБВГҐДЕЁЗИІЙКЛМНОПРСТУФХЪЫЭ_","ABVGGDEEZYIYKLMNOPRSTUFH'IEI");
    $st=strtr($st, array(
                        "ж"=>"zh", "ц"=>"ts", "ч"=>"ch", "ш"=>"sh", 
                        "щ"=>"shch","ь"=>"", "ю"=>"yu", "я"=>"ya",
                        "Ж"=>"ZH", "Ц"=>"TS", "Ч"=>"CH", "Ш"=>"SH", 
                        "Щ"=>"SHCH","Ь"=>"", "Ю"=>"YU", "Я"=>"YA",
                        "ї"=>"i", "Ї"=>"Yi", "є"=>"ie", "Є"=>"Ye", "’"=>""
                        )
             );
    return $st;
}



function strtr_utf8($str, $from, $to) {
    $keys = array();
    $values = array();
    preg_match_all('/./u', $from, $keys);
    preg_match_all('/./u', $to, $values);
    $mapping = array_combine($keys[0],$values[0]);
    return strtr($str, $mapping);
}

function safeUrlStr($string){
	$string=TranslitAll(trim($string));
	$string=str_replace("  "," ",$string);
	$string=str_replace("   "," ",$string);
	$string=str_replace("    "," ",$string);
	$string=str_replace(" ","_",$string);
	return strtolower(preg_replace(array("/(\W+)/su","/[^\x20-\x7E]/"),"",$string));
}

?>