import { NextResponse } from 'next/server';

// Мокові дані користувачів (в реальному проекті це буде з БД)
const USERS = [
  // Редактори
  { id: 1, name: 'Христина Коновал', type: 'editor' as const },
  { id: 2, name: 'Олександр Петренко', type: 'editor' as const },
  { id: 3, name: 'Марія Іваненко', type: 'editor' as const },
  { id: 4, name: 'Володимир Коваленко', type: 'editor' as const },
  
  // Журналісти
  { id: 5, name: 'Анна Семенко', type: 'journalist' as const },
  { id: 6, name: 'Дмитро Левченко', type: 'journalist' as const },
  { id: 7, name: 'Оксана Мороз', type: 'journalist' as const },
  { id: 8, name: 'Ігор Шевченко', type: 'journalist' as const },
  { id: 9, name: 'Наталія Кравченко', type: 'journalist' as const },
  
  // Блогери
  { id: 10, name: 'Сергій Блогер', type: 'blogger' as const },
  { id: 11, name: 'Олена Автор', type: 'blogger' as const },
  { id: 12, name: 'Максим Письменник', type: 'blogger' as const },
  { id: 13, name: 'Тетяна Креатив', type: 'blogger' as const },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: USERS,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
