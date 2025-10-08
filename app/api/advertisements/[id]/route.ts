import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface Advertisement extends RowDataPacket {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string;
  placement: string;
  display_order: number;
}

// GET - Get advertisement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const query = `
      SELECT id, title, image_url, link_url, placement, display_order
      FROM advertisements
      WHERE id = ?
        AND is_active = true
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    `;

    const [advertisements] = await pool.query<Advertisement[]>(query, [id]);

    // Якщо знайдено рекламу - збільшуємо лічильник показів
    if (advertisements.length > 0) {
      await pool.query(
        'UPDATE advertisements SET view_count = view_count + 1 WHERE id = ?',
        [id]
      );
    }

    return NextResponse.json({
      success: true,
      data: advertisements.length > 0 ? advertisements[0] : null,
    });
  } catch (error) {
    console.error('Error fetching advertisement by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch advertisement' },
      { status: 500 }
    );
  }
}
