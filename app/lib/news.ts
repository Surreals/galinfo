import { executeQuery } from './db';
import { generateUrlKey } from './transliteration';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Функція для отримання поточного часу сервера
async function getServerTime(): Promise<{ date: string; time: string }> {
  try {
    const [result] = await executeQuery<{ server_date: string; server_time: string }>(`
      SELECT 
        DATE(NOW()) as server_date,
        TIME(NOW()) as server_time
    `);
    
    if (result.length > 0) {
      return {
        date: result[0].server_date,
        time: result[0].server_time
      };
    }
  } catch (error) {
    console.warn('Failed to get server time, using local time:', error);
  }
  
  // Fallback to local time if server query fails
  const now = new Date();
  return {
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0].substring(0, 8)
  };
}

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
  rubric: number[] | string;
  region: number[] | string;
  theme: number;
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
  isProject: number;
  
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
  
  // Назви файлів зображень
  image_filenames: Array<{
    id: number;
    filename: string;
    title_ua?: string;
    title_deflang?: string;
    pic_type?: number;
  }>;
}

// Тимчасовий інтерфейс для SQL результату
interface NewsDataWithJson extends NewsData {
  image_filenames_json?: string;
}

export async function getNewsById(id: number): Promise<NewsData | null> {
  try {
    const query = `
      SELECT 
        n.id, n.images, n.ntype, n.nauthor, n.nauthorplus, n.showauthor, n.rubric, 
        n.region, n.theme, n.nweight, n.nocomment, n.hiderss, n.approved, n.lang, 
        n.rated, n.udate, n.urlkey, n.userid, n.layout, n.comments, n.bytheme, 
        n.ispopular, n.supervideo, n.printsubheader, n.topnews, n.isexpert, n.photo, 
        n.video, n.subrubric, n.imagescopy, n.suggest, n.headlineblock, n.twitter_status, 
        n.youcode, n._todel1, n._todel2, n._todel3, n._stage, n.maininblock, n.videos, n.isProject,
        DATE_FORMAT(n.ndate, '%Y-%m-%d') as ndate,
        n.ntime,
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
        fu.name as author_name,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', a_pics.id,
            'filename', a_pics.filename,
            'title_ua', a_pics.title_ua,
            'title_deflang', a_pics.title_deflang,
            'pic_type', a_pics.pic_type
          ) 
          ORDER BY FIELD(a_pics.id, n.images)
        ) as image_filenames_json
      FROM ${TABLES.NEWS} n
      LEFT JOIN ${TABLES.NEWS_BODY} nb ON n.id = nb.id
      LEFT JOIN ${TABLES.NEWS_HEADERS} nh ON n.id = nh.id
      LEFT JOIN ${TABLES.NEWS_SLIDE_HEADERS} nsh ON n.id = nsh.id
      LEFT JOIN ${TABLES.NEWS_META} nm ON n.id = nm.id
      LEFT JOIN ${TABLES.USERS} u ON n.nauthor = u.id
      LEFT JOIN ${TABLES.FUSERS} fu ON n.userid = fu.id
      LEFT JOIN a_pics ON FIND_IN_SET(a_pics.id, n.images)
      WHERE n.id = ?
      GROUP BY n.id
    `;
    
    const [results] = await executeQuery<NewsDataWithJson>(query, [id]);
    
    if (results.length === 0) {
      return null;
    }
    
    const news = results[0];
    
    // Парсимо JSON дані зображень
    if (news.image_filenames_json) {
      try {
        news.image_filenames = JSON.parse(`[${news.image_filenames_json}]`);
      } catch (error) {
        console.error('Error parsing image_filenames JSON:', error);
        news.image_filenames = [];
      }
    } else {
      news.image_filenames = [];
    }
    
    // Видаляємо тимчасове поле
    delete (news as any).image_filenames_json;
    
    // Отримуємо теги
    const tagsQuery = `
      SELECT t.tag
      FROM ${TABLES.TAGS_MAP} tm
      JOIN ${TABLES.TAGS} t ON tm.tagid = t.id
      WHERE tm.newsid = ?
    `;
    
    const [tagsResults] = await executeQuery<{ tag: string }>(tagsQuery, [id]);
    news.tags = tagsResults.map(t => t.tag);
    
    // Конвертуємо числові поля в boolean
    const booleanFields = [
      'showauthor', 'hiderss', 'rated', 'photo', 'video', 'approved', 
      'nocomment', 'printsubheader', 'topnews', 'suggest', 'headlineblock', 
      'maininblock', 'twittered', 'isProject'
    ];
    
    booleanFields.forEach(field => {
      if (news[field as keyof NewsData] !== undefined) {
        (news as any)[field] = Boolean(news[field as keyof NewsData]);
      }
    });
    
    // Конвертуємо рядки з комами в масиви
    if (news.rubric && typeof news.rubric === 'string') {
      news.rubric = news.rubric.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
    } else if (!news.rubric) {
      news.rubric = [];
    }
    
    if (news.region && typeof news.region === 'string') {
      news.region = news.region.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
    } else if (!news.region) {
      news.region = [];
    }
    
    // Час зберігається в UTC в базі даних і буде автоматично конвертований
    // в локальний час при відображенні в компонентах (formatFullNewsDate)
    // Додаткова конвертація тут не потрібна
    
    return news;
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    throw error;
  }
}

