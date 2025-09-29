import { NextRequest, NextResponse } from 'next/server';
import { telegramBot } from '@/app/lib/telegram-bot';

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, imageUrl, parseMode } = await request.json();

    // Validate required fields
    if (!chatId || !message) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Chat ID та повідомлення є обов\'язковими' 
        },
        { status: 400 }
      );
    }

    // Prepare message data
    const messageData = {
      chatId,
      message,
      imageUrl: imageUrl || undefined,
      parseMode: parseMode || 'HTML'
    };

    // Send message with or without photo
    const result = await telegramBot.sendMessageWithPhoto(messageData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Повідомлення успішно відправлено в Telegram'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || 'Не вдалося відправити повідомлення в Telegram'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Помилка сервера при відправці повідомлення'
      },
      { status: 500 }
    );
  }
}