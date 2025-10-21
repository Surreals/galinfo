const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixNewsTimeUTC() {
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

    // Отримуємо поточні дані новини
    const [newsData] = await connection.execute(`
      SELECT a_news.id, a_news.ndate, a_news.ntime, a_news_headers.nheader
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.id = 437775
    `);

    if (newsData.length === 0) {
      console.log('❌ Новину з ID 437775 не знайдено');
      return;
    }

    const news = newsData[0];
    console.log('📰 Поточні дані новини:');
    console.log(`ID: ${news.id}`);
    console.log(`Заголовок: ${news.nheader}`);
    console.log(`Дата: ${news.ndate}`);
    console.log(`Час: ${news.ntime}`);

    // Конвертуємо локальний час в UTC (віднімаємо 3 години)
    const currentTime = news.ntime;
    const [hours, minutes, seconds] = currentTime.split(':');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const utcMinutes = totalMinutes - 180; // Віднімаємо 3 години (180 хвилин)
    
    let utcTime;
    if (utcMinutes < 0) {
      // Якщо час стає від'ємним, переносимо на попередній день
      const newUtcMinutes = utcMinutes + 1440; // Додаємо 24 години
      const newHours = Math.floor(newUtcMinutes / 60);
      const newMinutes = newUtcMinutes % 60;
      utcTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${seconds}`;
    } else {
      const newHours = Math.floor(utcMinutes / 60);
      const newMinutes = utcMinutes % 60;
      utcTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${seconds}`;
    }
    
    console.log(`\n🔄 Конвертація часу:`);
    console.log(`Локальний час: ${currentTime}`);
    console.log(`UTC час: ${utcTime}`);
    
    // Оновлюємо час в базі даних
    await connection.execute(`
      UPDATE a_news 
      SET ntime = ? 
      WHERE id = 437775
    `, [utcTime]);
    
    console.log('✅ Час новини оновлено в UTC');

    // Перевіряємо результат
    const [updatedNews] = await connection.execute(`
      SELECT a_news.id, a_news.ndate, a_news.ntime, a_news_headers.nheader
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.id = 437775
    `);

    console.log('\n📰 Оновлені дані новини:');
    console.log(`ID: ${updatedNews[0].id}`);
    console.log(`Заголовок: ${updatedNews[0].nheader}`);
    console.log(`Дата: ${updatedNews[0].ndate}`);
    console.log(`Час: ${updatedNews[0].ntime}`);

    // Перевіряємо умову API
    const [apiCheck] = await connection.execute(`
      SELECT 
        CONCAT(a_news.ndate, ' ', a_news.ntime) as news_time,
        NOW() as server_time,
        CONCAT(a_news.ndate, ' ', a_news.ntime) < NOW() as is_before_now
      FROM a_news 
      WHERE a_news.id = 437775
    `);

    console.log('\n🧪 Перевірка умови API:');
    console.log(`Час новини: ${apiCheck[0].news_time}`);
    console.log(`Час сервера: ${apiCheck[0].server_time}`);
    console.log(`Чи новина раніше зараз: ${apiCheck[0].is_before_now ? 'ТАК' : 'НІ'}`);

    // Тестуємо повний запит API
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
    } else {
      console.log('⚠️ Новина все ще не відображається. Потрібно додаткове дослідження.');
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

// Запускаємо виправлення
fixNewsTimeUTC();
