import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { executeQuery } from '@/app/lib/db';
import { getVideoUrl, getVideoThumbnailUrl } from '@/app/lib/videoUtils';
import { config } from '@/app/lib/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const thumbnail = formData.get('thumbnail') as File | null;
    const title = formData.get('title') as string;
    const videoType = formData.get('video_type') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Перевіряємо тип файлу
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      );
    }

    // Перевіряємо розмір файлу (максимум 100MB для відео)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 100MB' },
        { status: 400 }
      );
    }

    // Генеруємо унікальне ім'я файлу
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // Створюємо підпапки на основі перших двох символів
    const firstChar = filename.charAt(0);
    const secondChar = filename.charAt(1);
    
    // Шляхи для відео файлів
    // Use external storage path if configured, otherwise fallback to public directory
    const mediaPath = process.env.MEDIA_STORAGE_PATH;
    const basePath = mediaPath 
      ? mediaPath 
      : join(process.cwd(), 'public', 'media');
    
    // Debug logging to verify configuration
    console.log('🔍 Video Upload Configuration:');
    console.log('  MEDIA_STORAGE_PATH env:', process.env.MEDIA_STORAGE_PATH);
    console.log('  Using base path:', basePath);
    console.log('  Is external storage:', !!mediaPath);
    
    const videoPath = join(basePath, 'videos', firstChar, secondChar);
    const thumbnailPath = join(basePath, 'videos', 'thumbnails', firstChar, secondChar);
    
    console.log('  Video path:', videoPath);
    console.log('  Thumbnail path:', thumbnailPath);

    // Створюємо директорії якщо вони не існують
    await mkdir(videoPath, { recursive: true });
    await mkdir(thumbnailPath, { recursive: true });

    // Конвертуємо файл в буфер
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Зберігаємо відео файл
    const videoFilePath = join(videoPath, filename);
    await writeFile(videoFilePath, buffer);

    // Зберігаємо thumbnail якщо він був завантажений
    let thumbnailUrl: string | null = null;
    if (thumbnail && thumbnail.size > 0) {
      // Перевіряємо що це зображення
      if (!thumbnail.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Thumbnail must be an image file' },
          { status: 400 }
        );
      }

      // Генеруємо ім'я для thumbnail (можна використати те ж саме ім'я але з іншим розширенням)
      const thumbnailExtension = thumbnail.name.split('.').pop();
      const thumbnailFilename = `${timestamp}_${Math.random().toString(36).substring(2)}.${thumbnailExtension}`;
      
      // Конвертуємо thumbnail в буфер
      const thumbnailBytes = await thumbnail.arrayBuffer();
      const thumbnailBuffer = Buffer.from(thumbnailBytes);
      
      // Зберігаємо thumbnail файл
      const thumbnailFilePath = join(thumbnailPath, thumbnailFilename);
      await writeFile(thumbnailFilePath, thumbnailBuffer);
      
      // Генеруємо URL для thumbnail
      thumbnailUrl = getVideoThumbnailUrl(thumbnailFilename);
    }

    // Зберігаємо інформацію в базу даних
    const insertQuery = `
      INSERT INTO a_videos (
        filename, 
        title_ua, 
        title_deflang, 
        description_ua, 
        description_deflang, 
        thumburl,
        duration, 
        file_size, 
        mime_type, 
        video_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Convert video_type string to integer
    const getVideoTypeId = (type: string): number => {
      const typeMap: { [key: string]: number } = {
        'news': 1,
        'gallery': 2,
        'advertisement': 3
      };
      return typeMap[type] || 1; // Default to news (1) if type not found
    };

    const [result] = await executeQuery(insertQuery, [
      filename,
      title || file.name,
      title || file.name, // title_deflang - using same value as title_ua
      description || '',
      description || '', // description_deflang - using same value as description_ua
      thumbnailUrl || null,
      0, // duration - will be updated later if needed
      file.size,
      file.type,
      getVideoTypeId(videoType || 'news')
    ]);

    // Отримуємо ID вставленого запису
    const videoId = (result as any).insertId;

    // Отримуємо повну інформацію про відео
    const selectQuery = `
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
      WHERE id = ?
    `;
    
    const [videoData] = await executeQuery(selectQuery, [videoId]);

    if (videoData.length === 0) {
      throw new Error('Failed to retrieve uploaded video data');
    }

    const video = videoData[0];

    // Додаємо URL для відео
    const videoWithUrl = {
      ...video,
      video_type: getVideoTypeString(video.video_type),
      url: getVideoUrl(video.filename),
      thumbnail_url: video.thumburl || getVideoThumbnailUrl(video.filename)
    };

    return NextResponse.json({
      success: true,
      video: videoWithUrl
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}

// Helper function to convert video_type integer back to string
function getVideoTypeString(typeId: number): string {
  const typeMap: { [key: number]: string } = {
    1: 'news',
    2: 'gallery',
    3: 'advertisement'
  };
  return typeMap[typeId] || 'news';
}
