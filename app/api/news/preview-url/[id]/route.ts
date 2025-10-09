import { NextRequest, NextResponse } from 'next/server';
import { generatePreviewUrl } from '@/app/lib/previewToken';

/**
 * API endpoint для генерації preview URL
 * GET /api/news/preview-url/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsId = parseInt(id);

    // Валідація ID
    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    // Отримуємо base URL з заголовків запиту
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Генеруємо preview URL
    const previewUrl = generatePreviewUrl(newsId, baseUrl);

    return NextResponse.json({
      previewUrl,
      newsId,
    });

  } catch (error) {
    console.error('Error generating preview URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview URL' },
      { status: 500 }
    );
  }
}

