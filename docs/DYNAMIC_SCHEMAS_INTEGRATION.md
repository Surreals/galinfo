# Динамічна інтеграція схем з API

## Огляд

Система динамічних схем дозволяє керувати структурою та макетом всіх основних рендерерів сайту через API `/api/admin/templates`. Це дозволяє змінювати верстку сторінок без зміни коду, зберігаючи при цьому можливість fallback до існуючих статичних схем.

## Архітектура

### 1. API Endpoint

**Endpoint:** `/api/admin/templates`

**Метод:** `GET`

**Відповідь:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "template_id": "main-desktop",
      "name": "Головна сторінка (Десктоп)",
      "description": "Схема для десктопної версії головної сторінки",
      "schema_json": { /* схема блоків */ },
      "created_at": "2025-10-01T20:09:00Z",
      "updated_at": "2025-10-01T20:09:00Z"
    },
    // ... інші шаблони
  ]
}
```

### 2. Типи шаблонів (Template IDs)

| Template ID | Призначення |
|-------------|-------------|
| `main-desktop` | Головна сторінка (десктоп) |
| `main-mobile` | Головна сторінка (мобільна) |
| `category-desktop` | Сторінка категорії (десктоп) |
| `category-mobile` | Сторінка категорії (мобільна) |
| `hero` | Hero секція |
| `hero-info-desktop` | Hero Info секція (десктоп) |
| `hero-info-mobile` | Hero Info секція (мобільна) |
| `article-desktop` | Сторінка новини (десктоп) |
| `article-mobile` | Сторінка новини (мобільна) |

## Реалізація

### 1. Хук `useTemplateSchemas`

**Файл:** `app/hooks/useTemplateSchemas.ts`

Хук автоматично завантажує всі схеми з API при першому рендері та надає зручний доступ до них.

**Важливо:** Схеми в базі даних зберігаються як JSON string, тому хук автоматично парсить їх у JavaScript об'єкти.

**Використання:**
```typescript
import { useTemplateSchemas } from '@/app/hooks/useTemplateSchemas';

function MyComponent() {
  const { schemas, loading, error, getSchema } = useTemplateSchemas();
  
  // Отримання конкретної схеми
  const mainDesktopSchema = getSchema('main-desktop');
  
  // Використання з fallback
  const schema = mainDesktopSchema || defaultSchema;
}
```

**API хука:**
- `schemas` - об'єкт з усіма завантаженими схемами
- `loading` - статус завантаження
- `error` - помилка завантаження (якщо є)
- `getSchema(templateId)` - функція для отримання конкретної схеми

### 2. Оновлені рендерери

#### HomePageRenderer

**Файл:** `app/components/HomePageRenderer.tsx`

**Зміни:**
- Додано імпорт `useTemplateSchemas`
- Отримання схем `main-desktop` та `main-mobile` з API
- Fallback до статичних схем `desktopSchema` та `mobileSchema`
- Передача динамічних схем до `HeroRenderer`

**Логіка вибору схеми:**
```typescript
const currentSchema = schema || apiSchema || defaultSchema;
```
Пріоритет: переданий schema → API schema → дефолтний schema

#### CategoryRenderer

**Файл:** `app/components/CategoryRenderer.tsx`

**Зміни:**
- Додано пропси `apiDesktopSchema` та `apiMobileSchema`
- Fallback до статичних схем `categoryDesktopSchema` та `categoryMobileSchema`

**Використання:**
```typescript
<CategoryRenderer 
  category={category}
  apiDesktopSchema={apiCategoryDesktopSchema}
  apiMobileSchema={apiCategoryMobileSchema}
