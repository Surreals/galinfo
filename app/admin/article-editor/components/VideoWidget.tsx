"use client";

import React, { useState, useRef } from 'react';
import { Button, Modal, Upload, message, Input, Form, Select, Card, Image, Space, Typography } from 'antd';
import { 
  PlayCircleOutlined, 
  UploadOutlined, 
  LinkOutlined, 
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import styles from './VideoWidget.module.css';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

interface VideoData {
  id?: number;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
}

interface VideoWidgetProps {
  onVideoSelect: (video: VideoData) => void;
  onVideoUpload: (file: File, title: string, description?: string) => Promise<VideoData>;
  onVideoUrlInsert: (url: string, title: string, description?: string) => Promise<VideoData>;
  existingVideos?: VideoData[];
}

export default function VideoWidget({ 
  onVideoSelect, 
  onVideoUpload, 
  onVideoUrlInsert,
  existingVideos = []
}: VideoWidgetProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'existing'>('upload');
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle video selection from existing videos
  const handleExistingVideoSelect = (video: VideoData) => {
    onVideoSelect(video);
    setIsModalVisible(false);
    message.success('Відео додано до статті');
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      message.error('Будь ласка, виберіть відео файл');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      message.error('Розмір файлу не повинен перевищувати 100MB');
      return;
    }

    setUploading(true);
    try {
      const title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const videoData = await onVideoUpload(file, title);
      onVideoSelect(videoData);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Відео успішно завантажено та додано');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Помилка завантаження відео');
    } finally {
      setUploading(false);
    }
  };

  // Handle URL insertion
  const handleUrlSubmit = async (values: { url: string; title: string; description?: string }) => {
    setUploading(true);
    try {
      const videoData = await onVideoUrlInsert(values.url, values.title, values.description);
      onVideoSelect(videoData);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Відео успішно додано з URL');
    } catch (error) {
      console.error('URL insert error:', error);
      message.error('Помилка додавання відео з URL');
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (!seconds) return '00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        onClick={() => setIsModalVisible(true)}
        className={styles.videoButton}
      >
        Додати відео
      </Button>

      <Modal
        title={
          <div className={styles.modalHeader}>
            <PlayCircleOutlined className={styles.modalIcon} />
            <span>Додати відео до статті</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        className={styles.videoModal}
      >
        <div className={styles.tabContainer}>
          <div className={styles.tabButtons}>
            <Button
              type={activeTab === 'upload' ? 'primary' : 'default'}
              onClick={() => setActiveTab('upload')}
              icon={<UploadOutlined />}
            >
              Завантажити файл
            </Button>
            <Button
              type={activeTab === 'url' ? 'primary' : 'default'}
              onClick={() => setActiveTab('url')}
              icon={<LinkOutlined />}
            >
              Вставити URL
            </Button>
            <Button
              type={activeTab === 'existing' ? 'primary' : 'default'}
              onClick={() => setActiveTab('existing')}
              icon={<EyeOutlined />}
            >
              Існуючі відео
            </Button>
          </div>

          <div className={styles.tabContent}>
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className={styles.uploadTab}>
                <div className={styles.uploadArea}>
                  <Upload.Dragger
                    name="video"
                    multiple={false}
                    accept="video/*"
                    beforeUpload={(file) => {
                      handleFileUpload(file);
                      return false; // Prevent default upload
                    }}
                    showUploadList={false}
                    disabled={uploading}
                  >
                    <div className={styles.uploadContent}>
                      <PlayCircleOutlined className={styles.uploadIcon} />
                      <Title level={4}>Перетягніть відео файл сюди</Title>
                      <Text type="secondary">
                        або натисніть для вибору файлу
                      </Text>
                      <div className={styles.uploadInfo}>
                        <Text type="secondary">
                          Підтримувані формати: MP4, WebM, OGG, AVI, MOV<br/>
                          Максимальний розмір: 100MB
                        </Text>
                      </div>
                    </div>
                  </Upload.Dragger>
                </div>
              </div>
            )}

            {/* URL Tab */}
            {activeTab === 'url' && (
              <div className={styles.urlTab}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUrlSubmit}
                  className={styles.urlForm}
                >
                  <Form.Item
                    name="url"
                    label="URL відео"
                    rules={[
                      { required: true, message: 'Будь ласка, введіть URL відео' },
                      { type: 'url', message: 'Будь ласка, введіть правильний URL' }
                    ]}
                  >
                    <Input
                      placeholder="https://example.com/video.mp4"
                      prefix={<LinkOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="title"
                    label="Назва відео"
                    rules={[{ required: true, message: 'Будь ласка, введіть назву відео' }]}
                  >
                    <Input placeholder="Введіть назву відео" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Опис (необов'язково)"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Введіть опис відео"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={uploading}
                        icon={<PlusOutlined />}
                      >
                        Додати відео
                      </Button>
                      <Button onClick={() => form.resetFields()}>
                        Очистити
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>
            )}

            {/* Existing Videos Tab */}
            {activeTab === 'existing' && (
              <div className={styles.existingTab}>
                {existingVideos.length > 0 ? (
                  <div className={styles.videoGrid}>
                    {existingVideos.map((video) => (
                      <Card
                        key={video.id || video.url}
                        hoverable
                        className={styles.videoCard}
                        cover={
                          <div className={styles.videoThumbnail}>
                            {video.thumbnail ? (
                              <Image
                                src={video.thumbnail}
                                alt={video.title}
                                className={styles.thumbnailImage}
                              />
                            ) : (
                              <div className={styles.placeholderThumbnail}>
                                <PlayCircleOutlined />
                              </div>
                            )}
                            <div className={styles.playOverlay}>
                              <PlayCircleOutlined />
                            </div>
                          </div>
                        }
                        actions={[
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleExistingVideoSelect(video)}
                          >
                            Вибрати
                          </Button>
                        ]}
                      >
                        <Card.Meta
                          title={
                            <Text ellipsis={{ tooltip: video.title }}>
                              {video.title}
                            </Text>
                          }
                          description={
                            <div className={styles.videoMeta}>
                              {video.duration && (
                                <Text type="secondary">
                                  {formatDuration(video.duration)}
                                </Text>
                              )}
                              {video.fileSize && (
                                <Text type="secondary">
                                  {formatFileSize(video.fileSize)}
                                </Text>
                              )}
                            </div>
                          }
                        />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <PlayCircleOutlined className={styles.emptyIcon} />
                    <Title level={4}>Немає доступних відео</Title>
                    <Text type="secondary">
                      Завантажте нове відео або вставте URL
                    </Text>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
