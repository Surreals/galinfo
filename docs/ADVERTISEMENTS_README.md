# Система управління рекламою

## Огляд

Система рекламного планувальника дозволяє керувати рекламними оголошеннями на сайті через адміністративну панель. Реалізовано на основі аналізу старої PHP системи з таблицями `a_adbanners`, `a_adplaces` та `a_admanage`.

## Особливості

- ✅ Додавання/редагування/видалення реклам
- ✅ Завантаження зображень для реклами
- ✅ Встановлення посилання (URL) для реклами
- ✅ Активація/деактивація реклами
- ✅ Порядок відображення (сортування)
- ✅ Статистика показів і кліків
- ✅ Планування періоду показу (start_date/end_date)

## Структура бази даних

### Таблиця `advertisements`

```sql
CREATE TABLE advertisements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,              -- Назва реклами
  image_url VARCHAR(500),                   -- URL зображення
  link_url VARCHAR(500) NOT NULL,           -- URL посилання
  is_active BOOLEAN DEFAULT true,           -- Чи активна реклама
  display_order INT DEFAULT 0,              -- Порядок відображення (менше = вище)
  click_count INT DEFAULT 0,                -- Кількість кліків
  view_count INT DEFAULT 0,                 -- Кількість показів
  start_date DATETIME NULL,                 -- Дата початку показу
  end_date DATETIME NULL,                   -- Дата закінчення показу
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Установка

### 1. Створення таблиці в базі даних

Виконайте SQL скрипт для створення таблиці:

```bash
# Використовуючи MySQL CLI
mysql -u your_username -p your_database < scripts/create-advertisements-table.sql

# Або виконайте скрипт через Node.js (потребує правильних налаштувань в .env)
node scripts/setup-advertisements-table.js
```

### 2. Налаштування змінних середовища

Переконайтеся, що у вашому `.env` або `.env.local` файлі є налаштування бази даних:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=galinfodb_db
DB_PORT=3306

# Опціонально: для зовнішнього сховища медіа
MEDIA_STORAGE_PATH=/path/to/media/storage
NEXT_PUBLIC_MEDIA_URL=/media
```

### 3. Доступ до адмін панелі

Після установки, відкрийте:

```
http://localhost:3000/admin/advertisements
```

## API Endpoints

### GET `/api/admin/advertisements`

Отримати список усіх реклам

**Query параметри:**
- `active=true` - отримати тільки активні реклами

**Відповідь:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Приклад реклами",
      "image_url": "/media/advertisements/ad-123456.jpg",
      "link_url": "https://example.com",
      "is_active": true,
      "display_order": 1,
      "click_count": 42,
      "view_count": 1250,
      "start_date": "2024-01-01 00:00:00",
      "end_date": "2024-12-31 23:59:59",
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-15 14:30:00"
    }
  ]
}
```

### POST `/api/admin/advertisements`

Створити нову рекламу

**Body:**
```json
{
  "title": "Назва реклами",
  "image_url": "/media/advertisements/image.jpg",
  "link_url": "https://example.com",
  "is_active": true,
  "display_order": 0,
  "start_date": "2024-01-01 00:00:00",
  "end_date": "2024-12-31 23:59:59"
}
```

### PUT `/api/admin/advertisements`

Оновити існуючу рекламу

**Body:**
```json
{
  "id": 1,
  "title": "Оновлена назва",
  "image_url": "/media/advertisements/new-image.jpg",
  "link_url": "https://example.com/new",
  "is_active": false,
  "display_order": 5,
  "start_date": null,
  "end_date": null
}
```

### DELETE `/api/admin/advertisements?id=1`

Видалити рекламу

### POST `/api/admin/advertisements/upload`

Завантажити зображення для реклами

**FormData:**
- `file`: File (image/jpeg, image/png, image/gif, image/webp, max 5MB)

**Відповідь:**
```json
{
  "success": true,
  "data": {
    "fileName": "ad-1234567890-banner.jpg",
    "url": "/media/advertisements/ad-1234567890-banner.jpg",
    "size": 245680,
    "type": "image/jpeg"
  }
}
```

## Використання в інтерфейсі сайту

### Отримання активних реклам

```typescript
// app/components/Advertisement.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Advertisement {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string;
}

