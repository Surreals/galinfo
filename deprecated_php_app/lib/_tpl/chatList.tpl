{<ZML:listhead>}
<header>{<ZML:lxs:chats>}</header>
<span class="spacer"></span>
<ul class="hot chatl">
	{[<ZML:
		<li>
			<a href='{<ZML:link>}' class="tmb">{<ZML:image>}</a>

			<span>
				<a href='{<ZML:link>}'><h2>{<ZML:nguest>}</h2></a>

				<time>{<ZML:day>} {<ZML:month>}<b> {<ZML:year>}</b></time><i><sup></sup>{<ZML:lxs:questions>} {<ZML:questions>}</i><br>
				<em>{<ZML:teaser>}</em>
				<a href="{<ZML:link>}" class="chatreport"><b></b>{<ZML:lxs:chatreport>}</a>
			</span>
		</li>
	:chatlist>]}
</ul>
{<ZML:pager>}