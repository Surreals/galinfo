import { NextResponse } from 'next/server'

export async function GET() {
  const currentDate = new Date().toISOString()
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://galinfo.com.ua/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </sitemap>
  <sitemap>
    <loc>https://galinfo.com.ua/api/rss/googlenews</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </sitemap>
</sitemapindex>`

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1 година кешування
    },
  })
}
