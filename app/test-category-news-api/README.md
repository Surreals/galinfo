# Тестування CategoryNews з реальними даними API

Ця сторінка демонструє роботу компонента `CategoryNews` з реальними даними через хук `useNewsByRubric`.

## Що було реалізовано

### 1. Оновлений компонент `CategoryNews`
- Інтеграція з хуком `useNewsByRubric`
- Підтримка реальних даних з API
- Fallback на мокові дані при відсутності API даних
- Обробка помилок завантаження
- Гнучка конфігурація через пропси

### 2. Нові пропси компонента
- `useRealData` - перемикач між моковими та реальними даними
- `limit` - кількість новин для відображення
- `categoryId` - ID категорії для запиту до API

### 3. Оновлена головна сторінка
- CategoryNews для Європи та Культури використовують реальні дані
- CategoryNews для Історії використовує мокові дані (немає categoryId)
- Налаштовані різні ліміти для різних категорій

## Як використовувати

### Базове використання з моковими даними:
```tsx
<CategoryNews 
  category="КАТЕГОРІЯ"
  useRealData={false}
/>
```

### Використання з реальними даними:
```tsx
<CategoryNews 
  categoryId={CATEGORY_IDS.EVROPA}
  category="ЄВРОПА"
  useRealData={true}
  limit={6}
  mobileLayout="horizontal"
/>
```

### З кастомними даними:
```tsx
<CategoryNews 
  category="КАТЕГОРІЯ"
  news={customNewsArray}
  useRealData={false}
/>
```

## Структура даних з API

Компонент автоматично трансформує дані з API у потрібний формат:

```typescript
// Вхідні дані з API
{
  id: number,
  nheader: string,
  ndate: string,
  ntime: string,
  urlkey: string,
  images: Array<{url: string}>,
  ntype: number
}

// Трансформовані дані для компонента
{
  id: string,
  title: string,
  date: string,
  time: string,
  url: string,
  imageUrl: string,
  imageAlt: string,
  isImportant: boolean
}
```

## Логіка визначення важливих новин

Важливі новини визначаються за полем `ntype`:
- `ntype === 1` - важлива новина (показується тег "ВАЖЛИВО")
- `ntype !== 1` - звичайна новина

## Обробка помилок

При помилці завантаження API даних компонент показує повідомлення про помилку:

```tsx
if (useRealData && apiError) {
  return (
    <section className={styles.categoryNewsSection}>
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          Помилка завантаження новин: {apiError}
        </div>
      </div>
    </section>
  );
}
```

## Тестування

Відкрийте `/test-category-news-api` для перегляду:
- Різних категорій з реальними даними
- Порівняння мокових та реальних даних
- Різних конфігурацій відображення

## Налаштування на головній сторінці

### Категорії з реальними даними:
- **Європа** (`CATEGORY_IDS.EVROPA`) - 8 новин, горизонтальне відображення
- **Культура** (`CATEGORY_IDS.CULTURE`) - 6 новин, колонкове відображення

### Категорії з моковими даними:
- **Історія** - немає categoryId, використовуються мокові дані

## Наступні кроки

1. Додати більше категорій з реальними даними
2. Реалізувати кешування API запитів
3. Додати пагінацію для CategoryNews
4. Оптимізувати завантаження зображень
5. Додати анімації завантаження
