<?

global $a,$p,$previndex;

function aget_center(){
		global $par,$depot,  $tx;
		
		/**if (!require_level('ac_usercomm'))	return;*/

		require_once("../lib/etc/mailers.php");

		
		$html=lang_js();
		$html.= "<h1>".iho('C�������')."</h1><hr><form name='ad' method=post enctype=\"multipart/form-data\">";
		if (!isset($par['su']) || !$par['su']) $par['su']='view';
		switch ($par['su']){
			case "view":	$html.= cusers_view();	break;
			case "add":		$html.= cusers_add();	break;
			case "edit":	$html.= cusers_add();	break;
			case "remove":	$html.= cusers_del();	break;
			case "refuse":	$html.= cusers_refuse();	break;
			case "approve":	$html.= cusers_add();	break;

		}
		$html.= "</form>";
		return $html;

}



function cusers_view(){
	global $par,$b, $tx, $depot;
	$html='';
	
	$html.="<a href=\"/gazda/?act=community&su=add\" style='float:right;margin-top:-35px;position:relative;' class=addsome><span> ".iho('������')."</span></a>";

	$addsql="";
	$path="/gazda/?act=community";

	if (@$par['sname']) {
			$addsql.=" AND ".FUSERS.".name LIKE \"%".sqller($par['sname'])."%\"";
			$path.="&sname=".htmlspecialchars($par['sname']);
	}

	if (@$par['suname']) {
		$addsql.=" AND ".FUSERS.".uname   LIKE \"%".sqller($par['suname'])."%\"";
		$path.="&suname=".htmlspecialchars($par['suname']);
	}




	$sql_qty="	SELECT 
				COUNT(*) 
				FROM ".FUSERS." 
				WHERE 1 ".$addsql;
	//echo $sql_qty;
	$count1=conn_sql_query($sql_qty) or die(conn_error());

	if (!isset($par['pg'])) $par['pg']=0;
	//$perpage=$enviro['comments_per_page'];
	$perpage=50;
	$count=conn_fetch_row($count1);
	$pages=($count[0]%$perpage) ? (int)($count[0]/$perpage+1) : $count[0]/$perpage;

	$ppg=10;
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
	
	$pager_html='';
	if ($pages>1) {
		$pager_html.="<div class=pager>";
		$pager_html.= $pprev_page.$prev_page;
		for ($i=$start_page;$i<$end_page;$i++){
			if ($par['pg']!=$i)
			$pager_html.= "<a href=\"$path&pg=$i\">".($i+1)."</a>";
			else $pager_html.= "<span>".($i+1)."</span>";
		}
		$pager_html.= $next_page.$nnext_page;

		$pager_html.="<div style='padding-left:50px;font-size:18px;float:left;'>/ ".$count[0]."</div>";
		$pager_html.="</div>";
	} else {
		$pager_html.="<div style='font-size:18px;float:left;'>/ ".$count[0]."</div>";
	}

	

	$html.="
			<div style='padding:5px;background:#EEE;'>
				<table><tr>";


	$html.="<td width=150>".iho("��'�:")."<br>";
	$html.=bd_tf(@$par['sname'],	'sname','text', 'width:150px',	1,	'')."</td>";

	$html.="<td width=30>&nbsp;</td><td width=150>".iho('E-mail:')."<br>";

	$html.=bd_tf(@$par['suname'],	'suname','text', 'width:100px',	1,	'')."</td>";

	$html.="<td width=30>&nbsp;</td><td><input type=hidden name=pg value=0><input type='submit' name='io' id='submt' value='".iho('Գ���������')."'></td>";


	$html.="</tr></table></div>";

$html.=$pager_html;

	$html.="<div class='clean'></div>
			<table width=100% cellpadding=5 cellspacing=1>
			<tr>
				<td class=heaad width=25%>".$depot['tx']["he_user"]."</td>
				<td class=heaad width=25%>".iho("e-mail")."</td>
				<td class=heaad width=15%>".$depot['tx']["he_permission"]."</td>
				<td class=heaad width=15%>".iho("���� ���������")."</td>
				<td class=heaad>".$depot['tx']["he_operations"]."</td>
			</tr>";

	$rulerwidth=90;

	$colors=array("#FFE8E8","#F5F5F5","#EEEEEE","#E5E5E5","#DDDDDD","#D5D5D5","#CCCCCC");
	$sql=conn_sql_query("
					SELECT * FROM 
					".FUSERS." 
					WHERE 1 ".$addsql." 
					ORDER BY approved, name 
					LIMIT	".$par['pg']*$perpage.",".$perpage);
	$b=array();
	for ($i=0;$i<conn_sql_num_rows($sql);$i++){
		$b[]=conn_fetch_array($sql, PDO::FETCH_ASSOC);
	}
	
	$services_array = array(1=>iho("�����"),2=>iho("�������"),3=>iho("��������/�����")/**/);

	if (!conn_sql_num_rows($sql)){
		$html.= "<tr><td colspan=5 class=bord style=\"text-align:center !important;\"> * * * * * * * * * * * * * * * </td></tr>";
	} else {

		foreach ($b as $cat){ 

			$currcolor=$colors[1];
			if (!$cat['approved'])  $currcolor="#FFDFDF"; 
			if (isset($par['id']) && ($par['id'] == $cat['id'])) $currcolor="#FFFF66"; 

			$services_titles=array();
					
			foreach (explode(',',$cat['services']) as $k){
				if ($k)
				$services_titles[]=$services_array[$k];
				
			}
			$services="<div class='rem'>".implode(", ",$services_titles)."</div>";

			$html.="<tr>
					<td class=bord style=\"padding-left:10px;background-color:".$currcolor."; background-image: url(img/ruler.gif);background-position: -80px -3px; background-repeat:no-repeat;\">&#8226;&nbsp;".stripslashes($cat['name'])."</td>
					<td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($cat['uname'])."</td>
					<td class=bord style=\"background-color:".$currcolor.";\">".stripslashes($services)."</td>
					<td class='bord rem' style=\"background-color:".$currcolor.";\">".$cat['regdate']."</td>
					<td class=bord>";

			$html.="<a href=\"JavaScript:sbm('edit','".$cat['id']."','')\" id=butt class=edit title=\"".$depot['tx']["ti_edit"]."\"></a>";

			$html.="<a href=\"JavaScript:rr('".$cat['id']."')\" id=butt class=del title=\"".$depot['tx']["ti_delete"]."\" style='margin-left:20px;'></a>";

			$html.="</td></tr>";
		}

	}
	$html.="</table>";
	$html.="<div name='langlex' id='langlex'></div>";
	$html.=  "<input type=hidden name=act value=\"community\"><input type=hidden name=su value=\"\"><input type=hidden name=id value=\"\"><input type=hidden name=par value=\"\">";
	return $html.$pager_html;
}


function cusers_add(){
	global $par, $depot,   $tx, $lngs1, $accessr,$lxs, $depot,$_FILES;
	$html='';
	$ly=1;
	$functions=array('1',iho("������"),'2',iho('�������'),'3',iho("��������/�����")/*,,'3',$depot['lxs']['ask_afisha']*/)	 ;


	$image="<img src='/im/noimage.jpg'>";
	if (!isset($par['sudir'])){
		
		/*------------------------------------*/
		if($par['su'] == 'edit') {
			$q11=conn_sql_query("SELECT * FROM ".FUSERS." WHERE id=\"".$par['id']."\"");
			$q1=conn_fetch_array($q11, PDO::FETCH_ASSOC);
			foreach ($q1 as $k=>$v)	{
				if ($k!=='services')
				$par[$k]=$v;
				else $par['services']=explode(",",$v);
			}


			/*FOR image*/
			$imagesSQL=conn_sql_query("SELECT * FROM ".PICSU." WHERE userid=\"".sqller($par['id'])."\"");
			if (conn_sql_num_rows($imagesSQL)>0){
				$res=conn_fetch_assoc($imagesSQL);
				$image="<img src='/media/avatars/".$res['filename']."?ts=".RAND()."'>";	
				$html.="<input type='hidden' name='imageid' value='".$res['id']."'>";
			} 
		


		}


		/*-------------------------------------*/

		if ($par['su'] == 'add')
		$html.="<h2>".iho('�������� �����������')."</h2>";
		else 
		$html.="<h2>".iho('���������� �����������')."</h2>";

		$html.= "
			<table width=\"100%\"  cellspacing=10>
				<tr><td width=\"70%\" class=heaad>".iho("�����")."</td><td width=\"30%\" class=heaad>".iho("ĳ�")."</td></tr>
				<tr><td><h3><br>".$depot['tx']['he_personal']."</h3><hr>
			<table width=100%>

			<tr>
				<td width=220>
					$image
					<input type=\"FILE\" name=\"filename\" style=\"width:200px;border:#CC0000 solid 1px;\" value=\"\"/>
				</td>
				<td>
					<b style='display:block;padding-bottom:5px;'>".iho("��'�, ������� ��� ��������")."</b>
					".bd_tf(@$par['name'],'name','text','width:100%','','1')."
					<br><br><b style='display:block;padding-bottom:5px;'>".iho('�������� ���������')."</b>
					
					 ".bd_multiselect($functions,'services','',9,'')."
				
				</td>
			</tr>
			
		

			<tr>
				<td colspan=2>
				<br><b style='display:block;padding-bottom:5px;'>".iho("����� (��� �������)")."</b>
					".bd_tar(@$par['twowords'],'twowords','100%','50px;','','1')."</td>
			</tr>

			<tr>
				<td colspan=2>
				<br><b style='display:block;padding-bottom:5px;'>".iho("��� ����������� (��� �������)")."</b>
					".bd_tar(@$par['shortinfo'],'shortinfo','100%','250px;','','1')."</td>
			</tr>
			
			</table>";

		
		$html.="<h3><br>".$depot['tx']['he_auth']."</h3><hr>";

		if ($par['su']=='add'){
			$html.="
				<table cellspacing=10 width=100%>
					<tr><td width=30%><b>E-mail</b></td>
					<td>".bd_tf(@$par['uname'],'uname','text','width:300px;','','1')."</td></tr>
					<tr><td width=30%><b>".$depot['tx']['he_pass']."</b> (6-20)</td><td>".bd_tf(@$par['upass'],'upass','text','width:300px;','','1')."</td></tr>
					<tr><td></td><td><div class=notice>".$depot['tx']['in_passalert']."</div></td></tr>
				";
		} else {
			$html.="<table width=100% cellspacing=10>
					<tr>
						<td width=30%>
							<b>".$depot['tx']['he_username']."</b>

						</td>
						<td>
							<div class=inact>".@$par['uname']."</div>
							<input type=\"hidden\" name=\"uname\" value=\"".$par['uname']."\">
						</td>
					</tr>
					<tr>
						<td  width=30%><b>".
							$depot['tx']['he_pass']."</b>
						</td>
						<td>".
							bd_tf('','upass','text','width:100px;','','1').
							"&nbsp;<span style='background:#FFCCFF;padding:5px;'>".bd_chk('chngpass','1','','')."<label class=in>".$depot['tx']['he_chngpass']."</label></span>
						</td>
					</tr>";
					
		}

		$html.="
				<tr>
					<td>&nbsp;</td>
					<td>
						<div style='background:#EEFFDD;border:#66CC33 dotted 1px;padding:5px; 0;'>".bd_chk('approved','1','','')."<label for='approved'  class=in>".$depot['tx']['he_active']."</label>
					</td>
				</tr>
				<tr>
					<td colspan=2>
						<div class=sbm>
							<input type=button value=\"".$depot['tx']["bt_save"]."\" id=submt class='save' onClick=\"sbm('','','save')\">
						</div>
					</td>
				</tr>
				
				
				</table>";



		$html.="</td><td width=50% valign=top>"; 
		if ($par['su']=='edit'){

			if (!@$par['approved'])	{

				$html.="	
						
						<div style='background:#FFFFCC;border:#090 dotted 1px;padding:20px;margin-top:20px;'>
							<input type=button value=\"".iho('ϳ���������')."\" id=submt class='save' onClick=\"sbm_su('','','approve')\" style='float:right;margin-top:-50px;position:relative;'><h2>".iho("ϳ��������� ���������")."</h2>
							<input type='checkbox' name='sendapprove'>&nbsp;&nbsp;".iho("�������� �-����� ��� ������������")."<br/><br/>
						</div>
						<div style='height:20px;'></div>";

			}
				$html.="	
						

						<div style='background:#FFE6E6;border:#C00 dotted 1px;padding:20px;clear:both;'>
							<input type=button value=\"".iho("³�������")."\" id=submt class='cancel' onClick=\"sbm_su('','','refuse')\" style='float:right;margin-top:-50px;position:relative;'><h2>".iho("³������� � ���������")."</h2>
							<input type='checkbox' name='sendrefusemail'>&nbsp;&nbsp;".iho("�������� �-����� ��� ������� ������")."<br/><br/>
							
							<b>".iho("������� ������")."</b>
							".bd_tar(@$par['refusetext'],'refusetext','100%','50px','1')."
						</div>
			";




		}

		$html.="</td></tr></table>";



	} else if  ($par['sudir']=="save" || $par['su']=="approve"  ){

		
		if($par['su'] == 'add') {

			
			chk_req("uname",$depot['tx']['he_username']);
			chk_occupied("uname",FUSERS,"uname",$depot['tx']['he_username']);

			chk_req("upass",$depot['tx']['he_pass']);
		}
		
		if ($depot['errors']) {
			unset($par['sudir']);
			return cusers_add();

		}

		$uid=generate_unique(32);

		$active="";

		if ($par['su'] == 'approve' || isset($par['approved']))  $active=substr(md5($par['uname'].$depot['enviro']['login-key']),0,10);
		
		if($par['su'] == 'add') {


			$par['uniqueid']=generate_unique(32);
			$seed=generate_unique(16);
			$par_s=array('uname','name','uniqueid','services','humancheck','twowords','shortinfo');

			$sql="INSERT INTO ".FUSERS." SET ";
			foreach ($par_s as $field){
				$field=trim($field);

				if (is_array(@$par[$field])){
						/*$sql.="$field=\"".sqller(':'.join(':',@$par[$field]).':')."\",";*/
						  $sql.="$field=\"".sqller(join(',',@$par[$field]))."\",";
					}
					else 
					{
						$sql.="$field=\"".sqller(@$par[$field])."\",";
				}

			}
			//echo $sql;
			$sql.=" 
					upass=MD5(\"".$par['upass'].$seed."\"), 
					seed=\"".$seed."\", 
					ulang = \"1\",
					approved=	\"$active\"

			";




/*

			$sql.="	
					
					uname =		\"".		sqller($par['uname']).		"\",
					upass=MD5(\"".			$par['upass']."\") ,
					firm	=	\"".		sqller($par['firm']).	"\",
					email	=	\"".		sqller($par['email']).	"\",
					firstname	=	\"".	sqller($par['firstname']).	"\",
					lastname	=	\"".	sqller($par['lastname']).	"\",
					services=		\"".	sqller(implode(',',$par['services'])).	"\",
					uniqueid	=	 \"".	$uid."\",
					";
*/



            $res_ = conn_sql_query($sql) or die(conn_error());
			if (conn_affected_rows($res_)>0) {
				/*hist(1,conn_insert_id());*/
				processAvatar(conn_insert_id(),'add');
				$depot['oks'][]='1 '.$depot['tx']['ok_recordsadded'];
			}


		} else {

			

			$sql="UPDATE ".FUSERS." SET ";
			$sql.="	
					name	=	\"".	sqller($par['name']).	"\",
					services=		\"".	sqller(@implode(',',@$par['services'])).	"\",
					twowords=		\"".	sqller(@$par['twowords']).	"\",
					shortinfo=		\"".	sqller(@$par['shortinfo']).	"\",
					uniqueid	=	 \"".	$uid."\",
					approved=		\"$active\"";


			$seed=generate_unique(16);
			if (@$par['chngpass'] && $par['upass']) 
				$sql.="
						, upass =\"".	md5($par['upass'].$seed).	"\"
						, seed =\"".$seed.	"\"
			"; 



			$sql.=" WHERE id=\"".sqller($par['id'])."\"";
            $res_ = conn_sql_query($sql) or die(conn_error());

			processAvatar(sqller($par['id']),'edit');

			if (conn_affected_rows($res_)>0) {


				$depot['oks'][]=$depot['tx']['ok_edited'];

				if ($par['su'] == 'approve'){

					$services_array = array(1=>iho("�����"),2=>/*iho("�������"),3=>*/iho("��������/�����")/**/);

					 if (isset($par['sendapprove'])) {
						$res=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".FUSERS." WHERE id=\"".$par['id']."\""));
						
						$services="";


						foreach (explode(',',$res['services']) as $v){

							$services.="- ".$services_array[$v]."\n";
						}
						$arr=array(
									"name" =>	$res['name'],
									"services"	=>	$services
									
						);

						$email=parse_local($arr,'mailtplApproveRegistration',1);
						$subject = $depot['lxs']['regsubject'];
						quick_mail($res['uname'],mb_convert_encoding($subject,"windows-1251",$depot['encd']), mb_convert_encoding($email,"windows-1251",$depot['encd']),$depot['enviro']['daemon-email']);

					}
				}
			}
		}
		return cusers_view();
	}

	$html.= "<input type=hidden name=act value=\"community\">
	<input type=hidden name=sudir value=\"\">
	<input type=hidden name=su value=\"".$par['su']."\">
	<input type=hidden name=id value=\"".@$par['id']."\">";
	return $html;

}

