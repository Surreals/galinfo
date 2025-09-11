import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface Language {
  id: string;
  title: string;
  code: string;
}

export async function GET() {
  try {
    // Завантажуємо мови з бази даних
    const languages = await executeQuery<Language>(`
      SELECT id, langtitle as title, lang as code
      FROM a_lang 
      WHERE isactive = 1
      ORDER BY langtitle
    `);

    return NextResponse.json({
      success: true,
      data: languages,
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}
