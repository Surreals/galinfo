<?


function myImagesResult(){
	global $par,$depot,$logged_im;

	//$ttop="<a id='addcomment' href='/myaccount/images/?a=new' style='margin-top:0px;float:right'><p>".$depot['lxs']['addgallery']."</p></a>";

	$ttop="<a class='likebutton' href='/myaccount/images/?a=new' style='float:right;'><p>".$depot['lxs']['addgallery']."</p></a>";

	if (!isset($par['a'])) $par['a'] = 'view';

	switch ($par['a']){
		case 'view' :		$ttop1= myimagesView(); break; 
		case 'new' : 
		case 'edit' :		$ttop1= myimagesAdd(); break;
		case 'savenew' :	$ttop1= myimagesSave(); break;
		case 'saveedit' :	$ttop1= myimagesSave(); break;
		case 'rem' :		$ttop1= myimagesRemove(); break;
		default : err404();
	}
	return $ttop."<div class='clean'></div>".errors().oks().$ttop1;
}




function myimagesRemove(){
	global $par,$depot,$logged_im;
	
	if (!isset($par['imageid']) && !isset($par['imageids'])){ 
		$depot['errors'][]=$depot['lxs']['nothingtodelete'];
		return myimagesView();
	}



	$ttop="<form name='ad' method='post'><div class='clean'></div><div style='background:#e8eff5;border:#DDD solid 1px;padding:20px;'>";
	if (isset($par['godelete'])) {
		$ttop.="<h2>".$depot['lxs']['confirdelrecord']."</h2>";
		$ttop.="
				<div class='submitblock'>
				<input type=\"hidden\"  name=\"a\" value=\"rem\" />
				<input type=\"hidden\"  name=\"imageids\" value=\"".implode(",",$par['imageid'])."\" />
				<input type=\"submit\" class=\"sbmt\" name=\"confirmdelete\" value=\"".$depot['lxs']['yes']."\" /> ";
			

		$ttop.="</div></form>";

		return $ttop;
	} else {
		$deleted=0;
		foreach (explode(",",$par['imageids']) as $id){
			$sql_count_text=sqlquery("SELECT * FROM ".PICS." WHERE id = \"".sqller($id)."\" AND userid = \"".sqller($depot['logged_user']['usid'])."\"");
			
			$pic=conn_fetch_assoc($sql_count_text);
			if ($pic['filename']){
                $res_ = sqlquery("DELETE FROM ".PICS." WHERE id = \"".sqller($id)."\" AND userid = \"".sqller($depot['logged_user']['usid'])."\"");
				if (conn_affected_rows($res_)>0){
					

					$v=getImagePath($pic['filename']).$pic['filename'];
					@unlink($_SERVER['DOCUMENT_ROOT']."/media/gallery/tmb/".$v);
					@unlink($_SERVER['DOCUMENT_ROOT']."/media/gallery/full/".$v);
					@unlink($_SERVER['DOCUMENT_ROOT']."/media/gallery/intxt/".$v);
					@unlink($_SERVER['DOCUMENT_ROOT']."/media/gallery/raw/".$v);
					$deleted++;

				}
			}

		}

		$depot['oks'][]=$depot['lxs']['deletedqty']." <span style='color:#D00'>".$deleted."</div>";
		return myimagesView();


	}
}


