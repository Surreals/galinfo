# Використання isMobile для різних макетів

## Огляд

Реалізовано простий хук `useIsMobile`, який дозволяє визначати мобільну версію та показувати різний контент залежно від типу пристрою.

## Хук useIsMobile

```typescript
// app/hooks/useIsMobile.ts
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Перевіряємо ширину екрану
      const isMobileByWidth = window.innerWidth <= 768;
      setIsMobile(isMobileByWidth);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};
```

## Використання на сторінках

### 1. HomePage

```tsx
import { useIsMobile } from "@/app/hooks/useIsMobile";

export default function HomePage() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      <Hero />
      
      {isMobile ? (
        // Мобільна версія - менше новин, вертикальне розташування
        <>
          <ColumnNews newsQuantity={3} />
          <CategoryNews />
          <ColumnNews newsQuantity={3} />
        </>
      ) : (
        // Десктопна версія - більше новин, горизонтальне розташування
        <>
          <ColumnNews newsQuantity={4} />
          <CategoryNews />
          <ColumnNews newsQuantity={5} />
        </>
      )}
    </div>
  );
}
```

### 2. CategoryPage

```tsx
// Серверний компонент
export default async function CategoryPage({ params }) {
  const { category } = await params;
  const newsData = generateRandomNews(8);
  
  return (
    <CategoryPageClient 
      category={category}
      newsData={newsData}
    />
  );
}

// Клієнтський компонент
export const CategoryPageClient = ({ category, newsData }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={styles.container}>
      {isMobile ? (
        // Мобільна версія
        <div className={styles.mobileLayout}>
          <Breadcrumbs />
          <CategoryTitle />
          <MainNews />
          <CategoryNews />
        </div>
      ) : (
        // Десктопна версія
        <div className={styles.desktopLayout}>
          <div className={styles.mainContent}>
            <Breadcrumbs />
            <CategoryTitle />
            <MainNews />
            <CategoryNews />
          </div>
          <div className={styles.sidebar}>
            <NewsList />
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. ArticlePage

```tsx
// Серверний компонент
export default async function ArticlePage({ params }) {
  const { id } = await params;
  const articleData = getArticleData(id);
  
  return (
    <ArticlePageClient 
      articleData={articleData}
      newsData={generateRandomNews(8)}
    />
  );
}

// Клієнтський компонент
export const ArticlePageClient = ({ articleData, newsData }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={styles.container}>
      {isMobile ? (
        // Мобільна версія - вертикальне розташування
        <div className={styles.mobileLayout}>
          <Breadcrumbs />
          <article>
            <h1>{articleData.title}</h1>
            <img src={articleData.imageUrl} alt={articleData.imageAlt} />
            <div>{articleData.content}</div>
          </article>
          <RelatedNews />
        </div>
      ) : (
        // Десктопна версія - двоколонковий макет
        <div className={styles.desktopLayout}>
          <div className={styles.mainContent}>
            <Breadcrumbs />
            <article>
              <h1>{articleData.title}</h1>
              <img src={articleData.imageUrl} alt={articleData.imageAlt} />
              <div>{articleData.content}</div>
            </article>
          </div>
          <div className={styles.sidebar}>
            <RelatedNews />
            <AdBanner />
          </div>
        </div>
      )}
    </div>
  );
};
```

## Переваги підходу

1. **Простота**: Простий хук без складних контейнерів
2. **Гнучкість**: Можна легко змінювати контент та порядок елементів
3. **Продуктивність**: Мінімальне навантаження на браузер
4. **Зрозумілість**: Чітна логіка з тернарним оператором
5. **Масштабованість**: Легко додавати нові умови та макети

## Breakpoint

- **Мобільна версія**: ≤ 768px
- **Десктопна версія**: > 768px

## Приклади різного контенту

### Кількість елементів
```tsx
{isMobile ? (
  <ColumnNews newsQuantity={3} /> // Менше новин для мобільної версії
) : (
  <ColumnNews newsQuantity={5} /> // Більше новин для десктопу
)}
```

### Розташування
```tsx
{isMobile ? (
  <div className={styles.verticalLayout}>
    <Component1 />
    <Component2 />
    <Component3 />
  </div>
) : (
  <div className={styles.horizontalLayout}>
    <div className={styles.leftColumn}>
      <Component1 />
      <Component2 />
    </div>
    <div className={styles.rightColumn}>
      <Component3 />
    </div>
  </div>
)}
```

### Показ/приховування елементів
```tsx
{isMobile && <MobileOnlyComponent />}
{!isMobile && <DesktopOnlyComponent />}
```

## Висновок

Хук `useIsMobile` надає простий та ефективний спосіб створення різних макетів для мобільної та десктопної версій. Ви можете легко змінювати контент, порядок елементів та стилі залежно від типу пристрою.
