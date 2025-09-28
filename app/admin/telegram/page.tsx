'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input, message, Space, Typography, Divider } from 'antd';
import { SendOutlined, InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections: number;
  allowed_updates: string[];
}

export default function TelegramBotPage() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testChatId, setTestChatId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Load bot info on component mount
  useEffect(() => {
    loadBotInfo();
    loadWebhookInfo();
  }, []);

  const loadBotInfo = async () => {
    try {
      const response = await fetch('/api/telegram/bot?action=info');
      if (response.ok) {
        const info = await response.json();
        setBotInfo(info);
      } else {
        message.error('Не вдалося завантажити інформацію про бота');
      }
    } catch (error) {
      console.error('Error loading bot info:', error);
      message.error('Помилка при завантаженні інформації про бота');
    }
  };

  const loadWebhookInfo = async () => {
    try {
      const response = await fetch('/api/telegram/bot?action=webhook-info');
      if (response.ok) {
        const info = await response.json();
        setWebhookInfo(info);
      } else {
        message.error('Не вдалося завантажити інформацію про webhook');
      }
    } catch (error) {
      console.error('Error loading webhook info:', error);
      message.error('Помилка при завантаженні інформації про webhook');
    }
  };

  const sendTestMessage = async () => {
    if (!testMessage.trim() || !testChatId.trim()) {
      message.warning('Будь ласка, введіть повідомлення та Chat ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: testChatId,
          message: testMessage,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Повідомлення успішно відправлено!');
        setTestMessage('');
      } else {
        message.error(result.message || 'Помилка при відправці повідомлення');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      message.error('Помилка при відправці повідомлення');
    } finally {
      setLoading(false);
    }
  };

  const setWebhook = async () => {
    if (!webhookUrl.trim()) {
      message.warning('Будь ласка, введіть URL для webhook');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/telegram/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set-webhook',
          webhookUrl: webhookUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Webhook успішно налаштовано!');
        loadWebhookInfo();
      } else {
        message.error(result.message || 'Помилка при налаштуванні webhook');
      }
    } catch (error) {
      console.error('Error setting webhook:', error);
      message.error('Помилка при налаштуванні webhook');
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete-webhook',
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Webhook успішно видалено!');
        loadWebhookInfo();
      } else {
        message.error(result.message || 'Помилка при видаленні webhook');
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      message.error('Помилка при видаленні webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>🤖 Управління Telegram Ботом</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Bot Information */}
        <Card title="Інформація про бота" icon={<InfoCircleOutlined />}>
          {botInfo ? (
            <Space direction="vertical">
              <Text><strong>Ім'я:</strong> {botInfo.first_name}</Text>
              <Text><strong>Username:</strong> @{botInfo.username}</Text>
              <Text><strong>ID:</strong> {botInfo.id}</Text>
              <Text><strong>Може приєднуватися до груп:</strong> {botInfo.can_join_groups ? 'Так' : 'Ні'}</Text>
              <Text><strong>Може читати всі повідомлення груп:</strong> {botInfo.can_read_all_group_messages ? 'Так' : 'Ні'}</Text>
              <Text><strong>Підтримує inline запити:</strong> {botInfo.supports_inline_queries ? 'Так' : 'Ні'}</Text>
            </Space>
          ) : (
            <Text>Завантаження інформації про бота...</Text>
          )}
        </Card>

        {/* Webhook Information */}
        <Card title="Налаштування Webhook" icon={<SettingOutlined />}>
          {webhookInfo ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text><strong>URL:</strong> {webhookInfo.url || 'Не налаштовано'}</Text>
              <Text><strong>Очікуючі оновлення:</strong> {webhookInfo.pending_update_count}</Text>
              <Text><strong>Максимальні з'єднання:</strong> {webhookInfo.max_connections}</Text>
              {webhookInfo.last_error_message && (
                <Text type="danger">
                  <strong>Остання помилка:</strong> {webhookInfo.last_error_message}
                </Text>
              )}
              
              <Divider />
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="Введіть URL для webhook (наприклад: https://yourdomain.com/api/telegram/webhook)"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <Space>
                  <Button 
                    type="primary" 
                    onClick={setWebhook}
                    loading={loading}
                  >
                    Налаштувати Webhook
                  </Button>
                  <Button 
                    danger 
                    onClick={deleteWebhook}
                    loading={loading}
                  >
                    Видалити Webhook
                  </Button>
                  <Button onClick={loadWebhookInfo}>
                    Оновити
                  </Button>
                </Space>
              </Space>
            </Space>
          ) : (
            <Text>Завантаження інформації про webhook...</Text>
          )}
        </Card>

        {/* Test Message */}
        <Card title="Тестове повідомлення">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="Введіть Chat ID (ID чату або каналу)"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
            />
            <TextArea
              placeholder="Введіть тестове повідомлення"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={4}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={sendTestMessage}
              loading={loading}
            >
              Відправити тестове повідомлення
            </Button>
          </Space>
        </Card>

        {/* Instructions */}
        <Card title="Інструкції">
          <Space direction="vertical">
            <Paragraph>
              <strong>Як отримати Chat ID:</strong>
            </Paragraph>
            <ol>
              <li>Напишіть боту @{botInfo?.username} в Telegram</li>
              <li>Відправте команду /start</li>
              <li>Відправте будь-яке повідомлення</li>
              <li>Перевірте логи сервера або використайте @userinfobot</li>
            </ol>
            
            <Paragraph>
              <strong>Налаштування Webhook:</strong>
            </Paragraph>
            <ol>
              <li>Вкажіть URL вашого сервера + /api/telegram/webhook</li>
              <li>Переконайтеся, що сервер доступний з інтернету</li>
              <li>Натисніть "Налаштувати Webhook"</li>
            </ol>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