function myimagesView(){
	global $par,$depot,$logged_im;
	$ttop="";
	$sql_count_text="SELECT COUNT(*) FROM ".PICS." WHERE userid = \"".sqller($depot['logged_user']['usid'])."\"";
	$sql_count=sqlquery($sql_count_text);
	$count=conn_fetch_row($sql_count);

	if (!$count[0]) return parse_local(array('message'=>"<h3>".$depot['lxs']['noimages']."</h3><div class='clean'></div>"),'frameMessage',1);


	list($from,$to,$pages) = pager_calc(20,10,$count[0]);
	if ($to) $limit=" LIMIT $from,$to";

	$sql_all_text="SELECT * FROM ".PICS." WHERE userid = \"".sqller($depot['logged_user']['usid'])."\" ORDER BY id DESC ".@$limit;
	$sql_all = sqlquery($sql_all_text);

	
	$ttop.="<ul class='tbl myimages'>";
	$i=0;

	$num_colls=5;
	$closed=true;

	while ($res=conn_fetch_assoc($sql_all)){
		$closed=false;
		if (!($i % $num_colls)){
			$ttop.="<li class='line'><ul>";
		}
		$ttop.="
				<li class='w25 myimage'>
					
					<a href=\"/myaccount/images/?a=edit&id=".$res['id']."\"'><img src=\"/media/gallery/tmb/".getImagePath($res['filename']).$res['filename']."?timestamp=".$depot['vars']['ctime']."\"></a>
					<input type=checkbox name='imageid[]' value=\"".$res['id']."\" class=chkbx>
					";
		$ttop.="
						<textarea name='".$res['id']."' class='tiny' onclick='this.select()'>/media/gallery/tmb/".getImagePath($res['filename']).$res['filename']."</textarea>
						<em>".$res['title_'.$depot['vars']['lang']]."</em>
				</li>";
		
		if (($i % $num_colls) == ($num_colls-1)){
			$ttop.="</li></ul>";
			$closed=true;
		}

		$i++;

	}
	
	if (!$closed) $ttop.="</li></ul>";

	$ttop.="</ul>";

	/*$ttop="<a id='addcomment' href='/myaccount/images/?a=new' style='margin-top:0px;'><p>".$depot['lxs']['addgallery']."</p></a>";*/
	

	$ttop.= pager("/myaccount/images/",$pages,10,array('id'=>'yuuuu'));
	
	$ttop.="<div class='clean pt30'></div><input type=\"submit\" class=\"sbmt\" style=\"background:#000;float:right;\" name=\"godelete\" value=\"".$depot['lxs']['deleteselected']."\"/>
	<input type='hidden' name='a' value='rem'>";

	return "<form name='ad' method='post' enctype='multipart/form-data'>".$ttop."</form>";
}


function myimagesAdd(){
	global $par,$depot,$logged_im;
	$ttop="<form name='ad' method='post' enctype='multipart/form-data'><div class='clean'></div><div class='mybox'>";
	
	if ($par['a'] == 'edit') {
		$sql=sqlquery("SELECT * FROM ".PICS." WHERE id = \"".sqller($par['id'])."\" AND userid = \"".sqller($depot['logged_user']['usid'])."\"");
		$res_e=conn_fetch_assoc($sql);
		if (!isset($res_e['filename']))	{
			$depot['oks'][]='WRONG IMAGE ID';
			return myimagesView();
		}

		$ttop.="<div><img src=\"/media/gallery/intxt/".getImagePath($res_e['filename']).$res_e['filename']."?timestamp=".$depot['vars']['ctime']."\"></div>";
		foreach ($depot['vars']['langs'] as $arr){
			$par['title_'.$arr['lang']]  = $res_e['title_'.$arr['lang']];		
		}

		$ttop.="<input type='hidden' name='id' value='".$par['id']."'>";
		
	}
				

	$ttop.="
				<label for=nheader>".$depot['lxs']['file']."</label>
				<input type=file name='uploadfile' style='width:98%'>
				
			";


	foreach ($depot['vars']['langs'] as $arr){

		$ttop.=		"<br><br><label for='title_".$arr['lang']."'>".$depot['lxs']['imagetitle']."</label>
					".bd_tf(@$par['title_'.$arr['lang']],'title_'.$arr['lang'],'text','width:98%;',2,'');
	}
	
	$ttop.="</div>

			<div class='submitblock'>
				<input type=\"submit\" class=\"sbmt\" name=\"gosubmit\" value=\"".$depot['lxs']['save']."\" />
				<input type=\"hidden\"  name=\"a\" value=\"save".$par['a']."\" />
			</div>
	";
	return $ttop."</form>";
}


