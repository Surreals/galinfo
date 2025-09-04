/**
 * Утиліти для роботи з типами статей
 */

// Мапінг числових типів на рядкові ідентифікатори
export const ARTICLE_TYPE_MAP = {
  1: 'news',        // Новини
  2: 'articles',    // Статті
  3: 'photo',       // Фоторепортажі
  4: 'video',       // Відео
  5: 'audio',       // Аудіо
  6: 'announces',   // Анонси
  7: 'pressrelease', // Пресс-релізи
  8: 'events',      // Події
  20: 'blogs',      // Блоги
  21: 'mainmedia'   // Основні медіа
} as const;

// Зворотний мапінг рядкових ідентифікаторів на числові типи
export const ARTICLE_TYPE_KEYS = {
  news: 1,
  articles: 2,
  photo: 3,
  video: 4,
  audio: 5,
  announces: 6,
  pressrelease: 7,
  events: 8,
  blogs: 20,
  mainmedia: 21
} as const;

// Валідні типи статей
export const VALID_ARTICLE_TYPES = Object.values(ARTICLE_TYPE_MAP);

// Типи для TypeScript
export type ArticleType = keyof typeof ARTICLE_TYPE_KEYS;
export type ArticleTypeNumber = keyof typeof ARTICLE_TYPE_MAP;

/**
 * Конвертує числовий тип статті в рядковий ідентифікатор
 * @param ntype - числовий тип статті
 * @returns рядковий ідентифікатор типу статті
 */
export function getArticleType(ntype: number): ArticleType {
  return ARTICLE_TYPE_MAP[ntype as ArticleTypeNumber] || 'news';
}

/**
 * Конвертує рядковий ідентифікатор типу статті в числовий
 * @param articleType - рядковий ідентифікатор типу статті
 * @returns числовий тип статті
 */
export function getArticleTypeNumber(articleType: string): number {
  return ARTICLE_TYPE_KEYS[articleType as ArticleType] || 1;
}

/**
 * Перевіряє, чи є тип статті валідним
 * @param articleType - тип статті для перевірки
 * @returns true, якщо тип валідний
 */
export function isValidArticleType(articleType: string): articleType is ArticleType {
  return VALID_ARTICLE_TYPES.includes(articleType as ArticleType);
}

/**
 * Формує URL для новини
 * @param articleType - тип статті
 * @param urlkey - ключ URL
 * @param id - ідентифікатор новини
 * @returns URL новини
 */
export function buildNewsUrl(articleType: ArticleType, urlkey: string, id: number): string {
  return `/${articleType}/${urlkey}_${id}`;
}

/**
 * Парсить URL новини
 * @param url - URL новини
 * @returns об'єкт з компонентами URL або null, якщо URL невалідний
 */
export function parseNewsUrl(url: string): { articleType: ArticleType; urlkey: string; id: number } | null {
  const match = url.match(/^\/([^\/]+)\/([^_]+)_(\d+)$/);
  if (!match) return null;
  
  const [, articleType, urlkey, idStr] = match;
  const id = parseInt(idStr);
  
  if (!isValidArticleType(articleType) || isNaN(id)) {
    return null;
  }
  
  return { articleType, urlkey, id };
}

/**
 * Отримує назву типу статті для відображення
 * @param articleType - тип статті
 * @param lang - мова (1 - українська, 2 - англійська, 3 - російська)
 * @returns назва типу статті
 */
export function getArticleTypeName(articleType: ArticleType, lang: string = '1'): string {
  const names = {
    '1': { // Українська
      news: 'Новини',
      articles: 'Статті',
      photo: 'Фоторепортажі',
      video: 'Відео',
      audio: 'Аудіо',
      announces: 'Анонси',
      pressrelease: 'Пресс-релізи',
      events: 'Події',
      blogs: 'Блоги',
      mainmedia: 'Медіа'
    },
    '2': { // English
      news: 'News',
      articles: 'Articles',
      photo: 'Photo Reports',
      video: 'Video',
      audio: 'Audio',
      announces: 'Announcements',
      pressrelease: 'Press Releases',
      events: 'Events',
      blogs: 'Blogs',
      mainmedia: 'Media'
    },
    '3': { // Русский
      news: 'Новости',
      articles: 'Статьи',
      photo: 'Фоторепортажи',
      video: 'Видео',
      audio: 'Аудио',
      announces: 'Анонсы',
      pressrelease: 'Пресс-релизы',
      events: 'События',
      blogs: 'Блоги',
      mainmedia: 'Медиа'
    }
  };
  
  return names[lang as keyof typeof names]?.[articleType] || articleType;
}

/**
 * Отримує іконку для типу статті
 * @param articleType - тип статті
 * @returns назва іконки
 */
export function getArticleTypeIcon(articleType: ArticleType): string {
  const icons = {
    news: '📰',
    articles: '📄',
    photo: '📸',
    video: '🎥',
    audio: '🎵',
    announces: '📢',
    pressrelease: '📋',
    events: '📅',
    blogs: '✍️',
    mainmedia: '📺'
  };
  
  return icons[articleType] || '📄';
}

/**
 * Отримує CSS клас для типу статті
 * @param articleType - тип статті
 * @returns CSS клас
 */
export function getArticleTypeClass(articleType: ArticleType): string {
  return `article-type-${articleType}`;
}

/**
 * Отримує колір для типу статті
 * @param articleType - тип статті
 * @returns hex колір
 */
export function getArticleTypeColor(articleType: ArticleType): string {
  const colors = {
    news: '#007bff',
    articles: '#28a745',
    photo: '#ffc107',
    video: '#dc3545',
    audio: '#6f42c1',
    announces: '#17a2b8',
    pressrelease: '#6c757d',
    events: '#fd7e14',
    blogs: '#e83e8c',
    mainmedia: '#20c997'
  };
  
  return colors[articleType] || '#6c757d';
}
