import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsId = parseInt(id);

    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    // Fetch news data from all related tables
    const [newsResult] = await executeQuery(
      `SELECT * FROM a_news WHERE id = ?`,
      [newsId]
    );

    if (!newsResult) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    // Fetch news headers
    const [headersResult] = await executeQuery(
      `SELECT * FROM a_news_headers WHERE id = ?`,
      [newsId]
    );

    // Fetch news body
    const [bodyResult] = await executeQuery(
      `SELECT * FROM a_news_body WHERE id = ?`,
      [newsId]
    );

    // Convert date format for the frontend
    const newsData = {
      ...newsResult,
      ndate: newsResult.ndate ? new Date(newsResult.ndate).toISOString().split('T')[0] : '',
      ntime: newsResult.ntime || '00:00:00'
    };

    const headers = headersResult || {
      id: newsId,
      nheader: '',
      nteaser: '',
      nsubheader: '',
      _stage: 0
    };

    const body = bodyResult || {
      id: newsId,
      nbody: ''
    };

    return NextResponse.json({
      success: true,
      data: {
        news: newsData,
        headers: headers,
        body: body
      }
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
