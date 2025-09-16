'use client';

import { useState } from 'react';
import { Button, Card, Input, message } from 'antd';
import { MessageOutlined, CloseOutlined, SendOutlined, LinkOutlined } from '@ant-design/icons';
import styles from './ChatGPTIframe.module.css';

interface ChatGPTIframeProps {
  isVisible: boolean;
  onToggle: () => void;
  articleData?: any;
}

export default function ChatGPTIframe({ isVisible, onToggle, articleData }: ChatGPTIframeProps) {
  const [prompt, setPrompt] = useState('');

  const handleOpenChatGPT = () => {
    const chatUrl = 'https://chatgpt.com';
    window.open(chatUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenWithContext = () => {
    if (!articleData) {
      message.warning('Немає даних статті для відправки');
      return;
    }

    const context = `
Заголовок: ${articleData.nheader || ''}
Лід: ${articleData.nteaser || ''}
Текст: ${articleData.nbody ? articleData.nbody.replace(/<[^>]*>/g, '').substring(0, 1000) : ''}

Допоможи мені покращити цю новину для українського новинного сайту.
    `.trim();

    const encodedContext = encodeURIComponent(context);
    const chatUrl = `https://chatgpt.com/?q=${encodedContext}`;
    window.open(chatUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCustomPrompt = () => {
    if (!prompt.trim()) {
      message.warning('Введіть запит');
      return;
    }

    const encodedPrompt = encodeURIComponent(prompt);
    const chatUrl = `https://chatgpt.com/?q=${encodedPrompt}`;
    window.open(chatUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) {
    return (
      <Button
        type="primary"
        icon={<MessageOutlined />}
        onClick={onToggle}
        className={styles.toggleButton}
      >
        ChatGPT
      </Button>
    );
  }

  return (
    <Card 
      title="ChatGPT Assistant" 
      className={styles.chatgptCard}
      extra={
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={onToggle}
          size="small"
        />
      }
    >
      <div className={styles.chatgptContent}>
        <div className={styles.buttonGroup}>
          <Button
            type="primary"
            icon={<LinkOutlined />}
            onClick={handleOpenChatGPT}
            block
            className={styles.actionButton}
          >
            Відкрити ChatGPT
          </Button>
          
          <Button
            type="default"
            icon={<SendOutlined />}
            onClick={handleOpenWithContext}
            block
            className={styles.actionButton}
            disabled={!articleData}
          >
            Відправити статтю на аналіз
          </Button>
        </div>

        <div className={styles.customPrompt}>
          <Input.TextArea
            placeholder="Введіть ваш запит для ChatGPT..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className={styles.promptInput}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleCustomPrompt}
            block
            className={styles.sendButton}
          >
            Відправити запит
          </Button>
        </div>
      </div>
    </Card>
  );
}
