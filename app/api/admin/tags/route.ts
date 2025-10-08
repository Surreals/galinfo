import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface Tag {
  id: number;
  tag: string;
  usage_count?: number;
}

// GET - Отримати всі теги
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const withUsageCount = searchParams.get('withUsageCount') === 'true';

    let query = `
      SELECT a_tags.id, a_tags.tag
      ${withUsageCount ? ', COUNT(a_tagmap.newsid) as usage_count' : ''}
      FROM a_tags
      ${withUsageCount ? 'LEFT JOIN a_tagmap ON a_tags.id = a_tagmap.tagid' : ''}
    `;

    const params: any[] = [];

    if (search) {
      query += ' WHERE a_tags.tag LIKE ?';
      params.push(`%${search}%`);
    }

    if (withUsageCount) {
      query += ' GROUP BY a_tags.id';
    }

    query += ' ORDER BY a_tags.tag';

    const tags = await executeQuery<Tag>(query, params);

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST - Створити новий тег
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag } = body;

    // Валідація
    if (!tag || !tag.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Перевірка чи існує тег з такою назвою
    const existing = await executeQuery<Tag>(
      'SELECT id FROM a_tags WHERE tag = ?',
      [tag.trim()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Tag with this name already exists' },
        { status: 400 }
      );
    }

    // Вставка нового тегу
    const result = await executeQuery(
      'INSERT INTO a_tags (tag) VALUES (?)',
      [tag.trim()]
    );

    return NextResponse.json({
      success: true,
      data: {
        id: (result as any).insertId,
        tag: tag.trim()
      },
      message: 'Tag created successfully'
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}

// PUT - Оновити тег
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, tag } = body;

    // Валідація
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    if (!tag || !tag.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Перевірка чи існує тег
    const existing = await executeQuery<Tag>(
      'SELECT id FROM a_tags WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Перевірка унікальності назви
    const duplicate = await executeQuery<Tag>(
      'SELECT id FROM a_tags WHERE tag = ? AND id != ?',
      [tag.trim(), id]
    );

    if (duplicate.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Tag with this name already exists' },
        { status: 400 }
      );
    }

    // Оновлення тегу
    await executeQuery(
      'UPDATE a_tags SET tag = ? WHERE id = ?',
      [tag.trim(), id]
    );

    return NextResponse.json({
      success: true,
      message: 'Tag updated successfully'
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// DELETE - Видалити тег
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const replaceWithId = searchParams.get('replaceWithId');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    // Перевірка чи використовується тег
    const usage = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) as count FROM a_tagmap WHERE tagid = ?',
      [id]
    );

    const usageCount = usage[0]?.count || 0;

    if (usageCount > 0 && !replaceWithId) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete tag: it is used in ${usageCount} news items. Please specify a replacement tag.`,
          usageCount
        },
        { status: 400 }
      );
    }

    // Якщо вказано тег для заміни
    if (replaceWithId && usageCount > 0) {
      // Перевірка чи існує тег для заміни
      const replaceTag = await executeQuery<Tag>(
        'SELECT id FROM a_tags WHERE id = ?',
        [replaceWithId]
      );

      if (replaceTag.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Replacement tag not found' },
          { status: 404 }
        );
      }

      // Видаляємо дублікати (якщо новина вже має тег для заміни)
      await executeQuery(
        `DELETE FROM a_tagmap WHERE newsid IN (
          SELECT id FROM (
            SELECT a.newsid AS id
            FROM a_tagmap a
            JOIN a_tagmap a2 ON a.newsid = a2.newsid
            WHERE a.tagid = ? AND a2.tagid = ?
          ) AS tmp
        ) AND tagid = ?`,
        [id, replaceWithId, id]
      );

      // Замінюємо тег у всіх новинах
      await executeQuery(
        'UPDATE a_tagmap SET tagid = ? WHERE tagid = ?',
        [replaceWithId, id]
      );
    } else if (usageCount > 0) {
      // Видаляємо всі зв'язки з новинами
      await executeQuery(
        'DELETE FROM a_tagmap WHERE tagid = ?',
        [id]
      );
    }

    // Видалення тегу
    await executeQuery('DELETE FROM a_tags WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
