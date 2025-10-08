const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Завантажуємо .env файл
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Імпортуємо оновлені схеми
const { categoryDesktopSchema, categoryMobileSchema } = require('../app/lib/categorySchema');
const { articlePageDesktopSchema, articlePageMobileSchema } = require('../app/lib/articlePageSchema');

async function updateTemplates() {
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

    // Список шаблонів для оновлення з новими advertisementId
    const templatesToUpdate = [
      {
        template_id: 'category-desktop',
        name: 'Сторінка категорії (Десктоп)',
        description: 'Схема для десктопної версії сторінки категорії з advertisementId',
        schema: categoryDesktopSchema
      },
      {
        template_id: 'category-mobile',
        name: 'Сторінка категорії (Мобільна)',
        description: 'Схема для мобільної версії сторінки категорії з advertisementId',
        schema: categoryMobileSchema
      },
      {
        template_id: 'article-desktop',
        name: 'Сторінка статті (Десктоп)',
        description: 'Схема для десктопної версії сторінки статті з advertisementId',
        schema: articlePageDesktopSchema
      },
      {
        template_id: 'article-mobile',
        name: 'Сторінка статті (Мобільна)',
        description: 'Схема для мобільної версії сторінки статті з advertisementId',
        schema: articlePageMobileSchema
      }
    ];

    console.log('📝 Оновлення шаблонів з advertisementId...\n');

    for (const template of templatesToUpdate) {
      try {
        // Перевіряємо чи існує шаблон
        const [existing] = await connection.execute(
          'SELECT id FROM template_schemas WHERE template_id = ?',
          [template.template_id]
        );

        if (existing.length > 0) {
          // Оновлюємо існуючий шаблон
          await connection.execute(
            `UPDATE template_schemas 
             SET name = ?, description = ?, schema_json = ?, updated_at = CURRENT_TIMESTAMP
             WHERE template_id = ?`,
            [
              template.name,
              template.description,
              JSON.stringify(template.schema),
              template.template_id
            ]
          );
          console.log(`✅ Оновлено: ${template.template_id}`);
        } else {
          // Створюємо новий шаблон
          await connection.execute(
            `INSERT INTO template_schemas (template_id, name, description, schema_json)
             VALUES (?, ?, ?, ?)`,
            [
              template.template_id,
              template.name,
              template.description,
              JSON.stringify(template.schema)
            ]
          );
          console.log(`➕ Створено: ${template.template_id}`);
        }
      } catch (error) {
        console.error(`❌ Помилка для ${template.template_id}:`, error.message);
      }
    }

    console.log('\n✨ Оновлення завершено!');
    console.log('\n📋 Шаблони тепер містять:');
    console.log('  - advertisementId для AD_BANNER блоків');
    console.log('  - advertisementId для BANNER_IMAGE блоків');
    console.log('\n💡 Відкрийте /admin/templates щоб побачити зміни');

  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateTemplates();

