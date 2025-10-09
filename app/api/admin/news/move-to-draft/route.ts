import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

// PUT method for moving news to draft (approved = false)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get('id');
    
    if (!newsId) {
      return NextResponse.json(
        { error: 'News ID is required' },
        { status: 400 }
      );
    }
    
    // Перевіряємо, чи існує новина
    const checkQuery = `
      SELECT a_news.id, a_news_headers.nheader, a_news.approved
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id 
      WHERE a_news.id = ?
    `;
    const [checkResult] = await executeQuery(checkQuery, [newsId]);
    
    if (!checkResult || checkResult.length === 0) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }
    
    const newsItem = checkResult[0];
    
    // Якщо новина вже в чернетках, повертаємо помилку
    if (!newsItem.approved) {
      return NextResponse.json(
        { error: 'News is already in drafts' },
        { status: 400 }
      );
    }
    
    // Оновлюємо статус новини на чернетку
    const updateQuery = 'UPDATE a_news SET approved = 0 WHERE id = ?';
    await executeQuery(updateQuery, [newsId]);
    
    return NextResponse.json({
      success: true,
      message: 'News moved to drafts successfully',
      movedNews: {
        id: newsId,
        title: newsItem.nheader
      }
    });
    
  } catch (error) {
    console.error('Error moving news to draft:', error);
    return NextResponse.json(
      { error: 'Failed to move news to drafts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

