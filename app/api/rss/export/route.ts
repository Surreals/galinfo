import { NextRequest, NextResponse } from 'next/server'
import { generateRSS, RSS_CONFIGS } from '@/lib/rss-generator'
import { getLatestNewsForRSS } from '@/lib/rss-service'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const lang = url.searchParams.get('lang') || '1'
    
    const news = await getLatestNewsForRSS(limit, lang)
    const rss = generateRSS(news, RSS_CONFIGS.main)
    
    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 хвилин кешування
      },
    })
  } catch (error) {
    console.error('Error generating RSS:', error)
    
    // Fallback RSS з базовою інформацією
    const fallbackRSS = generateRSS([], RSS_CONFIGS.main)
    
    return new NextResponse(fallbackRSS, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60', // 1 хвилина кешування для fallback
      },
    })
  }
}
