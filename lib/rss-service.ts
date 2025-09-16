import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';

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

export interface Category {
  id: string
  name: string
  slug: string
  type: 'rubric' | 'theme' | 'region'
}

// Отримання останніх новин для RSS
export async function getLatestNewsForRSS(limit: number = 20, lang: string = '1'): Promise<NewsItem[]> {
  try {
    const [news] = await executeQuery(`
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.ntype,
        a_news.images,
        a_news.urlkey,
        a_news.rubric,
        a_news_headers.nheader,
        a_news_headers.nteaser,
        a_news_body.nbody,
        a_cats.title as category_title
      FROM a_news USE KEY(udate)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_body USE KEY (PRIMARY) ON a_news.id = a_news_body.id
      LEFT JOIN a_cats ON FIND_IN_SET(a_cats.id, a_news.rubric) AND a_cats.cattype = 1
      WHERE a_news.lang = ?
        AND a_news.udate < UNIX_TIMESTAMP() 
        AND a_news.approved = 1
        AND a_news.hiderss = 0
      ORDER BY a_news.udate DESC
      LIMIT ?
    `, [lang, limit]);

    // Отримання зображень для новин
    const imageIds = news
      .filter((item: any) => item.images)
      .map((item: any) => item.images.split(','))
      .flat()
      .filter((id: string) => id.trim());
    
    let imagesData: any[] = [];
    if (imageIds.length > 0) {
      const imagesQuery = `
        SELECT id, filename, title_ua
        FROM a_pics
        WHERE id IN (${imageIds.map(() => '?').join(',')})
      `;
      const [imagesDataResult] = await executeQuery(imagesQuery, imageIds);
      imagesData = imagesDataResult;
    }

    // Формування RSS новин
    const rssNews: NewsItem[] = news.map((item: any) => {
      // Безпечне парсинг дат з валідацією
      const ndateTimestamp = parseInt(item.ndate);
      const ntimeTimestamp = parseInt(item.ntime);
      
      let publishedAt: string;
      let updatedAt: string;
      
      try {
        if (ndateTimestamp && !isNaN(ndateTimestamp) && ndateTimestamp > 0) {
          publishedAt = new Date(ndateTimestamp * 1000).toISOString();
        } else {
          publishedAt = new Date().toISOString(); // Fallback to current time
        }
      } catch (error) {
        publishedAt = new Date().toISOString();
      }
      
      try {
        if (ntimeTimestamp && !isNaN(ntimeTimestamp) && ntimeTimestamp > 0) {
          updatedAt = new Date(ntimeTimestamp * 1000).toISOString();
        } else {
          updatedAt = publishedAt; // Fallback to published time
        }
      } catch (error) {
        updatedAt = publishedAt;
      }
      const slug = item.urlkey || `news-${item.id}`;
      
      // Отримання зображення
      let imageUrl = '';
      if (item.images) {
        const newsImageIds = item.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
        const newsImages = formatNewsImages(imagesData, newsImageIds, lang);
        if (newsImages.length > 0) {
          imageUrl = newsImages[0].url;
        }
      }

      return {
        id: item.id.toString(),
        title: item.nheader || 'Без заголовка',
        slug,
        teaser: item.nteaser || '',
        content: item.nbody || '',
        category: item.category_title || 'Новини',
        publishedAt,
        updatedAt,
        author: 'Гал-Інфо',
        imageUrl
      };
    });

    return rssNews;
  } catch (error) {
    console.error('Error fetching latest news for RSS:', error);
    return [];
  }
}

