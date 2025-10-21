const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkServerTimezone() {
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

    // Перевіряємо поточні налаштування часової зони
    const [timezoneInfo] = await connection.execute(`
      SELECT 
        @@global.time_zone as global_timezone,
        @@session.time_zone as session_timezone,
        @@system_time_zone as system_timezone,
        NOW() as server_time
    `);
    
    console.log('🌍 Налаштування часової зони сервера:');
    console.log(`Глобальна часова зона: ${timezoneInfo[0].global_timezone}`);
    console.log(`Сесійна часова зона: ${timezoneInfo[0].session_timezone}`);
    console.log(`Системна часова зона: ${timezoneInfo[0].system_timezone}`);
    console.log(`Час сервера: ${timezoneInfo[0].server_time}`);

    // Встановлюємо часову зону на Europe/Kiev
    console.log('\n🔧 Встановлення часової зони на Europe/Kiev...');
    
    try {
      await connection.execute(`SET time_zone = '+03:00'`);
      console.log('✅ Часова зона встановлена на +03:00 (Europe/Kiev)');
      
      // Перевіряємо новий час
      const [newTime] = await connection.execute(`SELECT NOW() as new_server_time`);
      console.log(`Новий час сервера: ${newTime[0].new_server_time}`);
      
    } catch (error) {
      console.log('⚠️ Не вдалося встановити часову зону через SQL. Спробуємо альтернативний метод...');
      
      // Альтернативний метод - встановлення через змінну середовища
      console.log('💡 Рекомендація: Встановіть змінну середовища TZ=Europe/Kiev перед запуском сервера');
    }

    // Перевіряємо новину з новою часовою зоною
    const [newsCheck] = await connection.execute(`
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

    if (newsCheck.length > 0) {
      const news = newsCheck[0];
      console.log('\n📰 Перевірка новини з новою часовою зоною:');
      console.log(`ID: ${news.id}`);
      console.log(`Заголовок: ${news.nheader}`);
      console.log(`Дата: ${news.ndate}`);
      console.log(`Час: ${news.ntime}`);
      console.log(`Час сервера: ${news.server_time}`);
      console.log(`Час новини: ${news.news_time}`);
      console.log(`Чи новина раніше зараз: ${news.is_before_now ? 'ТАК' : 'НІ'}`);
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
checkServerTimezone();
