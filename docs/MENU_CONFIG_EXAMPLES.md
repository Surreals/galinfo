# Приклади конфігурацій меню

## Приклад 1: Новини на початку першої колонки

### Header
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

### Footer
```json
{
  "categories": {
    "column1": {
      "categoryIds": ["news", 7, 99, 110, 111, 118]
    }
  }
}
```

**Результат:**
```
НОВИНИ
УКРАЇНА
ЛЬВІВ
ЄВРОПА
СВІТ
ВОЛИНЬ
```

---

## Приклад 2: Новини і Статті в кінці колонки

### Header
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

### Footer
```json
{
  "categories": {
    "column2": {
      "categoryIds": [4, 2, 3, 5, 101, "news", "articles"],
      "maxItems": 7
    }
  }
}
```

**Результат:**
```
СУСПІЛЬСТВО
ПОЛІТИКА
ЕКОНОМІКА
КУЛЬТУРА
ЗДОРОВ'Я
НОВИНИ
СТАТТІ
```

---

## Приклад 3: Чергування категорій і додаткових елементів

### Header
```json
{
  "moreNewsDropdown": {
    "categories": {
      "column4": {
        "categoryIds": [109, "news", 103, "articles", 100]
      }
    }
  }
}
```

### Footer
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

**Результат:**
```
ВІЙНА З РОСІЄЮ
НОВИНИ
СПОРТ
СТАТТІ
КРИМІНАЛ
```

---

## Приклад 4: Всі додаткові елементи

### Header
```json
{
  "moreNewsDropdown": {
    "categories": {
      "column4": {
        "categoryIds": ["news", "articles", "archive", "about", "commercial"]
      }
    }
  }
}
```

### Footer
```json
{
  "categories": {
    "column4": {
      "categoryIds": ["news", "articles", "archive"],
      "maxItems": 3
    }
  }
}
```

**Результат:**
```
НОВИНИ
СТАТТІ
АРХІВ
```

---

## Приклад 5: Додаткові елементи в усіх колонках

### Header
```json
{
  "moreNewsDropdown": {
    "categories": {
      "column1": {
        "categoryIds": ["news", 7, 99, 110]
      },
      "column2": {
        "categoryIds": [4, "articles", 2, 3]
      },
      "column3": {
        "categoryIds": [109, 103, "archive"]
      },
      "column4": {
        "categoryIds": ["about", "commercial"]
      }
    }
  }
}
```

### Footer
```json
{
  "categories": {
    "column1": {
      "categoryIds": ["news", 7, 99]
    },
    "column2": {
      "categoryIds": [4, 2, "articles"],
      "maxItems": 3
    },
    "column3": {
      "categoryIds": [109, "archive"],
      "maxItems": 2
    },
    "column4": {
      "categoryIds": ["about", "commercial"],
      "maxItems": 2
    }
  }
}
```

---

## Приклад 6: Тільки категорії (без додаткових елементів)

### Header
```json
{
  "moreNewsDropdown": {
    "categories": {
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
        "categoryIds": []
      }
    }
  }
}
```

---

## Приклад 7: Повна конфігурація Header

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
        "categoryIds": ["news", 7, 99, 110, 111, 118]
      },
      "column2": {
        "categoryIds": [4, 2, 3, 5, 101, "articles"]
      },
      "column3": {
        "categoryIds": [109, 103, 100, 106]
      },
      "column4": {
        "categoryIds": ["archive", "about"]
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
      "categoryIds": ["news", 7, 99, 110, "articles", 4, 2, 3, 109, 103]
    }
  }
}
```

---

## Приклад 8: Повна конфігурація Footer

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
      "categoryIds": ["news", 7, 99, 110, 111, 118]
    },
    "column2": {
      "categoryIds": [4, 2, 3, "articles", 5, 101],
      "maxItems": 6
    },
    "column3": {
      "categoryIds": [109, 103, 100, 106],
      "maxItems": 4
    },
    "column4": {
      "categoryIds": ["archive", "about"],
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

---

## Тестування

Щоб протестувати:

1. Зайдіть в **Адмін панель → Шаблони**
2. Виберіть **Header** або **Footer**
3. Скопіюйте один з прикладів вище
4. Збережіть
5. Перевірте на сайті

---

## Доступні додаткові елементи

| Параметр | Назва | URL |
|----------|-------|-----|
| `"news"` | Новини | /news |
| `"articles"` | Статті | /articles |
| `"archive"` | Архів | /archive/ |
| `"about"` | Агенція | /about/ |
| `"commercial"` | Реклама | /commercial/ |

