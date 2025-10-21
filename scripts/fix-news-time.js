const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixNewsTime() {
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

    // Отримуємо дані новини
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
    
    if (utcMinutes < 0) {
      // Якщо час стає від'ємним, переносимо на попередній день
      const newUtcMinutes = utcMinutes + 1440; // Додаємо 24 години
      const newHours = Math.floor(newUtcMinutes / 60);
      const newMinutes = newUtcMinutes % 60;
      const newSeconds = seconds;
      
      const utcTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds}`;
      
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
      
    } else {
      const newHours = Math.floor(utcMinutes / 60);
      const newMinutes = utcMinutes % 60;
      const newSeconds = seconds;
      
      const utcTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds}`;
      
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
    }

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

    // Перевіряємо, чи тепер новина вважається опублікованою
    const [publishCheck] = await connection.execute(`
      SELECT 
        CONCAT(a_news.ndate, ' ', a_news.ntime) as news_time,
        NOW() as server_time,
        CONCAT(a_news.ndate, ' ', a_news.ntime) < NOW() as is_published
      FROM a_news 
      WHERE a_news.id = 437775
    `);

    console.log('\n🧪 Перевірка публікації:');
    console.log(`Час новини: ${publishCheck[0].news_time}`);
    console.log(`Час сервера: ${publishCheck[0].server_time}`);
    console.log(`Чи опублікована: ${publishCheck[0].is_published ? 'ТАК' : 'НІ'}`);

    if (publishCheck[0].is_published) {
      console.log('🎉 Новина тепер повинна відображатися!');
    } else {
      console.log('⚠️ Новина все ще не відображається. Можливо, потрібно оновити інші новини.');
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
fixNewsTime();
