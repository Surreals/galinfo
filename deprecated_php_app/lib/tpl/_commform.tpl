
<span class="boxheader">{<ZML:lxs:he_addcomment>}</span>
<form  id="commentform" name="commentform" method="post"  class="frm">
	<div id="errmess"></div>
	<div class="avacomment">
		{<ZML:loggedinfo>}
	</div>
	<div class="formcomment">
		<textarea name="message" style="width:100%;height:100px;"></textarea>

		<input type="hidden"	name="precode" value="{<ZML:no>}">
		<input type="hidden"	name="processing" value="{<ZML:lxs:he_processing>}">
		<input type="hidden"	name="commentid" value="{<ZML:commentid>}">
		<input type="hidden"	name="replyto" id="replyto" value="">
	
		<input type="button" class="sbmt" name="commentnow" value="{<ZML:lxs:he_place>}" onClick="return chUp('addcomment','commentform',1);">
	</div>
	<div class="clean"></div>
</form>

<!--<div class="frm" id='commentform'>
	<div id='errmess'></div>
	<form name="ad" method=post>
		<ul class="tbl"><br>

			<li>
				<ul>
					<li class=w30>{<ZML:lxs:fullname>}</li>
					<li class=w70><input name="myname" type="text" style="width:280px;" value="{<ZML:namevalue>}"></li>
				</ul>
			</li>

			<li>
				<ul>
					<li class=w30>{<ZML:lxs:he_comment>}</li>
					<li class=w70><textarea name="message" style="width:99%;height:200px;"></textarea></li>
				</ul>
			</li>
			<li>
				<ul>
					<li class=w30>{<ZML:lxs:he_verify>}</li>
					<li class=w70><input name="seccode" type="text" style="width:280px;"></li>
				</ul>
			</li>
			
			<li>
				<ul>
					<li class=w30><a href="" onClick="return refIm('codeim');" class=hint >{<ZML:lxs:he_changecode>}</a></li>
					<li class=w70><img src="/apphlp/human.php?precode={<ZML:no>}" name=codeim id=codeim width=280>
						<input type="hidden" name="precode" value="{<ZML:no>}">
						<input type="hidden" name="processing" value="{<ZML:lxs:he_processing>}">
						<input type="hidden" name="commentid" value="{<ZML:commentid>}">
					</li>
				</ul>
			</li>
			<li>
				<ul>
					<li class=w30>&nbsp;</li>
					<li class=w70><input type="button" class="sbmt" name="commentnow" value="{<ZML:lxs:he_place>}" onClick="return chUp('addcomment','ad',1);"></li>
				</ul>
			</li>
		</ul>
		<input type="hidden" name="replyto" id="replyto" value="">
	</form>
	<div class='clean'></div>
</div>-->