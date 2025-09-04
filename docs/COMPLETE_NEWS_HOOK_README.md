# Complete News Data Hook

## Опис

`useCompleteNewsData` - це розширений хук для отримання повної інформації про новину, включаючи всі пов'язані дані, мета-інформацію, статистику та навігацію. Хук базується на аналізі PHP коду з `deprecated_php_app` та надає всю необхідну інформацію для відображення сторінки новини.

## Основні можливості

- ✅ Отримання повної інформації про новину
- ✅ Зображення з різними розмірами
- ✅ Рубрики та теги
- ✅ Інформація про автора
- ✅ Пов'язані новини
- ✅ Статистика (коментарі, перегляди, рейтинг)
- ✅ Мета-дані для SEO
- ✅ Breadcrumbs навігація
- ✅ Визначення макету відображення
- ✅ Характеристики новини (важлива, фото, відео, блог)

## Використання

### Базове використання

```typescript
import { useCompleteNewsData } from '@/app/hooks/useCompleteNewsData';

function NewsPage({ articleType, urlkey, id }) {
  const {
    data,
    loading,
    error,
    refetch,
    hasImages,
    hasRubrics,
    hasTags,
    hasRelatedNews,
    hasAuthor,
    isImportant,
    isPhotoNews,
    isVideoNews,
    isBlogPost
  } = useCompleteNewsData({
    articleType: 'news',
    urlkey: 'test-article',
    id: 12345,
    lang: '1',
    autoFetch: true,
    includeRelated: true,
    includeAuthor: true,
    includeStatistics: true
  });

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;
  if (!data) return <div>Новина не знайдена</div>;

  return (
    <div>
      <h1>{data.article.nheader}</h1>
      <p>{data.article.nteaser}</p>
      {/* Інший контент */}
    </div>
  );
}
```

### Спеціалізовані хуки

```typescript
import { 
  usePhotoNewsData, 
  useVideoNewsData, 
  useBlogPostData, 
  useArticleData, 
  useNewsData 
} from '@/app/hooks/useCompleteNewsData';

// Для фоторепортажів
const photoNews = usePhotoNewsData({
  urlkey: 'photo-report',
  id: 12345,
  lang: '1'
});

// Для відео
const videoNews = useVideoNewsData({
  urlkey: 'video-news',
  id: 12346,
  lang: '1'
});

// Для блогів
const blogPost = useBlogPostData({
  urlkey: 'blog-post',
  id: 12347,
  lang: '1'
});
```

## API Endpoint

Хук використовує API endpoint: `/api/news/complete/[articleType]/[urlkey]_[id]`

### Параметри запиту

- `lang` - мова (1 - українська, 2 - англійська, 3 - російська)
- `includeRelated` - включити пов'язані новини (за замовчуванням true)
- `includeAuthor` - включити інформацію про автора (за замовчуванням true)
- `includeStatistics` - включити статистику (за замовчуванням true)

### Приклад запиту

```
GET /api/news/complete/news/test-article_12345?lang=1&includeRelated=true&includeAuthor=true&includeStatistics=true
```

## Структура даних

### CompleteNewsResponse

```typescript
interface CompleteNewsResponse {
  article: CompleteNewsArticle;
  meta: {
    type: string;
    urlkey: string;
    id: number;
    printUrl?: string;
    editUrl?: string;
  };
  layout: {
    pattern: string;
    imageClass: string;
    imagePath: string;
  };
}
```

### CompleteNewsArticle

```typescript
interface CompleteNewsArticle {
  // Основна інформація
  id: number;
  ndate: string;
  ntime: string;
  ntype: number;
  urlkey: string;
  lang: string;
  approved: number;
  udate: number;
  
  // Контент
  nheader: string;
  nsubheader: string;
  nteaser: string;
  nbody: string;
  
  // Мета інформація
  ntitle: string;
  ndescription: string;
  nkeywords: string;
  
  // Медіа
  images: string;
  photo: number;
  video: number;
  
  // Класифікація
  rubric: string;
  nweight: number;
  layout: number;
  
  // Автор
  userid: number;
  showauthor: number;
  
  // Статистика
  comments: number;
  printsubheader: number;
  rated: number;
  
  // Розширені дані
  images_data: NewsImage[];
  rubrics: NewsRubric[];
  tags: NewsTag[];
  relatedNews: RelatedNews[];
  author: NewsAuthor | null;
  statistics: NewsStatistics;
  meta: NewsMeta;
  breadcrumbs: NewsBreadcrumb[];
  
  // Додаткові поля
  region?: string;
  region_description?: string;
  bytheme?: string;
  comments_count: number;
  views_count: number;
  author_name: string;
}
```

## Допоміжні методи

### Отримання елементів за індексом

```typescript
const { getImageByIndex, getRubricByIndex, getTagByIndex, getRelatedNewsByIndex } = useCompleteNewsData(options);

// Отримати перше зображення
const firstImage = getImageByIndex(0);

// Отримати першу рубрику
const firstRubric = getRubricByIndex(0);

// Отримати перший тег
const firstTag = getTagByIndex(0);

// Отримати першу пов'язану новину
const firstRelated = getRelatedNewsByIndex(0);
```

