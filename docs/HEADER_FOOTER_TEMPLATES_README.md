# Налаштування хедера та футера через шаблони

## Огляд

Додано функціонал керування порядком та відображенням категорій у хедері та футері сайту через адмін-панель.

## Нові шаблони

### 1. Налаштування хедера (`header`)

Контролює:
- Порядок категорій в головній навігації
- Структуру випадаючого меню "БІЛЬШЕ НОВИН..."
- Блоки "ТОП ТЕМИ" та "КАТЕГОРІЇ"
- Мобільне меню

**Структура схеми:**

```javascript
{
  // Головне меню (навігаційна панель)
  mainNavigation: {
    categoryIds: [],      // Масив ID категорій для відображення
    maxItems: 8           // Максимальна кількість елементів
  },

  // Випадаюче меню "БІЛЬШЕ НОВИН..."
  moreNewsDropdown: {
    topThemes: {
      enabled: true,
      categoryIds: []     // ID спеціальних тем (cattype = 2)
    },
    categories: {
      enabled: true,
      column1: {
        type: 'regions',
        categoryIds: []   // ID регіонів (cattype = 3)
      },
      column2: {
        type: 'mainCategories',
        categoryIds: []   // ID основних категорій (cattype = 1)
      },
      column3: {
        type: 'mainCategories',
        categoryIds: []   // ID основних категорій
      },
      column4: {
        type: 'additional',
        items: []         // param з additionalItems (наприклад: ['news', 'article'])
      }
    }
  },

  // Мобільне меню
  mobileMenu: {
    topThemes: {
      enabled: true,
      categoryIds: []
    },
    categories: {
      enabled: true,
      regionIds: [],
      mainCategoryIds: []
    }
  }
}
```

### 2. Налаштування футера (`footer`)

Контролює:
- Блок "ТОП ТЕМИ"
- Блоки категорій у 4 колонки
- Соціальні мережі та нижню секцію

**Структура схеми:**

```javascript
{
  // Блок "АГЕНЦІЯ" (статичні посилання)
  agency: {
    enabled: true
  },

  // Блок "ТОП ТЕМИ"
  topThemes: {
    enabled: true,
    categoryIds: []     // ID спеціальних тем (cattype = 2)
  },

  // Блок "КАТЕГОРІЇ"
  categories: {
    enabled: true,
    column1: {
      type: 'regions',
      categoryIds: []   // ID регіонів (cattype = 3)
    },
    column2: {
      type: 'mainCategories',
      categoryIds: [],
      maxItems: 5
    },
    column3: {
      type: 'mainCategories',
      categoryIds: []
    },
    column4: {
      type: 'additional',
      items: [],        // param з additionalItems
      maxItems: 2
    }
  },

  // Нижня секція
  bottomSection: {
    logo: { enabled: true },
    copyright: { enabled: true },
    socialLinks: {
      enabled: true,
      facebook: true,
      twitter: true,
      instagram: true,
      rss: true
    },
    siteCreator: { enabled: true }
  }
}
```

## Як використовувати

### 1. Відкрийте сторінку шаблонів

Перейдіть до: `http://localhost:3000/admin/templates`

### 2. Знайдіть шаблони "Налаштування хедера" та "Налаштування футера"

На сторінці будуть доступні нові блоки з шаблонами для хедера та футера.

### 3. Дізнайтеся ID категорій

Натисніть кнопку **"📋 Довідник категорій"** у правому верхньому куті, щоб побачити всі доступні категорії та їх ID.

Категорії поділяються на:
- **ID: 0** - Всі новини (спеціальна категорія)
- **cattype = 1** - Основні категорії (Суспільство, Політика, Економіка, тощо)
- **cattype = 2** - Спеціальні теми (Відверта розмова, Райони Львова, тощо)
- **cattype = 3** - Регіони (Львівщина, Тернопільщина, Волинь, тощо)

### 4. Редагуйте JSON схему

#### Приклад налаштування хедера:

```json
{
  "mainNavigation": {
    "categoryIds": [1, 2, 3, 4, 5, 6, 7, 8],
    "maxItems": 8
  },
  "moreNewsDropdown": {
    "topThemes": {
      "enabled": true,
      "categoryIds": [101, 102, 103]
    },
    "categories": {
      "enabled": true,
      "column1": {
        "type": "regions",
        "categoryIds": [201, 202, 203, 204, 205, 206]
      },
      "column2": {
        "type": "mainCategories",
        "categoryIds": [1, 2, 3, 4, 5]
      },
      "column3": {
        "type": "mainCategories",
        "categoryIds": [6, 7, 8, 9, 10]
      },
      "column4": {
        "type": "additional",
        "items": ["news", "article"]
      }
    }
  },
  "mobileMenu": {
    "topThemes": {
      "enabled": true,
      "categoryIds": [101, 102, 103]
    },
    "categories": {
      "enabled": true,
      "regionIds": [201, 202, 203],
      "mainCategoryIds": [1, 2, 3, 4, 5, 6, 7, 8]
    }
  }
}
```

