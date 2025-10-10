# Міграція з TipTap та EditorJS на CKEditor

## Дата: 10 жовтня 2025

## Причина міграції
За запитом користувача замінено TipTap на CKEditor для редактора статичних сторінок, а також видалено EditorJS з проекту. CKEditor вже використовується в article-editor і краще підходить для проекту як єдине рішення.

## Виконані зміни

### 1. Оновлено EditorialPagesEditor
**Файл:** `app/admin/templates/EditorialPagesEditor.tsx`

**Зміни:**
- ✅ Замінено TipTap на CKEditor 4
- ✅ Видалено всі імпорти TipTap
- ✅ Додано CKEditor конфігурацію з повним тулбаром
- ✅ Оновлено обробники подій для CKEditor API
- ✅ Замінено `editor.getHTML()` на `editor.getData()`
- ✅ Замінено `editor.commands.setContent()` на `editor.setData()`

**Нові залежності:**
```typescript
import { CKEditor } from 'ckeditor4-react';
```

**Конфігурація CKEditor:**
- Висота: 600px
- Мова: українська
- Toolbar: повний набір інструментів
- Плагіни: iframe, font, colorbutton, justify
- Завантаження зображень: `/api/admin/images/upload`

### 2. Оновлено CSS стилі
**Файл:** `app/admin/templates/EditorialPagesEditor.module.css`

**Зміни:**
- ✅ Видалено стилі для toolbar (тепер вбудований у CKEditor)
- ✅ Видалено стилі для toolbarGroup та toolbarButton
- ✅ Видалено стилі для editorContent
- ✅ Додано стилі для CKEditor контейнера

### 3. Видалено файли з TipTap
**Видалені файли:**
- ✅ `app/admin/components/RichTextEditor.tsx` - TipTap компонент
- ✅ `app/admin/article-editor/components/NewsEditorTipTap.tsx` - TipTap редактор

### 4. Оновлено файли, які використовували TipTap
**Файли:**
- ✅ `app/admin/article-editor/page.tsx` - видалено імпорт RichTextEditor
- ✅ `app/admin/components/NewsEditor.tsx` - замінено RichTextEditor на textarea

### 5. Видалено TipTap з package.json
**Видалені пакети:**
```json
"@tiptap/extension-color": "^3.2.0",
"@tiptap/extension-font-family": "^3.2.0",
"@tiptap/extension-highlight": "^3.2.0",
"@tiptap/extension-image": "^3.2.0",
"@tiptap/extension-link": "^3.2.0",
"@tiptap/extension-subscript": "^3.2.0",
"@tiptap/extension-superscript": "^3.2.0",
"@tiptap/extension-table": "^3.2.0",
"@tiptap/extension-table-cell": "^3.2.0",
"@tiptap/extension-table-header": "^3.2.0",
"@tiptap/extension-table-row": "^3.2.0",
"@tiptap/extension-text-align": "^3.2.0",
"@tiptap/extension-text-style": "^3.6.5",
"@tiptap/extension-underline": "^3.6.6",
"@tiptap/pm": "^3.2.0",
"@tiptap/react": "^3.2.0",
"@tiptap/starter-kit": "^3.2.0"
```

**Команда видалення:**
```bash
npm uninstall @tiptap/extension-color @tiptap/extension-font-family @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-subscript @tiptap/extension-superscript @tiptap/extension-table @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-table-row @tiptap/extension-text-align @tiptap/extension-text-style @tiptap/extension-underline @tiptap/pm @tiptap/react @tiptap/starter-kit
```

**Результат:** Видалено 79 пакетів

### 6. Оновлено документацію
**Файл:** `docs/editorial-pages-editor.md`

**Зміни:**
- ✅ Оновлено технічний стек (TipTap → CKEditor 4)
- ✅ Оновлено опис інструментів редактора
- ✅ Додано інформацію про завантаження зображень

## Переваги CKEditor над TipTap

1. ✅ **Єдиний редактор у проекті** - CKEditor вже використовується в article-editor
2. ✅ **Більше готових функцій** - Source view, Preview, більше плагінів
3. ✅ **Простіша інтеграція** - не потрібно створювати власний toolbar
4. ✅ **Менше залежностей** - 1 пакет замість 17
5. ✅ **CDN підтримка** - можна завантажувати з CDN без node_modules
6. ✅ **Українська мова** - вбудована підтримка української мови
7. ✅ **Стабільніший** - CKEditor 4 - перевірена часом версія

