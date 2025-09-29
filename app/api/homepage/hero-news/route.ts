import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import { generateImagePath, getImageUrl } from '@/app/lib/imageUtils';

// Функція для обробки зображень в новій структурі
async function processHeroNewsImages(newsItem: any) {
  const images = [];
  
  // Обробляємо image_filenames (якщо є)
  if (newsItem.image_filenames && newsItem.image_filenames.trim() !== '') {
    const filenames = newsItem.image_filenames.split(',').map((f: string) => f.trim());
    filenames.forEach((filename: string) => {
      if (filename) {
        images.push({
          urls: {
            full: getImageUrl(filename, 'full'),
            intxt: getImageUrl(filename, 'intxt'),
            tmb: getImageUrl(filename, 'tmb')
          }
        });
      }
    });
  }
  
  // Якщо немає зображень з image_filenames, перевіряємо images поле
  if (images.length === 0 && newsItem.images && newsItem.images.toString().trim() !== '') {
    try {
      // Get actual filenames from database
      const imageIds = newsItem.images.split(',').map((id: string) => id.trim());
      const [picData] = await executeQuery(`
        SELECT filename FROM a_pics 
        WHERE id IN (${imageIds.map(() => '?').join(',')})
      `, imageIds);
      
      picData.forEach((pic: any) => {
        if (pic.filename) {
          images.push({
            urls: {
              full: getImageUrl(pic.filename, 'full'),
              intxt: getImageUrl(pic.filename, 'intxt'),
              tmb: getImageUrl(pic.filename, 'tmb')
            }
          });
        }
      });
    } catch (error) {
      console.error('Error fetching image filenames:', error);
    }
  }
  
  // Якщо все ще немає зображень, перевіряємо photo поле
  if (images.length === 0 && newsItem.photo && newsItem.photo.toString().trim() !== '') {
    const photoStr = newsItem.photo.toString();
    if (!photoStr.startsWith('http') && !photoStr.startsWith('/')) {
      images.push({
        urls: {
          full: getImageUrl(photoStr, 'full'),
          intxt: getImageUrl(photoStr, 'intxt'),
          tmb: getImageUrl(photoStr, 'tmb')
        }
      });
    } else {
      images.push({
        urls: {
          full: photoStr,
          intxt: photoStr,
          tmb: photoStr
        }
      });
    }
  }
  
  return images;
}

export async function GET() {
  try {
    // Priority 1: Fetch last 4 important news (nweight=2) - NEW PRIORITY
    const currentTimestamp = Math.floor(Date.now() / 1000);
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
        a_statcomm.qty,
      FROM a_news USE KEY (nweight)
      LEFT JOIN a_news_headers USE KEY (PRIMARY) ON a_news.id = a_news_headers.id
      LEFT JOIN a_news_slideheaders USE KEY (PRIMARY) ON a_news.id = a_news_slideheaders.id
      LEFT JOIN a_statcomm USE KEY (PRIMARY) ON a_news.id = a_statcomm.id
      WHERE a_news.lang = "1"
        AND a_news.nweight = 2
        AND a_news.approved = 1
        AND a_news.udate < ?
      GROUP BY a_news.id
      ORDER BY a_news.ndate DESC
      LIMIT 4
    `, [currentTimestamp]);

    // If we have important news, use them
    if (importantNews && importantNews.length > 0) {
      const processedImportantNews = await Promise.all(
        importantNews.map(async (item: any) => ({
          ...item,
          images: await processHeroNewsImages(item)
        }))
      );
      
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
        AND a_news.udate < ?
      GROUP BY a_news.id
      ORDER BY a_news_specialids.id 
      LIMIT 4
    `, [currentTimestamp]);
    
    // Обробляємо special новини як fallback
    const processedSpecialNews = await Promise.all(
      specialNews.map(async (item: any) => ({
        ...item,
        images: await processHeroNewsImages(item)
      }))
    );

    return NextResponse.json({ heroNews: processedSpecialNews });
    
  } catch (error) {
    console.error('Error fetching hero news data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero news data' },
      { status: 500 }
    );
  }
}