function processAvatar($userid,$action){
	global $depot,$par,$_FILES;

	require_once("../lib/custom/avatarimg.php");

	
	if ($action=='add' && isset($_FILES['filename'])&&($_FILES['filename']['name']!='')){
	

		if (tmp_file_save('filename',0)){
				
				
				$query ="
							INSERT INTO ".PICSU." 
							SET 
							filename=\"".conn_real_escape_string(stripslashes($depot['vars']['ppic']))."\",
							userid=\"".$userid."\"
							
							
						";

						conn_sql_query($query) or die(conn_error());

			
		}
		
	}  else if ($action=='edit') {
		
		if (isset($par['imageid'])){
			$sql="SELECT * FROM ".PICSU." WHERE id =\"".sqller($par['imageid'])."\"";
			$res=conn_fetch_assoc(conn_sql_query($sql));
		
			if (conn_error()) echo conn_error();

			if (!@$res['filename']){
				$res['filename']=0;
			}
		} else {
			$res['filename']=0;
		}
		
		$saved_file=tmp_file_save('filename',$res['filename']);
		if ($res['filename']==0 && $saved_file){
			$query ="
					INSERT INTO ".PICSU." 
					SET 
					filename=\"".conn_real_escape_string(stripslashes($depot['vars']['ppic']))."\",
					userid=\"".$userid."\"
					
					
				";

				conn_sql_query($query) or die(conn_error());
		}

	}

	echo errors();
}



