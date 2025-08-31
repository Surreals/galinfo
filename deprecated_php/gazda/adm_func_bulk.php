<?
$parent_loader=1;
require_once("../lib/etc/conf.php");
require_once("../lib/etc/conn.php");
require_once("../lib/etc/core.php");
require_once("adm_func.php");
require_once("adm_func_gallery.php");

$ds= DIRECTORY_SEPARATOR;
$storeFolder = 'uploads';
if (!empty($_FILES)) {

	$tmp="/media/gallery/tmp/";
	$tmb_path=$depot['path']['tmb'];
	$mid_path=$depot['path']['intxt'];
	$full_path=$depot['path']['full'];

	$allowed_exts=array('image/jpeg','image/pjpeg','image/gif','image/png');
	$tt=$_FILES['file']['type'];
	if (!in_array($tt,$allowed_exts)) {
		exit("Завантажуване зображення бовинно бути одного з трьох форматів - .jpg, .gif, .png");
	}
	$exts=array(
					'image/jpeg'=>'jpg',
					'image/pjpeg'=>'jpg',
					'image/gif'=>'gif',
					'image/png'=>'png'
	);
	
		
	if (is_uploaded_file($_FILES['file']['tmp_name'])) {
		$pp=$_SERVER['DOCUMENT_ROOT'];
		$fname=strtolower($_FILES['file']['name']);
		$fname=strtolower(preg_replace("/[^0-9a-zA-Z-_\.]/msU",rand(1,20),$fname));
		$ishere=conn_fetch_row(conn_sql_query("SELECT COUNT(*) FROM ".PICS." WHERE filename=\"$fname\""));
		
		if ($ishere[0]){
			preg_match("/^([\w-]+)(\.)(\w+)$/",$fname,$matches);
			$fname=$matches[1]."_".substr(md5(time()),0,5).".".@$exts[$tt];
		}

		//$new_location=$pp.$tmp;
		//$new_fname=$pp.$tmp.$fname;

		//move_uploaded_file($_FILES['file']['tmp_name'], $new_fname);
		switch ($tt) {
			case 'image/pjpeg':
				if (!(@$image=ImageCreateFromJpeg($_FILES['file']['tmp_name']))) {
					exit("The file you uploaded isn't a valid JPEG format");
					return;
				}
				break;
			case 'image/jpeg':
				if (!(@$image=ImageCreateFromJpeg($_FILES['file']['tmp_name']))) {
					exit("The file you uploaded isn't a valid JPEG format");
					return;
				}
				break;
			case 'image/gif':
				if (!(@$image=ImageCreateFromGif($_FILES['file']['tmp_name']))) {
					exit("The file you uploaded isn't a valid GIF format");
					return;
				}
				break;
			case 'image/png':
				if (!(@$image=ImageCreateFromPng($_FILES['file']['tmp_name']))) {
					exit("The file you uploaded isn't a valid PNG format");
					return;
				}
				break;
		}

		$full_file_name=splitByDirectories($fname,$depot['path']);

		$height=ImageSY($image);
		$width=ImageSX($image);
		
		/**
		*	FULL
		**/
		$max=$depot['enviro']['large_im_size'];
		if ( $max >= $width ) {
			$bigw=$width;
			$bigh=$height;
		} else {
			$bigw=$max;
			$bigh=(int)(($max*$height)/$width);
		}

		$bigimage=ImageCreateTrueColor($bigw,$bigh);
		$cream=ImageColorAllocate($bigimage,254,244,231);
		ImageFill($bigimage,111,111,$cream);
		imagecopyresampled ($bigimage, $image, 0, 0, 0, 0, $bigw, $bigh, $width, $height);
		
		if ($par['watermark']) {
			$markimage=ImageCreateFromPng($_SERVER['DOCUMENT_ROOT']."/gazda/img/mark.png");
			imagecopy ($bigimage, $markimage, 40, ($bigh-100), 0, 0, 200, 61 );
		}

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
		ImageDestroy($bigimage);


		/**
		*		INTXT
		**/
		$max=$depot['enviro']['middle_im_size'];
		if ( $max >= $width ) {
			$intxtw=$width;
			$intxth=$height;
		} else {
			$intxtw=$max;
			$intxth=(int)(($max*$height)/$width);
		}

		$intxtimage=ImageCreateTrueColor($intxtw,$intxth);
		$cream=ImageColorAllocate($intxtimage,254,244,231);
		ImageFill($intxtimage,111,111,$cream);
		imagecopyresampled ($intxtimage, $image, 0, 0, 0, 0, $intxtw, $intxth, $width, $height);

		switch ($tt) {
			case 'image/jpeg':
				ImageJpeg($intxtimage,$full_file_name['intxt'],100);
				break;
			case 'image/pjpeg':
				ImageJpeg($intxtimage,$full_file_name['intxt'],100);
				break;
			case 'image/gif':
				ImageGif($intxtimage,$full_file_name['intxt']);
				break;
			case 'image/png':
				ImagePng($intxtimage,$full_file_name['intxt']);
				break;
		}		
		ImageDestroy($intxtimage);



		/**
		*		SMALL
		**/
		
		$small_w=$depot['enviro']['small_im_size'];
		$small_h=$depot['enviro']['small_im_height'];
		$k=$small_w/$small_h > $width/$height ? $small_w/$width : $small_h/$height;

		$tmbimage=ImageCreateTrueColor($small_w,$small_h);
		$cream=ImageColorAllocate($tmbimage,254,244,231);
		ImageFill($tmbimage,111,111,$cream);
		imagecopyresampled ($tmbimage, $image, 0, 0, 0, 0, $small_w, $small_h, $small_w/$k, $small_h/$k);

		switch ($tt) {
			case 'image/jpeg':
				ImageJpeg($tmbimage,$full_file_name['tmb'],100);
				break;
			case 'image/pjpeg':
				ImageJpeg($tmbimage,$full_file_name['tmb'],100);
				break;
			case 'image/gif':
				ImageGif($tmbimage,$full_file_name['tmb']);
				break;
			case 'image/png':
				ImagePng($tmbimage,$full_file_name['tmb']);
				break;
		}		
		ImageDestroy($tmbimage);	
	}
	

	ImageDestroy($image);


	$query ="
			INSERT INTO ".PICS." 
			SET filename=\"".conn_real_escape_string(stripslashes($fname))."\",
	";
	$sql1=conn_sql_query("SELECT * FROM ".LANG."");
	for ($i=0;$i<conn_sql_num_rows($sql1);$i++){
			$res=conn_fetch_array($sql1, PDO::FETCH_ASSOC);
			$val=puttodb($par['title_'.$res['lang']],$res['lang']);
			$query.="title_".$res['lang']." = \"".$val."\",";
	}
	$query.="	
		pic_type=\"".$par['id']."\",
		tags = \"".sqller(@$par['tags'])."\" ";

	conn_sql_query($query) or die(conn_error());
	$par['imageid'] = conn_insert_id();
	conn_sql_query("UPDATE ".PICS." SET orderid = ".conn_insert_id()." WHERE id = ".conn_insert_id()."");
}