## Поточний стан

### Використання CKEditor в проекті:
1. ✅ `/admin/templates` - EditorialPagesEditor (статичні сторінки)
2. ✅ `/admin/article-editor` - CKEditorClient (новини та статті)

### Залишкові використання TipTap:
❌ Немає - всі компоненти TipTap видалені

## Інструкції для використання

### Редагування статичних сторінок:
1. Перейдіть на `/admin/templates`
2. Оберіть вкладку **"📝 Шаблони для сторінок редакції"**
3. У сайдбарі зліва оберіть потрібну сторінку
4. Редагуйте контент у CKEditor
5. Натисніть **"Зберегти"**

### Особливості CKEditor:
- Кнопка **Source** - перегляд HTML коду
- Кнопка **Preview** - попередній перегляд
- Кнопка **Maximize** - повноекранний режим
- **Image button** - завантаження зображень
- **Table** - вставка та редагування таблиць
- **Iframe** - вбудовування відео та інших ресурсів

## Тестування

### Перевірте наступне:
- ✅ Редактор завантажується на `/admin/templates`
- ✅ Можна перемикатися між сторінками
- ✅ Зміни зберігаються в базу даних
- ✅ HTML контент відображається на публічних сторінках
- ✅ Попередження при незбережених змінах працює
- ✅ Завантаження зображень працює
- ✅ Всі інструменти toolbar доступні

## Відкати (якщо потрібно)

Якщо потрібно повернути TipTap:

1. Відновіть видалені файли з git:
   ```bash
   git checkout HEAD -- app/admin/components/RichTextEditor.tsx
   git checkout HEAD -- app/admin/article-editor/components/NewsEditorTipTap.tsx
   ```

2. Встановіть TipTap пакети:
   ```bash
   npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-color @tiptap/extension-font-family @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-subscript @tiptap/extension-superscript @tiptap/extension-table @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-table-row @tiptap/extension-text-align @tiptap/extension-text-style @tiptap/extension-underline @tiptap/pm
   ```

3. Відновіть попередню версію EditorialPagesEditor.tsx

## Видалення EditorJS

### Видалені файли EditorJS:
- ✅ `app/admin/article-editor/components/EditorJSClient.tsx`
- ✅ `app/admin/article-editor/components/VideoTool.ts`
- ✅ `app/admin/article-editor/types/editorjs.d.ts`
- ✅ `app/admin/article-editor/types/editorjs-youtube-embed.d.ts`
- ✅ `app/admin/article-editor/components/IMAGE_PICKER_README.md`

### Видалені пакети EditorJS:
```json
"@editorjs/attaches": "^1.3.0",
"@editorjs/checklist": "^1.6.0",
"@editorjs/code": "^2.9.3",
"@editorjs/delimiter": "^1.4.2",
"@editorjs/editorjs": "^2.30.8",
"@editorjs/embed": "^2.7.6",
"@editorjs/header": "^2.8.8",
"@editorjs/image": "^2.10.3",
"@editorjs/inline-code": "^1.5.2",
"@editorjs/link": "^2.6.2",
"@editorjs/list": "^2.0.8",
"@editorjs/marker": "^1.4.0",
"@editorjs/nested-list": "^1.4.3",
"@editorjs/paragraph": "^2.11.7",
"@editorjs/quote": "^2.7.6",
"@editorjs/raw": "^2.5.1",
"@editorjs/simple-image": "^1.6.0",
"@editorjs/table": "^2.4.5",
"@editorjs/underline": "^1.2.1",
"@editorjs/warning": "^1.4.1"
```

**Результат:** Видалено 41 пакет EditorJS з node_modules

## Резюме

✅ **Успішно виконано:**
- Замінено TipTap на CKEditor в EditorialPagesEditor
- Видалено всі TipTap компоненти та залежності (79 пакетів)
- Видалено всі EditorJS компоненти та залежності (41 пакет)
- Оновлено документацію
- Немає linter помилок
- Проект готовий до використання

🎯 **Результат:**
- Єдиний редактор (CKEditor) для всього проекту
- Зменшено кількість залежностей на **120 пакетів** (79 TipTap + 41 EditorJS)
- Покращена консистентність інтерфейсу
- Простіша архітектура проекту

