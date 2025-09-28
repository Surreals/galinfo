const TelegramBot = require('node-telegram-bot-api');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Set the bot token directly for testing
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7741029792:AAEqlhh0DoA82L2dNNhyCM_RyjCBZq-eXpI';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не налаштовано в .env.local');
  process.exit(1);
}

async function testTelegramBot() {
  console.log('🤖 Тестування Telegram бота...');
  console.log('Token:', BOT_TOKEN.substring(0, 10) + '...');

  try {
    const bot = new TelegramBot(BOT_TOKEN, { polling: false });

    // Test 1: Get bot info
    console.log('\n📋 Тест 1: Отримання інформації про бота');
    const botInfo = await bot.getMe();
    console.log('✅ Бот успішно підключений!');
    console.log('Ім\'я:', botInfo.first_name);
    console.log('Username:', botInfo.username);
    console.log('ID:', botInfo.id);

    // Test 2: Get webhook info
    console.log('\n🔗 Тест 2: Перевірка webhook');
    const webhookInfo = await bot.getWebHookInfo();
    console.log('Webhook URL:', webhookInfo.url || 'Не налаштовано');
    console.log('Очікуючі оновлення:', webhookInfo.pending_update_count);

    // Test 3: Test API endpoints
    console.log('\n🌐 Тест 3: Перевірка API endpoints');
    
    try {
      const response = await fetch('http://localhost:3000/api/telegram/bot?action=info');
      if (response.ok) {
        const apiBotInfo = await response.json();
        console.log('✅ API endpoint /api/telegram/bot працює');
        console.log('API повернув ім\'я бота:', apiBotInfo.first_name);
      } else {
        console.log('❌ API endpoint не відповідає. Переконайтеся, що сервер запущений.');
      }
    } catch (error) {
      console.log('❌ Не вдалося підключитися до API. Переконайтеся, що сервер запущений на localhost:3000');
    }

    console.log('\n🎉 Тестування завершено!');
    console.log('\n📝 Наступні кроки:');
    console.log('1. Запустіть сервер: npm run dev');
    console.log('2. Відкрийте адмін панель: http://localhost:3000/admin/telegram');
    console.log('3. Налаштуйте webhook для отримання повідомлень');
    console.log('4. Напишіть боту @' + botInfo.username + ' в Telegram');

  } catch (error) {
    console.error('❌ Помилка при тестуванні бота:', error.message);
    
    if (error.message.includes('Unauthorized')) {
      console.log('\n💡 Можливі причини:');
      console.log('- Неправильний токен бота');
      console.log('- Бот було видалено або деактивовано');
      console.log('- Перевірте токен в BotFather');
    }
  }
}

testTelegramBot();
