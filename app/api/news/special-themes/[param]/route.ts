import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';

export interface SpecialThemesNewsItem {
  id: number;
  ndate: string;
  ntime: string;
  ntype: number;
  images: any; // Will be processed by formatNewsImages
  urlkey: string;
  photo: number;
  video: number;
  comments: number;
  printsubheader: number;
  rubric: string;
  nweight: number;
  nheader: string;
  nsubheader: string;
  nteaser: string;
  comments_count: number;
  views_count: number;
}

export interface SpecialThemesNewsResponse {
  news: SpecialThemesNewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    param: string;
    lang: string;
    approved: boolean;
  };
  specialTheme: {
    id: number;
    param: string;
    title: string;
    link: string;
    cattype: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const lang = searchParams.get('lang') || '1';
    const approved = searchParams.get('approved') !== 'false';
    const searchById = searchParams.get('byId') === 'true';
    
    const offset = (page - 1) * limit;

    // First, get the special theme information
    let specialThemeResult;
    
    if (searchById) {
      // Search by ID
      const themeId = parseInt(param);
      if (isNaN(themeId)) {
        return NextResponse.json(
          { error: 'Invalid theme ID' },
          { status: 400 }
        );
      }
      
      [specialThemeResult] = await executeQuery<{
        id: number;
        param: string;
        title: string;
        cattype: number;
      }>(
        `SELECT id, param, title, cattype 
         FROM a_cats 
         WHERE id = ? AND cattype = 2 AND isvis = 1 AND lng = ?`,
        [themeId, lang]
      );
    } else {
      // Search by param (original behavior)
      [specialThemeResult] = await executeQuery<{
        id: number;
        param: string;
        title: string;
        cattype: number;
      }>(
        `SELECT id, param, title, cattype 
         FROM a_cats 
         WHERE param = ? AND cattype = 2 AND isvis = 1 AND lng = ?`,
        [param, lang]
      );
    }

    if (!specialThemeResult || specialThemeResult.length === 0) {
      return NextResponse.json(
        { error: 'Special theme not found' },
        { status: 404 }
      );
    }

    const specialTheme = specialThemeResult[0];

    // Get news for this special theme using the theme field
    const [newsResult] = await executeQuery<SpecialThemesNewsItem>(
      `SELECT 
        a_news.id,
        DATE_FORMAT(a_news.ndate, '%Y-%m-%d') as ndate,
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
       WHERE a_news.theme = ?
         AND a_news.approved = 1
         AND a_news.lang = ?
         AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()
       ORDER BY a_news.udate DESC
       LIMIT ? OFFSET ?`,
      [specialTheme.id, lang, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await executeQuery<{ total: number }>(
      `SELECT COUNT(*) as total 
       FROM a_news 
       WHERE a_news.theme = ?
         AND a_news.approved = 1
         AND a_news.lang = ?
         AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()`,
      [specialTheme.id, lang]
    );

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Get images for news items
    const imageIds = newsResult
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

    // Process news with images
    const processedNews = (newsResult || []).map(news => ({
      ...news,
      images: news.images ? formatNewsImages(imagesData, news.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)), lang) : []
    }));

    const response: SpecialThemesNewsResponse = {
      news: processedNews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        param: searchById ? specialTheme.param : param,
        lang,
        approved
      },
      specialTheme: {
        ...specialTheme,
        link: `/${specialTheme.param}/`
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching special themes news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch special themes news' },
      { status: 500 }
    );
  }
}
