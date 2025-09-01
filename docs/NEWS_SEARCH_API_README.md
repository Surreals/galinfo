# API для пошуку новин

Цей документ описує API endpoint для пошуку новин за текстовим запитом.

## API Endpoint

### Пошук новин

**URL:** `GET /api/news/search`

**Параметри:**
- `q` (обов'язково) - пошуковий запит
- `page` (опціонально) - номер сторінки (за замовчуванням: 1)
- `limit` (опціонально) - кількість результатів на сторінку (за замовчуванням: 20)
- `lang` (опціонально) - мова (за замовчуванням: 1)
- `type` (опціонально) - тип новини (1-новина, 2-стаття, тощо)
- `rubric` (опціонально) - ID рубрики
- `approved` (опціонально) - тільки схвалені новини (за замовчуванням: true)

## Приклади використання

### Базовий пошук

```bash
# Пошук новин за словом "Україна"
GET /api/news/search?q=Україна

# Пошук з обмеженням кількості результатів
GET /api/news/search?q=Україна&limit=10

# Пошук на конкретній сторінці
GET /api/news/search?q=Україна&page=2&limit=20
```

### Пошук з фільтрами

```bash
# Пошук тільки новин (тип = 1)
GET /api/news/search?q=Україна&type=1

# Пошук в конкретній рубриці
GET /api/news/search?q=Україна&rubric=2

# Пошук українською мовою
GET /api/news/search?q=Україна&lang=1

# Пошук включаючи не схвалені новини
GET /api/news/search?q=Україна&approved=false
```

### Комплексний пошук

```bash
# Пошук важливих новин про Україну в рубриці 2
GET /api/news/search?q=Україна&type=1&rubric=2&lang=1&limit=15
```

## Відповідь API

### Успішна відповідь

```json
{
  "searchResults": [
    {
      "id": 12345,
      "ndate": "2024-01-15",
      "ntime": "14:30:00",
      "ntype": 1,
      "images": [...],
      "urlkey": "ukraine-news-title",
      "photo": 1,
      "video": 0,
      "comments": 25,
      "printsubheader": 0,
      "rubric": "1,2",
      "nweight": 2,
      "nheader": "Важлива новина про Україну",
      "nsubheader": "Підзаголовок новини",
      "nteaser": "Короткий опис новини про Україну...",
      "comments_count": 25,
      "views_count": 1500,
      "relevance_score": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "search": {
    "query": "Україна",
    "totalResults": 45
  },
  "filters": {
    "lang": "1",
    "type": "1",
    "rubric": "2",
    "approved": true
  }
}
```

### Помилка

```json
{
  "error": "Search query is required"
}
```

## Алгоритм пошуку

### Релевантність результатів

Результати сортуються за релевантністю:

1. **Релевантність 3** - пошуковий запит знайдено в заголовку (`nheader`)
2. **Релевантність 2** - пошуковий запит знайдено в підзаголовку (`nsubheader`)
3. **Релевантність 1** - пошуковий запит знайдено в тезі (`nteaser`)
4. **Релевантність 0** - пошуковий запит не знайдено

### Область пошуку

Пошук виконується в наступних полях:
- `a_news_headers.nheader` - заголовок новини
- `a_news_headers.nsubheader` - підзаголовок новини
- `a_news_headers.nteaser` - короткий опис новини

### Фільтрація

За замовчуванням повертаються тільки:
- Опубліковані новини (`udate < UNIX_TIMESTAMP()`)
- Схвалені новини (`approved = 1`)
- Новині на вказаній мові (`lang`)

## Типи новин

- **1** - Новина
- **2** - Стаття
- **3** - Фоторепортаж
- **4** - Відео
- **5** - Аудіо
- **6** - Анонс
- **20** - Блог
- **21** - Основні медіа

## Сервісні функції

### Використання в коді

```typescript
import { searchNews, getPopularSearchTerms, logSearchQuery } from '@/app/api/homepage/services/searchNewsService';

// Пошук новин
const searchResult = await searchNews({
  query: 'Україна',
  page: 1,
  limit: 20,
  lang: '1',
  type: '1',
  rubric: '2'
});

// Отримання популярних пошукових запитів
const popularTerms = await getPopularSearchTerms(10, '1');

// Логування пошукового запиту
await logSearchQuery('Україна', '1');
```

### Інтеграція в компоненти

```typescript
// React компонент для пошуку новин
const NewsSearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/news/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.searchResults);
    } catch (error) {
      console.error('Error searching news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-search">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Пошук новин..."
        onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
      />
      <button onClick={() => handleSearch(searchQuery)}>
        Пошук
      </button>
      
      {loading && <div>Пошук...</div>}
      
      <div className="search-results">
        {searchResults.map(news => (
          <div key={news.id} className="news-item">
            <h3>{news.nheader}</h3>
            <p>{news.nteaser}</p>
            <span className="relevance-score">
              Релевантність: {news.relevance_score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Обробка помилок

### Коди помилок

- `400` - Відсутній пошуковий запит або невірні параметри
- `500` - Внутрішня помилка сервера

### Приклади помилок

```json
{
  "error": "Search query is required"
}
```

```json
{
  "error": "Failed to search news"
}
```

## Пагінація

API підтримує пагінацію з наступними параметрами:

- `page` - номер сторінки (починається з 1)
- `limit` - кількість результатів на сторінку
- `total` - загальна кількість результатів
- `totalPages` - загальна кількість сторінок
- `hasNext` - чи є наступна сторінка
- `hasPrev` - чи є попередня сторінка

## Оптимізація

### Індекси для пошуку

Для ефективного пошуку рекомендується створити індекси:

```sql
-- Індекс для пошуку в заголовках
CREATE INDEX idx_news_headers_search ON a_news_headers(nheader, nsubheader, nteaser);

-- Індекс для фільтрації
CREATE INDEX idx_news_filters ON a_news(approved, lang, udate, ntype);
```

### Кешування

Для часто використовуваних пошукових запитів рекомендується використовувати кешування:

```typescript
import { cache } from 'react';

export const searchNewsCached = cache(async (params: SearchNewsParams) => {
  return await searchNews(params);
});
```

## Аналітика пошуку

API включає функції для збору аналітики пошуку:

- Логування пошукових запитів
- Отримання популярних пошукових термінів
- Статистика пошуку

Це дозволяє аналізувати поведінку користувачів та покращувати алгоритм пошуку.
