<!--comments//-->
<!--<section class="commentsection">
	<a id='commentstart' name='commentstart'></a>
	<span class="boxtitle">{<ZML:commhead>}</span>					
		
	{<ZML:addcommentlink>}
	<div class='clear'></div>

	{<ZML:addcommentform>}
	
	<ul id="comments">
		{[<ZML:
		<li class="{<ZML:class>}">
			<span class="commentbody">
				<strong>{<ZML:nick>}</strong>
				{<ZML:comment>}
				<span class="commentmenu">
					{<ZML:date>}
					{<ZML:replylink>} 
					<b style="float:right;">{<ZML:ip>}</b> 
				</span>
			</span>
		</li>
		:commset>]}
		
		{<ZML:pager>}
	</ul>
</section>-->


<div class="fb-comments" data-href="http://{<ZML:svar:HTTP_HOST>}{<ZML:svar:REQUEST_URI>}" data-width="100%" data-numposts="10"></div>
