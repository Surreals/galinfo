'use client';

import { useState } from 'react';
import { Upload, Button, message, Form, Input, Select, Card, Progress } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { ImageItem, ImageUploadProps } from './types';
import styles from './ImageUpload.module.css';

const { Dragger } = Upload;
const { TextArea } = Input;

export default function ImageUpload({ 
  onUpload, 
  onSuccess, 
  onError 
}: ImageUploadProps) {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    // Перевіряємо тип файлу
    if (!file.type.startsWith('image/')) {
      message.error('Будь ласка, виберіть зображення');
      return false;
    }

    // Перевіряємо розмір файлу (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      message.error('Розмір файлу не повинен перевищувати 10MB');
      return false;
    }

    setSelectedFile(file);
    return false; // Запобігаємо автоматичному завантаженню
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.error('Будь ласка, виберіть файл');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Симулюємо прогрес завантаження
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Отримуємо дані з форми
      const formData = await form.validateFields();
      
      // Створюємо FormData для завантаження
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('pic_type', formData.pic_type);
      if (formData.description) {
        uploadFormData.append('description', formData.description);
      }

      // Завантажуємо файл
      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Помилка завантаження');
      }

      const result = await response.json();
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      message.success('Зображення успішно завантажено');
      onSuccess?.(result.image);
      
      // Очищуємо форму
      form.resetFields();
      setSelectedFile(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Помилка завантаження');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (values: any) => {
    if (!selectedFile) {
      message.error('Будь ласка, виберіть файл');
      return;
    }

    // Тут можна додати додаткові дані до файлу перед завантаженням
    await handleUpload();
  };

  return (
    <div className={styles.uploadContainer}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        className={styles.uploadForm}
      >
        {/* Область для перетягування файлів */}
        <Form.Item>
          <Dragger
            name="file"
            multiple={false}
            beforeUpload={handleFileSelect}
            showUploadList={false}
            className={styles.dragger}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Натисніть або перетягніть файл сюди
            </p>
            <p className="ant-upload-hint">
              Підтримуються формати: JPG, PNG, GIF, WebP (максимум 10MB)
            </p>
          </Dragger>
        </Form.Item>

        {/* Інформація про вибраний файл */}
        {selectedFile && (
          <Card size="small" className={styles.fileInfo}>
            <div className={styles.fileDetails}>
              <div className={styles.fileName}>{selectedFile.name}</div>
              <div className={styles.fileSize}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </Card>
        )}

        {/* Прогрес завантаження */}
        {uploading && (
          <div className={styles.progressContainer}>
            <Progress 
              percent={uploadProgress} 
              status={uploadProgress === 100 ? 'success' : 'active'}
            />
          </div>
        )}

        {/* Додаткові поля */}
        <Form.Item
          name="title"
          label="Назва зображення"
          rules={[{ required: true, message: 'Будь ласка, введіть назву' }]}
        >
          <Input 
            placeholder="Введіть назву зображення"
            defaultValue={selectedFile?.name?.split('.')[0]}
          />
        </Form.Item>

        <Form.Item
          name="pic_type"
          label="Тип зображення"
          rules={[{ required: true, message: 'Будь ласка, виберіть тип' }]}
        >
          <Select placeholder="Виберіть тип зображення">
            <Select.Option value="news">Новини</Select.Option>
            <Select.Option value="gallery">Галерея</Select.Option>
            <Select.Option value="avatar">Аватар</Select.Option>
            <Select.Option value="banner">Банер</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Опис (необов'язково)"
        >
          <TextArea 
            rows={3}
            placeholder="Введіть опис зображення"
          />
        </Form.Item>

        {/* Кнопки */}
        <Form.Item className={styles.buttonGroup}>
          <Button
            type="primary"
            htmlType="submit"
            loading={uploading}
            disabled={!selectedFile}
            icon={<UploadOutlined />}
            className={styles.uploadButton}
          >
            Завантажити
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
              setSelectedFile(null);
              setUploadProgress(0);
            }}
            disabled={uploading}
          >
            Скинути
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
