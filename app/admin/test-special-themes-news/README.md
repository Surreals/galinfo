# 🧪 useSpecialThemesNews Hook - Тестування та Приклади

Цей тестовий компонент демонструє всі можливості хука `useSpecialThemesNews` для роботи з новинами спеціальних тем.

## 🚀 Як запустити тест

1. Запустіть додаток: `npm run dev`
2. Перейдіть до: `/admin/test-special-themes-news`
3. Виберіть один з 5 тестів для перевірки різних функцій

## 📋 Доступні тести

### 1. 🔍 Пошук за параметром
Базове використання хука з пошуком за параметром теми.

```typescript
const { data, loading, error } = useSpecialThemesNews({
  param: 'vidverta-rozmova-z',
  limit: 10
});
```

**Функції:**
- Завантаження новин за параметром
- Пагінація з навігацією
- Інформація про спеціальну тему
- Робота з зображеннями

### 2. 🆔 Пошук за ID
Демонструє пошук новин за ID спеціальної теми.

```typescript
const { data, loading, error } = useSpecialThemesNewsById(136, {
  limit: 5
});
```

**Функції:**
- Пошук за числовим ID
- Автоматичне перетворення ID в параметр
- Валідація ID

### 3. ⚡ Останні новини
Отримання тільки останніх новин спеціальної теми.

```typescript
const { data } = useLatestSpecialThemesNews('vidverta-rozmova-z');
```

**Функції:**
- Лімітована кількість (1 новина)
- Швидке завантаження
- Оптимізовано для головної сторінки

### 4. 🖼️ Новини з зображеннями
Фільтрація новин, які мають зображення.

```typescript
const { newsWithImages } = useSpecialThemesNewsWithImages('vidverta-rozmova-z');
```

**Функції:**
- Автоматична фільтрація
- Додаткові методи для роботи з зображеннями
- Статистика по зображеннях

### 5. 📚 Всі новини
Завантаження великої кількості новин з розширеною пагінацією.

```typescript
const { data, goToNextPage, goToPrevPage } = useAllSpecialThemesNews('vidverta-rozmova-z');
```

**Функції:**
- Збільшений ліміт (50 новин)
- Розширена навігація
- Оптимізовано для архівних сторінок

## 🛠️ Основні методи хука

### Базові методи
```typescript
const {
  data,           // Дані новин
  loading,        // Стан завантаження
  error,          // Помилки
  refetch,        // Повторне завантаження
} = useSpecialThemesNews(options);
```

### Методи управління
```typescript
const {
  setPage,        // Зміна сторінки
  setLimit,       // Зміна ліміту
  setType,        // Зміна типу новин
  setLang,        // Зміна мови
  setApproved,    // Зміна статусу модерації
  setParam,       // Зміна параметра
  setById,        // Переключення режиму пошуку
} = useSpecialThemesNews(options);
```

### Методи навігації
```typescript
const {
  goToNextPage,   // Наступна сторінка
  goToPrevPage,   // Попередня сторінка
  goToFirstPage,  // Перша сторінка
  goToLastPage,   // Остання сторінка
} = useSpecialThemesNews(options);
```

### Методи фільтрації
```typescript
const {
  getLatestNews,      // Остання новина
  getNewsWithImages,  // Новини з зображеннями
  getVideoNews,       // Відео новини
  getNewsByWeight,    // Новини за вагою
  hasNews,           // Чи є новини
} = useSpecialThemesNews(options);
```

### Методи для зображень
```typescript
const {
  getMainImage,   // Головне зображення новини
  hasImages,      // Чи є зображення в новині
  getImagesCount, // Кількість зображень
} = useSpecialThemesNews(options);
```

### Інформаційні методи
```typescript
const {
  getSpecialThemeInfo, // Інформація про тему
} = useSpecialThemesNews(options);
```

## 📊 Структура даних

### Опції хука
```typescript
interface UseSpecialThemesNewsOptions {
  param: string;          // Параметр або ID теми
  page?: number;          // Номер сторінки (за замовчуванням: 1)
  limit?: number;         // Кількість на сторінку (за замовчуванням: 20)
  type?: string;          // Тип новин
  lang?: string;          // Мова (за замовчуванням: '1')
  approved?: boolean;     // Тільки схвалені (за замовчуванням: true)
  autoFetch?: boolean;    // Автозавантаження (за замовчуванням: true)
  byId?: boolean;         // Пошук за ID (за замовчуванням: false)
}
```

### Відповідь API
```typescript
interface SpecialThemesNewsResponse {
  news: SpecialThemesNewsItem[];     // Масив новин
  pagination: {                     // Інформація про пагінацію
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {                        // Застосовані фільтри
    param: string;
    lang: string;
    approved: boolean;
  };
  specialTheme: {                   // Інформація про тему
    id: number;
    param: string;
    title: string;
    link: string;
    cattype: number;
  };
}
```

