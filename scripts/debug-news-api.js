const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugNewsAPI() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfodb_db',
      port: Number(process.env.DB_PORT || 3306)
    });

    console.log('🔗 Підключено до бази даних');

    // Перевіряємо конкретну новину з умовами API
    const [newsData] = await connection.execute(`
      SELECT 
        a_news.id, 
        a_news.urlkey,
        a_news.ntype,
        a_news.lang,
        a_news.approved,
        DATE_FORMAT(a_news.ndate, '%Y-%m-%d') as ndate,
        a_news.ntime,
        a_news_headers.nheader,
        NOW() as server_time,
        CONCAT(a_news.ndate, ' ', a_news.ntime) as news_datetime,
        CONCAT(a_news.ndate, ' ', a_news.ntime) < NOW() as is_before_now
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.id = 437775
    `);

    if (newsData.length === 0) {
      console.log('❌ Новину з ID 437775 не знайдено');
      return;
    }

    const news = newsData[0];
    
    console.log('📰 Дані новини для API:');
    console.log(`ID: ${news.id}`);
    console.log(`URL Key: ${news.urlkey}`);
    console.log(`Тип: ${news.ntype}`);
    console.log(`Мова: ${news.lang}`);
    console.log(`Схвалено: ${news.approved}`);
    console.log(`Дата: ${news.ndate}`);
    console.log(`Час: ${news.ntime}`);
    console.log(`Заголовок: ${news.nheader}`);
    console.log(`Час сервера: ${news.server_time}`);
    console.log(`Час новини: ${news.news_datetime}`);
    console.log(`Чи новина раніше зараз: ${news.is_before_now}`);

    // Перевіряємо всі умови API
    console.log('\n🧪 Перевірка умов API:');
    
    const conditions = {
      id: news.id === 437775,
      urlkey: news.urlkey === 'aaaa',
      ntype: [1, 2].includes(news.ntype), // mixed: news (1) або articles (2)
      lang: news.lang === 1,
      approved: news.approved === 1,
      timeCheck: news.is_before_now === 1
    };

    console.log(`✅ ID правильний: ${conditions.id}`);
    console.log(`✅ URL Key правильний: ${conditions.urlkey}`);
    console.log(`✅ Тип правильний: ${conditions.ntype}`);
    console.log(`✅ Мова правильна: ${conditions.lang}`);
    console.log(`✅ Схвалено: ${conditions.approved}`);
    console.log(`❌ Час перевірка: ${conditions.timeCheck}`);

    if (!conditions.timeCheck) {
      console.log('\n🔍 Детальний аналіз часу:');
      
      // Перевіряємо різні способи порівняння
      const [timeAnalysis] = await connection.execute(`
        SELECT 
          CONCAT(a_news.ndate, ' ', a_news.ntime) as news_time,
          NOW() as server_time,
          UTC_TIMESTAMP() as utc_time,
          CONCAT(a_news.ndate, ' ', a_news.ntime) < NOW() as local_comparison,
          CONCAT(a_news.ndate, ' ', a_news.ntime) < UTC_TIMESTAMP() as utc_comparison,
          TIMESTAMPDIFF(SECOND, CONCAT(a_news.ndate, ' ', a_news.ntime), NOW()) as seconds_diff
        FROM a_news 
        WHERE a_news.id = 437775
      `);
      
      const analysis = timeAnalysis[0];
      console.log(`Час новини: ${analysis.news_time}`);
      console.log(`Локальний час сервера: ${analysis.server_time}`);
      console.log(`UTC час: ${analysis.utc_time}`);
      console.log(`Локальне порівняння: ${analysis.local_comparison}`);
      console.log(`UTC порівняння: ${analysis.utc_comparison}`);
      console.log(`Різниця в секундах: ${analysis.seconds_diff}`);
      
      if (analysis.seconds_diff < 0) {
        console.log('⚠️ Час новини в майбутньому! Потрібно виправити час.');
      } else {
        console.log('✅ Час новини в минулому, але порівняння не працює.');
      }
    }

    // Тестуємо повний запит API
    console.log('\n🔧 Тестування повного запиту API:');
    const [apiTest] = await connection.execute(`
      SELECT 
        a_news.id, a_news.urlkey, a_news.ntype, a_news.lang, a_news.approved,
        DATE_FORMAT(a_news.ndate, '%Y-%m-%d') as ndate,
        a_news.ntime,
        a_news_headers.nheader
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.id = 437775 
        AND a_news.urlkey = 'aaaa' 
        AND a_news.ntype IN (1, 2)
        AND a_news.lang = 1
        AND a_news.approved = 1
        AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()
    `);

    console.log(`Результат API запиту: ${apiTest.length > 0 ? 'ЗНАЙДЕНО' : 'НЕ ЗНАЙДЕНО'}`);
    
    if (apiTest.length > 0) {
      console.log('✅ API повинен повернути новину');
    } else {
      console.log('❌ API не поверне новину через умови WHERE');
    }

  } catch (error) {
    console.error('❌ Помилка:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 З\'єднання закрито');
    }
  }
}

// Запускаємо діагностику
debugNewsAPI();
