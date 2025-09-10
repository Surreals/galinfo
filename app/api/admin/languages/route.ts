import { NextResponse } from 'next/server';

// Мокові дані мов (в реальному проекті це буде з БД)
const LANGUAGES = [
  { id: 'ua', title: 'Українська', code: 'uk' },
  { id: 'en', title: 'English', code: 'en' },
  { id: 'ru', title: 'Русский', code: 'ru' },
  { id: 'pl', title: 'Polski', code: 'pl' },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: LANGUAGES,
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}
