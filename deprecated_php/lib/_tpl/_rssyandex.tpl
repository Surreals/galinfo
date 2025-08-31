<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:yandex="http://news.yandex.ru" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
	<channel>
		<title>{<ZML:rsstitle>}</title>
		<link>{<ZML:rssurl>}</link>
		<description>{<ZML:rssdescr>}</description>
		<channel>
			<yandex:logo>{<ZML:rssimage>}</yandex:logo>
			<yandex:logo type="square">{<ZML:rssimage180>}</yandex:logo>
		</channel>
		{[<ZML:<item>
			<title>{<ZML:title>}</title>
			<link>{<ZML:link>}</link>
			<description>{<ZML:teaser>}</description>
			<category>{<ZML:category>}</category>
			<pubDate>{<ZML:date>}</pubDate>
			<yandex:full-text>{<ZML:fulltext>}
			</yandex:full-text>
		</item>
		:itemset>]}
	</channel>
</rss>