const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Завантажуємо .env файл
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function resetTemplates() {
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

    // Список шаблонів для оновлення
    const templateIds = [
      'category-desktop',
      'category-mobile',
      'article-desktop',
      'article-mobile'
    ];

    console.log('🗑️  Видалення старих шаблонів...\n');

    for (const templateId of templateIds) {
      const [result] = await connection.execute(
        'DELETE FROM template_schemas WHERE template_id = ?',
        [templateId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ Видалено: ${templateId}`);
      } else {
        console.log(`⚠️  Не знайдено: ${templateId}`);
      }
    }

    console.log('\n✨ Готово!');
    console.log('\n📝 Шаблони будуть автоматично створені з новими advertisementId');
    console.log('   при наступному відкритті /admin/templates');
    console.log('\n💡 Або викличте GET /api/admin/templates для їх створення');

  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetTemplates();

