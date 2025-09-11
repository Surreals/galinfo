const mysql = require('mysql2/promise');
require('dotenv').config();

async function testNewsAPI() {
  let connection;
  
  try {
    // Підключення до БД
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfodb_db',
      port: parseInt(process.env.DB_PORT || '3306'),
      charset: 'utf8mb4'
    });

    console.log('✅ Connected to database');

    // Перевіряємо наявність таблиць
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('a_news', 'a_news_body', 'a_news_headers', 'a_news_slideheaders', 'a_newsmeta', 'a_tags_map', 'a_tags')
    `, [process.env.DB_NAME || 'galinfodb_db']);

    console.log('📋 Available tables:', tables.map(t => t.TABLE_NAME));

    // Перевіряємо структуру таблиці a_news
    const [newsColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'a_news'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'galinfodb_db']);

    console.log('📊 a_news table structure:');
    newsColumns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Перевіряємо кількість записів
    const [newsCount] = await connection.execute('SELECT COUNT(*) as count FROM a_news');
    console.log(`📈 Total news records: ${newsCount[0].count}`);

    // Перевіряємо останні 5 записів
    const [recentNews] = await connection.execute(`
      SELECT n.id, n.ndate, n.ntime, n.approved, nh.nheader
      FROM a_news n
      LEFT JOIN a_news_headers nh ON n.id = nh.id
      ORDER BY n.id DESC
      LIMIT 5
    `);

    console.log('📰 Recent news:');
    recentNews.forEach(news => {
      console.log(`  ID: ${news.id}, Date: ${news.ndate} ${news.ntime}, Approved: ${news.approved}, Title: ${news.nheader || 'No title'}`);
    });

    // Тестуємо запит для конкретної новини (ID 437718)
    const [specificNews] = await connection.execute(`
      SELECT 
        n.*,
        nb.nbody,
        nh.nheader,
        nh.nsubheader,
        nh.nteaser,
        nsh.sheader,
        nsh.steaser,
        nm.ntitle,
        nm.ndescription,
        nm.nkeywords
      FROM a_news n
      LEFT JOIN a_news_body nb ON n.id = nb.id
      LEFT JOIN a_news_headers nh ON n.id = nh.id
      LEFT JOIN a_news_slideheaders nsh ON n.id = nsh.id
      LEFT JOIN a_newsmeta nm ON n.id = nm.id
      WHERE n.id = ?
    `, [437718]);

    if (specificNews.length > 0) {
      console.log('🎯 Found news with ID 437718:');
      const news = specificNews[0];
      console.log(`  Title: ${news.nheader}`);
      console.log(`  Date: ${news.ndate} ${news.ntime}`);
      console.log(`  Approved: ${news.approved}`);
      console.log(`  Body length: ${news.nbody ? news.nbody.length : 0} characters`);
    } else {
      console.log('❌ News with ID 437718 not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testNewsAPI();
