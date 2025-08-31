<?


function myProfileResult(){
	global $par,$depot;

	/*if (!in_array('3',$logged_im['permissions'])) {
		$depot['errors'][]=$depot['lxs']['noaccess'];
		return errors();
	}*/
	
	
	if (!isset($par['a'])) $par['a'] = 'view';

	switch ($par['a']){
		case 'view'		: $ttop1=	myDetailsView();	break; 
		case 'edit'		: $ttop1=	myDetailsSave();	break;

	}
	return "<div class='clean'></div>".errors().oks().$ttop1;
}

function myDetailsSave(){
	global $par,$lxs,$depot,$logged_im;
	$addon='';
	if (@$par['changepassword']){
		$seed=generate_unique(16);
		chk_req("newpassword",$depot['lxs']['newpassword']);

		if (@$par['newpassword']!=@$par['newpassword1']) {
			$depot['errors'][]=$depot['lxs']['passnotcon'];
			$depot['gerrors'][]="newpassword";
			$depot['gerrors'][]="newpassword1";
		}
		
		if ($depot['errors']) return errors().myDetailsView();

		$addon.=", upass = \"".	md5($par['newpassword'].$seed)."\", seed =\"$seed\" ";
	}


	$sql_text="
				UPDATE ".FUSERS." 
				SET
				name = \"".sqller($par['name'])."\",
				shortinfo = \"".sqller($par['shortinfo'])."\",
				twowords = \"".sqller($par['twowords'])."\"
				$addon
				WHERE id = \"".sqller($depot['logged_user']['usid'])."\"
	";
	
	 mysql_query($sql_text) ;


	foreach ($par as $k=>$v){
		preg_match('/^takenimagefield(\d+)/sU',$k,$matches);
		if (@$matches[0]){
			if ($par[$matches[0]]) {
				/*
				if (@$par['mainimage'] ==  $par[$matches[0]]){
					$additional=", ismain=1";
				} else $additional=", ismain=0";*/

				$query="
							UPDATE ".PICSU."
							SET
							userid =  \"".sqller($depot['logged_user']['usid'])."\",
							tempid=\"\"
							WHERE id=\"".$par[$matches[0]]."\"
				";

				mysql_query($query);

				if (mysql_error()) $depot['errors'][]= mysql_error()."<br><br><br>$query";

			}
		}
	}

	mysql_query("DELETE FROM ".PICSU." WHERE tempid=\"".$par['uniquetemp']."\" AND userid=0");

	if (mysql_error())$depot['errors'][]=$depot['lxs']['problemsaving']."<hr>".mysql_error();  else $depot['oks'][]=$depot['lxs']['chanessaved'];
	return  errors().oks().myDetailsView();
}


function myDetailsView(){
	global $par,$depot;

	$ttop="<form method=\"post\" name=\"ad\" style='display:block;'>"; 
	$sql_text="SELECT * FROM ".FUSERS." WHERE id = \"".sqller($depot['logged_user']['usid'])."\"";
	$res=mysql_fetch_assoc(mysql_query($sql_text));
	
	foreach ($res as $k=>$v) {
		$par[$k]=$v;
	}

	if (!@$par['uniquetemp']) $par['uniquetemp'] = md5(time());


	/*FOR image*/
	$imagesSQL=mysql_query("SELECT * FROM ".PICSU." WHERE userid=\"".sqller($depot['logged_user']['usid'])."\"");
	if (mysql_num_rows($imagesSQL)>0){
		$resimage=mysql_fetch_assoc($imagesSQL);	
	} else {
		$resimage=array();
	}

	$ttop.="


		<div style='float:right;margin-left:30px;border-top:#777 solid 5px;width:200px;padding-top:30px;'>
			<div id='imagefield1' class='imagefield'>
					".imageRow(1,$par['uniquetemp'],$resimage)."
					<div class='clean'></div>
			</div>

			<div class='clean'></div>
		</div>

		<div class='' style='margin-right:230px;'>
			<div class='mybox'>
			
				<ul class='tbl' style='clear:none'>

					<li>
						<ul>
							<li class=\"w40\"><b>".$depot['lxs']['email'].":</b>
							<li class=\"w40\"><b style='font-size:18px;color:#CC0000'>{$depot['logged_user']['usname']}</b>
						</ul>
					<li class='noline'>&nbsp;&nbsp;
						
					<li>
						<ul>
							<li class=\"w40\"><b>".$depot['lxs']['newpassword'].":</b>
							<li class=\"w40\">".bd_tf(@$par['newpassword'],'newpassword','password','width:300px;',1,'')."
						</ul>
					<li>
						<ul>
							<li class=\"w40\"><b>".$depot['lxs']['newpassword1'].":</b>
							<li class=\"w40\">".bd_tf(@$par['newpassword1'],'newpassword1','password','width:300px;',1,'')."
						</ul>
					
					<li class='noline'>
						<ul>
							<li class=\"w40\">&nbsp;
							<li class=\"w40\"><input type='checkbox' name='changepassword'>&nbsp;&nbsp;&nbsp;<em class='notice'>".$depot['lxs']['changepassword']."</em>
						</ul>
					
				</ul>
				<div class='clean'></div>
			</div>
	
			<ul class='tbl'>
				
				<li class='noline'>&nbsp;</li>

				<li>
					<ul>
						<li class=\"w40\"><b>".$depot['lxs']['fullname'].":</b>
						<li class=\"w40\">".bd_tf(@$par['name'],'name','text','width:300px',1,'')."</b>
					</ul>
				</li>

				<li><br><br><b>".$depot['lxs']['twowords'].":</b></li>
				<li>".bd_tar(@$par['twowords'],'twowords','98%','40px',1,'')."</li>

				<li><br><br><b>".$depot['lxs']['aboutme'].":</b></li>
				<li>".bd_tar(@$par['shortinfo'],'shortinfo','98%','200px',1,'')."</li>
				
				<li class='noline'>


					<ul>
						<li class=\"w40\">
						<li class=\"w40\"><input type=\"submit\" class=\"sbmt\" name=\"sd\" value=\"".$depot['lxs']['savechanges']."\" /><br><br>
					</ul>
			</ul>
			
		</div>
	
		<input type='hidden' name='a' value='edit'>
		<input type='hidden' name='lastindex' value='1'>
		<input type='hidden' name='uniquetemp' value='".$par['uniquetemp']."'>
	</form>";

	return $ttop;
}