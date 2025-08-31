<?
/*	 */
$vars['mod_result']=get_bottom();


function get_bottom(){
	global $par,$lxs,$vars;
	$ttop="";

	if ($_SERVER["REQUEST_URI"]=="/") $c="<a href='http://zmolo.com' id='zmolo' title='".$lxs['he_zmolo']."'><img src='/im/zmolo.com.gif'> zmolo.com</a>"; else $c="";

	$ttop.="	
	<div class=\"footer\">
		<div class=\"copy\">
			 <span>
				© 2005-".date('Y',$vars['ctime'])."<br>
				".$lxs['he_zike']."<br><br>
			</span>
		
		</div>
			
		<div class='please'>
			  <b>".$lxs['he_copyright2']."</b>
			  <br><br><br> 

		
	  </div>

		$c

	</div>";

	return  $ttop;

}



		
	
	

/*makeUkrnetLink()*/