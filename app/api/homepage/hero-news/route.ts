import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { formatNewsImages } from '@/app/lib/imageUtils';


export async function GET() {
  try {
    // Priority 1: Fetch last 4 important news (nweight=2) - NEW PRIORITY
    const [importantNews] = await executeQuery(`
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
        a_statcomm.qty
      FROM a_news USE KEY (nweight)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_slideheaders USE KEY (PRIMARY) ON a_news.id = a_news_slideheaders.id
      LEFT JOIN a_statcomm USE KEY (PRIMARY) ON a_news.id = a_statcomm.id
      WHERE a_news.lang = "1"
        AND a_news.nweight = 2
        AND a_news.approved = 1
        AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()
      ORDER BY a_news.ndate DESC, a_news.ntime DESC
      LIMIT 4
    `);

    // If we have important news, use them
    if (importantNews && importantNews.length > 0) {
      // Fetch image data for all news items
      const allImageIds = importantNews
        .filter(item => item.images)
        .flatMap(item => item.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)));
      
      let imagesData = [];
      if (allImageIds.length > 0) {
        const [imageData] = await executeQuery(`
          SELECT id, filename, title_ua
          FROM a_pics 
          WHERE id IN (${allImageIds.map(() => '?').join(',')})
        `, allImageIds);
        imagesData = imageData || [];
      }
      
      const processedImportantNews = importantNews.map((item: any) => ({
        ...item,
        imageids: item.images,
        images: item.images ? formatNewsImages(imagesData, item.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)), '1') : []
      }));
      
      return NextResponse.json({ heroNews: processedImportantNews });
    }

    // Fallback: If no important news, try special news (section 1)
    const [specialNews] = await executeQuery(`
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
        a_statcomm.qty
      FROM a_news USE KEY (PRIMARY)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_slideheaders USE KEY (PRIMARY) ON a_news.id = a_news_slideheaders.id
      LEFT JOIN a_news_specialids ON a_news.id = a_news_specialids.newsid
      LEFT JOIN a_statcomm USE KEY (PRIMARY) ON a_news.id = a_statcomm.id
      WHERE a_news_specialids.section = 1 
        AND a_news_specialids.newsid <> 0 
        AND a_news.approved = 1 
        AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()
      GROUP BY a_news.id
      ORDER BY a_news.ndate DESC, a_news.ntime DESC 
      LIMIT 4
    `);
    
    // Обробляємо special новини як fallback
    // Fetch image data for all special news items
    const allSpecialImageIds = specialNews
      .filter(item => item.images)
      .flatMap(item => item.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)));
    
    let specialImagesData = [];
    if (allSpecialImageIds.length > 0) {
      const [specialImageData] = await executeQuery(`
        SELECT id, filename, title_ua
        FROM a_pics 
        WHERE id IN (${allSpecialImageIds.map(() => '?').join(',')})
      `, allSpecialImageIds);
      specialImagesData = specialImageData || [];
    }
    
    const processedSpecialNews = specialNews.map((item: any) => ({
      ...item,
      imageids: item.images,
      images: item.images ? formatNewsImages(specialImagesData, item.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id)), '1') : []
    }));

    return NextResponse.json({ heroNews: processedSpecialNews });
    
  } catch (error) {
    console.error('Error fetching hero news data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero news data' },
      { status: 500 }
    );
  }
}