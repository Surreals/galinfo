import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const lang = searchParams.get('lang') || '1';
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type'); // Фільтр по типу новини
    const offset = (page - 1) * limit;

    // Формуємо умови WHERE
    const whereConditions = [
      'a_news.lang = ?',
      'CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()',
      'a_news.approved = 1'
    ];
    const queryParams = [lang];

    // Додаємо фільтр по типу, якщо вказано
    if (type) {
      whereConditions.push('a_news.ntype = ?');
      queryParams.push(type);
    }

    const whereClause = whereConditions.join(' AND ');

    // Отримуємо останні новини з усіх категорій
    const [latestNews] = await executeQuery(`
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
        a_news.nweight,
        a_news.rubric,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser,
        a_statcomm.qty as comments_count,
        a_statview.qty as views_count
      FROM a_news USE KEY(udate)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm USE KEY (PRIMARY) ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview USE KEY (PRIMARY) ON a_news.id = a_statview.id
      WHERE ${whereClause}
      ORDER BY a_news.udate DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // Отримуємо загальну кількість новин для пагінації
    const [totalCount] = await executeQuery(`
      SELECT COUNT(*) as total
      FROM a_news USE KEY(udate)
      WHERE ${whereClause}
    `, queryParams);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Отримання зображень для новин
    const imageIds = latestNews
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
    const sortedLatestNews = latestNews.sort((a, b) => {
      // Завжди використовуємо комбінацію ndate + ntime для точного сортування
      let dateA, dateB;
      
      try {
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

    // Формування відповіді з обробленими зображеннями
    const newsWithImages = sortedLatestNews.map(news => ({
      ...news,
      images: news.images ? formatNewsImages(imagesData, news.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)), lang) : []
    }));

    return NextResponse.json({
      news: newsWithImages,
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
        approved: true,
        type: type || null
      }
    });

  } catch (error) {
    console.error('Error fetching latest news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest news' },
      { status: 500 }
    );
  }
}
