<a id='commentstart' name='commentstart' style="margin:0"></a>

<div class="frm" id='commentform'>
	<div id='errmess'></div>
	<form name="ad" method=post>
		<ul class="tbl">
			
			<li>
				<ul>
					<li class=w30><b>{<ZML:lxs:questiontext>}</b></li>
					<li class=w70><textarea name="message" style="width:99%;height:150px;"></textarea></li>
				</ul>
			</li>
			<li><input type="hidden" name="chatid" value="{<ZML:chatid>}">
				<ul>
					<li class=w30>&nbsp;</li>
					<li class=w70><input type="button" class="sbmt" name="commentnow" value="{<ZML:lxs:he_place>}" onClick="return chUp('askchat','ad',1);"></li>
				</ul>
			</li>
		</ul>
		<input type="hidden" name="replyto" id="replyto" value="">
	</form>
	<div class='clean'></div>
</div>