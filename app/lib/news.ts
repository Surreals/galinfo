import { executeQuery } from './db';

// Константи таблиць (відповідно до PHP коду)
const TABLES = {
  NEWS: 'a_news',
  NEWS_BODY: 'a_news_body',
  NEWS_HEADERS: 'a_news_headers',
  NEWS_SLIDE_HEADERS: 'a_news_slideheaders',
  NEWS_META: 'a_newsmeta',
  TAGS_MAP: 'a_tags_map',
  TAGS: 'a_tags',
  USERS: 'a_powerusers',
  FUSERS: 'a_users',
  CATS: 'a_cats',
} as const;

export interface NewsData {
  // Основні поля з a_news
  id: number;
  images: string;
  ndate: string;
  ntime: string;
  ntype: number;
  lang: string;
  layout: number;
  udate: number;
  youcode: string;
  rubric: string;
  region: string;
  theme: string;
  nauthor: number;
  userid: number;
  nweight: number;
  ispopular: number;
  urlkey: string;
  showauthor: number;
  hiderss: number;
  rated: number;
  photo: number;
  video: number;
  approved: number;
  nocomment: number;
  printsubheader: number;
  topnews: number;
  suggest: number;
  headlineblock: number;
  maininblock: number;
  idtotop: number;
  twitter_status: string;
  twittered: number;
  
  // Поля з a_news_body
  nbody: string;
  
  // Поля з a_news_headers
  nheader: string;
  nsubheader: string;
  nteaser: string;
  
  // Поля з a_news_slideheaders
  sheader: string;
  steaser: string;
  
  // Поля з a_newsmeta
  ntitle: string;
  ndescription: string;
  nkeywords: string;
  
  // Теги
  tags: string[];
  
  // Імена користувачів
  editor_name: string;
  author_name: string;
}

export async function getNewsById(id: number): Promise<NewsData | null> {
  try {
    const query = `
      SELECT 
        n.*,
        nb.nbody,
        nh.nheader,
        nh.nsubheader,
        nh.nteaser,
        nsh.sheader,
        nsh.steaser,
        nm.ntitle,
        nm.ndescription,
        nm.nkeywords,
        u.uname_ua as editor_name,
        fu.name as author_name
      FROM ${TABLES.NEWS} n
      LEFT JOIN ${TABLES.NEWS_BODY} nb ON n.id = nb.id
      LEFT JOIN ${TABLES.NEWS_HEADERS} nh ON n.id = nh.id
      LEFT JOIN ${TABLES.NEWS_SLIDE_HEADERS} nsh ON n.id = nsh.id
      LEFT JOIN ${TABLES.NEWS_META} nm ON n.id = nm.id
      LEFT JOIN ${TABLES.USERS} u ON n.nauthor = u.id
      LEFT JOIN ${TABLES.FUSERS} fu ON n.userid = fu.id
      WHERE n.id = ?
    `;
    
    const results = await executeQuery<NewsData>(query, [id]);
    
    if (results.length === 0) {
      return null;
    }
    
    const news = results[0];
    
    // Отримуємо теги
    const tagsQuery = `
      SELECT t.tag
      FROM ${TABLES.TAGS_MAP} tm
      JOIN ${TABLES.TAGS} t ON tm.tagid = t.id
      WHERE tm.newsid = ?
    `;
    
    const tagsResults = await executeQuery<{ tag: string }>(tagsQuery, [id]);
    news.tags = tagsResults.map(t => t.tag);
    
    // Конвертуємо числові поля в boolean
    const booleanFields = [
      'showauthor', 'hiderss', 'rated', 'photo', 'video', 'approved', 
      'nocomment', 'printsubheader', 'topnews', 'suggest', 'headlineblock', 
      'maininblock', 'twittered'
    ];
    
    booleanFields.forEach(field => {
      if (news[field as keyof NewsData] !== undefined) {
        (news as any)[field] = Boolean(news[field as keyof NewsData]);
      }
    });
    
    // Конвертуємо рядки з комами в масиви
    if (news.rubric) {
      news.rubric = news.rubric.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    } else {
      news.rubric = [];
    }
    
    if (news.region) {
      news.region = news.region.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    } else {
      news.region = [];
    }
    
    return news;
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    throw error;
  }
}

