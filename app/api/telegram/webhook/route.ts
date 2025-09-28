import { NextRequest, NextResponse } from 'next/server';
import { telegramBot } from '@/app/lib/telegram-bot';

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Process the webhook update
    await telegramBot.processWebhookUpdate(update);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return webhook info for debugging
    const webhookInfo = await telegramBot.getWebhookInfo();
    return NextResponse.json(webhookInfo);
  } catch (error) {
    console.error('Error getting webhook info:', error);
    return NextResponse.json(
      { error: 'Failed to get webhook info' },
      { status: 500 }
    );
  }
}
