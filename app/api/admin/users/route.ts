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
}

export interface UserFormData {
  uname_ua: string;
  uname: string;
  uagency: string;
  upass: string;
  active: boolean;
  permissions: Record<string, boolean>;
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
        perm
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
    
    // Serialize permissions
    const serializedPermissions = JSON.stringify(body.permissions);

    // Insert new user
    const [result] = await executeQuery(`
      INSERT INTO a_powerusers 
      (uname_ua, uname, uagency, upass, perm, active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      body.uname_ua,
      body.uname,
      body.uagency || '',
      hashedPassword,
      serializedPermissions,
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
