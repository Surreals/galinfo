import { NextRequest, NextResponse } from 'next/server';
import { telegramBot } from '@/app/lib/telegram-bot';

export async function POST(request: NextRequest) {
  try {
    const { 
      articleId, 
      channels, 
      customMessage,
      publishImmediately = false 
    } = await request.json();

    // Validate required fields
    if (!articleId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'ID статті є обов\'язковим' 
        },
        { status: 400 }
      );
    }

    // Get article data from database
    // This would typically fetch from your database
    const articleData = await getArticleData(articleId);
    
    if (!articleData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Статтю не знайдено'
        },
        { status: 404 }
      );
    }

    // Generate message content
    const message = customMessage || generateNewsMessage(articleData);
    const imageUrl = articleData.images ? generateImageUrl(articleData.images) : undefined;

    // If no specific channels provided, get default channels
    const targetChannels = channels || await getDefaultChannels();

    if (targetChannels.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Не налаштовано каналів для публікації'
        },
        { status: 400 }
      );
    }

    // Send to all channels
    const results = [];
    for (const channel of targetChannels) {
      try {
        const result = await telegramBot.sendMessageWithPhoto({
          chatId: channel.chatId,
          message: message,
          imageUrl: imageUrl,
          parseMode: 'HTML'
        });

        results.push({
          channel: channel.name,
          success: result.success,
          error: result.success ? null : result.error || 'Failed to send message'
        });
      } catch (error) {
        results.push({
          channel: channel.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Повідомлення відправлено в ${successCount} з ${totalCount} каналів`,
      results: results
    });

  } catch (error) {
    console.error('Error publishing news to Telegram:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Помилка сервера при публікації новин'
      },
      { status: 500 }
    );
  }
}

// Helper function to get article data
async function getArticleData(articleId: string) {
  // This should be replaced with actual database query
  // For now, return mock data structure
  return {
    id: articleId,
    nheader: 'Заголовок новини',
    nteaser: 'Короткий опис новини',
    nbody: 'Повний текст новини...',
    images: 'news-image.jpg',
    url_key: 'news-url-key',
    created_at: new Date().toISOString()
  };
}

// Helper function to generate news message
function generateNewsMessage(articleData: any): string {
  let message = `📰 <b>${articleData.nheader || 'Нова новина'}</b>\n\n`;
  
  if (articleData.nteaser) {
    message += `${articleData.nteaser}\n\n`;
  }
  
  if (articleData.nbody) {
    // Remove HTML tags and limit length
    const cleanBody = articleData.nbody.replace(/<[^>]*>/g, '').substring(0, 500);
    message += `${cleanBody}${cleanBody.length >= 500 ? '...' : ''}\n\n`;
  }
  
  // Add link to full article
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  message += `🔗 <a href="${baseUrl}/articles/${articleData.url_key}">Читати повну версію</a>\n\n`;
  
  message += `#новини #галінфо`;
  
  return message;
}

// Helper function to generate image URL
function generateImageUrl(imageName: string): string {
  if (!imageName) return '';
  const firstChar = imageName.charAt(0);
  const secondChar = imageName.charAt(1);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/images/${firstChar}/${secondChar}/${imageName}`;
}

// Helper function to get default channels
async function getDefaultChannels() {
  // This should be replaced with actual database query or configuration
  // For now, return empty array - channels should be managed through the UI
  return [];
}
