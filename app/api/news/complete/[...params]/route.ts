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

// Типи макетів (layout patterns)
const LAYOUT_PATTERNS = {
  '1': { pattern: 'readSimple', imageClass: 'nimages', imagePath: 'intxt' },
  '2': { pattern: 'readSlider', imageClass: 'phimages', imagePath: 'full' },
  '3': { pattern: 'readInlineImages', imageClass: 'phimages', imagePath: 'intxt' },
  '4': { pattern: 'readReport', imageClass: 'phimages', imagePath: 'intxt' },
  '10': { pattern: 'readSimple', imageClass: 'nimages', imagePath: 'intxt' }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || '1';
    const includeRelated = searchParams.get('includeRelated') !== 'false';
    const includeAuthor = searchParams.get('includeAuthor') !== 'false';
    const includeStatistics = searchParams.get('includeStatistics') !== 'false';
    
    // Парсинг параметрів з URL
    const resolvedParams = await params;
    const urlParts = resolvedParams.params;
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
    
    // Отримання типу новини - підтримка множинних типів
    let newsTypes: number[] = [];
    
    if (articleType === 'mixed') {
      // Якщо тип "mixed", то шукаємо і новини (1) і статті (2)
      newsTypes = [1, 2];
    } else {
      // Звичайна логіка для одного типу
      const newsType = ARTICLE_TYPES[articleType as keyof typeof ARTICLE_TYPES];
      if (!newsType) {
        return NextResponse.json(
          { error: 'Invalid article type' },
          { status: 400 }
        );
      }
      newsTypes = [newsType];
    }
    
    // Основний запит для отримання новини з усіма даними
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
        AND a_news.urlkey = ? 
        AND a_news.ntype IN (${newsTypes.map(() => '?').join(',')})
        AND a_news.lang = ?
        AND a_news.approved = 1
        AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()
    `;
    
    const [newsData] = await executeQuery(newsQuery, [id, urlkey, ...newsTypes, lang]);
    
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
    const [tagsData] = await executeQuery(tagsQuery, [id]);
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
          twowords: '', // Поле не існує в базі даних
          avatar: authorInfo.avatar ? 
            `/media/avatars/tmb/${authorInfo.avatar.charAt(0)}/${authorInfo.avatar.charAt(1)}/${authorInfo.avatar}` : 
            '/im/user.gif',
          link: news.ntype === 20 ? `/bloggers/${authorInfo.id}/` : `/editor/${authorInfo.id}/`
        };
      }
    }
    
    // Отримання пов'язаних новин
    let relatedNews: any[] = [];
    if (includeRelated && news.rubric) {
      const relatedQuery = `
        SELECT 
          a_news.id,
          a_news.urlkey,
          a_news.ndate,
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
      const [relatedNewsData] = await executeQuery(relatedQuery, [id, ...newsTypes, news.rubric.split(',')[0], lang]);
      relatedNews = relatedNewsData;
    }
    
    // Оновлення статистики переглядів
    if (includeStatistics) {
      try {
        // Спочатку намагаємося оновити існуючий запис
        const [updateResult] = await executeQuery(
          'UPDATE a_statview SET qty = qty + 1 WHERE id = ?',
          [id]
        );
        
        // Якщо жоден рядок не був оновлений, створюємо новий запис
        if ((updateResult as any).affectedRows === 0) {
          await executeQuery(
            'INSERT INTO a_statview (id, qty) VALUES (?, 2)',
            [id]
          );
        }
      } catch (error) {
        console.warn('Failed to update view count:', error);
      }
    }
    
    // Визначення макету та класів
    const layout = news.layout || '1';
    const layoutConfig = LAYOUT_PATTERNS[layout as keyof typeof LAYOUT_PATTERNS] || LAYOUT_PATTERNS['1'];
    
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
    
    breadcrumbs.push({
      type: 'article_type' as const,
      title: articleTypeNames[news.ntype.toString() as keyof typeof articleTypeNames] || 'Новини',
      link: `/${articleType}/`
    });
    
    // Формування відповіді
    const response = {
      article: {
        ...news,
        images: news.images || '', // Ensure images field is included as string
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
        types: newsTypes,
        urlkey,
        id: parseInt(id),
        printUrl: `/${lang}/print/${new Date(news.ndate).toISOString().split('T')[0].split('-')[0]}/${new Date(news.ndate).toISOString().split('T')[0].split('-')[1]}/${new Date(news.ndate).toISOString().split('T')[0].split('-')[2]}/${urlkey}_${id}`,
        editUrl: `/enginedoor/?act=addnews&su=edit&id=${id}`
      },
      layout: layoutConfig
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching complete news data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complete article data' },
      { status: 500 }
    );
  }
}

