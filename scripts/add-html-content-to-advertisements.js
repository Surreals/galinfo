const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addHtmlContentColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔄 Додавання колонок для HTML контенту...');

    // Перевіряємо чи існує колонка content_type
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'advertisements' 
        AND COLUMN_NAME IN ('content_type', 'html_content')
    `, [process.env.DB_NAME]);

    const existingColumns = columns.map(row => row.COLUMN_NAME);
    
    // Додаємо content_type якщо не існує
    if (!existingColumns.includes('content_type')) {
      await connection.query(`
        ALTER TABLE advertisements 
        ADD COLUMN content_type ENUM('image', 'html') DEFAULT 'image' AFTER link_url
      `);
      console.log('✅ Колонку content_type додано');
    } else {
      console.log('ℹ️  Колонка content_type вже існує');
    }

    // Додаємо html_content якщо не існує
    if (!existingColumns.includes('html_content')) {
      await connection.query(`
        ALTER TABLE advertisements 
        ADD COLUMN html_content TEXT NULL AFTER content_type
      `);
      console.log('✅ Колонку html_content додано');
    } else {
      console.log('ℹ️  Колонка html_content вже існує');
    }

    console.log('✅ Міграція завершена успішно!');

  } catch (error) {
    console.error('❌ Помилка при додаванні колонок:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

addHtmlContentColumn()
  .then(() => {
    console.log('✅ Скрипт виконано успішно');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Помилка:', error);
    process.exit(1);
  });


