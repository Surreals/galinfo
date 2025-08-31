<?




function superMail_SMTP($eaddress,$esubj,$ebody,$contenttype){
   LLoad('class.phpmailer');
	$mail = new phpmailer();
	$mail->Username = "noreply@techprom.lviv.ua";
	$mail->Password	=  "BV3SdXOa";
	$mail->From     = "noreply@techprom.lviv.ua";
	$mail->ContentType = $contenttype;
	//$mail->CharSet	=	'windows-1251';
	$mail->FromName = "TECHPROM";
	$mail->Host     = "localhost";
	$mail->Mailer   = "smtp";
	$mail->Subject = $esubj;
	$mail->Body    = $ebody;
	$mail->AddAddress($eaddress, '');
	if($mail->Send()) return true; else return false;
	$mail->ClearAddresses();
}



function superMail($eaddress,$esubj,$ebody,$contenttype="text/plain"){
	$headers = "Mime-Version: 1.0\n"; 
	/*$headers .= "Content-Type: text/html; format=flowed; delsp=yes; charset=windows-1251\n";
	$headers .=	"Reply-To: ".$eaddress."\n"; */
	$headers .= "Return-Path: ".$eaddress."\n";	 
	$headers .= "From: noreply@".$_SERVER['HTTP_HOST']."\n"; 
	//$headers .= "Content-Transfer-Encoding: 7bit\n";
	$headers .=	"Message-ID: <". generate_unique(7)."@".$_SERVER['HTTP_HOST'].">\n";
	$headers .= "User-Agent: ZMOLO";


	//$headers =	"From: noreply@chalegraal.com.ua\n";
	//$headers .=	"Reply-To: noreply@chalegraal.com.ua\n";
	//$headers .= "Return-Path: noreply@chalegraal.com.ua\n";

	/*CONTENT TYPE text/plain text/html*/
	$headers = "Content-Type: $contenttype; format=flowed; delsp=yes; charset=windows-1251\n";
	$headers .= "Mime-Version: 1.0\n"; 
	
	if (mail($eaddress,$esubj,$ebody,$headers))return true; else return false;	

}


?>