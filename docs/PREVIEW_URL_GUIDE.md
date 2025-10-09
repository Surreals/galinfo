# Система Preview URL для неопублікованих новин

## Огляд

Система Preview URL дозволяє генерувати технічні посилання для перегляду новин до їх публікації. Ці посилання захищені від індексації пошуковими системами та можуть бути надані замовникам або редакторам для попереднього перегляду матеріалів.

## Основні можливості

1. **Безпечний доступ**: Preview URL генерується з унікальним токеном на основі HMAC-SHA256
2. **Захист від індексації**: Сторінки preview мають noindex, nofollow мета-теги
3. **Візуальна індикація**: Спеціальний банер вказує на режим перегляду
4. **Без впливу на статистику**: Перегляди через preview URL не враховуються в статистиці

## Як використовувати

### 1. Генерація Preview URL в адмін панелі

1. Відкрийте редактор новини в адмін панелі
2. Збережіть новину (якщо ще не збережена)
3. Натисніть кнопку **"КОПІЮВАТИ PREVIEW URL"** в правій панелі
4. URL автоматично скопіюється в буфер обміну
5. Надішліть цей URL замовнику або іншій особі для перегляду

### 2. Формат Preview URL

```
https://yourdomain.com/preview/{token}/{newsId}
```

Де:
- `{token}` - унікальний токен на основі ID новини та секретного ключа
- `{newsId}` - ID новини в базі даних

**Приклад:**
```
https://galinfo.com.ua/preview/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/12345
```

## Технічна реалізація

### Генерація токена

Токен генерується за допомогою HMAC-SHA256:

```typescript
import crypto from 'crypto';

function generatePreviewToken(newsId: number): string {
  const secret = process.env.PREVIEW_TOKEN_SECRET || 'default-secret';
  const hash = crypto.createHmac('sha256', secret)
    .update(`news-${newsId}`)
    .digest('hex');
  return hash.substring(0, 32);
}
```

### Налаштування

Додайте секретний ключ в `.env` файл:

```env
PREVIEW_TOKEN_SECRET=your_random_secret_key_here_change_in_production
```

**ВАЖЛИВО**: Змініть цей ключ в production на випадковий рядок!

### API Endpoint

**URL:** `/api/news/preview/[token]/[id]`

**Метод:** GET

**Параметри:**
- `token` (path) - Preview токен
- `id` (path) - ID новини
- `lang` (query) - Мова (опціонально, за замовчуванням '1')
- `includeRelated` (query) - Включити пов'язані новини (за замовчуванням true)
- `includeAuthor` (query) - Включити інформацію про автора (за замовчуванням true)

**Відповідь:**
```json
{
  "article": {
    "id": 12345,
    "nheader": "Заголовок новини",
    "nbody": "Текст новини...",
    "approved": 0,
    ...
  },
  "meta": {
    "isPreview": true,
    ...
  }
}
```

### Сторінка Preview

**URL:** `/preview/[token]/[id]`

Сторінка автоматично:
- Додає `noindex, nofollow` мета-теги
- Показує візуальний банер про режим перегляду
- Відображає новину в тому ж форматі, що й опублікована версія
- НЕ враховує перегляди в статистиці

## SEO та захист від індексації

### 1. robots.txt

Preview URL автоматично виключені з індексації:

```
User-agent: *
Disallow: /preview/
```

### 2. Meta теги

Кожна preview сторінка містить:

```html
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
<meta name="googlebot" content="noindex, nofollow" />
<meta name="bingbot" content="noindex, nofollow" />
```

### 3. Sitemap

Preview URL не включаються в sitemap.xml

## Безпека

### Рівні захисту

1. **Детермінований токен**: Токен генерується на основі ID та секретного ключа
2. **Перевірка токена**: Кожен запит перевіряє валідність токена
3. **Секретний ключ**: Використовується environment variable для секретного ключа
4. **Без cookies**: Не потрібна авторизація через cookies

### Переваги детермінованого підходу

- Один і той самий URL завжди працює для конкретної новини
- Не потрібно зберігати токени в базі даних
- Легко регенерувати URL якщо потрібно
- Токен можна валідувати без звернення до БД

### Недоліки та міркування

- Якщо секретний ключ скомпрометовано, потрібно змінити його (і всі старі URL перестануть працювати)
- Не можна "відкликати" окремий preview URL без зміни всього секрету
- Будь-хто з URL може переглянути неопубліковану новину

## Алгоритм роботи

### Генерація preview URL (адмін панель)

```
1. Користувач відкриває редактор новини
2. Натискає "КОПІЮВАТИ PREVIEW URL"
3. Система генерує токен на основі newsId та секретного ключа
4. Формує URL: /preview/{token}/{newsId}
5. Копіює URL в буфер обміну
6. Показує повідомлення про успішне копіювання
```