function cusers_del(){
	global $par,$depot, $b, $tx;
	$html='';

    $res_ = conn_sql_query("DELETE FROM ".FUSERS." WHERE id=\"".$par['id']."\"");
	if (conn_affected_rows($res_)) {
		array_unshift($depot['oks'],$depot['tx']['ok_del1']);
		hist(3,$par['id']);
	} else {
		array_unshift($depot['errors'],$depot['tx']['al_norecs']."<br><br>");
	}

	$html.=cusers_view();
	return $html;
}



function cusers_refuse(){
	global $par,$depot, $b, $tx,$lxs,$depot;
	$html='';

	if (isset($par['sendrefusemail'])) {
		$res=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".FUSERS." WHERE id=\"".$par['id']."\""));




		$arr=array(
					"name" =>	$res['name'],
					"reason"	=>	$par['refusetext']
					
		);

		$email=parse_local($arr,'mailtplRefuseRegistration',1);
		$subject = $depot['lxs']['regsubject'];
		quick_mail( $res['uname'],mb_convert_encoding($subject,"windows-1251",$depot['encd']),mb_convert_encoding($email,"windows-1251",$depot['encd']),$depot['enviro']['daemon-email']);

	}

	conn_sql_query("DELETE FROM ".FUSERS." WHERE id=\"".$par['id']."\"");

	$depot['oks'][]=iho("���������� ��� ����������� ��������");

	$html.=cusers_view();
	return $html;
}



