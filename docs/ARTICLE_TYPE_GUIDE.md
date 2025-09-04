# Керівництво по типам статей (articleType)

## Опис

`articleType` - це параметр, який визначає тип контенту в системі. Він використовується для формування URL та визначення логіки відображення.

## Мапінг типів статей

Згідно з PHP кодом (`deprecated_php_app/lib/etc/conf.php`), існує наступний мапінг:

```php
$depot['article_types'] = array(
    1 => "news",        // Новини
    2 => "articles",    // Статті  
    3 => "photo",       // Фоторепортажі
    4 => "video",       // Відео
    6 => "announces",   // Анонси
    7 => "pressrelease", // Пресс-релізи
    8 => "events",      // Події
    20 => "blogs",      // Блоги
    21 => "mainmedia"   // Основні медіа
);
```

## Як отримати articleType

### 1. З URL новини

URL новини має формат: `/{articleType}/{urlkey}_{id}`

**Приклади URL:**
- `/news/test-article_12345` → `articleType = "news"`
- `/articles/important-story_67890` → `articleType = "articles"`
- `/photo/photo-report_11111` → `articleType = "photo"`
- `/video/video-news_22222` → `articleType = "video"`
- `/blogs/blog-post_33333` → `articleType = "blogs"`

### 2. З бази даних

В таблиці `a_news` поле `ntype` містить числовий ідентифікатор типу:

```sql
SELECT ntype FROM a_news WHERE id = ?;
```

Потім конвертуйте число в рядок:
```javascript
const articleTypes = {
  1: 'news',
  2: 'articles', 
  3: 'photo',
  4: 'video',
  6: 'announces',
  7: 'pressrelease',
  8: 'events',
  20: 'blogs',
  21: 'mainmedia'
};

const articleType = articleTypes[ntype];
```

### 3. З існуючої новини

Якщо у вас вже є об'єкт новини з полем `ntype`:

```javascript
function getArticleType(ntype) {
  const typeMap = {
    1: 'news',
    2: 'articles',
    3: 'photo', 
    4: 'video',
    6: 'announces',
    7: 'pressrelease',
    8: 'events',
    20: 'blogs',
    21: 'mainmedia'
  };
  
  return typeMap[ntype] || 'news'; // fallback до 'news'
}
```

## Використання в API

### API endpoint для повних даних новини

```
GET /api/news/complete/{articleType}/{urlkey}_{id}
```

**Приклади:**
```
GET /api/news/complete/news/test-article_12345
GET /api/news/complete/articles/important-story_67890
GET /api/news/complete/photo/photo-report_11111
GET /api/news/complete/video/video-news_22222
GET /api/news/complete/blogs/blog-post_33333
```

### Використання в хуку

```typescript
import { useCompleteNewsData } from '@/app/hooks/useCompleteNewsData';

// Приклад 1: З URL параметрів
function NewsPage({ params }) {
  const { data } = useCompleteNewsData({
    articleType: params.type, // 'news', 'articles', 'photo', etc.
    urlkey: params.urlkey,
    id: params.id,
    lang: '1'
  });
}

// Приклад 2: З бази даних
function NewsComponent({ newsItem }) {
  const articleType = getArticleType(newsItem.ntype);
  
  const { data } = useCompleteNewsData({
    articleType,
    urlkey: newsItem.urlkey,
    id: newsItem.id,
    lang: '1'
  });
}
```

## Спеціалізовані хуки

Для зручності створені спеціалізовані хуки:

```typescript
import { 
  useNewsData,        // для ntype = 1
  useArticleData,     // для ntype = 2  
  usePhotoNewsData,   // для ntype = 3
  useVideoNewsData,   // для ntype = 4
  useBlogPostData     // для ntype = 20
} from '@/app/hooks/useCompleteNewsData';

// Використання
const newsData = useNewsData({
  urlkey: 'test-article',
  id: 12345,
  lang: '1'
});
```

## Формування URL

Для формування URL новини використовуйте:

```javascript
function buildNewsUrl(articleType, urlkey, id) {
  return `/${articleType}/${urlkey}_${id}`;
}

// Приклади
buildNewsUrl('news', 'test-article', 12345);     // '/news/test-article_12345'
buildNewsUrl('articles', 'story', 67890);        // '/articles/story_67890'
buildNewsUrl('photo', 'report', 11111);          // '/photo/report_11111'
```

## Валідація

Перевірте, чи є `articleType` валідним:

```javascript
const validArticleTypes = [
  'news', 'articles', 'photo', 'video', 
  'announces', 'pressrelease', 'events', 
  'blogs', 'mainmedia'
];

function isValidArticleType(type) {
  return validArticleTypes.includes(type);
}
```

## Приклади використання

### 1. Сторінка новини

```typescript
// app/news/[type]/[urlkey]/[id]/page.tsx
export default function NewsPage({ params }) {
  const { data, loading, error } = useCompleteNewsData({
    articleType: params.type,  // 'news', 'articles', etc.
    urlkey: params.urlkey,
    id: parseInt(params.id),
    lang: '1'
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!data) return <NotFound />;

  return (
    <article>
      <h1>{data.article.nheader}</h1>
      {/* інший контент */}
    </article>
  );
}
```

### 2. Компонент списку новин

```typescript
function NewsList({ newsItems }) {
  return (
    <div>
      {newsItems.map(news => {
        const articleType = getArticleType(news.ntype);
        const url = buildNewsUrl(articleType, news.urlkey, news.id);
        
        return (
          <Link key={news.id} href={url}>
            <h3>{news.nheader}</h3>
          </Link>
        );
      })}
    </div>
  );
}
```

### 3. Тестова сторінка

```typescript
// app/admin/test-complete-news/page.tsx
function TestPage() {
  const [articleType, setArticleType] = useState('news');
  const [urlkey, setUrlkey] = useState('');
  const [id, setId] = useState('');

  const { data } = useCompleteNewsData({
    articleType,
    urlkey,
    id: parseInt(id),
    lang: '1'
  });

  return (
    <div>
      <select value={articleType} onChange={(e) => setArticleType(e.target.value)}>
        <option value="news">Новини</option>
        <option value="articles">Статті</option>
        <option value="photo">Фоторепортажі</option>
        <option value="video">Відео</option>
        <option value="blogs">Блоги</option>
      </select>
      {/* інші поля */}
    </div>
  );
}
```

## Висновок

`articleType` - це ключовий параметр для роботи з новинами. Він визначається з URL або з поля `ntype` в базі даних і використовується для:

- Формування URL новин
- Визначення API endpoint
- Вибору відповідного хука
- Логіки відображення

Завжди перевіряйте валідність `articleType` перед використанням.
