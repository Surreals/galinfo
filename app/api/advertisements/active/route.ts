import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface Advertisement extends RowDataPacket {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string;
  display_order: number;
}

// GET - Get active advertisements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const query = `
      SELECT id, title, image_url, link_url, display_order
      FROM advertisements
      WHERE is_active = true
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY display_order ASC, RAND()
      LIMIT ?
    `;

    const [advertisements] = await pool.query<Advertisement[]>(query, [limit]);

    return NextResponse.json({
      success: true,
      data: advertisements,
    });
  } catch (error) {
    console.error('Error fetching active advertisements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
}

