# Breadcrumbs Компонент

## Опис
Breadcrumbs компонент для навігації по сайту, який показує поточний шлях користувача та дозволяє легко переходити між рівнями навігації.

## Структура файлів
```
app/components/breadcrumbs/
├── Breadcrumbs.tsx          # Основний компонент
├── Breadcrumbs.module.css   # Стилі компонента
└── index.ts                 # Експорт компонента
```

## Використання

### Імпорт
```tsx
import { Breadcrumbs } from "@/app/components";
```

### Базове використання
```tsx
<Breadcrumbs 
  items={[
    { label: 'ГОЛОВНА', href: '/' },
    { label: 'СПОРТ', href: '/category/sport' },
    { label: 'НОВИНА' }
  ]} 
/>
```

### Параметри

#### BreadcrumbsProps
- `items: BreadcrumbItem[]` - масив елементів навігації

#### BreadcrumbItem
- `label: string` - текст для відображення
- `href?: string` - посилання (опціонально, якщо немає - поточна сторінка)

## Приклади використання

### CategoryPage
```tsx
<Breadcrumbs 
  items={[
    { label: 'ГОЛОВНА', href: '/' },
    { label: getCategoryTitle(category).toUpperCase() }
  ]} 
/>
```

### ArticlePage
```tsx
<Breadcrumbs 
  items={[
    { label: 'ГОЛОВНА', href: '/' },
    { label: articleData.category, href: `/category/${articleData.category.toLowerCase()}` },
    { label: 'НОВИНА' }
  ]} 
/>
```

## Стилізація

Компонент використовує CSS модулі з наступними класами:

- `.breadcrumbs` - основний контейнер
- `.breadcrumbList` - список елементів
- `.breadcrumbItem` - окремий елемент
- `.separator` - роздільник між елементами (>)
- `.breadcrumbLink` - посилання
- `.breadcrumbCurrent` - поточний елемент (без посилання)

## Особливості

1. **Автоматичні роздільники** - між елементами автоматично додаються ">" символи
2. **Адаптивність** - компонент адаптується до різних розмірів екрану
3. **Доступність** - включає ARIA атрибути для кращої доступності
4. **Типізація** - повністю типізований з TypeScript
5. **Українська локалізація** - готовий для української мови

## Інтеграція

Компонент вже інтегрований в:
- `app/category/[category]/page.tsx` - сторінка категорії
- `app/article/[id]/page.tsx` - сторінка статті

## Вимоги

- Next.js 13+
- TypeScript
- CSS Modules
