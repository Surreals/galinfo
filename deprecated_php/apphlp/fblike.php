<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
 <head>
  <title>FB like box</title>
  <meta charset="utf-8">
  <meta name="Author" content="">
  <meta name="Keywords" content="">
  <meta name="Description" content="">
  <script type="text/javascript" src="/js/jquery-1.11.1.min.js"></script>
  <link href="https://code.cdn.mozilla.net/fonts/fira.css" rel="stylesheet" type="text/css">

  <script>
	$(document).ready(
		function(){
				$(".hidepop").click(function(){
					hidePop();
					return false;
				})
		}
	);

	function hidePop(){	
		$(top.window.document).find("#likesplash,#fader").fadeTo(0.05,500,
			function(){
				$(this).hide();
			}
		);			
	}


	function hidePopCallback(eevent){
		url ="/apphlp/fblike.php?event="+eevent;
		$(location).attr('href',url);
	}

  </script>

	<style>
		body{font-family:Roboto;padding:20px;text-align: center;}
		a{color:#F66;display:block;margin-top:20px;}
		.claim{float:left;width:130px;font-size:1em;font-weight:700;margin:20px 20px 0 20px ;}
		.vclaim{display:block;float:none;margin:20px;font-size:1em;font-weight:700;}
		.fbh	{float:right}
		.fbw	{float:none}
	</style>

 </head>

 <body style="padding:0;margin: 10px;color: #FFF;font-family: fira-sans,arial,sans-serif">
	<? if (!isset($_REQUEST['event'])) {
		
		$h=300;
		$cclass="vclaim";
		$class="fbh";
		if ($_REQUEST['s'] == "520") {
			$w=500;
		} elseif ($_REQUEST['s'] == "500") {
			$w=300;
		} elseif ($_REQUEST['s'] == "320") {
			$w=300;
			$h=200;
			$class="fbv";
			$cclass="vclaim";
		}
	
	?>

	 <div class="<?=$cclass?>">
		Вподобайте нашу сторінку в «Facebook». <br>Дізнавайтеся про усі події першими зі стрічки новин на власній сторінці у «Facebook». 
	 </div>
	<div class="<?=$class?>">
		<div id="fb-root"></div>
		<script>(function(d, s, id) {
		 var js, fjs = d.getElementsByTagName(s)[0];
		 if (d.getElementById(id)) return;
		 js = d.createElement(s); js.id = id;
		 js.src = "//connect.facebook.net/uk_UA/all.js#xfbml=1";
		 fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
			
		window.fbAsyncInit = function() {

		  FB.Event.subscribe('edge.create', function(response) {
			  hidePopCallback('like');
		  });

		  FB.Event.subscribe('edge.remove', function(response) {
			  hidePopCallback('unlike');
		  });
		};

		</script>

		 <div class="fb-page" data-href="http://www.facebook.com/galinfo" data-width="<?=$w?>" data-small-header="true" data-adapt-container-width="false" data-hide-cover="false" data-show-facepile="true" data-show-posts="false"><div class="fb-xfbml-parse-ignore"><blockquote cite="http://www.facebook.com/galinfo"><a href="http://www.facebook.com/galinfo">Інформаційна агенція &quot;Гал-інфо&quot;</a></blockquote></div></div>

	</div>

	<a href="#" class="hidepop" style="display: block; margin: 30px auto;color: #FFF; text-transform: uppercase; float: left; clear: both; font-size: 13px; width: 100%; text-decoration: none; color: #f7629f; letter-spacing: 2px;">Нагадати пізніше</a>
	<?} else {
		if ($_REQUEST['event']=='like')	{
	
			setcookie('zmliked',1,time()+3600*24*365,'/');

			?>

			
			<div style="width:100%;margin-top:100px;font-size:38px;text-align:center;color:#FFF;font-weight:bold;">Тепер — ми друзі ))</div>
			
			
		<?} else {

			setcookie('zmliked',1,time()-3600*24*100,'/');
			
		?>
			
			<div style="width:100%;margin-top:100px;font-size:38px;text-align:center;color:#FFF;font-weight:bold;"> ...</div>
		<?}?>
		
		<script>
			$(document).ready(function(){
				
				timer=setTimeout(function(){hidePop()},1000);

			});	
		</script>

	<?}?>
	 
 </body>
</html>