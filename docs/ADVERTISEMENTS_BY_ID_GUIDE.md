# Керування рекламою по ID в схемах

## Огляд

Тепер адміністратори можуть вказувати конкретний ID реклами в схемах замість використання позицій. Це дає повний контроль над тим, яка саме реклама показується в конкретному місці.

## Як це працює

### 1. В схемах вказується `advertisementId`

```javascript
// app/lib/articlePageSchema.js
{
  type: AD_BANNER,
  config: {
    show: true,
    className: 'adBannerStandard',
    advertisementId: 1  // ID реклами з таблиці advertisements
  }
}

{
  type: BANNER_IMAGE,
  config: {
    show: true,
    src: '/assets/images/banner3.png',
    alt: 'banner3',
    width: 600,
    height: 240,
    className: 'banner3',
    advertisementId: 3  // ID реклами sidebar
  }
}
```

### 2. Компоненти отримують рекламу по ID

- **AdBanner** і **AdImage** тепер приймають `advertisementId`
- Якщо `advertisementId` передано - використовується саме ця реклама
- Якщо ні - fallback на `placement` (старий спосіб)

## Поточна конфігурація

### Дефолтні схеми

| Місце | Тип | ID | Реклама |
|-------|-----|----|---------| 
| Hero (AdBanner) | `AD_BANNER` | 1 | Тестова реклама 1 (adbanner) |
| Sidebar (banner3) | `BANNER_IMAGE` | 3 | Тестова реклама Sidebar |
| IN-FOMO | `BANNER_IMAGE` | 2 | Тестова реклама 2 (infomo) |

### Схеми з advertisementId

✅ `app/lib/articlePageSchema.js` - усі AD_BANNER і BANNER_IMAGE
✅ `app/lib/categorySchema.js` - усі AD_BANNER і BANNER_IMAGE

## API

### Отримання реклами по ID

```bash
GET /api/advertisements/[id]
```

**Приклад:**
```bash
curl "http://localhost:3000/api/advertisements/1"
```

**Відповідь:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Тестова реклама 1",
    "image_url": "/media/advertisements/ad-123.jpg",
    "link_url": "https://example.com",
    "placement": "adbanner",
    "display_order": 1
  }
}
```

**Особливості:**
- Автоматично збільшує `view_count` при отриманні
- Перевіряє чи реклама активна (`is_active = true`)
- Перевіряє період показу (`start_date`/`end_date`)
- Якщо реклама неактивна або поза періодом - повертає `null`

## Як змінити рекламу в схемі

### Крок 1: Знайти ID потрібної реклами

1. Відкрити `/admin/advertisements`
2. Подивитися ID реклами в таблиці (перша колонка)
3. Або створити нову рекламу

### Крок 2: Оновити схему

Відкрити відповідний файл схеми:
- `app/lib/articlePageSchema.js` - для сторінок статей
- `app/lib/categorySchema.js` - для категорій

Знайти потрібний блок і змінити `advertisementId`:

```javascript
// Було:
{
  type: AD_BANNER,
  config: {
    show: true,
    className: 'adBannerStandard',
    advertisementId: 1  // Стара реклама
  }
}

// Стало:
{
  type: AD_BANNER,
  config: {
    show: true,
    className: 'adBannerStandard',
    advertisementId: 5  // Нова реклама
  }
}
```

### Крок 3: Перезапустити сервер

```bash
npm run dev
```

Зміни вступлять в дію після перезапуску.

## Приклади використання

### Додати нову рекламу

1. **Створити рекламу в адмін панелі**
   ```
   /admin/advertisements -> "Додати рекламу"
   Назва: Новорічна акція
   Зображення: завантажити
   URL: https://example.com/newyear
   Позиція: AdBanner
   ✓ Активна
   ```

2. **Запам'ятати ID** (наприклад, 7)

3. **Оновити схему**
   ```javascript
   // articlePageSchema.js
   {
     type: AD_BANNER,
     config: {
       show: true,
       className: 'adBannerStandard',
       advertisementId: 7  // Новорічна акція
     }
   }
   ```

### Тимчасово вимкнути рекламу

**Варіант 1:** Деактивувати в адмін панелі
- `/admin/advertisements` -> перемикач "Активна"

**Варіант 2:** Встановити період показу
- Редагувати рекламу -> "Період показу" -> вибрати дати

**Варіант 3:** Змінити на іншу рекламу
- Змінити `advertisementId` в схемі

### A/B тестування

Можна швидко перемикати між рекламами змінюючи `advertisementId`:

```javascript
// Тестуємо рекламу A
advertisementId: 10

// Тестуємо рекламу B  
advertisementId: 11

// Тестуємо рекламу C
advertisementId: 12
```

Перевіряти статистику в `/admin/advertisements` (кліки, покази).

## Переваги нового підходу

| Було (placement) | Стало (advertisementId) |
|------------------|-------------------------|
| Випадковий вибір з позиції | Конкретна реклама за ID |
| Неможливо точно контролювати | Повний контроль |
| Треба редагувати placement в БД | Змінити число в схемі |
| Складно A/B тестувати | Легко перемикати ID |

## Сумісність

### Backward compatibility

Компоненти підтримують обидва підходи:

```typescript
// Новий спосіб (пріоритет)
<AdBanner advertisementId={5} />

// Старий спосіб (fallback)
<AdBanner placement="adbanner" />

// Обидва (advertisementId має пріоритет)
<AdBanner advertisementId={5} placement="adbanner" />
```

Якщо `advertisementId` не вказано - використовується `placement`.

## Troubleshooting

### Проблема: Реклама не показується після зміни ID

**Рішення:**
1. Перевірте що ID існує: `/admin/advertisements`
2. Перевірте що реклама активна
3. Перевірте період показу (start_date/end_date)
4. Перезапустіть dev сервер

### Проблема: API повертає null

**Рішення:**
```bash
# Перевірте через API
curl "http://localhost:3000/api/advertisements/[ID]"

# Якщо success: true, data: null - реклама неактивна або поза періодом
```

### Проблема: Показується стара реклама

**Рішення:**
1. Очистити кеш браузера (Ctrl+Shift+R)
2. Перевірити що змінили правильний файл схеми
3. Перезапустити сервер

## Майбутні покращення

- [ ] UI в адмін панелі для редагування схем
- [ ] Попередній перегляд реклами перед збереженням
- [ ] Історія змін advertisementId
- [ ] Автоматичне переключення між рекламами по розкладу

## Підтримка

Документація:
- `docs/ADVERTISEMENTS_README.md` - загальна інформація
- `docs/ADVERTISEMENTS_PLACEMENTS.md` - про позиції
- `ADVERTISEMENTS_BY_ID_GUIDE.md` - цей файл