### Перевірка наявності даних

```typescript
const {
  hasImages,
  hasRubrics,
  hasTags,
  hasRelatedNews,
  hasAuthor,
  isImportant,
  isPhotoNews,
  isVideoNews,
  isBlogPost
} = useCompleteNewsData(options);

// Використання
if (hasImages) {
  // Відобразити зображення
}

if (isImportant) {
  // Додати спеціальне оформлення для важливих новин
}

if (isPhotoNews) {
  // Використати спеціальний макет для фоторепортажів
}
```

## Типи новин

```typescript
const ARTICLE_TYPES = {
  news: 1,        // Новина
  articles: 2,    // Стаття
  photo: 3,       // Фоторепортаж
  video: 4,       // Відео
  audio: 5,       // Аудіо
  announces: 6,   // Анонс
  blogs: 20,      // Блог
  mainmedia: 21   // Основні медіа
};
```

## Макети відображення

```typescript
const LAYOUT_PATTERNS = {
  '1': { pattern: 'readSimple', imageClass: 'nimages', imagePath: 'intxt' },
  '2': { pattern: 'readSlider', imageClass: 'phimages', imagePath: 'full' },
  '3': { pattern: 'readInlineImages', imageClass: 'phimages', imagePath: 'intxt' },
  '4': { pattern: 'readReport', imageClass: 'phimages', imagePath: 'intxt' },
  '10': { pattern: 'readSimple', imageClass: 'nimages', imagePath: 'intxt' }
};
```

## Тестова сторінка

Для тестування хука створена адміністративна сторінка: `/admin/test-complete-news`

Сторінка дозволяє:
- Ввести параметри для завантаження новини
- Налаштувати опції включення даних
- Переглянути всі отримані дані
- Протестувати різні типи новин

## Порівняння з існуючими хуками

| Хук | Призначення | Дані |
|-----|-------------|------|
| `useSingleNews` | Базова інформація новини | Основні поля + зображення, рубрики, теги, пов'язані |
| `useCompleteNewsData` | Повна інформація новини | Все з `useSingleNews` + автор, статистика, мета, breadcrumbs, макет |

## Міграція з useSingleNews

```typescript
// Старий код
const { data } = useSingleNews({
  articleType: 'news',
  urlkey: 'test',
  id: 123
});

// Новий код
const { data } = useCompleteNewsData({
  articleType: 'news',
  urlkey: 'test',
  id: 123
});

// Додаткові можливості
const { hasAuthor, isImportant, getImageByIndex } = useCompleteNewsData({
  articleType: 'news',
  urlkey: 'test',
  id: 123
});
```

## Обробка помилок

```typescript
const { data, loading, error, refetch } = useCompleteNewsData(options);

if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return (
    <div>
      <p>Помилка: {error}</p>
      <button onClick={refetch}>Спробувати знову</button>
    </div>
  );
}

if (!data) {
  return <NotFound />;
}
```

## Оптимізація

- Хук автоматично кешує результати
- Підтримує умовне завантаження (`autoFetch: false`)
- Дозволяє вимкнути необов'язкові дані для оптимізації
- Оновлює статистику переглядів автоматично

## Приклади використання

### Сторінка новини

```typescript
function NewsPage({ params }) {
  const { data, loading, error } = useCompleteNewsData({
    articleType: params.type,
    urlkey: params.urlkey,
    id: params.id,
    lang: '1'
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!data) return <NotFound />;

  return (
    <article>
      <header>
        <Breadcrumbs items={data.article.breadcrumbs} />
        <h1>{data.article.nheader}</h1>
        <NewsMeta 
          date={data.article.ndate}
          time={data.article.ntime}
          author={data.article.author}
          statistics={data.article.statistics}
        />
      </header>
      
      {data.article.nsubheader && (
        <h2>{data.article.nsubheader}</h2>
      )}
      
      <p className="teaser">{data.article.nteaser}</p>
      
      {hasImages && (
        <NewsImages 
          images={data.article.images_data}
          layout={data.layout}
        />
      )}
      
      <div 
        className="body"
        dangerouslySetInnerHTML={{ __html: data.article.nbody }}
      />
      
      {hasTags && (
        <NewsTags tags={data.article.tags} />
      )}
      
      {hasRelatedNews && (
        <RelatedNews news={data.article.relatedNews} />
      )}
    </article>
  );
}
```

### Компонент зображень

```typescript
function NewsImages({ images, layout }) {
  const { pattern, imageClass, imagePath } = layout;
  
  if (pattern === 'readSlider') {
    return <ImageSlider images={images} className={imageClass} />;
  }
  
  if (pattern === 'readInlineImages') {
    return <InlineImages images={images} className={imageClass} />;
  }
  
  return <SimpleImages images={images} className={imageClass} path={imagePath} />;
}
```

## Висновок

`useCompleteNewsData` надає повний набір даних для відображення новин, включаючи всі необхідні мета-дані, навігацію та характеристики. Хук оптимізований для продуктивності та гнучкості використання.
