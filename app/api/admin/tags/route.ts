import { NextResponse } from 'next/server';

// Мокові дані тегів (в реальному проекті це буде з БД)
const TAGS = [
  { id: 1, tag: 'Львівщина' },
  { id: 2, tag: 'полювання' },
  { id: 3, tag: 'рибалка' },
  { id: 4, tag: 'природа' },
  { id: 5, tag: 'туризм' },
  { id: 6, tag: 'культура' },
  { id: 7, tag: 'історія' },
  { id: 8, tag: 'архітектура' },
  { id: 9, tag: 'події' },
  { id: 10, tag: 'новини' },
  { id: 11, tag: 'спорт' },
  { id: 12, tag: 'освіта' },
  { id: 13, tag: 'медицина' },
  { id: 14, tag: 'економіка' },
  { id: 15, tag: 'політика' },
  { id: 16, tag: 'війна' },
  { id: 17, tag: 'технології' },
  { id: 18, tag: 'наука' },
  { id: 19, tag: 'мистецтво' },
  { id: 20, tag: 'музика' },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: TAGS,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
