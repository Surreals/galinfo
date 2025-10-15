'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Upload, Modal, Form, Input, Select, message, Space, Popconfirm, Checkbox } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { UploadFile } from 'antd/es/upload/interface';
import AdminNavigation from '../components/AdminNavigation';
import TagInput from '../article-editor/components/TagInput';
import TagSearchInput from '../article-editor/components/TagSearchInput';
import styles from './gallery.module.css';

const { Option } = Select;

interface Image {
  id: number;
  filename: string;
  title_ua: string;
  title_deflang: string;
  pic_type: string;
  tags?: string;
  url: string;
  thumbnail_url: string;
}

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [picTypeFilter, setPicTypeFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Завантаження списку зображень
  const fetchImages = async (page = 1, limit = 20, search = '', picType = '', tags = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(picType && { pic_type: picType }),
        ...(tags && { tags }),
      });

      const response = await fetch(`/api/admin/images?${params}`);
      const data = await response.json();

      if (response.ok) {
        setImages(data.images);
        setPagination({
          current: data.pagination.page,
          pageSize: data.pagination.limit,
          total: data.pagination.total,
        });
      } else {
        message.error('Помилка завантаження зображень');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      message.error('Помилка завантаження зображень');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Обробка завантаження файлів
  const handleUpload = async () => {
    try {
      const values = await uploadForm.validateFields();
      
      if (fileList.length === 0) {
        message.error('Будь ласка, виберіть хоча б одне зображення');
        return;
      }

      setUploading(true);

      const formData = new FormData();
      
      // Додаємо всі файли
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });
      
      formData.append('title', values.title || '');
      formData.append('pic_type', values.pic_type || 'gallery');
      formData.append('tags', values.tags || '');

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        message.success(`Успішно завантажено ${data.uploaded} зображень${data.failed > 0 ? `, помилок: ${data.failed}` : ''}`);
        setIsUploadModalVisible(false);
        uploadForm.resetFields();
        setFileList([]);
        fetchImages(pagination.current, pagination.pageSize, searchText, picTypeFilter, tagsFilter);
      } else {
        message.error(data.error || 'Помилка завантаження зображень');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      message.error('Помилка завантаження зображень');
    } finally {
      setUploading(false);
    }
  };

  // Обробка редагування зображення
  const handleEdit = (image: Image) => {
    setEditingImage(image);
    form.setFieldsValue({
      title_ua: image.title_ua,
      title_deflang: image.title_deflang,
      pic_type: image.pic_type,
      tags: image.tags || '',
    });
    setIsModalVisible(true);
  };

  // Збереження змін
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (!editingImage) return;
      
      const response = await fetch(`/api/admin/images/${editingImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title_ua: values.title_ua,
          title_deflang: values.title_deflang,
          pic_type: values.pic_type,
          tags: values.tags || null,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        message.success('Зміни збережено');
        setIsModalVisible(false);
        setEditingImage(null);
        form.resetFields();
        fetchImages(pagination.current, pagination.pageSize, searchText, picTypeFilter, tagsFilter);
      } else {
        message.error(result.error || 'Помилка збереження зображення');
      }
    } catch (error) {
      console.error('Error saving image:', error);
      message.error('Помилка збереження зображення');
    }
  };

  // Видалення зображення
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/images/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        message.success('Зображення видалено');
        fetchImages(pagination.current, pagination.pageSize, searchText, picTypeFilter, tagsFilter);
      } else {
        message.error(result.error || 'Помилка видалення зображення');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      message.error('Помилка видалення зображення');
    }
  };

  // Групове видалення
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Виберіть хоча б одне зображення для видалення');
      return;
    }

    try {
      const response = await fetch('/api/admin/images/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedRowKeys }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        message.success(`Видалено ${result.deleted} зображень`);
        setSelectedRowKeys([]);
        fetchImages(pagination.current, pagination.pageSize, searchText, picTypeFilter, tagsFilter);
      } else {
        message.error(result.error || 'Помилка групового видалення');
      }
    } catch (error) {
      console.error('Error bulk deleting images:', error);
      message.error('Помилка групового видалення');
    }
  };

  // Налаштування виділення рядків
  const rowSelection: TableRowSelection<Image> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns = [
    {
      title: 'Прев\'ю',
      dataIndex: 'thumbnail_url',
      key: 'thumbnail',
      width: 100,
      render: (url: string) => (
        <div className={styles.thumbnailContainer}>
          <img 
            src={url} 
            alt="Image thumbnail" 
            className={styles.thumbnail}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
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
      title: 'Ім\'я файлу',
      dataIndex: 'filename',
      key: 'filename',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Тип',
      dataIndex: 'pic_type',
      key: 'pic_type',
      width: 100,
      render: (type: string) => {
        const typeMap: { [key: string]: string } = {
          'news': 'Новини',
          'gallery': 'Галерея',
          'avatar': 'Аватар',
          'banner': 'Банер'
        };
        return typeMap[type] || type;
      },
    },
    {
      title: 'Теги',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      ellipsis: true,
      render: (tags: string) => {
        if (!tags || tags.trim() === '') {
          return <span style={{ color: '#999' }}>—</span>;
        }
        return (
          <div style={{ maxWidth: '180px' }}>
            {tags.split(',').map((tag, index) => (
              <span key={index} style={{ 
                display: 'inline-block',
                background: '#f0f0f0',
                padding: '2px 6px',
                margin: '1px',
                borderRadius: '3px',
                fontSize: '12px',
                color: '#666'
              }}>
                {tag.trim()}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: Image) => (
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
            title="Ви впевнені, що хочете видалити це зображення?"
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
    <>
      <AdminNavigation />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Управління галереєю</h1>
        <div className={styles.controls}>
          <Input.Search
            placeholder="Пошук зображень..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => fetchImages(1, pagination.pageSize, value, picTypeFilter, tagsFilter)}
            style={{ width: 200, marginRight: 16 }}
          />
          <Select
            placeholder="Тип зображення"
            value={picTypeFilter}
            onChange={(value) => {
              setPicTypeFilter(value);
              fetchImages(1, pagination.pageSize, searchText, value, tagsFilter);
            }}
            style={{ width: 150, marginRight: 16 }}
            allowClear
          >
            <Option value="news">Новини</Option>
            <Option value="gallery">Галерея</Option>
            <Option value="avatar">Аватар</Option>
            <Option value="banner">Банер</Option>
          </Select>
          <div style={{ width: 200, marginRight: 16 }}>
            <TagSearchInput
              value={tagsFilter}
              onChange={setTagsFilter}
              onSearch={(value) => fetchImages(1, pagination.pageSize, searchText, picTypeFilter, value)}
              placeholder="Пошук по тегах..."
            />
          </div>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`Ви впевнені, що хочете видалити ${selectedRowKeys.length} зображень?`}
              onConfirm={handleBulkDelete}
              okText="Так"
              cancelText="Ні"
            >
              <Button 
                danger
                icon={<DeleteOutlined />}
                style={{ marginRight: 16 }}
              >
                Видалити обрані ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => setIsUploadModalVisible(true)}
          >
            Завантажити зображення
          </Button>
        </div>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={images}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} з ${total} зображень`,
          onChange: (page, pageSize) => {
            fetchImages(page, pageSize || 20, searchText, picTypeFilter, tagsFilter);
          },
        }}
        scroll={{ x: 800 }}
      />

      {/* Upload Modal */}
      <Modal
        title="Завантажити зображення"
        open={isUploadModalVisible}
        onOk={handleUpload}
        onCancel={() => {
          setIsUploadModalVisible(false);
          uploadForm.resetFields();
          setFileList([]);
        }}
        confirmLoading={uploading}
        width={600}
        okText="Завантажити"
        cancelText="Скасувати"
      >
        <Form form={uploadForm} layout="vertical">
          <Form.Item
            label="Зображення"
            required
          >
            <Upload
              beforeUpload={(file) => {
                if (!file.type.startsWith('image/')) {
                  message.error('Будь ласка, виберіть файл зображення');
                  return false;
                }
                if (file.size > 10 * 1024 * 1024) {
                  message.error('Розмір файлу не повинен перевищувати 10MB');
                  return false;
                }
                return false;
              }}
              onChange={(info) => {
                setFileList(info.fileList);
              }}
              fileList={fileList}
              multiple
              accept="image/*"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Вибрати зображення (можна декілька)</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
              Підтримуються: JPG, PNG, GIF, WebP (максимум 10MB кожне)
        </div>
          </Form.Item>

          <Form.Item
            name="title"
            label="Назва (опціонально)"
          >
            <Input placeholder="Назва зображення" />
          </Form.Item>

          <Form.Item
            name="pic_type"
            label="Тип зображення"
            initialValue="gallery"
            rules={[{ required: true, message: 'Будь ласка, виберіть тип' }]}
          >
            <Select>
              <Option value="news">Новини</Option>
              <Option value="gallery">Галерея</Option>
              <Option value="avatar">Аватар</Option>
              <Option value="banner">Банер</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Теги"
          >
            <TagInput
              placeholder="Введіть теги через кому..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Редагувати зображення"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingImage(null);
          form.resetFields();
        }}
        width={600}
        okText="Зберегти"
        cancelText="Скасувати"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title_ua"
            label="Назва (українська)"
            rules={[{ required: true, message: 'Будь ласка, введіть назву' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="title_deflang"
            label="Назва (за замовчуванням)"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="pic_type"
            label="Тип зображення"
            rules={[{ required: true, message: 'Будь ласка, виберіть тип' }]}
          >
            <Select>
              <Option value="news">Новини</Option>
              <Option value="gallery">Галерея</Option>
              <Option value="avatar">Аватар</Option>
              <Option value="banner">Банер</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="tags"
            label="Теги"
          >
            <TagInput
              placeholder="Введіть теги через кому..."
            />
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </>
  );
};

export default GalleryPage;
