# Система позицій реклами

## Огляд

Система рекламного планувальника підтримує 3 основні позиції + 1 загальну:

1. **AdBanner** - головна реклама (компонент AdBanner)
2. **Infomo** - IN-FOMO банер
3. **Sidebar** - реклама в бокової панелі
4. **General** - загальна реклама (за замовчуванням)

## Як це працює

### 1. База даних

У таблиці `advertisements` є поле `placement` з можливими значеннями:
- `adbanner` - для компонента AdBanner
- `infomo` - для IN-FOMO банера
- `sidebar` - для sidebar реклами
- `general` - для загальної реклами

### 2. Адмін панель

При створенні/редагуванні реклами можна вибрати позицію з випадаючого списку:

```
Позиція реклами:
- AdBanner (головна реклама)
- Infomo (IN-FOMO банер)
- Sidebar (бокова панель)
- Загальна
```

### 3. API

#### Отримання реклами по позиції

```typescript
GET /api/advertisements/by-placement?placement=adbanner
```

**Відповідь:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Тестова реклама",
    "image_url": "/media/advertisements/ad-123.jpg",
    "link_url": "https://example.com",
    "placement": "adbanner",
    "display_order": 1
  }
}
```

API автоматично:
- Вибирає тільки активні реклами
- Перевіряє period показу (start_date/end_date)
- Збільшує лічильник показів (`view_count`)
- Повертає 1 випадкову рекламу з вказаної позиції

#### Відстеження кліків

```typescript
POST /api/advertisements/track
Body: { id: 1, type: 'click' }
```

### 4. Компоненти

#### AdBanner (динамічний)

Компонент автоматично фетчить рекламу з позиції `adbanner`:

```tsx
import AdBanner from '@/app/components/adBanner/AdBanner';

<AdBanner />
// або з custom placement:
<AdBanner placement="infomo" />
```

#### AdImage

Універсальний компонент для показу реклами-зображення:

```tsx
import AdImage from '@/app/components/AdImage';

<AdImage placement="infomo" width={728} height={90} />
<AdImage placement="sidebar" width={300} height={250} />
```

### 5. Інтеграція в схеми

#### В ArticlePageRenderer і CategoryRenderer

Код автоматично визначає позицію на основі src:

```typescript
case 'BANNER_IMAGE':
  let placement: 'infomo' | 'sidebar' | 'general' = 'general';
  if (config.src?.includes('Ad Banner black.png')) {
    placement = 'infomo';
  } else if (config.src?.includes('banner3.png')) {
    placement = 'sidebar';
  }
  
  return (
    <AdImage
      placement={placement}
      width={config.width}
      height={config.height}
    />
  );
```

## Приклад використання

### Крок 1: Створення реклами в адмін панелі

1. Відкрити `/admin/advertisements`
2. Натиснути "Додати рекламу"
3. Заповнити форму:
   - Назва: "Реклама Gora"
   - Позиція: **AdBanner (головна реклама)**
   - Зображення: завантажити картинку
   - URL: https://gora.com.ua
   - Активна: ✓

### Крок 2: Перегляд на сайті

Реклама автоматично з'явиться в місці де використовується компонент `AdBanner` або `BANNER_IMAGE` з відповідним src.

### Крок 3: Статистика

В адмін панелі можна побачити:
- Кількість показів (view_count)
- Кількість кліків (click_count)

## Міграція зі старої системи

### Було (статичні зображення):

```tsx
<Image src="/assets/images/banner3.png" />
<Image src="/assets/images/Ad Banner black.png" />
```

### Стало (динамічна реклама):

```tsx
<AdImage placement="sidebar" />
<AdImage placement="infomo" />
```

## Переваги нової системи

1. ✅ **Керування через адмін панель** - не треба міняти код щоб оновити рекламу
2. ✅ **Статистика** - автоматичне відстеження показів і кліків
3. ✅ **Планування** - можна встановити період показу реклами
4. ✅ **Активація/деактивація** - одна кнопка в адмін панелі
5. ✅ **Множинні позиції** - різна реклама для різних місць
6. ✅ **Ротація** - випадковий вибір з кількох активних реклам

## Технічні деталі

### Автоматичне відстеження показів

Коли користувач бачить рекламу, API автоматично збільшує `view_count`:

```typescript
// В by-placement/route.ts
if (advertisements.length > 0) {
  await pool.query(
    'UPDATE advertisements SET view_count = view_count + 1 WHERE id = ?',
    [advertisements[0].id]
  );
}
```

### Автоматичне відстеження кліків

Коли користувач клікає на рекламу:

```typescript
// В AdBanner.tsx або AdImage.tsx
const handleClick = async () => {
  await fetch('/api/advertisements/track', {
    method: 'POST',
    body: JSON.stringify({ id: ad.id, type: 'click' }),
  });
  window.open(ad.link_url, '_blank');
};
```

### Випадковий вибір реклами

SQL запит використовує `RAND()` для випадкового вибору:

```sql
SELECT * FROM advertisements
WHERE placement = 'adbanner'
  AND is_active = true
  AND (start_date IS NULL OR start_date <= NOW())
  AND (end_date IS NULL OR end_date >= NOW())
ORDER BY display_order ASC, RAND()
LIMIT 1
```

## Troubleshooting

### Проблема: Реклама не показується

**Рішення:**
1. Перевірте що реклама активна (`is_active = true`)
2. Перевірте період показу (start_date/end_date)
3. Перевірте що вибрана правильна позиція
4. Перевірте що зображення завантажене

### Проблема: Статистика не оновлюється

**Рішення:**
1. Перевірте консоль браузера на помилки
2. Перевірте що API `/api/advertisements/track` працює
3. Перевірте що з'єднання з БД активне

## Майбутні покращення

- [ ] A/B тестування різних варіантів реклами
- [ ] Географічний таргетинг
- [ ] Час показу (наприклад тільки вдень/вночі)
- [ ] CTR (Click-Through Rate) метрики
- [ ] Heatmap кліків
- [ ] Детальна аналітика (графіки)

