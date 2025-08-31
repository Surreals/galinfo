<header class="theader">
	<div class="hwrap">
		<a href="/" class="menubutton"><span>{<ZML:lxs:menu>}</span></a>
		<time>{<ZML:dvar:today_weekday>} {<ZML:dvar:locdate>}  <span>{<ZML:dvar:localtime>}</span></time>
		<a href="/news/" class="newsplash"></a>
		<div class="headertools">
			{<ZML:fnc:loginForm>}
			<a href="" id="srchlink" class="svlink">
				<svg version="1.1" id="itw" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 35 35"  xml:space="preserve" >
					<use xlink:href="/im/svglib.svg#search"></use>	
				</svg>
			</a>
			{<ZML:fnc:tplSearchValue>}
		</div>
		<div class="footertools">
			<a href="/rss/export.rss" class="svlink">
				<svg version="1.1" id="irss" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0  40 40"  xml:space="preserve" >
					<use xlink:href="/im/svglib.svg#rss"></use>	
				</svg>
			</a>

			<a href="http://www.facebook.com/galinfo" class="svlink" target="_blank">
				<svg version="1.1" id="ifb" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0  40 40"  xml:space="preserve" >
					<use xlink:href="/im/svglib.svg#facebook"></use>	
				</svg>
			</a>
	
			<a href="https://twitter.com/galinfo_lviv" class="svlink" target="_blank">
				<svg version="1.1" id="itw" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0  40 40"  xml:space="preserve" >
					<use xlink:href="/im/svglib.svg#twitter"></use>	
				</svg>
			</a>
		</div>
	</div>
</header>

<nav>
	<div class="scrlout">
		<div class="scrldesk">
			<div class="sharecopy"></div>
			<span class="logincopy"></span>
			<div class="searchcopy"></div>
			<ul class="mmenu">                                       
				{<ZML:fnc:getRubrics>}                                    
				<li><a href="/" class="menulogo">
					<svg version="1.1" id="logo_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 70"  xml:space="preserve">
						<use xlink:href="/im/svglib.svg#logo"></use>	
					</svg>
				</a></li>
				<li><a href='http://{<ZML:dvar:domain>}/news/'>Новини</a></li>
				{<ZML:fnc:getRegions>}
				<li><a href='http://{<ZML:dvar:domain>}/blogs/'>Блоги</a></li>
				<li><a href='http://{<ZML:dvar:domain>}/subject/'>Статті</a></li>
				<li><a href='http://{<ZML:dvar:domain>}/photo/'>Фото</a></li>
				<li><a href='http://{<ZML:dvar:domain>}/video/'>Відео</a></li>
				<li><a href='http://{<ZML:dvar:domain>}/announce/'>Анонси</a></li>
				<li><a href='http://{<ZML:dvar:domain>}/archive/'>Архів</a></li>
				<li><a href='http://{<ZML:dvar:domain>}/about/'>Агенція</a></li>
				<li><a href='http://{<ZML:dvar:domain>}/commercial/'>Реклама</a></li>
			</ul>
			<a href="" class="suggestscroll"></a>
		</div>
	</div>
	<a href="" class="slideaway">&laquo;</a>
</nav>

<div class="container">
	<div class="logozone hwrap">
		<a href="/" id="logo">
			<svg version="1.1" id="logo_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 180 60"  xml:space="preserve" >
				<use xlink:href="/im/svglib.svg#logo"></use>	
			</svg>
		</a>
		{<ZML:fnc:topThemes>}
		<a href="http://onair.lviv.fm:8000/lviv.fm.m3u" class="lwave" target="_blank">Слухай онлайн</a>
	</div>
