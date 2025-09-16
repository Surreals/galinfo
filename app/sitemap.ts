import { MetadataRoute } from 'next'
import { getNewsForSitemap } from '@/lib/rss-service'
import { getCategoriesForSitemap } from '@/lib/seo-utils'

async function getStaticPages(): Promise<Array<{url: string, lastModified: string, changeFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never', priority: number}>> {
  return [
    {
      url: 'https://galinfo.com.ua',
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly',
      priority: 1.0
    },
    {
      url: 'https://galinfo.com.ua/news',
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly',
      priority: 0.9
    },
    {
      url: 'https://galinfo.com.ua/blogs',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: 'https://galinfo.com.ua/subject',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: 'https://galinfo.com.ua/announce',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: 'https://galinfo.com.ua/archive',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.6
    },
    {
      url: 'https://galinfo.com.ua/about',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: 'https://galinfo.com.ua/commercial',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.4
    }
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [news, categories, staticPages] = await Promise.all([
      getNewsForSitemap('1', 500), // lang=1, limit=500 - достатньо для 30 днів
      getCategoriesForSitemap('1'), // lang=1
      getStaticPages()
    ])

    // Статичні сторінки
    const sitemapEntries: MetadataRoute.Sitemap = [...staticPages]

    // Категорії
    categories.forEach(category => {
      sitemapEntries.push({
        url: `https://galinfo.com.ua/${category.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'hourly',
        priority: 0.7
      })
    })

    // Новини (останні 30 днів для продуктивності)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentNews = news.filter(article => 
      new Date(article.publishedAt) >= thirtyDaysAgo
    )

    recentNews.forEach(article => {
      sitemapEntries.push({
        url: `https://galinfo.com.ua/news/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'daily',
        priority: 0.7
      })
    })

    return sitemapEntries
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback до базових сторінок
    return [
      {
        url: 'https://galinfo.com.ua',
        lastModified: new Date().toISOString(),
        changeFrequency: 'hourly',
        priority: 1.0
      }
    ]
  }
}
