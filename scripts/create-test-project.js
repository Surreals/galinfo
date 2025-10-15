const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestProject() {
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

    // Створюємо тестову новину-проект
    const newsQuery = `
      INSERT INTO a_news (
        images, ndate, ntime, ntype, nauthor, nauthorplus, showauthor, rubric, region, theme,
        nweight, nocomment, hiderss, approved, lang, rated, udate, urlkey, userid, layout,
        bytheme, ispopular, supervideo, printsubheader, topnews, isexpert, photo, video,
        subrubric, suggest, headlineblock, twitter_status, youcode, maininblock, isProject
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const currentDate = new Date();
    const ndate = currentDate.toISOString().split('T')[0];
    const ntime = currentDate.toTimeString().split(' ')[0].substring(0, 8);
    const udate = Math.floor(currentDate.getTime() / 1000);
    
    const newsValues = [
      '1,2,3', // images - тестові ID зображень
      ndate,
      ntime,
      1, // ntype - новина
      1, // nauthor
      '', // nauthorplus
      1, // showauthor
      '1', // rubric
      '1', // region
      0, // theme
      0, // nweight
      0, // nocomment
      0, // hiderss
      1, // approved
      1, // lang (українська)
      1, // rated
      udate,
      'test-project', // urlkey
      1, // userid
      0, // layout
      '', // bytheme
      0, // ispopular
      0, // supervideo
      0, // printsubheader
      0, // topnews
      0, // isexpert
      1, // photo
      0, // video
      0, // subrubric
      0, // suggest
      0, // headlineblock
      'published', // twitter_status
      '', // youcode
      1, // maininblock
      1  // isProject - це проект!
    ];
    
    console.log('📝 Створюємо тестову новину-проект...');
    const [newsResult] = await connection.execute(newsQuery, newsValues);
    const newsId = newsResult.insertId;
    
    console.log(`✅ Новина створена з ID: ${newsId}`);
    
    // Додаємо заголовки
    const headersQuery = `
      INSERT INTO a_news_headers (id, nheader, nsubheader, nteaser) 
      VALUES (?, ?, ?, ?)
    `;
    
    await connection.execute(headersQuery, [
      newsId,
      'Тестовий проект: Революція в області штучного інтелекту',
      'Нова технологія змінить підхід до машинного навчання назавжди',
      'Команда дослідників зі Стенфордського університету представила революційний підхід до навчання нейронних мереж, який може скоротити час навчання на 90% при збереженні точності результатів.'
    ]);
    
    console.log('✅ Заголовки додані');
    
    // Додаємо тіло новини
    const bodyQuery = `
      INSERT INTO a_news_body (id, nbody) 
      VALUES (?, ?)
    `;
    
    const bodyContent = `
      <h2>Прорив у технології</h2>
      <p>Нова технологія, яка отримала назву "AdaptiveFlow", дозволяє нейронним мережам самостійно адаптуватися до змін у вхідних даних без необхідності повного перетренування. Це відкриває нові можливості для створення більш гнучких та ефективних систем штучного інтелекту.</p>
      
      <h2>Практичне застосування</h2>
      <p>Технологія вже показала вражаючі результати в різних областях: від медичної діагностики до автономного водіння. Компанії Google, Microsoft та Tesla висловили зацікавленість в інтеграції AdaptiveFlow у свої продукти.</p>
      
      <p>Дослідники планують відкрити вихідний код AdaptiveFlow у наступному кварталі, що дозволить розробникам по всьому світу експериментувати з новою технологією та створювати на її основі інноваційні рішення.</p>
    `;
    
    await connection.execute(bodyQuery, [newsId, bodyContent]);
    
    console.log('✅ Тіло новини додано');
    
    // Додаємо мета-дані
    const metaQuery = `
      INSERT INTO a_newsmeta (id, ntitle, ndescription, nkeywords) 
      VALUES (?, ?, ?, ?)
    `;
    
    await connection.execute(metaQuery, [
      newsId,
      'Тестовий проект: Революція в області штучного інтелекту',
      'Команда дослідників зі Стенфордського університету представила революційний підхід до навчання нейронних мереж',
      'штучний інтелект, машинне навчання, нейронні мережі, AdaptiveFlow, технології'
    ]);
    
    console.log('✅ Мета-дані додані');
    
    // Додаємо теги
    const tags = ['ТЕХНОЛОГІЇ', 'ІННОВАЦІЇ', 'ШТУЧНИЙ ІНТЕЛЕКТ'];
    
    for (const tag of tags) {
      // Створюємо тег, якщо його немає
      const tagQuery = `INSERT IGNORE INTO a_tags (tag) VALUES (?)`;
      await connection.execute(tagQuery, [tag]);
      
      // Отримуємо ID тегу
      const [tagResult] = await connection.execute(`SELECT id FROM a_tags WHERE tag = ?`, [tag]);
      const tagId = tagResult[0].id;
      
      // Додаємо зв'язок новина-тег
      const tagMapQuery = `INSERT INTO a_tags_map (newsid, tagid) VALUES (?, ?)`;
      await connection.execute(tagMapQuery, [newsId, tagId]);
    }
    
    console.log('✅ Теги додані');
    
    console.log(`\n🎉 Тестовий проект створено успішно!`);
    console.log(`📰 ID новини: ${newsId}`);
    console.log(`🔗 URL: http://localhost:3001/news/test-project_${newsId}`);
    console.log(`\n📋 Особливості тестового проекту:`);
    console.log(`   - Позначка "Проект" увімкнена`);
    console.log(`   - Заголовок з підзаголовком та лідом`);
    console.log(`   - Контент з HTML розміткою`);
    console.log(`   - Теги: ${tags.join(', ')}`);
    console.log(`   - Тестові зображення: 1,2,3`);

  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 З\'єднання з базою даних закрито');
    }
  }
}

// Запускаємо скрипт
createTestProject();