#### Приклад налаштування футера (відповідно до скріншота):

```json
{
  "agency": {
    "enabled": true
  },
  "topThemes": {
    "enabled": true,
    "categoryIds": [101, 102, 103]
  },
  "categories": {
    "enabled": true,
    "column1": {
      "type": "regions",
      "categoryIds": [ukraine_id, lviv_id, europe_id, world_id, volyn_id]
    },
    "column2": {
      "type": "mainCategories",
      "categoryIds": [society_id, politics_id, economy_id, culture_id, health_id],
      "maxItems": 5
    },
    "column3": {
      "type": "mainCategories",
      "categoryIds": [war_id, sport_id, crime_id, emergency_id],
      "maxItems": 4
    },
    "column4": {
      "type": "additional",
      "items": ["news", "article"],
      "maxItems": 2
    }
  },
  "bottomSection": {
    "logo": {
      "enabled": true
    },
    "copyright": {
      "enabled": true
    },
    "socialLinks": {
      "enabled": true,
      "facebook": true,
      "twitter": true,
      "instagram": true,
      "rss": true
    },
    "siteCreator": {
      "enabled": true
    }
  }
}
```

**Порядок категорій згідно зі скріншотом:**

- **column1** (Регіони): УКРАЇНА → ЛЬВІВ → ЄВРОПА → СВІТ → ВОЛИНЬ
- **column2** (Основні теми): СУСПІЛЬСТВО → ПОЛІТИКА → ЕКОНОМІКА → КУЛЬТУРА → ЗДОРОВ'Я  
- **column3** (Додаткові теми, макс. 4): ВІЙНА З РОСІЄЮ → СПОРТ → КРИМІНАЛ → НАДЗВИЧАЙНІ ПОДІЇ
- **column4** (Типи контенту): НОВИНИ → СТАТТІ

### 5. Збережіть зміни

Натисніть кнопку **"Зберегти"** для застосування налаштувань.

### 6. Перегляньте результат

Перейдіть на головну сторінку сайту, щоб побачити оновлений хедер та футер з вашими налаштуваннями.

## Технічна інформація

### Створені файли:

1. `/app/lib/headerSchema.js` - Дефолтна схема для хедера
2. `/app/lib/footerSchema.js` - Дефолтна схема для футера
3. `/app/hooks/useHeaderSettings.ts` - Хук для завантаження налаштувань хедера
4. `/app/hooks/useFooterSettings.ts` - Хук для завантаження налаштувань футера

### Оновлені файли:

1. `/app/header/Header.tsx` - Адаптовано під налаштування з БД
2. `/app/footer/Footer.tsx` - Адаптовано під налаштування з БД
3. `/app/admin/templates/page.tsx` - Додано нові шаблони
4. `/app/admin/templates/documentation.ts` - Додано документацію
5. `/app/api/admin/templates/route.ts` - Додано імпорти нових схем

### Як працює:

1. Налаштування зберігаються в таблиці `template_schemas` з `template_id` = `'header'` або `'footer'`
2. Компоненти Header і Footer використовують хуки `useHeaderSettings` та `useFooterSettings`
3. Хуки завантажують налаштування з API `/api/admin/templates`
4. Категорії впорядковуються відповідно до масивів `categoryIds` у налаштуваннях
5. Якщо масив `categoryIds` порожній, використовуються всі доступні категорії
6. Підтримується fallback на дефолтні схеми при помилках завантаження

## Поради

1. **Порожні масиви `categoryIds`**: Якщо залишити масив порожнім, відобразяться всі доступні категорії в порядку з бази даних.

2. **Вимкнення блоків**: Встановіть `enabled: false` для блоку, щоб приховати його.

3. **Порядок важливий**: Категорії відображаються в тому порядку, в якому їх ID вказані в масиві.

4. **Перевірка JSON**: Редактор автоматично валідує JSON. Помилки відображаються червоним кольором.

5. **Відновлення дефолтних значень**: Кнопка "Відновити дефолт" скине налаштування до початкових значень.

## Приклади використання

### Показати тільки 5 категорій в головному меню:

```json
{
  "mainNavigation": {
    "categoryIds": [1, 2, 3, 4, 5],
    "maxItems": 5
  }
}
```

### Приховати блок "ТОП ТЕМИ" в футері:

```json
{
  "topThemes": {
    "enabled": false,
    "categoryIds": []
  }
}
```

### Змінити порядок регіонів:

```json
{
  "categories": {
    "column1": {
      "type": "regions",
      "categoryIds": [206, 205, 204, 203, 202, 201]
    }
  }
}
```

### Показати тільки Facebook та Instagram:

```json
{
  "bottomSection": {
    "socialLinks": {
      "enabled": true,
      "facebook": true,
      "twitter": false,
      "instagram": true,
      "rss": false
    }
  }
}
```
