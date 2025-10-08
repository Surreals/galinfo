import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import speakeasy from 'speakeasy';

/**
 * Verify 2FA token and enable 2FA for user
 * This is called after user scans QR code and enters first token
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, token, isLogin = false } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      );
    }

    // Get user's 2FA secret
    const [users] = await executeQuery(
      'SELECT id, twofa_secret, twofa_enabled, backup_codes FROM a_powerusers WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    if (!user.twofa_secret) {
      return NextResponse.json(
        { error: '2FA is not set up for this user' },
        { status: 400 }
      );
    }

    // Check if token is a backup code
    let isBackupCode = false;
    let backupCodes = [];
    
    try {
      backupCodes = user.backup_codes ? JSON.parse(user.backup_codes) : [];
      if (backupCodes.includes(token.toUpperCase())) {
        isBackupCode = true;
        
        // Remove used backup code
        backupCodes = backupCodes.filter((code: string) => code !== token.toUpperCase());
        await executeQuery(
          'UPDATE a_powerusers SET backup_codes = ? WHERE id = ?',
          [JSON.stringify(backupCodes), userId]
        );
      }
    } catch (e) {
      console.error('Error parsing backup codes:', e);
    }

    // Verify token (either OTP or backup code)
    let verified = false;

    if (isBackupCode) {
      verified = true;
    } else {
      // Verify TOTP token
      verified = speakeasy.totp.verify({
        secret: user.twofa_secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps before/after for clock skew
      });
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // If this is initial setup (not login), enable 2FA
    if (!isLogin && !user.twofa_enabled) {
      await executeQuery(
        'UPDATE a_powerusers SET twofa_enabled = 1 WHERE id = ?',
        [userId]
      );
    }

    return NextResponse.json({
      success: true,
      message: isBackupCode ? 'Backup code verified' : 'Token verified',
      remainingBackupCodes: backupCodes.length
    });

  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}

