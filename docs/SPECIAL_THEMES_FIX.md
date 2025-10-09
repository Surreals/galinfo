# Виправлення вивода спеціальних тем

## Проблема

На сторінці категорій спеціальні теми не відображали достатню кількість новин через неправильний підхід до запитів в базу даних.

### Попередня реалізація

API endpoints для спеціальних тем використовували `FIND_IN_SET(?, a_news.rubric)` для пошуку новин, що шукало ID спеціальної теми в полі `rubric` таблиці `a_news`.

### Правильна реалізація

Відповідно до підходу в `app/topthemes/[category]/page.tsx`, новини спеціальних тем повинні шукатися за полем `theme` таблиці `a_news`.

## Виправлення

### 1. API endpoint для конкретної спеціальної теми
**Файл:** `app/api/news/special-themes/[param]/route.ts`

**Було:**
```sql
WHERE FIND_IN_SET(?, a_news.rubric) > 0
```

**Стало:**
```sql
WHERE a_news.theme = ?
```

### 2. API endpoint для всіх спеціальних тем
**Файл:** `app/api/news/special-themes/route.ts`

**Було:**
```sql
LEFT JOIN a_cats ON FIND_IN_SET(a_cats.id, a_news.rubric) > 0 AND a_cats.cattype = 2
WHERE a_cats.id IN (...)
```

**Стало:**
```sql
LEFT JOIN a_cats ON a_news.theme = a_cats.id AND a_cats.cattype = 2
WHERE a_news.theme IN (...)
```

## Спеціальні теми

Система підтримує наступні спеціальні теми (cattype = 2):

### Активні теми:
1. **Відверта розмова** (`vidverta-rozmova`, ID: 136)
   - URL: `/topthemes/vidverta-rozmova`
   
2. **Райони Львова** (`rayony-lvova`, ID: 142)
   - URL: `/topthemes/rayony-lvova`
   
3. **Прес-служба** (`pressluzhba`, ID: 140)
   - URL: `/topthemes/pressluzhba`

### Інші спеціальні теми:
- Голос народу (`reporter`, ID: 134)
- Весняні мотиви (`euro-2012`, ID: 135)
- Львівська міська виборча комісія (`lvivska-miska-vyborcha-komisiya`, ID: 137)
- Львівська обласна виборча комісія (`lvivska-oblasna-vyborcha-komisiya`, ID: 138)
- Бліц-інтерв'ю (`blits-intervyu`, ID: 139)
- Олімпійські ігри в Ріо 2016 (`olimpiyski-igry-v-rio-2016`, ID: 141)
- ТВК (`tvk`, ID: 143)
- Вибори (`vybory-zmin`, ID: 144)
- Журналістика змін (`zhurnalistyka-zmin`, ID: 145)
- Вибори ректора ЛНУ (`vybory-rektora-lnu`, ID: 146)

## Використання

### На сторінці категорій
CategoryRenderer використовує `useSpecialThemesNewsById` для завантаження новин спеціальних тем:

```typescript
const specialThemeHook = useSpecialThemesNewsById(categoryId ?? 0, {
  page: currentPage,
  limit: 38,
  lang: '1',
  approved: true,
  autoFetch: categoryId !== null && isSpecialTheme
});
```

### На сторінці спеціальної теми
Сторінка `/topthemes/[category]` виконує прямий запит до бази даних:

```typescript
const [newsResult] = await executeQuery(
  `SELECT ... FROM a_news
   WHERE a_news.theme = ?
     AND a_news.approved = 1
     AND a_news.lang = "1"
     AND CONCAT(a_news.ndate, " ", a_news.ntime) < NOW()
   ORDER BY a_news.udate DESC
   LIMIT 24`,
  [currentTheme.id]
);
```

## Результат

Після виправлення API endpoints правильно знаходять новини для спеціальних тем, використовуючи поле `theme`, що забезпечує достатню кількість новин для відображення на сторінках категорій.



