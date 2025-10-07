import { CategoryIds, LEGACY_CATEGORY_IDS, MenuData, isValidCategoryInMenuData, getCategoryFromMenuData } from './categoryUtils';

// Функція для створення маппера URL параметрів в categoryId
export function createCategoryUrlMapper(categoryIds: CategoryIds): Record<string, number> {
  return {
    // Спеціальні категорії
    'all': categoryIds.ALL,                // 0 - Всі новини
    'important': -1,                       // -1 - Важливі новини (спеціальний ID)
    
    // Типи контенту
    'news': -2,                            // -2 - Новини (спеціальний ID)
    'articles': -3,                        // -3 - Статті (спеціальний ID)

    // Основні категорії
    'society': categoryIds.SOCIETY,        // Суспільство
    'politics': categoryIds.POLITICS,      // Політика
    'economics': categoryIds.ECONOMICS,    // Економіка
    'culture': categoryIds.CULTURE,        // Культура
    'health': categoryIds.HEALTH,          // Здоров'я
    'ato': categoryIds.ATO,                // Війна з Росією
    'sport': categoryIds.SPORT,            // Спорт
    'crime': categoryIds.CRIME,            // Кримінал
    'accident': categoryIds.ACCIDENT,      // Надзвичайні події

    // Регіональні категорії (тепер будуть використовувати маршрут /region/)
    'ukraine': categoryIds.UKRAINE,        // Україна
    'lviv': categoryIds.LVIV,              // Львів
    'evropa': categoryIds.EVROPA,          // Європа
    'svit': categoryIds.SVIT,             // Світ
    'volyn': categoryIds.VOLYN,            // Волинь

    // Спеціальні теми (тепер будуть використовувати маршрут /topthemes/)
    'reporter': categoryIds.REPORTER,                  // Голос народу
    'euro-2012': categoryIds.EURO_2012,                // Весняні мотиви
    'lvivska-miska-vyborcha-komisiya': categoryIds.LVIV_MISKA_VYBORCHA_KOMISIYA, // Львівська міська виборча комісія
    'lvivska-oblasna-vyborcha-komisiya': categoryIds.LVIV_OBLASNA_VYBORCHA_KOMISIYA, // Львівська обласна виборча комісія
    'blits-intervyu': categoryIds.BLITS_INTERVYU,      // Бліц-інтерв'ю
    'olimpiyski-igry-v-rio-2016': categoryIds.OLIMPIYSKI_IGRY_RIO_2016, // Олімпійські ігри в Ріо 2016
    'vidverta-rozmova': categoryIds.VIDVERTA_ROZMOVA,  // Відверта Розмова
    'vidverta-rozmova-z': categoryIds.VIDVERTA_ROZMOVA, // Відверта Розмова (альтернативний слаг)
    'tvk': categoryIds.TVK,                            // ТВК
    'vybory-zmin': categoryIds.VYBORY_ZMIN,            // Вибори
    'zhurnalistyka-zmin': categoryIds.ZHURNALISTYKA_ZMIN, // Журналістика змін
    'pressluzhba': categoryIds.PRESSLUZHBA,            // Пресслужба
    'vybory-rektora-lnu': categoryIds.VYBORY_REKTORA_LNU, // Вибори ректора ЛНУ
    'rayony-lvova': categoryIds.RAYONY_LVOVA,          // Райони Львова
  };
}

// Legacy маппер для зворотної сумісності
export const CATEGORY_URL_MAPPER = createCategoryUrlMapper(LEGACY_CATEGORY_IDS as CategoryIds);

// Функція для отримання categoryId з URL параметра
export function getCategoryIdFromUrl(categoryParam: string, menuData?: MenuData | null): number | null {
  // First try static mapper
  const staticCategoryId = CATEGORY_URL_MAPPER[categoryParam.toLowerCase()];
  if (staticCategoryId !== undefined) {
    return staticCategoryId;
  }
  
  // If not found in static mapper and menu data is available, try dynamic lookup
  if (menuData) {
    const category = getCategoryFromMenuData(categoryParam, menuData);
    return category?.id || null;
  }
  
  return null;
}

// Функція для отримання URL параметра з categoryId
export function getUrlFromCategoryId(categoryId: number | string): string | null {
  const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  const entry = Object.entries(CATEGORY_URL_MAPPER).find(([_, id]) => id === numericId);
  return entry ? entry[0] : null;
}

// Функція для перевірки, чи існує категорія за URL параметром
export function isValidCategoryUrl(categoryParam: string, menuData?: MenuData | null): boolean {
  // First check static mapper for backward compatibility
  const staticValid = categoryParam.toLowerCase() in CATEGORY_URL_MAPPER;
  
  // If static check passes, return true
  if (staticValid) return true;
  
  // If menu data is available, check dynamically
  if (menuData) {
    return isValidCategoryInMenuData(categoryParam, menuData);
  }
  
  // Fallback to static check only
  return staticValid;
}

// Функція для отримання всіх доступних URL параметрів
export function getAllCategoryUrls(): string[] {
  return Object.keys(CATEGORY_URL_MAPPER);
}

// Функція для генерації правильного URL на основі categoryId
export function generateCategoryUrl(categoryId: number | string, categoryIds?: CategoryIds): string {
  const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  const ids = categoryIds || LEGACY_CATEGORY_IDS as CategoryIds;
  
  // Регіональні категорії
  const regionIds: number[] = [
    ids.UKRAINE,
    ids.LVIV,
    ids.EVROPA,
    ids.SVIT,
    ids.VOLYN
  ];
  
  // Спеціальні теми
  const specialThemeIds: number[] = [
    ids.REPORTER,
    ids.EURO_2012,
    ids.LVIV_MISKA_VYBORCHA_KOMISIYA,
    ids.LVIV_OBLASNA_VYBORCHA_KOMISIYA,
    ids.BLITS_INTERVYU,
    ids.OLIMPIYSKI_IGRY_RIO_2016,
    ids.VIDVERTA_ROZMOVA,
    ids.TVK,
    ids.VYBORY_ZMIN,
    ids.ZHURNALISTYKA_ZMIN,
    ids.PRESSLUZHBA,
    ids.VYBORY_REKTORA_LNU,
    ids.RAYONY_LVOVA
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
export function isRegionCategory(categoryId: number | string, categoryIds?: CategoryIds): boolean {
  const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  const ids = categoryIds || LEGACY_CATEGORY_IDS as CategoryIds;
  const regionIds: number[] = [
    ids.UKRAINE,
    ids.LVIV,
    ids.EVROPA,
    ids.SVIT,
    ids.VOLYN
  ];
  return regionIds.includes(numericId);
}

// Функція для перевірки, чи є категорія спеціальною темою
export function isSpecialThemeCategory(categoryId: number | string, categoryIds?: CategoryIds): boolean {
  const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  const ids = categoryIds || LEGACY_CATEGORY_IDS as CategoryIds;
  const specialThemeIds: number[] = [
    ids.REPORTER,
    ids.EURO_2012,
    ids.LVIV_MISKA_VYBORCHA_KOMISIYA,
    ids.LVIV_OBLASNA_VYBORCHA_KOMISIYA,
    ids.BLITS_INTERVYU,
    ids.OLIMPIYSKI_IGRY_RIO_2016,
    ids.VIDVERTA_ROZMOVA,
    ids.TVK,
    ids.VYBORY_ZMIN,
    ids.ZHURNALISTYKA_ZMIN,
    ids.PRESSLUZHBA,
    ids.VYBORY_REKTORA_LNU,
    ids.RAYONY_LVOVA
  ];
  return specialThemeIds.includes(numericId);
}
