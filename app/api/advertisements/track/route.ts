import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export const dynamic = 'force-dynamic';

// POST - Track advertisement view
export async function POST(request: NextRequest) {
  try {
    const { id, type } = await request.json();

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: 'Advertisement ID and type are required' },
        { status: 400 }
      );
    }

    if (!['view', 'click'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be "view" or "click"' },
        { status: 400 }
      );
    }

    const column = type === 'view' ? 'view_count' : 'click_count';
    
    await pool.query(
      `UPDATE advertisements SET ${column} = ${column} + 1 WHERE id = ?`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking advertisement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track advertisement' },
      { status: 500 }
    );
  }
}

