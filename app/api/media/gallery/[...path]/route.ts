import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';

// Динамічний імпорт Sharp для уникнення помилок при білді
let sharp: any;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('Sharp not available:', error);
}

// Конфігурація розмірів
const SIZE_CONFIG = {
  tmb: { width: 150, height: 150, quality: 80 },
  intxt: { width: 800, height: 600, quality: 85 },
  full: null // Оригінальний розмір
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path;
    
    // Парсимо шлях: [size, char1, char2, filename]
    // Приклад: /tmb/1/7/1761574574725_59m3t1s5ikd.jpg
    if (pathSegments.length < 4) {
      return new NextResponse('Invalid path', { status: 400 });
    }
    
    const [size, char1, char2, ...filenameParts] = pathSegments;
    const filename = filenameParts.join('/'); // На випадок якщо в імені файлу є слеши
    
    // Перевіряємо валідність розміру
    if (!['full', 'intxt', 'tmb'].includes(size)) {
      return new NextResponse('Invalid size', { status: 400 });
    }
    
    const basePath = process.env.MEDIA_STORAGE_PATH || join(process.cwd(), 'public', 'media');
    const requestedPath = join(basePath, 'gallery', size, char1, char2, filename);
    const fullPath = join(basePath, 'gallery', 'full', char1, char2, filename);
    
    console.log(`🔍 Media request: ${size}/${char1}/${char2}/${filename}`);
    
    // Спочатку перевіряємо, чи існує файл у потрібному розмірі
    try {
      await access(requestedPath, constants.F_OK);
      console.log(`✅ Found existing file: ${requestedPath}`);
      
      // Файл існує, повертаємо його
      const fileBuffer = await readFile(requestedPath);
      const contentType = getContentType(filename);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Кешуємо на рік
          'Last-Modified': new Date().toUTCString(),
        },
      });
      
    } catch (error) {
      // Файл не існує, генеруємо з full версії
      console.log(`⚠️ File not found: ${requestedPath}, generating from full...`);
    }
    
    // Якщо це full розмір, але файл не знайдено
    if (size === 'full') {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Перевіряємо, чи існує оригінальний файл
    try {
      await access(fullPath, constants.F_OK);
    } catch (error) {
      console.log(`❌ Original file not found: ${fullPath}`);
      return new NextResponse('Original file not found', { status: 404 });
    }
    
    // Генеруємо зображення потрібного розміру
    const originalBuffer = await readFile(fullPath);
    const sizeConfig = SIZE_CONFIG[size as keyof typeof SIZE_CONFIG];
    
    if (!sizeConfig) {
      return new NextResponse('Invalid size configuration', { status: 400 });
    }
    
    console.log(`🔧 Generating ${size} version: ${sizeConfig.width}x${sizeConfig.height}`);
    
    // Перевіряємо наявність Sharp
    if (!sharp) {
      return new NextResponse('Image processing not available', { status: 500 });
    }
    
    // Створюємо зображення потрібного розміру
    const resizedBuffer = await sharp(originalBuffer)
      .resize({ 
        width: sizeConfig.width, 
        height: sizeConfig.height, 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: sizeConfig.quality })
      .toBuffer();
    
    // Зберігаємо згенерований файл для наступних запитів
    try {
      const dirPath = join(basePath, 'gallery', size, char1, char2);
      await mkdir(dirPath, { recursive: true });
      
      // Конвертуємо в .jpg для зжатих версій
      const savedFilename = size === 'full' ? filename : filename.replace(/\.[^.]+$/, '.jpg');
      const savedPath = join(dirPath, savedFilename);
      
      await writeFile(savedPath, resizedBuffer);
      console.log(`💾 Saved generated file: ${savedPath}`);
    } catch (saveError) {
      console.error('Failed to save generated file:', saveError);
      // Не критично, продовжуємо
    }
    
    // Повертаємо згенероване зображення
    return new NextResponse(resizedBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'Last-Modified': new Date().toUTCString(),
      },
    });
    
  } catch (error) {
    console.error('Media API error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

// Допоміжна функція для визначення типу контенту
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg'; // За замовчуванням
  }
}
