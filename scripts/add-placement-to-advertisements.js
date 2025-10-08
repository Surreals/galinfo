const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Завантажуємо .env файл
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function addPlacementColumn() {
  let connection;
  
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfodb_db',
      port: parseInt(process.env.DB_PORT || '3306'),
    };

    console.log('🔌 Підключення до БД...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Підключено!\n');

    // Перевіряємо чи існує колонка placement
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM advertisements LIKE 'placement'"
    );

    if (columns.length > 0) {
      console.log('✅ Колонка placement вже існує\n');
    } else {
      console.log('🔨 Додавання колонки placement...');
      
      await connection.execute(`
        ALTER TABLE advertisements 
        ADD COLUMN placement VARCHAR(50) DEFAULT 'general' AFTER link_url,
        ADD INDEX idx_placement (placement)
      `);

      console.log('✅ Колонку placement додано!\n');
    }

    // Оновлюємо тестові дані
    console.log('📝 Оновлення тестових даних з placement...');
    
    await connection.execute(`
      UPDATE advertisements 
      SET placement = 'adbanner' 
      WHERE id = 1
    `);

    await connection.execute(`
      UPDATE advertisements 
      SET placement = 'infomo' 
      WHERE id = 2
    `);

    // Додаємо третю рекламу для sidebar якщо її немає
    const [existing] = await connection.execute(
      "SELECT id FROM advertisements WHERE placement = 'sidebar'"
    );

    if (existing.length === 0) {
      await connection.execute(`
        INSERT INTO advertisements 
        (title, image_url, link_url, placement, is_active, display_order)
        VALUES 
        ('Тестова реклама Sidebar', '/media/sample-ad3.jpg', 'https://example.com/sidebar', 'sidebar', true, 3)
      `);
      console.log('✅ Додано рекламу для sidebar');
    }

    console.log('✅ Тестові дані оновлено!\n');

    // Показуємо результат
    const [ads] = await connection.execute(
      'SELECT id, title, placement, is_active FROM advertisements ORDER BY id'
    );

    console.log('📊 Поточні реклами:');
    ads.forEach(ad => {
      console.log(`  ${ad.id}. [${ad.placement}] ${ad.title} (${ad.is_active ? 'активна' : 'неактивна'})`);
    });

    console.log('\n✨ Готово!');
    console.log('\n📍 Доступні позиції:');
    console.log('  - adbanner: головна реклама (AdBanner компонент)');
    console.log('  - infomo: IN-FOMO банер');
    console.log('  - sidebar: реклама в сайдбарі');
    console.log('  - general: загальна реклама (за замовчуванням)');

  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addPlacementColumn();

