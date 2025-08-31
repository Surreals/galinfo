<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
	<channel>
		<title>{<ZML:rsstitle>}</title>
		<link>{<ZML:rssurl>}</link>
		<description>{<ZML:rssdescr>}</description>
		<image>
			<url>{<ZML:rssimage>}</url>
			<title>{<ZML:rsstitle>}</title>
			<link>{<ZML:rssurl>}</link>
		</image>
		{[<ZML:<item>
			<title>{<ZML:title>}</title>
			<link>{<ZML:link>}</link>
			<description>{<ZML:teaser>}</description>
			<category>{<ZML:category>}</category>
			<pubDate>{<ZML:date>}</pubDate>
			<fulltext>{<ZML:fulltext>}
			</fulltext>
		</item>
		:itemset>]}
	</channel>
</rss>