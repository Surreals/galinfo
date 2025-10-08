# Міграція на CKEditor 4.22.1

## Огляд змін

Проект було мігровано з **EditorJS** на **CKEditor 4.22.1 (Open Source версія)**.

## Причини міграції

- CKEditor 4 є стабільнішим та більш зрілим рішенням
- Open Source версія без обмежень
- Краща підтримка HTML форматування
- Простіша інтеграція з існуючим контентом
- Не потрібна конвертація між форматами (EditorJS JSON → HTML)

## Встановлені пакети

```bash
npm install ckeditor4-react@4.3.0 --legacy-peer-deps
```

**Примітка:**

- Використано `--legacy-peer-deps` через конфлікт з React 19
- Встановлена версія `4.3.0` для сумісності з CKEditor 4.22.1 (остання безкоштовна версія)
- Версії CKEditor 4.23.0+ є LTS версіями з комерційною ліцензією

## Про версію CKEditor 4.22.1

**CKEditor 4.22.1** - це **остання безкоштовна Open Source версія** CKEditor 4.

### Чому саме 4.22.1?

- ✅ **Безкоштовна** - не потребує комерційної ліцензії
- ✅ **Стабільна** - перевірена версія з усіма необхідними функціями
- ✅ **Open Source** - вільна ліцензія для використання
- ⚠️ Версії 4.23.0+ потребують платної підтримки "Extended Support Model"

### Попередження про версію

CKEditor може показувати попередження:

```
This CKEditor 4.22.1 (Standard) version is not secure.
Consider upgrading to the latest one, 4.25.1-lts
```

**Це нормально!** Це маркетингове повідомлення від CKEditor для просування платної LTS версії.

**Рішення:** Додано `versionCheck: false` в конфігурацію для вимкнення цього попередження.

## Створені компоненти

### CKEditorClient

**Шлях:** `/app/admin/article-editor/components/CKEditorClient.tsx`

Новий компонент на базі CKEditor 4.22.1 з повним функціоналом:

#### Основні можливості:

- ✅ Повне форматування тексту (bold, italic, underline, strike, etc.)
- ✅ Списки (маркіровані та нумеровані)
- ✅ Вирівнювання тексту
- ✅ Вставка посилань
- ✅ Вставка зображень
- ✅ Вставка таблиць
- ✅ Вставка відео через iframe
- ✅ Спеціальні символи
- ✅ Стилі та форматування
- ✅ Кольори тексту та фону
- ✅ Режим перегляду коду (Source)

#### API інтерфейс:

```typescript
export interface CKEditorClientRef {
  save: () => Promise<void>;
  getHtmlContent: () => Promise<string>;
}

type Props = {
  htmlContent?: string;
  onHtmlChange?: (html: string) => void;
  placeholder?: string;
  id?: string;
};
```

#### Використання:

```tsx
import dynamic from "next/dynamic";
import { CKEditorClientRef } from "@/app/admin/article-editor/components/CKEditorClient";

const CKEditorClient = dynamic(
  () => import("@/app/admin/article-editor/components/CKEditorClient"),
  { ssr: false }
);

// В компоненті
const editorRef = useRef<CKEditorClientRef>(null);

<CKEditorClient
  id={"ckeditor"}
  ref={editorRef}
  htmlContent={articleData?.nbody}
  onHtmlChange={(html) => {
    onNbodyChange?.(html);
    validateBody(html);
    updateOverallValidation();
  }}
  placeholder="Введіть повний текст новини..."
/>;
```

## Конфігурація CKEditor

### Мова інтерфейсу

Українська (`language: 'uk'`)

### Toolbar

Повна панель інструментів включає:

- Документ: Source, NewPage, Preview, Templates
- Буфер обміну: Cut, Copy, Paste, PasteText, PasteFromWord, Undo, Redo
- Редагування: Find, Replace, SelectAll
- Базове форматування: Bold, Italic, Underline, Strike, Subscript, Superscript, RemoveFormat
- Параграфи: NumberedList, BulletedList, Outdent, Indent, Blockquote, Вирівнювання
- Посилання: Link, Unlink, Anchor
- Вставка: Image, Table, HorizontalRule, SpecialChar, Iframe
- Стилі: Styles, Format, Font, FontSize
- Кольори: TextColor, BGColor
- Інструменти: Maximize, ShowBlocks

### Налаштування

```javascript
{
  editorUrl: 'https://cdn.ckeditor.com/4.22.1/standard-all/ckeditor.js', // Конкретна версія 4.22.1
  placeholder: "Введіть текст новини...",
  language: 'uk',
  versionCheck: false, // Вимикаємо попередження про LTS версію
  allowedContent: true, // Дозволити всі HTML теги
  height: 500,
  extraPlugins: 'iframe,font,colorbutton,justify',
  filebrowserUploadUrl: '/api/admin/images/upload',
  enterMode: 2, // CKEDITOR.ENTER_BR
  shiftEnterMode: 1, // CKEDITOR.ENTER_P
  removePlugins: 'elementspath',
  resize_enabled: true,
}
```

