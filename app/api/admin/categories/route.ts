import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface Category {
  id: number;
  title: string;
  cattype: number;
  description?: string;
  param?: string;
  isvis?: number;
  orderid?: number;
  lng?: string;
}

// GET - Отримати всі категорії або з фільтром
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || '1';
    const cattype = searchParams.get('cattype');
    const includeHidden = searchParams.get('includeHidden') === 'true';

    // Завантажуємо дані з бази даних
    let query = `
      SELECT id, title, cattype, param, description, isvis, orderid, lng
      FROM a_cats 
      WHERE lng = ?
    `;

    const params: any[] = [lang];

    // Додаємо фільтр за видимістю
    if (!includeHidden) {
      query += ` AND isvis = 1`;
    }

    // Додаємо фільтр за типом категорії якщо вказано
    if (cattype) {
      query += ` AND cattype = ?`;
      params.push(parseInt(cattype));
    }

    query += ' ORDER BY orderid, id';

    const [categories] = await executeQuery<Category>(query, params);

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

// POST - Створити нову категорію
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, cattype, param, description, isvis = 1, lng = '1' } = body;

    // Валідація
    if (!title || !cattype || !param) {
      return NextResponse.json(
        { success: false, error: 'Title, cattype, and param are required' },
        { status: 400 }
      );
    }

    // Перевірка чи існує категорія з таким param
    const [existing] = await executeQuery<Category>(
      'SELECT id FROM a_cats WHERE param = ? AND lng = ? AND cattype = ?',
      [param, lng, cattype]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Category with this param already exists' },
        { status: 400 }
      );
    }

    // Отримуємо максимальний orderid
    const [maxOrder] = await executeQuery<{ maxOrder: number }>(
      'SELECT MAX(orderid) as maxOrder FROM a_cats WHERE cattype = ?',
      [cattype]
    );
    const orderid = (maxOrder[0]?.maxOrder || 0) + 1;

    // Вставка нової категорії
    const result = await executeQuery(
      `INSERT INTO a_cats (title, cattype, param, description, isvis, orderid, lng) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, cattype, param, description || '', isvis, orderid, lng]
    );

    return NextResponse.json({
      success: true,
      data: {
        id: (result as any).insertId,
        title,
        cattype,
        param,
        description,
        isvis,
        orderid,
        lng
      },
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT - Оновити категорію
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, cattype, param, description, isvis } = body;

    // Валідація
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Перевірка чи існує категорія
    const [existing] = await executeQuery<Category>(
      'SELECT id FROM a_cats WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Перевірка унікальності param (якщо він змінюється)
    if (param) {
      const [duplicate] = await executeQuery<Category>(
        'SELECT id FROM a_cats WHERE param = ? AND id != ? AND cattype = ?',
        [param, id, cattype || existing[0].cattype]
      );

      if (duplicate.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Category with this param already exists' },
          { status: 400 }
        );
      }
    }

    // Оновлення категорії
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (cattype !== undefined) {
      updates.push('cattype = ?');
      values.push(cattype);
    }
    if (param !== undefined) {
      updates.push('param = ?');
      values.push(param);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (isvis !== undefined) {
      updates.push('isvis = ?');
      values.push(isvis);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    await executeQuery(
      `UPDATE a_cats SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Видалити категорію
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Перевірка чи використовується категорія в новинах
    const [newsUsing] = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM a_news 
       WHERE FIND_IN_SET(?, rubric) > 0`,
      [id]
    );

    if (newsUsing[0]?.count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category: it is used in ${newsUsing[0].count} news items`,
          newsCount: newsUsing[0].count
        },
        { status: 400 }
      );
    }

    // Видалення категорії
    await executeQuery('DELETE FROM a_cats WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

// PATCH - Змінити порядок категорій
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, direction } = body;

    if (action === 'reorder' && id && direction) {
      // Отримуємо поточну категорію
      const [current] = await executeQuery<Category>(
        'SELECT * FROM a_cats WHERE id = ?',
        [id]
      );

      if (current.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }

      const currentCat = current[0];

      // Знаходимо сусідню категорію
      const operator = direction === 'up' ? '<' : '>';
      const order = direction === 'up' ? 'DESC' : 'ASC';
      
      const [neighbor] = await executeQuery<Category>(
        `SELECT * FROM a_cats 
         WHERE cattype = ? AND orderid ${operator} ? 
         ORDER BY orderid ${order} LIMIT 1`,
        [currentCat.cattype, currentCat.orderid]
      );

      if (neighbor.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot move category in this direction' },
          { status: 400 }
        );
      }

      const neighborCat = neighbor[0];

      // Міняємо місцями orderid
      await executeQuery(
        'UPDATE a_cats SET orderid = ? WHERE id = ?',
        [neighborCat.orderid, currentCat.id]
      );
      await executeQuery(
        'UPDATE a_cats SET orderid = ? WHERE id = ?',
        [currentCat.orderid, neighborCat.id]
      );

      return NextResponse.json({
        success: true,
        message: 'Category order updated successfully'
      });
    }

    // Зміна видимості
    if (action === 'toggle-visibility' && id) {
      await executeQuery(
        'UPDATE a_cats SET isvis = 1 - isvis WHERE id = ?',
        [id]
      );

      return NextResponse.json({
        success: true,
        message: 'Category visibility toggled successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform operation' },
      { status: 500 }
    );
  }
}