function cusers_approve(){
	global $par,$depot, $b, $tx,$lxs,$depot;
	$html='';

	if (isset($par['sendrefusemail'])) {
		$res=conn_fetch_assoc(conn_sql_query("SELECT * FROM ".FUSERS." WHERE id=\"".$par['id']."\""));

		$arr=array(
					"firstname" =>	$res['firstname'],
					"lastname"	=>	$res['lastname'],
					"reason"	=>	$par['refusetext']
					
		);

		$email=parse_local($arr,'mailtplRefuseRegistration',1);
		$subject = $depot['lxs']['regsubject'];
		quick_mail( $res['email'],mb_convert_encoding($subject,"windows-1251",$depot['charset']),mb_convert_encoding($email,"windows-1251",$depot['charset']),$depot['enviro']['daemon-email']);

	}

	conn_sql_query("DELETE FROM ".FUSERS." WHERE id=\"".$par['id']."\"");

	$depot['oks'][]=iho("���������� ��� ����������� ��������");

	$html.=cusers_view();
	return $html;
}







function lang_js(){
$r=<<<JSCR

 <script language="javaScript">

		  <!--
			
			function editlex(pattidvar,ttype,lng){
				var obj = document.getElementById ? document.getElementById(pattidvar) : null;
				var objScript = document.getElementById ? document.getElementById("updscript") : null;
				hide_mess();
				obj.innerHTML ="<div style='text-align:center;'><img src=\"img/clock.gif\"></div>";
				objScript.src = "/gazda/adm_get_list.php?pattidvar="+pattidvar+"&upd="+ttype+"&lng="+lng;

				
			}


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
			eval("document.ad."+formobj+"_imo.src ='/gallery/tmb/no_image.gif'");
		}
		//-->
		 </script>
JSCR
;

return $r;
}


?>
