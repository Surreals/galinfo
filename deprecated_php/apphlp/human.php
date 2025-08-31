<?
$length=5;
$code=@$_REQUEST['precode'];
$nos=array();

$start_pos=substr(@$_REQUEST['precode'],3,1);
$code=md5(@$_REQUEST['precode']."THATSALLABOUTMYSECRET");
$code=strtoupper(substr($code,$start_pos*2,$length));
$code=str_replace(explode(" ","A B C D E F"),explode(" ","9 1 8 2 7 3"),$code);

$nos=array();
for($i=0;$i<strlen($code);$i++){
	$nos[]=substr($code,$i,1);
}


//$newimage=imagec(200,40);
$newimage=ImageCreateFromPng($_SERVER['DOCUMENT_ROOT']."/im/nobg1.png");
$wd=imagesx($newimage);
$ht=imagesy($newimage);
$nimage= imagecreatetruecolor($wd,$ht);
//$col2 = imageColorAllocate($nimage, 252, 236, 189);
$col1 = imageColorAllocate($nimage, 0, 0, 0);
imagefill($nimage,1,1,$col1);

$white = imagecolorallocate($newimage, 255, 235, 157);
$yy=array();
mt_srand(time());

for($i=0;$i<10;$i++){
	$yy[]=array(mt_rand(0,$wd),mt_rand(0,$ht));
}


for ($i=0;$i<9;$i++){
	//imageline ($newimage, $yy[$i], $ys, $yy[($i+1)], $ye, $white );
	imagearc ($newimage, $yy[$i][0], $yy[$i][1], $yy[$i][0]/2, $yy[$i][0]/2, 0, 360, $white);
}


//$black=ImageColorAllocate($newimage,0,104,0);
//ImageFill($newimage,10,10,$black);

$white = imagecolorallocate($nimage, 200, 200, 200);
$i=0;
foreach ($nos as $code){
	$step=30;
	$angle=5-rand(0,10);
	$x=80+$step*$i+$angle*2;
	$bias1=1;
	$bias2=-1;
	$bias3=0;
	$col=rand(0,150);
	$ind=rand(0,2);
	$array_c=array(150, 150, 150);
	$array_c[$ind]+=$col;
	$white = imagecolorallocate($nimage, $array_c[0],$array_c[1],$array_c[2]);
	
	preg_match("/(\d+)/",$code,$m);
	if (isset($m[1]))
		imagettftext($nimage, 38, ($angle*6), $x, 46, $white, $_SERVER['DOCUMENT_ROOT']."/media/fonts/timesbd.ttf", $code);
	else 
		imagettftext($nimage, 38, ($angle*6), $x, 46, $white, $_SERVER['DOCUMENT_ROOT']."/media/fonts/timesbd.ttf", $code);
	$i++;
}




for ($j=0;$j<$ht;$j++){
	for ($i=0;$i<$wd;$i++){	
		
		$rgb = ImageColorAt($newimage, $i, $j);
		$r = ($rgb >> 16) & 0xFF;
		$g = ($rgb >> 8) & 0xFF;
		$b = $rgb & 0xFF;

		if ($j%2){

			$rgb2 = ImageColorAt($nimage, $i, $j);
			$r2 = ($rgb2 >> 16) & 0xFF;
			$g2 = ($rgb2 >> 8) & 0xFF;
			$b2 = $rgb2 & 0xFF;
		

		} else if ($j%3){
			if (0 < ($i-$bias1) && $wd > ($i-$bias1) ) $e=$i-$bias1; else $e=$i;
			if ($ht > ($j+$bias1) && 0 < ($j+$bias1)) $o=$j+$bias1; else $o=$j;
			

				$rgb2 = ImageColorAt($nimage, $e, $o);
				$r2 = ($rgb2 >> 16) & 0xFF;
				$g2 = ($rgb2 >> 8) & 0xFF;
				$b2 = $rgb2 & 0xFF;

				if ($r2 !=0 && $g2 !=0 & $b2 !=0) {
					$r2+=20;
					$g2+=20;
					$b2+=20;
				}
			
		} else {
			if (0 < ($i-$bias3) && $wd > ($i-$bias3)) $e=$i-$bias3; else $e=$i;
			if ($ht > ($j+$bias3) && 0 < ($j+$bias3)) $o=$j+$bias3; else $o=$j;

			$rgb2 = ImageColorAt($nimage, $e, $o);
			$r2 = ($rgb2 >> 16) & 0xFF;
			$g2 = ($rgb2 >> 8) & 0xFF;
			$b2 = $rgb2 & 0xFF;

			if ($r2 !=0 && $g2 !=0 & $b2 !=0) {
				$r2+=50;
				$g2+=50;
				$b2+=50;
			}
		} 
		//echo "$r,$g,$b<br>";
		$r1=$r+$r2;
		if (($r1<0) || ($r1>255)) $r1=255;
		$g1=$g+$g2;
		if (($g1<0) || ($g1>255)) $g1=255;
		$b1=$b+$b2;
		if (($b1<0) || ($b1>255)) $b1=255;

		//echo "$r1,$g1,$b1<br>";
		$col = imageColorAllocate($newimage, $r1, $g1, $b1);
		imagesetpixel($newimage, $i, $j, $col);
		//imagesetpixel($newimage, $i, $j, $col << 16 | $col << 8 | $col);
	}
}

$white = imagecolorallocate($newimage, 16, 63, 115);
//$newimage=imageRotate($newimage,2,$white);

/*
$white = imagecolorallocate($newimage, 17, 187, 187);
imagettftext($newimage, 48, 5, 40, 38, $white, $_SERVER['DOCUMENT_ROOT']."/arialbi.ttf", $code);

for ($j=0;$j<$ht;$j++){
	for ($i=0;$i<$wd;$i++){

		//if (!$i%2){
			$rgb = ImageColorAt($newimage, $i, $j);
			$r = ($rgb >> 16) & 0xFF;
			$g = ($rgb >> 8) & 0xFF;
			$b = $rgb & 0xFF;
		//}

		//echo "$r,$g,$b<br>";
		$r1=$r+mt_rand(0,40)-20;
		if ($r1<0 ||$r1>255) $r1=$r;
		$g1=$g+mt_rand(0,40)-20;
		if ($g1<0 ||$g1>255) $g1=$g;
		$b1=$b+mt_rand(0,40)-20;
		if ($b1<0 ||$b1>255) $b1=$b;

		//echo "$r1,$g1,$b1<br>";
		$col = imageColorAllocate($newimage, $r1, $g1, $b1);
		imagesetpixel($newimage, $i, $j, $col << 16 | $col << 8 | $col);
	}
}
*/

header("Content-type: image/gif");
ImageGif($newimage);
ImageDestroy($newimage);
ImageDestroy($nimage);


?>