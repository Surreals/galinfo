import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface UserForFilter {
  id: number;
  name: string;
  uname: string;
  type: 'editor' | 'journalist' | 'blogger';
  active: number;
  isActive?: boolean;
}

export async function GET() {
  try {
    // Завантажуємо всіх користувачів з a_powerusers (включаючи неактивних)
    // Це для фільтрів, де потрібно показати всіх користувачів
    const [allUsers] = await executeQuery<{
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
      ORDER BY uname_ua
    `);

    // Всі користувачі з a_powerusers мають тип 'editor'
    const usersForFilters: UserForFilter[] = allUsers.map(user => ({
      id: user.id,
      name: user.name,
      uname: user.uname,
      type: 'editor' as const,
      active: user.active,
      isActive: user.active === 1
    }));

    return NextResponse.json({
      success: true,
      data: usersForFilters,
    });
  } catch (error) {
    console.error('Error fetching users for filters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users for filters' },
      { status: 500 }
    );
  }
}
