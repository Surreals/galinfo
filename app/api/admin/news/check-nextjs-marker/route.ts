import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get('id');

    if (newsId) {
      // Check specific news item
      const [result] = await executeQuery(
        'SELECT id, nheader, _stage FROM a_news WHERE id = ?',
        [newsId]
      );

      if (!result || (result as any[]).length === 0) {
        return NextResponse.json(
          { error: 'News item not found' },
          { status: 404 }
        );
      }

      const news = (result as any[])[0];
      const isFromNextJS = news._stage === 99;

      return NextResponse.json({
        newsId: news.id,
        title: news.nheader,
        _stage: news._stage,
        isFromNextJS: isFromNextJS,
        message: isFromNextJS 
          ? 'This news was created/edited from Next.js app' 
          : 'This news was not created/edited from Next.js app'
      });
    } else {
      // Get statistics
      const [totalResult] = await executeQuery(
        'SELECT COUNT(*) as total FROM a_news'
      );
      
      const [nextjsResult] = await executeQuery(
        'SELECT COUNT(*) as nextjs_count FROM a_news WHERE _stage = 99'
      );

      const total = (totalResult as any[])[0]?.total || 0;
      const nextjsCount = (nextjsResult as any[])[0]?.nextjs_count || 0;

      return NextResponse.json({
        totalNews: total,
        nextjsNews: nextjsCount,
        percentage: total > 0 ? Math.round((nextjsCount / total) * 100) : 0,
        message: `${nextjsCount} out of ${total} news items were created/edited from Next.js app`
      });
    }

  } catch (error) {
    console.error('Error checking Next.js marker:', error);
    return NextResponse.json(
      { error: 'Failed to check marker' },
      { status: 500 }
    );
  }
}
