'use client';

import { useState } from 'react';
import { Button, Card, Input, message, Modal, Form, Upload } from 'antd';
import { SendOutlined, MessageOutlined, CloseOutlined } from '@ant-design/icons';
import { ArticleData } from '@/app/hooks/useArticleData';
import styles from './TelegramMessenger.module.css';

interface TelegramMessengerProps {
  articleData?: ArticleData | null;
  isVisible: boolean;
  onToggle: () => void;
}

export default function TelegramMessenger({ articleData, isVisible, onToggle }: TelegramMessengerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSendToTelegram = async (values: { chatId: string; message?: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: values.chatId,
          message: values.message || generateMessage(),
          imageUrl: articleData?.nimage ? generateImageUrl(articleData.nimage) : null,
        }),
      });

      if (response.ok) {
        message.success('Повідомлення успішно відправлено в Telegram!');
        setIsModalVisible(false);
        form.resetFields();
      } else {
        const error = await response.json();
        message.error(`Помилка: ${error.message}`);
      }
    } catch (error) {
      message.error('Помилка при відправці повідомлення');
      console.error('Telegram send error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = () => {
    if (!articleData) return '';
    
    let message = `📰 *${articleData.nheader || 'Нова новина'}*\n\n`;
    
    if (articleData.nteaser) {
      message += `${articleData.nteaser}\n\n`;
    }
    
    if (articleData.nbody) {
      // Remove HTML tags and limit length
      const cleanBody = articleData.nbody.replace(/<[^>]*>/g, '').substring(0, 500);
      message += `${cleanBody}${cleanBody.length >= 500 ? '...' : ''}\n\n`;
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
          <p>Відправити новину в Telegram чат</p>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setIsModalVisible(true)}
            block
          >
            Відправити повідомлення
          </Button>
        </div>
      </Card>

      <Modal
        title="Відправити в Telegram"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendToTelegram}
        >
          <Form.Item
            name="chatId"
            label="ID чату або каналу"
            rules={[{ required: true, message: 'Введіть ID чату' }]}
          >
            <Input placeholder="@username або -1001234567890" />
          </Form.Item>
          
          <Form.Item
            name="message"
            label="Повідомлення (залиште порожнім для автогенерації)"
          >
            <Input.TextArea 
              rows={6} 
              placeholder={generateMessage()}
            />
          </Form.Item>

          {articleData?.nimage && (
            <div className={styles.imagePreview}>
              <p>Зображення: {articleData.nimage}</p>
              <img 
                src={generateImageUrl(articleData.nimage)} 
                alt="Preview" 
                className={styles.previewImage}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Відправити
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
