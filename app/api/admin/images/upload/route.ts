import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { executeQuery } from '@/app/lib/db';
import { config } from '@/app/lib/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const picType = formData.get('pic_type') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Перевіряємо тип файлу
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Перевіряємо розмір файлу (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
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
    
    // Шляхи для різних розмірів зображень
    // Use external storage path if configured, otherwise fallback to public directory
    const mediaPath = process.env.MEDIA_STORAGE_PATH;
    const basePath = mediaPath 
      ? mediaPath 
      : join(process.cwd(), 'public', 'media');
    
    // Debug logging to verify configuration
    console.log('🔍 Image Upload Configuration:');
    console.log('  MEDIA_STORAGE_PATH env:', process.env.MEDIA_STORAGE_PATH);
    console.log('  Using base path:', basePath);
    console.log('  Is external storage:', !!mediaPath);
    
    const fullPath = join(basePath, 'gallery', 'full', firstChar, secondChar);
    const tmbPath = join(basePath, 'gallery', 'tmb', firstChar, secondChar);
    const intxtPath = join(basePath, 'gallery', 'intxt', firstChar, secondChar);
    
    console.log('  Full path:', fullPath);
    console.log('  Thumbnail path:', tmbPath);
    console.log('  In-text path:', intxtPath);

    // Створюємо директорії якщо вони не існують
    await mkdir(fullPath, { recursive: true });
    await mkdir(tmbPath, { recursive: true });
    await mkdir(intxtPath, { recursive: true });

    // Конвертуємо файл в буфер
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Зберігаємо оригінальне зображення
    const fullFilePath = join(fullPath, filename);
    await writeFile(fullFilePath, buffer);

    // Тут можна додати логіку для створення мініатюр
    // Поки що копіюємо оригінал в інші папки
    await writeFile(join(tmbPath, filename), buffer);
    await writeFile(join(intxtPath, filename), buffer);

    // Зберігаємо інформацію в базу даних
    const insertQuery = `
      INSERT INTO a_pics (filename, title_ua, title_deflang, pic_type)
      VALUES (?, ?, ?, ?)
    `;
    
    // Convert pic_type string to integer
    const getPicTypeId = (type: string): number => {
      const typeMap: { [key: string]: number } = {
        'news': 1,
        'gallery': 2,
        'avatar': 3,
        'banner': 4
      };
      return typeMap[type] || 2; // Default to gallery (2) if type not found
    };

    const [result] = await executeQuery(insertQuery, [
      filename,
      title || file.name,
      title || file.name, // title_deflang - using same value as title_ua
      getPicTypeId(picType || 'gallery')
    ]);

    // Отримуємо ID вставленого запису
    const imageId = (result as any).insertId;

    // Отримуємо повну інформацію про зображення
    const selectQuery = `
      SELECT 
        id,
        filename,
        title_ua,
        title_deflang,
        pic_type
      FROM a_pics 
      WHERE id = ?
    `;
    
    const [imageData] = await executeQuery(selectQuery, [imageId]);

    if (imageData.length === 0) {
      throw new Error('Failed to retrieve uploaded image data');
    }

    const image = imageData[0];

    // Додаємо URL для зображення (нові зображення використовують локальні шляхи)
    const imageWithUrl = {
      ...image,
      url: `/media/gallery/full/${firstChar}/${secondChar}/${filename}`,
      thumbnail_url: `/media/gallery/tmb/${firstChar}/${secondChar}/${filename}`
    };

    return NextResponse.json({
      success: true,
      image: imageWithUrl
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