### Елемент новини
```typescript
interface SpecialThemesNewsItem {
  id: number;                       // Унікальний ID
  ndate: string;                    // Дата публікації
  ntime: string;                    // Час публікації
  ntype: number;                    // Тип новини
  images: NewsImage[];              // Масив зображень
  urlkey: string;                   // URL ключ
  photo: number;                    // Чи є фото
  video: number;                    // Чи є відео
  comments: number;                 // Дозволені коментарі
  printsubheader: number;           // Друк підзаголовка
  rubric: string;                   // Рубрика
  nweight: number;                  // Вага новини (1-4)
  nheader: string;                  // Заголовок
  nsubheader: string;              // Підзаголовок
  nteaser: string;                 // Тізер
  comments_count: number;          // Кількість коментарів
  views_count: number;             // Кількість переглядів
}
```

## 🎯 Приклади реального використання

### Компонент списку новин
```typescript
function SpecialThemeNewsList({ themeParam }: { themeParam: string }) {
  const { data, loading, error, goToNextPage, goToPrevPage } = useSpecialThemesNews({
    param: themeParam,
    limit: 10
  });

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;
  if (!data) return <div>Новини не знайдено</div>;

  return (
    <div>
      <h2>{data.specialTheme.title}</h2>
      
      {data.news.map(news => (
        <article key={news.id}>
          <h3>{news.nheader}</h3>
          <p>{news.nteaser}</p>
          <time>{news.ndate} {news.ntime}</time>
        </article>
      ))}
      
      <nav>
        <button onClick={goToPrevPage} disabled={!data.pagination.hasPrev}>
          Попередня
        </button>
        <span>Сторінка {data.pagination.page} з {data.pagination.totalPages}</span>
        <button onClick={goToNextPage} disabled={!data.pagination.hasNext}>
          Наступна
        </button>
      </nav>
    </div>
  );
}
```

### Компонент з зображеннями
```typescript
function NewsWithImages({ themeParam }: { themeParam: string }) {
  const { newsWithImages, getMainImage, hasImages } = useSpecialThemesNewsWithImages(themeParam);

  return (
    <div>
      {newsWithImages.map(news => (
        <div key={news.id}>
          <h3>{news.nheader}</h3>
          {hasImages(news) && (
            <img src={getMainImage(news)?.urls.tmb} alt={news.nheader} />
          )}
          <p>{news.nteaser}</p>
        </div>
      ))}
    </div>
  );
}
```

### Динамічний пошук
```typescript
function DynamicSearch() {
  const [searchMode, setSearchMode] = useState<'param' | 'id'>('param');
  const [searchValue, setSearchValue] = useState('vidverta-rozmova-z');
  
  const { data, setParam, setById, refetch } = useSpecialThemesNews({
    param: searchValue,
    byId: searchMode === 'id',
    autoFetch: false
  });

  const handleSearch = () => {
    setParam(searchValue);
    setById(searchMode === 'id');
    refetch();
  };

  return (
    <div>
      <select value={searchMode} onChange={(e) => setSearchMode(e.target.value as 'param' | 'id')}>
        <option value="param">За параметром</option>
        <option value="id">За ID</option>
      </select>
      
      <input 
        value={searchValue} 
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={searchMode === 'id' ? 'Введіть ID' : 'Введіть параметр'}
      />
      
      <button onClick={handleSearch}>Пошук</button>
      
      {data && (
        <div>
          <h3>{data.specialTheme.title}</h3>
          <p>Знайдено {data.news.length} новин</p>
        </div>
      )}
    </div>
  );
}
```

## 🔧 API Endpoint

Хук використовує API endpoint:
- **URL**: `/api/news/special-themes/[param]`
- **Метод**: GET
- **Параметри запиту**:
  - `page` - номер сторінки
  - `limit` - кількість елементів
  - `lang` - мова
  - `approved` - статус модерації
  - `type` - тип новин
  - `byId` - пошук за ID

**Приклади запитів:**
```
/api/news/special-themes/vidverta-rozmova-z?page=1&limit=10
/api/news/special-themes/136?byId=true&limit=5
```

## 🐛 Налагодження

Для налагодження використовуйте:

1. **Консоль браузера** - всі помилки логуються
2. **React DevTools** - стан хука
3. **Network Tab** - HTTP запити
4. **Тестову сторінку** - детальна інформація про дані

## 📝 Примітки

- Хук автоматично обробляє помилки мережі
- Підтримує SSR та SSG
- Оптимізований для продуктивності
- Сумісний з TypeScript
- Підтримує всі сучасні браузери

## 🔗 Пов'язані хуки

- `useNewsByRubric` - новини за рубрикою
- `useNewsByRegion` - новини за регіоном  
- `useLatestNews` - останні новини
- `useImportantNews` - важливі новини
