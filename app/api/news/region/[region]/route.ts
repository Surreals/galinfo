import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';

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
  { params }: { params: Promise<{ region: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const lang = searchParams.get('lang') || '1';
    const approved = searchParams.get('approved') !== 'false'; // За замовчуванням тільки схвалені
    
    const offset = (page - 1) * limit;
    const { region } = await params;
    
    // Базовий WHERE для фільтрації
    let whereConditions = [
      'CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()', // Тільки опубліковані
      'a_news.approved = 1',             // Тільки схвалені
      'a_news.lang = ?',                 // Мова
      'a_news.region = ?'                // Регіон
    ];
    
    const queryParams: any[] = [lang, region];
    
    // Фільтрація по типу новини
    if (type && ARTICLE_TYPES[type as keyof typeof ARTICLE_TYPES]) {
      whereConditions.push('a_news.ntype = ?');
      queryParams.push(ARTICLE_TYPES[type as keyof typeof ARTICLE_TYPES]);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Запит для отримання новин
    const newsQuery = `
      SELECT 
        a_news.id,
        DATE_FORMAT(a_news.ndate, '%Y-%m-%d') as ndate,
        a_news.ntime,
        a_news.udate,
        a_news.ntype,
        a_news.images,
        a_news.urlkey,
        a_news.photo,
        a_news.video,
        a_news.comments,
        a_news.printsubheader,
        a_news.rubric,
        a_news.region,
        a_news.nweight,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser,
        a_statcomm.qty as comments_count,
        a_statview.qty as views_count,
        a_cats.title as region_name,
        a_cats.description as region_description
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      LEFT JOIN a_cats ON a_news.region = a_cats.id
      WHERE ${whereClause}
      ORDER BY a_news.udate DESC
      LIMIT ? OFFSET ?
    `;
    
    // Запит для підрахунку загальної кількості
    const countQuery = `
      SELECT COUNT(*) as total
      FROM a_news
      LEFT JOIN a_cats ON a_news.region = a_cats.id
      WHERE ${whereClause}
    `;
    
    // Виконання запитів
    const [[newsData], [countData]] = await Promise.all([
      executeQuery(newsQuery, [...queryParams, limit, offset]),
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
      const imagesQuery = `
        SELECT id, filename, title_ua
        FROM a_pics
        WHERE id IN (${imageIds.map(() => '?').join(',')})
      `;
      const [imagesDataResult] = await executeQuery(imagesQuery, imageIds);
      imagesData = imagesDataResult;
    }
    
    // Додаткове сортування на випадок, якщо udate не працює правильно
    const sortedNewsData = newsData.sort((a, b) => {
      // Завжди використовуємо комбінацію ndate + ntime для точного сортування
      // Перетворюємо ndate з ISO формату та додаємо час
      let dateA, dateB;
      
      try {
        // Парсимо ndate (ISO формат: 2025-09-24T21:00:00.000Z) та додаємо час
        const ndateA = new Date(a.ndate);
        const ntimeA = a.ntime || '00:00:00';
        const [hoursA, minutesA, secondsA] = ntimeA.split(':');
        dateA = new Date(ndateA.getFullYear(), ndateA.getMonth(), ndateA.getDate(), 
                        parseInt(hoursA), parseInt(minutesA), parseInt(secondsA));
      } catch (e) {
        dateA = new Date(a.ndate);
      }
      
      try {
        const ndateB = new Date(b.ndate);
        const ntimeB = b.ntime || '00:00:00';
        const [hoursB, minutesB, secondsB] = ntimeB.split(':');
        dateB = new Date(ndateB.getFullYear(), ndateB.getMonth(), ndateB.getDate(), 
                        parseInt(hoursB), parseInt(minutesB), parseInt(secondsB));
      } catch (e) {
        dateB = new Date(b.ndate);
      }
      
      // Сортуємо від найновіших до найстаріших
      return dateB.getTime() - dateA.getTime();
    });

    // Формування відповіді
    const response = {
      news: sortedNewsData.map(news => ({
        ...news,
        images: news.images ? formatNewsImages(imagesData, news.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)), lang) : []
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
        region,
        type,
        lang,
        approved
      },
      regionInfo: sortedNewsData.length > 0 ? {
        id: sortedNewsData[0].region,
        name: sortedNewsData[0].region_name,
        description: sortedNewsData[0].region_description
      } : null
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching news by region:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news by region' },
      { status: 500 }
    );
  }
}
