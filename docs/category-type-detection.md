# Динамічна перевірка типу категорій

## Проблема
Раніше система некоректно визначала тип категорій. Нові регіони (наприклад, Тернопіль з ID 145) визначалися як теги, що призводило до неправильних запитів до API.

## Рішення
Створено динамічну систему перевірки типів категорій через `menuData`, яка отримується з бази даних.

## Нові функції в `categoryUtils.ts`

### `getCategoryType(categoryParam: string, menuData: MenuData | null)`
Визначає тип категорії на основі `menuData`.

**Повертає:**
- `'main'` - основна категорія (Політика, Економіка, Суспільство, тощо)
- `'region'` - регіональна категорія (Львів, Тернопіль, Україна, тощо)
- `'special'` - спеціальна тема (Відверта розмова, Пресслужба, тощо)
- `null` - не знайдено в menuData (це тег або невалідна категорія)

### Допоміжні функції
- `isCategoryInRegions(categoryParam, menuData)` - перевіряє чи є категорія регіоном
- `isCategoryInMainCategories(categoryParam, menuData)` - перевіряє чи є категорія основною
- `isCategoryInSpecialThemes(categoryParam, menuData)` - перевіряє чи є категорія спеціальною темою

## Логіка в `CategoryPageClient.tsx`

```typescript
// 1. ВАЖЛИВО: Чекаємо завантаження menuData перед визначенням типу
// Якщо menuLoading = true, categoryType буде undefined (не null!)
const categoryType = !menuLoading ? getCategoryType(category, menuData) : undefined;

// 2. Перевіряємо чи це статична категорія
const isStaticCategory = isValidCategoryUrl(category);

// 3. Визначаємо чи це тег ТІЛЬКИ після завантаження menuData
// Якщо categoryType === undefined (ще завантажується), НЕ вважаємо це тегом
const isTag = categoryType !== undefined && categoryType === null && !isStaticCategory;

// 4. Визначаємо чи валідна категорія
const isValidCategory = categoryType !== undefined && (categoryType !== null || isStaticCategory);

// 5. В useEffect чекаємо завантаження menuData
useEffect(() => {
  if (menuLoading) {
    return; // НЕ завантажуємо теги поки menuData не завантажилося
  }
  
  if (isTag && !tagData && !loading) {
    // Тепер можна завантажити дані тегу
  }
}, [isTag, category, menuLoading, tagData, loading]);
```

## Логіка в `CategoryRenderer.tsx`

```typescript
// 1. Використовуємо menuContext з loading
const { menuData, loading: menuLoading } = useMenuContext();

// 2. Визначаємо тип категорії ТІЛЬКИ після завантаження menuData
const categoryType = !menuLoading ? getCategoryType(category, menuData) : undefined;

// 3. Отримуємо categoryId (спочатку з menuData, потім статично)
const categoryFromMenu = !menuLoading ? getCategoryFromMenuData(category, menuData) : null;
const categoryId = categoryFromMenu?.id ?? getCategoryIdFromUrl(category, menuData);

// 4. Перевіряємо чи це тег ТІЛЬКИ після завантаження menuData
const isTag = categoryType !== undefined && categoryType === null && categoryId === null;

// 5. Визначаємо тип категорії для відображення
const isRegion = categoryType === 'region' || (categoryId !== null ? isRegionCategoryFromMapper(categoryId) : false);
const isSpecialTheme = categoryType === 'special' || (categoryId !== null && isSpecialThemeCategory(categoryId));

// 6. В useEffect чекаємо завантаження menuData
React.useEffect(() => {
  if (menuLoading) {
    return; // НЕ завантажуємо теги поки menuData не завантажилося
  }
  
  if (isTag && !tagData) {
    // Тепер можна завантажити дані тегу
  }
}, [isTag, category, menuLoading, tagData]);
```

## Приклади

### Тернопіль (ID 145, param: 'ternopil', cattype: 3)
- URL: `/ternopil`
- `getCategoryType('ternopil', menuData)` → `'region'`
- `isTag` → `false`
- `isValidCategory` → `true`
- **Результат**: Відображається як регіон, НЕ робиться запит на теги ✅

### Тег (наприклад, 'виборчі-дільниці')
- URL: `/виборчі-дільниці`
- `getCategoryType('виборчі-дільниці', menuData)` → `null`
- `isTag` → `true`
- `isValidCategory` → `false`
- **Результат**: Робиться запит до `/api/tags/by-name/виборчі-дільниці` ✅

### Політика (існуюча категорія)
- URL: `/politics`
- `getCategoryType('politics', menuData)` → `'main'`
- `isTag` → `false`
- `isValidCategory` → `true`
- **Результат**: Відображається як основна категорія ✅

## Debug режим
В development режимі в консолі браузера виводиться детальна інформація:

### CategoryPageClient:
```
[CategoryPageClient] Category: ternopil, Type: region
```

### CategoryRenderer:
```
[CategoryRenderer] Category: ternopil
  - categoryType: region
  - categoryId: 145
  - isTag: false
  - isRegion: true
  - isSpecialTheme: false
```

## Структура menuData
```typescript
interface MenuData {
  mainCategories: MenuItem[];  // cattype = 1
  regions: MenuItem[];         // cattype = 3
  specialThemes: MenuItem[];   // cattype = 2
  additionalItems: MenuItem[]; // cattype = 0
}

interface MenuItem {
  id: number;
  param: string;
  title: string;
  link: string;
  cattype: number;
}
```

## Тестування
1. Перейдіть на `/ternopil` - має відображатися як регіон
2. Перевірте консоль браузера (в dev режимі) - має показувати `Type: region`
3. Перевірте Network tab - НЕ повинно бути запиту до `/api/tags/by-name/ternopil`

