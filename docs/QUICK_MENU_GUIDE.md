# Швидкий гайд: Додавання "Новини" та "Статті"

## Як додати "Новини" або "Статті" в меню? 🚀

Просто додайте **рядок** в масив `categoryIds`:

```json
{
  "categoryIds": [7, 99, "news", "articles", 110]
}
```

## Доступні елементи

- `"news"` → Новини
- `"articles"` → Статті  
- `"archive"` → Архів
- `"about"` → Агенція
- `"commercial"` → Реклама

## Приклади

### В Header (випадаюче меню)

```json
{
  "moreNewsDropdown": {
    "categories": {
      "column1": {
        "categoryIds": ["news", 7, 99, 110]
      }
    }
  }
}
```

### В Footer

```json
{
  "categories": {
    "column2": {
      "categoryIds": [4, 2, 3, "articles", 5]
    }
  }
}
```

### Мішати категорії та елементи

```json
{
  "categoryIds": [109, "news", 103, "articles", 100]
}
```

## Важливо! ⚠️

1. **Рядки - в лапках:** `"news"`, `"articles"`
2. **Числа - без лапок:** `7`, `99`, `110`
3. Порядок в масиві = порядок на сайті

## Де налаштувати?

**Адмін панель → Шаблони → Header/Footer**

---

Детальна інформація: [MENU_ITEMS_GUIDE.md](./MENU_ITEMS_GUIDE.md)

