import { MenuItem, MenuData } from '@/app/api/homepage/services/menuService';

// Re-export MenuData for use in other modules
export type { MenuData } from '@/app/api/homepage/services/menuService';

// Special category for all news (not in database)
export const ALL_CATEGORY_ID = 0;

// Legacy category IDs for backward compatibility
// These will be replaced by dynamic category IDs from useMenuData
export const LEGACY_CATEGORY_IDS = {
  // Special category for all news
  ALL: 0,            // Всі новини

  // Main categories (cattype = 1)
  SOCIETY: 4,        // Сусільство
  POLITICS: 2,       // Політика
  ECONOMICS: 3,      // Економіка
  CULTURE: 5,        // Культура
  HEALTH: 101,       // Здоров'я
  ATO: 109,          // Війна з Росією
  SPORT: 103,        // Спорт
  CRIME: 100,        // Кримінал
  ACCIDENT: 106,     // Надзвичайні події

  // Regions (cattype = 3)
  UKRAINE: 7,        // Україна
  LVIV: 99,          // Львів
  EVROPA: 110,       // Європа
  SVIT: 111,         // Світ
  VOLYN: 118,        // Волинь

  // Special themes (cattype = 2)
  REPORTER: 104,          // Голос народу
  EURO_2012: 105,         // Весняні мотиви
  LVIV_MISKA_VYBORCHA_KOMISIYA: 114,  // Львівська міська виборча комісія
  LVIV_OBLASNA_VYBORCHA_KOMISIYA: 115, // Львівська обласна виборча комісія
  BLITS_INTERVYU: 116,    // Бліц-інтерв'ю
  OLIMPIYSKI_IGRY_RIO_2016: 117, // Олімпійські ігри в Ріо 2016
  VIDVERTA_ROZMOVA: 136,  // Відверта Розмова_з
  TVK: 137,               // ТВК
  VYBORY_ZMIN: 138,       // Вибори
  ZHURNALISTYKA_ZMIN: 139, // Журналістика змін
  PRESSLUZHBA: 140,       // Пресслужба
  VYBORY_REKTORA_LNU: 141, // Вибори ректора ЛНУ
  RAYONY_LVOVA: 142,      // Райони Львова
} as const;

// Dynamic category IDs interface
export interface CategoryIds {
  // Special category for all news
  ALL: number;

  // Main categories (cattype = 1)
  SOCIETY: number;
  POLITICS: number;
  ECONOMICS: number;
  CULTURE: number;
  HEALTH: number;
  ATO: number;
  SPORT: number;
  CRIME: number;
  ACCIDENT: number;

  // Regions (cattype = 3)
  UKRAINE: number;
  LVIV: number;
  EVROPA: number;
  SVIT: number;
  VOLYN: number;

  // Special themes (cattype = 2)
  REPORTER: number;
  EURO_2012: number;
  LVIV_MISKA_VYBORCHA_KOMISIYA: number;
  LVIV_OBLASNA_VYBORCHA_KOMISIYA: number;
  BLITS_INTERVYU: number;
  OLIMPIYSKI_IGRY_RIO_2016: number;
  VIDVERTA_ROZMOVA: number;
  TVK: number;
  VYBORY_ZMIN: number;
  ZHURNALISTYKA_ZMIN: number;
  PRESSLUZHBA: number;
  VYBORY_REKTORA_LNU: number;
  RAYONY_LVOVA: number;
}

