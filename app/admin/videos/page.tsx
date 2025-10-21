'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Upload, Modal, Form, Input, Select, message, Space, Popconfirm } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import styles from './videos.module.css';

const { Option } = Select;

interface Video {
  id: number;
  filename: string;
  title_ua: string;
  title_deflang: string;
  description_ua?: string;
  description_deflang?: string;
  duration: number;
  file_size: number;
  mime_type: string;
  video_type: string;
  url: string;
  thumbnail_url?: string;
  created_at: string;
}

const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [videoTypeFilter, setVideoTypeFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Завантаження списку відео
  const fetchVideos = async (page = 1, limit = 20, search = '', videoType = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(videoType && { video_type: videoType }),
      });

      const response = await fetch(`/api/admin/videos?${params}`);
      const data = await response.json();

      if (response.ok) {
        setVideos(data.videos);
        setPagination({
          current: data.pagination.page,
          pageSize: data.pagination.limit,
          total: data.pagination.total,
        });
      } else {
        message.error('Помилка завантаження відео');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      message.error('Помилка завантаження відео');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Обробка завантаження файлу
  const handleUpload = async () => {
    try {
      const values = await uploadForm.validateFields();
      
      if (!videoFile) {
        message.error('Будь ласка, виберіть відео файл');
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('file', videoFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      formData.append('title', values.title || videoFile.name);
      formData.append('video_type', values.video_type || 'news');
      formData.append('description', values.description || '');

      const response = await fetch('/api/admin/videos/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Відео успішно завантажено');
        setIsUploadModalVisible(false);
        uploadForm.resetFields();
        setVideoFile(null);
        setThumbnailFile(null);
        fetchVideos(pagination.current, pagination.pageSize, searchText, videoTypeFilter);
      } else {
        message.error(data.error || 'Помилка завантаження відео');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      message.error('Помилка завантаження відео');
    } finally {
      setUploading(false);
    }
  };

  // Обробка редагування відео
  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    form.setFieldsValue({
      title_ua: video.title_ua,
      title_deflang: video.title_deflang,
      description_ua: video.description_ua,
      description_deflang: video.description_deflang,
      video_type: video.video_type,
    });
    setIsModalVisible(true);
  };

  // Збереження змін
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (!editingVideo) return;
      
      const response = await fetch(`/api/admin/videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        message.success('Зміни збережено');
        setIsModalVisible(false);
        setEditingVideo(null);
        form.resetFields();
        fetchVideos(pagination.current, pagination.pageSize, searchText, videoTypeFilter);
      } else {
        message.error(result.error || 'Помилка збереження відео');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      message.error('Помилка збереження відео');
    }
  };

  // Видалення відео
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        message.success('Відео видалено');
        fetchVideos(pagination.current, pagination.pageSize, searchText, videoTypeFilter);
      } else {
        message.error(result.error || 'Помилка видалення відео');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      message.error('Помилка видалення відео');
    }
  };

  // Форматування розміру файлу
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Форматування тривалості
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const columns = [
    {
      title: 'Прев\'ю',
      dataIndex: 'thumbnail_url',
      key: 'thumbnail',
      width: 100,
      render: (url: string, record: Video) => (
        <div className={styles.thumbnailContainer}>
          {url ? (
            <img 
              src={url} 
              alt="Video thumbnail" 
              className={styles.thumbnail}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={styles.thumbnailPlaceholder}>
              <span>🎥</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Назва',
      dataIndex: 'title_ua',
      key: 'title',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Тип',
      dataIndex: 'video_type',
      key: 'video_type',
      width: 100,
      render: (type: string) => {
        const typeMap: { [key: string]: string } = {
          'news': 'Новини',
          'gallery': 'Галерея',
          'advertisement': 'Реклама'
        };
        return typeMap[type] || type;
      },
    },
    {
      title: 'Розмір',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: 'Тривалість',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number) => formatDuration(duration),
    },
    {
      title: 'Дата створення',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('uk-UA'),
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: Video) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => window.open(record.url, '_blank')}
            title="Переглянути"
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Редагувати"
          />
          <Popconfirm
            title="Ви впевнені, що хочете видалити це відео?"
            onConfirm={() => handleDelete(record.id)}
            okText="Так"
            cancelText="Ні"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              title="Видалити"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управління відео</h1>
        <div className={styles.controls}>
          <Input.Search
            placeholder="Пошук відео..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => fetchVideos(1, pagination.pageSize, value, videoTypeFilter)}
            style={{ width: 200, marginRight: 16 }}
          />
          <Select
            placeholder="Тип відео"
            value={videoTypeFilter}
            onChange={(value) => {
              setVideoTypeFilter(value);
              fetchVideos(1, pagination.pageSize, searchText, value);
            }}
            style={{ width: 150, marginRight: 16 }}
            allowClear
          >
            <Option value="news">Новини</Option>
            <Option value="gallery">Галерея</Option>
            <Option value="advertisement">Реклама</Option>
          </Select>
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => setIsUploadModalVisible(true)}
          >
            Завантажити відео
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={videos}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} з ${total} відео`,
          onChange: (page, pageSize) => {
            fetchVideos(page, pageSize || 20, searchText, videoTypeFilter);
          },
        }}
        scroll={{ x: 800 }}
      />

      {/* Upload Modal */}
      <Modal
        title="Завантажити відео"
        open={isUploadModalVisible}
        onOk={handleUpload}
        onCancel={() => {
          setIsUploadModalVisible(false);
          uploadForm.resetFields();
          setVideoFile(null);
          setThumbnailFile(null);
        }}
        confirmLoading={uploading}
        width={600}
        okText="Завантажити"
        cancelText="Скасувати"
      >
        <Form form={uploadForm} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            label="Відео файл"
            required
          >
            <Upload
              beforeUpload={(file) => {
                if (!file.type.startsWith('video/')) {
                  message.error('Будь ласка, виберіть відео файл');
                  return false;
                }
                if (file.size > 100 * 1024 * 1024) {
                  message.error('Розмір файлу не повинен перевищувати 100MB');
                  return false;
                }
                setVideoFile(file);
                return false;
              }}
              onRemove={() => setVideoFile(null)}
              fileList={videoFile ? [{
                uid: '-1',
                name: videoFile.name,
                status: 'done',
                url: '',
              }] : []}
              maxCount={1}
              accept="video/*"
            >
              <Button icon={<UploadOutlined />}>Вибрати відео</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Мініатюра (thumbnail)"
          >
            <Upload
              beforeUpload={(file) => {
                if (!file.type.startsWith('image/')) {
                  message.error('Будь ласка, виберіть зображення');
                  return false;
                }
                if (file.size > 5 * 1024 * 1024) {
                  message.error('Розмір файлу не повинен перевищувати 5MB');
                  return false;
                }
                setThumbnailFile(file);
                return false;
              }}
              onRemove={() => setThumbnailFile(null)}
              fileList={thumbnailFile ? [{
                uid: '-2',
                name: thumbnailFile.name,
                status: 'done',
                url: '',
              }] : []}
              maxCount={1}
              accept="image/*"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Вибрати мініатюру (необов'язково)</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
              Рекомендовано: JPG, PNG (максимум 5MB)
            </div>
          </Form.Item>

          <Form.Item
            name="title"
            label="Назва"
            rules={[{ required: true, message: 'Будь ласка, введіть назву' }]}
          >
            <Input 
              placeholder="Назва відео"
              onPressEnter={() => uploadForm.submit()}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Опис"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Опис відео (необов'язково)"
              onPressEnter={(e) => {
                if (e.shiftKey) return; // Shift+Enter для нового рядка
                e.preventDefault();
                uploadForm.submit();
              }}
            />
          </Form.Item>

          <Form.Item
            name="video_type"
            label="Тип відео"
            initialValue="news"
            rules={[{ required: true, message: 'Будь ласка, виберіть тип' }]}
          >
            <Select>
              <Option value="news">Новини</Option>
              <Option value="gallery">Галерея</Option>
              <Option value="advertisement">Реклама</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Редагувати відео"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingVideo(null);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="title_ua"
            label="Назва (українська)"
            rules={[{ required: true, message: 'Будь ласка, введіть назву' }]}
          >
            <Input onPressEnter={() => form.submit()} />
          </Form.Item>
          <Form.Item
            name="title_deflang"
            label="Назва (за замовчуванням)"
          >
            <Input onPressEnter={() => form.submit()} />
          </Form.Item>
          <Form.Item
            name="description_ua"
            label="Опис (українська)"
          >
            <Input.TextArea 
              rows={3}
              onPressEnter={(e) => {
                if (e.shiftKey) return;
                e.preventDefault();
                form.submit();
              }}
            />
          </Form.Item>
          <Form.Item
            name="description_deflang"
            label="Опис (за замовчуванням)"
          >
            <Input.TextArea 
              rows={3}
              onPressEnter={(e) => {
                if (e.shiftKey) return;
                e.preventDefault();
                form.submit();
              }}
            />
          </Form.Item>
          <Form.Item
            name="video_type"
            label="Тип відео"
            rules={[{ required: true, message: 'Будь ласка, виберіть тип' }]}
          >
            <Select>
              <Option value="news">Новини</Option>
              <Option value="gallery">Галерея</Option>
              <Option value="advertisement">Реклама</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VideosPage;
