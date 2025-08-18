import { NextRequest, NextResponse } from 'next/server';
import { testConnection, executeQuery } from '@/app/lib/db';

export async function GET() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Test a simple query
    const result = await executeQuery('SELECT 1 as test, NOW() as current_time_stamp');
    
    return NextResponse.json({
      message: 'Database connection successful!',
      connection: 'OK',
      testQuery: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, params } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }
    
    // Execute custom query
    const result = await executeQuery(query, params || []);
    
    return NextResponse.json({
      message: 'Query executed successfully',
      result,
      query,
      params: params || []
    });
    
  } catch (error) {
    console.error('Query Error:', error);
    return NextResponse.json(
      { error: 'Query execution failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
