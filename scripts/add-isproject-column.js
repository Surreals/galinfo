const mysql = require('mysql2/promise');
require('dotenv').config();

async function addIsProjectColumn() {
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

    // Перевіряємо, чи існує колонка isProject
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'a_news' AND COLUMN_NAME = 'isProject'
    `, [process.env.DB_NAME || 'galinfo']);

    if (columns.length > 0) {
      console.log('✅ Колонка isProject вже існує в таблиці a_news');
      return;
    }

    // Додаємо колонку isProject
    await connection.execute(`
      ALTER TABLE a_news 
      ADD COLUMN isProject TINYINT(1) NOT NULL DEFAULT 0 
      COMMENT 'Позначає, чи є новина проектом'
    `);

    console.log('✅ Колонка isProject успішно додана до таблиці a_news');

    // Показуємо структуру таблиці
    const [tableStructure] = await connection.execute('DESCRIBE a_news');
    console.log('\n📋 Структура таблиці a_news:');
    tableStructure.forEach(row => {
      if (row.Field === 'isProject') {
        console.log(`  ${row.Field}: ${row.Type} ${row.Null} ${row.Key} ${row.Default} ${row.Extra}`);
      }
    });

  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 З\'єднання з базою даних закрито');
    }
  }
}

// Запускаємо скрипт
addIsProjectColumn();
