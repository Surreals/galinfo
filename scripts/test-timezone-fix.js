const mysql = require('mysql2/promise');
require('dotenv').config();

async function testTimezoneFix() {
  let connection;
  
  try {
    // Підключення до бази даних БЕЗ timezone: 'Z'
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfodb_db',
      port: Number(process.env.DB_PORT || 3306)
      // НЕ додаємо timezone: 'Z'
    });

    console.log('🔗 Підключено до бази даних (без timezone: Z)');

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
      LIMIT 3
    `);

    console.log('\n📰 Останні 3 новини:');
    newsData.forEach((news, index) => {
      console.log(`${index + 1}. ID: ${news.id}, Дата: ${news.ndate}, Час: ${news.ntime}, Заголовок: ${news.nheader?.substring(0, 30)}...`);
    });

    // Тестуємо конвертацію часу
    console.log('\n🧪 Тестування конвертації часу:');
    newsData.forEach((news, index) => {
      if (news.ndate && news.ntime) {
        // Конвертуємо дату в ISO формат
        const isoDate = news.ndate.toISOString().split('T')[0];
        const dateTimeString = `${isoDate}T${news.ntime}Z`;
        const dateObj = new Date(dateTimeString);
        
        // Використовуємо локальний час (автоматично конвертується з UTC)
        const localTime = dateObj.toLocaleTimeString('uk-UA', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        console.log(`${index + 1}. Оригінал: ${news.ntime} → Локальний: ${localTime}`);
      }
    });

    console.log('\n✅ Тест завершено. Тепер перезапустіть сервер і перевірте адмін-панель.');

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
testTimezoneFix();
