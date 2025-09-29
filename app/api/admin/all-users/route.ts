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
    // Завантажуємо всіх користувачів з обох таблиць
    const [regularUsers] = await executeQuery<{
      id: number;
      name: string;
      uname: string;
      _usertype: string | null;
      approved: string;
    }>(`
      SELECT 
        id, 
        name,
        uname,
        _usertype,
        approved
      FROM a_users 
      ORDER BY name
    `);

    const [adminUsers] = await executeQuery<{
      id: number;
      uname_ua: string;
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

    // Об'єднуємо користувачів і визначаємо їх типи
    const allUsers: AllUser[] = [
      // Адміністратори (редактори)
      ...adminUsers.map(user => ({
        id: user.id,
        name: user.name,
        uname: user.uname,
        type: 'editor' as const,
        active: user.active
      })),
      // Звичайні користувачі
      ...regularUsers.map(user => {
        // Визначаємо тип користувача на основі _usertype або інших критеріїв
        let userType: 'editor' | 'journalist' | 'blogger' = 'journalist';
        
        if (user._usertype === 'blogger' || user._usertype === 'блогер') {
          userType = 'blogger';
        } else if (user._usertype === 'editor' || user._usertype === 'редактор') {
          userType = 'editor';
        } else {
          // За замовчуванням - журналіст
          userType = 'journalist';
        }

        return {
          id: user.id,
          name: user.name,
          uname: user.uname,
          type: userType,
          active: 1 // Всі схвалені користувачі вважаються активними
        };
      })
    ];

    // Сортуємо за іменем
    allUsers.sort((a, b) => a.name.localeCompare(b.name, 'uk'));

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
