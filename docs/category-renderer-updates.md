# Оновлення CategoryRenderer для динамічної перевірки категорій

## Зміни в CategoryRenderer.tsx

### 1. Додано імпорти:
```typescript
import { useMenuContext } from '@/app/contexts/MenuContext';
import { getCategoryType, getCategoryFromMenuData } from '@/app/lib/categoryUtils';
```

### 2. Отримання menuData:
```typescript
const { menuData } = useMenuContext();
```

### 3. Оновлена логіка визначення категорій:

#### Визначення типу категорії:
```typescript
const categoryType = getCategoryType(category, menuData);
```

#### Отримання categoryId:
```typescript
const categoryFromMenu = getCategoryFromMenuData(category, menuData);
const categoryId = categoryFromMenu?.id ?? getCategoryIdFromUrl(category, menuData);
```

#### Перевірка чи це тег:
```typescript
const isTag = categoryType === null && categoryId === null;
```

#### Перевірка типів категорій:
```typescript
// Регіональна категорія
const isRegion = categoryType === 'region' || (categoryId !== null ? isRegionCategoryFromMapper(categoryId) : false);

// Спеціальна тема
const isSpecialTheme = categoryType === 'special' || (categoryId !== null && isSpecialThemeCategory(categoryId));
```

### 4. Додано Debug logging:
```typescript
React.useEffect(() => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[CategoryRenderer] Category: ${category}`);
    console.log(`  - categoryType: ${categoryType || 'null (тег або невалідна)'}`);
    console.log(`  - categoryId: ${categoryId}`);
    console.log(`  - isTag: ${isTag}`);
    console.log(`  - isRegion: ${isRegion}`);
    console.log(`  - isSpecialTheme: ${isSpecialTheme}`);
  }
}, [category, categoryType, categoryId, isTag, isRegion, isSpecialTheme]);
```

## Результат

### До:
- ❌ Тернопіль (ID 145) визначався як тег
- ❌ Робився неправильний запит до `/api/tags/by-name/ternopil`
- ❌ Нові регіони не підхоплювалися автоматично

### Після:
- ✅ Тернопіль правильно визначається як регіон через `menuData`
- ✅ Використовується правильний hook `useNewsByRegion`
- ✅ Всі нові категорії з бази даних підхоплюються автоматично
- ✅ Детальний debug logging для відстеження проблем

## Тестування

1. Відкрийте `/ternopil` в браузері
2. Відкрийте Developer Console (F12)
3. Перевірте логи:
   ```
   [CategoryRenderer] Category: ternopil
     - categoryType: region
     - categoryId: 145
     - isTag: false
     - isRegion: true
     - isSpecialTheme: false
   ```
4. Перевірте Network tab - має бути запит до правильного API для регіонів

## Переваги нового підходу

1. **Динамічність**: Автоматично працює з новими категоріями з бази даних
2. **Надійність**: Використовує `menuData` як джерело істини
3. **Відладка**: Детальні логи допомагають швидко знайти проблеми
4. **Fallback**: Зберігається сумісність зі старими статичними маперами
5. **Масштабованість**: Не потрібно змінювати код при додаванні нових категорій

