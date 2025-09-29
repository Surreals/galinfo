import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { executeQuery } from '@/app/lib/db';
import { getVideoUrl, getVideoThumbnailUrl } from '@/app/lib/videoUtils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
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
    const basePath = join(process.cwd(), 'public', 'media', 'videos');
    const videoPath = join(basePath, firstChar, secondChar);
    const thumbnailPath = join(basePath, 'thumbnails', firstChar, secondChar);

    // Створюємо директорії якщо вони не існують
    await mkdir(videoPath, { recursive: true });
    await mkdir(thumbnailPath, { recursive: true });

    // Конвертуємо файл в буфер
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Зберігаємо відео файл
    const videoFilePath = join(videoPath, filename);
    await writeFile(videoFilePath, buffer);

    // TODO: Тут можна додати логіку для створення мініатюр відео
    // Поки що копіюємо перший кадр як мініатюру (потребує ffmpeg)
    // await writeFile(join(thumbnailPath, filename), buffer);

    // Зберігаємо інформацію в базу даних
    const insertQuery = `
      INSERT INTO a_videos (
        filename, 
        title_ua, 
        title_deflang, 
        description_ua, 
        description_deflang, 
        duration, 
        file_size, 
        mime_type, 
        video_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      thumbnail_url: getVideoThumbnailUrl(video.filename)
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
