import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface TagByNameResponse {
  tag: {
    id: number;
    tag: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tagName: string }> }
) {
  try {
    const { tagName } = await params;
    
    // Декодуємо назву тегу з URL
    const decodedTagName = decodeURIComponent(tagName);
    
    // Знаходимо тег за назвою
    const [tagResult] = await executeQuery<{
      id: number;
      tag: string;
    }>(
      `SELECT id, tag 
       FROM a_tags 
       WHERE tag = ?`,
      [decodedTagName]
    );

    if (!tagResult || tagResult.length === 0) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    const tag = tagResult[0];

    const response: TagByNameResponse = {
      tag
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tag by name:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag by name' },
      { status: 500 }
    );
  }
}

