/**
 * Скрипт для ініціалізації дефолтних схем в базі даних
 * Копіює існуючі схеми з /app/lib/*Schema.js в таблицю template_schemas
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Імпортуємо схеми
const { desktopSchema, mobileSchema } = require('../app/lib/schema.js');
const { categoryDesktopSchema, categoryMobileSchema } = require('../app/lib/categorySchema.js');
const { heroSchema, heroInfoSchema, heroInfoMobileSchema } = require('../app/lib/heroSchema.js');
const { articlePageDesktopSchema, articlePageMobileSchema } = require('../app/lib/articlePageSchema.js');

async function initDefaultSchemas() {
  let connection;

  try {
    // Створюємо підключення до БД
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'galinfo',
    });

    console.log('✅ Підключено до бази даних');

    // Масив схем для вставки
    const schemas = [
      {
        template_id: 'main-desktop',
        name: 'Головна сторінка (Десктоп)',
        description: 'Схема для десктопної версії головної сторінки',
        schema_json: desktopSchema
      },
      {
        template_id: 'main-mobile',
        name: 'Головна сторінка (Мобільна)',
        description: 'Схема для мобільної версії головної сторінки',
        schema_json: mobileSchema
      },
      {
        template_id: 'category-desktop',
        name: 'Сторінка категорії (Десктоп)',
        description: 'Схема для десктопної версії сторінки категорії',
        schema_json: categoryDesktopSchema
      },
      {
        template_id: 'category-mobile',
        name: 'Сторінка категорії (Мобільна)',
        description: 'Схема для мобільної версії сторінки категорії',
        schema_json: categoryMobileSchema
      },
      {
        template_id: 'hero',
        name: 'Hero секція',
        description: 'Схема для Hero секції з каруселлю',
        schema_json: heroSchema
      },
      {
        template_id: 'hero-info-desktop',
        name: 'Hero Info (Десктоп)',
        description: 'Схема для інформаційної частини Hero секції (десктоп)',
        schema_json: heroInfoSchema
      },
      {
        template_id: 'hero-info-mobile',
        name: 'Hero Info (Мобільна)',
        description: 'Схема для інформаційної частини Hero секції (мобільна)',
        schema_json: heroInfoMobileSchema
      },
      {
        template_id: 'article-desktop',
        name: 'Сторінка статті (Десктоп)',
        description: 'Схема для десктопної версії сторінки статті',
        schema_json: articlePageDesktopSchema
      },
      {
        template_id: 'article-mobile',
        name: 'Сторінка статті (Мобільна)',
        description: 'Схема для мобільної версії сторінки статті',
        schema_json: articlePageMobileSchema
      }
    ];

    // Вставляємо або оновлюємо кожну схему
    for (const schema of schemas) {
      const query = `
        INSERT INTO template_schemas (template_id, name, description, schema_json)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          schema_json = VALUES(schema_json),
          updated_at = CURRENT_TIMESTAMP
      `;

      await connection.execute(query, [
        schema.template_id,
        schema.name,
        schema.description,
        JSON.stringify(schema.schema_json)
      ]);

      console.log(`✅ Збережено схему: ${schema.name} (${schema.template_id})`);
    }

    console.log('\n🎉 Всі дефолтні схеми успішно ініціалізовані!');

  } catch (error) {
    console.error('❌ Помилка:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ З\'єднання з базою даних закрито');
    }
  }
}

// Запускаємо скрипт
initDefaultSchemas();

