# Mobile Context - Глобальний доступ до isMobile

## Опис

Ми створили глобальний контекст `MobileContext`, який дозволяє всім компонентам в додатку мати доступ до `isMobile` значення без необхідності імпортувати та використовувати хук `useIsMobile` в кожному компоненті окремо.

## Структура

### 1. MobileContext (`app/contexts/MobileContext.tsx`)
- Створює React Context для `isMobile` значення
- Надає `MobileProvider` компонент
- Експортує `useMobileContext` хук для використання

### 2. Layout (`app/layout.tsx`)
- Обгортає всі children в `MobileProvider`
- Тепер всі компоненти мають доступ до `isMobile` контексту

### 3. Тестовий компонент (`app/components/TestMobileContext.tsx`)
- Демонструє використання нового контексту
- Показує поточний стан `isMobile` та ширину екрану

## Використання

### Замість старого способу:
```tsx
import { useIsMobile } from "@/app/hooks/useIsMobile";

export default function MyComponent() {
  const isMobile = useIsMobile();
  // ...
}
```

### Використовуйте новий спосіб:
```tsx
import { useMobileContext } from "@/app/contexts/MobileContext";

export default function MyComponent() {
  const { isMobile } = useMobileContext();
  // ...
}
```

## Переваги

1. **Глобальний доступ**: Всі компоненти автоматично мають доступ до `isMobile`
2. **Краща продуктивність**: Хук `useIsMobile` викликається тільки один раз в layout
3. **Чистіший код**: Не потрібно імпортувати хук в кожному компоненті
4. **Централізоване управління**: Всі зміни в логіці визначення мобільного пристрою робляться в одному місці

## Вже оновлені компоненти

- ✅ `app/page.tsx` (HomePage)
- ✅ `app/category/[category]/CategoryPageClient.tsx`
- ✅ `app/article/[id]/ArticlePageClient.tsx`
- ✅ `app/components/TestMobileContext.tsx` (новий тестовий компонент)

## Приклад використання в новому компоненті

```tsx
'use client';

import { useMobileContext } from "@/app/contexts/MobileContext";

export default function NewComponent() {
  const { isMobile } = useMobileContext();
  
  return (
    <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
      {isMobile ? "Мобільна версія" : "Десктопна версія"}
    </div>
  );
}
```

## Тестування

Для тестування нового контексту можете використати компонент `TestMobileContext`:

```tsx
import { TestMobileContext } from "@/app/components/TestMobileContext";

// В будь-якому компоненті
<TestMobileContext />
```

## Технічні деталі

- Контекст використовує `'use client'` директиву
- `isMobile` значення оновлюється автоматично при зміні розміру вікна
- Контекст надає типізацію TypeScript
- Помилка викидається, якщо компонент використовується поза `MobileProvider`
- Breakpoint для мобільного пристрою: ≤ 768px
