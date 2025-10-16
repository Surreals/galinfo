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
  special_theme: {
    id: number;
    param: string;
    title: string;
    cattype: number;
  };
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
    lang: string;
    approved: boolean;
  };
  specialThemes: {
    id: number;
    param: string;
    title: string;
    cattype: number;
    newsCount: number;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const lang = searchParams.get('lang') || '1';
    const approved = searchParams.get('approved') !== 'false';
    
    const offset = (page - 1) * limit;

    // First, get all visible special themes
    const [specialThemesResult] = await executeQuery<{
      id: number;
      param: string;
      title: string;
      cattype: number;
    }>(
      `SELECT id, param, title, cattype 
       FROM a_cats 
       WHERE cattype = 2 AND isvis = 1 AND lng = ?
       ORDER BY id`,
      [lang]
    );

    if (!specialThemesResult || specialThemesResult.length === 0) {
      return NextResponse.json({
        news: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        filters: {
          lang,
          approved
        },
        specialThemes: []
      });
    }

    const specialThemeIds = specialThemesResult.map(theme => theme.id);

    // Get news from all special themes using theme field
    const [newsResult] = await executeQuery<SpecialThemesNewsItem & { theme_id: number }>(
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
        a_statview.qty as views_count,
        a_cats.id as theme_id,
        a_cats.param as theme_param,
        a_cats.title as theme_title,
        a_cats.cattype as theme_cattype
       FROM a_news
       LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
       LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
       LEFT JOIN a_statview ON a_news.id = a_statview.id
       LEFT JOIN a_cats ON a_news.theme = a_cats.id AND a_cats.cattype = 2
       WHERE a_news.theme IN (${specialThemeIds.map(() => '?').join(',')})
         AND a_news.approved = 1
         AND a_news.lang = ?
         AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()
       ORDER BY a_news.udate DESC
       LIMIT ? OFFSET ?`,
      [...specialThemeIds, lang, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await executeQuery<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM a_news
       WHERE a_news.theme IN (${specialThemeIds.map(() => '?').join(',')})
         AND a_news.approved = 1
         AND a_news.lang = ?
         AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()`,
      [...specialThemeIds, lang]
    );

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Get news count per theme
    const [themeCounts] = await executeQuery<{ theme_id: number; count: number }>(
      `SELECT a_news.theme as theme_id, COUNT(*) as count
       FROM a_news
       WHERE a_news.theme IN (${specialThemeIds.map(() => '?').join(',')})
         AND a_news.approved = 1
         AND a_news.lang = ?
         AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()
       GROUP BY a_news.theme`,
      [...specialThemeIds, lang]
    );

    const themeCountMap = new Map(themeCounts.map(tc => [tc.theme_id, tc.count]));

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

    // Process news with images and theme information
    const processedNews = (newsResult || []).map(news => ({
      ...news,
      images: news.images ? formatNewsImages(imagesData, news.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)), lang) : [],
      special_theme: {
        id: news.theme_id,
        param: news.theme_param,
        title: news.theme_title,
        cattype: news.theme_cattype
      }
    }));

    // Remove theme fields from news items
    const cleanedNews = processedNews.map(({ theme_id, theme_param, theme_title, theme_cattype, ...news }) => news);

    const response: SpecialThemesNewsResponse = {
      news: cleanedNews,
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
        approved
      },
      specialThemes: specialThemesResult.map(theme => ({
        ...theme,
        newsCount: themeCountMap.get(theme.id) || 0
      }))
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
