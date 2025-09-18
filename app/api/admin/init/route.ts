import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    const existingAdmin = await executeQuery(
      'SELECT * FROM a_users WHERE uname = ?',
      ['admin']
    );

    if (existingAdmin.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    // Create default admin credentials
    const adminLogin = 'admin';
    const adminPassword = 'admin';
    const hashedPassword = crypto.createHash('md5').update(adminPassword).digest('hex');

    // Insert admin user with all required fields
    await executeQuery(
      `INSERT INTO a_users (
        uname, upass, name, approved, regdate, services, blogs, 
        logqty, shortinfo, avatar, ulang, twowords, humancheck
      ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminLogin,           // uname (username/email)
        hashedPassword,       // upass (MD5 hashed password)
        'Administrator',      // name (display name)
        '1',                  // approved (approval status)
        'admin',              // services
        0,                    // blogs
        0,                    // logqty (login count)
        'Default admin user', // shortinfo
        '',                   // avatar
        1,                    // ulang (Ukrainian language)
        '',                   // twowords (empty string)
        ''                    // humancheck (empty string)
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Default admin user created successfully',
      credentials: {
        login: adminLogin,
        password: adminPassword
      }
    });

  } catch (error) {
    console.error('Admin initialization error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if admin exists
export async function GET() {
  try {
    const existingAdmin = await executeQuery(
      'SELECT uname FROM a_users WHERE uname = ?',
      ['admin']
    );

    return NextResponse.json({
      adminExists: existingAdmin.length > 0,
      message: existingAdmin.length > 0 
        ? 'Admin user exists' 
        : 'No admin user found'
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
