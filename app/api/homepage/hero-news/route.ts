import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function GET() {
  try {
    // Fetch hero news based on the PHP app's newsoday function
    // This gets special news (section 1) and important news (nweight=2)
    const heroNews = await executeQuery(`
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.ntype,
        a_news.images,
        a_news.urlkey,
        a_news.photo,
        a_news.video,
        a_news.udate,
        a_news_headers.nheader,
        a_news_headers.nteaser,
        a_news_slideheaders.sheader,
        a_news_slideheaders.steaser,
        a_statcomm.qty,
        GROUP_CONCAT(a_pics.filename) as image_filenames
      FROM a_news USE KEY (PRIMARY)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_slideheaders USE KEY (PRIMARY) ON a_news.id = a_news_slideheaders.id
      LEFT JOIN a_news_specialids ON a_news.id = a_news_specialids.newsid
      LEFT JOIN a_statcomm USE KEY (PRIMARY) ON a_news.id = a_statcomm.id
      LEFT JOIN a_pics ON FIND_IN_SET(a_pics.id, a_news.images)
      WHERE a_news_specialids.section = 1 
        AND a_news_specialids.newsid <> 0 
        AND a_news.approved = 1 
        AND a_news.udate < UNIX_TIMESTAMP()
      GROUP BY a_news.id
      ORDER BY a_news_specialids.id 
      LIMIT 4
    `);

    // If no special news, fall back to important news (nweight=2)
    if (!heroNews || heroNews.length === 0) {
      const fallbackNews = await executeQuery(`
        SELECT 
          a_news.id,
          a_news.ndate,
          a_news.ntime,
          a_news.ntype,
          a_news.images,
          a_news.urlkey,
          a_news.photo,
          a_news.video,
          a_news.udate,
          a_news_headers.nheader,
          a_news_headers.nteaser,
          a_news_slideheaders.sheader,
          a_news_slideheaders.steaser,
          a_statcomm.qty,
          GROUP_CONCAT(a_pics.filename) as image_filenames
        FROM a_news USE KEY (nweight)
        LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
        LEFT JOIN a_news_slideheaders USE KEY (PRIMARY) ON a_news.id = a_news_slideheaders.id
        LEFT JOIN a_statcomm USE KEY (PRIMARY) ON a_news.id = a_statcomm.id
        LEFT JOIN a_pics ON FIND_IN_SET(a_pics.id, a_news.images)
        WHERE a_news.lang = "1"
          AND a_news.nweight = 2
          AND a_news.approved = 1
          AND a_news.udate < UNIX_TIMESTAMP()
        GROUP BY a_news.id
        ORDER BY a_news.udate DESC
        LIMIT 4
      `);
      
      return NextResponse.json({ heroNews: fallbackNews });
    }

    return NextResponse.json({ heroNews });
    
  } catch (error) {
    console.error('Error fetching hero news data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero news data' },
      { status: 500 }
    );
  }
}
