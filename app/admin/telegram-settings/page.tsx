'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  message, 
  Space, 
  Typography, 
  Tag, 
  Popconfirm,
  Tooltip,
  Badge,
  Tabs,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SendOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  RobotOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

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

interface TelegramChannel {
  id: string;
  name: string;
  type: 'channel' | 'group' | 'private';
  chatId: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TelegramUnifiedPage() {
  // Bot management state
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [testChatId, setTestChatId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Channel management state
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChannel, setEditingChannel] = useState<TelegramChannel | null>(null);
  const [form] = Form.useForm();

  // Load data on component mount
  useEffect(() => {
    loadBotInfo();
    loadWebhookInfo();
    loadChannels();
  }, []);

  // Bot management functions
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

  // Channel management functions
  const loadChannels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/telegram-channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
      } else {
        message.error('Не вдалося завантажити канали');
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      message.error('Помилка при завантаженні каналів');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = () => {
    setEditingChannel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditChannel = (channel: TelegramChannel) => {
    setEditingChannel(channel);
    form.setFieldsValue(channel);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editingChannel 
        ? `/api/admin/telegram-channels?id=${editingChannel.id}`
        : '/api/admin/telegram-channels';
      
      const method = editingChannel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        setModalVisible(false);
        form.resetFields();
        loadChannels();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Error saving channel:', error);
      message.error('Помилка при збереженні каналу');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/telegram-channels?id=${channelId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        loadChannels();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
      message.error('Помилка при видаленні каналу');
    } finally {
      setLoading(false);
    }
  };

  const toggleChannelStatus = async (channel: TelegramChannel) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/telegram-channels', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: channel.id,
          isActive: !channel.isActive
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success(result.message);
        loadChannels();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Error toggling channel status:', error);
      message.error('Помилка при зміні статусу каналу');
    } finally {
      setLoading(false);
    }
  };

