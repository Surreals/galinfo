const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Завантажуємо .env файл
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkAndCreateTable() {
  let connection;
  
  try {
    // Спробуємо підключитись через змінні середовища з app/lib/db.ts
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfodb_db',
      port: parseInt(process.env.DB_PORT || '3306'),
    };

    console.log('🔌 Спроба підключення до БД...');
    console.log('Host:', dbConfig.host);
    console.log('Database:', dbConfig.database);
    console.log('User:', dbConfig.user);

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Підключено до БД успішно!\n');

    // Перевіряємо чи існує таблиця
    console.log('🔍 Перевірка наявності таблиці advertisements...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'advertisements'"
    );

    if (tables.length > 0) {
      console.log('✅ Таблиця advertisements вже існує\n');
      
      // Покажемо структуру
      const [columns] = await connection.execute('DESCRIBE advertisements');
      console.log('📋 Структура таблиці:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
      
      // Покажемо кількість записів
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM advertisements');
      console.log(`\n📊 Записів у таблиці: ${count[0].total}`);
      
    } else {
      console.log('⚠️  Таблиця advertisements не знайдена\n');
      console.log('🔨 Створення таблиці...\n');

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS advertisements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          image_url VARCHAR(500),
          link_url VARCHAR(500) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          display_order INT DEFAULT 0,
          click_count INT DEFAULT 0,
          view_count INT DEFAULT 0,
          start_date DATETIME NULL,
          end_date DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_active (is_active),
          INDEX idx_order (display_order),
          INDEX idx_dates (start_date, end_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log('✅ Таблицю advertisements створено!\n');

      // Додаємо тестові дані
      console.log('📝 Додавання тестових даних...');
      await connection.execute(`
        INSERT INTO advertisements (title, image_url, link_url, is_active, display_order)
        VALUES 
          ('Тестова реклама 1', '/media/sample-ad.jpg', 'https://example.com', true, 1),
          ('Тестова реклама 2', '/media/sample-ad2.jpg', 'https://example.com/promo', false, 2)
      `);
      console.log('✅ Тестові дані додано!\n');
    }

    console.log('✨ Готово!');

  } catch (error) {
    console.error('❌ Помилка:', error.message);
    console.error('\n💡 Перевірте:');
    console.error('  1. Чи запущений MySQL сервер');
    console.error('  2. Чи правильні дані підключення в .env');
    console.error('  3. Чи існує база даних:', process.env.DB_NAME || 'galinfodb_db');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndCreateTable();

