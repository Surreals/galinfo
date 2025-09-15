import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const lang = searchParams.get('lang') || '1';
    
    // Запит для отримання важливих новин (nweight > 0)
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
      WHERE a_news.udate < UNIX_TIMESTAMP() 
        AND a_news.approved = 1 
        AND a_news.lang = ?
        AND a_news.nweight > 0
      ORDER BY a_news.udate DESC
      LIMIT ?
    `;
    
    // Виконання запиту
    const [newsData] = await executeQuery(importantNewsQuery, [lang, limit]);
    
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
    
    // Формування відповіді
    const response = {
      importantNews: newsData.map(news => ({
        ...news,
        images: news.images ? formatNewsImages(imagesData, news.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)), lang) : []
      })),
      total: newsData.length,
      filters: {
        lang,
        limit
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching important news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch important news' },
      { status: 500 }
    );
  }
}
