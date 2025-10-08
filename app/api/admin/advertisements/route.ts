import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface Advertisement extends RowDataPacket {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string;
  is_active: boolean;
  display_order: number;
  click_count: number;
  view_count: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

// GET - Get all advertisements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = 'SELECT * FROM advertisements';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY display_order ASC, created_at DESC';

    const [advertisements] = await pool.query<Advertisement[]>(query);

    return NextResponse.json({
      success: true,
      data: advertisements,
    });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
}

// POST - Create new advertisement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      image_url,
      link_url,
      is_active = true,
      display_order = 0,
      start_date,
      end_date,
    } = body;

    // Validation
    if (!title || !link_url) {
      return NextResponse.json(
        { success: false, error: 'Title and link URL are required' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO advertisements 
      (title, image_url, link_url, is_active, display_order, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query<ResultSetHeader>(query, [
      title,
      image_url || null,
      link_url,
      is_active,
      display_order,
      start_date || null,
      end_date || null,
    ]);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertId,
        title,
        image_url,
        link_url,
        is_active,
        display_order,
        start_date,
        end_date,
      },
    });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create advertisement' },
      { status: 500 }
    );
  }
}

// PUT - Update advertisement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      image_url,
      link_url,
      is_active,
      display_order,
      start_date,
      end_date,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Advertisement ID is required' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE advertisements 
      SET title = ?, 
          image_url = ?, 
          link_url = ?, 
          is_active = ?, 
          display_order = ?,
          start_date = ?,
          end_date = ?
      WHERE id = ?
    `;

    await pool.query(query, [
      title,
      image_url || null,
      link_url,
      is_active,
      display_order,
      start_date || null,
      end_date || null,
      id,
    ]);

    return NextResponse.json({
      success: true,
      data: { id, title, image_url, link_url, is_active, display_order },
    });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update advertisement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete advertisement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Advertisement ID is required' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM advertisements WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Advertisement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete advertisement' },
      { status: 500 }
    );
  }
}

