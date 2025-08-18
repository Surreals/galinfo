import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return connection configuration info (without sensitive data)
    return NextResponse.json({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || '3306',
      database: process.env.DB_NAME || 'galinfodb_db',
      user: process.env.DB_USER || 'root',
      environment: process.env.NODE_ENV || 'development',
      ssl: false, // SSL is currently disabled
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Connection Info Error:', error);
    return NextResponse.json(
      { error: 'Failed to get connection info' },
      { status: 500 }
    );
  }
}
