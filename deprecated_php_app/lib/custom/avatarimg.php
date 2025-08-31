<?

function tmp_file_save($name,$change){
		global $errors,$_FILES,$par,$enviro, $depot;
		$ttop='';
		$mid_path=		"/media/avatars/";
		$tmb_path=		"/media/avatars/tmb/";


		$par['userpicok']='0';

		if (isset($_FILES[$name])&&($_FILES[$name]['name']!='')){
			$allowed_exts=array('image/jpeg','image/pjpeg','image/gif','image/png');
			$tt=$_FILES[$name]['type'];
			if (!in_array($tt,$allowed_exts)) {
				$depot['errors'][]=iho("Uploading picture should be of these formats - .jpg, .gif, .png");
				/*$ttop.=errors();
				echo $ttop;*/
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
  					//move_uploaded_file($_FILES[$name]['tmp_name'], $pp."/imgtmp/$q");
					if (!$change) {
						if (@$par['newfilename']){
							$fname=strtolower($par['newfilename'].".".@$exts[$tt]);
						} else {
							$fname=strtolower($_FILES[$name]['name']);
							$fname=strtolower(preg_replace("/[^0-9a-zA-Z-_\.]/sU",'_',$fname));
						}


						/*if (strlen($fname>30)) $fname=substr($fname,0,30);  */

						$ishere=conn_fetch_row(conn_sql_query("SELECT COUNT(*) FROM ".PICSU." WHERE filename=\"$fname\""));
						
						if ($ishere[0]){
							preg_match("/^(.+)(\.)(\w+)$/U",$fname,$matches);
							$fname=$matches[1]."_".substr(md5(time()),0,5).".".@$exts[$tt];
							$depot['oks'][]=iho("File with name you provided already exists. System has chosen another name: ".$fname);
						}


					}	else {
						$fname=$change;
					}

			
			
					$intxt1=200;
					$intxt2=200;
					//$newimage=ImageCreateTrueColor($uw1,$uw2);
					//$cream=ImageColorAllocate($newimage,238,242,239);
					//ImageFill($newimage,111,111,$cream);



					
					switch ($tt) {
						case 'image/pjpeg':
							if (!(@$image=ImageCreateFromJpeg($_FILES[$name]['tmp_name']))) {
								$depot['errors'][]="The file you uploaded isn't a valid JPEG format";
							
							}
							break;
						case 'image/jpeg':
							if (!(@$image=ImageCreateFromJpeg($_FILES[$name]['tmp_name']))) {
								$depot['errors'][]="The file you uploaded isn't a valid JPEG format";
							
							}
							break;
						case 'image/gif':
							if (!(@$image=ImageCreateFromGif($_FILES[$name]['tmp_name']))) {
								$depot['errors'][]="The file you uploaded isn't a valid GIF format";
							
							}
							break;
						case 'image/png':
							if (!(@$image=ImageCreateFromPng($_FILES[$name]['tmp_name']))) {
								$depot['errors'][]="The file you uploaded isn't a valid PNG format";
							
							}
							break;
					}

					
					if ($depot['errors']) {
						echo  errors();
						return false;
					}

					$height=ImageSY($image);
					$width=ImageSX($image);

					/*SQAURE
					
					if ($intxt1/$intxt2<$width/$height) {
						$index=$height/$intxt2;
						$start_x=($width-$intxt1*$index)/2;
						$start_y=0;
					} else {
						$index=$width/$intxt1;
						$start_y=($height-$intxt2*$index)/2;
						$start_x=0;
					}
					$newimage=ImageCreateTrueColor($intxt1,$intxt2);;
					$cream=ImageColorAllocate($newimage,255,255,255);
					ImageFill($newimage,1,1,$cream);
					imagecopyresampled ($newimage, $image, 0, 0, $start_x, $start_y, $intxt1, $intxt2, $width-($start_x*2), $height-($start_y*2));*/


					$max=200;
					if ( $max >= $width ) {
						$bigw=$width;
						$bigh=$height;
					} else {
						$bigw=$max;
						$bigh=(int)(($max*$height)/$width);
					}

					$newimage=ImageCreateTrueColor($bigw,$bigh);
					$cream=ImageColorAllocate($newimage,255,255,255);
					ImageFill($newimage,111,111,$cream);
					imagecopyresampled ($newimage, $image, 0, 0, 0, 0, $bigw, $bigh, $width, $height);

					

					
					switch ($tt) {
						case 'image/jpeg':
							ImageJpeg($newimage,$pp.$mid_path.$fname,80);
							break;
						case 'image/pjpeg':
							ImageJpeg($newimage,$pp.$mid_path.$fname,80);
							break;
						case 'image/gif':
							ImageGif($newimage,$pp.$mid_path.$fname);
							break;
						case 'image/png':
							ImagePng($newimage,$pp.$mid_path.$fname);
							break;
					}	
					chmod($pp.$mid_path.$fname, 0775);


					$tmb1=50;
					$tmb2=50;


					if ($tmb1/$tmb2<$width/$height) {
						$index=$height/$tmb2;
						$start_x=($width-$tmb1*$index)/2;
						$start_y=0;
					} else {
						$index=$width/$tmb1;
						$start_y=($height-$tmb2*$index)/2;
						$start_x=0;
					}

					
					$tmbimage=ImageCreateTrueColor($tmb1,$tmb2);;
					$cream=ImageColorAllocate($newimage,255,255,255);
					ImageFill($tmbimage,1,1,$cream);

					/*imagecopyresampled ($newthumb, $image, ($tmb1-$neww)/2, ($tmb2-$newh)/2, 0, 0, $neww, $newh, $width, $height); */
					imagecopyresampled ($tmbimage, $image, 0, 0, $start_x, 0, $tmb1, $tmb2, $width-($start_x*2), $height-($start_y*2));


					
					switch ($tt) {
						case 'image/jpeg':
							ImageJpeg($tmbimage,$pp.$tmb_path.$fname,80);
							break;
						case 'image/pjpeg':
							ImageJpeg($tmbimage,$pp.$tmb_path.$fname,80);
							break;
						case 'image/gif':
							ImageGif($tmbimage,$pp.$tmb_path.$fname);
							break;
						case 'image/png':
							ImagePng($tmbimage,$pp.$tmb_path.$fname);
							break;
					}	
					chmod($pp.$tmb_path.$fname, 0775);



					ImageDestroy($image);
					ImageDestroy($newimage);
					ImageDestroy($tmbimage);
					/*ImageDestroy($newimage);*/
;
					$depot['vars']['ppic']=$fname;
				}
		} else return false;
		return true;
		
}


?>