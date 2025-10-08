import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { login, email, password, twoFactorCode } = await request.json();
    
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

    // Check if 2FA is enabled for this user
    const twoFactorEnabled = user.twofa_enabled === 1;

    // If 2FA is enabled and no code provided, require 2FA
    if (twoFactorEnabled && !twoFactorCode) {
      return NextResponse.json({
        success: false,
        requiresTwoFactor: true,
        userId: user.id,
        message: '2FA code required'
      });
    }

    // If 2FA is enabled and code provided, verify it
    if (twoFactorEnabled && twoFactorCode) {
      const verifyResponse = await fetch(`${request.nextUrl.origin}/api/admin/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          token: twoFactorCode,
          isLogin: true
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 401 }
        );
      }
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
      active: user.active,
      role: user.role || 'journalist'
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
