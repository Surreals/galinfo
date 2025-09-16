// Типи для RSS
export interface NewsItem {
  id: string
  title: string
  slug: string
  teaser: string
  content?: string
  category: string
  publishedAt: string
  updatedAt: string
  author?: string
  imageUrl?: string
}

export interface RSSConfig {
  title: string
  description: string
  link: string
  language: string
  imageUrl?: string
  imageTitle?: string
  imageLink?: string
}


// Базовий RSS 2.0 генератор
export function generateRSS(items: NewsItem[], config: RSSConfig): string {
  const rssItems = items.map(item => {
    const pubDate = new Date(item.publishedAt).toUTCString()
    const guid = `https://galinfo.com.ua/news/${item.slug}`
    
    return `
    <item>
      <title><![CDATA[${escapeCDATA(item.title)}]]></title>
      <link>${guid}</link>
      <description><![CDATA[${escapeCDATA(item.teaser)}]]></description>
      <category><![CDATA[${escapeCDATA(item.category)}]]></category>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${guid}</guid>
      ${item.author ? `<author><![CDATA[${escapeCDATA(item.author)}]]></author>` : ''}
      ${item.imageUrl ? `<enclosure url="${item.imageUrl}" type="image/jpeg" />` : ''}
    </item>`
  }).join('')

  const imageTag = config.imageUrl ? `
    <image>
      <url>${config.imageUrl}</url>
      <title><![CDATA[${escapeCDATA(config.imageTitle || config.title)}]]></title>
      <link>${config.imageLink || config.link}</link>
    </image>` : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${escapeCDATA(config.title)}]]></title>
    <link>${config.link}</link>
    <description><![CDATA[${escapeCDATA(config.description)}]]></description>
    <language>${config.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Гал-Інфо RSS Generator</generator>
    ${imageTag}
    ${rssItems}
  </channel>
</rss>`
}


// Google News sitemap генератор
export function generateGoogleNewsSitemap(items: NewsItem[]): string {
  const newsItems = items.map(item => {
    const pubDate = new Date(item.publishedAt).toISOString()
    const url = `https://galinfo.com.ua/news/${item.slug}`
    
    return `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>Гал-Інфо</news:name>
        <news:language>uk</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${escapeCDATA(item.title)}]]></news:title>
      ${item.category ? `<news:keywords><![CDATA[${escapeCDATA(item.category)}]]></news:keywords>` : ''}
    </news:news>
  </url>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${newsItems}
</urlset>`
}

// Допоміжна функція для екранування CDATA
function escapeCDATA(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/]]>/g, ']]&gt;')
}

// Конфігурації для різних типів RSS
export const RSS_CONFIGS = {
  main: {
    title: 'Гал-Інфо - Останні новини',
    description: 'Агенція інформації та аналітики "Гал-інфо" - останні новини Львова та регіону',
    link: 'https://galinfo.com.ua',
    language: 'uk',
    imageUrl: 'https://galinfo.com.ua/im/logo-rss-100.png',
    imageTitle: 'Гал-Інфо',
    imageLink: 'https://galinfo.com.ua'
  }
} as const
