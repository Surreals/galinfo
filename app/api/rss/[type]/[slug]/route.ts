import { NextRequest, NextResponse } from 'next/server'
import { generateRSS, RSS_CONFIGS } from '@/lib/rss-generator'
import { getNewsByCategoryForRSS } from '@/lib/rss-service'

// Функція для отримання назви категорії
function getCategoryTitle(type: string, slug: string): string {
  const categoryTitles: Record<string, Record<string, string>> = {
    'rubric': {
      'politics': 'Політика',
      'economics': 'Економіка',
      'society': 'Суспільство',
      'culture': 'Культура',
      'sport': 'Спорт',
      'health': 'Здоров\'я',
      'crime': 'Кримінал',
      'accident': 'Надзвичайні події'
    },
    'theme': {
      'lviv': 'Львів',
      'region': 'Регіон',
      'ukraine': 'Україна'
    },
    'region': {
      'lviv': 'Львівська область',
      'ivano-frankivsk': 'Івано-Франківська область',
      'ternopil': 'Тернопільська область'
    }
  }
  
  return categoryTitles[type]?.[slug] || slug
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  try {
    const { type, slug } = await params
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const lang = url.searchParams.get('lang') || '1'
    
    const news = await getNewsByCategoryForRSS(type, slug, limit, lang)
    const categoryTitle = getCategoryTitle(type, slug)
    
    // Конфігурація для категорії
    const config = {
      ...RSS_CONFIGS.main,
      title: `Гал-Інфо - ${categoryTitle}`,
      description: `Новини категорії "${categoryTitle}" від агенції інформації та аналітики "Гал-інфо"`
    }
    
    const rss = generateRSS(news, config)
    
    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=600', // 10 хвилин кешування
      },
    })
  } catch (error) {
    console.error('Error generating category RSS:', error)
    
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
