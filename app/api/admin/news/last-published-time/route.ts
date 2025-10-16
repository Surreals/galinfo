import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET() {
  try {
    // Отримуємо час останньої опублікованої новини (approved = 1)
    const [results] = await executeQuery(`
      SELECT 
        DATE_FORMAT(a_news.ndate, '%Y-%m-%d') as ndate,
        a_news.ntime,
        a_news.udate,
        a_news_headers.nheader
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.lang = '1' AND a_news.approved = 1
      ORDER BY a_news.ndate DESC, a_news.ntime DESC 
      LIMIT 1
    `);

    if (results.length === 0) {
      return NextResponse.json({
        lastPublishedTime: null,
        message: 'Опублікованих новин не знайдено'
      });
    }

    const lastPublished = results[0];
    
    // Форматуємо час для відображення
    const formatTime = (ndate: string, ntime: string) => {
      try {
        // ndate в форматі "2025-10-16" (YYYY-MM-DD)
        // ntime в форматі "12:21:50" (UTC час)
        
        // Створюємо дату з UTC часу і додаємо Z для вказування UTC
        const date = new Date(`${ndate}T${ntime}Z`);
        
        // Конвертуємо в локальний часовий пояс
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

    const formattedTime = formatTime(lastPublished.ndate, lastPublished.ntime);

    return NextResponse.json({
      lastPublishedTime: formattedTime,
      lastPublishedTitle: lastPublished.nheader,
      udate: lastPublished.udate
    });

  } catch (error) {
    console.error('Error fetching last published time:', error);
    return NextResponse.json(
      { error: 'Failed to fetch last published time' },
      { status: 500 }
    );
  }
}
