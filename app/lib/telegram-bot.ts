import TelegramBot from 'node-telegram-bot-api';

export interface TelegramMessage {
  chatId: string | number;
  message: string;
  imageUrl?: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export class TelegramBotService {
  private bot: TelegramBot;
  private token: string;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }
    this.token = token;
    this.bot = new TelegramBot(this.token, { polling: false });
  }

  /**
   * Send a text message to a Telegram chat
   */
  async sendMessage(message: TelegramMessage): Promise<{ success: boolean; error?: string }> {
    try {
      const options: TelegramBot.SendMessageOptions = {
        parse_mode: message.parseMode || 'HTML',
        disable_web_page_preview: false,
      };

      await this.bot.sendMessage(message.chatId, message.message, options);
      return { success: true };
    } catch (error: any) {
      console.error('Error sending Telegram message:', error);
      
      let errorMessage = 'Невідома помилка';
      
      if (error.response?.body?.description) {
        const description = error.response.body.description;
        if (description.includes('chat not found')) {
          errorMessage = 'Чат не знайдено. Перевірте Chat ID та переконайтеся, що бот доданий до чату.';
        } else if (description.includes('bot was blocked')) {
          errorMessage = 'Бот заблокований користувачем.';
        } else if (description.includes('bot is not a member')) {
          errorMessage = 'Бот не є учасником цього чату. Додайте бота до чату спочатку.';
        } else if (description.includes('forbidden')) {
          errorMessage = 'Немає дозволу на відправку повідомлень. Перевірте права бота.';
        } else {
          errorMessage = description;
        }
      }
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send a photo with caption to a Telegram chat
   */
  async sendPhoto(message: TelegramMessage): Promise<{ success: boolean; error?: string }> {
    try {
      if (!message.imageUrl) {
        throw new Error('Image URL is required for sendPhoto');
      }

      const options: TelegramBot.SendPhotoOptions = {
        caption: message.message,
        parse_mode: message.parseMode || 'HTML',
      };

      await this.bot.sendPhoto(message.chatId, message.imageUrl, options);
      return { success: true };
    } catch (error: any) {
      console.error('Error sending Telegram photo:', error);
      
      let errorMessage = 'Невідома помилка';
      
      if (error.response?.body?.description) {
        const description = error.response.body.description;
        if (description.includes('chat not found')) {
          errorMessage = 'Чат не знайдено. Перевірте Chat ID та переконайтеся, що бот доданий до чату.';
        } else if (description.includes('bot was blocked')) {
          errorMessage = 'Бот заблокований користувачем.';
        } else if (description.includes('bot is not a member')) {
          errorMessage = 'Бот не є учасником цього чату. Додайте бота до чату спочатку.';
        } else if (description.includes('forbidden')) {
          errorMessage = 'Немає дозволу на відправку повідомлень. Перевірте права бота.';
        } else {
          errorMessage = description;
        }
      }
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send a message with or without photo
   */
  async sendMessageWithPhoto(message: TelegramMessage): Promise<{ success: boolean; error?: string }> {
    if (message.imageUrl) {
      const photoResult = await this.sendPhoto(message);
      if (photoResult.success) {
        return photoResult;
      }
      // If photo fails, fall back to text message
      console.warn('Failed to send photo, falling back to text message');
    }
    
    return await this.sendMessage(message);
  }

  /**
   * Get bot information
   */
  async getBotInfo(): Promise<any> {
    try {
      const botInfo = await this.bot.getMe();
      return botInfo;
    } catch (error) {
      console.error('Error getting bot info:', error);
      throw error;
    }
  }

  /**
   * Set webhook URL
   */
  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      await this.bot.setWebHook(webhookUrl);
      return true;
    } catch (error) {
      console.error('Error setting webhook:', error);
      return false;
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(): Promise<boolean> {
    try {
      await this.bot.deleteWebHook();
      return true;
    } catch (error) {
      console.error('Error deleting webhook:', error);
      return false;
    }
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo(): Promise<any> {
    try {
      const webhookInfo = await this.bot.getWebHookInfo();
      return webhookInfo;
    } catch (error) {
      console.error('Error getting webhook info:', error);
      throw error;
    }
  }

  /**
   * Process incoming webhook update
   */
  async processWebhookUpdate(update: any): Promise<void> {
    try {
      // Handle different types of updates
      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      console.error('Error processing webhook update:', error);
    }
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(message: any): Promise<void> {
    const chatId = message.chat.id;
    const text = message.text;

    console.log(`Received message from ${chatId}: ${text}`);

    // Basic command handling
    if (text === '/start') {
      await this.bot.sendMessage(chatId, 'Привіт! Я бот для новин GalInfo. Використовуйте /help для отримання допомоги.');
    } else if (text === '/help') {
      const helpText = `
🤖 <b>Команди бота:</b>

/start - Почати роботу з ботом
/help - Показати це повідомлення
/news - Отримати останні новини
/about - Про сайт GalInfo

Для отримання новин просто напишіть мені повідомлення!
      `;
      await this.bot.sendMessage(chatId, helpText, { parse_mode: 'HTML' });
    } else if (text === '/news') {
      await this.bot.sendMessage(chatId, 'Отримую останні новини...');
      // Here you can integrate with your news API
    } else if (text === '/about') {
      const aboutText = `
📰 <b>GalInfo</b> - ваш надійний джерело новин

Ми надаємо актуальні новини з різних сфер життя:
• Політика
• Економіка  
• Спорт
• Культура
• Технології
• І багато іншого

Відвідайте наш сайт для отримання повної інформації!
      `;
      await this.bot.sendMessage(chatId, aboutText, { parse_mode: 'HTML' });
    } else {
      // Handle general messages
      await this.bot.sendMessage(chatId, 'Дякую за повідомлення! Я допоможу вам з новинами. Використовуйте /help для списку команд.');
    }
  }

  /**
   * Handle callback queries from inline keyboards
   */
  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    console.log(`Received callback query from ${chatId}: ${data}`);

    // Answer the callback query
    await this.bot.answerCallbackQuery(callbackQuery.id);

    // Handle different callback data
    switch (data) {
      case 'latest_news':
        await this.bot.sendMessage(chatId, 'Отримую останні новини...');
        break;
      case 'important_news':
        await this.bot.sendMessage(chatId, 'Отримую важливі новини...');
        break;
      default:
        await this.bot.sendMessage(chatId, 'Невідома команда.');
    }
  }
}

// Export a singleton instance
export const telegramBot = new TelegramBotService();
