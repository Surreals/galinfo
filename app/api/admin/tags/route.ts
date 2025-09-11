import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface Tag {
  id: number;
  tag: string;
}

export async function GET() {
  try {
    // Завантажуємо теги з бази даних
    const tags = await executeQuery<Tag>(`
      SELECT id, tag
      FROM a_tags 
      ORDER BY tag
    `);

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
