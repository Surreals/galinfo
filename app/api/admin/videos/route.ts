import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { getVideoUrl, getVideoThumbnailUrl } from '@/app/lib/videoUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const videoType = searchParams.get('video_type') || '';
    
    const offset = (page - 1) * limit;
    
    // Базовий запит
    let queryText = `
      SELECT 
        id,
        filename,
        title_ua,
        title_deflang,
        description_ua,
        description_deflang,
        thumburl,
        duration,
        file_size,
        mime_type,
        video_type,
        created_at
      FROM a_videos 
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Додаємо пошук по назві
    if (search) {
      queryText += ` AND (title_ua LIKE ? OR filename LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    // Додаємо фільтр по типу
    if (videoType) {
      const getVideoTypeId = (type: string): number => {
        const typeMap: { [key: string]: number } = {
          'news': 1,
          'gallery': 2,
          'advertisement': 3
        };
        return typeMap[type] || 1;
      };
      
      queryText += ` AND video_type = ?`;
      queryParams.push(getVideoTypeId(videoType));
    }
    
    // Додаємо сортування та пагінацію
    queryText += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    const [videos] = await executeQuery(queryText, queryParams);
    
    // Отримуємо загальну кількість для пагінації
    let countQuery = `SELECT COUNT(*) as total FROM a_videos WHERE 1=1`;
    const countParams: any[] = [];
    
    if (search) {
      countQuery += ` AND (title_ua LIKE ? OR filename LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (videoType) {
      const getVideoTypeId = (type: string): number => {
        const typeMap: { [key: string]: number } = {
          'news': 1,
          'gallery': 2,
          'advertisement': 3
        };
        return typeMap[type] || 1;
      };
      
      countQuery += ` AND video_type = ?`;
      countParams.push(getVideoTypeId(videoType));
    }
    
    const [countResult] = await executeQuery(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    
    // Convert video_type integer back to string for API response
    const getVideoTypeString = (typeId: number): string => {
      const typeMap: { [key: number]: string } = {
        1: 'news',
        2: 'gallery',
        3: 'advertisement'
      };
      return typeMap[typeId] || 'news';
    };

    // Додаємо URL для відео
    const videosWithUrls = videos.map((video: any) => ({
      ...video,
      video_type: getVideoTypeString(video.video_type),
      url: getVideoUrl(video.filename),
      thumbnail_url: video.thumburl || getVideoThumbnailUrl(video.filename)
    }));
    
    return NextResponse.json({
      videos: videosWithUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
