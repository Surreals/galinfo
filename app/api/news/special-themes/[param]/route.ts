import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface SpecialThemesNewsItem {
  id: number;
  ndate: string;
  ntime: string;
  ntype: number;
  images: Array<{
    urls: {
      full: string;
      intxt: string;
      tmb: string;
    };
  }>;
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
  { params }: { params: { param: string } }
) {
  try {
    const { param } = params;
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

    // Get news for this special theme using the theme's param as rubric
    const [newsResult] = await executeQuery<SpecialThemesNewsItem>(
      `SELECT 
        n.id, n.ndate, n.ntime, n.ntype, n.urlkey, n.photo, n.video, 
        n.comments, n.printsubheader, n.rubric, n.nweight, n.nheader, 
        n.nsubheader, n.nteaser, n.comments_count, n.views_count,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'urls', JSON_OBJECT(
              'full', CONCAT('/im/', SUBSTRING(ni.filename, 1, 1), '/', SUBSTRING(ni.filename, 2, 1), '/', ni.filename),
              'intxt', CONCAT('/im/', SUBSTRING(ni.filename, 1, 1), '/', SUBSTRING(ni.filename, 2, 1), '/', ni.filename),
              'tmb', CONCAT('/im/', SUBSTRING(ni.filename, 1, 1), '/', SUBSTRING(ni.filename, 2, 1), '/', ni.filename)
            )
          )
        ) as images
       FROM a_news n
       LEFT JOIN a_news_images ni ON n.id = ni.news_id
       WHERE n.rubric = ? 
         AND n.approved = ?
         AND n.lng = ?
       GROUP BY n.id
       ORDER BY n.ndate DESC, n.ntime DESC
       LIMIT ? OFFSET ?`,
      [specialTheme.param, approved, lang, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await executeQuery<{ total: number }>(
      `SELECT COUNT(*) as total 
       FROM a_news 
       WHERE rubric = ? AND approved = ? AND lng = ?`,
      [specialTheme.param, approved, lang]
    );

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const response: SpecialThemesNewsResponse = {
      news: newsResult || [],
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
