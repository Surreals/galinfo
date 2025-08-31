<?
$depot['vars']['mod_result']=get_headerjs();

function get_headerjs(){
	global $par,$depot;

	$html="";
	
	if (@$par['ns'] !== 'home') {
		$html="
				<script type='text/javascript'>
				  googletag.cmd.push(function() {
				    googletag.defineSlot('/17774365/galinfo.com.ua_300x250', [300, 250], 'div-gpt-ad-1453283699797-0').addService(googletag.pubads());
				    googletag.defineSlot('/17774365/galinfo.com.ua_728x90', [728, 90], 'div-gpt-ad-1453283699797-1').addService(googletag.pubads());
				    googletag.pubads().enableSingleRequest();
				    googletag.enableServices();
				  });
				</script>
		";
	}

	return $html;
}


/*makeUkrnetLink()*/