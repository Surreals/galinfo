<?php


global $a,$p,$previndex, $allangs;

$parent_loader=1;
header("Pragma: no-cache;\n");
require_once("../lib/etc/conf.php");
require_once("../lib/etc/conn.php");
require_once("../lib/etc/core.php");
require_once("adm_func.php");

$langsql=conn_sql_query("SELECT * FROM ".LANG." ORDER BY id");
for ($i=0;$i<conn_sql_num_rows($langsql);$i++){
	$rs=conn_fetch_assoc($langsql);
	$allangs[]=$rs['lang'];

}


$pagetitle="IMAGES";
$pagedecr="IMAGES";
$pagekeys="IMAGES";


$var_center=aget_center();
require_once("adm_templ_img.php");



//$js="js_lang";
function aget_center(){
		global  $par,$depot,  $tx;
		$ttop=pic_js();
		$ttop.="<iframe src=\"#\" name=\"updscript\" id=\"updscript\"></iframe></div>";
		$ttop.= "<form name='ad' method=post enctype=\"multipart/form-data\" >";
		$ttop.="
						<div style='width:90%;padding:5px;text-align:left;'>".
							bd_tf(@$par['q1'],'q1','text','width:150px','','').
						
						
						"
						<input type='submit' name='search' value='Search' style='background:#009900;color:#FFF;font-weight:bold;padding:0 10px;'>
						</div>";

		

		if (@$par['search']) {
			$ttop.=gallery_search();
		} else {
			if (!isset($par['su'])) $par['su']='v';
			$ttop.= gallery_selectview();
		}
		
		$ttop.= "<input type = hidden name=show value=\"".@$par['show']."\">
				<input type=hidden name='openbranch' value='".@$par['openbranch']."'>
				</form>";
		return $ttop;
}


function gallery_search(){
	global  $par,$b, $tx, $enviro,$depot,  $allangs;
	$ttop='';
	if (!isset($par['action'])) $par['action']='imagelib';
	switch ($par['action']){
		case  'imagelib' :		$aonclick='window.top.pass';break;
		case  'imageintxt' :	$aonclick='window.top.passURL';break;
	}

	$ttop.="<div id=errmess></div>
			<table width=100%><tr>	
				<td></td>
			</tr>";

	$sqlCommand="
				SELECT * FROM 
				".PICS." WHERE 
				filename LIKE \"%".sqller($par['q1'])."%\" 
				OR title_ua LIKE \"%".sqller($par['q1'])."%\" 
				OR tags LIKE \"%".sqller($par['q1'])."%\" 
				ORDER BY id DESC
				
				";
	$sql=conn_sql_query("$sqlCommand") or die($sqlCommand."<hr>".conn_error());
	if (!conn_sql_num_rows($sql)){
		$ttop.="<tr><td><h2> No Images</h2></td></tr>";
		
	}

	$ttop.="<tr><td>";
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		$ttop.="<span style='clear:both;width:100%;float:left;'><a href='' onClick='JavaScript:$aonclick(\"".$res['id']."\",\"".getImagePath($res['filename']).$res['filename']."\");return false;'><img src=\"/media/gallery/tmb/".getImagePath($res['filename']).$res['filename']."\" width=70 style='padding:0 20px;'></a><b style='margin-top:-20px;'>".$res['filename']."</b></span> ";
		
	}
	$ttop.="</td></tr></table>";
	$ttop.= "
				<script language=JavaScript>
						window.parent.switchImagesTreeVis(1);
						window.parent.setvalueAx(\"imageslist\",\"".puttojs($ttop)."\");
				</script>";
	return $ttop;
}


function gallery_selectview(){
	global $par,$depot, $tx, $enviro,$allangs;
	$ttop='';

	$ttop.="<div id='imageslist' style='' class='hidden'></div>";

	$ttop.="<div id='imagestree'>";

	$ttop.="<ul class='dropselect'>";
	$rulerwidth=90;
	/*$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");*/
	$sql=conn_sql_query("SELECT * FROM ".PICTYPE." ORDER BY id");
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	subselect2();

	if (!isset($par['action'])) $par['action']='imagelib';

	if (!conn_sql_num_rows($sql)){
		$ttop.= "<h1> No Images</h1>";
	} else {
		$currentLevel=1;
		$currentParent='0';

		/*foreach ($b2 as $cat){*/ 
		for ($i=0;$i<count($depot['b2']);$i++){
			
			$cat=$depot['b2'][$i];

			/*$currcolor=$colors[1];
			if (isset($par['id']) && ($par['id'] == $cat['kid'])) $currcolor="#FFFF66";*/ 
			
			$class='closed';							
			if($currentLevel<$cat['level']){

				$ttop.="<li id='branch".$currentParent."' style='display:none;'><ul>";
			}
			else if ($currentLevel>$cat['level']){

				$qty=$currentLevel-$cat['level'];

				while($qty>0){

					$ttop.="</ul></li>";
					$qty--;
				}
			}

			if(!isset($depot['b2'][($i+1)]) ||  $depot['b2'][($i+1)]['level']<=$cat['level']) $class='opened'; 
			
			$ttop.="
			
				<li class='astree' style=\"padding-left:".(($cat['level']-1)*20+10)."px;background-position:".(($cat['level']-1)*20-80)."px -3px;\" >
					<a href='' class='$class' onclick='return expandBranch(\"branch".$cat['id']."\",this);'></a><a href=\"\" onClick='commonAx(\"imagestree\",\"updscript\",[\"upd=listimagestree\",\"id=".$cat['id']."\",\"action=".$par['action']."\"]); return false;'>".getfromdb(stripslashes($cat['name_'.$allangs[0]]),$allangs[0])."
					</a>
					
				</li>
				
				
				";

			/*$ttop.="
			
				<li class='astree' style=\"padding-left:".(($cat['level']-1)*20+10)."px;background-position:".(($cat['level']-1)*20-80)."px -3px;\" >
					<a href='' class='$class' onclick='return expandBranch(\"branch".$cat['id']."\",this);'></a><a href=\"\" onClick=\"JavaScript:sbm('viewimages','".$cat['id']."','')\"'>".getfromdb(stripslashes($cat['name_'.$allangs[0]]),$allangs[0])."
					</a>
					
				</li>
				
				
				"; */
			
			
			$currentLevel= $cat['level'];
			$currentParent=$cat['id'];
		}

		}
	
	
	$ttop.="</ul></div>";
	
	$ttop.=  "<input type=hidden name=su value=\"".@$par['su']."\"><input type=hidden name=id value=\"".@$par['id']."\">";
	return $ttop;
}





function pic_js(){
$r=<<<JSCR

 <script language="javaScript">

		  <!--
			
			function passto(id,fname,formobj){
				//document.write(fname);
				//polop=fname
				//document.write(polop)
				fname='/media/gallery/tmb/'+fname;
				eval("opener.document.ad."+formobj+".value = id");
				eval("opener.document.ad."+formobj+"_imo.src = fname");
				window.close();
				
			}


			function chgImView(){
				var currview = document.forms['ad'].show.value;
				if (currview == 'list') {
					document.forms['ad'].show.value = 'thumb';
				} else  if(currview == 'thumb') {
					document.forms['ad'].show.value = 'list';
				} else document.forms['ad'].show.value = 'list';
				document.forms['ad'].submit();
				return false;
			}


		//-->
		 </script>
JSCR
;

return $r;
}

?>
