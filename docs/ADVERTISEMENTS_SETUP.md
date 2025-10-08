# Налаштування рекламного планувальника

## Швидкий старт

### 1. Створення таблиці в базі даних

Виконайте SQL скрипт в консолі MySQL:

```bash
mysql -u your_username -p galinfodb_db < scripts/create-advertisements-table.sql
```

Або скопіюйте SQL команди зі скрипта `scripts/create-advertisements-table.sql` і виконайте їх вручну через phpMyAdmin або будь-який інший інструмент керування базою даних.

### 2. Доступ до адмін панелі

Після створення таблиці:

1. Запустіть проект: `npm run dev`
2. Відкрийте адмін панель: http://localhost:3000/admin
3. Клікніть на плитку "📢 Реклама"
4. Або перейдіть напряму: http://localhost:3000/admin/advertisements

### 3. Додавання реклами

1. Натисніть кнопку "Додати рекламу"
2. Заповніть форму:
   - **Назва реклами** - для внутрішнього користування
   - **Зображення** - завантажте картинку (max 5MB, формати: jpg, png, gif, webp)
   - **URL посилання** - куди веде реклама
   - **Порядок відображення** - число для сортування (менше = вище)
   - **Період показу** (опціонально) - дати початку і кінця
   - **Активна** - чи показувати рекламу зараз

3. Натисніть "Зберегти"

## Структура таблиці

```sql
advertisements:
  - id (авто-інкремент)
  - title (назва)
  - image_url (шлях до зображення)
  - link_url (посилання)
  - is_active (активна/неактивна)
  - display_order (порядок показу)
  - click_count (лічильник кліків)
  - view_count (лічильник показів)
  - start_date (дата початку)
  - end_date (дата закінчення)
  - created_at, updated_at
```

## API Endpoints

- `GET /api/admin/advertisements` - список усіх реклам
- `POST /api/admin/advertisements` - створити рекламу
- `PUT /api/admin/advertisements` - оновити рекламу
- `DELETE /api/admin/advertisements?id=X` - видалити рекламу
- `POST /api/admin/advertisements/upload` - завантажити зображення
- `GET /api/advertisements/active` - активні реклами (для фронтенду)
- `POST /api/advertisements/track` - відстеження показів/кліків

## Порівняння з PHP версією

**Старий PHP підхід:**
- 3 таблиці: `a_adbanners`, `a_adplaces`, `a_admanage`
- Файли: `adm_func_banners.php`, `adm_func_adplaces.php`
- Підтримка Flash (SWF) та HTML коду

**Новий Next.js підхід:**
- 1 таблиця: `advertisements`
- RESTful API
- Тільки зображення (сучасний підхід)
- TypeScript + React + Ant Design

## Детальна документація

Дивіться повну документацію: `docs/ADVERTISEMENTS_README.md`

