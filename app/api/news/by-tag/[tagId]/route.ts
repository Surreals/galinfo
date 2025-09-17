import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';

export interface NewsByTagItem {
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

export interface NewsByTagResponse {
  news: NewsByTagItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    tagId: number;
    lang: string;
    approved: boolean;
    type?: string;
  };
  tag: {
    id: number;
    tag: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const lang = searchParams.get('lang') || '1';
    const approved = searchParams.get('approved') !== 'false';
    const type = searchParams.get('type');
    const byName = searchParams.get('byName') === 'true';
    
    const offset = (page - 1) * limit;

    // First, get the tag information
    let tagResult;
    
    if (byName) {
      // Search by tag name
      [tagResult] = await executeQuery<{
        id: number;
        tag: string;
      }>(
        `SELECT id, tag 
         FROM a_tags 
         WHERE tag = ?`,
        [tagId]
      );
    } else {
      // Search by tag ID (original behavior)
      const tagIdNum = parseInt(tagId);
      if (isNaN(tagIdNum)) {
        return NextResponse.json(
          { error: 'Invalid tag ID' },
          { status: 400 }
        );
      }

      [tagResult] = await executeQuery<{
        id: number;
        tag: string;
      }>(
        `SELECT id, tag 
         FROM a_tags 
         WHERE id = ?`,
        [tagIdNum]
      );
    }

    if (!tagResult || tagResult.length === 0) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    const tag = tagResult[0];

    // Build WHERE conditions
    let whereConditions = [
      'a_news.udate < UNIX_TIMESTAMP()',
      'a_news.approved = 1',
      'a_news.lang = ?'
    ];
    
    const queryParams: any[] = [lang];

    // Add type filter if specified
    if (type) {
      const typeMap: { [key: string]: number } = {
        news: 1,
        articles: 2,
        photo: 3,
        video: 4,
        audio: 5,
        announces: 6,
        blogs: 20,
        mainmedia: 21
      };
      
      if (typeMap[type]) {
        whereConditions.push('a_news.ntype = ?');
        queryParams.push(typeMap[type]);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Get news associated with this tag
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
      INNER JOIN a_tags_map ON a_news.id = a_tags_map.newsid
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      WHERE a_tags_map.tagid = ? AND ${whereClause}
      ORDER BY a_news.udate DESC
      LIMIT ? OFFSET ?
    `;

    const [newsResult] = await executeQuery<NewsByTagItem>(
      newsQuery,
      [tag.id, ...queryParams, limit, offset]
    );

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM a_news
      INNER JOIN a_tags_map ON a_news.id = a_tags_map.newsid
      WHERE a_tags_map.tagid = ? AND ${whereClause}
    `;

    const [countResult] = await executeQuery<{ total: number }>(
      countQuery,
      [tag.id, ...queryParams]
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

    const response: NewsByTagResponse = {
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
        tagId: tag.id,
        tagSearch: byName ? tagId : tag.id.toString(),
        searchByName: byName,
        lang,
        approved,
        ...(type && { type })
      },
      tag
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching news by tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news by tag' },
      { status: 500 }
    );
  }
}
