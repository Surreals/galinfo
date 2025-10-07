/**
 * Схема для конфігурації футера
 * Визначає порядок та список елементів у футері
 */

export const footerSchema = {
  // Блок "АГЕНЦІЯ" - статичні посилання
  agency: {
    enabled: true,
    // Порядок посилань не змінюється, вони статичні
  },

  // Блок "ТОП ТЕМИ"
  topThemes: {
    enabled: true,
    categoryIds: [136, 140, 142], // ВІДВЕРТА РОЗМОВА_З, ПРЕССЛУЖБА, РАЙОНИ ЛЬВОВА
  },

  // Блок "КАТЕГОРІЇ"
  categories: {
    enabled: true,
    
    // Перша колонка - Регіони та географічні теми
    column1: {
      type: 'regions',
      categoryIds: [7, 99, 110, 111, 118], // УКРАЇНА, ЛЬВІВ, ЄВРОПА, СВІТ, ВОЛИНЬ
    },

    // Друга колонка - Основні теми
    column2: {
      type: 'mainCategories',
      categoryIds: [4, 2, 3, 5, 101], // СУСПІЛЬСТВО, ПОЛІТИКА, ЕКОНОМІКА, КУЛЬТУРА, ЗДОРОВ'Я
      maxItems: 5,
    },

    // Третя колонка - Додаткові теми (тільки 4 категорії)
    column3: {
      type: 'mainCategories',
      categoryIds: [109, 103, 100, 106], // ВІЙНА З РОСІЄЮ, СПОРТ, КРИМІНАЛ, НАДЗВИЧАЙНІ ПОДІЇ
      maxItems: 4, // Обмежуємо до 4 категорій
    },

    // Четверта колонка - Типи контенту
    column4: {
      type: 'additional',
      items: ['news', 'articles'], // НОВИНИ, СТАТТІ
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
