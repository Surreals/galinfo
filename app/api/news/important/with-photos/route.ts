import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';

export interface ImportantNewsWithPhotosItem {
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

export interface ImportantNewsWithPhotosResponse {
  news: ImportantNewsWithPhotosItem[];
  total: number;
  filters: {
    category?: string;
    region?: string;
    tagId?: number;
    specialThemeId?: number;
    level?: number;
    lang: string;
    limit: number;
    requirePhotos: boolean;
  };
  metadata?: {
    category?: { id: string; name: string; };
    region?: { id: string; name: string; };
    tag?: { id: number; tag: string; };
    specialTheme?: { id: number; title: string; param: string; };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const lang = searchParams.get('lang') || '1';
    const level = searchParams.get('level'); // Рівень важливості (1, 2, 3, 4)
    
    // Filter parameters
    const category = searchParams.get('category'); // rubric
    const region = searchParams.get('region'); // region parameter
    const tagId = searchParams.get('tagId'); // tag ID
    const specialThemeId = searchParams.get('specialThemeId'); // special theme ID
    const requirePhotos = searchParams.get('requirePhotos') !== 'false'; // Default true

    // Base WHERE conditions for important news with photos
    let whereConditions = [
      'a_news.udate < UNIX_TIMESTAMP()', // Only published
      'a_news.approved = 1',             // Only approved
      'a_news.lang = ?',                 // Language
      'a_news.nweight > 0'               // Important news only
    ];
    
    let queryParams: any[] = [lang];
    let joins: string[] = [];
    let metadata: any = {};

    // Require photos (images field not null and not empty)
    if (requirePhotos) {
      whereConditions.push('a_news.images IS NOT NULL');
      whereConditions.push('a_news.images != ""');
    }

    // Filter by importance level
    if (level) {
      const levelNum = parseInt(level);
      if (levelNum >= 1 && levelNum <= 4) {
        whereConditions.push('a_news.nweight = ?');
        queryParams.push(levelNum);
      }
    }

    // Filter by category/rubric
    if (category) {
      whereConditions.push('FIND_IN_SET(?, a_news.rubric) > 0');
      queryParams.push(category);
      
      // Get category metadata
      try {
        const [categoryData] = await executeQuery(
          'SELECT id, param, title FROM a_cats WHERE param = ? AND lng = ?',
          [category, lang]
        );
        if (categoryData && categoryData.length > 0) {
          metadata.category = {
            id: categoryData[0].param,
            name: categoryData[0].title
          };
        }
      } catch (err) {
        console.warn('Failed to fetch category metadata:', err);
      }
    }

    // Filter by region
    if (region) {
      whereConditions.push('FIND_IN_SET(?, a_news.rubric) > 0');
      queryParams.push(region);
      
      // Get region metadata
      try {
        const [regionData] = await executeQuery(
          'SELECT id, param, title FROM a_cats WHERE param = ? AND cattype = 3 AND lng = ?',
          [region, lang]
        );
        if (regionData && regionData.length > 0) {
          metadata.region = {
            id: regionData[0].param,
            name: regionData[0].title
          };
        }
      } catch (err) {
        console.warn('Failed to fetch region metadata:', err);
      }
    }

    // Filter by tag
    if (tagId) {
      const tagIdNum = parseInt(tagId);
      if (!isNaN(tagIdNum)) {
        joins.push('INNER JOIN a_tags_map ON a_news.id = a_tags_map.newsid');
        whereConditions.push('a_tags_map.tagid = ?');
        queryParams.push(tagIdNum);
        
        // Get tag metadata
        try {
          const [tagData] = await executeQuery(
            'SELECT id, tag FROM a_tags WHERE id = ?',
            [tagIdNum]
          );
          if (tagData && tagData.length > 0) {
            metadata.tag = {
              id: tagData[0].id,
              tag: tagData[0].tag
            };
          }
        } catch (err) {
          console.warn('Failed to fetch tag metadata:', err);
        }
      }
    }

    // Filter by special theme
    if (specialThemeId) {
      const themeIdNum = parseInt(specialThemeId);
      if (!isNaN(themeIdNum)) {
        // Get special theme info first
        try {
          const [themeData] = await executeQuery(
            'SELECT id, param, title FROM a_cats WHERE id = ? AND cattype = 2 AND lng = ?',
            [themeIdNum, lang]
          );
          if (themeData && themeData.length > 0) {
            const themeParam = themeData[0].param;
            whereConditions.push('FIND_IN_SET(?, a_news.rubric) > 0');
            queryParams.push(themeParam);
            
            metadata.specialTheme = {
              id: themeData[0].id,
              title: themeData[0].title,
              param: themeData[0].param
            };
          }
        } catch (err) {
          console.warn('Failed to fetch special theme metadata:', err);
        }
      }
    }

    const joinClause = joins.length > 0 ? joins.join(' ') : '';
    const whereClause = whereConditions.join(' AND ');

    // Query for important news with photos
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
      ${joinClause}
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      WHERE ${whereClause}
      ORDER BY a_news.nweight DESC, a_news.udate DESC
      LIMIT ?
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT a_news.id) as total
      FROM a_news
      ${joinClause}
      WHERE ${whereClause}
    `;

    // Execute queries
    const [[newsData], [countData]] = await Promise.all([
      executeQuery(newsQuery, [...queryParams, limit]),
      executeQuery(countQuery, queryParams)
    ]);

    const total = countData[0]?.total || 0;

    // Get images for news items
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

    // Process news with images
    const processedNews = (newsData || []).map(news => ({
      ...news,
      images: news.images ? formatNewsImages(imagesData, news.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)), lang) : []
    }));

    const response: ImportantNewsWithPhotosResponse = {
      news: processedNews,
      total,
      filters: {
        ...(category && { category }),
        ...(region && { region }),
        ...(tagId && { tagId: parseInt(tagId) }),
        ...(specialThemeId && { specialThemeId: parseInt(specialThemeId) }),
        ...(level && { level: parseInt(level) }),
        lang,
        limit,
        requirePhotos
      },
      ...(Object.keys(metadata).length > 0 && { metadata })
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching important news with photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch important news with photos' },
      { status: 500 }
    );
  }
}