function myimagesSave(){
	global $par,$depot,$logged_im,$_FILES;
	$ttop="";
	$name='uploadfile';
	

	if ($par['a']=='savenew'){
		if (!uploadAndSave('uploadfile')) {
			$par['a']='new';
			return  myimagesAdd();
		}
		$query ="INSERT INTO ".PICS." SET filename=\"".conn_real_escape_string(stripslashes($depot['savedimage'][0]))."\",";
	}
	else {
		if (isset($_FILES[$name])&&($_FILES[$name]['name']!='')) {
			if (!uploadAndSave('uploadfile')) {
				$par['a']='edit';
				return  myimagesAdd();
			}
			$query ="UPDATE	".PICS." SET filename=\"".conn_real_escape_string(stripslashes($depot['savedimage'][0]))."\",";
		} else {
			$query ="UPDATE	".PICS." SET ";
		}
	}
		
	
	foreach ($depot['vars']['langs'] as $arr){

		$query.="title_".$arr['lang']." = \"".sqller($par['title_'.$arr['lang']])."\",";

	}
	

	$query.="	pic_type	=\"".$depot['var']['communitytype']."\",
				userid		=\"".sqller($depot['logged_user']['usid'])."\",
				intxtwidth	=\"".$depot['enviro']['middle_im_size']."\" ";

	if ($par['a'] =='saveedit'){
		$query.=" WHERE id = \"".sqller($par['id'])."\"";
	}

	conn_sql_query($query) or die(conn_error());
	/*$par['imageid'] = conn_insert_id();
	conn_sql_query("UPDATE ".PICS." SET orderid = ".conn_insert_id()." WHERE id = ".conn_insert_id()."");*/
	$depot['oks'][]=$depot['lxs']['imageadded'];

	return myimagesView();
}





