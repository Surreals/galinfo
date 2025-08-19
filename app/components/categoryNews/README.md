# CategoryNews Component

Компонент для відображення новин по категоріях з підтримкою різних layout'ів для мобільних пристроїв.

## Props

- `category` - назва категорії (за замовчуванням: "КУЛЬТУРА")
- `news` - масив новин
- `isLoading` - стан завантаження
- `hideHeader` - приховати заголовок секції
- `className` - додатковий CSS клас
- `height` - висота зображень для desktop
- `mobileLayout` - тип layout'у для мобільних пристроїв:
  - `'column'` (за замовчуванням) - по дві новини в рядок з квадратними фото
  - `'horizontal'` - горизонтальний скрол з прямокутними фото

## Приклади використання

### Column Layout (за замовчуванням)
```tsx
<CategoryNews 
  category="ПОЛІТИКА" 
  news={newsData}
  mobileLayout="column"
/>
```

### Horizontal Layout
```tsx
<CategoryNews 
  category="ЕКОНОМІКА" 
  news={newsData}
  mobileLayout="horizontal"
/>
```

## Мобільне відображення

### Column Layout
- По дві новини в рядок
- Квадратні фото (aspect-ratio: 1)
- Адаптивна сітка з gap: 16px (1000px) та 12px (480px)

### Horizontal Layout
- Горизонтальний скрол
- Прямокутні фото (300x200px)
- Touch-friendly скрол з snap points

## Responsive Breakpoints

- **Desktop (>1000px)**: 4 колонки
- **Tablet (≤1000px)**: 2 колонки для column, горизонтальний скрол для horizontal
- **Mobile (≤480px)**: 2 колонки для column, горизонтальний скрол для horizontal