export async function createNews(data: Partial<NewsData>): Promise<number> {
  try {
    // Отримуємо поточний час сервера
    const serverTime = await getServerTime();
    
    // Створюємо запис в основній таблиці
    const newsQuery = `
      INSERT INTO ${TABLES.NEWS} (
        images, ndate, ntime, ntype, nauthor, nauthorplus, showauthor, rubric, region, theme,
        nweight, nocomment, hiderss, approved, lang, rated, udate, urlkey, userid, layout,
        comments, bytheme, ispopular, supervideo, printsubheader, topnews, isexpert, photo, video,
        subrubric, imagescopy, suggest, headlineblock, twitter_status, youcode, _todel1, _todel2, _todel3, _stage, maininblock, videos, isProject
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const newsValues = [
      data.images || '',
      (() => {
        // Обробляємо дату - завжди конвертуємо в YYYY-MM-DD формат
        if (data.ndate) {
          const date = new Date(data.ndate);
          if (!isNaN(date.getTime())) {
            // Завжди повертаємо дату в форматі YYYY-MM-DD
            return date.toISOString().split('T')[0];
          }
        }
        // За замовчуванням - поточна дата в UTC
        return new Date().toISOString().split('T')[0];
      })(),
      (() => {
        // Обробляємо час з використанням dayjs
        if (data.ntime && typeof data.ntime === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(data.ntime)) {
          // Якщо передано ntime окремо, конвертуємо локальний час в UTC
          const dateStr = data.ndate ? dayjs(data.ndate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
          const localDateTime = dayjs(`${dateStr} ${data.ntime}`);
          const utcTime = localDateTime.utc();
          return utcTime.format('HH:mm:ss');
        } else if (data.ndate) {
          // Якщо передано ndate з часом, конвертуємо в UTC
          const dateObj = dayjs(data.ndate);
          if (dateObj.isValid()) {
            const utcTime = dateObj.utc();
            return utcTime.format('HH:mm:ss');
          }
        }
        // За замовчуванням - поточний UTC час мінус 1 хвилина, щоб гарантувати відображення
        const now = dayjs().utc().subtract(1, 'minute');
        return now.format('HH:mm:ss');
      })(),
      data.ntype || 1,
      data.nauthor || 0,
      '', // nauthorplus - required field
      data.showauthor ? 1 : 0,
      Array.isArray(data.rubric) ? data.rubric.join(',') : '0',
      Array.isArray(data.region) ? data.region.join(',') : '',
      data.theme || 0,
      data.nweight || 0,
      data.nocomment ? 1 : 0,
      data.hiderss ? 1 : 0,
      data.approved ? 1 : 0,
      data.lang === 'ua' ? 1 : (data.lang === 'en' ? 2 : (data.lang === 'ru' ? 3 : 1)),
      data.rated ? 1 : 0,
      Math.floor(Date.now() / 1000), // udate - використовуємо локальний час для timestamp
      data.urlkey || (data.nheader ? generateUrlKey(data.nheader) : ''),
      data.userid || 0,
      data.layout || 0,
      null, // comments - nullable field
      '', // bytheme - required field
      data.ispopular || 0,
      0, // supervideo - required field
      data.printsubheader ? 1 : 0,
      data.topnews ? 1 : 0,
      0, // isexpert - required field
      data.photo ? 1 : 0,
      data.video ? 1 : 0,
      0, // subrubric - required field
      null, // imagescopy - nullable field
      data.suggest ? 1 : 0,
      data.headlineblock ? 1 : 0,
      data.twitter_status || 'not_published',
      data.youcode || '',
      null, // _todel1 - nullable field
      null, // _todel2 - nullable field
      null, // _todel3 - nullable field
      null, // _stage - nullable field
      data.maininblock ? 1 : 0,
      null, // videos - nullable field
      data.isProject ? 1 : 0,
    ];
    
    console.log('🔍 SQL Query values:', newsValues);
    const result = await executeQuery<{ insertId: number }>(newsQuery, newsValues);
    console.log('🔍 Full query result:', result);
    
    // executeQuery повертає [rows, fields], але для INSERT запитів
    // insertId знаходиться в result[0].insertId або result.insertId
    let newsId: number;
    
    if (Array.isArray(result) && result.length > 0) {
      // Якщо result - це масив [rows, fields]
      const [rows, fields] = result;
      console.log('🔍 Rows:', rows);
      console.log('🔍 Fields:', fields);
      
      // Для INSERT запитів insertId може бути в різних місцях
      newsId = (rows as any)?.insertId || (fields as any)?.insertId || (result as any)?.insertId;
    } else {
      // Якщо result - це об'єкт
      newsId = (result as any)?.insertId;
    }
    
    if (!newsId) {
      console.error('❌ No insertId found in result:', result);
      throw new Error('Failed to get insertId from INSERT query');
    }
    
    console.log('✅ Created news with ID:', newsId);
    
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
        const [tagResults] = await executeQuery<{ id: number }>(tagIdQuery, [tag]);
        
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
    // Оновлюємо тільки ті поля, які передані
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (data.images !== undefined) {
      updateFields.push('images = ?');
      updateValues.push(data.images);
    }
    if (data.ndate !== undefined) {
      updateFields.push('ndate = ?');
      // Обробляємо дату - завжди конвертуємо в YYYY-MM-DD формат
      const date = new Date(data.ndate);
      if (!isNaN(date.getTime())) {
        // Завжди повертаємо дату в форматі YYYY-MM-DD
        updateValues.push(date.toISOString().split('T')[0]);
      } else {
        // Якщо дата невалідна, не оновлюємо
        updateFields.pop();
      }
    }
    if (data.ntime !== undefined) {
      updateFields.push('ntime = ?');
      // Обробляємо час з використанням dayjs
      if (typeof data.ntime === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(data.ntime)) {
        // Якщо передано час окремо, конвертуємо локальний час в UTC
        const dateStr = data.ndate ? dayjs(data.ndate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
        const localDateTime = dayjs(`${dateStr} ${data.ntime}`);
        const utcTime = localDateTime.utc();
        updateValues.push(utcTime.format('HH:mm:ss'));
      } else {
        // Якщо формат не правильний, спробуємо витягти час з ndate
        if (data.ndate) {
          const dateObj = dayjs(data.ndate);
          if (dateObj.isValid()) {
            // Конвертуємо в UTC час
            const utcTime = dateObj.utc();
            updateValues.push(utcTime.format('HH:mm:ss'));
          } else {
            updateFields.pop(); // Видаляємо поле, якщо не можемо обробити
          }
        } else {
          updateFields.pop(); // Видаляємо поле, якщо не можемо обробити
        }
      }
    }
    if (data.ntype !== undefined) {
      updateFields.push('ntype = ?');
      updateValues.push(data.ntype || 1);
    }
    if (data.lang !== undefined) {
      updateFields.push('lang = ?');
      updateValues.push(data.lang === 'ua' ? 1 : (data.lang === 'en' ? 2 : (data.lang === 'ru' ? 3 : 1)));
    }
    if (data.layout !== undefined) {
      updateFields.push('layout = ?');
      updateValues.push(data.layout || 0);
    }
    if (data.nweight !== undefined) {
      updateFields.push('nweight = ?');
      updateValues.push(data.nweight || 0);
    }
    if (data.rubric !== undefined) {
      updateFields.push('rubric = ?');
      updateValues.push(Array.isArray(data.rubric) ? data.rubric.join(',') : (data.rubric || ''));
    }
    if (data.region !== undefined) {
      updateFields.push('region = ?');
      updateValues.push(Array.isArray(data.region) ? data.region.join(',') : (data.region || ''));
    }
    if (data.theme !== undefined) {
      updateFields.push('theme = ?');
      updateValues.push(data.theme || 0);
    }
    if (data.nauthor !== undefined) {
      updateFields.push('nauthor = ?');
      updateValues.push(data.nauthor || 0);
    }
    if (data.userid !== undefined) {
      updateFields.push('userid = ?');
      updateValues.push(data.userid || 0);
    }
    
    // Boolean fields
    if (data.showauthor !== undefined) {
      updateFields.push('showauthor = ?');
      updateValues.push(data.showauthor ? 1 : 0);
    }
    if (data.hiderss !== undefined) {
      updateFields.push('hiderss = ?');
      updateValues.push(data.hiderss ? 1 : 0);
    }
    if (data.rated !== undefined) {
      updateFields.push('rated = ?');
      updateValues.push(data.rated ? 1 : 0);
    }
    if (data.photo !== undefined) {
      updateFields.push('photo = ?');
      updateValues.push(data.photo ? 1 : 0);
    }
    if (data.video !== undefined) {
      updateFields.push('video = ?');
      updateValues.push(data.video ? 1 : 0);
    }
    if (data.approved !== undefined) {
      updateFields.push('approved = ?');
      updateValues.push(data.approved ? 1 : 0);
    }
    if (data.nocomment !== undefined) {
      updateFields.push('nocomment = ?');
      updateValues.push(data.nocomment ? 1 : 0);
    }
    if (data.suggest !== undefined) {
      updateFields.push('suggest = ?');
      updateValues.push(data.suggest ? 1 : 0);
    }
    if (data.headlineblock !== undefined) {
      updateFields.push('headlineblock = ?');
      updateValues.push(data.headlineblock ? 1 : 0);
    }
    if (data.maininblock !== undefined) {
      updateFields.push('maininblock = ?');
      updateValues.push(data.maininblock ? 1 : 0);
    }
    if (data.isProject !== undefined) {
      updateFields.push('isProject = ?');
      updateValues.push(data.isProject ? 1 : 0);
    }
    
    // Завжди оновлюємо udate
    updateFields.push('udate = ?');
    updateValues.push(Math.floor(Date.now() / 1000));
    
    if (updateFields.length === 1) { // тільки udate
      return true;
    }
    
    const newsQuery = `UPDATE ${TABLES.NEWS} SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);
    
    await executeQuery(newsQuery, updateValues);
    
    // Оновлюємо тіло новини
    if (data.nbody !== undefined) {
      const bodyQuery = `
        INSERT INTO ${TABLES.NEWS_BODY} (id, nbody) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE nbody = ?
      `;
      await executeQuery(bodyQuery, [id, data.nbody, data.nbody]);
    }
    
    // Оновлюємо заголовки
    if (data.nheader !== undefined || data.nsubheader !== undefined || data.nteaser !== undefined) {
      const headersQuery = `
        INSERT INTO ${TABLES.NEWS_HEADERS} (id, nheader, nsubheader, nteaser) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE nheader = ?, nsubheader = ?, nteaser = ?
      `;
      await executeQuery(headersQuery, [id, data.nheader || '', data.nsubheader || '', data.nteaser || '', data.nheader || '', data.nsubheader || '', data.nteaser || '']);
    }
    
    // Оновлюємо спеціальні заголовки
    if (data.sheader !== undefined || data.steaser !== undefined) {
      const slideHeadersQuery = `
        INSERT INTO ${TABLES.NEWS_SLIDE_HEADERS} (id, sheader, steaser) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE sheader = ?, steaser = ?
      `;
      await executeQuery(slideHeadersQuery, [id, data.sheader || '', data.steaser || '', data.sheader || '', data.steaser || '']);
    }
    
    // Оновлюємо мета-дані
    if (data.ntitle !== undefined || data.ndescription !== undefined || data.nkeywords !== undefined) {
      const metaQuery = `
        INSERT INTO ${TABLES.NEWS_META} (id, ntitle, ndescription, nkeywords) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE ntitle = ?, ndescription = ?, nkeywords = ?
      `;
      await executeQuery(metaQuery, [id, data.ntitle || '', data.ndescription || '', data.nkeywords || '', data.ntitle || '', data.ndescription || '', data.nkeywords || '']);
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
          const [tagResults] = await executeQuery<{ id: number }>(tagIdQuery, [tag]);
          
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