function uploadAndSave($name){
		global $depot,$_FILES,$par,$depot;
		$ttop='';
		

		/*$large_path="/gallery/full/";*/
		$tmp="/media/gallery/tmp/";

		if (isset($_FILES[$name])&&($_FILES[$name]['name']!='')){
			$allowed_exts=array('image/jpeg','image/pjpeg','image/gif','image/png');
			$tt=$_FILES[$name]['type'];
			if (!in_array($tt,$allowed_exts)) {
				$depot['errors'][]=iho("������������� ���������� ������� ���� ������ � ����� ������� - .jpg, .gif, .png");
				return false;
			}

			/*preg_match("/^(\w+)(\.)(\w+)$/",$p,$matches);$q=$p.".".@$exts[$tt];*/
			$exts=array(
							'image/jpeg'=>'jpg',
							'image/pjpeg'=>'jpg',
							'image/gif'=>'gif',
							'image/png'=>'png'
			);
			
			if (is_uploaded_file($_FILES[$name]['tmp_name'])) {
					$pp=$_SERVER['DOCUMENT_ROOT'];	
				
					$fname=strtolower($_FILES[$name]['name']);
					$fname=strtolower(preg_replace("/[^0-9a-zA-Z-_\.]/sU",'_',$fname));
			

					$ishere=conn_fetch_row(conn_sql_query("SELECT COUNT(*) FROM ".PICS." WHERE filename=\"$fname\""));
						
					if ($ishere[0]){
						preg_match("/^([\w-]+)(\.)(\w+)$/",$fname,$matches);
						$fname=$matches[1]."_".substr(md5(time()),0,5).".".@$exts[$tt];
					}

					

					/*$new_location=$pp.$depot['path']['tmp'];
					$new_fname=$pp.$depot['path']['tmp'].$fname;
					move_uploaded_file($HTTP_POST_FILES[$name]['tmp_name'], $new_fname);*/
					$new_fname=$_FILES[$name]['tmp_name'];
					$full_file_name=splitByDirectories($fname,$depot['path']);
					
					$max=$depot['enviro']['large_im_size'];

					switch ($tt) {
						case 'image/pjpeg':
							if (!(@$image=ImageCreateFromJpeg($new_fname))) {
								$errors[]="The file you uploaded isn't a valid JPEG format";
								return;
							}
							break;
						case 'image/jpeg':
							if (!(@$image=ImageCreateFromJpeg($new_fname))) {
								$errors[]="The file you uploaded isn't a valid JPEG format";
								return;
							}
							break;
						case 'image/gif':
							if (!(@$image=ImageCreateFromGif($new_fname))) {
								$errors[]="The file you uploaded isn't a valid GIF format";
								return;
							}
							break;
						case 'image/png':
							if (!(@$image=ImageCreateFromPng($new_fname))) {
								$errors[]="The file you uploaded isn't a valid PNG format";
								return;
							}
							break;
					}

					
					
					$par['fromx']=$par['fromy']=0;
					$par['toy']=$height=ImageSY($image);
					$par['tox']=$width=ImageSX($image);	


				
					$middle_w=$middle_h=$depot['enviro']['middle_im_size'];
					$middle_w=$middle_h=(isset($par['real_middle_width'])) ?  $par['real_middle_width'] : $depot['enviro']['middle_im_size'];

					$small_w=$depot['enviro']['small_im_size'];
					$small_h=$depot['enviro']['small_im_height'];

					$middle_h=$par['toy']*$middle_w/$par['tox'];
					$k=$middle_w/$par['tox'];

					$x0=(0-$par['fromx'])*$k;
					$y0=(0-$par['fromy'])*$k;
					$x1=$width*$k;
					$y1=$height*$k;


			/*					FULL				*/	

					if ( $max >= $width ) {
						$bigw=$width;
						$bigh=$height;
					} else {
						$bigw=$max;
						$bigh=(int)(($max*$height)/$width);
					}

					$bigimage=ImageCreateTrueColor($bigw,$bigh);
					$cream=ImageColorAllocate($bigimage,255,255,255);
					ImageFill($bigimage,111,111,$cream);
					imagecopyresampled ($bigimage, $image, 0, 0, 0, 0, $bigw, $bigh, $width, $height);


					switch ($tt) {
						case 'image/jpeg':
							ImageJpeg($bigimage,$full_file_name['full'],100);
							break;
						case 'image/pjpeg':
							ImageJpeg($bigimage,$full_file_name['full'],100);
							break;
						case 'image/gif':
							ImageGif($bigimage,$full_file_name['full']);
							break;
						case 'image/png':
							ImagePng($bigimage,$full_file_name['full']);
							break;
					}		


					/*INTXT*/

					$middle_h=$par['toy']*$middle_w/$par['tox'];
					$k=$middle_w/$par['tox'];

					$x0=(0-$par['fromx'])*$k;
					$y0=(0-$par['fromy'])*$k;
					$x1=$width;
					$y1=$height;


					//echo "X0 -> $x0, Y0 -> $y0, HEIGHT -> $height, MIDDLEH -> $middle_h, KOEF ->$k";
		
					/*$x0=($width>=$height) ? 0 :(($height-($width/$middle_w)/$ratio)/2); */

					/*$x1=$width/$k;
					$y1=$height/$k;	*/


					/*  $max=$middle_w;*/
					if ($middle_w >= $width ) {
						$middle_w=$x1=$width;
						$middle_h=$y1=$height;
					} 

					$newimage=ImageCreateTrueColor($middle_w,$middle_h);
					$cream=ImageColorAllocate($newimage,255,255,255);
					ImageFill($newimage,1,1,$cream);
					/*imagecopyresampled ($newimage, $image, 0, 0, 0, 0, $midw, $midh, $width, $height);*/
					imagecopyresampled ($newimage, $image, 0, 0, $x0, $y0,  $middle_w, $middle_h, $x1,$y1);


					switch ($tt) {
						case 'image/jpeg':
							ImageJpeg($newimage,$full_file_name['intxt'],100);
							break;
						case 'image/pjpeg':
							ImageJpeg($newimage,$full_file_name['intxt'],100);
							break;
						case 'image/gif':
							ImageGif($newimage,$full_file_name['intxt']);
							break;
						case 'image/png':
							ImagePng($newimage,$full_file_name['intxt']);
							break;
					}

					
					/*				THUMBNAIL			*/
					$newthumb=ImageCreateTrueColor($small_w,$small_h);
					$cream1=ImageColorAllocate($newthumb,225,225,225);
					ImageFill($newthumb,1,1,$cream1);
					
					$delta=($par['tox']<$par['toy']) ? $par['tox'] : $par['toy']; 
					$k=$delta/$small_w;

					$x0=$par['fromx']+($par['tox']-$delta)/2;
					$y0=$par['fromy']+($par['toy']-$delta)/2;

					//imagecopyresampled ($newthumb, $image, 0, 0, $par['fromx'], $par['fromy'], $small_w, $small_h, $par['tox'], $par['toy']);
					imagecopyresampled ($newthumb, $image, 0, 0, $x0, $y0, $small_w, $small_w, $delta, $delta);
					//imagecopyresampled ($newthumb, $image, (0-$par['fromx']), (0-$par['fromy']), 0, 0, $small_w, $small_h, $par['tox'], $par['toy']);


					//imagecopyresampled ($newthumb, $image, ($small_w-$neww)/2, ($small_h-$newh)/2, 0, 0, $neww, $newh, $width, $height);
					
	

					switch ($tt) {
						case 'image/jpeg':
							ImageJpeg($newthumb,$full_file_name['tmb'],100);
							break;
						case 'image/pjpeg':
							ImageJpeg($newthumb,$full_file_name['tmb'],100);
							break;
						case 'image/gif':
							ImageGif($newthumb,$full_file_name['tmb']);
							break;
						case 'image/png':
							ImagePng($newthumb,$full_file_name['tmb']);
							break;
					}



					ImageDestroy($image);
					ImageDestroy($bigimage);
					$depot['savedimage']=array($fname,$bigw,$bigh);
				

				}
		} else { 
			
			$depot['errors'][]="No file has been attached";
			return false;
			
		}
		return true;
		
}


