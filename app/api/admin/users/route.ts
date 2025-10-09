import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import crypto from 'crypto';

export interface AdminUser {
  id: number;
  uname_ua: string;
  uname: string;
  uagency: string;
  active: number;
  perm: string;
  role: string;
}

export interface UserFormData {
  uname_ua: string;
  uname: string;
  uagency: string;
  upass: string;
  active: boolean;
  permissions?: Record<string, boolean>; // Made optional since it's auto-assigned
  role: string;
}

/**
 * Maps user roles to their corresponding permissions
 * Based on requirements:
 * - Administrator: access to all admin functions
 * - Editor: can create, edit, publish news/articles/media, can only move to drafts (not fully delete)
 * - Journalist: can create, edit news/articles/media but only save to drafts (cannot publish)
 */
function getRolePermissions(role: string): Record<string, boolean> {
  switch (role) {
    case 'admin':
      // Адміністратор - доступ до всіх функцій адмінки
      return {
        ac_usermanage: true,      // Управління користувачами
        ac_newsmanage: true,       // Управління новинами
        ac_articlemanage: true,    // Управління статтями
        ac_commentmanage: true,    // Управління коментарями
        ac_sitemanage: true,       // Управління сайтом
        ac_admanage: true,         // Управління рекламою
        ac_telegrammanage: true,   // Управління Telegram
      };
    
    case 'editor':
      // Редактор - доступ до створення, редагування, публікації новин/статей/медіа
      // Видалення новини тільки в чернетки
      return {
        ac_usermanage: false,
        ac_newsmanage: true,       // Управління новинами (створення, редагування, публікація)
        ac_articlemanage: true,    // Управління статтями
        ac_commentmanage: true,    // Управління коментарями
        ac_sitemanage: false,
        ac_admanage: false,
        ac_telegrammanage: false,
      };
    
    case 'journalist':
      // Журналіст - доступ до створення, редагування новин/статей/медіа
      // Розміщення тільки в чернетках
      return {
        ac_usermanage: false,
        ac_newsmanage: true,       // Управління новинами (тільки чернетки)
        ac_articlemanage: true,    // Управління статтями (тільки чернетки)
        ac_commentmanage: false,
        ac_sitemanage: false,
        ac_admanage: false,
        ac_telegrammanage: false,
      };
    
    default:
      // За замовчуванням - мінімальні права
      return {
        ac_usermanage: false,
        ac_newsmanage: false,
        ac_articlemanage: false,
        ac_commentmanage: false,
        ac_sitemanage: false,
        ac_admanage: false,
        ac_telegrammanage: false,
      };
  }
}

export async function GET() {
  try {
    // Завантажуємо адміністративних користувачів з бази даних
    const [users] = await executeQuery<AdminUser>(`
      SELECT 
        id, 
        uname_ua,
        uname,
        uagency,
        active,
        perm,
        role
      FROM a_powerusers 
      ORDER BY uname_ua
    `);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: UserFormData = await request.json();
    
    // Validate required fields
    if (!body.uname_ua || !body.uname || !body.upass) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    const role = body.role || 'journalist';
    if (!['admin', 'editor', 'journalist'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const [existingUsers] = await executeQuery<{ count: number }>(`
      SELECT COUNT(*) as count FROM a_powerusers WHERE uname = ?
    `, [body.uname]);

    if (existingUsers[0].count > 0) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = crypto.createHash('md5').update(body.upass).digest('hex');
    
    // Auto-assign permissions based on role
    const permissions = getRolePermissions(role);
    const serializedPermissions = JSON.stringify(permissions);

    // Insert new user
    const [result] = await executeQuery(`
      INSERT INTO a_powerusers 
      (uname_ua, uname, uagency, upass, perm, role, active) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      body.uname_ua,
      body.uname,
      body.uagency || '',
      hashedPassword,
      serializedPermissions,
      role,
      body.active ? 1 : 0
    ]);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: { id: (result as any).insertId }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
