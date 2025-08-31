<section class="ccontent">
	<h1>{<ZML:lxs:registration>}</h1>
	{<ZML:fnc:errors,1>}
	{<ZML:fnc:oks,1>}
	<form method="post" name="signupform" style='display:block;'>


		<ul class='tbl pt20'>

			<li class='noline '>
				<ul>
					<li class="w40">{<ZML:lxs:email>}<span class='obligatory'>*</span>
					<li class="w40">{<ZML:email>}
				</ul>

			<li class='noline'>
				<ul>
					<li class="w40">{<ZML:lxs:password>}<span class='obligatory'>*</span>
					<li class="w40">{<ZML:password>}
				</ul>
			<li class='noline'>
				<ul>
					<li class="w40">{<ZML:lxs:rpassword>}<span class='obligatory'>*</span>
					<li class="w40">{<ZML:password1>}
				</ul>
			<li class='noline'>
				<ul>
					<li class="w40">{<ZML:lxs:fullname>}<span class='obligatory'>*</span>
					<li class="w40">{<ZML:name>}
				</ul>
			&nbsp;

		</ul>

		
	   <div class='clean'></div>
	   <div class='gipanel'>

			{<ZML:ask>}

		</div>
		<ul class="tbl pt20" style='margin-bottom:40px;'>
			
			<li class=noline>
				<ul>

					<li class="w40">{<ZML:lxs:vcode>}<span class='obligatory'>*</span>	
					<li class="w40">{<ZML:verify>}
				</ul>
			
			<li>
				<ul>

					<li class="w40">
					<li class="w40">
					<img src="/apphlp/human.php?precode={<ZML:precode>}" style="clear:both;float:left;" name=codeim id=codeim>
					<a href="" onClick="return refIm('codeim');" class='hint' style='margin-left:20px;'>{<ZML:lxs:changecode>}</a>
				</ul>
			<li class=noline>&nbsp;<br>
			<li class=noline>
				<ul>

					<li class="w40">
					<li class="w40"><input type="submit" class="sbmt" name="sd" value="{<ZML:lxs:goregister>}" /><br><br>
				</ul>
			<input type=hidden name=precode value="{<ZML:precode>}">

		</ul>


	</form>
	<span class="clean"></span>
</section>