function splitByDirectories($final_fname,$paths){
	
	$mtch=array('1','2');
	preg_match("/^(.+)(\.)(\w+)$/",$final_fname,$mtch);

	if (!isset($mtch[1])) die ("UNRECOVERABLE ERROR ".__FILE__."/".__LINE__);

	$letetrs_string= chunk_split($mtch[1],1,'{OOO}');
	$string= explode('{OOO}',$letetrs_string);



	$rot=$_SERVER['DOCUMENT_ROOT'];
	$path_array=array();

	for ($i=0;$i<2;$i++){
	   if(isset($string[$i])){
		   
			preg_match("/([A-Za-z0-9]{1})/",$string[$i],$matches);
			if (!isset($matches[0])) $string[$i]='other'; 
	   }
	}


	foreach (array('full','intxt','tmb','raw') as $p){
		$dir_name=$rot.$paths[$p].$string[0];
		if (!file_exists($dir_name) || !is_dir($dir_name)){
			mkdir($dir_name);
		}

		$path_array[$p]= $dir_name."/".$final_fname;
	}

	if(!isset($string[1])) return $path_array;

	$path_array=array();

	foreach (array('full','intxt','tmb','raw') as $p){
		$dir_name=$rot.$paths[$p].$string[0].'/'.$string[1];
		if (!file_exists($dir_name) || !is_dir($dir_name)){
			mkdir($dir_name);
		}

		$path_array[$p]= $dir_name."/".$final_fname;
	}

	return $path_array;


}
?>