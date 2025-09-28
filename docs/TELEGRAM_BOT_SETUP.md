# Telegram Bot Setup Guide

## Overview

This guide explains how to set up and use the Telegram bot integration for the GalInfo news website. The bot allows users to receive news updates and interact with the site through Telegram.

## Features

- 📱 Send news updates to Telegram channels/chats
- 🤖 Interactive bot commands (`/start`, `/help`, `/news`, `/about`)
- 🔗 Webhook integration for real-time message handling
- 🖼️ Support for sending images with news articles
- ⚙️ Admin interface for bot management

## Setup Instructions

### 1. Environment Configuration

The bot token has been configured in your environment. Make sure your `.env.local` file contains:

```env
TELEGRAM_BOT_TOKEN=7741029792:AAEqlhh0DoA82L2dNNhyCM_RyjCBZq-eXpI
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Install Dependencies

The required dependency `node-telegram-bot-api` has already been installed:

```bash
pnpm add node-telegram-bot-api
```

### 3. Test Bot Connection

Run the test script to verify the bot is working:

```bash
pnpm run test:telegram
```

This will:
- Test the bot token
- Get bot information
- Check webhook status
- Test API endpoints

### 4. Start the Development Server

```bash
pnpm run dev
```

### 5. Access Admin Interface

Navigate to the Telegram bot admin interface:
```
http://localhost:3000/admin/telegram
```

## API Endpoints

### Bot Management
- `GET /api/telegram/bot?action=info` - Get bot information
- `GET /api/telegram/bot?action=webhook-info` - Get webhook information
- `POST /api/telegram/bot` - Set/delete webhook

### Message Sending
- `POST /api/admin/send-telegram` - Send message to Telegram

### Webhook Handling
- `POST /api/telegram/webhook` - Handle incoming messages
- `GET /api/telegram/webhook` - Get webhook status

## Bot Commands

The bot supports the following commands:

- `/start` - Start interaction with the bot
- `/help` - Show available commands
- `/news` - Get latest news (placeholder)
- `/about` - Information about GalInfo

## Webhook Setup

### For Development (ngrok)

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js server: `pnpm run dev`
3. In another terminal: `ngrok http 3000`
4. Copy the HTTPS URL from ngrok
5. Set webhook: `https://your-ngrok-url.ngrok.io/api/telegram/webhook`

### For Production

1. Deploy your application to a server with HTTPS
2. Set webhook to: `https://yourdomain.com/api/telegram/webhook`

### Setting Webhook via Admin Interface

1. Go to `/admin/telegram`
2. Enter your webhook URL
3. Click "Налаштувати Webhook"

## Usage Examples

### Sending a Test Message

```javascript
// Via API
const response = await fetch('/api/admin/send-telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: 'YOUR_CHAT_ID',
    message: 'Test message from GalInfo!',
    imageUrl: '/path/to/image.jpg', // optional
    parseMode: 'HTML' // optional: HTML, Markdown, MarkdownV2
  })
});
```

### Using the Bot Service

```javascript
import { telegramBot } from '@/app/lib/telegram-bot';

// Send text message
await telegramBot.sendMessage({
  chatId: 'YOUR_CHAT_ID',
  message: 'Hello from GalInfo!',
  parseMode: 'HTML'
});

// Send message with image
await telegramBot.sendMessageWithPhoto({
  chatId: 'YOUR_CHAT_ID',
  message: 'News with image',
  imageUrl: 'https://example.com/image.jpg'
});
```

## Getting Chat ID

To send messages to a specific chat, you need the Chat ID:

1. Start a conversation with your bot
2. Send `/start` command
3. Send any message
4. Check server logs or use the admin interface to see the Chat ID
5. Alternatively, use @userinfobot to get your Chat ID

## Admin Interface Features

The admin interface at `/admin/telegram` provides:

- 📊 Bot information display
- 🔗 Webhook management
- 📤 Test message sending
- 📋 Instructions and troubleshooting

## Troubleshooting

### Common Issues

1. **"Unauthorized" error**
   - Check if the bot token is correct
   - Verify the bot is active in BotFather

2. **Webhook not working**
   - Ensure your server is accessible via HTTPS
   - Check if the webhook URL is correct
   - Verify the endpoint responds to POST requests

3. **Messages not sending**
   - Verify the Chat ID is correct
   - Check if the bot has permission to send messages
   - Ensure the message content is valid

### Debug Steps

1. Run `pnpm run test:telegram` to verify basic connectivity
2. Check server logs for error messages
3. Use the admin interface to test webhook functionality
4. Verify environment variables are loaded correctly

## Security Considerations

- Keep your bot token secure and never commit it to version control
- Use HTTPS for webhook URLs in production
- Validate incoming webhook data
- Implement rate limiting for API endpoints
- Consider implementing authentication for admin endpoints

## Integration with News System

The bot can be integrated with your existing news system to:

- Automatically send new articles to subscribers
- Send breaking news alerts
- Provide news search functionality
- Send daily/weekly news summaries

Example integration in your news publishing workflow:

```javascript
// When publishing a new article
async function publishArticle(article) {
  // ... existing publishing logic ...
  
  // Send to Telegram subscribers
  await telegramBot.sendMessageWithPhoto({
    chatId: '@your_channel',
    message: `📰 **${article.title}**\n\n${article.excerpt}\n\n[Читати далі](${article.url})`,
    imageUrl: article.featuredImage,
    parseMode: 'Markdown'
  });
}
```

## Support

For issues or questions about the Telegram bot integration, check:

1. Bot logs in the server console
2. Admin interface at `/admin/telegram`
3. Telegram Bot API documentation
4. Server error logs

---

**Note**: This setup uses Ukrainian language for user-facing messages as per project preferences.
