# 🏷️ useNewsByTag Hook - Тестування та Приклади

Цей тестовий компонент демонструє всі можливості хука `useNewsByTag` для роботи з новинами за тегами.

## 🚀 Як запустити тест

1. Запустіть додаток: `npm run dev`
2. Перейдіть до: `/admin/test-news-by-tag`
3. Виберіть тег та один з 5 тестів для перевірки різних функцій

## 📋 Структура тегів

Теги зберігаються в базі даних у таких таблицях:
- `a_tags` - основна таблиця тегів (id, tag)
- `a_tags_map` - зв'язки між новинами та тегами (newsid, tagid)

Приклад структури тегу:
```json
{
  "id": 1844,
  "tag": "Кабмін"
}
```

## 📋 Доступні тести

### 1. 🏷️ Базове використання
Основна функціональність хука з повним набором можливостей.

```typescript
const { data, loading, error } = useNewsByTag({
  tagId: 1844, // Кабмін
  limit: 10
});
```

**Функції:**
- Завантаження новин за тегом
- Пагінація з навігацією
- Інформація про тег
- Робота з зображеннями
- Статистика

### 2. ⚡ Останні новини
Отримання тільки останніх новин за тегом.

```typescript
const { data } = useLatestNewsByTag(1844);
```

**Функції:**
- Лімітована кількість (1 новина)
- Швидке завантаження
- Оптимізовано для головної сторінки

### 3. 🖼️ Новини з зображеннями
Фільтрація новин, які мають зображення.

```typescript
const { newsWithImages } = useNewsByTagWithImages(1844);
```

**Функції:**
- Автоматична фільтрація
- Додаткові методи для роботи з зображеннями
- Статистика по зображеннях

### 4. 🎥 Відео новини
Фільтрація відео новин за тегом.

```typescript
const { videoNews } = useVideoNewsByTag(1844);
```

**Функції:**
- Фільтрація за типом відео (video = 1)
- Спеціалізований для медіа контенту

### 5. 📚 Всі новини
Завантаження великої кількості новин з розширеною пагінацією.

```typescript
const { data, goToNextPage, goToPrevPage } = useAllNewsByTag(1844);
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
} = useNewsByTag(options);
```

### Методи управління
```typescript
const {
  setPage,        // Зміна сторінки
  setLimit,       // Зміна ліміту
  setType,        // Зміна типу новин
  setLang,        // Зміна мови
  setApproved,    // Зміна статусу модерації
  setTagId,       // Зміна тегу
} = useNewsByTag(options);
```

### Методи навігації
```typescript
const {
  goToNextPage,   // Наступна сторінка
  goToPrevPage,   // Попередня сторінка
  goToFirstPage,  // Перша сторінка
  goToLastPage,   // Остання сторінка
} = useNewsByTag(options);
```

### Методи фільтрації
```typescript
const {
  getLatestNews,      // Остання новина
  getNewsWithImages,  // Новини з зображеннями
  getVideoNews,       // Відео новини
  getNewsByWeight,    // Новини за вагою
  getNewsByType,      // Новини за типом
  hasNews,           // Чи є новини
} = useNewsByTag(options);
```

### Методи для зображень
```typescript
const {
  getMainImage,   // Головне зображення новини
  hasImages,      // Чи є зображення в новині
  getImagesCount, // Кількість зображень
} = useNewsByTag(options);
```

### Інформаційні методи
```typescript
const {
  getTagInfo,     // Інформація про тег
  getTotalNews,   // Загальна кількість новин
  getNewsCount,   // Кількість новин на сторінці
} = useNewsByTag(options);
```

## 📊 Структура даних

### Опції хука
```typescript
interface UseNewsByTagOptions {
  tagId: number;              // ID тегу (обов'язково)
  page?: number;              // Номер сторінки (за замовчуванням: 1)
  limit?: number;             // Кількість на сторінку (за замовчуванням: 20)
  type?: string;              // Тип новин
  lang?: string;              // Мова (за замовчуванням: '1')
  approved?: boolean;         // Тільки схвалені (за замовчуванням: true)
  autoFetch?: boolean;        // Автозавантаження (за замовчуванням: true)
}
```

