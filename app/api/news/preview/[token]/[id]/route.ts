import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import crypto from 'crypto';

// Типи новин
const ARTICLE_TYPES = {
  news: 1,        // Новина
  articles: 2,    // Стаття
  photo: 3,       // Фоторепортаж
  video: 4,       // Відео
  audio: 5,       // Аудіо
  announces: 6,   // Анонс
  blogs: 20,      // Блог
  mainmedia: 21   // Основні медіа
};

// Типи макетів (layout patterns)
const LAYOUT_PATTERNS = {
  '1': { pattern: 'readSimple', imageClass: 'nimages', imagePath: 'intxt' },
  '2': { pattern: 'readSlider', imageClass: 'phimages', imagePath: 'full' },
  '3': { pattern: 'readInlineImages', imageClass: 'phimages', imagePath: 'intxt' },
  '4': { pattern: 'readReport', imageClass: 'phimages', imagePath: 'intxt' },
  '10': { pattern: 'readSimple', imageClass: 'nimages', imagePath: 'intxt' }
};

/**
 * Генерує preview токен на основі ID новини та секретного ключа
 * Це дозволяє створити детермінований токен, який можна перевірити
 */
function generatePreviewToken(newsId: number): string {
  const secret = process.env.PREVIEW_TOKEN_SECRET || 'default-secret-key-change-in-production';
  const hash = crypto.createHmac('sha256', secret)
    .update(`news-${newsId}`)
    .digest('hex');
  return hash.substring(0, 32); // Перші 32 символи хешу
}

/**
 * Перевіряє валідність preview токена
 */
