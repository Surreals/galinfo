/**
 * Скрипт для оновлення url_key для існуючих новин, які не мають цього поля
 * Базується на логіці з deprecated_php_app/gazda/_url_generator.php
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Функція транслітерації (копія з app/lib/transliteration.ts)
const transliterationMap = {
  // Малі літери
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'ґ': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'i', 'й': 'y', 'к': 'k', 'л': 'l',
  'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu',
  'я': 'ya', 'ъ': '', 'ы': 'i', 'э': 'e', '_': '_',
  
  // Великі літери
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
  'Ж': 'ZH', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L',
  'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'H', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHCH', 'Ь': '', 'Ю': 'YU',
  'Я': 'YA', 'Ъ': '', 'Ы': 'I', 'Э': 'E',
  
  // Додаткові символи
  'є': 'ie', 'Є': 'Ye', '\'': ''
};

function transliterate(text) {
  return text
    .split('')
    .map(char => transliterationMap[char] || char)
    .join('');
}

function generateUrlKey(title) {
  if (!title || typeof title !== 'string') {
    return '';
  }

  // Транслітерація
  let result = transliterate(title.trim());
  
  // Заміна множинних пробілів на одинарні
  result = result.replace(/\s{2,}/g, ' ');
  
  // Заміна пробілів на підкреслення
  result = result.replace(/\s/g, '_');
  
  // Видалення всіх символів, крім букв, цифр та підкреслень
  result = result.replace(/[^\w_]/g, '');
  
  // Видалення множинних підкреслень
  result = result.replace(/_+/g, '_');
  
  // Видалення підкреслень на початку та в кінці
  result = result.replace(/^_+|_+$/g, '');
  
  // Перетворення в нижній регістр
  result = result.toLowerCase();
  
  // Обмеження довжини
  if (result.length > 100) {
    result = result.substring(0, 100);
    // Видаляємо останнє підкреслення, якщо воно є
    result = result.replace(/_$/, '');
  }
  
  return result;
}

async function updateUrlKeys() {
  let connection;
  
  try {
    // Підключення до бази даних
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('Підключено до бази даних');

    // Знаходимо новини без url_key або з порожнім url_key
    const [rows] = await connection.execute(`
      SELECT a_news.id, a_news_headers.nheader 
      FROM a_news 
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE (a_news.urlkey IS NULL OR a_news.urlkey = '' OR a_news.urlkey = 'article')
      AND a_news_headers.nheader IS NOT NULL
      AND a_news_headers.nheader != ''
      ORDER BY a_news.id
    `);

    console.log(`Знайдено ${rows.length} новин для оновлення url_key`);

    if (rows.length === 0) {
      console.log('Немає новин для оновлення');
      return;
    }

    let updated = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        const urlKey = generateUrlKey(row.nheader);
        
        if (urlKey) {
          await connection.execute(
            'UPDATE a_news SET urlkey = ? WHERE id = ?',
            [urlKey, row.id]
          );
          
          console.log(`Оновлено ID ${row.id}: "${row.nheader}" -> "${urlKey}"`);
          updated++;
        } else {
          console.log(`Пропущено ID ${row.id}: не вдалося згенерувати url_key для "${row.nheader}"`);
          errors++;
        }
      } catch (error) {
        console.error(`Помилка при оновленні ID ${row.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\nЗавершено! Оновлено: ${updated}, Помилок: ${errors}`);

  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('З\'єднання з базою даних закрито');
    }
  }
}

// Запуск скрипта
if (require.main === module) {
  updateUrlKeys();
}

module.exports = { updateUrlKeys, generateUrlKey };
