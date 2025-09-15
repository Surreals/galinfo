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
  { params }: { params: Promise<{ rubric: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const lang = searchParams.get('lang') || '1';
    const approved = searchParams.get('approved') !== 'false';
    
    const offset = (page - 1) * limit;
    const { rubric } = await params;

    // Базовий WHERE для фільтрації
    let whereConditions = [
      'a_news.udate < UNIX_TIMESTAMP()', // Тільки опубліковані
      'a_news.approved = 1',             // Тільки схвалені
      'a_news.lang = ?'                  // Мова
    ];
    
    const queryParams: any[] = [lang];
    
    // Фільтрація по типу новини
    if (type && ARTICLE_TYPES[type as keyof typeof ARTICLE_TYPES]) {
      whereConditions.push('a_news.ntype = ?');
      queryParams.push(ARTICLE_TYPES[type as keyof typeof ARTICLE_TYPES]);
    }
    
    // Фільтрація по рубриці (підтримка множинних рубрик через кому)
    if (rubric && rubric !== 'all') {
      whereConditions.push('FIND_IN_SET(?, a_news.rubric) > 0');
      queryParams.push(rubric);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    console.log('WHERE clause:', whereClause);
    console.log('Query params:', queryParams);
    
    // Запит для отримання новин
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
        a_news.nweight,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser,
        a_statcomm.qty as comments_count,
        a_statview.qty as views_count
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      WHERE ${whereClause}
      ORDER BY a_news.udate DESC
      LIMIT ? OFFSET ?
    `;
    
    // Запит для підрахунку загальної кількості
    const countQuery = `
      SELECT COUNT(*) as total
      FROM a_news
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
    
    console.log('Image IDs to fetch:', imageIds);
    
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
    
    // Формування відповіді
    const response = {
      news: newsData.map(news => ({
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
        rubric,
        type,
        lang,
        approved
      }
    };
    

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching news by rubric:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