  const testChannel = async (channel: TelegramChannel) => {
    setLoading(true);
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

      if (result.success) {
        message.success(`Тестове повідомлення відправлено в ${channel.name}`);
      } else {
        message.error(`Помилка: ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing channel:', error);
      message.error('Помилка при відправці тестового повідомлення');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Назва',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TelegramChannel) => (
        <Space>
          <Text strong>{text}</Text>
          <Badge 
            status={record.isActive ? 'success' : 'default'} 
            text={record.isActive ? 'Активний' : 'Неактивний'} 
          />
        </Space>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors = {
          channel: 'blue',
          group: 'green',
          private: 'orange'
        };
        const labels = {
          channel: 'Канал',
          group: 'Група',
          private: 'Приватний'
        };
        return <Tag color={colors[type as keyof typeof colors]}>{labels[type as keyof typeof labels]}</Tag>;
      },
    },
    {
      title: 'Chat ID',
      dataIndex: 'chatId',
      key: 'chatId',
      render: (text: string) => (
        <Text code>{text}</Text>
      ),
    },
    {
      title: 'Опис',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Створено',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('uk-UA'),
    },
    {
      title: 'Дії',
      key: 'actions',
      render: (_, record: TelegramChannel) => (
        <Space>
          <Tooltip title="Редагувати">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditChannel(record)}
            />
          </Tooltip>
          <Tooltip title="Тестувати">
            <Button 
              type="text" 
              icon={<SendOutlined />} 
              onClick={() => testChannel(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Деактивувати' : 'Активувати'}>
            <Button 
              type="text" 
              icon={record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              onClick={() => toggleChannelStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Видалити канал"
            description="Ви впевнені, що хочете видалити цей канал?"
            onConfirm={() => handleDeleteChannel(record.id)}
            okText="Так"
            cancelText="Ні"
          >
            <Tooltip title="Видалити">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>🤖 Telegram Управління</Title>
          <Text type="secondary">Управління ботом та каналами для публікації новин</Text>
        </div>

        <Tabs defaultActiveKey="channels" size="large">
            {/* Channel Management Tab */}
            <TabPane 
            tab={
              <span>
                <MessageOutlined />
                Управління каналами
              </span>
            } 
            key="channels"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3}>Канали та групи</Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleCreateChannel}
                >
                  Додати канал
                </Button>
              </div>

              <Card>
                <Table
                  columns={columns}
                  dataSource={channels}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} з ${total} каналів`,
                  }}
                />
              </Card>

              <Card title="Інструкції з налаштування">
                <Space direction="vertical" size="large">
                  <div>
                    <Title level={5}>Як отримати Chat ID:</Title>
                    <Space direction="vertical">
                      <div>
                        <Text strong>Для каналів:</Text>
                        <ul>
                          <li>Публічні: <Text code>@channel_username</Text></li>
                          <li>Приватні: <Text code>-1001234567890</Text></li>
                        </ul>
                      </div>
                      <div>
                        <Text strong>Для груп:</Text>
                        <ul>
                          <li>Додайте бота в групу</li>
                          <li>Використовуйте: <Text code>-1001234567890</Text></li>
                        </ul>
                      </div>
                      <div>
                        <Text strong>Для приватних чатів:</Text>
                        <ul>
                          <li>Напишіть боту <Text code>/start</Text></li>
                          <li>Використовуйте ID користувача</li>
                        </ul>
                      </div>
                    </Space>
                  </div>
                  
                  <div>
                    <Title level={5}>Типи каналів:</Title>
                    <Space direction="vertical">
                      <div><Tag color="blue">Канал</Tag> - Публічний канал для новин</div>
                      <div><Tag color="green">Група</Tag> - Група користувачів</div>
                      <div><Tag color="orange">Приватний</Tag> - Приватний чат</div>
                    </Space>
                  </div>

                  <div>
                    <Title level={5}>Розв'язання проблем:</Title>
                    <Space direction="vertical">
                      <div><Text type="danger">"Chat not found"</Text> - Перевірте Chat ID та додайте бота до чату</div>
                      <div><Text type="danger">"Bot was blocked"</Text> - Розблокуйте бота</div>
                      <div><Text type="danger">"Forbidden"</Text> - Надайте боту права на відправку повідомлень</div>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Space>
          </TabPane>
          {/* Bot Management Tab */}
          <TabPane 
            tab={
              <span>
                <RobotOutlined />
                Управління ботом
              </span>
            } 
            key="bot"
          >
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
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />}
                      onClick={sendTestMessage}
                      loading={loading}
                    >
                      Відправити тестове повідомлення
                    </Button>
                    <Button 
                      onClick={() => {
                        setTestChatId('351801381');
                        setTestMessage('🧪 Швидкий тест з GalInfo\n\nЧас: ' + new Date().toLocaleString('uk-UA'));
                      }}
                    >
                      Швидкий тест (ваш ID)
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Space>
          </TabPane>

        
        </Tabs>

        {/* Channel Modal */}
        <Modal
          title={editingChannel ? 'Редагувати канал' : 'Додати канал'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Назва каналу"
              rules={[{ required: true, message: 'Введіть назву каналу' }]}
            >
              <Input placeholder="Наприклад: Головні новини" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Тип"
              rules={[{ required: true, message: 'Виберіть тип каналу' }]}
            >
              <Select placeholder="Виберіть тип каналу">
                <Option value="channel">Канал</Option>
                <Option value="group">Група</Option>
                <Option value="private">Приватний чат</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="chatId"
              label="Chat ID"
              rules={[{ required: true, message: 'Введіть Chat ID' }]}
              extra="Для каналів: @username або -1001234567890. Для груп: -1001234567890"
            >
              <Input placeholder="@channel_username або -1001234567890" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Опис (необов'язково)"
            >
              <TextArea 
                rows={3} 
                placeholder="Короткий опис каналу..."
              />
            </Form.Item>

            {editingChannel && (
              <Form.Item
                name="isActive"
                label="Активний"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                >
                  {editingChannel ? 'Оновити' : 'Створити'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  Скасувати
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </div>
  );
}
