# Управління категоріями та тегами

## Огляд

Система управління категоріями та тегами дозволяє адміністраторам керувати структурою контенту сайту через зручний веб-інтерфейс.

## Категорії

### Типи категорій

Система підтримує три типи категорій (cattype):

1. **Основні категорії (cattype = 1)**
   - Використовуються для рубрикації новин
   - Приклади: Суспільство, Політика, Економіка, Культура, Здоров'я, Спорт
   - Відображаються в головному меню сайту

2. **Спеціальні теми (cattype = 2)**
   - Тематичні розділи для спеціальних проектів
   - Приклади: Відверта розмова, Райони Львова, Прес-служба
   - Відображаються в блоці "ТОП ТЕМИ"

3. **Регіони (cattype = 3)**
   - Географічна класифікація новин
   - Приклади: Львівщина, Тернопільщина, Волинь, Україна, Європа, Світ
   - Відображаються в регіональному блоці меню

### Структура категорії

```typescript
interface Category {
  id: number;              // Унікальний ідентифікатор
  title: string;           // Назва категорії (українською)
  cattype: number;         // Тип категорії (1, 2, або 3)
  param: string;           // URL slug (латиницею, малі літери, дефіси)
  description?: string;    // Опис категорії (опціонально)
  isvis: number;           // Видимість (1 - видима, 0 - прихована)
  orderid: number;         // Порядок сортування
  lng: string;             // Мова (1 - українська)
}
```

### API Endpoints

#### GET /api/admin/categories
Отримання списку категорій

**Параметри:**
- `lang` (optional) - мова (за замовчуванням: '1')
- `cattype` (optional) - фільтр за типом категорії
- `includeHidden` (optional) - включити приховані категорії (true/false)

**Приклад:**
```javascript
const response = await fetch('/api/admin/categories?cattype=1&includeHidden=true');
const data = await response.json();
```

#### POST /api/admin/categories
Створення нової категорії

**Body:**
```json
{
  "title": "Назва категорії",
  "cattype": 1,
  "param": "url-slug",
  "description": "Опис категорії",
  "isvis": 1
}
```

#### PUT /api/admin/categories
Оновлення категорії

**Body:**
```json
{
  "id": 123,
  "title": "Нова назва",
  "param": "new-slug",
  "description": "Новий опис",
  "isvis": 1
}
```

#### DELETE /api/admin/categories
Видалення категорії

**Параметри:**
- `id` (required) - ID категорії для видалення

**Примітка:** Категорію не можна видалити, якщо вона використовується в новинах

#### PATCH /api/admin/categories
Спеціальні операції з категоріями

**Зміна порядку:**
```json
{
  "action": "reorder",
  "id": 123,
  "direction": "up" // або "down"
}
```

**Зміна видимості:**
```json
{
  "action": "toggle-visibility",
  "id": 123
}
```

### UI Компонент

Доступ: `/admin/categories`

**Функції:**
- Перегляд категорій за типами (вкладки)
- Створення нових категорій
- Редагування існуючих категорій
- Видалення категорій (з перевіркою використання)
- Зміна порядку сортування (стрілки вгору/вниз)
- Зміна видимості (показати/сховати)

**Обмеження:**
- `param` повинен містити тільки малі латинські літери, цифри та дефіси
- `param` має бути унікальним в межах типу категорії
- Неможливо видалити категорію, яка використовується в новинах

---

## Теги

### Структура тегу

```typescript
interface Tag {
  id: number;           // Унікальний ідентифікатор
  tag: string;          // Назва тегу
  usage_count?: number; // Кількість використань (при завантаженні з withUsageCount)
}
```

### API Endpoints

#### GET /api/admin/tags
Отримання списку тегів

**Параметри:**
- `search` (optional) - пошук за назвою тегу
- `withUsageCount` (optional) - включити лічильник використання (true/false)

**Приклад:**
```javascript
const response = await fetch('/api/admin/tags?search=львів&withUsageCount=true');
const data = await response.json();
```

#### POST /api/admin/tags
Створення нового тегу

**Body:**
```json
{
  "tag": "Назва тегу"
}
```

#### PUT /api/admin/tags
Оновлення тегу

**Body:**
```json
{
  "id": 123,
  "tag": "Нова назва тегу"
}
```

#### DELETE /api/admin/tags
Видалення тегу

**Параметри:**
- `id` (required) - ID тегу для видалення
- `replaceWithId` (optional) - ID тегу для заміни в новинах

**Примітка:** Якщо тег використовується в новинах, потрібно або вказати тег для заміни, або підтвердити видалення зі всіх новин

**Приклад з заміною:**
```javascript
const response = await fetch('/api/admin/tags?id=123&replaceWithId=456', {
  method: 'DELETE'
});
```

### UI Компонент

Доступ: `/admin/tags`

**Функції:**
- Перегляд всіх тегів з лічильником використання
- Пошук тегів за назвою
- Створення нових тегів
- Редагування існуючих тегів
- Видалення тегів з можливістю заміни

**Особливості видалення:**
- При видаленні тегу, який використовується в новинах, з'являється діалог
- Можна вибрати інший тег для заміни
- Якщо не вибрати тег для заміни, тег просто буде видалений з усіх новин

**Обмеження:**
- Назва тегу має бути унікальною
- Мінімальна довжина назви - 2 символи

---

## База даних

### Таблиця a_cats (категорії)

```sql
CREATE TABLE a_cats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  cattype INT NOT NULL,
  param VARCHAR(255) NOT NULL,
  description TEXT,
  isvis TINYINT DEFAULT 1,
  orderid INT DEFAULT 0,
  lng VARCHAR(10) DEFAULT '1',
  UNIQUE KEY unique_param (param, lng, cattype)
);
```

### Таблиця a_tags (теги)

```sql
CREATE TABLE a_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tag VARCHAR(255) NOT NULL UNIQUE
);
```

### Таблиця a_tagmap (зв'язок тегів з новинами)

```sql
CREATE TABLE a_tagmap (
  newsid INT NOT NULL,
  tagid INT NOT NULL,
  PRIMARY KEY (newsid, tagid),
  FOREIGN KEY (newsid) REFERENCES a_news(id) ON DELETE CASCADE,
  FOREIGN KEY (tagid) REFERENCES a_tags(id) ON DELETE CASCADE
);
```

---

## Інтеграція з іншими модулями

### Використання в редакторі новин

Категорії та теги використовуються в редакторі новин (`/admin/article-editor`) для класифікації контенту:

```typescript
// Вибір категорій
const categories = await fetch('/api/admin/categories?cattype=1');

// Вибір тегів
const tags = await fetch('/api/admin/tags');
```

### Відображення на сайті

Категорії та теги використовуються для:
- Фільтрації новин
- Навігації по сайту
- SEO оптимізації
- Рекомендацій схожих новин

---

## Безпека

Всі операції управління категоріями та тегами доступні тільки авторизованим адміністраторам.

**Перевірка прав:**
- Користувач має бути авторизований через `/admin/login`
- Сесія зберігається в cookies
- API перевіряє авторизацію перед кожною операцією

---

## Міграція з PHP

Новий функціонал повністю замінює:
- `deprecated_php_app/gazda/adm_func_cats.php`
- `deprecated_php_app/gazda/adm_func_tags.php`

**Переваги нового підходу:**
- TypeScript для type safety
- Сучасний React UI з Ant Design
- RESTful API
- Валідація на клієнті та сервері
- Краща продуктивність
- Мобільна адаптивність





