import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface AllUser {
  id: number;
  name: string;
  uname: string;
  type: 'editor' | 'journalist' | 'blogger';
  active: number;
}

export async function GET() {
  try {
    // Завантажуємо тільки активних користувачів з a_powerusers (адміністраторів)
    // Це ті самі користувачі, які показуються на сторінці /admin/users
    const [adminUsers] = await executeQuery<{
      id: number;
      name: string;
      uname: string;
      active: number;
    }>(`
      SELECT 
        id, 
        uname_ua as name,
        uname,
        active
      FROM a_powerusers 
      WHERE active = 1
      ORDER BY uname_ua
    `);

    // Всі користувачі з a_powerusers мають тип 'editor'
    const allUsers: AllUser[] = adminUsers.map(user => ({
      id: user.id,
      name: user.name, // Використовуємо поле name з SQL запиту
      uname: user.uname,
      type: 'editor' as const,
      active: user.active
    }));

    return NextResponse.json({
      success: true,
      data: allUsers,
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
