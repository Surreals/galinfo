
<div class="clean"></div>
	<section class="{<ZML:section>}slider">
		<header><a href="/{<ZML:section>}/">{<ZML:sectionname>}<span></span></a></header>

		<script type="text/javascript" src="/js/mediaStrip.js" ></script>
		<div class="lgline" id='lg{<ZML:section>}'>

			<div class="film_window">
				<ul class="film">
					{[<ZML:
					<li class="filmframe">
						<a href="{<ZML:link>}">{<ZML:image>}
						<span><em>{<ZML:header>}</em></span></a>
					</li>
					:newsline>]}
					
				</ul>
			</div>

			<div class="clean"></div>
			<a class="arrnav" id="leftarr" href=""><b>Prev</b></a>
			<a class="arrnav" id="rightarr" href=""><b>Next</b></a>

		</div>
	</section>