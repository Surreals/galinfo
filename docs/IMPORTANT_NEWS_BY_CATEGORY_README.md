# Хук useImportantNewsByCategory - Документація

## Опис

Хук `useImportantNewsByCategory` призначений для отримання важливих новин з конкретної категорії (рубрики) з підтримкою фільтрації за рівнем важливості.

## Файли

- **API ендпоінт:** `/app/api/news/important/by-category/[rubric]/route.ts`
- **Хук:** `/app/hooks/useImportantNewsByCategory.ts`
- **Експорти:** `/app/hooks/index.ts`
- **Тестова сторінка:** `/app/test-important-news-category/page.tsx`

## API Ендпоінт

### GET /api/news/important/by-category/[rubric]

**Параметри запиту:**
- `rubric` (string, required) - рубрика/категорія новин
- `limit` (number, optional) - кількість новин (за замовчуванням: 1)
- `lang` (string, optional) - мова новин (за замовчуванням: '1')
- `level` (number, optional) - рівень важливості (1, 2, 3, 4)

**Приклад запиту:**
```
GET /api/news/important/by-category/politics?limit=5&lang=1&level=2
```

**Відповідь:**
```json
{
  "importantNews": [
    {
      "id": 12345,
      "ndate": "2024-01-15",
      "ntime": "14:30:00",
      "ntype": 1,
      "images": [...],
      "urlkey": "example-news",
      "photo": 0,
      "video": 0,
      "comments": 5,
      "printsubheader": 0,
      "rubric": "politics",
      "nweight": 2,
      "nheader": "Заголовок важливої новини",
      "nsubheader": "Підзаголовок",
      "nteaser": "Короткий опис новини",
      "comments_count": 5,
      "views_count": 150
    }
  ],
  "total": 25,
  "filters": {
    "rubric": "politics",
    "lang": "1",
    "level": 2,
    "limit": 5
  }
}
```

## Використання хука

### Основне використання

```typescript
import { useImportantNewsByCategory } from '@/app/hooks';

function MyComponent() {
  const {
    data,
    loading,
    error,
    refetch,
    getLatestImportantNews,
    getTopImportantNews,
    hasImportantNews
  } = useImportantNewsByCategory({
    rubric: 'politics',
    limit: 5,
    lang: '1',
    level: 2, // Топ важливі новини
    autoFetch: true
  });

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;

  return (
    <div>
      {data?.importantNews.map(news => (
        <div key={news.id}>
          <h3>{news.nheader}</h3>
          <p>Важливість: {news.nweight}</p>
        </div>
      ))}
    </div>
  );
}
```

### Спеціалізовані хуки

#### useLatestImportantNewsByCategory

Отримує останню важливу новину в категорії:

```typescript
import { useLatestImportantNewsByCategory } from '@/app/hooks';

function MyComponent() {
  const { data, loading, error } = useLatestImportantNewsByCategory('politics', {
    lang: '1'
  });
  
  const latestNews = data?.importantNews?.[0];
}
```

#### useTopImportantNewsByCategory

Отримує топ важливу новину (nweight = 2) в категорії:

```typescript
import { useTopImportantNewsByCategory } from '@/app/hooks';

function MyComponent() {
  const { data, loading, error } = useTopImportantNewsByCategory('politics', {
    lang: '1'
  });
}
```

#### usePhotoNewsByCategory

Отримує фото новину (nweight = 3) в категорії:

```typescript
import { usePhotoNewsByCategory } from '@/app/hooks';

function MyComponent() {
  const { data, loading, error } = usePhotoNewsByCategory('politics', {
    lang: '1'
  });
}
```

#### useIllustratedNewsByCategory

Отримує ілюстровану новину (nweight = 4) в категорії:

```typescript
import { useIllustratedNewsByCategory } from '@/app/hooks';

function MyComponent() {
  const { data, loading, error } = useIllustratedNewsByCategory('politics', {
    lang: '1'
  });
}
```

#### useAllImportantNewsByCategory

Отримує всі важливі новини в категорії (до 10):

```typescript
import { useAllImportantNewsByCategory } from '@/app/hooks';

function MyComponent() {
  const { data, loading, error } = useAllImportantNewsByCategory('politics', {
    lang: '1'
  });
}
```

## Параметри

### UseImportantNewsByCategoryOptions

