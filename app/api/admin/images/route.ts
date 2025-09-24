import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const picType = searchParams.get('pic_type') || '';
    
    const offset = (page - 1) * limit;
    
    // Базовий запит
    let queryText = `
      SELECT 
        id,
        filename,
        title,
        pic_type,
        created_at,
        updated_at
      FROM PICS 
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Додаємо пошук по назві
    if (search) {
      queryText += ` AND (title LIKE ? OR filename LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    // Додаємо фільтр по типу
    if (picType) {
      queryText += ` AND pic_type = ?`;
      queryParams.push(picType);
    }
    
    // Додаємо сортування та пагінацію
    queryText += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    const [images] = await executeQuery(queryText, queryParams);
    
    // Отримуємо загальну кількість для пагінації
    let countQuery = `SELECT COUNT(*) as total FROM PICS WHERE 1=1`;
    const countParams: any[] = [];
    
    if (search) {
      countQuery += ` AND (title LIKE ? OR filename LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (picType) {
      countQuery += ` AND pic_type = ?`;
      countParams.push(picType);
    }
    
    const [countResult] = await executeQuery(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    
    // Додаємо URL для зображень
    const imagesWithUrls = images.map((image: any) => ({
      ...image,
      url: generateImageUrl(image.filename, 'full'),
      thumbnail_url: generateImageUrl(image.filename, 'tmb')
    }));
    
    return NextResponse.json({
      images: imagesWithUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// Функція для генерації URL зображення
function generateImageUrl(filename: string, size: 'full' | 'tmb' | 'intxt'): string {
  if (!filename) return '';
  
  // Витягуємо перші два символи для підпапок
  const firstChar = filename.charAt(0);
  const secondChar = filename.charAt(1);
  
  // Визначаємо шлях залежно від розміру
  let sizePath = '';
  switch (size) {
    case 'full':
      sizePath = 'full';
      break;
    case 'tmb':
      sizePath = 'tmb';
      break;
    case 'intxt':
      sizePath = 'intxt';
      break;
  }
  
  return `/media/gallery/${sizePath}/${firstChar}/${secondChar}/${filename}`;
}
