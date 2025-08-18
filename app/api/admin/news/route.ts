import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const params = searchParams.get('params');

    if (!query || !params) {
      return NextResponse.json(
        { error: 'Query and params are required' },
        { status: 400 }
      );
    }

    let parsedParams;
    try {
      parsedParams = JSON.parse(params);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid params format' },
        { status: 400 }
      );
    }

    // Execute the query
    const news = await executeQuery(query, parsedParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    
    // Extract search and filter conditions from the original query
    if (query.includes('nheader LIKE ?')) {
      countQuery += ` AND (a_news_headers.nheader LIKE ? OR a_news_headers.nteaser LIKE ?)`;
      countParams.push(parsedParams[0], parsedParams[1]);
    }
    
    if (query.includes('approved = ?')) {
      const approvedIndex = query.includes('nheader LIKE ?') ? 2 : 0;
      countQuery += ` AND a_news.approved = ?`;
      countParams.push(parsedParams[approvedIndex]);
    }
    
    if (query.includes('ntype = ?')) {
      const typeIndex = query.includes('nheader LIKE ?') ? (query.includes('approved = ?') ? 3 : 2) : (query.includes('approved = ?') ? 1 : 0);
      countQuery += ` AND a_news.ntype = ?`;
      countParams.push(parsedParams[typeIndex]);
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      news: news,
      total: total,
      message: 'News fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
