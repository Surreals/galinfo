import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { getImageUrl } from '@/app/lib/imageUtils';

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
        title_ua,
        title_deflang,
        pic_type
      FROM a_pics 
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Додаємо пошук по назві
    if (search) {
      queryText += ` AND (title_ua LIKE ? OR filename LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    // Додаємо фільтр по типу
    if (picType) {
      const getPicTypeId = (type: string): number => {
        const typeMap: { [key: string]: number } = {
          'news': 1,
          'gallery': 2,
          'avatar': 3,
          'banner': 4
        };
        return typeMap[type] || 2;
      };
      
      queryText += ` AND pic_type = ?`;
      queryParams.push(getPicTypeId(picType));
    }
    
    // Додаємо сортування та пагінацію
    queryText += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    const [images] = await executeQuery(queryText, queryParams);
    
    // Отримуємо загальну кількість для пагінації
    let countQuery = `SELECT COUNT(*) as total FROM a_pics WHERE 1=1`;
    const countParams: any[] = [];
    
    if (search) {
      countQuery += ` AND (title_ua LIKE ? OR filename LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (picType) {
      const getPicTypeId = (type: string): number => {
        const typeMap: { [key: string]: number } = {
          'news': 1,
          'gallery': 2,
          'avatar': 3,
          'banner': 4
        };
        return typeMap[type] || 2;
      };
      
      countQuery += ` AND pic_type = ?`;
      countParams.push(getPicTypeId(picType));
    }
    
    const [countResult] = await executeQuery(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    
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

    // Додаємо URL для зображень (підтримуємо як старі, так і нові зображення)
    const imagesWithUrls = images.map((image: any) => ({
      ...image,
      pic_type: getPicTypeString(image.pic_type), // Convert integer back to string
      url: getImageUrl(image.filename, 'full'),
      thumbnail_url: getImageUrl(image.filename, 'tmb')
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
