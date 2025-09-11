import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface Category {
  id: number;
  title: string;
  cattype: number;
  description?: string;
  param?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'ua';
    const cattype = searchParams.get('cattype');

    // Завантажуємо дані з бази даних
    let query = `
      SELECT id, title, cattype, param,
             CASE 
               WHEN cattype = 1 THEN 'Суспільні новини'
               WHEN cattype = 2 THEN 'Освітні теми'
               WHEN cattype = 3 THEN 'Регіональні новини'
               WHEN cattype = 4 THEN 'Рейтингові категорії'
               ELSE ''
             END as description
      FROM a_cats 
      WHERE isvis = 1 AND lng = "1"
    `;

    // Додаємо фільтр за типом категорії якщо вказано
    if (cattype) {
      const cattypeNum = parseInt(cattype);
      query += ` AND cattype = ${cattypeNum}`;
    }

    query += ' ORDER BY orderid, id';

    const categories = await executeQuery<Category>(query);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
