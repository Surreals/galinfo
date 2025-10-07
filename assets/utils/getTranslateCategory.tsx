export function getCategoryTitle(category: string, menuData?: any): string {
  // Static mapping for backward compatibility
  const staticMapping: Record<string, string> = {
    "all": "Всі новини",
    "important": "ТОП НОВИНИ",
    "society": "Суспільство",
    "politics": "Політика",
    "economics": "Економіка",
    "culture": "Культура",
    "health": "Здоров'я",
    "ato": "Війна з Росією",
    "sport": "Спорт",
    "crime": "Кримінал",
    "accident": "Надзвичайні події",
    "emergency": "Надзвичайні події",
    "history": "Історія",
    "technologies": "Технології",
    "lviv": "Львів",
    "ternopil": "Тернопіль",
    "volyn": "Волинь",
    "ukraine": "Україна",
    "evropa": "Європа",
    "svit": "Світ",
    "pressluzhba": "Пресслужба",
    "rayony-lvova": "Райони Львова",
    "vidverta-rozmova": "Відверта розмова",
    "vidverta-rozmova-z": "Відверта розмова",
    "news": "Новини",
    "articles": "Статті"
  };

  // Check static mapping first
  if (staticMapping[category]) {
    return staticMapping[category];
  }

  // If menu data is available, try to find category dynamically
  if (menuData) {
    const allCategories = [
      ...(menuData.mainCategories || []),
      ...(menuData.regions || []),
      ...(menuData.specialThemes || [])
    ];

    // Try to find by param
    let foundCategory = allCategories.find(cat => cat.param === category);
    
    // If not found by param, try by title (case insensitive)
    if (!foundCategory) {
      foundCategory = allCategories.find(cat => 
        cat.title.toLowerCase() === category.toLowerCase()
      );
    }

    if (foundCategory) {
      return foundCategory.title;
    }
  }

  // Fallback: return capitalized category name instead of "Невідома категорія"
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
}

export function getBreadCrumbsNav(category: string, menuData?: any): string {
  // Static mapping for backward compatibility
  const staticMapping: Record<string, string> = {
    "суспільство": "society",
    "політика": "politics",
    "економіка": "economics",
    "культура": "culture",
    "здоров'я": "health",
    "війна з Росією": "ato",
    "спорт": "sport",
    "кримінал": "crime",
    "надзвичайні події": "accident",
    "надзвичайне": "accident",
    "історія": "history",
    "технології": "technologies",
    "Львів": "lviv",
    "тернопіль": "ternopil",
    "Волин": "volyn",
    "Україна": "ukraine",
    "Європа": "evropa",
    "Світ": "svit",
    "Пресслужба": "pressluzhba",
    "Райони Львова": "rayony-lvova",
    "Відверта розмова": "vidverta-rozmova"
  };

  // Check static mapping first
  if (staticMapping[category]) {
    return staticMapping[category];
  }

  // If menu data is available, try to find category dynamically
  if (menuData) {
    const allCategories = [
      ...(menuData.mainCategories || []),
      ...(menuData.regions || []),
      ...(menuData.specialThemes || [])
    ];

    // Try to find by title (case insensitive)
    const foundCategory = allCategories.find(cat => 
      cat.title.toLowerCase() === category.toLowerCase()
    );

    if (foundCategory) {
      return foundCategory.param;
    }
  }

  // Fallback: return category as-is instead of "Невідома категорія"
  return category.toLowerCase().replace(/\s+/g, '-');
}