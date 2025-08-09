# Assets

Ця папка містить всі статичні ресурси проекту: логотипи, зображення та іконки.

## Структура папок

```
assets/
├── logos/          # Логотипи та брендинг
├── images/         # Зображення (фото, ілюстрації, баннери)
├── icons/          # Іконки та SVG елементи
└── README.md       # Цей файл
```

## Використання

### Імпорт в React компонентах

```jsx
// Для зображень
import logo from '@/assets/logos/logo.png';
import banner from '@/assets/images/banner.jpg';

// Для SVG іконок
import { ReactComponent as Icon } from '@/assets/icons/icon.svg';
```

### Використання в CSS

```css
.background {
  background-image: url('/assets/images/background.jpg');
}
```

## Формати файлів

- **Логотипи**: PNG, SVG, JPG
- **Зображення**: JPG, PNG, WebP
- **Іконки**: SVG, PNG

## Рекомендації

1. Використовуйте описові назви файлів
2. Оптимізуйте зображення перед додаванням
3. Для іконок віддавайте перевагу SVG формату
4. Зберігайте оригінальні файли в високій якості 