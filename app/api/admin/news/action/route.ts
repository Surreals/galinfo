import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { newsId, action } = await request.json();

    if (!newsId || !action) {
      return NextResponse.json(
        { error: 'News ID and action are required' },
        { status: 400 }
      );
    }

    let query = '';
    let params: any[] = [];

    switch (action) {
      case 'approve':
        query = 'UPDATE a_news SET approved = 1 WHERE id = ?';
        params = [newsId];
        break;
        
      case 'reject':
        query = 'UPDATE a_news SET approved = 0 WHERE id = ?';
        params = [newsId];
        break;
        
      case 'delete':
        // First delete related records, then the main news record
        await executeQuery('DELETE FROM a_news_headers WHERE id = ?', [newsId]);
        await executeQuery('DELETE FROM a_news_slideheaders WHERE id = ?', [newsId]);
        await executeQuery('DELETE FROM a_news_specialids WHERE newsid = ?', [newsId]);
        await executeQuery('DELETE FROM a_statcomm WHERE id = ?', [newsId]);
        await executeQuery('DELETE FROM a_statview WHERE id = ?', [newsId]);
        
        query = 'DELETE FROM a_news WHERE id = ?';
        params = [newsId];
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Execute the action
    await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      message: `News ${action}d successfully`,
      action: action,
      newsId: newsId
    });

  } catch (error) {
    console.error('Error performing news action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
