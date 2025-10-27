import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { executeQuery } from '@/app/lib/db';
import { config } from '@/app/lib/config';
import { getImageUrl } from '@/app/lib/imageUtils';
import { processImage, validateImage } from '@/app/lib/imageProcessor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get all files from FormData (supports multiple files)
    const files: File[] = [];
    const fileEntries = formData.getAll('file');
    const filesEntries = formData.getAll('files');
    
    // Combine both single and multiple file uploads
    for (const entry of [...fileEntries, ...filesEntries]) {
      if (entry instanceof File) {
        files.push(entry);
      }
    }
    
    const title = formData.get('title') as string;
    const picType = formData.get('pic_type') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

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

    // Convert pic_type integer back to string for API response
    const getPicTypeString = (typeId: number): string => {
      const typeMap: { [key: number]: string } = {
        1: 'news',
        2: 'gallery',
        3: 'avatar',
        4: 'banner'
      };
      return typeMap[typeId] || 'gallery';
    };

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
    console.log('  Uploading', files.length, 'file(s)');

    const uploadedImages = [];
    const errors = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Перевіряємо тип файлу
        if (!file.type.startsWith('image/')) {
          errors.push({ file: file.name, error: 'File must be an image' });
          continue;
        }

        // Перевіряємо розмір файлу (максимум 10MB)
        if (file.size > 10 * 1024 * 1024) {
          errors.push({ file: file.name, error: 'File size must be less than 10MB' });
          continue;
        }

        // Генеруємо унікальне ім'я файлу
        const timestamp = Date.now() + i; // Add index to ensure unique timestamps
        const fileExtension = file.name.split('.').pop();
        const filename = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        // Конвертуємо файл в буфер
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Валідуємо зображення
        const validation = await validateImage(buffer);
        if (!validation.isValid) {
          errors.push({ file: file.name, error: validation.error || 'Некоректне зображення' });
          continue;
        }

        // Обробляємо зображення та створюємо всі розміри (full, intx, tmb)
        const processingResult = await processImage(buffer, filename, basePath);
        
        console.log('🖼️ Створено зображення з розмірами:', {
          filename: processingResult.filename,
          originalSize: `${processingResult.metadata.originalWidth}x${processingResult.metadata.originalHeight}`,
          sizes: Object.keys(processingResult.sizes)
        });

        // Зберігаємо інформацію в базу даних
        const insertQuery = `
          INSERT INTO a_pics (filename, title_ua, title_deflang, pic_type, tags)
          VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await executeQuery(insertQuery, [
          filename,
          title || file.name,
          title || file.name, // title_deflang - using same value as title_ua
          getPicTypeId(picType || 'gallery'),
          tags || null
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
            pic_type,
            tags
          FROM a_pics 
          WHERE id = ?
        `;
        
        const [imageData] = await executeQuery(selectQuery, [imageId]);

        if (imageData.length === 0) {
          errors.push({ file: file.name, error: 'Failed to retrieve uploaded image data' });
          continue;
        }

        const image = imageData[0];

        // Додаємо URL для зображення
        const imageWithUrl = {
          ...image,
          pic_type: getPicTypeString(image.pic_type),
          url: getImageUrl(image.filename, 'full'),
          thumbnail_url: getImageUrl(image.filename, 'tmb')
        };

        uploadedImages.push(imageWithUrl);
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        errors.push({ file: file.name, error: 'Failed to upload file' });
      }
    }

    // Return response
    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to upload any images',
          errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      uploaded: uploadedImages.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
