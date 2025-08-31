# Виправлення помилки компіляції Next.js 15

## Проблема
Помилка компіляції в файлі `app/category/[category]/page.tsx`:
```
Type error: Type 'CategoryPageProps' does not satisfy the constraint 'PageProps'.
Types of property 'params' are incompatible.
Type '{ category: string; }' is missing the following property...
```

## Причина
У Next.js 15 з App Router, параметри сторінки (`params` та `searchParams`) тепер є Promise'ами, а не звичайними об'єктами.

## Виправлення

### 1. Оновлено інтерфейс CategoryPageProps:
```typescript
interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}
```

### 2. Зроблено функцію асинхронною:
```typescript
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  // ... rest of the code
}
```

### 3. Додано перевірку існування параметра:
```typescript
if (!category) {
  return <div>Категорія не знайдена</div>;
}
```

## Результат
- ✅ TypeScript помилки усунено
- ✅ Код відповідає вимогам Next.js 15
- ✅ Додано захист від undefined параметрів

## Примітка
Для повної перевірки потрібна версія Node.js ^18.18.0 || ^19.8.0 || >= 20.0.0, оскільки поточна версія 16.13.1 не підтримується Next.js 15.
