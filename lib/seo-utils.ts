import { executeQuery } from '@/app/lib/db';
import { Metadata } from 'next';

// Отримання метаданих для категорії
export async function getCategoryMetadata(categorySlug: string, lang: string = '1'): Promise<Metadata> {
  try {
    const [category] = await executeQuery(`
      SELECT id, param, title, description, keywords
      FROM a_cats 
      WHERE param = ? AND lng = ? AND isvis = 1
    `, [categorySlug, lang]);

    if (category.length === 0) {
      return {
        title: 'Категорія не знайдена',
        description: 'Запитана категорія не існує або була видалена',
      };
    }

    const cat = category[0];
    const title = cat.title || 'Категорія';
    const description = cat.description || `Новини категорії "${title}" від агенції інформації та аналітики "Гал-інфо"`;
    const keywords = cat.keywords || `${title.toLowerCase()}, новини, Львів, Гал-Інфо`;

    return {
      title: `${title} | Гал-Інфо`,
      description,
      keywords: keywords.split(',').map(k => k.trim()),
      openGraph: {
        title: `${title} | Гал-Інфо`,
        description,
        url: `https://galinfo.com.ua/${categorySlug}`,
        siteName: 'Гал-Інфо',
        locale: 'uk_UA',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Гал-Інфо`,
        description,
      },
      alternates: {
        canonical: `https://galinfo.com.ua/${categorySlug}`,
      },
    };
  } catch (error) {
    console.error('Error fetching category metadata:', error);
    return {
      title: 'Категорія | Гал-Інфо',
      description: 'Новини від агенції інформації та аналітики "Гал-інфо"',
    };
  }
}

// Отримання метаданих для новини
export async function getNewsMetadata(urlkey: string, id: number, lang: string = '1'): Promise<Metadata> {
  try {
    const [news] = await executeQuery(`
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.urlkey,
        a_news.images,
        a_news.rubric,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser,
        a_news_body.nbody,
        a_cats.title as category_title
      FROM a_news USE KEY(PRIMARY)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_body USE KEY (PRIMARY) ON a_news.id = a_news_body.id
      LEFT JOIN a_cats ON FIND_IN_SET(a_cats.id, a_news.rubric) AND a_cats.cattype = 1
      WHERE a_news.id = ? AND a_news.lang = ? AND a_news.approved = 1
    `, [id, lang]);

    if (news.length === 0) {
      return {
        title: 'Новина не знайдена | Гал-Інфо',
        description: 'Запитана новина не існує або була видалена',
      };
    }

    const article = news[0];
    const title = article.nheader || 'Новина';
    const subheader = article.nsubheader || '';
    const teaser = article.nteaser || '';
    const category = article.category_title || 'Новини';
    
    // Формуємо опис з teaser або перших 160 символів з контенту
    let description = teaser;
    if (!description && article.nbody) {
      const cleanBody = article.nbody.replace(/<[^>]*>/g, ''); // Видаляємо HTML теги
      description = cleanBody.substring(0, 160) + (cleanBody.length > 160 ? '...' : '');
    }
    if (!description) {
      description = `Новина "${title}" від агенції інформації та аналітики "Гал-інфо"`;
    }

    // Отримуємо зображення для OpenGraph
    let imageUrl = '';
    if (article.images) {
      const imageIds = article.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
      if (imageIds.length > 0) {
        const [images] = await executeQuery(`
          SELECT filename FROM a_pics WHERE id = ?
        `, [imageIds[0]]);
        if (images.length > 0) {
          const filename = images[0].filename;
          const firstChar = filename.charAt(0);
          const secondChar = filename.charAt(1);
          imageUrl = `https://galinfo.com.ua/media/gallery/intxt/${firstChar}/${secondChar}/${filename}`;
        }
      }
    }

    const publishedAt = new Date(parseInt(article.ndate) * 1000).toISOString();
    const modifiedAt = new Date(parseInt(article.ntime) * 1000).toISOString();

    return {
      title: `${title} | Гал-Інфо`,
      description,
      keywords: [
        category.toLowerCase(),
        'новини',
        'Львів',
        'Гал-Інфо',
        ...(subheader ? subheader.toLowerCase().split(' ') : [])
      ].filter(Boolean),
      authors: [{ name: 'Гал-Інфо' }],
      openGraph: {
        title: `${title} | Гал-Інфо`,
        description,
        url: `https://galinfo.com.ua/news/${urlkey}_${id}`,
        siteName: 'Гал-Інфо',
        locale: 'uk_UA',
        type: 'article',
        publishedTime: publishedAt,
        modifiedTime: modifiedAt,
        authors: ['Гал-Інфо'],
        section: category,
        tags: [category],
        ...(imageUrl && {
          images: [{
            url: imageUrl,
            width: 800,
            height: 600,
            alt: title,
          }]
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Гал-Інфо`,
        description,
        ...(imageUrl && { images: [imageUrl] }),
      },
      alternates: {
        canonical: `https://galinfo.com.ua/news/${urlkey}_${id}`,
      },
      other: {
        'article:published_time': publishedAt,
        'article:modified_time': modifiedAt,
        'article:section': category,
        'article:tag': category,
      },
    };
  } catch (error) {
    console.error('Error fetching news metadata:', error);
    return {
      title: 'Новина | Гал-Інфо',
      description: 'Новина від агенції інформації та аналітики "Гал-інфо"',
    };
  }
}

// Отримання списку категорій для sitemap
export async function getCategoriesForSitemap(lang: string = '1') {
  try {
    const [categories] = await executeQuery(`
      SELECT param, title, cattype
      FROM a_cats 
      WHERE lng = ? AND isvis = 1 AND cattype IN (1, 2, 3)
      ORDER BY orderid
    `, [lang]);

    return categories.map((cat: any) => ({
      slug: cat.param,
      title: cat.title,
      type: cat.cattype === 1 ? 'rubric' : cat.cattype === 2 ? 'theme' : 'region'
    }));
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}
