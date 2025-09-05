# Хук useNewsByRegion - Отримання новин по регіону

## Опис

Хук `useNewsByRegion` дозволяє отримувати новини, відфільтровані по регіону. Він надає зручний інтерфейс для роботи з API endpoint `/api/news/region/[region]`.

## API Endpoint

**URL:** `/api/news/region/[region]`

**Метод:** GET

**Параметри:**
- `region` (string) - ID регіону або параметр регіону
- `page` (number, optional) - Номер сторінки (за замовчуванням: 1)
- `limit` (number, optional) - Кількість новин на сторінці (за замовчуванням: 20)
- `type` (string, optional) - Тип новини (news, articles, photo, video, audio, announces, blogs, mainmedia)
- `lang` (string, optional) - Мова (за замовчуванням: '1')
- `approved` (boolean, optional) - Тільки схвалені новини (за замовчуванням: true)

## Використання

### Базове використання

```tsx
import { useNewsByRegion } from '@/app/hooks';

function RegionNewsPage({ regionId }: { regionId: string }) {
  const {
    data,
    loading,
    error,
    refetch,
    setPage,
    setLimit,
    setType
  } = useNewsByRegion({
    region: regionId,
    page: 1,
    limit: 20,
    autoFetch: true
  });

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;
  if (!data) return <div>Немає даних</div>;

  return (
    <div>
      <h1>Новини регіону: {data.regionInfo?.name}</h1>
      
      {data.news.map(news => (
        <div key={news.id}>
          <h2>{news.nheader}</h2>
          <p>{news.nteaser}</p>
          <span>Дата: {news.ndate}</span>
          <span>Перегляди: {news.views_count}</span>
        </div>
      ))}
      
      {/* Пагінація */}
      <div>
        <button 
          onClick={() => setPage(data.pagination.page - 1)}
          disabled={!data.pagination.hasPrev}
        >
          Попередня
        </button>
        <span>Сторінка {data.pagination.page} з {data.pagination.totalPages}</span>
        <button 
          onClick={() => setPage(data.pagination.page + 1)}
          disabled={!data.pagination.hasNext}
        >
          Наступна
        </button>
      </div>
    </div>
  );
}
```

### Розширене використання з фільтрами

```tsx
import { useNewsByRegion } from '@/app/hooks';
import { useState } from 'react';

function AdvancedRegionNews() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  const {
    data,
    loading,
    error,
    setType,
    setLimit,
    refetch
  } = useNewsByRegion({
    region: 'kyiv', // ID або параметр регіону
    page: 1,
    limit: itemsPerPage,
    type: selectedType || undefined,
    lang: '1',
    approved: true,
    autoFetch: true
  });

  const handleTypeChange = (newType: string) => {
    setSelectedType(newType);
    setType(newType);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setLimit(newLimit);
  };

  return (
    <div>
      {/* Фільтри */}
      <div className="filters">
        <select 
          value={selectedType} 
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="">Всі типи</option>
          <option value="news">Новини</option>
          <option value="articles">Статті</option>
          <option value="photo">Фоторепортажі</option>
          <option value="video">Відео</option>
        </select>

        <select 
          value={itemsPerPage} 
          onChange={(e) => handleLimitChange(Number(e.target.value))}
        >
          <option value={10}>10 на сторінці</option>
          <option value={20}>20 на сторінці</option>
          <option value={50}>50 на сторінці</option>
        </select>

        <button onClick={refetch}>Оновити</button>
      </div>

      {/* Список новин */}
      {loading && <div>Завантаження...</div>}
      {error && <div>Помилка: {error}</div>}
      
      {data && (
        <div>
          <h2>Новини регіону: {data.regionInfo?.name}</h2>
          <p>Всього новин: {data.pagination.total}</p>
          
          {data.news.map(news => (
            <article key={news.id} className="news-item">
              <h3>{news.nheader}</h3>
              {news.nsubheader && <h4>{news.nsubheader}</h4>}
              <p>{news.nteaser}</p>
              <div className="news-meta">
                <span>Дата: {news.ndate}</span>
                <span>Час: {news.ntime}</span>
                <span>Перегляди: {news.views_count}</span>
                <span>Коментарі: {news.comments_count}</span>
                <span>Регіон: {news.region_name}</span>
              </div>
              {news.images && news.images.length > 0 && (
                <div className="news-images">
                  {news.images.map((img, index) => (
                    <img key={index} src={img.url} alt={img.alt} />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Використання без автоматичного завантаження

```tsx
import { useNewsByRegion } from '@/app/hooks';
import { useEffect } from 'react';

function ManualRegionNews() {
  const {
    data,
    loading,
    error,
    refetch
  } = useNewsByRegion({
    region: 'lviv',
    autoFetch: false // Відключаємо автоматичне завантаження
  });

  // Завантажуємо дані при монтуванні компонента
  useEffect(() => {
    refetch();
  }, []);

  return (
    <div>
      <button onClick={refetch} disabled={loading}>
        {loading ? 'Завантаження...' : 'Завантажити новини'}
      </button>
      
      {data && (
        <div>
          <h2>Новини Львова</h2>
          {data.news.map(news => (
            <div key={news.id}>
              <h3>{news.nheader}</h3>
              <p>{news.nteaser}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Типи даних

### NewsByRegionItem

```typescript
interface NewsByRegionItem {
  id: number;
  ndate: string;
  ntime: string;
  ntype: number;
  images: any[];
  urlkey: string;
  photo: number;
  video: number;
  comments: number;
  printsubheader: number;
  rubric: string;
  region: string;
  nweight: number;
  nheader: string;
  nsubheader: string;
  nteaser: string;
  comments_count: number;
  views_count: number;
  region_name: string;
  region_description: string;
}
```

### NewsByRegionResponse

```typescript
interface NewsByRegionResponse {
  news: NewsByRegionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    region: string;
    type?: string;
    lang: string;
    approved: boolean;
  };
  regionInfo: {
    id: string;
    name: string;
    description: string;
  } | null;
}
```

### UseNewsByRegionOptions

```typescript
interface UseNewsByRegionOptions {
  region: string;           // Обов'язковий параметр регіону
  page?: number;            // Номер сторінки (за замовчуванням: 1)
  limit?: number;           // Кількість новин на сторінці (за замовчуванням: 20)
  type?: string;            // Тип новини
  lang?: string;            // Мова (за замовчуванням: '1')
  approved?: boolean;       // Тільки схвалені новини (за замовчуванням: true)
  autoFetch?: boolean;      // Автоматичне завантаження (за замовчуванням: true)
}
```

### UseNewsByRegionReturn

```typescript
interface UseNewsByRegionReturn {
  data: NewsByRegionResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setType: (type: string) => void;
  setLang: (lang: string) => void;
  setApproved: (approved: boolean) => void;
}
```

## Особливості

1. **Автоматичне завантаження**: За замовчуванням хук автоматично завантажує дані при зміні параметрів
2. **Пагінація**: Підтримує пагінацію з можливістю зміни сторінки та кількості елементів
3. **Фільтрація**: Підтримує фільтрацію по типу новини, мові та статусу схвалення
4. **Кешування**: Дані зберігаються в стані хука до наступного запиту
5. **Обробка помилок**: Надає інформацію про помилки завантаження
6. **Інформація про регіон**: Повертає додаткову інформацію про регіон (назва, опис)

## Примітки

- Регіон передається як параметр URL, тому він повинен бути валідним ідентифікатором
- Хук автоматично скидає сторінку на 1 при зміні фільтрів
- Зображення новин обробляються та форматуются автоматично
- Підтримує всі типи статей, визначені в системі