function validatePreviewToken(newsId: number, token: string): boolean {
  const expectedToken = generatePreviewToken(newsId);
  return token === expectedToken;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || '1';
    const includeRelated = searchParams.get('includeRelated') !== 'false';
    const includeAuthor = searchParams.get('includeAuthor') !== 'false';
    
    // Парсинг параметрів з URL
    const resolvedParams = await params;
    const { token, id } = resolvedParams;
    
    // Валідація ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }
    
    const newsId = parseInt(id);
    
    // Перевірка токена
    if (!validatePreviewToken(newsId, token)) {
      return NextResponse.json(
        { error: 'Invalid preview token' },
        { status: 403 }
      );
    }
    
    // Основний запит для отримання новини з усіма даними
    // ВАЖЛИВО: Видалено перевірку approved = 1 для preview
    const newsQuery = `
      SELECT 
        a_news.*,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser,
        a_news_body.nbody,
        a_newsmeta.ntitle,
        a_newsmeta.ndescription,
        a_newsmeta.nkeywords,
        a_statcomm.qty as comments_count,
        a_statview.qty as views_count,
        a_powerusers.uname_ua as author_name,
        a_cats.description as region_description
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_body ON a_news.id = a_news_body.id
      LEFT JOIN a_newsmeta ON a_news.id = a_newsmeta.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      LEFT JOIN a_powerusers ON a_news.userid = a_powerusers.id
      LEFT JOIN a_cats ON a_cats.id = a_news.region
      WHERE a_news.id = ? 
        AND a_news.lang = ?
    `;
    
    const [newsData] = await executeQuery(newsQuery, [newsId, lang]);
    
    if (!newsData || newsData.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    const news = newsData[0];
    
    // Отримання рубрик з повною інформацією
    let rubrics: any[] = [];
    if (news.rubric) {
      const rubricIds = news.rubric.split(',').map((id: string) => id.trim());
      if (rubricIds.length > 0) {
        const rubricsQuery = `
          SELECT id, param, title, cattype, description
          FROM a_cats
          WHERE id IN (${rubricIds.map(() => '?').join(',')}) AND lng = ?
        `;
        const [rubricsData] = await executeQuery(rubricsQuery, [...rubricIds, lang]);
        rubrics = rubricsData;
      }
    }
    
    // Отримання тегів
    let tags: any[] = [];
    const tagsQuery = `
      SELECT a_tags.id, a_tags.tag
      FROM a_tags
      INNER JOIN a_tags_map ON a_tags.id = a_tags_map.tagid
      WHERE a_tags_map.newsid = ?
    `;
    const [tagsData] = await executeQuery(tagsQuery, [newsId]);
    tags = tagsData;
    
    // Отримання зображень з повною інформацією
    let images: any[] = [];
    if (news.images) {
      const imageIds = news.images.split(',').map((id: string) => id.trim());
      if (imageIds.length > 0) {
        const imagesQuery = `
          SELECT id, filename, title_ua
          FROM a_pics
          WHERE id IN (${imageIds.map(() => '?').join(',')})
        `;
        const [imagesDataResult] = await executeQuery(imagesQuery, imageIds);
        images = imagesDataResult;
      }
    }
    
    // Отримання інформації про автора
    let author: any = null;
    if (includeAuthor && news.userid) {
      const authorQuery = `
        SELECT 
          a_powerusers.id,
          a_powerusers.uname_ua as name,
          a_picsu.filename as avatar
        FROM a_powerusers
        LEFT JOIN a_picsu ON a_powerusers.id = a_picsu.userid
        WHERE a_powerusers.id = ?
      `;
      const [authorData] = await executeQuery(authorQuery, [news.userid]);
      if (authorData && authorData.length > 0) {
        const authorInfo = authorData[0];
        author = {
          id: authorInfo.id,
          name: authorInfo.name,
          twowords: '',
          avatar: authorInfo.avatar ? 
            `/media/avatars/tmb/${authorInfo.avatar.charAt(0)}/${authorInfo.avatar.charAt(1)}/${authorInfo.avatar}` : 
            '/im/user.gif',
          link: news.ntype === 20 ? `/bloggers/${authorInfo.id}/` : `/editor/${authorInfo.id}/`
        };
      }
    }
    
    // Отримання пов'язаних новин (тільки опублікованих)
    let relatedNews: any[] = [];
    if (includeRelated && news.rubric) {
      const newsTypes = [news.ntype];
      const relatedQuery = `
        SELECT 
          a_news.id,
          a_news.urlkey,
          DATE_FORMAT(a_news.ndate, '%Y-%m-%d') as ndate,
          a_news.ntype,
          a_news.images,
          a_news_headers.nheader,
          a_news_headers.nteaser,
          a_statcomm.qty as comments_count,
          a_statview.qty as views_count
        FROM a_news
        LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
        LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
        LEFT JOIN a_statview ON a_news.id = a_statview.id
        WHERE a_news.id != ? 
          AND a_news.ntype IN (${newsTypes.map(() => '?').join(',')})
          AND FIND_IN_SET(?, a_news.rubric) > 0
          AND a_news.lang = ?
          AND a_news.approved = 1
          AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()
        ORDER BY a_news.udate DESC
        LIMIT 5
      `;
      const [relatedNewsData] = await executeQuery(relatedQuery, [newsId, ...newsTypes, news.rubric.split(',')[0], lang]);
      relatedNews = relatedNewsData;
    }
    
    // НЕ оновлюємо статистику переглядів для preview
    
    // Визначення макету та класів
    const layout = news.layout || '1';
    const layoutConfig = LAYOUT_PATTERNS[layout as keyof typeof LAYOUT_PATTERNS] || LAYOUT_PATTERNS['1'];
    
    // Визначення типу статті
    const articleTypeNames = {
      '1': 'Новини',
      '2': 'Статті',
      '3': 'Фоторепортажі',
      '4': 'Відео',
      '5': 'Аудіо',
      '6': 'Анонси',
      '20': 'Блоги',
      '21': 'Медіа'
    };
    
    const articleTypeParams = {
      '1': 'news',
      '2': 'articles',
      '3': 'photo',
      '4': 'video',
      '5': 'audio',
      '6': 'announces',
      '20': 'blogs',
      '21': 'mainmedia'
    };
    
    const articleType = articleTypeParams[news.ntype.toString() as keyof typeof articleTypeParams] || 'news';
    
    // Формування мета-даних
    const meta = {
      title: news.ntitle || news.nheader,
      description: news.ndescription || news.nteaser,
      keywords: news.nkeywords || '',
      ogTitle: news.ntitle || news.nheader,
      ogDescription: news.ndescription || news.nteaser,
      ogImage: images.length > 0 ? `/media/gallery/intxt/${images[0].filename}` : undefined,
      ogType: 'article'
    };
    
    // Формування breadcrumbs
    const breadcrumbs = [];
    
    // Додавання рубрик до breadcrumbs
    if (rubrics.length > 0) {
      rubrics.forEach(rubric => {
        breadcrumbs.push({
          type: 'rubric' as const,
          title: rubric.title,
          link: `/${rubric.param}/`
        });
      });
    }
    
    // Додавання типу статті до breadcrumbs
    breadcrumbs.push({
      type: 'article_type' as const,
      title: articleTypeNames[news.ntype.toString() as keyof typeof articleTypeNames] || 'Новини',
      link: `/${articleType}/`
    });
    
    // Формування відповіді
    const response = {
      article: {
        ...news,
        images: news.images || '',
        images_data: images.map(image => ({
          id: image.id,
          filename: image.filename,
          title: image.title_ua || '',
          title_ua: image.title_ua,
          urls: {
            full: `/media/gallery/full/${image.filename}`,
            intxt: `/media/gallery/intxt/${image.filename}`,
            tmb: `/media/gallery/tmb/${image.filename}`
          }
        })),
        rubrics,
        tags,
        relatedNews,
        author,
        statistics: {
          comments_count: news.comments_count || 0,
          views_count: news.views_count || 0,
          rating: news.rated || 0
        },
        meta,
        breadcrumbs
      },
      meta: {
        type: articleType,
        types: [news.ntype],
        urlkey: news.urlkey,
        id: newsId,
        isPreview: true,
        printUrl: `/${lang}/print/${new Date(news.ndate).toISOString().split('T')[0].split('-')[0]}/${new Date(news.ndate).toISOString().split('T')[0].split('-')[1]}/${new Date(news.ndate).toISOString().split('T')[0].split('-')[2]}/${news.urlkey}_${newsId}`,
        editUrl: `/enginedoor/?act=addnews&su=edit&id=${newsId}`
      },
      layout: layoutConfig
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching preview news data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preview article data' },
      { status: 500 }
    );
  }
}

// Експорт функції для генерації токена (для використання в інших місцях)
export { generatePreviewToken };

