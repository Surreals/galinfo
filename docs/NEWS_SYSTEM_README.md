# Система новин для Next.js проекту

Цей документ описує реалізовану систему для роботи з новинами, категоріями та зображеннями в Next.js проекті з прямим підключенням до MariaDB.

## 🏗️ Архітектура

### Основні компоненти

1. **API Routes** - Backend логіка для роботи з базою даних
2. **React Hooks** - Логіка управління станом та завантаження даних
3. **React Components** - UI компоненти для відображення новин
4. **Utility Functions** - Допоміжні функції для роботи з зображеннями

### Структура файлів

```
app/
├── api/
│   └── news/
│       ├── [rubric]/
│       │   └── route.ts          # API для новин по рубриці
│       └── single/
│           └── [...params]/
│               └── route.ts      # API для конкретної новини
├── components/
│   ├── NewsList/
│   │   ├── NewsList.tsx          # Компонент списку новин
│   │   ├── NewsList.module.css   # Стилі для списку новин
│   │   └── index.ts              # Експорт компонента
│   └── NewsDetail/
│       ├── NewsDetail.tsx        # Компонент детальної новини
│       ├── NewsDetail.module.css # Стилі для детальної новини
│       └── index.ts              # Експорт компонента
├── hooks/
│   ├── useNewsByRubric.ts        # Hook для новин по рубриці
│   └── useSingleNews.ts          # Hook для конкретної новини
├── lib/
│   ├── db.ts                     # Підключення до бази даних
│   └── imageUtils.ts             # Утиліти для роботи з зображеннями
└── admin/
    └── test-news/
        ├── page.tsx               # Тестова сторінка
        └── test-news.module.css   # Стилі тестової сторінки
```

## 🚀 API Endpoints

### 1. Новини по рубриці

**URL:** `/api/news/[rubric]`

**Метод:** `GET`

**Параметри запиту:**
- `page` - номер сторінки (за замовчуванням: 1)
- `limit` - кількість новин на сторінці (за замовчуванням: 20)
- `type` - тип новини (news, articles, photo, video, audio, announces, blogs)
- `lang` - мова (1 - українська, 2 - англійська, 3 - російська)
- `approved` - тільки схвалені новини (за замовчуванням: true)

**Приклад запиту:**
```bash
GET /api/news/1?page=1&limit=10&type=news&lang=1
```

**Відповідь:**
```json
{
  "news": [
    {
      "id": 123,
      "ndate": "2024-01-15",
      "ntype": 1,
      "nheader": "Заголовок новини",
      "nteaser": "Короткий опис новини",
      "images": [...],
      "comments_count": 5,
      "views_count": 150
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "rubric": "1",
    "type": "news",
    "lang": "1",
    "approved": true
  }
}
```

### 2. Конкретна новина

**URL:** `/api/news/single/[articleType]/[urlkey_id]`

**Метод:** `GET`

**Параметри запиту:**
- `lang` - мова (за замовчуванням: 1)

**Приклад запиту:**
```bash
GET /api/news/single/news/test-article_123?lang=1
```

**Відповідь:**
```json
{
  "article": {
    "id": 123,
    "nheader": "Заголовок новини",
    "nbody": "<p>Текст новини...</p>",
    "images": [
      {
        "id": 456,
        "filename": "image.jpg",
        "title": "Опис зображення",
        "urls": {
          "full": "/media/gallery/full/image.jpg",
          "intxt": "/media/gallery/intxt/image.jpg",
          "tmb": "/media/gallery/tmb/image.jpg"
        }
      }
    ],
    "rubrics": [...],
    "tags": [...],
    "relatedNews": [...],
    "views_count": 150,
    "comments_count": 5
  },
  "meta": {
    "type": "news",
    "urlkey": "test-article",
    "id": 123
  }
}
```

## 🎣 React Hooks

### useNewsByRubric

Hook для отримання новин по рубриці з підтримкою пагінації та фільтрації.

```typescript
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';

function MyComponent() {
  const {
    data,
    loading,
    error,
    refetch,
    setPage,
    setLimit,
    setType,
    setLang
  } = useNewsByRubric({
    rubric: '1',
    page: 1,
    limit: 20,
    type: 'news',
    lang: '1',
    autoFetch: true
  });

  // Використання даних...
}
```

### useSingleNews

Hook для отримання конкретної новини.

```typescript
import { useSingleNews } from '@/app/hooks/useSingleNews';

function MyComponent() {
  const { data, loading, error, refetch } = useSingleNews({
    articleType: 'news',
    urlkey: 'test-article',
    id: 123,
    lang: '1',
    autoFetch: true
  });

  // Використання даних...
}
```

## 🧩 React Components

### NewsList

Компонент для відображення списку новин з пагінацією та фільтрами.

```typescript
import { NewsListByRubric } from '@/app/components';

function MyPage() {
  return (
    <NewsListByRubric
      rubric="1"
      initialPage={1}
      initialLimit={20}
      showFilters={true}
      showPagination={true}
    />
  );
}
```

