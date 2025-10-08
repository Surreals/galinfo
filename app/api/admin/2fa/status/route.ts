import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

/**
 * Check 2FA status for admin user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's 2FA status
    const [users] = await executeQuery(
      'SELECT id, twofa_enabled, backup_codes FROM a_powerusers WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];
    
    let backupCodesCount = 0;
    try {
      if (user.backup_codes) {
        const codes = JSON.parse(user.backup_codes);
        backupCodesCount = codes.length;
      }
    } catch (e) {
      console.error('Error parsing backup codes:', e);
    }

    return NextResponse.json({
      enabled: user.twofa_enabled === 1,
      backupCodesCount: backupCodesCount
    });

  } catch (error) {
    console.error('2FA status error:', error);
    return NextResponse.json(
      { error: 'Failed to get 2FA status' },
      { status: 500 }
    );
  }
}

