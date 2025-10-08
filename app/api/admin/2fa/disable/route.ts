import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import speakeasy from 'speakeasy';
import crypto from 'crypto';

/**
 * Disable 2FA for admin user
 * Requires password confirmation or backup code
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, password, token } = await request.json();

    if (!userId || (!password && !token)) {
      return NextResponse.json(
        { error: 'User ID and either password or token are required' },
        { status: 400 }
      );
    }

    // Get user data
    const [users] = await executeQuery(
      'SELECT id, upass, twofa_secret, twofa_enabled, backup_codes FROM a_powerusers WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Verify password or token
    let verified = false;

    if (password) {
      // Verify password
      const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
      verified = user.upass === hashedPassword;
    } else if (token && user.twofa_secret) {
      // Check if it's a backup code
      try {
        const backupCodes = user.backup_codes ? JSON.parse(user.backup_codes) : [];
        if (backupCodes.includes(token.toUpperCase())) {
          verified = true;
        } else {
          // Verify TOTP token
          verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: 'base32',
            token: token,
            window: 2
          });
        }
      } catch (e) {
        console.error('Error verifying token:', e);
      }
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid password or token' },
        { status: 401 }
      );
    }

    // Disable 2FA and clear data
    await executeQuery(
      `UPDATE a_powerusers 
       SET twofa_secret = NULL, 
           twofa_enabled = 0,
           backup_codes = NULL
       WHERE id = ?`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}