export async function createNews(data: Partial<NewsData>): Promise<number> {
  try {
    // Створюємо запис в основній таблиці
    const newsQuery = `
      INSERT INTO ${TABLES.NEWS} SET ?
    `;
    
    const newsData = {
      images: data.images || '',
      ndate: data.ndate || new Date().toISOString().split('T')[0],
      ntime: data.ntime || new Date().toTimeString().split(' ')[0].substring(0, 8),
      ntype: data.ntype || 1,
      lang: data.lang || 'ua',
      layout: data.layout || 0,
      udate: Math.floor(Date.now() / 1000),
      youcode: data.youcode || '',
      rubric: Array.isArray(data.rubric) ? data.rubric.join(',') : '',
      region: Array.isArray(data.region) ? data.region.join(',') : '',
      theme: data.theme || '',
      nauthor: data.nauthor || 0,
      userid: data.userid || 0,
      nweight: data.nweight || 0,
      ispopular: data.ispopular || 0,
      urlkey: data.urlkey || '',
      showauthor: data.showauthor ? 1 : 0,
      hiderss: data.hiderss ? 1 : 0,
      rated: data.rated ? 1 : 0,
      photo: data.photo ? 1 : 0,
      video: data.video ? 1 : 0,
      approved: data.approved ? 1 : 0,
      nocomment: data.nocomment ? 1 : 0,
      printsubheader: data.printsubheader ? 1 : 0,
      topnews: data.topnews ? 1 : 0,
      suggest: data.suggest ? 1 : 0,
      headlineblock: data.headlineblock ? 1 : 0,
      maininblock: data.maininblock ? 1 : 0,
      idtotop: data.idtotop || 0,
      twitter_status: data.twitter_status || 'not_published',
      twittered: data.twittered ? 1 : 0,
    };
    
    const [result] = await executeQuery<{ insertId: number }>(newsQuery, [newsData]);
    const newsId = result.insertId;
    
    // Створюємо запис в таблиці тіла новини
    if (data.nbody) {
      const bodyQuery = `
        INSERT INTO ${TABLES.NEWS_BODY} (id, nbody) VALUES (?, ?)
      `;
      await executeQuery(bodyQuery, [newsId, data.nbody]);
    }
    
    // Створюємо запис в таблиці заголовків
    if (data.nheader || data.nsubheader || data.nteaser) {
      const headersQuery = `
        INSERT INTO ${TABLES.NEWS_HEADERS} (id, nheader, nsubheader, nteaser) VALUES (?, ?, ?, ?)
      `;
      await executeQuery(headersQuery, [newsId, data.nheader || '', data.nsubheader || '', data.nteaser || '']);
    }
    
    // Створюємо запис в таблиці спеціальних заголовків
    if (data.sheader || data.steaser) {
      const slideHeadersQuery = `
        INSERT INTO ${TABLES.NEWS_SLIDE_HEADERS} (id, sheader, steaser) VALUES (?, ?, ?)
      `;
      await executeQuery(slideHeadersQuery, [newsId, data.sheader || '', data.steaser || '']);
    }
    
    // Створюємо запис в таблиці мета-даних
    if (data.ntitle || data.ndescription || data.nkeywords) {
      const metaQuery = `
        INSERT INTO ${TABLES.NEWS_META} (id, ntitle, ndescription, nkeywords) VALUES (?, ?, ?, ?)
      `;
      await executeQuery(metaQuery, [newsId, data.ntitle || '', data.ndescription || '', data.nkeywords || '']);
    }
    
    // Додаємо теги
    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        // Спочатку створюємо тег, якщо його немає
        const tagQuery = `
          INSERT IGNORE INTO ${TABLES.TAGS} (tag) VALUES (?)
        `;
        await executeQuery(tagQuery, [tag]);
        
        // Отримуємо ID тегу
        const tagIdQuery = `
          SELECT id FROM ${TABLES.TAGS} WHERE tag = ?
        `;
        const tagResults = await executeQuery<{ id: number }>(tagIdQuery, [tag]);
        
        if (tagResults.length > 0) {
          // Додаємо зв'язок
          const tagMapQuery = `
            INSERT INTO ${TABLES.TAGS_MAP} (newsid, tagid) VALUES (?, ?)
          `;
          await executeQuery(tagMapQuery, [newsId, tagResults[0].id]);
        }
      }
    }
    
    return newsId;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
}

