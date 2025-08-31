<?php
//include("modulfetcher.php");
$parent_loader=1;

foreach (explode(",","conf,conn,core,forms,initstart,get_auth,checkcookie") as $m)
require_once(dirname(__FILE__)."/../lib/etc/$m.php");
authenticated();

require_once(dirname(__FILE__)."/../lib/custom/avatarimg.php");
	





$dbID=0;

if (!$par['isedit']){


	
	if ($saved_file=	tmp_file_save('filename'.$_REQUEST['index'],0)){

		$query ="
						INSERT INTO ".PICSU." 
						SET 
						filename=\"".sqller($depot['vars']['ppic'])."\",
						userid=\"".sqller($depot['logged_user']['usid'])."\",
						tempid = \"".sqller($par['unique'])."\"
						
						
					";

		if (isset($par['itemid'])){		/*check if item is mine*/

			$sqltrue = conn_fetch_row(conn_sql_query("SELECT count(*) FROM ".MAINPRODS." WHERE userowner = \"".$depot['logged_user']['usid']."\""));
			if ($sqltrue[0]){
				$query.=", itemid = \"".sqller($par['itemid'])."\"";
			}
		}

		conn_sql_query($query) or die(conn_error());
		$dbID=conn_insert_id();

		/*TITLES*/
		$titlepic=array();
		foreach ($depot['vars']['langs'] as $lang=>$langarr){
			$titlepic[$lang]='';
		}
	}
	
}  else {
	
	$sql="SELECT * FROM ".PICSU." WHERE id =\"".sqller($par['isedit'])."\"";
	$res=conn_fetch_assoc(conn_sql_query($sql));
	
	if (conn_error()) echo conn_error();

	if (!@$res['filename']){
		echo "<h2>CANT FETCH IMAGE NAME FROM DB</h2>";
		die();
	}

	$saved_file=	tmp_file_save('filename'.$_REQUEST['index'],$res['filename']);
	$dbID=$res['id'];

	/*TITLES*/
	$titlepic=array();
	foreach ($depot['vars']['langs'] as $lang=>$langarr){
		$titlepic[$lang]=$res['title_'.$lang];
	}

}


if ($saved_file){



	/*MANAGE DB*/


	$sql="
				
	";


	$delete_button="
				
						<a href=\"\" onClick=\"ajax_request('upd=remprodimg&index=".$_REQUEST['index']."&id=".$dbID."');return false;\"  id=butt class=del ></a>
	
	";

	/*$radio=bd_radio('mainimage',$dbID);*/
	
	$radio="<input type='hidden' name='mainimage' value='$dbID'>";
	

	if (@$par['addrow'] && !$par['isedit']){
		$newfield=imageRow(($_REQUEST['lastindex']+1),$par['uniquetemp'],array(),$par['isedit']);
		$newfieldScript=			'window.parent.attachNewUploadField("'.$_REQUEST['index'].'","'.puttojs($newfield).'","'.($_REQUEST['lastindex']+1).'",'.$dbID.');';
		$operationScript='window.parent.setvalue("operation'.$_REQUEST['index'].'","'.puttojs($delete_button).'");';

	} else {
	
		$newfieldScript='window.parent.setFormElementValue ("ad","takenimagefield"+'.$_REQUEST['index'].','.$dbID.');';
		$operationScript='';
	}


	$phoinfo=getPhotoInfo($_REQUEST['index'],$titlepic,$dbID);


	echo '<a href="/media/avatars/'.$depot['vars']['ppic'].'?freecache='.time().'" target="_blank" class="tmbhold"><img src="/media/avatars/'.$depot['vars']['ppic'].'?freecache='.time().'" border="0" /></a>


	
	<script type="text/javascript">
			'.$operationScript.'
			window.parent.setvalue("radio'.$_REQUEST['index'].'","'.puttojs($radio).'");
			window.parent.setvalue("phoinfo'.$_REQUEST['index'].'","'.puttojs($phoinfo).'");
			
			'.$newfieldScript.'
	</script>';





} else {
	if (@$_REQUEST['action']=='placemark'){
		echo $depot['tx']['choosefile'];
	} else echo "YOU'VE HIT THE STONE at line ".__LINE__;
	/*$vis="";
	$ttop.=image_again();	 */
}

/*if($imgUploaded){
	echo '<img src="'.$upload_image.'" border="0" />';
	echo '<script type="text/javascript">window.parent.setvalue("operation'.$_REQUEST['index'].'","YUH")</script>';
}else{
	echo '<img src="/gazda/img/error.gif" width="16" height="16px" border="0" style="marin-bottom: -3px;" /> Error(s) Found: ';
	foreach($errorList as $value){
			echo $value.', ';
	}
}	*/
?>