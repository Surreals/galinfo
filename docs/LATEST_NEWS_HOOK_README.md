# Хук useLatestNews - Документація

## Опис

Хук `useLatestNews` призначений для отримання останніх новин з усіх категорій з підтримкою пагінації та фільтрації.

## Файли

- **API ендпоінт:** `/app/api/news/latest/route.ts`
- **Хук:** `/app/hooks/useLatestNews.ts`
- **Експорти:** `/app/hooks/index.ts`
- **Тестова сторінка:** `/app/test-latest-news/page.tsx`

## API Ендпоінт

### GET /api/news/latest

**Параметри запиту:**
- `limit` (number, optional) - кількість новин на сторінку (за замовчуванням: 20)
- `lang` (string, optional) - мова новин (за замовчуванням: '1')
- `page` (number, optional) - номер сторінки (за замовчуванням: 1)

**Приклад запиту:**
```
GET /api/news/latest?limit=10&lang=1&page=1
```

**Відповідь:**
```json
{
  "news": [
    {
      "id": 12345,
      "ndate": "2024-01-15",
      "ntime": "14:30:00",
      "ntype": 1,
      "images": [
        {
          "id": 123,
          "filename": "example-image.jpg",
          "title": "Опис зображення",
          "urls": {
            "full": "https://galinfo.com.ua/media/gallery/full/example-image.jpg",
            "intxt": "https://galinfo.com.ua/media/gallery/intxt/example-image.jpg",
            "tmb": "https://galinfo.com.ua/media/gallery/tmb/example-image.jpg"
          }
        }
      ],
      "urlkey": "example-news",
      "photo": 0,
      "video": 0,
      "comments": 5,
      "printsubheader": 0,
      "rubric": "politics",
      "nweight": 1,
      "nheader": "Заголовок новини",
      "nsubheader": "Підзаголовок",
      "nteaser": "Короткий опис новини",
      "comments_count": 5,
      "views_count": 150
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1000,
    "totalPages": 100,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "lang": "1",
    "approved": true
  }
}
```

## Використання хука

### Основне використання

```typescript
import { useLatestNews } from '@/app/hooks';

function MyComponent() {
  const {
    data,
    loading,
    error,
    refetch,
    setPage,
    setLimit,
    setLang,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    getMainImage,
    hasImages,
    getImagesCount
  } = useLatestNews({
    page: 1,
    limit: 20,
    lang: '1',
    autoFetch: true
  });

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;

  return (
    <div>
      {data?.news.map(news => {
        const mainImage = getMainImage(news);
        const hasNewsImages = hasImages(news);
        
        return (
          <div key={news.id}>
            {hasNewsImages && mainImage && (
              <img 
                src={mainImage.urls.intxt} 
                alt={mainImage.title}
                className="w-32 h-24 object-cover"
              />
            )}
            <h3>{news.nheader}</h3>
            <p>{news.nteaser}</p>
          </div>
        );
      })}
    </div>
  );
}
```

### Додаткові хуки

#### useLatestNewsFirstPage

Отримує тільки першу сторінку новин:

```typescript
import { useLatestNewsFirstPage } from '@/app/hooks';

function MyComponent() {
  const { data, loading, error } = useLatestNewsFirstPage({
    limit: 10,
    lang: '1'
  });
}
```

#### useLatestNewsWithLimit

Отримує новини з фіксованим лімітом:

```typescript
import { useLatestNewsWithLimit } from '@/app/hooks';

function MyComponent() {
  const { data, loading, error } = useLatestNewsWithLimit(5, {
    lang: '1'
  });
}
```

## Параметри

### UseLatestNewsOptions

```typescript
interface UseLatestNewsOptions {
  page?: number;        // Номер сторінки (за замовчуванням: 1)
  limit?: number;       // Кількість новин на сторінку (за замовчуванням: 20)
  lang?: string;        // Мова новин (за замовчуванням: '1')
  autoFetch?: boolean;  // Автоматичне завантаження (за замовчуванням: true)
}
```

### UseLatestNewsReturn

