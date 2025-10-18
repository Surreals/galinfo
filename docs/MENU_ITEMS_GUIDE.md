# Гайд: Додавання "Новини" та "Статті" в меню Header і Footer

## Огляд

Тепер ви можете додавати додаткові пункти меню (такі як **"Новини"**, **"Статті"**, **"Архів"**) безпосередньо в масив `categoryIds` разом із звичайними категоріями!

## Як це працює? 🔥

Просто додайте **рядок** (string) замість числа (ID категорії) в масив `categoryIds`:

```json
{
  "categoryIds": [7, 99, "news", "articles", 110]
}
```

Де:
- `7, 99, 110` - це **числа** (ID категорій)
- `"news", "articles"` - це **рядки** (параметри додаткових елементів)

## Доступні додаткові елементи

| Параметр (string) | Назва | Посилання |
|------------------|-------|-----------|
| `"news"` | Новини | `/news` |
| `"articles"` | Статті | `/articles` |
| `"archive"` | Архів | `/archive/` |
| `"about"` | Агенція | `/about/` |
| `"commercial"` | Реклама | `/commercial/` |

## Приклади використання

### Приклад 1: Додати "Новини" на початок першої колонки

```json
{
  "moreNewsDropdown": {
    "categories": {
      "column1": {
        "categoryIds": ["news", 7, 99, 110, 111, 118]
      }
    }
  }
}
```

Результат:
```
НОВИНИ          ← додатковий елемент
УКРАЇНА         ← категорія (ID: 7)
ЛЬВІВ           ← категорія (ID: 99)
ЄВРОПА          ← категорія (ID: 110)
```

### Приклад 2: Додати "Новини" та "Статті" в кінець другої колонки

```json
{
  "moreNewsDropdown": {
    "categories": {
      "column2": {
        "categoryIds": [4, 2, 3, 5, 101, "news", "articles"]
      }
    }
  }
}
```

Результат:
```
СУСПІЛЬСТВО     ← категорія (ID: 4)
ПОЛІТИКА        ← категорія (ID: 2)
ЕКОНОМІКА       ← категорія (ID: 3)
КУЛЬТУРА        ← категорія (ID: 5)
ЗДОРОВ'Я        ← категорія (ID: 101)
НОВИНИ          ← додатковий елемент
СТАТТІ          ← додатковий елемент
```

### Приклад 3: Мішати категорії та додаткові елементи

```json
{
  "categories": {
    "column4": {
      "categoryIds": [109, "news", 103, "articles", 100],
      "maxItems": 5
    }
  }
}
```

Результат:
```
ВІЙНА З РОСІЄЮ  ← категорія (ID: 109)
НОВИНИ          ← додатковий елемент
СПОРТ           ← категорія (ID: 103)
СТАТТІ          ← додатковий елемент
КРИМІНАЛ        ← категорія (ID: 100)
```

### Приклад 4: Тільки додаткові елементи (без категорій)

```json
{
  "categories": {
    "column4": {
      "categoryIds": ["news", "articles", "archive", "about"]
    }
  }
}
```

## Налаштування через Адмін Панель

1. Зайдіть в **Адмін панель → Шаблони**
2. Виберіть **Header** або **Footer**
3. У JSON редакторі знайдіть потрібну колонку
4. Додайте рядкові значення в масив `categoryIds`:

```json
{
  "column1": {
    "categoryIds": [7, "news", 99, "articles", 110]
  }
}
```

5. Збережіть зміни

## Важливі моменти ⚠️

1. **Використовуйте лапки для рядків!**
   - ✅ Правильно: `"news"`, `"articles"`
   - ❌ Неправильно: `news`, `articles` (без лапок)

2. **ID категорій - без лапок**
   - ✅ Правильно: `7`, `99`, `110`
   - ❌ Неправильно: `"7"`, `"99"`, `"110"`

3. **Порядок має значення**
   - Елементи відображаються в тому порядку, в якому ви їх вказали в масиві

4. **maxItems застосовується до всього списку**
   - Якщо ви вказали `maxItems: 5`, буде показано перші 5 елементів (незалежно від того, категорії це чи додаткові елементи)

## Повна конфігурація Header

```json
{
  "mainNavigation": {
    "categoryIds": [4, 2, 3, 5, 101, 109, 103, 100],
    "maxItems": 8
  },
  "moreNewsDropdown": {
    "topThemes": {
      "enabled": true,
      "categoryIds": [136, 140, 142]
    },
    "categories": {
      "enabled": true,
      "column1": {
        "categoryIds": [7, 99, 110, 111, 118]
      },
      "column2": {
        "categoryIds": [4, 2, 3, 5, 101]
      },
      "column3": {
        "categoryIds": [109, 103, 100, 106]
      },
      "column4": {
        "categoryIds": ["news", "articles"]
      }
    }
  },
  "mobileMenu": {
    "topThemes": {
      "enabled": true,
      "categoryIds": [136, 140, 142]
    },
    "categories": {
      "enabled": true,
      "categoryIds": [7, 99, 110, 111, 118, 4, 2, 3, 5, 101, 109, 103, 100, 106]
    }
  }
}
```

## Повна конфігурація Footer

```json
{
  "agency": {
    "enabled": true
  },
  "topThemes": {
    "enabled": true,
    "categoryIds": [136, 140, 142]
  },
  "categories": {
    "enabled": true,
    "column1": {
      "categoryIds": [7, 99, 110, 111, 118]
    },
    "column2": {
      "categoryIds": [4, 2, 3, 5, 101],
      "maxItems": 5
    },
    "column3": {
      "categoryIds": [109, 103, 100, 106],
      "maxItems": 4
    },
    "column4": {
      "categoryIds": ["news", "articles"],
      "maxItems": 2
    }
  },
  "bottomSection": {
    "logo": { "enabled": true },
    "copyright": { "enabled": true },
    "socialLinks": {
      "enabled": true,
      "facebook": true,
      "twitter": true,
      "instagram": true,
      "rss": true
    },
    "siteCreator": { "enabled": true }
  }
}
```

## Додавання нових додаткових елементів

Якщо вам потрібно додати новий елемент (наприклад, "Контакти"):

1. Відкрийте `/app/api/homepage/services/menuService.ts`
2. Додайте новий елемент у масив `additionalItems`:

```typescript
const additionalItems: MenuItem[] = [
  // ... існуючі елементи
  {
    id: 0,
    param: 'contacts',
    title: 'Контакти',
    link: '/contacts/',
    cattype: 0
  }
];
```

3. Тепер можете використовувати `"contacts"` у конфігурації:

```json
{
  "categoryIds": [7, 99, "contacts", 110]
}
```

## Технічні деталі

### Як це працює під капотом

Функція `getCategoriesByIds` перевіряє тип кожного елемента:

```typescript
categoryIds.forEach(id => {
  if (typeof id === 'string') {
    // Шукаємо серед additionalItems за param
    const additionalItem = additionalItems.find(item => item.param === id);
  } else {
    // Шукаємо категорію за ID
    const category = mainCategories.find(cat => cat.id === id) || ...
  }
});
```

### TypeScript тип

```typescript
interface HeaderSettings {
  moreNewsDropdown: {
    categories: {
      column1: {
        categoryIds: (number | string)[];  // Може бути число або рядок!
      };
      // ...
    };
  };
}
```

## Підтримка

Якщо у вас виникли питання:
- Перегляньте `/docs/HEADER_FOOTER_TEMPLATES_README.md` для загальної інформації
- Зверніться до розробників

---

**Автор:** BYTCD TEAM  
**Дата:** 2025  
**Версія:** 2.0

