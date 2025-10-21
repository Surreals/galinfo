const mysql = require('mysql2/promise');
require('dotenv').config();

async function testTimezoneFixFinal() {
  let connection;
  
  try {
    // Підключення з новими налаштуваннями часової зони
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfodb_db',
      port: Number(process.env.DB_PORT || 3306),
      timezone: '+03:00' // Встановлюємо часову зону Києва
    });

    console.log('🔗 Підключено до бази даних з часовою зоною +03:00');

    // Встановлюємо часову зону для сесії
    await connection.execute("SET time_zone = '+03:00'");
    console.log('✅ Часова зона встановлена на +03:00');

    // Перевіряємо час сервера
    const [serverTime] = await connection.execute('SELECT NOW() as server_time');
    console.log(`🕐 Час сервера: ${serverTime[0].server_time}`);

    // Перевіряємо новину
    const [newsData] = await connection.execute(`
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news.ntime,
        a_news_headers.nheader,
        NOW() as server_time,
        CONCAT(a_news.ndate, ' ', a_news.ntime) as news_time,
        CONCAT(a_news.ndate, ' ', a_news.ntime) < NOW() as is_before_now
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.id = 437775
    `);

    if (newsData.length > 0) {
      const news = newsData[0];
      console.log('\n📰 Перевірка новини:');
      console.log(`ID: ${news.id}`);
      console.log(`Заголовок: ${news.nheader}`);
      console.log(`Дата: ${news.ndate}`);
      console.log(`Час: ${news.ntime}`);
      console.log(`Час сервера: ${news.server_time}`);
      console.log(`Час новини: ${news.news_time}`);
      console.log(`Чи новина раніше зараз: ${news.is_before_now ? 'ТАК' : 'НІ'}`);
    }

    // Тестуємо повний API запит
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

    console.log(`\n🔧 Результат API запиту: ${apiTest.length > 0 ? 'ЗНАЙДЕНО' : 'НЕ ЗНАЙДЕНО'}`);
    
    if (apiTest.length > 0) {
      console.log('🎉 Новина тепер повинна відображатися через API!');
      console.log('💡 Перезапустіть сервер, щоб зміни застосувалися.');
    } else {
      console.log('⚠️ Новина все ще не відображається.');
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

// Запускаємо тест
testTimezoneFixFinal();
