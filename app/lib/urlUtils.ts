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

  // Спочатку обробляємо YouTube embeds
  let processedHtml = processYouTubeEmbeds(html);

  // Розбиваємо HTML на частини, зберігаючи теги
  const parts = processedHtml.split(/(<[^>]*>)/);
  
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
 * Обробляє YouTube embed блоки в HTML
 * @param html - HTML контент для обробки
 * @returns HTML з обробленими YouTube embeds
 */
export function processYouTubeEmbeds(html: string): string {
  if (!html || typeof html !== 'string') {
    return html || '';
  }

  // Регулярний вираз для знаходження YouTube embed divs
  const youtubeEmbedRegex = /<div class="youtube-embed" data-url="([^"]+)">[^<]*<\/div>/gi;
  
  return html.replace(youtubeEmbedRegex, (match, url) => {
    // Витягуємо video ID з YouTube URL
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return match; // Якщо не вдалося витягти ID, повертаємо оригінальний div
    }

    // Створюємо YouTube iframe embed
    return `
      <div class="youtube-embed-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; margin: 20px 0;">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
          allowfullscreen
          title="YouTube video player"
        ></iframe>
      </div>
    `;
  });
}

/**
 * Витягує video ID з YouTube URL
 * @param url - YouTube URL
 * @returns video ID або null
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
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