export async function updateNews(id: number, data: Partial<NewsData>): Promise<boolean> {
  try {
    // Оновлюємо основну таблицю
    const newsQuery = `
      UPDATE ${TABLES.NEWS} SET ? WHERE id = ?
    `;
    
    const newsData = {
      images: data.images,
      ndate: data.ndate,
      ntime: data.ntime,
      ntype: data.ntype,
      lang: data.lang,
      layout: data.layout,
      udate: Math.floor(Date.now() / 1000),
      youcode: data.youcode,
      rubric: Array.isArray(data.rubric) ? data.rubric.join(',') : data.rubric,
      region: Array.isArray(data.region) ? data.region.join(',') : data.region,
      theme: data.theme,
      nauthor: data.nauthor,
      userid: data.userid,
      nweight: data.nweight,
      ispopular: data.ispopular,
      showauthor: data.showauthor ? 1 : 0,
      hiderss: data.hiderss ? 1 : 0,
      rated: data.rated ? 1 : 0,
      photo: data.photo ? 1 : 0,
      video: data.video ? 1 : 0,
      approved: data.approved ? 1 : 0,
      nocomment: data.nocomment ? 1 : 0,
      printsubheader: data.printsubheader ? 1 : 0,
      topnews: data.topnews ? 1 : 0,
      suggest: data.suggest ? 1 : 0,
      headlineblock: data.headlineblock ? 1 : 0,
      maininblock: data.maininblock ? 1 : 0,
      idtotop: data.idtotop,
      twitter_status: data.twitter_status,
      twittered: data.twittered ? 1 : 0,
    };
    
    await executeQuery(newsQuery, [newsData, id]);
    
    // Оновлюємо тіло новини
    if (data.nbody !== undefined) {
      const bodyQuery = `
        UPDATE ${TABLES.NEWS_BODY} SET nbody = ? WHERE id = ?
      `;
      await executeQuery(bodyQuery, [data.nbody, id]);
    }
    
    // Оновлюємо заголовки
    if (data.nheader !== undefined || data.nsubheader !== undefined || data.nteaser !== undefined) {
      const headersQuery = `
        UPDATE ${TABLES.NEWS_HEADERS} SET nheader = ?, nsubheader = ?, nteaser = ? WHERE id = ?
      `;
      await executeQuery(headersQuery, [data.nheader || '', data.nsubheader || '', data.nteaser || '', id]);
    }
    
    // Оновлюємо спеціальні заголовки
    if (data.sheader !== undefined || data.steaser !== undefined) {
      const slideHeadersQuery = `
        UPDATE ${TABLES.NEWS_SLIDE_HEADERS} SET sheader = ?, steaser = ? WHERE id = ?
      `;
      await executeQuery(slideHeadersQuery, [data.sheader || '', data.steaser || '', id]);
    }
    
    // Оновлюємо мета-дані
    if (data.ntitle !== undefined || data.ndescription !== undefined || data.nkeywords !== undefined) {
      const metaQuery = `
        UPDATE ${TABLES.NEWS_META} SET ntitle = ?, ndescription = ?, nkeywords = ? WHERE id = ?
      `;
      await executeQuery(metaQuery, [data.ntitle || '', data.ndescription || '', data.nkeywords || '', id]);
    }
    
    // Оновлюємо теги
    if (data.tags !== undefined) {
      // Видаляємо старі теги
      const deleteTagsQuery = `
        DELETE FROM ${TABLES.TAGS_MAP} WHERE newsid = ?
      `;
      await executeQuery(deleteTagsQuery, [id]);
      
      // Додаємо нові теги
      if (data.tags.length > 0) {
        for (const tag of data.tags) {
          // Спочатку створюємо тег, якщо його немає
          const tagQuery = `
            INSERT IGNORE INTO ${TABLES.TAGS} (tag) VALUES (?)
          `;
          await executeQuery(tagQuery, [tag]);
          
          // Отримуємо ID тегу
          const tagIdQuery = `
            SELECT id FROM ${TABLES.TAGS} WHERE tag = ?
          `;
          const tagResults = await executeQuery<{ id: number }>(tagIdQuery, [tag]);
          
          if (tagResults.length > 0) {
            // Додаємо зв'язок
            const tagMapQuery = `
              INSERT INTO ${TABLES.TAGS_MAP} (newsid, tagid) VALUES (?, ?)
            `;
            await executeQuery(tagMapQuery, [id, tagResults[0].id]);
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
}

export async function deleteNews(id: number): Promise<boolean> {
  try {
    // Видаляємо з усіх пов'язаних таблиць
    const queries = [
      `DELETE FROM ${TABLES.TAGS_MAP} WHERE newsid = ?`,
      `DELETE FROM ${TABLES.NEWS_META} WHERE id = ?`,
      `DELETE FROM ${TABLES.NEWS_SLIDE_HEADERS} WHERE id = ?`,
      `DELETE FROM ${TABLES.NEWS_HEADERS} WHERE id = ?`,
      `DELETE FROM ${TABLES.NEWS_BODY} WHERE id = ?`,
      `DELETE FROM ${TABLES.NEWS} WHERE id = ?`,
    ];
    
    for (const query of queries) {
      await executeQuery(query, [id]);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
}
