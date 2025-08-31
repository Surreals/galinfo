<div class="spacer"></div>
<div class="madiablock hwrap">
    <div class="half">
        <a href="{<ZML:mainimagelink>}" class="likeguard" style="background-image:url({<ZML:mainimage>});" title="{<ZML:maintitle>}"></a>
    </div>
    <div class="half">
        {[<ZML:
		<a href="{<ZML:imagelink>}" class="half likeguard" style="background-image:url({<ZML:image>});" title="{<ZML:title>}"></a>
	:item>]}

        {[<ZML:
		<a href="{<ZML:imagelink>}" class="half likeguard hidden" title="{<ZML:title>}"></a>
	:hiddenitem>]}
    </div>
</div>
<script>
    $(document).ready(function () {
        makeViewer($(".madiablock"));
    });
</script>