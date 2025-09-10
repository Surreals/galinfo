import { NextResponse } from 'next/server';

// Статичні типи статей (як в PHP коді)
const ARTICLE_TYPES = [
  { id: 1, name: 'Новина' },
  { id: 2, name: 'Стаття' },
  { id: 3, name: 'Фоторепортаж' },
  { id: 4, name: 'Відео' },
  { id: 20, name: 'Блог' },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: ARTICLE_TYPES,
    });
  } catch (error) {
    console.error('Error fetching article types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article types' },
      { status: 500 }
    );
  }
}
