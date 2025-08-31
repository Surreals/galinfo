<?
//include("../modulfetcher.php");
$parent_loader=1;


foreach (explode(",","conf,conn,core,forms,initstart,get_auth,checkcookie") as $m)
require_once(dirname(__FILE__)."/../lib/etc/$m.php");

authenticated();

$pagetitle="IMAGES";
$pagedecr="IMAGES";
$pagekeys="IMAGES";


$var_center=aget_center();
require_once(dirname(__FILE__)."/../lib/custom/templ_img.php");



//$js="js_lang";
function aget_center(){
		global $par,$errors,$oks, $tx;
		$ttop=pic_js();
		$ttop.="<iframe src=\"\" name=\"updscript\" id=\"updscript\"></iframe></div>";
		$ttop.= "<form name='ad' method=post enctype=\"multipart/form-data\" >";
		$ttop.= gallery_images_selectview1();
		$ttop.= "<input type = hidden name=show value=\"".@$par['show']."\"></form>";
		return $ttop;
}


function gallery_images_selectview1(){
	global $par,$depot;
	$ttop='';

	if (!isset($par['action'])) $par['action']='imagelib';


	/*if (@$par['show'] !== 'thumb') {
		$onclick="commonAx(\"imagestree\",\"updscript\",[\"upd=listimagestree\",\"id=200\",\"show=thumb\",\"action=".$par['action']."\"]);";
	} else {
		$onclick="commonAx(\"imagestree\",\"updscript\",[\"upd=listimagestree\",\"id=200\",\"action=".$par['action']."\"]);";
	}  */
	

	$aonclick='window.top.passURL';

	if (isset($par['show'])){
		$switch="";
	} else $switch="&show=thumb";

	$ttop.="<div id=errors name=errors></div>
			<div style='position:fixed;top:0;left:0;width:100%;background:#FFCC00;border:#FF9933;text-align:left;#position:absolute;'>
				<a href='/apphlp/imagesrcusr.php?action=imageli$switch' alt='".iho('³���������/����������� ����������')."' style='float:left;padding:2px;'><img src='/var/wwigs/img/mbs/mb_view.gif'></a>
			
			</div>
			
			<table width=100%><tr>	
				<td></td>
			</tr>";
	$sql=conn_sql_query("SELECT * FROM ".PICS." WHERE pic_type=\"".$depot['var']['communitytype']."\" AND userid = \"".sqller($depot['logged_user']['usid'])."\"ORDER BY id DESC");
	if (!conn_sql_num_rows($sql)){
		$ttop.="<tr><td><h2> No Images</h2></td></tr>";
		
	}
	$ttop.="<tr><td style='padding-top:40px;'>";
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		if (@$par['show'] == 'thumb') {
			$ttop.="<span class='imginline75' style='float:left;'><a href='' onClick='JavaScript:$aonclick(\"".$res['id']."\",\"".getImagePath($res['filename']).$res['filename']."\");return false;' ><img src=\"/media/gallery/tmb/".getImagePath($res['filename']).$res['filename']."\" width=63></a><span style='clear:both;width:65px;float:left;font-size:11px;color:#000 !important;'>".$res['filename']."</span></span>";
		} else {
			$ttop.="<span style='clear:both;width:100%;float:left;'><a href='' onClick='JavaScript:$aonclick(\"".$res['id']."\",\"".getImagePath($res['filename']).$res['filename']."\");return false;' class=imname>".$res['filename']."</a></span> ";
		}
	}
	$ttop.="</td></tr></table>";
	/*$ttop.= "
				<script language=JavaScript>
						window.parent.switchImagesTreeVis(1);
						window.parent.setvalueAx(\"imageslist\",\"".puttojs($ttop)."\");
				</script>";	*/
	return $ttop;	
}


function gallery_images_selectview(){
	global $par,$b, $tx, $enviro,$errors,$oks, $allangs;
	$ttop='';
	/*if (!isset($par['id'])) return;
	$vis="display:none;";
	$sql="SELECT name_".$allangs[0]." FROM ".PICTYPE." WHERE kwd=\"".$par['id']."\"";
	$curr_type=conn_fetch_row(conn_sql_query($sql));

	if (conn_error()) die(conn_error());*/
	
	if (!isset($par['action'])) $par['action']='imagelib';


	if (@$par['show'] !== 'thumb') {
		$onclick="commonAx(\"imagestree\",\"updscript\",[\"upd=listimagestree\",\"id=200\",\"show=thumb\",\"action=".$par['action']."\"]);";
	} else {
		$onclick="commonAx(\"imagestree\",\"updscript\",[\"upd=listimagestree\",\"id=200\",\"action=".$par['action']."\"]);";
	}
	
	switch ($par['action']){
		case  'imagelib' :		$aonclick='window.top.pass';break;
		case  'imageintxt' :	$aonclick='window.top.passURL';break;
	}

	$ttop.="<div id=errors name=errors></div>

			<div style='position:fixed;top:0;left:0;width:100%;background:#FFCC00;border:#FF9933;text-align:left;#position:absolute;'>
				<a href='' onClick='".$onclick." return false;' alt='".iho('³���������/����������� ����������')."' style='float:left;padding:2px;'><img src='/gazda/img/mbs/mb_view.gif'></a>
				<a href='' onClick='switchImagesTreeVis(0);return false;' style='float:right;margin-right:10px;'><img src='/gazda/img/bt_close.gif'></a>

			</div>
			<table width=100%><tr>	
				<td></td>
			</tr>";
	$sql=conn_sql_query("SELECT * FROM ".PICS." WHERE pic_type=\"200\" ORDER BY id DESC");
	if (!conn_sql_num_rows($sql)){
		$ttop.="<tr><td><h2> No Images</h2></td></tr>";
		
	}
	$ttop.="<tr><td>";
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$res=conn_fetch_array($sql, PDO::FETCH_ASSOC);
		if (@$par['show'] == 'thumb') {
			$ttop.="<span class='imginline75' style='float:left;'><a href='' onClick='JavaScript:$aonclick(\"".$res['id']."\",\"".getImagePath($res['filename']).$res['filename']."\");return false;' ><img src=\"/gallery/tmb/".getImagePath($res['filename']).$res['filename']."\" width=63></a><span style='clear:both;width:65px;float:left;font-size:11px;color:#000 !important;'>".$res['filename']."</span></span>";
		} else {
			$ttop.="<span style='clear:both;width:100%;float:left;'><a href='' onClick='JavaScript:$aonclick(\"".$res['id']."\",\"".getImagePath($res['filename']).$res['filename']."\");return false;' class=imname>".$res['filename']."</a></span> ";
		}
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
	global $par,$b2, $tx, $enviro,$allangs;
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
		for ($i=0;$i<count($b2);$i++){
			
			$cat=$b2[$i];

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

			if(!isset($b2[($i+1)]) ||  $b2[($i+1)]['level']<=$cat['level']) $class='opened'; 
			
			$ttop.="
			
				<li class='astree' style=\"padding-left:".(($cat['level']-1)*20+10)."px;background-position:".(($cat['level']-1)*20-80)."px -3px;\" >
					<a href='' class='$class' onclick='return expandBranch(\"branch".$cat['id']."\",this);'></a><a href=\"\" onClick='commonAx(\"imagestree\",\"updscript\",[\"upd=listimagestree\",\"id=".$cat['id']."\",\"action=".$par['action']."\"]); return false;'>".stripslashes($cat['name_'.$allangs[0]])."
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
				fname='/gallery/tmb/'+fname;
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
