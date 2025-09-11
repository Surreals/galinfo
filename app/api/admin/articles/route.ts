import { NextRequest, NextResponse } from 'next/server';
import { createNews, getNewsById } from '@/app/lib/news';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Створюємо новину в БД
    const newId = await createNews(body);

    // Повертаємо створену новину
    const newArticle = await getNewsById(newId);

    return NextResponse.json({
      success: true,
      data: newArticle,
      message: 'Article created successfully',
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
