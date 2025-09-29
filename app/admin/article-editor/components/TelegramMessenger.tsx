'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input, message, Modal, Form, Select, Space, Typography, Divider, Tag } from 'antd';
import { SendOutlined, MessageOutlined, CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ArticleData } from '@/app/hooks/useArticleData';
import styles from './TelegramMessenger.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface TelegramMessengerProps {
  articleData?: ArticleData | null;
  isVisible: boolean;
  onToggle: () => void;
}

interface TelegramChannel {
  id: string;
  name: string;
  type: 'channel' | 'group' | 'private';
  chatId: string;
}

interface SendResult {
  success: boolean;
  channel: string;
  error: string | null;
}

export default function TelegramMessenger({ articleData, isVisible, onToggle }: TelegramMessengerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [newChannel, setNewChannel] = useState({ name: '', chatId: '', type: 'channel' as const });

  // Load saved channels on component mount
  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = () => {
    const savedChannels = localStorage.getItem('telegram-channels');
    if (savedChannels) {
      setChannels(JSON.parse(savedChannels));
    }
  };

  const saveChannels = (newChannels: TelegramChannel[]) => {
    setChannels(newChannels);
    localStorage.setItem('telegram-channels', JSON.stringify(newChannels));
  };

  const addChannel = () => {
    if (!newChannel.name || !newChannel.chatId) {
      message.warning('Будь ласка, заповніть назву та Chat ID');
      return;
    }

    const channel: TelegramChannel = {
      id: Date.now().toString(),
      name: newChannel.name,
      chatId: newChannel.chatId,
      type: newChannel.type
    };

    const updatedChannels = [...channels, channel];
    saveChannels(updatedChannels);
    setNewChannel({ name: '', chatId: '', type: 'channel' });
    message.success('Канал додано успішно!');
  };

  const removeChannel = (channelId: string) => {
    const updatedChannels = channels.filter(ch => ch.id !== channelId);
    saveChannels(updatedChannels);
    setSelectedChannels(selectedChannels.filter(id => id !== channelId));
    message.success('Канал видалено!');
  };

  const handleSendToTelegram = async (values: { message?: string }) => {
    if (selectedChannels.length === 0) {
      message.warning('Будь ласка, виберіть принаймні один канал');
      return;
    }

    if (!articleData) {
      message.error('Немає даних про новину для відправки');
      return;
    }

    setLoading(true);
    const messageText = values.message || generateMessage();
    const imageUrl = articleData?.images ? generateImageUrl(articleData.images) : null;

    // Show sending info
    message.loading({
      content: `Відправляємо новину "${articleData.nheader}" в ${selectedChannels.length} канал(ів)...`,
      duration: 0,
      key: 'sending'
    });

    try {
      const promises = selectedChannels.map(async (channelId) => {
        const channel = channels.find(ch => ch.id === channelId);
        if (!channel) return { success: false, channel: 'Unknown', error: 'Channel not found' };

        try {
          const response = await fetch('/api/admin/send-telegram', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: channel.chatId,
              message: messageText,
              imageUrl: imageUrl || undefined,
            }),
          });

          const result = await response.json();
          
          if (result.success) {
            return { success: true, channel: channel.name, error: null };
          } else {
            return { success: false, channel: channel.name, error: result.message };
          }
        } catch (error) {
          return { 
            success: false, 
            channel: channel.name, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const results: SendResult[] = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      message.destroy('sending');

      if (successCount > 0) {
        message.success(`Успішно відправлено в ${successCount} канал(ів)!`);
      }

      if (failCount > 0) {
        const failedChannels = results.filter(r => !r.success).map(r => r.channel).join(', ');
        message.error(`Не вдалося відправити в ${failCount} канал(ів): ${failedChannels}`);
      }

      if (successCount > 0) {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedChannels([]);
      }
    } catch (error) {
      message.destroy('sending');
      message.error(`Помилка: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
      console.error('Telegram send error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = () => {
    if (!articleData) return '';
    
    let message = `📰 <b>${articleData.nheader || 'Нова новина'}</b>\n\n`;
    
    if (articleData.nteaser) {
      message += `${articleData.nteaser}\n\n`;
    }
    
    if (articleData.nbody) {
      // Remove HTML tags and limit length
      const cleanBody = articleData.nbody.replace(/<[^>]*>/g, '').substring(0, 500);
      message += `${cleanBody}${cleanBody.length >= 500 ? '...' : ''}\n\n`;
    }
    
    // Add link to full article if we have urlkey
    if (articleData.urlkey) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      message += `🔗 <a href="${baseUrl}/articles/${articleData.urlkey}">Читати повну версію</a>\n\n`;
    }
    
    message += `#новини #галінфо`;
    
    return message;
  };

  const generateImageUrl = (imageName: string) => {
    if (!imageName) return null;
    const firstChar = imageName.charAt(0);
    const secondChar = imageName.charAt(1);
    return `/images/${firstChar}/${secondChar}/${imageName}`;
  };

  if (!isVisible) {
    return (
      <Button
        type="primary"
        icon={<MessageOutlined />}
        onClick={onToggle}
        className={styles.toggleButton}
        style={{ bottom: '80px' }}
      >
        Telegram
      </Button>
    );
  }

  return (
    <>
      <Card 
        title="Telegram Messenger" 
        className={styles.telegramCard}
        extra={
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={onToggle}
            size="small"
          />
        }
      >
        <div className={styles.telegramContent}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Відправити новину в Telegram канали/групи</Text>
            <Text type="secondary">
              Збережено каналів: {channels.length}
            </Text>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => setIsModalVisible(true)}
              block
            >
              Відправити повідомлення
            </Button>
          </Space>
        </div>
      </Card>

      <Modal
        title="Відправити в Telegram"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Channel Management */}
          <div>
            <Title level={5}>Управління каналами</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Input
                  placeholder="Назва каналу"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  style={{ width: 150 }}
                />
                <Input
                  placeholder="Chat ID (@username або -1001234567890)"
                  value={newChannel.chatId}
                  onChange={(e) => setNewChannel({ ...newChannel, chatId: e.target.value })}
                  style={{ width: 200 }}
                />
                <Select
                  value={newChannel.type}
                  onChange={(value) => setNewChannel({ ...newChannel, type: value })}
                  style={{ width: 100 }}
                >
                  <Option value="channel">Канал</Option>
                  <Option value="group">Група</Option>
                  <Option value="private">Приватний</Option>
                </Select>
                <Button type="primary" icon={<PlusOutlined />} onClick={addChannel}>
                  Додати
                </Button>
              </Space>
              
              {channels.length > 0 && (
                <div>
                  <Text strong>Збережені канали:</Text>
                  <div style={{ marginTop: 8 }}>
                    {channels.map(channel => (
                      <Tag
                        key={channel.id}
                        closable
                        onClose={() => removeChannel(channel.id)}
                        color={selectedChannels.includes(channel.id) ? 'blue' : 'default'}
                        style={{ margin: '4px', cursor: 'pointer' }}
                        onClick={() => {
                          if (selectedChannels.includes(channel.id)) {
                            setSelectedChannels(selectedChannels.filter(id => id !== channel.id));
                          } else {
                            setSelectedChannels([...selectedChannels, channel.id]);
                          }
                        }}
                      >
                        {channel.name} ({channel.type})
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Space>
          </div>

          <Divider />

          {/* Article Info */}
          {articleData && (
            <Card size="small" title="Поточна новина">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><Text strong>Заголовок:</Text> {articleData.nheader || 'Не вказано'}</div>
                <div><Text strong>Тип:</Text> {articleData.ntype === 1 ? 'Новина' : 'Стаття'}</div>
                <div><Text strong>Дата:</Text> {articleData.ndate || 'Не вказано'}</div>
                {articleData.nteaser && (
                  <div><Text strong>Анонс:</Text> {articleData.nteaser}</div>
                )}
                {articleData.images && (
                  <div><Text strong>Зображення:</Text> {articleData.images}</div>
                )}
              </Space>
            </Card>
          )}

          {/* Message Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendToTelegram}
          >
            <Form.Item
              name="message"
              label="Повідомлення (залиште порожнім для автогенерації)"
            >
              <Input.TextArea 
                rows={6} 
                placeholder={generateMessage()}
              />
            </Form.Item>

            {/* Message Preview */}
            <div className={styles.messagePreview}>
              <Text strong>Попередній перегляд:</Text>
              <div className={styles.previewContent}>
                {generateMessage()}
              </div>
            </div>

            {articleData?.images && (
              <div className={styles.imagePreview}>
                <Text strong>Зображення: {articleData.images}</Text>
                <div style={{ marginTop: 8 }}>
                  <img 
                    src={generateImageUrl(articleData.images) || ''} 
                    alt="Preview" 
                    className={styles.previewImage}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                disabled={selectedChannels.length === 0}
              >
                Відправити в {selectedChannels.length} канал(ів)
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </>
  );
}
