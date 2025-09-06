import { MenuItem } from '@/app/api/homepage/services/menuService';

// Category IDs based on the provided data
export const CATEGORY_IDS = {
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
  VIDVERTA_ROZMOVA: 136,  // Відверта Розмова_з
  PRESSLUZHBA: 140,       // Пресслужба
  RAYONY_LVOVA: 142,      // Райони Львова
} as const;

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
export function isRegionCategory(categoryId: number): boolean {
  const regionIds: number[] = [
    CATEGORY_IDS.UKRAINE,
    CATEGORY_IDS.LVIV,
    CATEGORY_IDS.EVROPA,
    CATEGORY_IDS.SVIT,
    CATEGORY_IDS.VOLYN
  ];
  return regionIds.includes(categoryId);
}
