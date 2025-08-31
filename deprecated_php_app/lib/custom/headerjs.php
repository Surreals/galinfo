<?
$depot['vars']['mod_result']=get_headerjs();

function get_headerjs(){
	global $par,$depot;

	$html="";

	if (@$par['ns'] !== 'home') {
		$html="
				<script type='text/javascript'>
				  googletag.cmd.push(function() {
				    googletag.pubads().enableSingleRequest();
				    googletag.enableServices();
				  });
				</script>
		";
	}

	return $html;
}


/*makeUkrnetLink()*/