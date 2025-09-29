import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { login, email, password } = await request.json();
    
    // Accept either 'login' or 'email' parameter for backward compatibility
    const userLogin = login || email;

    if (!userLogin || !password) {
      return NextResponse.json(
        { error: 'Login and password are required' },
        { status: 400 }
      );
    }

    // Query admin user from database (a_powerusers table)
    const [users] = await executeQuery(
      'SELECT * FROM a_powerusers WHERE uname = ? AND active = 1',
      [userLogin]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid login or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if password matches (assuming MD5 hash)
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    
    if (user.upass !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid login or password' },
        { status: 401 }
      );
    }

    // Generate a simple token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex');

    // Note: IP tracking removed as lastip column doesn't exist in a_powerusers table
    // In a production environment, you might want to add this column or use a separate logging table

    // Return user data (excluding sensitive information)
    const userData = {
      id: user.id,
      name: user.uname_ua,
      email: user.uname,
      agency: user.uagency,
      permissions: user.perm,
      active: user.active
    };

    return NextResponse.json({
      success: true,
      user: userData,
      token: token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
