# Dynamic Menu System - Migration from PHP to Next.js

## Overview

This document describes the migration of the old PHP side menu (class "mmenu") to a dynamic Next.js header menu system that fetches data from the same database.

## Old PHP System Analysis

### Database Structure
The old PHP system used the `a_cats` table with the following structure:
- `id`: Unique identifier
- `param`: URL parameter/slug
- `title`: Display title
- `cattype`: Category type
  - `1`: Main rubrics/categories (СУСПІЛЬСТВО, ПОЛІТИКА, etc.)
  - `3`: Regions (ЛЬВІВЩИНА, ТЕРНОПІЛЬЩИНА, etc.)
  - `2`: Special themes/topics
- `isvis`: Visibility flag
- `lng`: Language identifier
- `orderid`: Display order

### Key PHP Functions
1. **`getRubrics()`**: Fetched main categories (cattype = 1)
2. **`getRegions()`**: Fetched regions (cattype = 3)
3. **`get_mmenu()`**: Fetched additional menu items

### Menu Structure
The old mmenu included:
- Main navigation categories
- Region-based navigation
- Additional sections (Новини, Статті, Архів, Анонси)
- Logo in the middle
- About and commercial links

## New Next.js Implementation

### Files Created/Modified

1. **`app/api/homepage/services/menuService.ts`**
   - New service that replicates PHP menu functions
   - Fetches data from the same `a_cats` table
   - Returns structured menu data

2. **`app/api/menu/route.ts`**
   - Dedicated menu API endpoint
   - Only returns menu data (no homepage overhead)
   - Efficient and focused data fetching

3. **`app/hooks/useMenuData.ts`**
   - Custom React hook for fetching menu data
   - Handles loading states and errors
   - Fetches only from `/api/menu` endpoint

4. **`app/header/Header.tsx`**
   - Updated to use dynamic menu data
   - Falls back to static data if dynamic data unavailable
   - Maintains the same visual structure

5. **`app/admin/test-menu/page.tsx`**
   - Test page to verify menu data fetching
   - Useful for debugging and development

### API Integration

The menu system now uses a dedicated endpoint (`/api/menu`) that includes:
- `mainCategories`: Main navigation categories (cattype = 1)
- `regions`: Region-based categories (cattype = 3)
- `additionalItems`: Hardcoded additional menu items
- `specialThemes`: Special themes (cattype = 2)

**Important**: Menu data is no longer included in the homepage API to avoid unnecessary data fetching.

### Data Flow

1. **Database** → `menuService.ts` → **Menu API** (`/api/menu`)
2. **Menu API** → `useMenuData` hook → **Header Component**
3. **Header Component** → **Rendered Menu**

## Performance Optimization

### Before (Inefficient)
- `useMenuData` fetched entire homepage data
- Included news, advertising, patterns, media, etc.
- Unnecessary data transfer and processing

### After (Optimized)
- `useMenuData` fetches only from `/api/menu`
- Dedicated endpoint returns only menu data
- Faster loading and reduced bandwidth usage

## Usage

### Testing the Menu System

Visit `/admin/test-menu` to see the fetched menu data and verify it's working correctly.

### Adding New Categories

To add new categories, simply insert them into the `a_cats` table with the appropriate `cattype`:
- `cattype = 1` for main categories
- `cattype = 3` for regions
- `cattype = 2` for special themes

The menu will automatically update to include new categories.

### Customizing Menu Items

The `additionalItems` array in `menuService.ts` contains hardcoded menu items. Modify this array to add/remove/change these items.

## Benefits of the New System

1. **Dynamic**: Menu updates automatically when database changes
2. **Consistent**: Uses the same data source as the old PHP system
3. **Maintainable**: Clean separation of concerns with services and hooks
4. **Fallback**: Gracefully degrades to static data if needed
5. **Type-safe**: Full TypeScript support with proper interfaces
6. **Efficient**: Dedicated API endpoint for optimal performance
7. **Scalable**: Easy to add caching and other optimizations

## Database Queries

The new system uses these SQL queries (equivalent to old PHP):

```sql
-- Main categories (getRubrics equivalent)
SELECT id, param, title, cattype, 
       CONCAT('/category/', param, '/') as link
FROM a_cats 
WHERE cattype = 1 AND isvis = 1 AND lng = "1" 
ORDER BY orderid

-- Regions (getRegions equivalent)
SELECT id, param, title, cattype,
       CONCAT('/category/', param, '/') as link
FROM a_cats 
WHERE cattype = 3 AND isvis = 1 AND lng = "1" 
ORDER BY orderid

-- Special themes
SELECT id, param, title, cattype,
       CONCAT('/category/', param, '/') as link
FROM a_cats 
WHERE cattype = 2 AND isvis = 1 AND lng = "1" 
ORDER BY orderid 
LIMIT 5
```

## Migration Notes

- The old PHP system used `$depot['language_link']` for URL generation
- The new system generates URLs using the `param` field and `/category/` prefix
- Language support is currently hardcoded to "1" (Ukrainian) - can be made dynamic later
- The old system had more complex URL handling that can be enhanced in future iterations
- Menu data is now completely separate from homepage data for better performance

## Future Enhancements

1. **Multi-language support**: Make language selection dynamic
2. **URL customization**: Allow custom URL patterns for different category types
3. **Menu ordering**: Add drag-and-drop reordering in admin panel
4. **Caching**: Implement Redis caching for better performance
5. **Menu permissions**: Add role-based menu visibility
6. **Menu versioning**: Track menu changes and allow rollbacks
