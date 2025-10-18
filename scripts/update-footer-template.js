#!/usr/bin/env node

/**
 * Скрипт для оновлення шаблону футера в базі даних
 * Прибирає старий формат з 'items' і залишає тільки 'categoryIds'
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Підключення до бази даних
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'galinfo',
  charset: 'utf8mb4'
};

// Нова схема футера (оновлена версія)
const updatedFooterSchema = {
  // Блок "АГЕНЦІЯ" - статичні посилання
  agency: {
    enabled: true,
    // Порядок посилань не змінюється, вони статичні
  },

  // Блок "ТОП ТЕМИ" - можна додавати будь-які категорії
  topThemes: {
    enabled: true,
    categoryIds: [136, 140, 142], // ВІДВЕРТА РОЗМОВА_З, ПРЕССЛУЖБА, РАЙОНИ ЛЬВОВА
  },

  // Блок "КАТЕГОРІЇ"
  categories: {
    enabled: true,
    
    // Колонки - тепер ГНУЧКІ! Можна додавати будь-які категорії та додаткові елементи
    // Просто вказуйте ID (числа) для категорій або param (рядки) для додаткових елементів
    // Приклад: [7, 99, 'news', 'articles', 110] - можна мішати категорії та додаткові елементи!
    
    column1: {
      categoryIds: [7, 99, 110, 111, 118], // ID категорій: УКРАЇНА, ЛЬВІВ, ЄВРОПА, СВІТ, ВОЛИНЬ
    },

    column2: {
      categoryIds: [4, 2, 3, 5, 101], // ID категорій: СУСПІЛЬСТВО, ПОЛІТИКА, ЕКОНОМІКА, КУЛЬТУРА, ЗДОРОВ'Я
      maxItems: 5,
    },

    column3: {
      categoryIds: [109, 103, 100, 106], // ID категорій: ВІЙНА З РОСІЄЮ, СПОРТ, КРИМІНАЛ, НАДЗВИЧАЙНІ ПОДІЇ
      maxItems: 4, // Обмежуємо до 4 елементів
    },

    // Четверта колонка - можна додавати як категорії (числа), так і додаткові елементи (рядки)
    // Доступні додаткові елементи: 'news', 'articles', 'archive', 'about', 'commercial'
    column4: {
      categoryIds: ['news', 'articles'], // Можна мішати: [109, 'news', 103, 'articles']
      maxItems: 2,
    }
  },

  // Нижня секція футера
  bottomSection: {
    // Логотип
    logo: {
      enabled: true,
    },
    
    // Копірайт
    copyright: {
      enabled: true,
      // Текст автоматичний
    },

    // Соціальні мережі
    socialLinks: {
      enabled: true,
      facebook: true,
      twitter: true,
      instagram: true,
      rss: true,
    },

    // Кнопка "САЙТ СТВОРЕНИЙ IN-FOMO"
    siteCreator: {
      enabled: true,
    }
  }
};

async function updateFooterTemplate() {
  let connection;
  
  try {
    console.log('🔌 Підключення до бази даних...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Підключено до бази даних');

    // Перевіряємо, чи існує шаблон футера
    console.log('🔍 Перевірка існування шаблону футера...');
    const [existingTemplates] = await connection.execute(
      'SELECT id, template_id, name, schema_json FROM template_schemas WHERE template_id = ?',
      ['footer']
    );

    if (existingTemplates.length === 0) {
      console.log('❌ Шаблон футера не знайдено! Створюємо новий...');
      
      // Створюємо новий шаблон
      await connection.execute(
        `INSERT INTO template_schemas (template_id, name, description, schema_json)
         VALUES (?, ?, ?, ?)`,
        [
          'footer',
          'Налаштування футера',
          'Конфігурація футера: порядок категорій та елементів',
          JSON.stringify(updatedFooterSchema)
        ]
      );
      
      console.log('✅ Створено новий шаблон футера');
    } else {
      console.log('📝 Оновлення існуючого шаблону футера...');
      
      // Оновлюємо існуючий шаблон
      await connection.execute(
        `UPDATE template_schemas 
         SET schema_json = ?, updated_at = CURRENT_TIMESTAMP
         WHERE template_id = ?`,
        [JSON.stringify(updatedFooterSchema), 'footer']
      );
      
      console.log('✅ Шаблон футера успішно оновлено!');
    }

    // Перевіряємо результат
    const [updatedTemplates] = await connection.execute(
      'SELECT template_id, name, schema_json FROM template_schemas WHERE template_id = ?',
      ['footer']
    );

    if (updatedTemplates.length > 0) {
      const template = updatedTemplates[0];
      console.log('📋 Оновлений шаблон:');
      console.log(`   ID: ${template.template_id}`);
      console.log(`   Назва: ${template.name}`);
      
      const schema = JSON.parse(template.schema_json);
      console.log(`   Column4 categoryIds: [${schema.categories.column4.categoryIds.map(id => 
        typeof id === 'string' ? `"${id}"` : id
      ).join(', ')}]`);
      
      // Перевіряємо, чи немає залишків старого формату
      const hasOldFormat = JSON.stringify(template.schema_json).includes('"items"');
      if (hasOldFormat) {
        console.log('⚠️  УВАГА: Знайдено залишки старого формату "items"!');
      } else {
        console.log('✅ Старий формат "items" повністю прибрано!');
      }
    }

    console.log('\n🎉 Оновлення завершено успішно!');
    console.log('\n📝 Що змінилося:');
    console.log('   - Прибрано параметр "items"');
    console.log('   - Залишено тільки "categoryIds"');
    console.log('   - Додано підтримку рядків у categoryIds: ["news", "articles"]');
    console.log('\n🚀 Тепер можна використовувати:');
    console.log('   "categoryIds": ["news", "articles", 109, 103]');

  } catch (error) {
    console.error('❌ Помилка при оновленні шаблону футера:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 З\'єднання з базою даних закрито');
    }
  }
}

// Запускаємо скрипт
if (require.main === module) {
  updateFooterTemplate()
    .then(() => {
      console.log('\n✨ Скрипт виконано успішно!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Критична помилка:', error);
      process.exit(1);
    });
}

module.exports = { updateFooterTemplate };
