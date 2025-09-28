import { NextRequest, NextResponse } from 'next/server';
import { telegramBot } from '@/app/lib/telegram-bot';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'info':
        const botInfo = await telegramBot.getBotInfo();
        return NextResponse.json(botInfo);
      
      case 'webhook-info':
        const webhookInfo = await telegramBot.getWebhookInfo();
        return NextResponse.json(webhookInfo);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: info, webhook-info' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Telegram bot API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, webhookUrl } = await request.json();

    switch (action) {
      case 'set-webhook':
        if (!webhookUrl) {
          return NextResponse.json(
            { error: 'Webhook URL is required' },
            { status: 400 }
          );
        }
        const setSuccess = await telegramBot.setWebhook(webhookUrl);
        return NextResponse.json({ 
          success: setSuccess,
          message: setSuccess ? 'Webhook set successfully' : 'Failed to set webhook'
        });
      
      case 'delete-webhook':
        const deleteSuccess = await telegramBot.deleteWebhook();
        return NextResponse.json({ 
          success: deleteSuccess,
          message: deleteSuccess ? 'Webhook deleted successfully' : 'Failed to delete webhook'
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: set-webhook, delete-webhook' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Telegram bot API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
