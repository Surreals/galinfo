import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET() {
  try {
    // Отримуємо час останньої новини (незалежно від статусу публікації)
    const [results] = await executeQuery(`
      SELECT 
        a_news.ndate,
        a_news.ntime,
        a_news.udate,
        a_news_headers.nheader
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.lang = '1'
      ORDER BY a_news.ndate DESC, a_news.ntime DESC 
      LIMIT 1
    `);

    if (results.length === 0) {
      return NextResponse.json({
        lastNewsTime: null,
        message: 'Новин не знайдено'
      });
    }

    const lastNews = results[0];
    
    // Форматуємо час для відображення
    const formatTime = (ndate: string, ntime: string) => {
      try {
        // ndate в форматі "2025-08-12T21:00:00.000Z"
        const date = new Date(ndate);
        
        // Витягуємо час з ntime (формат "15:18:00")
        const [hours, minutes, seconds] = ntime.split(':');
        
        // Встановлюємо час з ntime
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        
        return date.toLocaleString('uk-UA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (error) {
        return 'Невідомий час';
      }
    };

    const formattedTime = formatTime(lastNews.ndate, lastNews.ntime);

    return NextResponse.json({
      lastNewsTime: formattedTime,
      lastNewsTitle: lastNews.nheader,
      udate: lastNews.udate
    });

  } catch (error) {
    console.error('Error fetching last news time:', error);
    return NextResponse.json(
      { error: 'Failed to fetch last news time' },
      { status: 500 }
    );
  }
}
