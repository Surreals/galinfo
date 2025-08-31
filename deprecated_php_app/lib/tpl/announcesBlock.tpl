<section class="announceblock">
	<header><a href="/announces/">{<ZML:lxs:announces>}</a></header>
	<ul class="hot announces">
		{[<ZML:
			<li><time>{<ZML:date>} {<ZML:month>}, {<ZML:wday>} <b>{<ZML:time>}</b></time><a href="/announces/#{<ZML:aid>}">{<ZML:head>}</a></li>
		:items>]}

	</ul>

	<span class="clean"></span>
</section>