// Отримання новин за категорією для RSS
export async function getNewsByCategoryForRSS(
  type: string, 
  slug: string, 
  limit: number = 20, 
  lang: string = '1'
): Promise<NewsItem[]> {
  try {
    let categoryCondition = '';
    let categoryJoin = '';
    
    if (type === 'rubric') {
      // Знаходимо ID категорії за slug
      const [category] = await executeQuery(`
        SELECT id, title FROM a_cats 
        WHERE param = ? AND cattype = 1 AND lng = ? AND isvis = 1
      `, [slug, lang]);
      
      if (category.length === 0) {
        return [];
      }
      
      const categoryId = category[0].id;
      categoryCondition = `AND FIND_IN_SET(${categoryId}, a_news.rubric)`;
    } else if (type === 'theme') {
      // Для тем використовуємо спеціальні категорії
      const [category] = await executeQuery(`
        SELECT id, title FROM a_cats 
        WHERE param = ? AND cattype = 2 AND lng = ? AND isvis = 1
      `, [slug, lang]);
      
      if (category.length === 0) {
        return [];
      }
      
      const categoryId = category[0].id;
      categoryCondition = `AND FIND_IN_SET(${categoryId}, a_news.rubric)`;
    } else if (type === 'region') {
      // Для регіонів використовуємо поле region
      categoryCondition = `AND FIND_IN_SET(${slug}, a_news.region)`;
    }

    const [news] = await executeQuery(`
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.ntype,
        a_news.images,
        a_news.urlkey,
        a_news.rubric,
        a_news_headers.nheader,
        a_news_headers.nteaser,
        a_news_body.nbody,
        a_cats.title as category_title
      FROM a_news USE KEY(udate)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_body USE KEY (PRIMARY) ON a_news.id = a_news_body.id
      LEFT JOIN a_cats ON FIND_IN_SET(a_cats.id, a_news.rubric) AND a_cats.cattype = 1
      WHERE a_news.lang = ?
        AND a_news.udate < UNIX_TIMESTAMP() 
        AND a_news.approved = 1
        AND a_news.hiderss = 0
        ${categoryCondition}
      ORDER BY a_news.udate DESC
      LIMIT ?
    `, [lang, limit]);

    // Отримання зображень для новин
    const imageIds = news
      .filter((item: any) => item.images)
      .map((item: any) => item.images.split(','))
      .flat()
      .filter((id: string) => id.trim());
    
    let imagesData: any[] = [];
    if (imageIds.length > 0) {
      const imagesQuery = `
        SELECT id, filename, title_ua
        FROM a_pics
        WHERE id IN (${imageIds.map(() => '?').join(',')})
      `;
      const [imagesDataResult] = await executeQuery(imagesQuery, imageIds);
      imagesData = imagesDataResult;
    }

    // Формування RSS новин
    const rssNews: NewsItem[] = news.map((item: any) => {
      // Безпечне парсинг дат з валідацією
      const ndateTimestamp = parseInt(item.ndate);
      const ntimeTimestamp = parseInt(item.ntime);
      
      let publishedAt: string;
      let updatedAt: string;
      
      try {
        if (ndateTimestamp && !isNaN(ndateTimestamp) && ndateTimestamp > 0) {
          publishedAt = new Date(ndateTimestamp * 1000).toISOString();
        } else {
          publishedAt = new Date().toISOString(); // Fallback to current time
        }
      } catch (error) {
        publishedAt = new Date().toISOString();
      }
      
      try {
        if (ntimeTimestamp && !isNaN(ntimeTimestamp) && ntimeTimestamp > 0) {
          updatedAt = new Date(ntimeTimestamp * 1000).toISOString();
        } else {
          updatedAt = publishedAt; // Fallback to published time
        }
      } catch (error) {
        updatedAt = publishedAt;
      }
      const slug = item.urlkey || `news-${item.id}`;
      
      // Отримання зображення
      let imageUrl = '';
      if (item.images) {
        const newsImageIds = item.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
        const newsImages = formatNewsImages(imagesData, newsImageIds, lang);
        if (newsImages.length > 0) {
          imageUrl = newsImages[0].url;
        }
      }

      return {
        id: item.id.toString(),
        title: item.nheader || 'Без заголовка',
        slug,
        teaser: item.nteaser || '',
        content: item.nbody || '',
        category: item.category_title || 'Новини',
        publishedAt,
        updatedAt,
        author: 'Гал-Інфо',
        imageUrl
      };
    });

    return rssNews;
  } catch (error) {
    console.error(`Error fetching news for category ${type}/${slug}:`, error);
    return [];
  }
}

