import { CATEGORY_IDS } from './categoryUtils';

// Маппер для конвертації URL параметрів в categoryId
export const CATEGORY_URL_MAPPER: Record<string, number> = {
  // Спеціальні категорії
  'all': CATEGORY_IDS.ALL,                // 0 - Всі новини
  'important': -1,                        // -1 - Важливі новини (спеціальний ID)

  // Основні категорії
  'society': CATEGORY_IDS.SOCIETY,        // 4 - Суспільство
  'politics': CATEGORY_IDS.POLITICS,      // 2 - Політика
  'economics': CATEGORY_IDS.ECONOMICS,    // 3 - Економіка
  'culture': CATEGORY_IDS.CULTURE,        // 5 - Культура
  'health': CATEGORY_IDS.HEALTH,          // 101 - Здоров'я
  'ato': CATEGORY_IDS.ATO,                // 109 - Війна з Росією
  'sport': CATEGORY_IDS.SPORT,            // 103 - Спорт
  'crime': CATEGORY_IDS.CRIME,            // 100 - Кримінал
  'accident': CATEGORY_IDS.ACCIDENT,      // 106 - Надзвичайні події

  // Регіональні категорії (тепер будуть використовувати маршрут /region/)
  'ukraine': CATEGORY_IDS.UKRAINE,        // 7 - Україна
  'lviv': CATEGORY_IDS.LVIV,              // 99 - Львів
  'evropa': CATEGORY_IDS.EVROPA,          // 110 - Європа
  'svit': CATEGORY_IDS.SVIT,             // 111 - Світ
  'volyn': CATEGORY_IDS.VOLYN,            // 118 - Волинь

  // Спеціальні теми (тепер будуть використовувати маршрут /topthemes/)
  'vidverta-rozmova': CATEGORY_IDS.VIDVERTA_ROZMOVA,  // 136 - Відверта Розмова
  'vidverta-rozmova-z': CATEGORY_IDS.VIDVERTA_ROZMOVA, // 136 - Відверта Розмова (альтернативний слаг)
  'pressluzhba': CATEGORY_IDS.PRESSLUZHBA,            // 140 - Пресслужба
  'rayony-lvova': CATEGORY_IDS.RAYONY_LVOVA,          // 142 - Райони Львова
} as const;

// Функція для отримання categoryId з URL параметра
export function getCategoryIdFromUrl(categoryParam: string): number | null {
  const categoryId = CATEGORY_URL_MAPPER[categoryParam.toLowerCase()];
  return categoryId !== undefined ? categoryId : null;
}

// Функція для отримання URL параметра з categoryId
export function getUrlFromCategoryId(categoryId: number | string): string | null {
  const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  const entry = Object.entries(CATEGORY_URL_MAPPER).find(([_, id]) => id === numericId);
  return entry ? entry[0] : null;
}

// Функція для перевірки, чи існує категорія за URL параметром
export function isValidCategoryUrl(categoryParam: string): boolean {
  return categoryParam.toLowerCase() in CATEGORY_URL_MAPPER;
}

// Функція для отримання всіх доступних URL параметрів
export function getAllCategoryUrls(): string[] {
  return Object.keys(CATEGORY_URL_MAPPER);
}

// Функція для генерації правильного URL на основі categoryId
export function generateCategoryUrl(categoryId: number | string): string {
  const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  
  // Регіональні категорії
  const regionIds: number[] = [
    CATEGORY_IDS.UKRAINE,
    CATEGORY_IDS.LVIV,
    CATEGORY_IDS.EVROPA,
    CATEGORY_IDS.SVIT,
    CATEGORY_IDS.VOLYN
  ];
  
  // Спеціальні теми
  const specialThemeIds: number[] = [
    CATEGORY_IDS.VIDVERTA_ROZMOVA,
    CATEGORY_IDS.PRESSLUZHBA,
    CATEGORY_IDS.RAYONY_LVOVA
  ];
  
  if (regionIds.includes(numericId)) {
    const urlParam = getUrlFromCategoryId(numericId);
    return urlParam ? `/region/${urlParam}` : '';
  }
  
  if (specialThemeIds.includes(numericId)) {
    const urlParam = getUrlFromCategoryId(numericId);
    return urlParam ? `/topthemes/${urlParam}` : '';
  }
  
  // Для всіх інших категорій використовуємо стандартний маршрут
  const urlParam = getUrlFromCategoryId(numericId);
  return urlParam ? `/${urlParam}` : '';
}

// Функція для перевірки, чи є категорія регіональною
export function isRegionCategory(categoryId: number | string): boolean {
  const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  const regionIds: number[] = [
    CATEGORY_IDS.UKRAINE,
    CATEGORY_IDS.LVIV,
    CATEGORY_IDS.EVROPA,
    CATEGORY_IDS.SVIT,
    CATEGORY_IDS.VOLYN
  ];
  return regionIds.includes(numericId);
}

// Функція для перевірки, чи є категорія спеціальною темою
export function isSpecialThemeCategory(categoryId: number | string): boolean {
  const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  const specialThemeIds: number[] = [
    CATEGORY_IDS.VIDVERTA_ROZMOVA,
    CATEGORY_IDS.PRESSLUZHBA,
    CATEGORY_IDS.RAYONY_LVOVA
  ];
  return specialThemeIds.includes(numericId);
}