**Props:**
- `rubric` - ID рубрики або 'all' для всіх рубрик
- `initialPage` - початкова сторінка
- `initialLimit` - початкова кількість новин на сторінці
- `showFilters` - показувати фільтри
- `showPagination` - показувати пагінацію

### NewsDetail

Компонент для відображення детальної новини з галереєю зображень.

```typescript
import { NewsDetail } from '@/app/components';

function MyPage() {
  return (
    <NewsDetail
      articleType="news"
      urlkey="test-article"
      id={123}
      lang="1"
    />
  );
}
```

**Props:**
- `articleType` - тип новини
- `urlkey` - URL ключ новини
- `id` - ID новини
- `lang` - мова

## 🖼️ Робота з зображеннями

### Структура зображень

Зображення зберігаються в трьох розмірах:
- `full` - повнорозмірне зображення
- `intxt` - зображення для вставки в текст
- `tmb` - мініатюра

### Утиліти для зображень

```typescript
import { 
  getImageUrl, 
  getImageAlt, 
  formatNewsImages,
  getMainImage 
} from '@/app/lib/imageUtils';

// Генерація URL для зображення
const imageUrl = getImageUrl('image.jpg', 'intxt');

// Отримання alt тексту
const altText = getImageAlt(imageData, '1');

// Формування об'єктів зображень
const images = formatNewsImages(imagesData, imageIds, '1');

// Отримання основного зображення
const mainImage = getMainImage(images);
```

## 🎨 Стилізація

Всі компоненти використовують CSS Modules з сучасним дизайном:

- Responsive дизайн
- Плавні анімації та переходи
- Сучасна типографіка
- Адаптивна сітка
- Hover ефекти

## 🧪 Тестування

Для тестування функціональності створено спеціальну сторінку `/admin/test-news` з двома вкладками:

1. **Список новин по рубриці** - демонстрація фільтрації та пагінації
2. **Детальна новина** - демонстрація галереї зображень та повного контенту

## 🔧 Налаштування

### Environment змінні

Переконайтеся, що у вас налаштовані змінні для підключення до бази даних:

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
DB_PORT=3306
```

### База даних

Система працює з існуючою MariaDB базою даних та використовує наступні таблиці:

- `a_news` - основна таблиця новин
- `a_news_headers` - заголовки та тізери
- `a_news_body` - тіло новини
- `a_newsmeta` - SEO мета-дані
- `a_cats` - категорії/рубрики
- `a_pics` - зображення
- `a_statview` - статистика переглядів
- `a_statcomm` - статистика коментарів
- `a_tags` та `a_tags_map` - теги

## 🚀 Використання

### 1. Створення сторінки з новинами по рубриці

```typescript
// app/news/[rubric]/page.tsx
import { NewsListByRubric } from '@/app/components';

export default function NewsByRubricPage({ params }: { params: { rubric: string } }) {
  return (
    <div>
      <h1>Новини по рубриці {params.rubric}</h1>
      <NewsListByRubric rubric={params.rubric} />
    </div>
  );
}
```

### 2. Створення сторінки конкретної новини

```typescript
// app/news/[articleType]/[urlkeyId]/page.tsx
import { NewsDetail } from '@/app/components';

export default function NewsDetailPage({ params }: { params: { articleType: string, urlkeyId: string } }) {
  const [articleType, urlkeyId] = params;
  const [urlkey, id] = urlkeyId.split('_');
  
  return (
    <NewsDetail
      articleType={articleType}
      urlkey={urlkey}
      id={parseInt(id)}
    />
  );
}
```

### 3. Використання в існуючих компонентах

```typescript
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';

function HomePage() {
  const { data: latestNews } = useNewsByRubric({
    rubric: '1',
    limit: 5,
    autoFetch: true
  });

  return (
    <div>
      <h2>Останні новини</h2>
      {latestNews?.news.map(news => (
        <div key={news.id}>
          <h3>{news.nheader}</h3>
          <p>{news.nteaser}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔒 Безпека

- Валідація всіх вхідних параметрів
- Захист від SQL ін'єкцій через параметризовані запити
- Обробка помилок бази даних
- Перевірка прав доступу до новин

## 📱 Адаптивність

Всі компоненти повністю адаптивні та працюють на всіх пристроях:

- Mobile-first підхід
- Responsive сітка
- Адаптивні зображення
- Touch-friendly інтерфейс

## 🎯 Особливості

- **Автоматичне оновлення статистики** - при перегляді новини збільшується лічильник переглядів
- **Кешування** - React hooks автоматично кешують дані
- **Оптимізація зображень** - автоматичне вибору розміру зображення
- **SEO оптимізація** - підтримка мета-даних та структурованих даних
- **Мультимовність** - підтримка української, англійської та російської мов

## 🔄 Оновлення та розширення

Система легко розширюється для додавання нової функціональності:

- Додавання нових типів контенту
- Інтеграція з системами коментарів
- Додавання системи рейтингів
- Інтеграція з соціальними мережами
- Додавання системи рекомендацій

## 📞 Підтримка

При виникненні питань або проблем звертайтеся до команди розробки або створюйте issues в репозиторії проекту.
