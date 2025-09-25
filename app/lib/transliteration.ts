/**
 * Транслітерація українських символів в латиницю
 * Базується на логіці з deprecated_php_app/lib/etc/utfstuff.php
 */

// Мапінг українських символів на латинські
const transliterationMap: Record<string, string> = {
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

/**
 * Транслітерація тексту з української на латиницю
 * @param text - текст для транслітерації
 * @returns транслітерований текст
 */
export function transliterate(text: string): string {
  return text
    .split('')
    .map(char => transliterationMap[char] || char)
    .join('');
}

/**
 * Генерація безпечного URL ключа з заголовка новини
 * Базується на функції safeUrlStr з deprecated_php_app
 * @param title - заголовок новини
 * @returns безпечний URL ключ
 */
export function generateUrlKey(title: string): string {
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