// Отримання новин для Google News (останні 2 дні)
export async function getNewsForGoogleNews(limit: number = 100, lang: string = '1'): Promise<NewsItem[]> {
  try {
    const twoDaysAgo = Math.floor((Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000);
    
    const [news] = await executeQuery(`
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.ntype,
        a_news.images,
        a_news.urlkey,
        a_news.rubric,
        a_news_headers.nheader,
        a_news_headers.nteaser,
        a_cats.title as category_title
      FROM a_news USE KEY(udate)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_cats ON FIND_IN_SET(a_cats.id, a_news.rubric) AND a_cats.cattype = 1
      WHERE a_news.lang = ?
        AND a_news.udate < UNIX_TIMESTAMP() 
        AND a_news.udate > ?
        AND a_news.approved = 1
        AND a_news.hiderss = 0
      ORDER BY a_news.udate DESC
      LIMIT ?
    `, [lang, twoDaysAgo, limit]);

    // Формування Google News новин
    const googleNews: NewsItem[] = news.map((item: any) => {
      // Безпечне парсинг дат з валідацією
      const ndateTimestamp = parseInt(item.ndate);
      const ntimeTimestamp = parseInt(item.ntime);
      
      let publishedAt: string;
      let updatedAt: string;
      
      try {
        if (ndateTimestamp && !isNaN(ndateTimestamp) && ndateTimestamp > 0) {
          publishedAt = new Date(ndateTimestamp * 1000).toISOString();
        } else {
          publishedAt = new Date().toISOString(); // Fallback to current time
        }
      } catch (error) {
        publishedAt = new Date().toISOString();
      }
      
      try {
        if (ntimeTimestamp && !isNaN(ntimeTimestamp) && ntimeTimestamp > 0) {
          updatedAt = new Date(ntimeTimestamp * 1000).toISOString();
        } else {
          updatedAt = publishedAt; // Fallback to published time
        }
      } catch (error) {
        updatedAt = publishedAt;
      }
      const slug = item.urlkey || `news-${item.id}`;

      return {
        id: item.id.toString(),
        title: item.nheader || 'Без заголовка',
        slug,
        teaser: item.nteaser || '',
        category: item.category_title || 'Новини',
        publishedAt,
        updatedAt,
        author: 'Гал-Інфо'
      };
    });

    return googleNews;
  } catch (error) {
    console.error('Error fetching news for Google News:', error);
    return [];
  }
}

// Отримання категорій для sitemap
export async function getCategoriesForSitemap(lang: string = '1'): Promise<Category[]> {
  try {
    const [categories] = await executeQuery(`
      SELECT id, param, title, cattype
      FROM a_cats 
      WHERE lng = ? AND isvis = 1 AND cattype IN (1, 2, 3)
      ORDER BY orderid
    `, [lang]);

    return categories.map((cat: any) => ({
      id: cat.id.toString(),
      name: cat.title,
      slug: cat.param,
      type: cat.cattype === 1 ? 'rubric' : cat.cattype === 2 ? 'theme' : 'region'
    }));
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

// Отримання новин для sitemap
export async function getNewsForSitemap(lang: string = '1', limit: number = 1000): Promise<NewsItem[]> {
  try {
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    
    const [news] = await executeQuery(`
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.urlkey,
        a_news.rubric,
        a_news_headers.nheader,
        a_cats.title as category_title
      FROM a_news USE KEY(udate)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_cats ON FIND_IN_SET(a_cats.id, a_news.rubric) AND a_cats.cattype = 1
      WHERE a_news.lang = ?
        AND a_news.udate < UNIX_TIMESTAMP() 
        AND a_news.udate > ?
        AND a_news.approved = 1
      ORDER BY a_news.udate DESC
      LIMIT ?
    `, [lang, thirtyDaysAgo, limit]);

    return news.map((item: any) => {
      // Безпечне парсинг дат з валідацією
      const ndateTimestamp = parseInt(item.ndate);
      const ntimeTimestamp = parseInt(item.ntime);
      
      let publishedAt: string;
      let updatedAt: string;
      
      try {
        if (ndateTimestamp && !isNaN(ndateTimestamp) && ndateTimestamp > 0) {
          publishedAt = new Date(ndateTimestamp * 1000).toISOString();
        } else {
          publishedAt = new Date().toISOString(); // Fallback to current time
        }
      } catch (error) {
        publishedAt = new Date().toISOString();
      }
      
      try {
        if (ntimeTimestamp && !isNaN(ntimeTimestamp) && ntimeTimestamp > 0) {
          updatedAt = new Date(ntimeTimestamp * 1000).toISOString();
        } else {
          updatedAt = publishedAt; // Fallback to published time
        }
      } catch (error) {
        updatedAt = publishedAt;
      }
      const slug = item.urlkey || `news-${item.id}`;

      return {
        id: item.id.toString(),
        title: item.nheader || 'Без заголовка',
        slug,
        teaser: '',
        category: item.category_title || 'Новини',
        publishedAt,
        updatedAt
      };
    });
  } catch (error) {
    console.error('Error fetching news for sitemap:', error);
    return [];
  }
}
