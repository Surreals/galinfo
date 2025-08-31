<?
function aget_center(){

		global $par,$depot;
		$ttop='';
		
		if (!isset($par['gologin'])){
			$ttop.=login_form();
			return $ttop;
		} else {
			chk_req("username",$depot['tx']['he_username']);
			chk_req("password",$depot['tx']['he_pass']);
			
			if ($depot['errors']){
				$ttop.=login_form();
				return $ttop;
			} else {
				if (!try_login()) {
					$ttop.=login_form();
					return $ttop;
				} 


			}
			
		}
		return $ttop;

}


function login_form(){
	global $par,$depot;
	$ttop='';
	$ttop.="<form name='signup' method='post'>";

		$ttop.= "";
		$ttop.= "
		
		<div style='height:400px;text-align:center;font-size:14px;' class='centerme'>
			
			<DIV STYLE='margin:auto auto;background:#c70850;width:420px;padding:50px 0;color:#FFF !important;'>
				".errors()."

				<table width=300 cellspacing='15px;' style='margin:auto auto;'><tr><td colspan=2>&nbsp;</td></tr>
					<tr>
						<td width=50% style='color:#FFF;'>

								".$depot['tx']['he_username']."</td><td>".bd_tf(@$par['username'], 'username', 'text','width:150px;overflow:hidden;padding:5px;height:auto;',1,'').

				"		</td>
					</tr>
					
					<tr>
						<td style='color:#FFF;'>
							".$depot['tx']['he_pass']."</td><td>".bd_tf(@$par['password'], 'password', 'password','width:150px;overflow:hidden;padding:5px;height:auto;',2,'')."
				
						</td>
					</tr>
					
					<tr>
						<td>
						</td>
						
						<td>
							<br><input type='submit' name='gologin' id='submt' value=\"".$depot['tx']['he_enter']."\" style='margin-top:30px;'><br>
						</td>
					</tr>
				</table>
			</div>
		</div>
	
	</form>";
	
		
	return $ttop;



}
?>