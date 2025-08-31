<?


$depot['vars']['mod_result']=get_socials();

function get_socials()
{
	global $depot,$par;


	$fb="https://www.facebook.com/www.kurs.if.ua";
	$tw="https://twitter.com/KURS_IF";
	$gp="https://plus.google.com/u/0/b/113221868071252585247/113221868071252585247/posts";
	$yt="https://www.youtube.com/channel/UCoL9vRgaCN7Y7xbpQB60sdQ";
	$vc="http://vk.com/kurs_if_ua";
	$rs="/rss/export.xml";
	


	
	return "<div class='socblock'>
					<a href='$fb' class='fb' title='".$depot['lxs']['fb']."' target='_blank'  rel='nofollow'><b>Фейсбук</b></a>
					<a href='$tw' class='tw' title='".$depot['lxs']['tw']."' target='_blank'  rel='nofollow'><b>Твитер</b></a>
					<a href='$gp' class='gp' title='".$depot['lxs']['gp']."' target='_blank'  rel='nofollow'><b>Google +</b></a>
					<a href='$yt' class='yt' title='YouTube' target='_blank'  rel='nofollow'><b>YouTube</b></a>
					<a href='$vc' class='vk' title='".$depot['lxs']['vc']."' target='_blank'  rel='nofollow'><b>В контакте</b></a>
					<a href='$rs' class='rs' title='RSS' target='_blank'  rel='nofollow'><b>RSS</b></a>
			</div>
			
			" ;
	
}




?>