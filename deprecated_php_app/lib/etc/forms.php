<?

/*--------------------------- FORM ELEMENTS----------------------------*/
function bd_popup($data,$name,$style,$tab,$script){
		global $par,$depot;
		$ttop='';
		//$depot['errors'][]=$name;
		$selected=(isset($par[$name])) ? stripslashes($par[$name]):"0";

		$bg=(isset($depot['gerrors'])&& in_array($name,$depot['gerrors']))? "class='inputerror'" : "";
		//echo $selected."<br>";
		
		$ttop.="<SELECT NAME=\"$name\" ID=\"$name\" STYLE=\"$style\" $bg TABINDEX=\"$tab\" $script>";
		for ($i=0;$i<count($data);$i++){
			//echo htmlspecialchars(stripslashes($data[$i]))."<br>";
			if ($selected ==stripslashes(trim($data[$i])))$sel="selected"; else $sel="";
			$ttop.="<OPTION VALUE=\"".stripslashes(htmlspecialchars(trim($data[$i])))."\" $sel>".stripslashes(htmlspecialchars($data[$i+1]))."</OPTION>";
			$i++;
		}
		$ttop.="</SELECT>";
		return $ttop;
	
	}

function bd_popup_assoc($data,$name,$style,$tab,$script){
		global $par,$depot;
		$ttop='';
		//$depot['errors'][]=$name;
		$selected=(isset($par[$name])) ? stripslashes($par[$name]):"0";

		$bg=(isset($depot['gerrors'])&& in_array($name,$depot['gerrors']))? "class='inputerror'" : "";
		//echo $selected."<br>";
		
		$ttop.="<SELECT NAME=\"$name\" ID=\"$name\" STYLE=\"$style\" $bg TABINDEX=\"$tab\" $script>";
		foreach ($data as $k=>$v){
			if ($selected ==stripslashes(trim($k))) $sel="selected"; else $sel="";
			$ttop.="<OPTION VALUE=\"".stripslashes(htmlspecialchars(trim($k)))."\" $sel>".stripslashes(htmlspecialchars(trim($v)))."</OPTION>";
		}
		$ttop.="</SELECT>";
		return $ttop;
	
	}

function bd_tf($pr,$name,$type,$width,$tab,$script){
		global $par,$depot;
		$ttop='';
		$value=(isset($pr))? $pr : "";
		//$value=(isset($par[$name]))? $par[$name] : "";
		//$depot['errors'][]=$name;
		$bg=(isset($depot['gerrors'])&& in_array($name,$depot['gerrors']))? "class='inputerror'" : "";
		$ttop.="<INPUT NAME=\"".$name."\" TYPE=\"".$type."\" STYLE=\"".$width."\" $bg TABINDEX=\"".$tab."\" VALUE=\"".htmlspecialchars(stripslashes($value))."\">";
		return $ttop;

	}


function bd_chk($name,$value,$tab,$script,$style=''){
		global $par,$depot;

		$ttop='';
		//$value=(isset($par[$name]))? $par[$name] : "";
		//$depot['errors'][]=$name;
		$bg=(isset($depot['gerrors'])&& in_array($name,$depot['gerrors']))? "class='inputerror'" : "";
		$ttop.="<INPUT NAME=\"".$name."\" TYPE=\"checkbox\" ";
		if ($bg) $ttop.=$bg." ";
		if ($tab) $ttop.="TABINDEX=\"".$tab."\" ";
		$ttop.=" VALUE=\"".htmlspecialchars(stripslashes($value))."\"";
		if (@$par[$name] && trim($par[$name])) $ttop.=" checked";
			
		$ttop.=" style='$style'>";
		return $ttop;

	}



function bd_tar_edit($pr,$name,$width,$height,$tab){
		global $par,$depot;
		$ttop='';
		$value=(isset($pr)) ? $pr : "";
		//$depot['errors'][]=$name;
		$bg=(isset($depot['gerrors'])&& in_array($name,$depot['gerrors']))? "class='inputerror'" : "";
		//$ttop.=bd_edit_menu($name,$width);
		$ttop.= "<TEXTAREA NAME=\"$name\"   ID=\"$name\" STYLE=\"width:$width;height:$height;\" $bg TABINDEX=\"$tab\">".htmlspecialchars(stripslashes($value))."</TEXTAREA>";
		return $ttop;

	}


