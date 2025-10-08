# 🚀 Швидкий довідник: Система ролей

## 📊 3 Ролі користувачів

| Роль         | Україномовна  | Кількість | Колір     |
| ------------ | ------------- | --------- | --------- |
| `admin`      | Адміністратор | 21        | 🔴 Red    |
| `editor`     | Редактор      | 9         | 🟠 Orange |
| `journalist` | Журналіст     | 0         | 🔵 Blue   |

---

## 🎯 Що бачить кожна роль

### Журналіст (Journalist)

```
✅ Новини / Статті (тільки чернетки)
✅ Галерея (фото)
✅ Відео
✅ Безпека (2FA)
```

### Редактор (Editor)

```
✅ Новини / Статті (з публікацією)
✅ Галерея (фото)
✅ Відео
✅ Безпека (2FA)
```

### Адміністратор (Admin)

```
✅ ВСІ РОЗДІЛИ (12 посилань в хедері)

📰 Новини / Статті
🖼️ Галерея (фото)
🎥 Відео
🏷️ Категорії
🔖 Теги
👥 Користувачі
📣 Реклама
💬 Telegram
📋 Шаблони
🔒 Безпека (2FA)
```

---

## ⚡ Швидкі команди

```bash
# Запустити dev
npm run dev

# Міграції (вже виконано)
npm run migrate:fix-roles
npm run migrate:convert-roles
npm run migrate:assign-roles -- --yes
```

---

## 🧪 Швидке тестування

1. **Очистіть кеш:** Ctrl+Shift+R (Win) або Cmd+Shift+R (Mac)
2. **Увійдіть як редактор:** Login: `editoranna`
3. **Перевірте меню:** Повинні бачити тільки 4 пункти

---

## 🔑 Зміна ролей

### Через UI (рекомендовано)

1. Увійти як `admin`
2. Перейти в `/admin/users`
3. Редагувати користувача
4. Вибрати роль з dropdown
5. Зберегти

### Через SQL

```sql
-- Зробити редактором
UPDATE a_powerusers SET role = 'editor' WHERE uname = 'username';

-- Зробити журналістом
UPDATE a_powerusers SET role = 'journalist' WHERE uname = 'username';

-- Зробити адміністратором
UPDATE a_powerusers SET role = 'admin' WHERE uname = 'username';
```

---

## 📚 Документація

- **Повна документація:** [docs/ROLE_BASED_ACCESS_CONTROL.md](docs/ROLE_BASED_ACCESS_CONTROL.md)
- **Всі зміни:** [FINAL_SUMMARY.md](FINAL_SUMMARY.md)
- **Результати міграції:** [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)

---

## ⚠️ Важливо

1. **Адмін не може змінити свою роль** ✅
2. **Очистіть кеш після оновлення** ⚠️
3. **Вийдіть та увійдіть знову** ⚠️

---

**Готово! 🎉**