```typescript
interface UseLatestNewsReturn {
  data: LatestNewsResponse | null;  // Дані новин
  loading: boolean;                 // Стан завантаження
  error: string | null;             // Помилка
  refetch: () => void;              // Функція оновлення даних
  setPage: (page: number) => void;  // Встановити сторінку
  setLimit: (limit: number) => void; // Встановити ліміт
  setLang: (lang: string) => void;  // Встановити мову
  goToNextPage: () => void;         // Перейти на наступну сторінку
  goToPrevPage: () => void;         // Перейти на попередню сторінку
  goToFirstPage: () => void;        // Перейти на першу сторінку
  goToLastPage: () => void;         // Перейти на останню сторінку
  getMainImage: (newsItem: LatestNewsItem) => NewsImage | null; // Отримати основне зображення
  hasImages: (newsItem: LatestNewsItem) => boolean; // Перевірити наявність зображень
  getImagesCount: (newsItem: LatestNewsItem) => number; // Отримати кількість зображень
}
```

## Типи даних

### LatestNewsItem

```typescript
interface LatestNewsItem {
  id: number;              // ID новини
  ndate: string;           // Дата новини
  ntime: string;           // Час новини
  ntype: number;           // Тип новини
  images: NewsImage[];     // Зображення (масив об'єктів NewsImage)
  urlkey: string;          // URL ключ
  photo: number;           // Фото
  video: number;           // Відео
  comments: number;        // Коментарі
  printsubheader: number;  // Друкувати підзаголовок
  rubric: string;          // Рубрика
  nweight: number;         // Важливість
  nheader: string;         // Заголовок
  nsubheader: string;      // Підзаголовок
  nteaser: string;         // Короткий опис
  comments_count: number;  // Кількість коментарів
  views_count: number;     // Кількість переглядів
}
```

## Особливості

1. **Автоматичне завантаження:** Хук автоматично завантажує дані при зміні параметрів
2. **Пагінація:** Підтримка навігації по сторінках з допоміжними методами
3. **Фільтрація:** Можливість фільтрувати за мовою
4. **Обробка помилок:** Вбудована обробка помилок з можливістю повторного запиту
5. **Оптимізація:** Використання useCallback для оптимізації ре-рендерів
6. **Підтримка зображень:** Автоматичне завантаження та обробка зображень з різними розмірами

## Робота з зображеннями

Хук `useLatestNews` надає зручні методи для роботи з зображеннями новин:

### Методи для роботи з зображеннями

```typescript
// Отримати основне зображення новини
const mainImage = getMainImage(newsItem);

// Перевірити чи є зображення у новини
const hasNewsImages = hasImages(newsItem);

// Отримати кількість зображень
const imagesCount = getImagesCount(newsItem);
```

### Структура зображення

```typescript
interface NewsImage {
  id: number;           // ID зображення
  filename: string;     // Ім'я файлу
  title: string;        // Опис зображення
  urls: {
    full: string;       // Повнорозмірне зображення
    intxt: string;      // Зображення для тексту
    tmb: string;        // Мініатюра
  };
}
```

### Приклад використання зображень

```typescript
function NewsItem({ news }) {
  const { getMainImage, hasImages } = useLatestNews();
  
  const mainImage = getMainImage(news);
  const hasNewsImages = hasImages(news);
  
  return (
    <div>
      {hasNewsImages && mainImage && (
        <img 
          src={mainImage.urls.intxt} 
          alt={mainImage.title}
          className="news-image"
        />
      )}
      <h3>{news.nheader}</h3>
      <p>{news.nteaser}</p>
    </div>
  );
}
```

## Тестування

Для тестування хука відвідайте сторінку `/test-latest-news`, де можна:
- Змінювати параметри пагінації
- Тестувати різні варіанти використання хука
- Перевіряти обробку помилок
- Тестувати навігацію по сторінках

## Приклади використання

### Простий список новин

```typescript
const { data, loading, error } = useLatestNews({ limit: 10 });
```

### Новинна стрічка з пагінацією

```typescript
const {
  data,
  loading,
  error,
  goToNextPage,
  goToPrevPage,
  goToFirstPage,
  goToLastPage
} = useLatestNews({ page: 1, limit: 20 });
```

### Останні 5 новин

```typescript
const { data, loading, error } = useLatestNewsWithLimit(5);
```

### Перша сторінка з 10 новинами

```typescript
const { data, loading, error } = useLatestNewsFirstPage({ limit: 10 });
```
