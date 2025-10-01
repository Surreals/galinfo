import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rubric: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1');
    const lang = searchParams.get('lang') || '1';
    const level = searchParams.get('level'); // Рівень важливості (1, 2, 3, 4)
    const { rubric } = await params;
    
    // Базові умови для важливих новин
    let whereConditions = [
      'CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()', // Тільки опубліковані
      'a_news.approved = 1',             // Тільки схвалені
      'a_news.lang = ?',                 // Мова
      'a_news.nweight > 0',              // Важливі новини
      'FIND_IN_SET(?, a_news.rubric) > 0' // Рубрика
    ];
    
    const queryParams: any[] = [lang, rubric];
    
    // Фільтрація по рівню важливості
    if (level) {
      whereConditions.push('a_news.nweight = ?');
      queryParams.push(parseInt(level));
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Запит для отримання важливих новин в категорії
    const importantNewsQuery = `
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
      LIMIT ?
    `;
    
    // Запит для підрахунку загальної кількості важливих новин в категорії
    const countQuery = `
      SELECT COUNT(*) as total
      FROM a_news
      WHERE ${whereClause}
    `;
    
    // Виконання запитів
    const [[newsData], [countData]] = await Promise.all([
      executeQuery(importantNewsQuery, [...queryParams, limit]),
      executeQuery(countQuery, queryParams)
    ]);
    
    const total = countData[0]?.total || 0;
    
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
      const [imagesResult] = await executeQuery(imagesQuery, imageIds);
      imagesData = imagesResult;
    }
    
    // Формування відповіді
    const response = {
      importantNews: newsData.map(news => ({
        ...news,
        images: news.images ? formatNewsImages(imagesData, news.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)), lang) : []
      })),
      total,
      filters: {
        rubric,
        lang,
        level: level ? parseInt(level) : null,
        limit
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching important news by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch important news by category' },
      { status: 500 }
    );
  }
}
