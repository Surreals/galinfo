const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSpecificNews() {
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

    // Перевіряємо конкретну новину
    const [newsData] = await connection.execute(`
      SELECT 
        a_news.id, 
        a_news.ndate, 
        a_news.ntime, 
        a_news.approved,
        a_news_headers.nheader
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.id = 437775
    `);

    if (newsData.length === 0) {
      console.log('❌ Новину з ID 437775 не знайдено');
      return;
    }

    const news = newsData[0];
    
    console.log('📰 Дані новини:');
    console.log(`ID: ${news.id}`);
    console.log(`Заголовок: ${news.nheader}`);
    console.log(`Дата: ${news.ndate}`);
    console.log(`Час: ${news.ntime}`);
    console.log(`Схвалено: ${news.approved}`);

    // Тестуємо різні способи порівняння часу
    console.log('\n🧪 Тестування порівняння часу:');
    
    // 1. Пряме порівняння в SQL
    const [directComparison] = await connection.execute(`
      SELECT 
        CONCAT(a_news.ndate, ' ', a_news.ntime) as news_time,
        NOW() as server_time,
        CONCAT(a_news.ndate, ' ', a_news.ntime) < NOW() as is_before_now
      FROM a_news 
      WHERE a_news.id = 437775
    `);
    
    console.log(`1. Час новини: ${directComparison[0].news_time}`);
    console.log(`2. Час сервера: ${directComparison[0].server_time}`);
    console.log(`3. Чи новина раніше зараз: ${directComparison[0].is_before_now}`);

    // 2. Перевіряємо з UTC
    const [utcComparison] = await connection.execute(`
      SELECT 
        CONCAT(a_news.ndate, ' ', a_news.ntime) as news_time,
        UTC_TIMESTAMP() as utc_time,
        CONCAT(a_news.ndate, ' ', a_news.ntime) < UTC_TIMESTAMP() as is_before_utc
      FROM a_news 
      WHERE a_news.id = 437775
    `);
    
    console.log(`4. UTC час: ${utcComparison[0].utc_time}`);
    console.log(`5. Чи новина раніше UTC: ${utcComparison[0].is_before_utc}`);

    // 3. Перевіряємо з конвертацією часових зон
    const [timezoneComparison] = await connection.execute(`
      SELECT 
        CONCAT(a_news.ndate, ' ', a_news.ntime) as news_time,
        CONVERT_TZ(NOW(), @@session.time_zone, '+00:00') as utc_now,
        CONCAT(a_news.ndate, ' ', a_news.ntime) < CONVERT_TZ(NOW(), @@session.time_zone, '+00:00') as is_before_utc_converted
      FROM a_news 
      WHERE a_news.id = 437775
    `);
    
    console.log(`6. UTC конвертований: ${timezoneComparison[0].utc_now}`);
    console.log(`7. Чи новина раніше UTC конвертованого: ${timezoneComparison[0].is_before_utc_converted}`);

    console.log('\n💡 Рекомендації:');
    if (news.is_published === 0) {
      console.log('❌ Проблема: Новина вважається неопублікованою через порівняння часу');
      console.log('🔧 Рішення: Потрібно виправити логіку порівняння часу в API');
    } else {
      console.log('✅ Новина повинна відображатися');
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

// Запускаємо перевірку
checkSpecificNews();
