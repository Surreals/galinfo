import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, imageUrl } = await request.json();

    if (!chatId || !message) {
      return NextResponse.json(
        { message: 'Chat ID and message are required' },
        { status: 400 }
      );
    }

    // Get Telegram bot token from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '7741029792:AAEqlhh0DoA82L2dNNhyCM_RyjCBZq-eXpI';
    if (!botToken) {
      return NextResponse.json(
        { message: 'Telegram bot token not configured' },
        { status: 500 }
      );
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // Prepare the message payload
    const payload: any = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    };

    // If there's an image, send it as a photo with caption
    if (imageUrl) {
      const photoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${imageUrl}`;
      
      const photoPayload = {
        chat_id: chatId,
        photo: photoUrl,
        caption: message,
        parse_mode: 'HTML',
      };

      const photoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoPayload),
      });

      if (photoResponse.ok) {
        return NextResponse.json({ success: true, message: 'Message with image sent successfully' });
      } else {
        // If photo fails, fall back to text message
        console.warn('Failed to send photo, falling back to text message');
      }
    }

    // Send text message
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } else {
      return NextResponse.json(
        { message: `Telegram API error: ${result.description || 'Unknown error'}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Telegram send error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