```typescript
interface UseImportantNewsByCategoryOptions {
  rubric: string;           // Рубрика/категорія (обов'язково)
  limit?: number;           // Кількість новин (за замовчуванням: 1)
  lang?: string;            // Мова новин (за замовчуванням: '1')
  level?: number;           // Рівень важливості (1, 2, 3, 4)
  autoFetch?: boolean;      // Автоматичне завантаження (за замовчуванням: true)
}
```

### UseImportantNewsByCategoryReturn

```typescript
interface UseImportantNewsByCategoryReturn {
  data: ImportantNewsByCategoryResponse | null;  // Дані новин
  loading: boolean;                              // Стан завантаження
  error: string | null;                          // Помилка
  refetch: () => void;                           // Функція оновлення даних
  setRubric: (rubric: string) => void;          // Встановити рубрику
  setLimit: (limit: number) => void;             // Встановити ліміт
  setLang: (lang: string) => void;               // Встановити мову
  setLevel: (level: number | undefined) => void; // Встановити рівень важливості
  // Додаткові методи
  getLatestImportantNews: () => ImportantNewsByCategoryItem | null;
  getTopImportantNews: () => ImportantNewsByCategoryItem | null;
  getPhotoNews: () => ImportantNewsByCategoryItem | null;
  getIllustratedNews: () => ImportantNewsByCategoryItem | null;
  hasImportantNews: boolean;
  getNewsByLevel: (level: number) => ImportantNewsByCategoryItem[];
}
```

## Рівні важливості

- **1** - Високо важливі новини
- **2** - Топ важливі новини
- **3** - Фото новини
- **4** - Ілюстровані новини

## Типи даних

### ImportantNewsByCategoryItem

```typescript
interface ImportantNewsByCategoryItem {
  id: number;              // ID новини
  ndate: string;           // Дата новини
  ntime: string;           // Час новини
  ntype: number;           // Тип новини
  images: Array<{...}>;    // Зображення
  urlkey: string;          // URL ключ
  photo: number;           // Фото
  video: number;           // Відео
  comments: number;        // Коментарі
  printsubheader: number;  // Друкувати підзаголовок
  rubric: string;          // Рубрика
  nweight: number;         // Важливість (1-4)
  nheader: string;         // Заголовок
  nsubheader: string;      // Підзаголовок
  nteaser: string;         // Короткий опис
  comments_count: number;  // Кількість коментарів
  views_count: number;     // Кількість переглядів
}
```

## Особливості

1. **Фільтрація за рубрикою:** Отримує тільки новини з вказаної рубрики
2. **Фільтрація за важливістю:** Можливість фільтрувати за рівнем важливості
3. **Автоматичне завантаження:** Хук автоматично завантажує дані при зміні параметрів
4. **Додаткові методи:** Зручні методи для отримання конкретних типів новин
5. **Обробка помилок:** Вбудована обробка помилок з можливістю повторного запиту
6. **Оптимізація:** Використання useCallback для оптимізації ре-рендерів

## Тестування

Для тестування хука відвідайте сторінку `/test-important-news-category`, де можна:
- Змінювати рубрику новин
- Тестувати різні рівні важливості
- Перевіряти роботу спеціалізованих хуків
- Тестувати додаткові методи

## Приклади використання

### Остання важлива новина в політиці

```typescript
const { data, loading, error } = useLatestImportantNewsByCategory('politics');
```

### Топ важливі новини в економіці

```typescript
const { data, loading, error } = useImportantNewsByCategory({
  rubric: 'economics',
  level: 2,
  limit: 5
});
```

### Фото новини в спорті

```typescript
const { data, loading, error } = usePhotoNewsByCategory('sports');
```

### Всі важливі новини в культурі

```typescript
const { data, loading, error } = useAllImportantNewsByCategory('culture');
```

### Використання додаткових методів

```typescript
const {
  data,
  getLatestImportantNews,
  getTopImportantNews,
  hasImportantNews,
  getNewsByLevel
} = useImportantNewsByCategory({ rubric: 'politics' });

// Отримати останню важливу новину
const latestNews = getLatestImportantNews();

// Отримати топ важливу новину
const topNews = getTopImportantNews();

// Перевірити, чи є важливі новини
if (hasImportantNews) {
  // Є важливі новини
}

// Отримати новини з конкретним рівнем важливості
const topLevelNews = getNewsByLevel(2);
```
