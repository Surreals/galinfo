<?

/*##########################################################################################################*/

function build_form_element($name,$type,$width){
	global $par;
	switch ($type) {
		case 'VARCHAR' : 
		case 'INTEGER' : 
		case 'FLOAT' : 
		case 'TINYINT' : 
		case 'DATE' :
		case 'TIME' : return bd_tar(@$par[$name],$name,"$width","40px",""); break;/*bd_tf(@$par[$name],$name,'text',"width:$width","",""); break;*/
		case 'TEXT' : return bd_tar(@$par[$name],$name,"$width","200px",""); break;
	}
}

/*##########################################################################################################*/

function getCategories($ignoreNode=0,$limitlevel=false,$returnAssoc=false){
	global $depot,$par;


	$order=	array(
				'db'	=>	CTREE,
				'orderby'	=>	'orderid',
				'cond'	=>	''
			);

	order_uni($order);


	$datas=array();

	foreach ($depot['b_uni'] as $cat){ 

		if (@$ignoreNode)	{
			if ($ignoreNode == $cat['id'])	continue;
		}

		if ($limitlevel)	{
			if ($limitlevel < $cat['level'])	continue;
		}
		if (!$returnAssoc){
			$datas[]=$cat['id'];
			$datas[]=str_repeat(".:.......", ($cat['level']-1)).$cat['name_'.$par['lng']];
			
		} else $datas[$cat['id']]=str_repeat(".:.......", ($cat['level']-1)).$cat['name_'.$par['lng']];
	}
	array_unshift($datas,"* * * * * * * * ");
	array_unshift($datas,0);
	return $datas;
}

/*##########################################################################################################*/

function getFixparsTree($ignoreNode=0,$limitlevel=false){
	global $depot,$par;


	$order=	array(
				'db'	=>	FIXPARS,
				'orderby'	=>	'orderid',
				'cond'	=>	''
			);

	order_uni($order);


	$datas=array();
	foreach ($depot['b_uni'] as $cat){ 

		if (@$ignoreNode)	{
			if ($ignoreNode == $cat['id'])	continue;
		}

		if ($limitlevel) {
			if ($cat['level']>$limitlevel)	continue;
		}
		$datas[]=$cat['id'];
		$datas[]=str_repeat(".:.......", ($cat['level']-1)).$cat['name_'.$par['lng']];
	}
	array_unshift($datas,".....".$depot['tx']['choosecat']);
	array_unshift($datas,0);
	return $datas;
}

/*##########################################################################################################*/



function getCommonTree($db,$type,$ignoreNode=0){
	global $depot,$par;


	$order=	array(
				'db'	=>	$db,
				'orderby'	=>	'orderid',
				'cond'	=>	'AND `type`="'.$type.'"',
			);

	order_uni($order);


	$datas=array();
	foreach ($depot['b_uni'] as $cat){ 

		if (@$ignoreNode)	{
			if ($ignoreNode == $cat['id'])	continue;
		}
		$datas[]=$cat['id'];
		$datas[]=str_repeat(" > ", ($cat['level']-1)).$cat['name_'.$par['lng']];
	}
	array_unshift($datas,"..........");
	array_unshift($datas,0);
	return $datas;
}





function build_form_fields($columns,$exclusion,$props,$allowed,$multi){
	global $depot, $par;
	$pairs=array();
	while ($res=conn_fetch_assoc($columns)){

		if (in_array($res['Field'],$exclusion) || in_array($res['Field'],$multi)) {
			continue;
		}

		if (count($allowed)){
			if (!in_array($res['Field'],$allowed)) {
				continue;
			}

		}

		
		$current_type= $depot['type_guess'][substr($res['Type'],0,3)];
		$element='';
		if (strtolower($res['Type']) == 'tinyint(1) unsigned'){
			$element.=bd_radio($res['Field'],"1")." ".$depot['tx']['yes']."&nbsp;&nbsp;&nbsp;";
			$element.=bd_radio($res['Field'],"0")." ".$depot['tx']['no'];
		}  else {
			switch ($res['Field']) {
				case 'img'	:	$element="$img<input type=file name=img style='width:400px;'>"; break;
				case 'city':	$element=bd_popup($depot['vars']['city'],'city','width:400px','','onChange = "ajax_request(\'upd=getregions&id=\'+this.value)"');break;
				case 'region':	$element="<div id='regionspop'>".bd_popup($depot['vars']['region'],'region','width:400px','','')."</div>";break;
				case 'filters':	$element=build_filters();break;
				default		:	
							if ($props[$res['Field']]['multi']){
								$element='';
								$etabs='';
								$fountFirst=false;
								foreach ($depot['vars']['langs'] as $lng=>$lngArray){

									if (!$fountFirst) {
										$aclass='activeLanguageTab';
										$divclass='activeLanguageHolder';
										$fountFirst=true;
									} else {
										$aclass='inactiveLanguageTab';
										$divclass='inactiveLanguageHolder';
									}

									$etabs.="<a href='' onClick='return switchLanguageTab(\"".$res['Field']."\",\"$lng\")' class=$aclass id='a_".$res['Field']."_$lng'>".$lngArray['langtitle']."</a>";

									$element.="<div class=$divclass id='div_".$res['Field']."_$lng'>".build_form_element($res['Field']."_".$lng,$current_type,'400px')."</div>";	
							   }

							   $element="<div id='".$res['Field']."'>".$etabs.$element.'</a>';

							}	else if ($props[$res['Field']]['fixpars']) {

								$element=build_multiselect_form_element($res['Field'],$props[$res['Field']]['fixpars'],'400px');
								
							}
								else
							{
								$element=build_form_element($res['Field'],$current_type,'400px');
							}
			} 
		}

		$pairs[]=array($props[$res['Field']]['fieldname'],$element);
	}

   return $pairs;
}