export default function AdvertisementBanner() {
  const [ad, setAd] = useState<Advertisement | null>(null);

  useEffect(() => {
    fetch('/api/admin/advertisements?active=true')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          // Вибрати випадкову рекламу або першу
          setAd(data.data[0]);
        }
      });
  }, []);

  const handleClick = async () => {
    if (ad) {
      // Збільшити лічильник кліків
      await fetch('/api/advertisements/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id })
      });
    }
  };

  if (!ad || !ad.image_url) return null;

  return (
    <Link href={ad.link_url} target="_blank" onClick={handleClick}>
      <Image
        src={ad.image_url}
        alt={ad.title}
        width={728}
        height={90}
        style={{ width: '100%', height: 'auto' }}
      />
    </Link>
  );
}
```

### Відстеження показів

Створіть API роут для відстеження показів та кліків:

```typescript
// app/api/advertisements/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    await pool.query(
      'UPDATE advertisements SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

## Порівняння зі старою PHP системою

### Старий PHP підхід:

**Таблиці:**
- `a_adbanners` - зберігає банери (файли/HTML код)
- `a_adplaces` - місця для показу реклами
- `a_admanage` - зв'язок між банерами і місцями

**Файли:**
- `adm_func_banners.php` - управління банерами
- `adm_func_adplaces.php` - управління місцями
- `viewbanner.php` - перегляд банера

### Новий Next.js підхід:

**Таблиця:**
- `advertisements` - єдина таблиця з усією інформацією

**Файли:**
- `app/api/admin/advertisements/route.ts` - API для CRUD операцій
- `app/api/admin/advertisements/upload/route.ts` - завантаження зображень
- `app/admin/advertisements/page.tsx` - адмін панель

### Переваги нової системи:

1. ✅ **Простіша структура** - одна таблиця замість трьох
2. ✅ **RESTful API** - стандартизовані HTTP методи
3. ✅ **TypeScript** - типізація для безпеки коду
4. ✅ **Сучасний UI** - React + Ant Design
5. ✅ **Автоматичне завантаження** - зображення зберігаються автоматично
6. ✅ **Статистика** - вбудовані лічильники показів і кліків

## Майбутні покращення

- [ ] Групування реклам по категоріях
- [ ] A/B тестування різних варіантів
- [ ] Детальна аналітика (графіки, звіти)
- [ ] Таргетування по регіонах/рубриках
- [ ] Ротація реклами з урахуванням відсотків показу
- [ ] Експорт статистики в CSV/Excel
- [ ] Попередній перегляд реклами перед публікацією

## Troubleshooting

### Проблема: "Failed to fetch advertisements"

**Рішення:**
1. Перевірте підключення до бази даних
2. Переконайтеся, що таблиця створена
3. Перевірте логи сервера в консолі

### Проблема: "Failed to upload image"

**Рішення:**
1. Перевірте розмір файлу (max 5MB)
2. Перевірте формат (тільки зображення)
3. Переконайтеся, що папка `/public/media/advertisements` існує і має права на запис
4. Якщо використовуєте зовнішнє сховище, перевірте `MEDIA_STORAGE_PATH`

### Проблема: Таблиця не створюється

**Рішення:**
```bash
# Виконайте SQL напряму через MySQL консоль
mysql -u root -p galinfodb_db < scripts/create-advertisements-table.sql
```

## Підтримка

Якщо виникли питання або проблеми, перегляньте:
- Документацію Next.js: https://nextjs.org/docs
- Документацію Ant Design: https://ant.design/components
- Документацію MySQL: https://dev.mysql.com/doc/