### Відповідь API
```typescript
interface NewsByTagResponse {
  news: NewsByTagItem[];          // Масив новин
  pagination: {                  // Інформація про пагінацію
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {                     // Застосовані фільтри
    tagId: number;
    lang: string;
    approved: boolean;
    type?: string;
  };
  tag: {                         // Інформація про тег
    id: number;
    tag: string;
  };
}
```

### Елемент новини
```typescript
interface NewsByTagItem {
  id: number;                    // Унікальний ID
  ndate: string;                 // Дата публікації
  ntime: string;                 // Час публікації
  ntype: number;                 // Тип новини
  images: NewsImage[];           // Масив зображень
  urlkey: string;                // URL ключ
  photo: number;                 // Чи є фото
  video: number;                 // Чи є відео
  comments: number;              // Дозволені коментарі
  printsubheader: number;        // Друк підзаголовка
  rubric: string;                // Рубрика
  nweight: number;               // Вага новини (1-4)
  nheader: string;               // Заголовок
  nsubheader: string;            // Підзаголовок
  nteaser: string;               // Тізер
  comments_count: number;        // Кількість коментарів
  views_count: number;           // Кількість переглядів
}
```

## 🎯 Приклади реального використання

### Компонент списку новин за тегом
```typescript
function TagNewsList({ tagId }: { tagId: number }) {
  const { data, loading, error, goToNextPage, goToPrevPage } = useNewsByTag({
    tagId,
    limit: 10
  });

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;
  if (!data) return <div>Новини не знайдено</div>;

  return (
    <div>
      <h2>Новини за тегом: {data.tag.tag}</h2>
      
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

### Компонент з фільтрацією за типом
```typescript
function FilteredTagNews({ tagId }: { tagId: number }) {
  const [selectedType, setSelectedType] = useState<string>('');
  
  const { data, setType, getNewsByType } = useNewsByTag({
    tagId,
    type: selectedType
  });

  const videoNews = getNewsByType(4); // Відео новини
  const photoNews = getNewsByType(3); // Фото новини

  return (
    <div>
      <select value={selectedType} onChange={(e) => {
        setSelectedType(e.target.value);
        setType(e.target.value);
      }}>
        <option value="">Всі типи</option>
        <option value="news">Новини</option>
        <option value="video">Відео</option>
        <option value="photo">Фото</option>
      </select>
      
      <div>
        <h3>Відео новини: {videoNews.length}</h3>
        <h3>Фото новини: {photoNews.length}</h3>
      </div>
      
      {data?.news.map(news => (
        <div key={news.id}>{news.nheader}</div>
      ))}
    </div>
  );
}
```

### Динамічна зміна тегів
```typescript
function DynamicTagNews() {
  const [currentTagId, setCurrentTagId] = useState(1844);
  
  const { data, setTagId, getTagInfo, getTotalNews } = useNewsByTag({
    tagId: currentTagId
  });

  const switchTag = (newTagId: number) => {
    setCurrentTagId(newTagId);
    setTagId(newTagId);
  };

  return (
    <div>
      <div>
        <button onClick={() => switchTag(1844)}>Кабмін</button>
        <button onClick={() => switchTag(1906)}>Житло</button>
        <button onClick={() => switchTag(2434)}>Фінанси</button>
      </div>
      
      {data && (
        <div>
          <h2>{getTagInfo()?.tag}</h2>
          <p>Всього новин: {getTotalNews()}</p>
          {data.news.map(news => (
            <div key={news.id}>{news.nheader}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔧 API Endpoint

Хук використовує API endpoint:
- **URL**: `/api/news/by-tag/[tagId]`
- **Метод**: GET
- **Параметри запиту**:
  - `page` - номер сторінки
  - `limit` - кількість елементів
  - `lang` - мова
  - `approved` - статус модерації
  - `type` - тип новин

**Приклади запитів:**
```
/api/news/by-tag/1844?page=1&limit=10
/api/news/by-tag/1906?type=video&limit=5
```

## 📝 Тестові теги

Для тестування доступні наступні теги:
- **1844** - Кабмін
- **1906** - житло
- **2434** - фінанси
- **7277** - Міністерство розвитку громад

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
- Інтегрований з системою зображень проекту

## 🔗 Пов'язані хуки

- `useNewsByRubric` - новини за рубрикою
- `useNewsByRegion` - новини за регіоном  
- `useSpecialThemesNews` - новини за спеціальними темами
- `useLatestNews` - останні новини
- `useImportantNews` - важливі новини
