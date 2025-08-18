import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Query user from database
    const users = await executeQuery(
      'SELECT * FROM a_users WHERE uname = ? AND approved IS NOT NULL',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if password matches (assuming MD5 hash)
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    
    if (user.upass !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is approved
    if (!user.approved) {
      return NextResponse.json(
        { error: 'Account not approved' },
        { status: 403 }
      );
    }

    // Generate a simple token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex');

    // Update last login time
    await executeQuery(
      'UPDATE a_users SET logged = NOW(), logqty = logqty + 1 WHERE id = ?',
      [user.id]
    );

    // Return user data (excluding sensitive information)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.uname,
      services: user.services,
      blogs: user.blogs,
      regdate: user.regdate,
      shortinfo: user.shortinfo,
      avatar: user.avatar,
      ulang: user.ulang
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