// Function to create dynamic category IDs from menu data
export function createCategoryIds(menuData: MenuData | null): CategoryIds {
  if (!menuData) {
    // Fallback to legacy IDs if menu data is not available
    return LEGACY_CATEGORY_IDS as CategoryIds;
  }

  const allCategories = getAllCategories(menuData);
  
  // Helper function to find category ID by param with title fallback
  const findCategoryId = (param: string, titleFallback?: string): number => {
    // First try to find by param
    let category = allCategories.find(cat => cat.param === param);
    
    // If not found and title fallback provided, try to find by title
    if (!category && titleFallback) {
      category = allCategories.find(cat => 
        cat.title.toLowerCase() === titleFallback.toLowerCase() ||
        cat.title === titleFallback
      );
    }
    
    return category?.id || 0;
  };

  return {
    // Special category for all news
    ALL: ALL_CATEGORY_ID,

    // Main categories (cattype = 1) - with title fallbacks for new categories
    SOCIETY: findCategoryId('society', 'Суспільство'),
    POLITICS: findCategoryId('politics', 'Політика'),
    ECONOMICS: findCategoryId('economics', 'Економіка'),
    CULTURE: findCategoryId('culture', 'Культура'),
    HEALTH: findCategoryId('health', 'Здоров\'я'),
    ATO: findCategoryId('ato', 'Війна з Росією'),
    SPORT: findCategoryId('sport', 'Спорт'),
    CRIME: findCategoryId('crime', 'Кримінал'),
    ACCIDENT: findCategoryId('accident', 'Надзвичайні події'),

    // Regions (cattype = 3) - with title fallbacks
    UKRAINE: findCategoryId('ukraine', 'Україна'),
    LVIV: findCategoryId('lviv', 'Львів'),
    EVROPA: findCategoryId('evropa', 'Європа'),
    SVIT: findCategoryId('svit', 'Світ'),
    VOLYN: findCategoryId('volyn', 'Волинь'),

    // Special themes (cattype = 2) - with title fallbacks
    REPORTER: findCategoryId('reporter', 'Голос народу'),
    EURO_2012: findCategoryId('euro-2012', 'Весняні мотиви'),
    LVIV_MISKA_VYBORCHA_KOMISIYA: findCategoryId('lvivska-miska-vyborcha-komisiya', 'Львівська міська виборча комісія'),
    LVIV_OBLASNA_VYBORCHA_KOMISIYA: findCategoryId('lvivska-oblasna-vyborcha-komisiya', 'Львівська обласна виборча комісія'),
    BLITS_INTERVYU: findCategoryId('blits-intervyu', 'Бліц-інтерв\'ю'),
    OLIMPIYSKI_IGRY_RIO_2016: findCategoryId('olimpiyski-igry-v-rio-2016', 'Олімпійські ігри в Ріо 2016'),
    VIDVERTA_ROZMOVA: findCategoryId('vidverta-rozmova', 'Відверта Розмова'),
    TVK: findCategoryId('tvk', 'ТВК'),
    VYBORY_ZMIN: findCategoryId('vybory-zmin', 'Вибори'),
    ZHURNALISTYKA_ZMIN: findCategoryId('zhurnalistyka-zmin', 'Журналістика змін'),
    PRESSLUZHBA: findCategoryId('pressluzhba', 'Пресслужба'),
    VYBORY_REKTORA_LNU: findCategoryId('vybory-rektora-lnu', 'Вибори ректора ЛНУ'),
    RAYONY_LVOVA: findCategoryId('rayony-lvova', 'Райони Львова'),
  };
}

// Export legacy CATEGORY_IDS for backward compatibility
export const CATEGORY_IDS = LEGACY_CATEGORY_IDS;

// Helper function to get category by ID
export function getCategoryById(categories: MenuItem[], id: number): MenuItem | undefined {
  return categories.find(cat => cat.id === id);
}

// Helper function to get category by param
export function getCategoryByParam(categories: MenuItem[], param: string): MenuItem | undefined {
  return categories.find(cat => cat.param === param);
}

// Helper function to get category by title
export function getCategoryByTitle(categories: MenuItem[], title: string): MenuItem | undefined {
  return categories.find(cat => 
    cat.title.toUpperCase() === title.toUpperCase() ||
    cat.title === title
  );
}

// Helper function to get all categories from menu data
export function getAllCategories(menuData: any): MenuItem[] {
  if (!menuData) return [];
  
  return [
    ...(menuData.mainCategories || []),
    ...(menuData.regions || []),
    ...(menuData.specialThemes || [])
  ];
}

// Helper function to get category display name with fallback
export function getCategoryDisplayName(
  category: MenuItem | undefined, 
  fallback: string
): string {
  return category?.title || fallback;
}

// Helper function to check if category is a region (cattype = 3)
export function isRegionCategory(categoryId: number, categoryIds?: CategoryIds): boolean {
  const ids = categoryIds || LEGACY_CATEGORY_IDS;
  const regionIds: number[] = [
    ids.UKRAINE,
    ids.LVIV,
    ids.EVROPA,
    ids.SVIT,
    ids.VOLYN
  ];
  return regionIds.includes(categoryId);
}

// Helper function to validate category by param or title using menu data
export function isValidCategoryInMenuData(
  categoryParam: string, 
  menuData: MenuData | null
): boolean {
  if (!menuData) return false;
  
  const allCategories = getAllCategories(menuData);
  
  // Check by param first
  const foundByParam = allCategories.find(cat => cat.param === categoryParam);
  if (foundByParam) return true;
  
  // Check by title (case insensitive)
  const foundByTitle = allCategories.find(cat => 
    cat.title.toLowerCase() === categoryParam.toLowerCase()
  );
  
  return !!foundByTitle;
}

// Helper function to get category by param or title from menu data
export function getCategoryFromMenuData(
  categoryParam: string, 
  menuData: MenuData | null
): MenuItem | null {
  if (!menuData) return null;
  
  const allCategories = getAllCategories(menuData);
  
  // Try to find by param first
  let category = allCategories.find(cat => cat.param === categoryParam);
  
  // If not found, try to find by title (case insensitive)
  if (!category) {
    category = allCategories.find(cat => 
      cat.title.toLowerCase() === categoryParam.toLowerCase()
    );
  }
  
  return category || null;
}