function bd_tar($pr,$name,$width,$height,$tab,$script=""){
		global $par,$depot;
		$ttop='';
		$value=(isset($pr)) ? $pr : "";
		//$depot['errors'][]=$name;
		$bg=(isset($depot['gerrors'])&& in_array($name,$depot['gerrors']))? "class='inputerror'" : "";
		$ttop.= "<TEXTAREA NAME=\"$name\" STYLE=\"width:$width;height:$height;font-family:Arial,Tahoma,Verdana\" $bg TABINDEX=\"$tab\" $script>".stripslashes($value)."</TEXTAREA>";
		return $ttop;

}


function sql_dropdown($name,$para,$style,$tab,$script,$default){
		global $par,$depot;
		$ttop='';
		if ($default!="leaveasis") $data=array(0,$default); else $data=array();

		$sql=conn_sql_query("SELECT * FROM ".DROPS." WHERE param=\"".$para."\" ORDER BY id");
		for ($i=0;$i<conn_sql_num_rows($sql);$i++){
			$re=conn_fetch_row($sql);
			$data[]=$re[0];
			$data[]=$re[2];
		}
		//$depot['errors'][]=$name;
		$selected=(isset($par[$name])) ? stripslashes($par[$name]):"0";

		$bg=(isset($depot['gerrors'])&& in_array($name,$depot['gerrors']))? "class='inputerror'" : "";
		//echo $selected."<br>";
		
		$ttop.= "<SELECT NAME=\"$name\" ID=\"$name\" STYLE=\"$style\" $bg TABINDEX=\"$tab\" $script>";
		for ($i=0;$i<count($data);$i++){
			//echo htmlspecialchars(stripslashes($data[$i]))."<br>";
			if ($selected ==stripslashes(trim($data[$i])))$sel="selected"; else $sel="";
			$ttop.= "<OPTION VALUE=\"".stripslashes(htmlspecialchars(trim($data[$i])))."\" $sel>".stripslashes(htmlspecialchars(trim($data[$i+1])))."</OPTION>";
			$i++;
		}
		$ttop.= "</SELECT>";
		return $ttop;
	
	}







function bd_multicheck($data,$name,$style){

	global $depot, $par;
	$html="<div style='$style' class='multiselect'><ul>";

	if (!isset($par[$name])) $par[$name] =array();
	foreach ($data as $k=>$v ){
		$checked = (in_array($k,$par[$name])) ? "checked" : "";
		$html.=	"<li><input type='checkbox' name='".$name."[]' value='".$k."' $checked>".$v."</li>";
	}

	$html.="<ul></div>";
	return $html;
}

function bd_radio($name,$value){
	global $par,$depot;
	$checked='';
	if (@$par[$name]==$value) $checked=" checked='checked' ";
	return "<input type='radio' name='$name' value='".stripslashes(htmlspecialchars(trim($value)))."' $checked class='radio'>";
}

function bd_multiselect($data,$name,$style,$tab,$script){
	global $par,$depot;
	$ttop= "<ul class='multicheck'>";
	//if (!isset($par[$name])) $par[$name]=array(0,0);
	$all=@$par[$name];
	$sel="";
	for ($i=0;$i<count($data);$i++){
		if(isset($par[$name])){
			if (in_array($data[$i], $all) && $data[$i]!==0) $sel="checked"; else $sel='';
		}

		$ttop.="<li><input type='checkbox' name=\"".$name."[]\" VALUE=\"".stripslashes(htmlspecialchars(trim($data[$i])))."\" $sel tabindex='$tab'>";

		$ttop.="&nbsp;&nbsp;" .stripslashes(htmlspecialchars(trim($data[$i+1])))."</li>";
		$i++;
	}
	$ttop.= "</ul>";
	return $ttop;
}
?>