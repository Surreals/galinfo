import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Отримуємо поточний час сервера
    const now = new Date();
    
    // Форматуємо час для відображення
    const serverTime = now.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Також повертаємо timestamp для можливого використання
    const timestamp = Math.floor(now.getTime() / 1000);

    return NextResponse.json({
      serverTime,
      timestamp,
      isoString: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

  } catch (error) {
    console.error('Error getting server time:', error);
    return NextResponse.json(
      { error: 'Failed to get server time' },
      { status: 500 }
    );
  }
}
