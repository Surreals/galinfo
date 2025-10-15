const mysql = require('mysql2/promise');
require('dotenv').config();

async function testProjectFeature() {
  let connection;
  
  try {
    // Підключення до бази даних
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfo',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔗 Підключено до бази даних');

    // Перевіряємо наявність колонки isProject
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'a_news' AND COLUMN_NAME = 'isProject'
    `, [process.env.DB_NAME || 'galinfo']);

    if (columns.length === 0) {
      console.log('❌ Колонка isProject не знайдена в таблиці a_news');
      return;
    }

    console.log('✅ Колонка isProject знайдена:');
    console.log(`   Тип: ${columns[0].DATA_TYPE}`);
    console.log(`   Nullable: ${columns[0].IS_NULLABLE}`);
    console.log(`   Default: ${columns[0].COLUMN_DEFAULT}`);

    // Перевіряємо кількість новин з позначкою проекту
    const [projectCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM a_news WHERE isProject = 1
    `);

    console.log(`\n📊 Статистика проектів:`);
    console.log(`   Кількість новин з позначкою "Проект": ${projectCount[0].count}`);

    // Показуємо приклади новин з позначкою проекту
    const [projectNews] = await connection.execute(`
      SELECT a_news.id, a_news_headers.nheader, a_news.ndate, a_news.ntime, a_news.isProject
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.isProject = 1 
      ORDER BY a_news.ndate DESC, a_news.ntime DESC 
      LIMIT 5
    `);

    if (projectNews.length > 0) {
      console.log(`\n📰 Останні новини з позначкою "Проект":`);
      projectNews.forEach((news, index) => {
        console.log(`   ${index + 1}. ID: ${news.id} - "${news.nheader}" (${news.ndate} ${news.ntime})`);
      });
    } else {
      console.log(`\n📰 Новини з позначкою "Проект" не знайдені`);
    }

    // Показуємо загальну статистику
    const [totalNews] = await connection.execute(`
      SELECT COUNT(*) as count FROM a_news WHERE approved = 1
    `);

    console.log(`\n📈 Загальна статистика:`);
    console.log(`   Всього опублікованих новин: ${totalNews[0].count}`);
    console.log(`   Проектів: ${projectCount[0].count}`);
    console.log(`   Звичайних новин: ${totalNews[0].count - projectCount[0].count}`);

  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 З\'єднання з базою даних закрито');
    }
  }
}

// Запускаємо тест
testProjectFeature();
