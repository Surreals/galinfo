<?

function quick_mail($eaddress,$esubj,$ebody,$from_mail){

	if (!$eaddress) return false;
	$unique=generate_unique(16);
	//$headder="\nReturn-Path: <divingschool@ronaldo-is.com>\nContent-Type: text/plain; format=flowed; delsp=yes; charset=iso-8859-1\nMIME-Version: 1.0\nContent-Transfer-Encoding: 7bit\nMessage-ID: <op.$unique@ronaldo-is.com>\nUser-Agent: Opera Mail/9.01 (Win32)";
	/*$headers =	"From: ".$from_address." <".$from_mail.">\n";*/
	$headers =	"From: ".$from_mail."\n";	
	$headers .= "Return-Path: " . $from_mail . "\n";
	//$headers .= "Content-Type: text/plain; format=flowed; delsp=yes; charset=ISO-8859-1\n";
	$headers .= "Mime-Version: 1.0\n";  
	$headers .= "Content-Transfer-Encoding: 7bit\n";
	$headers .= "User-Agent: ZMOLO MAILER";
	$headers .= "Content-Type: text/plain; format=flowed; delsp=yes; charset=windows-1251\n";
	$headers .= "Mime-Version: 1.0\n"; 
	/*echo htmlspecialchars($eaddress)."<br><br>".$esubj."<br><br>".$ebody."<br><br>".$headers;
	die();*/
	if (mail($eaddress,$esubj,$ebody,$headers)) return true; else return false;
	
}

function bulk_mail($returnaddress,$eaddress,$esubj,$ebody,$encoding){
	global $enviro,$par,$mencd,$lxs;
	$unique=generate_unique(8);
	
	$headers =	"From:$returnaddress\n";

	$headers .= "Return-Path: " . $returnaddress . "\n";
	$headers .=	"Reply-To: ".$returnaddress."\n";
	
	 
	$headers .=	"Message-ID: <$unique@".$_SERVER['HTTP_HOST'].">\n";
	$headers .= "User-Agent: Mail Zmolo.com (Edition 0.4/07)\n";
	
	
	$headers = "Mime-Version: 1.0\n"; 
	$headers .= "Content-Type: ".$encoding."; format=flowed; delsp=yes; charset=windows-1251\n";
	if (mail($eaddress,stripslashes($esubj),stripslashes($ebody),$headers))return true; else return false;
	
}



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
