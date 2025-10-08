import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Enable 2FA for admin user
 * Generates secret and QR code for Google Authenticator
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user data
    const [users] = await executeQuery(
      'SELECT id, uname, uname_ua, twofa_enabled FROM a_powerusers WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Generate secret for 2FA
    const secret = speakeasy.generateSecret({
      name: `GalInfo (${user.uname_ua || user.uname})`,
      issuer: 'GalInfo Admin',
      length: 32
    });

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes (10 codes, each 8 characters)
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Save secret and backup codes to database (but don't enable 2FA yet)
    await executeQuery(
      `UPDATE a_powerusers 
       SET twofa_secret = ?, 
           backup_codes = ?,
           twofa_enabled = 0
       WHERE id = ?`,
      [secret.base32, JSON.stringify(backupCodes), userId]
    );

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      backupCodes: backupCodes,
      otpauth_url: secret.otpauth_url
    });

  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}

