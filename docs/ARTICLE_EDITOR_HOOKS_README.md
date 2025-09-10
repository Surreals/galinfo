# Article Editor Hooks Documentation

## Огляд

Створено систему хуків для сторінки `/admin/article-editor`, яка забезпечує повну функціональність редагування новин на основі аналізу PHP коду з `deprecated_php_app`.

## Створені хуки

### 1. `useArticleEditorData` - Хук для завантаження довідкових даних

**Файл:** `app/hooks/useArticleEditorData.ts`

**Призначення:** Завантажує всі необхідні довідкові дані для форми редагування новин.

**Повертає:**
- `articleTypes` - типи статей (новина, стаття, фоторепортаж, відео, блог)
- `categories` - категорії (рубрики, теми, регіони)
- `users` - користувачі (редактори, журналісти, блогери)
- `languages` - мови
- `tags` - теги
- `loading` - стан завантаження
- `error` - помилки

**Допоміжні функції:**
- `getRubrics(categories)` - фільтрує рубрики
- `getThemes(categories)` - фільтрує теми
- `getRegions(categories)` - фільтрує регіони
- `getEditors(users)` - фільтрує редакторів
- `getJournalists(users)` - фільтрує журналістів
- `getBloggers(users)` - фільтрує блогерів

### 2. `useArticleData` - Хук для роботи з даними новини

**Файл:** `app/hooks/useArticleData.ts`

**Призначення:** Завантажує, зберігає та оновлює дані конкретної новини.

**Повертає:**
- `data` - дані новини
- `loading` - стан завантаження
- `error` - помилки
- `refetch()` - функція повторного завантаження
- `updateData(updates)` - функція оновлення даних

## API Ендпоінти

### 1. `/api/admin/article-types` - Типи статей
- **GET** - повертає список типів статей

### 2. `/api/admin/categories` - Категорії
- **GET** - повертає список категорій
- **Параметри:** `lang`, `cattype`

### 3. `/api/admin/users` - Користувачі
- **GET** - повертає список користувачів

### 4. `/api/admin/languages` - Мови
- **GET** - повертає список мов

### 5. `/api/admin/tags` - Теги
- **GET** - повертає список тегів

### 6. `/api/admin/articles/[id]` - Статті
- **GET** - отримує статтю за ID
- **PUT** - оновлює статтю
- **DELETE** - видаляє статтю

## Структура даних новини

```typescript
interface ArticleData {
  // Основні поля
  id?: number;
  nheader: string;        // заголовок
  nsubheader: string;     // підзаголовок
  nteaser: string;        // лід
  nbody: string;          // повний текст
  
  // Спеціальні заголовки
  sheader?: string;       // заголовок для слайдшоу
  steaser?: string;       // лід для слайдшоу
  
  // Мета дані
  ntitle?: string;        // meta title
  ndescription?: string;  // meta description
  nkeywords?: string;     // meta keywords
  
  // Налаштування
  ntype: number;          // тип статті
  rubric: number[];       // рубрики
  region: number[];       // регіони
  theme?: number;         // тема
  tags: string[];         // теги
  
  // Автори
  nauthor?: number;       // ID редактора
  userid?: number;        // ID автора/журналіста
  showauthor: boolean;    // показувати автора
  
  // Пріоритет та шаблон
  nweight: number;        // пріоритет
  layout: number;         // шаблон
  
  // Додаткові параметри
  rated: boolean;         // головна стрічка
  headlineblock: boolean; // блок в головній стрічці
  hiderss: boolean;       // не транслювати в RSS
  nocomment: boolean;     // заборонити коментарі
  maininblock: boolean;   // головна в блоці рубрик
  idtotop?: number;       // ID для TOP
  suggest: boolean;       // блок ВИБРАНЕ
  photo: boolean;         // позначати «з фото»
  video: boolean;         // позначати «з відео»
  
  // Час публікації
  ndate: string;          // дата (YYYY-MM-DD)
  ntime: string;          // час (HH:mm:ss)
  
  // Публікація
  approved: boolean;      // опубліковано
  to_twitter: boolean;    // публікувати в Twitter
  
  // Зображення
  images: string;         // зображення (через кому)
  
  // Мова
  lang: string;           // мова
}
```

## Використання

### В компоненті NewsEditorSidebar

```typescript
import { useArticleEditorData } from "@/app/hooks/useArticleEditorData";

export default function NewsEditorSidebar({ articleData }) {
  const { 
    articleTypes, 
    categories, 
    users, 
    loading, 
    error 
  } = useArticleEditorData({ lang: 'ua' });

  // Фільтруємо дані
  const rubrics = getRubrics(categories);
  const regions = getRegions(categories);
  const editors = getEditors(users);
  
  // Використовуємо в селектах
  <Select
    options={rubrics.map(r => ({ label: r.title, value: r.id }))}
    value={selectedRubrics}
    onChange={setSelectedRubrics}
  />
}
```

### В головному компоненті

```typescript
import { useArticleData } from "@/app/hooks/useArticleData";

export default function ArticleEditor() {
  const { data: articleData, loading, error } = useArticleData({ id: newsId });
  
  if (loading) return <Spin />;
  if (error) return <Alert message={error} />;
  
  return (
    <div>
      <NewsEditorHeader articleData={articleData} />
      <NewsEditorSidebar articleData={articleData} />
    </div>
  );
}
```

## Константи

### Типи статей
```typescript
ARTICLE_TYPE_OPTIONS = [
  { value: 1, label: 'Новина' },
  { value: 2, label: 'Стаття' },
  { value: 3, label: 'Фоторепортаж' },
  { value: 4, label: 'Відео' },
  { value: 20, label: 'Блог' },
];
```

### Пріоритети
```typescript
PRIORITY_OPTIONS = [
  { value: 0, label: 'Звичайний' },
  { value: 1, label: 'Важливий' },
  { value: 2, label: 'ТОП! Слайдшоу' },
];
```

### Шаблони
```typescript
LAYOUT_OPTIONS = [
  { value: 0, label: 'По замовчуванню' },
  { value: 1, label: 'Малі фото' },
  { value: 2, label: 'Фотослайд' },
  { value: 3, label: 'Фото в тексті/після тексту' },
  { value: 10, label: 'Без фото' },
];
```

## Особливості реалізації

1. **Мультимовність** - підтримка різних мов
2. **Множинний вибір** - рубрики та регіони можна обирати кілька
3. **Валідація** - перевірка обов'язкових полів
4. **Обробка помилок** - показ помилок завантаження
5. **Завантаження** - індикатори завантаження
6. **Типізація** - повна TypeScript підтримка

## Відповідність PHP коду

Хуки реалізують всю функціональність з PHP файлу `adm_func_addnews.php`:
- Всі поля форми
- Всі типи даних
- Всі валідації
- Всі додаткові параметри
- Структура БД (6 таблиць)
