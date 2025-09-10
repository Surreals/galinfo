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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметри пагінації
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = (page - 1) * limit;
    
    // Параметри фільтрації
    const lang = searchParams.get('lang') || '1';
    const status = searchParams.get('status') || 'all'; // all, published, unpublished
    const type = searchParams.get('type') || 'all';
    const rubric = searchParams.get('rubric') || 'all';
    const theme = searchParams.get('theme') || 'all';
    const author = searchParams.get('author') || 'all';
    const keyword = searchParams.get('keyword') || '';
    const newsId = searchParams.get('newsId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortBy = searchParams.get('sortBy') || 'udate';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    
    // Базові умови WHERE
    let whereConditions = ['a_news.lang = ?'];
    const queryParams: any[] = [lang];
    
    // Фільтр по статусу публікації
    if (status === 'published') {
      whereConditions.push('a_news.approved = 1');
    } else if (status === 'unpublished') {
      whereConditions.push('a_news.approved = 0');
    }
    
    // Фільтр по типу новини
    if (type !== 'all') {
      const newsType = ARTICLE_TYPES[type as keyof typeof ARTICLE_TYPES];
      if (newsType) {
        whereConditions.push('a_news.ntype = ?');
        queryParams.push(newsType);
      }
    } else {
      // Виключаємо блоги за замовчуванням, якщо не вказано тип
      whereConditions.push('a_news.ntype < 20');
    }
    
    // Фільтр по рубриці
    if (rubric !== 'all') {
      whereConditions.push('FIND_IN_SET(?, a_news.rubric) > 0');
      queryParams.push(rubric);
    }
    
    // Фільтр по темі
    if (theme !== 'all') {
      whereConditions.push('a_news.theme = ?');
      queryParams.push(theme);
    }
    
    // Фільтр по авторові
    if (author !== 'all') {
      whereConditions.push('a_news.nauthor = ?');
      queryParams.push(author);
    }
    
    // Пошук по ключовому слову
    if (keyword) {
      whereConditions.push('(a_news_headers.nheader LIKE ? OR a_news_headers.nteaser LIKE ?)');
      const searchTerm = `%${keyword}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    // Пошук по ID новини
    if (newsId) {
      whereConditions.push('a_news.id = ?');
      queryParams.push(newsId);
    }
    
    // Фільтр по даті
    if (dateFrom) {
      whereConditions.push('a_news.ndate >= ?');
      queryParams.push(dateFrom);
    }
    
    if (dateTo) {
      whereConditions.push('a_news.ndate <= ?');
      queryParams.push(dateTo);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Основний запит для отримання новин
    const newsQuery = `
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.ntype,
        a_news.images,
        a_news.urlkey,
        a_news.photo,
        a_news.video,
        a_news.comments,
        a_news.printsubheader,
        a_news.rubric,
        a_news.theme,
        a_news.nweight,
        a_news.approved,
        a_news.rated,
        a_news.headlineblock,
        a_news.maininblock,
        a_news.suggest,
        a_news.hiderss,
        a_news.nocomment,
        a_news.udate,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser,
        a_powerusers.uname_ua as author_name,
        NULL as fuser_name,
        COALESCE(a_statcomm.qty, 0) as comments_count,
        COALESCE(a_statview.qty, 0) as views_count
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_powerusers ON a_news.nauthor = a_powerusers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      WHERE ${whereClause}
      ORDER BY a_news.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    // Запит для підрахунку загальної кількості
    const countQuery = `
      SELECT COUNT(*) as total
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE ${whereClause}
    `;
    
    // Параметри для запитів
    const newsQueryParams = [...queryParams, limit, offset];
    
    // Виконання запитів
    const [newsData, countData] = await Promise.all([
      executeQuery(newsQuery, newsQueryParams),
      executeQuery(countQuery, queryParams)
    ]);
    
    const total = countData[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    // Отримання зображень для новин
    const imageIds = newsData
      .filter(news => news.images)
      .map(news => news.images.split(','))
      .flat()
      .filter(id => id.trim());
    
    let imagesData: any[] = [];
    if (imageIds.length > 0) {
      try {
        const imagesQuery = `
          SELECT id, filename, title_ua
          FROM a_pics
          WHERE id IN (${imageIds.map(() => '?').join(',')})
        `;
        imagesData = await executeQuery(imagesQuery, imageIds);
      } catch (imageError) {
        console.error('Error fetching images:', imageError);
      }
    }
    
    // Формування відповіді
    const response = {
      news: newsData.map(news => ({
        ...news,
        images: news.images ? imagesData.filter(img => 
          news.images.split(',').map(id => id.trim()).includes(img.id.toString())
        ).map(img => ({
          id: img.id,
          filename: img.filename,
          title: img.title_ua || '',
          urls: {
            full: `/media/gallery/full/${img.filename}`,
            intxt: `/media/gallery/intxt/${img.filename}`,
            tmb: `/media/gallery/tmb/${img.filename}`
          }
        })) : [],
        formattedDate: new Date(news.ndate + ' ' + news.ntime).toLocaleDateString('uk-UA'),
        formattedTime: news.ntime,
        typeName: getTypeName(news.ntype),
        authorDisplayName: news.fuser_name || news.author_name || 'Невідомий автор',
        isImportant: news.nweight > 0,
        isTopNews: news.nweight === 2,
        isDelayed: news.udate > Math.floor(Date.now() / 1000)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        lang,
        status,
        type,
        rubric,
        theme,
        author,
        keyword,
        newsId,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching admin news list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news list', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Функція для отримання назви типу новини
function getTypeName(ntype: number): string {
  const typeMap: { [key: number]: string } = {
    1: 'Новина',
    2: 'Стаття',
    3: 'Фоторепортаж',
    4: 'Відео',
    5: 'Аудіо',
    6: 'Анонс',
    20: 'Блог',
    21: 'Основні медіа'
  };
  return typeMap[ntype] || 'Невідомий тип';
}