import { executeQuery } from '@/app/lib/db';

export interface SearchNewsParams {
  query: string;
  page?: number;
  limit?: number;
  lang?: string;
  type?: string;
  rubric?: string;
  approved?: boolean;
}

export interface SearchNewsResult {
  searchResults: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  search: {
    query: string;
    totalResults: number;
  };
  filters: {
    lang: string;
    type?: string;
    rubric?: string;
    approved: boolean;
  };
}

export async function searchNews(params: SearchNewsParams): Promise<SearchNewsResult> {
  try {
    const {
      query,
      page = 1,
      limit = 20,
      lang = '1',
      type,
      rubric,
      approved = true
    } = params;
    
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }
    
    const offset = (page - 1) * limit;
    const searchTerm = `%${query.trim()}%`;
    
    // Базові умови WHERE
    let whereConditions = [
      'a_news.udate < UNIX_TIMESTAMP()', // Тільки опубліковані
      'a_news.approved = 1',             // Тільки схвалені
      'a_news.lang = ?',                 // Мова
      '(a_news_headers.nheader LIKE ? OR a_news_headers.nsubheader LIKE ? OR a_news_headers.nteaser LIKE ?)' // Пошук в заголовках
    ];
    
    const queryParams: any[] = [lang, searchTerm, searchTerm, searchTerm];
    
    // Фільтрація по типу новини
    if (type) {
      whereConditions.push('a_news.ntype = ?');
      queryParams.push(parseInt(type));
    }
    
    // Фільтрація по рубриці
    if (rubric && rubric !== 'all') {
      whereConditions.push('FIND_IN_SET(?, a_news.rubric) > 0');
      queryParams.push(rubric);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Запит для пошуку новин
    const searchQuery = `
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
        a_statview.qty as views_count,
        CASE 
          WHEN a_news_headers.nheader LIKE ? THEN 3
          WHEN a_news_headers.nsubheader LIKE ? THEN 2
          WHEN a_news_headers.nteaser LIKE ? THEN 1
          ELSE 0
        END as relevance_score
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
      LEFT JOIN a_statview ON a_news.id = a_statview.id
      WHERE ${whereClause}
      ORDER BY relevance_score DESC, a_news.udate DESC
      LIMIT ? OFFSET ?
    `;
    
    // Запит для підрахунку загальної кількості результатів
    const countQuery = `
      SELECT COUNT(*) as total
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE ${whereClause}
    `;
    
    // Виконання запитів
    const [[searchData], [countData]] = await Promise.all([
      executeQuery(searchQuery, [...queryParams, limit, offset]),
      executeQuery(countQuery, queryParams)
    ]);
    
    const total = countData[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    return {
      searchResults: searchData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      search: {
        query,
        totalResults: total
      },
      filters: {
        lang,
        type,
        rubric,
        approved
      }
    };
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
}

// Функція для пошуку популярних запитів
export async function getPopularSearchTerms(limit: number = 10, lang: string = '1') {
  try {
    // Це заглушка - в реальному проекті тут був би запит до таблиці з популярними пошуковими запитами
    // Наприклад, можна зберігати пошукові запити в окремій таблиці і рахувати їх частоту
    
    const popularTerms = await executeQuery(`
      SELECT 
        search_term,
        COUNT(*) as search_count,
        MAX(search_date) as last_searched
      FROM a_search_logs
      WHERE lang = ? AND search_date > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY search_term
      ORDER BY search_count DESC
      LIMIT ?
    `, [lang, limit]);
    
    return popularTerms;
  } catch (error) {
    console.error('Error fetching popular search terms:', error);
    return [];
  }
}

// Функція для збереження пошукового запиту (для аналітики)
export async function logSearchQuery(query: string, lang: string = '1') {
  try {
    // Це заглушка - в реальному проекті тут був би INSERT в таблицю з логами пошуку
    await executeQuery(`
      INSERT INTO a_search_logs (search_term, lang, search_date, ip_address)
      VALUES (?, ?, NOW(), ?)
    `, [query, lang, '127.0.0.1']); // IP адреса буде передаватися з фронтенду
    
    return true;
  } catch (error) {
    console.error('Error logging search query:', error);
    return false;
  }
}
