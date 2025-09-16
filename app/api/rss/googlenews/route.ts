import { NextRequest, NextResponse } from 'next/server'
import { generateGoogleNewsSitemap } from '@/lib/rss-generator'
import { getNewsForGoogleNews } from '@/lib/rss-service'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '1000')
    const lang = url.searchParams.get('lang') || '1'
    
    const news = await getNewsForGoogleNews(limit, lang)
    const sitemap = generateGoogleNewsSitemap(news)
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 хвилин кешування
      },
    })
  } catch (error) {
    console.error('Error generating Google News sitemap:', error)
    
    // Fallback sitemap з базовою інформацією
    const fallbackSitemap = generateGoogleNewsSitemap([])
    
    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60', // 1 хвилина кешування для fallback
      },
    })
  }
}
