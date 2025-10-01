import { executeQuery } from '@/app/lib/db';

export async function getImportantNewsData(limit: number = 5, lang: string = '1') {
  try {
    // Запит для отримання важливих новин (nweight > 0)
    const importantNewsQuery = `
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.ntype,
        a_news.images,
        a_news.urlkey,
        a_news.photo,
        a_news.video,
        a_news.comments,
        a_news.printsubheader,
        a_news.rubric,
        a_news.nweight,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser,
        a_statcomm.qty as comments_count,
        a_statview.qty as views_count
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      WHERE CONCAT(a_news.ndate, " ", a_news.ntime) < NOW() 
        AND a_news.approved = 1 
        AND a_news.lang = ?
        AND a_news.nweight > 0
      ORDER BY a_news.udate DESC
      LIMIT ?
    `;
    
    // Виконання запиту
    const [importantNews] = await executeQuery(importantNewsQuery, [lang, limit]);
    
    return {
      importantNews,
      total: importantNews.length
    };
  } catch (error) {
    console.error('Error fetching important news data:', error);
    throw error;
  }
}

export async function getImportantNewsByLevel(level: number, limit: number = 5, lang: string = '1') {
  try {
    // Валідація рівня важливості
    if (level < 0 || level > 4) {
      throw new Error('Invalid importance level. Must be 0-4');
    }
    
    // Запит для отримання новин з конкретним рівнем важливості
    const importantNewsQuery = `
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.ntype,
        a_news.images,
        a_news.urlkey,
        a_news.photo,
        a_news.video,
        a_news.comments,
        a_news.printsubheader,
        a_news.rubric,
        a_news.nweight,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser,
        a_statcomm.qty as comments_count,
        a_statview.qty as views_count
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      WHERE CONCAT(a_news.ndate, " ", a_news.ntime) < NOW() 
        AND a_news.approved = 1 
        AND a_news.lang = ?
        AND a_news.nweight = ?
      ORDER BY a_news.udate DESC
      LIMIT ?
    `;
    
    // Виконання запиту
    const [importantNews] = await executeQuery(importantNewsQuery, [lang, level, limit]);
    
    return {
      importantNews,
      total: importantNews.length,
      importanceLevel: level
    };
  } catch (error) {
    console.error('Error fetching important news by level:', error);
    throw error;
  }
}

export async function getTopImportantNews(limit: number = 5, lang: string = '1') {
  try {
    // Запит для отримання топ важливих новин (nweight = 2 - найвищий рівень)
    const topImportantNewsQuery = `
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news.ntype,
        a_news.images,
        a_news.urlkey,
        a_news.photo,
        a_news.video,
        a_news.comments,
        a_news.printsubheader,
        a_news.rubric,
        a_news.nweight,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser,
        a_statcomm.qty as comments_count,
        a_statview.qty as views_count
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      WHERE CONCAT(a_news.ndate, " ", a_news.ntime) < NOW() 
        AND a_news.approved = 1 
        AND a_news.lang = ?
        AND a_news.nweight = 2
      ORDER BY a_news.udate DESC
      LIMIT ?
    `;
    
    // Виконання запиту
    const [topImportantNews] = await executeQuery(topImportantNewsQuery, [lang, limit]);
    
    return {
      topImportantNews,
      total: topImportantNews.length
    };
  } catch (error) {
    console.error('Error fetching top important news:', error);
    throw error;
  }
}
