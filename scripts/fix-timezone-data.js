const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTimezoneData() {
  let connection;
  
  try {
    // Підключення до бази даних
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfodb_db',
      port: Number(process.env.DB_PORT || 3306),
      timezone: 'Z' // UTC timezone
    });

    console.log('🔗 Підключено до бази даних');

    // Перевіряємо поточний час сервера
    const [serverTime] = await connection.execute('SELECT NOW() as server_time');
    console.log('🕐 Час сервера:', serverTime[0].server_time);

    // Перевіряємо кілька записів з новин
    const [newsData] = await connection.execute(`
      SELECT a_news.id, a_news.ndate, a_news.ntime, a_news_headers.nheader 
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.lang = '1' 
      ORDER BY a_news.ndate DESC, a_news.ntime DESC 
      LIMIT 5
    `);

    console.log('\n📰 Останні 5 новин:');
    newsData.forEach((news, index) => {
      console.log(`${index + 1}. ID: ${news.id}, Дата: ${news.ndate}, Час: ${news.ntime}, Заголовок: ${news.nheader?.substring(0, 50)}...`);
    });

    // Перевіряємо, чи є проблеми з часовими зонами
    console.log('\n🔍 Аналіз часових зон:');
    
    // Перевіряємо, чи час в базі даних є UTC
    const [timezoneCheck] = await connection.execute(`
      SELECT 
        @@global.time_zone as global_timezone,
        @@session.time_zone as session_timezone,
        @@system_time_zone as system_timezone
    `);
    
    console.log('🌍 Глобальна часова зона:', timezoneCheck[0].global_timezone);
    console.log('📅 Сесійна часова зона:', timezoneCheck[0].session_timezone);
    console.log('⚙️ Системна часова зона:', timezoneCheck[0].system_timezone);

    // Перевіряємо, чи потрібно виправляти дані
    const [problematicNews] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM a_news 
      WHERE ntime IS NOT NULL 
      AND ntime != '00:00:00'
      AND HOUR(ntime) > 20
    `);

    console.log(`\n⚠️ Новин з часом після 20:00: ${problematicNews[0].count}`);

    if (problematicNews[0].count > 0) {
      console.log('\n🔧 Можливо, потрібно виправити дані в базі...');
      
      // Показуємо приклади проблемних записів
      const [examples] = await connection.execute(`
        SELECT id, ndate, ntime, nheader
        FROM a_news 
        WHERE ntime IS NOT NULL 
        AND ntime != '00:00:00'
        AND HOUR(ntime) > 20
        LIMIT 3
      `);

      console.log('\n📋 Приклади проблемних записів:');
      examples.forEach((news, index) => {
        console.log(`${index + 1}. ID: ${news.id}, Дата: ${news.ndate}, Час: ${news.ntime}`);
      });
    }

    console.log('\n✅ Аналіз завершено. Якщо час відображається неправильно, перезапустіть сервер.');

  } catch (error) {
    console.error('❌ Помилка:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 З\'єднання закрито');
    }
  }
}

// Запускаємо скрипт
fixTimezoneData();