function build_multilang_field($parameter,$current_type,$width,$ckeditor=false,$clearcss=false){
	global $depot, $par;
	$pairs=array();
	
	
	$element='';
	$etabs='';
	$fountFirst=false;
	foreach ($depot['vars']['langs'] as $lng=>$lngArray){

		if (!$fountFirst) {
			$aclass='activeLanguageTab';
			$divclass='activeLanguageHolder';
			$fountFirst=true;
		} else {
			$aclass='inactiveLanguageTab';
			$divclass='inactiveLanguageHolder';
		}

		$etabs.="<a href='' onClick='return switchLanguageTab(\"".$parameter."\",\"$lng\")' class=$aclass id='a_".$parameter."_$lng'>".$lngArray['langtitle']."</a>";

		/*$etabs.="<a href='' onClick='return switchLanguageTab(\"".$parameter."\",\"$lng\")' class=$aclass id='a_".$parameter."_$lng'>&darr;</a>";*/

		$element.="<div class=$divclass id='div_".$parameter."_$lng'>".build_form_element($parameter."_".$lng,$current_type,$width)."</div>";
		if ($ckeditor) {
			$element.="<script type='text/javascript'>";

			if ($clearcss) $element.="
					CKEDITOR.editorConfig = function( config ){config.height = 400;config.contentsCss ='';};";
			$element.="
					CKEDITOR.replace( '".$parameter."_$lng' );
				</script>";
		}
   }

   $element="<div id='".$parameter."'>".$etabs.$element.'</div>';
   return $element;
}




function getTableFields($table){
	global $par,$depot;




	$multilang_fields=array();

	$sql= "
	 		SELECT	*
			FROM	".PRODPROPS."
			WHERE		tablename = '".	$table ."'
			ORDER BY tablename, id
	 ";
	 $sql=conn_sql_query($sql) or die(conn_error());
	 $props=array();
	 $datas=array();
	  while ($res=conn_fetch_assoc($sql)){
		  $props[$res['fieldname']] = array(
											'fieldname'	=>$res['fieldtitle'],
											'multi'		=>$res['ismulti']
									);

		  if ($res['ismulti']){	
				foreach ($depot['vars']['langs'] as $lang=>$langarray){
					 $multilang_fields[]= $res['fieldname']."_".$lang;
				}
		  }
		 
	 }
	
	
	 $sql1="
				SHOW COLUMNS
				FROM 
				".$table."

	";

	$columns1=conn_sql_query($sql1);
	while ($res=conn_fetch_assoc($columns1)){
		  if ($res['Field'] !=='id' && $res['Field'] !=='itemid' && $res['Field'] !=='description')
			$datas[]=$res;	
	}

	$list='';
	for ($i=0;$i<count($datas);$i++){
		if (in_array($datas[$i]['Field'],$multilang_fields)) continue;


		if (isset($par['active_fields']) && in_array(trim($datas[$i]['Field']),$par['active_fields'])) {
			$checked='checked';
		}
		
		else  $checked='';

		$list.="<li class='datarowajaxed'><input type='checkbox' name='active_fields[]' style='margin-right:20px !important;' value='".stripslashes(htmlspecialchars(trim($datas[$i]['Field'])))."' $checked>".stripslashes(htmlspecialchars(trim($props[$datas[$i]['Field']]['fieldname'])))."</li>";
	}



	$data_fields="
					   <div style='width:100%;height:180px;overflow:auto;background:#FFF;border:#CCC 1px solid;'>
							<ul class='clearul'>
								$list
							</ul>
					   </div>
	";
	return $data_fields;
}



function build_multiselect_form_element($field,$parentgroup,$width){

	global $depot, $par;
	$sql=conn_sql_query("SELECT * FROM ".FIXPARS." WHERE parentword = \"$parentgroup\" ORDER BY name_".$par['lng']);
	$html="<div style='width:$width;' class='multiselect'><ul>";

	if (!isset($par[$field])) $par[$field] =array();
	while ($res = conn_fetch_assoc($sql)){
		$checked = (in_array($res['id'],$par[$field])) ? "checked" : "";
		$html.=	"<li><input type='checkbox' name='".$field."[]' value='".$res['id']."' $checked>".$res['name_'.$par['lng']]."</li>";
	}

	$html.="<ul></div>";
	return $html;
}

?>