### Перегляд preview (публічна сторінка)

```
1. Користувач відкриває /preview/{token}/{newsId}
2. Сервер валідує токен
3. Якщо токен валідний:
   - Завантажує новину з БД (навіть якщо approved=0)
   - Показує банер про режим preview
   - Відображає новину
   - НЕ збільшує лічильник переглядів
4. Якщо токен невалідний:
   - Показує помилку доступу
```

## Використання в коді

### Генерація preview URL через API

Для клієнтського коду використовуйте API endpoint:

```typescript
// В клієнтському компоненті
const newsId = 12345;
const response = await fetch(`/api/news/preview-url/${newsId}`);
const data = await response.json();
const previewUrl = data.previewUrl;
// Результат: https://yourdomain.com/preview/{token}/12345
```

### Генерація preview URL на сервері

Для серверного коду можна використовувати безпосередньо:

```typescript
import { generatePreviewUrl } from '@/app/lib/previewToken';

const newsId = 12345;
const previewUrl = generatePreviewUrl(newsId);
// Результат: https://yourdomain.com/preview/{token}/12345
```

**ВАЖЛИВО:** `generatePreviewUrl` використовує Node.js `crypto` модуль і працює тільки на сервері!

### Валідація токена

```typescript
import { validatePreviewToken } from '@/app/lib/previewToken';

const newsId = 12345;
const token = 'a1b2c3d4e5f6g7h8...';
const isValid = validatePreviewToken(newsId, token);
// Результат: true або false
```

## Тестування

### Ручне тестування

1. Створіть нову новину в адмін панелі
2. Встановіть `approved = 0` (не опублікована)
3. Збережіть новину
4. Скопіюйте preview URL
5. Відкрийте URL в приватному вікні браузера
6. Переконайтесь що:
   - Новина відображається
   - Показується банер про preview
   - У meta тегах є noindex/nofollow

### Перевірка SEO

1. Відкрийте preview URL
2. Перегляньте вихідний код сторінки
3. Переконайтесь у наявності:
   ```html
   <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
   ```
4. Перевірте robots.txt: `https://yourdomain.com/robots.txt`
5. Переконайтесь що `/preview/` в списку disallow

## Можливі розширення

### 1. Тимчасові токени

Можна додати функціонал з обмеженим терміном дії:

```typescript
function generateTemporaryPreviewToken(newsId: number, expiresInHours: number = 24): string {
  const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
  const data = `news-${newsId}-${expiresAt}`;
  // ... генерація токена
}
```

### 2. Статистика preview переглядів

Можна додати окрему таблицю для відслідковування:
- Хто та коли переглядав preview
- Скільки разів відкривали preview URL
- IP адреси для аналізу

### 3. Кастомні токени

Дозволити редакторам створювати власні читабельні токени:

```
/preview/custom-token-name/12345
```

### 4. Захист паролем

Додатковий рівень захисту - вимагати пароль для доступу до preview.

## FAQ

**Q: Чи можна використати один preview URL кілька разів?**
A: Так, токен детермінований і не має обмеження на кількість використань.

**Q: Що якщо я змінив PREVIEW_TOKEN_SECRET?**
A: Всі попередні preview URL перестануть працювати, потрібно буде згенерувати нові.

**Q: Чи враховуються перегляди через preview в статистиці?**
A: Ні, preview перегляди не впливають на статистику переглядів.

**Q: Чи може пошукова система знайти preview сторінку?**
A: Технічно може, якщо хтось опублікував посилання, але завдяки noindex вона не буде індексуватися.

**Q: Чи потрібна авторизація для перегляду preview?**
A: Ні, авторизація не потрібна. Безпека забезпечується через секретний токен в URL.

## Підтримка

Якщо виникають проблеми з preview URL:

1. Перевірте наявність `PREVIEW_TOKEN_SECRET` в `.env`
2. Переконайтесь що новина існує в БД
3. Перевірте логи сервера на помилки
4. Спробуйте згенерувати новий preview URL

## Файли системи

- `app/api/news/preview/[token]/[id]/route.ts` - API endpoint для отримання preview новини
- `app/api/news/preview-url/[id]/route.ts` - API endpoint для генерації preview URL
- `app/preview/[token]/[id]/page.tsx` - Сторінка preview (server component)
- `app/preview/[token]/[id]/PreviewPageClient.tsx` - Клієнтський компонент
- `app/preview/[token]/[id]/page.module.css` - Стилі preview
- `app/lib/previewToken.ts` - Утиліти для роботи з токенами (тільки на сервері!)
- `app/admin/article-editor/components/NewsEditorSidebar.tsx` - Кнопка копіювання URL
- `app/robots.ts` - Правила для robots.txt

