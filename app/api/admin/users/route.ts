import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface User {
  id: number;
  name: string;
  type: 'editor' | 'journalist' | 'blogger';
}

export async function GET() {
  try {
    // Завантажуємо користувачів з бази даних
    const users = await executeQuery<User>(`
      SELECT id, name, 
             CASE 
               WHEN services LIKE '%1%' THEN 'editor'
               WHEN services LIKE '%2%' THEN 'journalist' 
               WHEN services LIKE '%3%' THEN 'blogger'
               ELSE 'journalist'
             END as type
      FROM a_users 
      WHERE services != ''
      ORDER BY name
    `);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
