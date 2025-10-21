import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'galinfo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET - Отримати список тегів з пагінацією та фільтрацією
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const perPage = parseInt(searchParams.get('perPage') || '100');
    const keyword = searchParams.get('keyword') || '';
    const newsId = searchParams.get('newsId') || '';

    let whereClauses: string[] = ['1=1'];
    const params: any[] = [];

    // Фільтр по ключовому слову
    if (keyword) {
      // Нормалізуємо ключове слово для пошуку
      const normalizedKeyword = keyword.trim();
      whereClauses.push('LOWER(a_tags.tag) LIKE LOWER(?)');
      params.push(`%${normalizedKeyword}%`);
      
      // Додаємо логування для дебагу
      console.log('Tag search filter:', {
        keyword: normalizedKeyword,
        whereClause: whereClauses.join(' AND '),
        params
      });
    }

    // Фільтр по ID новини
    if (newsId) {
      whereClauses.push('a_tags_map.newsid = ?');
      params.push(parseInt(newsId));
    }

    const whereClause = whereClauses.join(' AND ');

    // Підрахунок загальної кількості
    const [countResult] = await pool.query<any[]>(
      `SELECT COUNT(DISTINCT a_tags.id) as total
       FROM a_tags 
       LEFT JOIN a_tags_map ON a_tags.id = a_tags_map.tagid
       WHERE ${whereClause}`,
      params
    );

    const total = countResult[0]?.total || 0;

    // Отримання даних з пагінацією
    const offset = page * perPage;
    
    // Покращене сортування для пошуку тегів
    let orderByClause = 'a_tags.tag'; // За замовчуванням алфавітне сортування
    let queryParams = [...params];
    
    if (keyword) {
      const normalizedKeyword = keyword.trim();
      // Створюємо рейтинг релевантності для пошуку
      orderByClause = `
        CASE 
          WHEN LOWER(a_tags.tag) = LOWER(?) THEN 1
          WHEN LOWER(a_tags.tag) LIKE LOWER(?) THEN 2
          WHEN LOWER(a_tags.tag) LIKE LOWER(?) THEN 3
          ELSE 4
        END,
        COUNT(a_tags_map.newsid) DESC,
        a_tags.tag
      `;
      // Додаємо параметри для сортування
      queryParams.push(normalizedKeyword, `${normalizedKeyword}%`, `%${normalizedKeyword}%`);
      
      // Додаємо логування для дебагу
      console.log('Tag search params:', {
        keyword: normalizedKeyword,
        params: queryParams,
        orderByClause
      });
    } else {
      // Якщо немає пошуку, сортуємо за кількістю новин, потім за алфавітом
      orderByClause = 'COUNT(a_tags_map.newsid) DESC, a_tags.tag';
    }
    
    const [rows] = await pool.query<any[]>(
      `SELECT 
        a_tags.id,
        a_tags.tag,
        COUNT(a_tags_map.newsid) as newsCount
       FROM a_tags 
       LEFT JOIN a_tags_map ON a_tags.id = a_tags_map.tagid
       WHERE ${whereClause}
       GROUP BY a_tags.id
       ORDER BY ${orderByClause}
       LIMIT ? OFFSET ?`,
      [...queryParams, perPage, offset]
    );

    // Логування результатів для дебагу
    if (keyword) {
      console.log('Tag search results:', {
        keyword,
        results: rows.map(r => ({ tag: r.tag, newsCount: r.newsCount })),
        total: rows.length
      });
    }

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage)
      }
    });

  } catch (error: any) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Помилка отримання тегів' },
      { status: 500 }
    );
  }
}

// POST - Створити новий тег
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag } = body;

    if (!tag || !tag.trim()) {
      return NextResponse.json(
        { success: false, error: 'Назва тегу обов\'язкова' },
        { status: 400 }
      );
    }

    // Перевірка на дублікати
    const [existing] = await pool.query<any[]>(
      'SELECT id FROM a_tags WHERE tag = ?',
      [tag.trim()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Тег з такою назвою вже існує' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<any>(
      'INSERT INTO a_tags (tag) VALUES (?)',
      [tag.trim()]
    );

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertId,
        tag: tag.trim()
      },
      message: 'Тег успішно створено'
    });

  } catch (error: any) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Помилка створення тегу' },
      { status: 500 }
    );
  }
}

// PUT - Оновити тег
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, tag } = body;

    if (!id || !tag || !tag.trim()) {
      return NextResponse.json(
        { success: false, error: 'ID та назва тегу обов\'язкові' },
        { status: 400 }
      );
    }

    // Перевірка існування тегу
    const [existing] = await pool.query<any[]>(
      'SELECT id FROM a_tags WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Тег не знайдено' },
        { status: 404 }
      );
    }

    // Перевірка на дублікати (виключаючи поточний тег)
    const [duplicate] = await pool.query<any[]>(
      'SELECT id FROM a_tags WHERE tag = ? AND id != ?',
      [tag.trim(), id]
    );

    if (duplicate.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Тег з такою назвою вже існує' },
        { status: 400 }
      );
    }

    await pool.query(
      'UPDATE a_tags SET tag = ? WHERE id = ?',
      [tag.trim(), id]
    );

    return NextResponse.json({
      success: true,
      message: 'Тег успішно оновлено'
    });

  } catch (error: any) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Помилка оновлення тегу' },
      { status: 500 }
    );
  }
}

// DELETE - Видалити тег
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const replaceId = searchParams.get('replaceId');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID тегу обов\'язковий' },
        { status: 400 }
      );
    }

    // Перевірка існування тегу
    const [existing] = await pool.query<any[]>(
      'SELECT id, tag FROM a_tags WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Тег не знайдено' },
        { status: 404 }
      );
    }

    // Якщо потрібно замінити тег на інший перед видаленням
    if (replaceId) {
      // Перевірка існування тегу-замінника
      const [replaceTag] = await pool.query<any[]>(
        'SELECT id FROM a_tags WHERE id = ?',
        [replaceId]
      );

      if (replaceTag.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Тег-замінник не знайдено' },
          { status: 404 }
        );
      }

      // Видалити дублікати (новини, які вже мають обидва теги)
      await pool.query(
        `DELETE FROM a_tags_map 
         WHERE newsid IN (
           SELECT id FROM (
             SELECT a.newsid AS id
             FROM a_tags_map a
             JOIN a_tags_map a2 ON a.newsid = a2.newsid
             WHERE a.tagid = ? AND a2.tagid = ?
           ) AS tmp
         ) AND tagid = ?`,
        [id, replaceId, id]
      );

      // Замінити тег у решті новин
      await pool.query(
        'UPDATE a_tags_map SET tagid = ? WHERE tagid = ?',
        [replaceId, id]
      );
    }

    // Видалити тег та його зв'язки
    await pool.query(
      'DELETE a_tags, a_tags_map FROM a_tags LEFT JOIN a_tags_map ON a_tags.id = a_tags_map.tagid WHERE a_tags.id = ?',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Тег успішно видалено'
    });

  } catch (error: any) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Помилка видалення тегу' },
      { status: 500 }
    );
  }
}
