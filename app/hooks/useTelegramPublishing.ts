import { useState } from 'react';

interface TelegramChannel {
  id: string;
  name: string;
  type: 'channel' | 'group' | 'private';
  chatId: string;
  isActive: boolean;
}

interface PublishResult {
  channel: string;
  success: boolean;
  error?: string;
}

export function useTelegramPublishing() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PublishResult[]>([]);

  const publishToTelegram = async (articleData: any, channels?: TelegramChannel[]) => {
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('/api/admin/publish-news-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: articleData.id,
          channels: channels?.map(ch => ({ chatId: ch.chatId, name: ch.name })),
          publishImmediately: true
        }),
      });

      const result = await response.json();
      setResults(result.results || []);

      return result;
    } catch (error) {
      console.error('Error publishing to Telegram:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getChannels = async () => {
    try {
      const response = await fetch('/api/admin/telegram-channels');
      const data = await response.json();
      return data.channels || [];
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  };

  const testChannel = async (channel: TelegramChannel) => {
    try {
      const response = await fetch('/api/admin/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: channel.chatId,
          message: `🧪 Тестове повідомлення з GalInfo\n\nКанал: ${channel.name}\nТип: ${channel.type}\nЧас: ${new Date().toLocaleString('uk-UA')}`,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error testing channel:', error);
      throw error;
    }
  };

  return {
    loading,
    results,
    publishToTelegram,
    getChannels,
    testChannel
  };
}
