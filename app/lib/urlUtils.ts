/**
 * Утилітні функції для роботи з URL в тексті новин
 */

/**
 * Регулярний вираз для виявлення URL в тексті
 * Підтримує HTTP, HTTPS, FTP та інші протоколи
 */
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;

/**
 * Обробляє текст і виділяє URL синім кольором
 * @param text - текст для обробки
 * @returns HTML з виділеними URL
 */
export function highlightUrlsInText(text: string): string {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  // Замінюємо URL на посилання з синім кольором
  return text.replace(URL_REGEX, (url) => {
    // Перевіряємо, чи URL не вже обгорнутий в тег <a>
    const beforeUrl = text.substring(0, text.indexOf(url));
    const afterUrl = text.substring(text.indexOf(url) + url.length);
    
    // Якщо URL вже в тегу <a>, не обробляємо його
    if (beforeUrl.includes('<a ') && afterUrl.includes('</a>')) {
      return url;
    }

    // Створюємо посилання з синім кольором
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; border-bottom: 1px solid transparent; transition: border-color 0.2s ease;" onmouseover="this.style.borderBottomColor='#007bff'" onmouseout="this.style.borderBottomColor='transparent'">${url}</a>`;
  });
}

/**
 * Обробляє HTML контент і виділяє URL синім кольором
 * @param html - HTML контент для обробки
 * @returns HTML з виділеними URL
 */
export function highlightUrlsInHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return html || '';
  }

  // Розбиваємо HTML на частини, зберігаючи теги
  const parts = html.split(/(<[^>]*>)/);
  
  return parts.map(part => {
    // Якщо це HTML тег, залишаємо без змін
    if (part.startsWith('<') && part.endsWith('>')) {
      return part;
    }
    
    // Якщо це текст, обробляємо URL
    return highlightUrlsInText(part);
  }).join('');
}

/**
 * Перевіряє, чи є текст URL
 * @param text - текст для перевірки
 * @returns true, якщо текст є URL
 */
export function isUrl(text: string): boolean {
  return URL_REGEX.test(text);
}

/**
 * Витягує всі URL з тексту
 * @param text - текст для обробки
 * @returns масив знайдених URL
 */
export function extractUrlsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const matches = text.match(URL_REGEX);
  return matches ? [...new Set(matches)] : []; // Видаляємо дублікати
}
