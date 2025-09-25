import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { generateUrlKey } from '@/app/lib/transliteration';

export async function POST(request: NextRequest) {
  try {
    // Знаходимо новини без url_key або з порожнім url_key
    const [rows] = await executeQuery(`
      SELECT a_news.id, a_news_headers.nheader 
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE (a_news.urlkey IS NULL OR a_news.urlkey = '' OR a_news.urlkey = 'article')
      AND a_news_headers.nheader IS NOT NULL
      AND a_news_headers.nheader != ''
      ORDER BY a_news.id
    `);

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Немає новин для оновлення url_key',
        updated: 0,
        errors: 0
      });
    }

    let updated = 0;
    let errors = 0;
    const results = [];

    for (const row of rows) {
      try {
        const urlKey = generateUrlKey(row.nheader);
        
        if (urlKey) {
          await executeQuery(
            'UPDATE a_news SET urlkey = ? WHERE id = ?',
            [urlKey, row.id]
          );
          
          results.push({
            id: row.id,
            title: row.nheader,
            urlKey: urlKey,
            status: 'updated'
          });
          
          updated++;
        } else {
          results.push({
            id: row.id,
            title: row.nheader,
            urlKey: null,
            status: 'error',
            error: 'Не вдалося згенерувати url_key'
          });
          errors++;
        }
      } catch (error) {
        results.push({
          id: row.id,
          title: row.nheader,
          urlKey: null,
          status: 'error',
          error: error instanceof Error ? error.message : 'Невідома помилка'
        });
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Оновлено ${updated} новин, помилок: ${errors}`,
      updated,
      errors,
      results
    });

  } catch (error) {
    console.error('Error updating url_keys:', error);
    return NextResponse.json(
      { error: 'Failed to update url_keys' },
      { status: 500 }
    );
  }
}
