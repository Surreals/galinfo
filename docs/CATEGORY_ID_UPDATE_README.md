# Category ID Update - README

## Overview
This update refactors the application to use category IDs instead of hardcoded category names, making the system more maintainable and data-driven.

## Changes Made

### 1. Created MenuContext (`app/contexts/MenuContext.tsx`)
- **Purpose**: Centralized menu data management to avoid multiple API calls
- **Features**:
  - Fetches menu data once and shares it across components
  - Provides helper functions to find categories by ID, param, or title
  - Handles loading states and errors

### 2. Created Category Utilities (`app/lib/categoryUtils.ts`)
- **Purpose**: Centralized category constants and helper functions
- **Features**:
  - `CATEGORY_IDS` constant with all category IDs from the database
  - Helper functions for category operations
  - Type-safe category management

### 3. Updated Layout (`app/layout.tsx`)
- **Changes**: Wrapped the app with `MenuProvider` to provide menu data context
- **Structure**: `ConfigProvider` → `MobileProvider` → `MenuProvider` → Components

### 4. Updated Homepage (`app/page.tsx`)
- **Changes**: 
  - Replaced hardcoded category names with dynamic category objects
  - Added `categoryId` props to all news components
  - Uses `getCategoryById()` to fetch category data
  - Fallback to hardcoded names if category not found

### 5. Updated Components
- **ColumnNews**: Added `categoryId` and `secondCategoryId` props
- **CategoryNews**: Added `categoryId` prop
- **Header**: Now uses `MenuContext` instead of `useMenuData` hook

## Category ID Mapping

Based on the provided data:

```typescript
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
}
```

## Benefits

1. **Data-Driven**: Categories are now fetched from the database instead of being hardcoded
2. **Maintainable**: Adding/removing categories only requires database changes
3. **Consistent**: All components use the same category data source
4. **Performance**: Menu data is fetched once and shared across components
5. **Type-Safe**: TypeScript interfaces ensure data consistency

## Usage Example

```typescript
import { useMenuContext } from "@/app/contexts/MenuContext";
import { CATEGORY_IDS } from "@/app/lib/categoryUtils";

function MyComponent() {
  const { getCategoryById } = useMenuContext();
  
  // Get category by ID
  const politicsCategory = getCategoryById(CATEGORY_IDS.POLITICS);
  
  // Use in component
  return (
    <ColumnNews
      category={politicsCategory?.title || "ПОЛІТИКА"}
      categoryId={CATEGORY_IDS.POLITICS}
      // ... other props
    />
  );
}
```

## Migration Notes

- **Backward Compatibility**: Components still accept string category names as fallbacks
- **Database Dependency**: Ensure the `/api/menu` endpoint is working correctly
- **Error Handling**: Components gracefully fall back to hardcoded names if category not found
- **Performance**: Menu data is cached in context, reducing API calls

## Future Improvements

1. **Category Validation**: Add validation to ensure all required categories exist
2. **Dynamic Category Loading**: Load categories based on user preferences or locale
3. **Category Caching**: Implement more sophisticated caching strategies
4. **Category Analytics**: Track category usage for better content management
