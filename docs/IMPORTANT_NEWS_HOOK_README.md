# Hook для важливих новин

Цей документ описує React hook `useImportantNews` та пов'язані з ним компоненти для роботи з важливими новинами.

## Hook `useImportantNews`

### Основні функції

```typescript
import { useImportantNews } from '@/app/hooks/useImportantNews';

const {
  importantNews,
  loading,
  error,
  total,
  refetch,
  fetchByLevel,
  fetchTopNews
} = useImportantNews({
  limit: 5,
  lang: '1',
  autoFetch: true
});
```

### Параметри

- `limit` (опціонально) - кількість новин (за замовчуванням: 5)
- `lang` (опціонально) - мова (за замовчуванням: '1')
- `autoFetch` (опціонально) - автоматичне завантаження (за замовчуванням: true)

### Повертає

- `importantNews` - масив важливих новин
- `loading` - стан завантаження
- `error` - помилка (якщо є)
- `total` - загальна кількість новин
- `refetch` - функція для повторного завантаження
- `fetchByLevel` - функція для завантаження новин за рівнем важливості
- `fetchTopNews` - функція для завантаження топ новин

## Спеціалізовані hooks

### `useTopImportantNews`

Hook для отримання топ важливих новин (nweight = 2):

```typescript
import { useTopImportantNews } from '@/app/hooks/useImportantNews';

const { importantNews, loading, error, total, refetch } = useTopImportantNews({
  limit: 5,
  lang: '1'
});
```

### `useHighImportantNews`

Hook для отримання важливих новин (nweight = 1):

```typescript
import { useHighImportantNews } from '@/app/hooks/useImportantNews';

const { importantNews, loading, error, total, refetch } = useHighImportantNews({
  limit: 5,
  lang: '1'
});
```

### `usePhotoNews`

Hook для отримання фотоновин (nweight = 3):

```typescript
import { usePhotoNews } from '@/app/hooks/useImportantNews';

const { importantNews, loading, error, total, refetch } = usePhotoNews({
  limit: 5,
  lang: '1'
});
```

### `useIllustratedNews`

Hook для отримання ілюструючих новин (nweight = 4):

```typescript
import { useIllustratedNews } from '@/app/hooks/useImportantNews';

const { importantNews, loading, error, total, refetch } = useIllustratedNews({
  limit: 5,
  lang: '1'
});
```

### `useImportantNewsByLevel`

Hook для отримання новин з конкретним рівнем важливості:

```typescript
import { useImportantNewsByLevel } from '@/app/hooks/useImportantNews';

const { importantNews, loading, error, total, refetch } = useImportantNewsByLevel(2, {
  limit: 5,
  lang: '1'
});
```

## Компонент `ImportantNews`

### Використання

```typescript
import { ImportantNews } from '@/app/components';

// Всі важливі новини
<ImportantNews 
  type="all" 
  limit={10} 
  title="Всі важливі новини"
/>

// ТОП важливі новини
<ImportantNews 
  type="top" 
  limit={5} 
  title="ТОП важливі новини"
/>

// Важливі новини (рівень 1)
<ImportantNews 
  type="high" 
  limit={5} 
  title="Важливі новини"
/>

// Кастомний рівень важливості
<ImportantNews 
  type="custom" 
  level={3}
  limit={5} 
  title="Фотоновини"
/>
```

### Параметри

- `type` - тип новин ('all', 'top', 'high', 'custom')
- `level` - рівень важливості (для type="custom")
- `limit` - кількість новин
- `lang` - мова
- `showTitle` - показувати заголовок
- `title` - кастомний заголовок
- `className` - додаткові CSS класи

## Приклади використання

### Базовий приклад

```typescript
import React from 'react';
import { useImportantNews } from '@/app/hooks/useImportantNews';

const ImportantNewsWidget = () => {
  const { importantNews, loading, error, refetch } = useImportantNews({
    limit: 5,
    lang: '1'
  });

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;

  return (
    <div>
      <h2>Важливі новини</h2>
      <button onClick={refetch}>Оновити</button>
      {importantNews.map(news => (
        <div key={news.id}>
          <h3>{news.nheader}</h3>
          <p>{news.nteaser}</p>
        </div>
      ))}
    </div>
  );
};
```

### Приклад з динамічною зміною рівня

```typescript
import React, { useState } from 'react';
import { useImportantNews } from '@/app/hooks/useImportantNews';

const DynamicImportantNews = () => {
  const [level, setLevel] = useState(1);
  const { importantNews, loading, fetchByLevel } = useImportantNews({
    limit: 5,
    autoFetch: false
  });

  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    fetchByLevel(newLevel);
  };

  return (
    <div>
      <div>
        <button onClick={() => handleLevelChange(1)}>Важливі</button>
        <button onClick={() => handleLevelChange(2)}>ТОП</button>
        <button onClick={() => handleLevelChange(3)}>Фотоновини</button>
      </div>
      
      {loading ? (
        <div>Завантаження...</div>
      ) : (
        <div>
          {importantNews.map(news => (
            <div key={news.id}>
              <h3>{news.nheader}</h3>
              <p>Рівень важливості: {news.nweight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Приклад з кількома секціями

```typescript
import React from 'react';
import { ImportantNews } from '@/app/components';

const NewsDashboard = () => {
  return (
    <div>
      <ImportantNews 
        type="top" 
        limit={3} 
        title="ТОП новини дня"
      />
      
      <ImportantNews 
        type="high" 
        limit={5} 
        title="Важливі події"
      />
      
      <ImportantNews 
        type="custom" 
        level={3}
        limit={4} 
        title="Фоторепортажі"
      />
    </div>
  );
};
```

## Типи даних

### ImportantNewsItem

```typescript
interface ImportantNewsItem {
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
  nweight: number;
  nheader: string;
  nsubheader: string;
  nteaser: string;
  comments_count: number;
  views_count: number;
}
```

### UseImportantNewsOptions

```typescript
interface UseImportantNewsOptions {
  limit?: number;
  lang?: string;
  autoFetch?: boolean;
}
```

## Особливості

### Автоматичне завантаження

За замовчуванням hook автоматично завантажує дані при монтуванні компонента. Це можна відключити:

```typescript
const { importantNews, loading, refetch } = useImportantNews({
  autoFetch: false
});

// Ручне завантаження
useEffect(() => {
  refetch();
}, []);
```

### Обробка помилок

Hook автоматично обробляє помилки та надає інформацію про них:

```typescript
const { error, refetch } = useImportantNews();

if (error) {
  return (
    <div>
      <p>Помилка: {error}</p>
      <button onClick={refetch}>Спробувати знову</button>
    </div>
  );
}
```

### Кешування

Hook не реалізує кешування за замовчуванням. Для кешування можна використовувати React Query або SWR:

```typescript
import { useQuery } from 'react-query';

const useImportantNewsWithCache = (options) => {
  return useQuery(
    ['important-news', options],
    () => fetchImportantNews(options),
    {
      staleTime: 5 * 60 * 1000, // 5 хвилин
      cacheTime: 10 * 60 * 1000 // 10 хвилин
    }
  );
};
```

## Інтеграція з існуючими компонентами

Hook можна легко інтегрувати з існуючими компонентами:

```typescript
// В homepage
const HomePage = () => {
  const { importantNews } = useTopImportantNews({ limit: 3 });
  
  return (
    <div>
      <Hero />
      <ImportantNewsSection news={importantNews} />
      <MainNews />
    </div>
  );
};
```

Hook для важливих новин надає зручний спосіб роботи з API важливих новин та інтегрується з компонентом `ImportantNews` для швидкого створення інтерфейсів.