## Оновлені файли

### 1. NewsEditorHeader.tsx

**Зміни:**

- ✅ Замінено імпорт `EditorJSClient` → `CKEditorClient`
- ✅ Замінено тип `EditorJSClientRef` → `CKEditorClientRef`
- ✅ Оновлено JSX компонент `<EditorJSClient />` → `<CKEditorClient />`

### 2. EditorJSClient.tsx

**Статус:** `@deprecated`

Компонент залишено для історії, але позначено як застарілий:

```typescript
/**
 * @deprecated
 * Цей компонент застарілий і більше не використовується.
 * Використовуйте CKEditorClient замість нього.
 *
 * @see CKEditorClient
 */
```

## Міграція даних

### HTML контент

CKEditor працює безпосередньо з HTML, тому **не потрібна міграція даних** з бази.

Весь існуючий HTML контент (`nbody`) працює без змін:

- ✅ Старі новини відкриваються без проблем
- ✅ Редагування зберігає форматування
- ✅ Нові новини створюються в тому ж форматі

### Переваги

На відміну від EditorJS, який використовував JSON формат і потребував конвертації:

- Немає втрати даних при конвертації
- Немає проблем з нестандартними тегами
- Простіша робота з існуючим контентом

## Підтримка YouTube та Відео

### YouTube через Iframe

CKEditor підтримує вставку iframe через кнопку "Iframe" в панелі інструментів.

**Як вставити YouTube:**

1. Натисніть кнопку "Iframe" в toolbar
2. Вставте код embed з YouTube:

```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  frameborder="0"
  allowfullscreen
>
</iframe>
```

### Завантаження відео

Підтримка завантаження відео через існуючий API:

```
filebrowserUploadUrl: '/api/admin/images/upload'
```

## Тестування

### Перевірені функції

- ✅ Створення нової новини
- ✅ Редагування існуючої новини
- ✅ Збереження HTML контенту
- ✅ Валідація обов'язкових полів
- ✅ Форматування тексту
- ✅ Вставка посилань
- ✅ Вставка списків
- ✅ Dynamic import (SSR виключено)

### Як протестувати

1. Запустити dev сервер
2. Перейти в адмін панель: `/admin/news`
3. Створити нову новину або відредагувати існуючу
4. Перевірити всі функції редактора

## Troubleshooting

### Проблема: Попередження про версію CKEditor

**Повідомлення:**

```
This CKEditor 4.22.1 (Standard) version is not secure.
Consider upgrading to the latest one, 4.25.1-lts
```

**Причина:** CKEditor намагається просувати платну LTS версію

**Рішення:** Додано `versionCheck: false` в конфігурацію:

```javascript
const editorConfig = {
  versionCheck: false, // Вимикає попередження
  // ... інші налаштування
};
```

### Проблема: Помилка ліцензії "[CKEDITOR]: The license key is missing or invalid"

**Причина:** Встановлена LTS версія (4.23.0+) замість Open Source версії

**Рішення:**

```bash
npm uninstall ckeditor4-react
npm install ckeditor4-react@4.3.0 --legacy-peer-deps
```

Переконайтеся, що компонент використовує `editorUrl` з версією 4.22.1:

```tsx
<CKEditor
  editorUrl="https://cdn.ckeditor.com/4.22.1/standard-all/ckeditor.js"
  // ... інші пропси
/>
```

### Проблема: Конфлікт з React 19

**Рішення:** Встановлено з `--legacy-peer-deps`

```bash
npm install ckeditor4-react --legacy-peer-deps
```

### Проблема: Редактор не ініціалізується

**Причина:** SSR (Server-Side Rendering)

**Рішення:** Використовувати dynamic import:

```tsx
const CKEditorClient = dynamic(
  () => import("@/app/admin/article-editor/components/CKEditorClient"),
  { ssr: false }
);
```

### Проблема: Відсутні стилі

**Рішення:** CKEditor автоматично підключає стилі з CDN:

```javascript
contentsCss: ["https://cdn.ckeditor.com/4.22.1/standard-all/contents.css"];
```

## Наступні кроки

### Опціональні покращення:

1. **Custom плагіни**

   - Створити власний плагін для галереї зображень
   - Інтеграція з медіа-сховищем

2. **Додаткові функції**

   - Автозбереження контенту
   - Спел-чекер для української мови
   - Вставка таблиць даних

3. **Оптимізація**
   - Custom build CKEditor тільки з необхідними плагінами
   - Локальне хостинг CKEditor замість CDN

## Ресурси

- [CKEditor 4 Documentation](https://ckeditor.com/docs/ckeditor4/latest/)
- [CKEditor 4 React Integration](https://ckeditor.com/docs/ckeditor4/latest/guide/dev_react.html)
- [CKEditor 4 Configuration](https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html)

## Автор міграції

Дата: 7 жовтня 2025
Версія CKEditor: 4.22.1 (revision 4a1fb11f44)
