<?

global $a,$p,$previndex;
//$js="js_lang";
function aget_center(){
		global $tx,$lngs,$lngs1,$par;
		$ttop='';
		if (!require_level('ac_newscomment')){
			$errors[]=$tx['in_noaccess'];
			return;
		}

		global $par,$errors,$oks, $tx;

		if (@$par['savecensor']){
			$fh=fopen($_SERVER['DOCUMENT_ROOT']."/tls/censor.txt","w");
			
			if (strtoupper($par['encoding']) !== "UTF-8"){
				$lxtxt=stripslashes(mb_convert_encoding($par['lextext'], $par['encoding'],"UTF-8"));
			} else {
				$lxtxt=stripslashes($par['lextext']);
			}


			fputs($fh, $lxtxt);
			fclose ($fh);
			$oks[]=iho("«м≥ни збережено. якщо ви зм≥нювали кодуванн¤ !ќЅќ¬я« ќ¬ќ! зм≥н≥ть параметер ' одуванн¤ словника'.");
		}


	
		$ttop= "<h1>".$tx['he_censor']."</h1><hr><form name='ad' method=post>".$ttop;

		$fh=fopen($_SERVER['DOCUMENT_ROOT']."/tls/censor.txt","r");
		$t4x="";
		while ($c = fread($fh,1024)){
			$t4x.=$c;
		}
		fclose($fh);
		//$par['lextext']=getfromlex($t4x,$par['lng']);
		$par['lextext']=$t4x;
		$ttop.="<h2><br>".iho('—ловник цензора ')."<h2>";
		$ttop.="<table width=100%>";
		$ttop.="<tr><td width=150  class=bord1>".iho(" одуванн¤")."</td>";
		$ttop.="<td class=bord1>".bd_popup(array("utf-8","utf-8","windows-1251","windows-1251"),'encoding','width:750px;',1,'')."</td></tr>";
		
		$ttop.="<tr><td class=bord1>".iho("«м≥ст словника")."</td>";
		$ttop.="<td class=bord1>".bd_tar_edit(@$par['lextext'],'lextext','750px','500px;',2,'')."</td></tr>";
		
		$ttop.="<tr><td class=bord1>&nbsp;</td><td class=bord1><input type=submit id=submt class=save name=savecensor value='".iho('«берегти зм≥ни')."'></td></tr>";
		$ttop.="</table>";
		

		$ttop.="<input name=action value=censor type=hidden>";
		$ttop.= "</form>";
		return $ttop;

}



?>