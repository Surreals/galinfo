import { NextRequest, NextResponse } from 'next/server';

// Мокові дані категорій (в реальному проекті це буде з БД)
const CATEGORIES = [
  // Рубрики (cattype: 1)
  { id: 1, title: 'Суспільство', cattype: 1, description: 'Суспільні новини' },
  { id: 2, title: 'Політика', cattype: 1, description: 'Політичні новини' },
  { id: 3, title: 'Економіка', cattype: 1, description: 'Економічні новини' },
  { id: 4, title: 'Культура', cattype: 1, description: 'Культурні новини' },
  { id: 5, title: 'Інтерв\'ю', cattype: 1, description: 'Інтерв\'ю' },
  { id: 6, title: 'Здоров\'я', cattype: 1, description: 'Медичні новини' },
  { id: 7, title: 'Війна з Росією', cattype: 1, description: 'Військові новини' },
  
  // Теми (cattype: 2)
  { id: 8, title: 'Освіта', cattype: 2, description: 'Освітні теми' },
  { id: 9, title: 'Спорт', cattype: 2, description: 'Спортивні теми' },
  { id: 10, title: 'Технології', cattype: 2, description: 'Технологічні теми' },
  { id: 11, title: 'Екологія', cattype: 2, description: 'Екологічні теми' },
  
  // Регіони (cattype: 3)
  { id: 12, title: 'Україна', cattype: 3, description: 'Новини України' },
  { id: 13, title: 'Львів', cattype: 3, description: 'Новини Львова' },
  { id: 14, title: 'Європа', cattype: 3, description: 'Європейські новини' },
  { id: 15, title: 'Світ', cattype: 3, description: 'Світові новини' },
  { id: 16, title: 'Волинь', cattype: 3, description: 'Новини Волині' },
  { id: 17, title: 'Київ', cattype: 3, description: 'Новини Києва' },
  { id: 18, title: 'Харків', cattype: 3, description: 'Новини Харкова' },
  
  // Рейтинги (cattype: 4)
  { id: 19, title: '5 зірок', cattype: 4, description: 'Найкращі статті' },
  { id: 20, title: '4 зірки', cattype: 4, description: 'Дуже хороші статті' },
  { id: 21, title: '3 зірки', cattype: 4, description: 'Хороші статті' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'ua';
    const cattype = searchParams.get('cattype');

    let filteredCategories = CATEGORIES;

    // Фільтруємо за типом категорії якщо вказано
    if (cattype) {
      const cattypeNum = parseInt(cattype);
      filteredCategories = CATEGORIES.filter(cat => cat.cattype === cattypeNum);
    }

    // Сортуємо за ID для консистентності
    filteredCategories.sort((a, b) => a.id - b.id);

    return NextResponse.json({
      success: true,
      data: filteredCategories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