/>
```

#### CategoryPageClient

**Файл:** `app/[category]/CategoryPageClient.tsx`

**Зміни:**
- Додано імпорт `useTemplateSchemas`
- Отримання схем `category-desktop` та `category-mobile` з API
- Передача схем до `CategoryRenderer`

#### HeroRenderer

**Файл:** `app/components/HeroRenderer.tsx`

**Зміни:**
- Вже підтримує динамічні схеми через пропси `schema` та `infoSchema`
- `HomePageRenderer` передає йому API схеми або дефолтні

#### ArticlePageRenderer

**Файл:** `app/components/ArticlePageRenderer.tsx`

**Зміни:**
- Додано імпорт `useTemplateSchemas`
- Отримання схем `article-desktop` та `article-mobile` з API
- Fallback до статичних схем `articlePageDesktopSchema` та `articlePageMobileSchema`

## Парсинг JSON схем

Схеми в базі даних зберігаються як JSON string у полі `schema_json` (тип `JSON` або `TEXT`). При отриманні з API:

1. MySQL може повертати JSON поле як string або як об'єкт (залежно від драйвера)
2. Хук `useTemplateSchemas` автоматично перевіряє тип і парсить string у об'єкт
3. У разі помилки парсингу схема ігнорується і використовується fallback

```typescript
// Автоматичний парсинг у хуку
let schemaObj = template.schema_json;
if (typeof schemaObj === 'string') {
  try {
    schemaObj = JSON.parse(schemaObj);
  } catch (e) {
    console.error(`Failed to parse schema for ${template.template_id}:`, e);
    return; // Ігноруємо некоректну схему
  }
}
```

## Механізм Fallback

Система має багаторівневий fallback механізм:

1. **API Schema** - якщо схема доступна в базі даних і успішно розпарсена
2. **Default Schema** - якщо API не повернув схему, виникла помилка або схема некоректна

**Приклад:**
```typescript
// Отримуємо схему з API (якщо є)
const apiDesktopSchema = getSchema('main-desktop');
const apiMobileSchema = getSchema('main-mobile');

// Визначаємо, яку схему використовувати
const defaultSchema = isMobile ? mobileSchema : desktopSchema;
const apiSchema = isMobile ? apiMobileSchema : apiDesktopSchema;
const currentSchema = schema || apiSchema || defaultSchema;
```

## Переваги

1. **Гнучкість** - можливість змінювати макет сторінок без зміни коду
2. **Безпека** - існуючі статичні схеми залишаються як fallback
3. **Простота** - всі рендерери використовують єдиний підхід
4. **Масштабованість** - легко додати нові типи шаблонів
5. **Відсутність breaking changes** - якщо API не працює, використовуються дефолтні схеми

## Структура схеми

Схеми містять масив блоків, які описують структуру сторінки:

```typescript
{
  "blocks": [
    {
      "type": "Hero",
      "config": {
        "autoplay": true,
        "showArrows": true,
        "limit": 4
      }
    },
    {
      "type": "CategoryNews",
      "categoryId": 1,
      "config": {
        "useRealData": true,
        "limit": 8
      }
    }
    // ... інші блоки
  ]
}
```

## Тестування

Для тестування системи:

1. **З API схемами:**
   - Створіть схеми через адмін панель або API
   - Перевірте, що сторінки використовують нові схеми

2. **Без API схем (fallback):**
   - Відключіть базу даних або видаліть записи з `template_schemas`
   - Перевірте, що сторінки працюють зі статичними схемами

3. **Помилка API:**
   - Перевірте, що при помилці API система використовує fallback схеми
   - Помилки логуються в консоль

## Приклад використання в адмін панелі

```typescript
// Збереження схеми
const response = await fetch('/api/admin/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    template_id: 'main-desktop',
    name: 'Головна сторінка (Десктоп)',
    description: 'Оновлена схема головної сторінки',
    schema_json: {
      blocks: [
        { type: 'Hero', config: { ... } },
        { type: 'CategoryNews', categoryId: 1, config: { ... } }
      ]
    }
  })
});
```

## Підтримка

При виникненні проблем:

1. Перевірте консоль браузера на помилки
2. Перевірте API endpoint `/api/admin/templates`
3. Перевірте структуру схеми в базі даних
4. У разі проблем система автоматично використає fallback схеми

## Майбутні покращення

1. Валідація схем на стороні API
2. Версіонування схем
3. Попередній перегляд схем перед збереженням
4. Експорт/імпорт схем
5. Історія змін схем

