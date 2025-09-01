import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const lang = searchParams.get('lang') || '1';
    const type = searchParams.get('type');
    const rubric = searchParams.get('rubric');
    const approved = searchParams.get('approved') !== 'false'; // За замовчуванням тільки схвалені
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    const offset = (page - 1) * limit;
    const searchTerm = `%${query.trim()}%`;
    
    // Базові умови WHERE
    let whereConditions = [
      'a_news.udate < UNIX_TIMESTAMP()', // Тільки опубліковані
      'a_news.approved = 1',             // Тільки схвалені
      'a_news.lang = ?',                 // Мова
      '(a_news_headers.nheader LIKE ? OR a_news_headers.nsubheader LIKE ? OR a_news_headers.nteaser LIKE ?)' // Пошук в заголовках
    ];
    
    const queryParams: any[] = [lang, searchTerm, searchTerm, searchTerm];
    
    // Фільтрація по типу новини
    if (type) {
      whereConditions.push('a_news.ntype = ?');
      queryParams.push(parseInt(type));
    }
    
    // Фільтрація по рубриці
    if (rubric && rubric !== 'all') {
      whereConditions.push('FIND_IN_SET(?, a_news.rubric) > 0');
      queryParams.push(rubric);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Запит для пошуку новин
    const searchQuery = `
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
        a_statview.qty as views_count,
        CASE 
          WHEN a_news_headers.nheader LIKE ? THEN 3
          WHEN a_news_headers.nsubheader LIKE ? THEN 2
          WHEN a_news_headers.nteaser LIKE ? THEN 1
          ELSE 0
        END as relevance_score
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      WHERE ${whereClause}
      ORDER BY relevance_score DESC, a_news.udate DESC
      LIMIT ? OFFSET ?
    `;
    
    // Запит для підрахунку загальної кількості результатів
    const countQuery = `
      SELECT COUNT(*) as total
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE ${whereClause}
    `;
    
    // Виконання запитів
    const [searchData, countData] = await Promise.all([
      executeQuery(searchQuery, [...queryParams, limit, offset]),
      executeQuery(countQuery, queryParams)
    ]);
    
    const total = countData[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    // Отримання зображень для новин
    const imageIds = searchData
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
      imagesData = await executeQuery(imagesQuery, imageIds);
    }
    
    // Формування відповіді
    const response = {
      searchResults: searchData.map(news => ({
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
      search: {
        query,
        totalResults: total
      },
      filters: {
        lang,
        type,
        rubric,
        approved
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error searching news:', error);
    return NextResponse.json(
      { error: 'Failed to search news' },
      { status: 500 }
    );
  }
}
