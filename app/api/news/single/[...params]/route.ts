import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || '1';
    
    // Парсинг параметрів з URL
    const urlParts = params.params;
    if (urlParts.length < 2) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    const articleType = urlParts[0];
    const urlkeyId = urlParts[1];
    
    // Розбиття urlkey_id на urlkey та id
    const lastUnderscoreIndex = urlkeyId.lastIndexOf('_');
    if (lastUnderscoreIndex === -1) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    const urlkey = urlkeyId.substring(0, lastUnderscoreIndex);
    const id = urlkeyId.substring(lastUnderscoreIndex + 1);
    
    // Валідація ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }
    
    // Отримання типу новини
    const newsType = ARTICLE_TYPES[articleType as keyof typeof ARTICLE_TYPES];
    if (!newsType) {
      return NextResponse.json(
        { error: 'Invalid article type' },
        { status: 400 }
      );
    }
    
    // Основний запит для отримання новини
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
        a_powerusers.uname_ua as author_name
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_body ON a_news.id = a_news_body.id
      LEFT JOIN a_newsmeta ON a_news.id = a_newsmeta.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      LEFT JOIN a_powerusers ON a_news.userid = a_powerusers.id
      WHERE a_news.id = ? 
        AND a_news.urlkey = ? 
        AND a_news.ntype = ? 
        AND a_news.lang = ?
        AND a_news.approved = 1
        AND a_news.udate < UNIX_TIMESTAMP()
    `;
    
    const newsData = await executeQuery(newsQuery, [id, urlkey, newsType, lang]);
    
    if (!newsData || newsData.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    const news = newsData[0];
    
    // Отримання рубрик
    let rubrics: any[] = [];
    if (news.rubric) {
      const rubricIds = news.rubric.split(',').map(id => id.trim());
      if (rubricIds.length > 0) {
        const rubricsQuery = `
          SELECT id, param, title, cattype
          FROM a_cats
          WHERE id IN (${rubricIds.map(() => '?').join(',')}) AND lng = ?
        `;
        rubrics = await executeQuery(rubricsQuery, [...rubricIds, lang]);
      }
    }
    
    // Отримання тегів
    let tags: any[] = [];
    const tagsQuery = `
      SELECT a_tags.id, a_tags.tag, a_tags.lng
      FROM a_tags
      INNER JOIN a_tags_map ON a_tags.id = a_tags_map.tagid
      WHERE a_tags_map.newsid = ? AND a_tags.lng = ?
    `;
    tags = await executeQuery(tagsQuery, [id, lang]);
    
    // Отримання зображень
    let images: any[] = [];
    if (news.images) {
      const imageIds = news.images.split(',').map(id => id.trim());
      if (imageIds.length > 0) {
        const imagesQuery = `
          SELECT id, filename, title_ua, title_en, title_ru
          FROM a_pics
          WHERE id IN (${imageIds.map(() => '?').join(',')})
        `;
        images = await executeQuery(imagesQuery, imageIds);
      }
    }
    
    // Отримання пов'язаних новин (той же тип, рубрика)
    let relatedNews: any[] = [];
    if (news.rubric) {
      const relatedQuery = `
        SELECT 
          a_news.id,
          a_news.urlkey,
          a_news.ndate,
          a_news.ntype,
          a_news.images,
          a_news_headers.nheader,
          a_news_headers.nteaser
        FROM a_news
        LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
        WHERE a_news.id != ? 
          AND a_news.ntype = ?
          AND FIND_IN_SET(?, a_news.rubric) > 0
          AND a_news.lang = ?
          AND a_news.approved = 1
          AND a_news.udate < UNIX_TIMESTAMP()
        ORDER BY a_news.udate DESC
        LIMIT 5
      `;
      relatedNews = await executeQuery(relatedQuery, [id, newsType, news.rubric.split(',')[0], lang]);
    }
    
    // Оновлення статистики переглядів
    try {
      await executeQuery(
        'UPDATE a_statview SET qty = qty + 1 WHERE id = ?',
        [id]
      );
    } catch (error) {
      console.warn('Failed to update view count:', error);
    }
    
    // Формування відповіді
    const response = {
      article: {
        ...news,
        images: images.map(image => ({
          id: image.id,
          filename: image.filename,
          title: image[`title_${lang === '1' ? 'ua' : lang === '2' ? 'en' : 'ru'}`] || image.title_ua,
          urls: {
            full: `/media/gallery/full/${image.filename}`,
            intxt: `/media/gallery/intxt/${image.filename}`,
            tmb: `/media/gallery/tmb/${image.filename}`
          }
        })),
        rubrics,
        tags,
        relatedNews
      },
      meta: {
        type: articleType,
        urlkey,
        id: parseInt(id)
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching single news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
