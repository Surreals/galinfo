'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm, 
  Space, 
  Switch,
  InputNumber,
  Upload,
  Image,
  DatePicker,
  Select
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined,
  LinkOutlined
} from '@ant-design/icons';
import AdminNavigation from '../components/AdminNavigation';
import styles from './advertisements.module.css';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface Advertisement {
  id: number;
  title: string;
  image_url: string | null;
  link_url: string;
  placement: string;
  is_active: boolean;
  display_order: number;
  click_count: number;
  view_count: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [form] = Form.useForm();

  // Завантаження реклам
  const loadAdvertisements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/advertisements');
      const data = await response.json();

      if (data.success) {
        setAdvertisements(data.data);
      } else {
        message.error(data.error || 'Помилка завантаження реклами');
      }
    } catch (error: any) {
      message.error(error.message || 'Помилка з\'єднання з сервером');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertisements();
  }, []);

  // Відкрити модальне вікно
  const openModal = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad);
      setImageUrl(ad.image_url || '');
      form.setFieldsValue({
        title: ad.title,
        link_url: ad.link_url,
        placement: ad.placement,
        is_active: ad.is_active,
        display_order: ad.display_order,
        date_range: ad.start_date && ad.end_date ? [
          dayjs(ad.start_date),
          dayjs(ad.end_date)
        ] : null
      });
    } else {
      setEditingAd(null);
      setImageUrl('');
      form.resetFields();
      form.setFieldsValue({
        is_active: true,
        display_order: 0,
        placement: 'general'
      });
    }
    setModalVisible(true);
  };

  // Закрити модальне вікно
  const closeModal = () => {
    setModalVisible(false);
    setEditingAd(null);
    setImageUrl('');
    form.resetFields();
  };

  // Завантажити зображення
  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/advertisements/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.data.url);
        message.success('Зображення завантажено');
      } else {
        message.error(data.error || 'Помилка завантаження зображення');
      }
    } catch (error: any) {
      message.error(error.message || 'Помилка завантаження зображення');
      console.error(error);
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload behavior
  };

  // Зберегти рекламу
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const dateRange = values.date_range;
      
      const adData = {
        title: values.title,
        image_url: imageUrl,
        link_url: values.link_url,
        placement: values.placement || 'general',
        is_active: values.is_active !== undefined ? values.is_active : true,
        display_order: values.display_order || 0,
        start_date: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : null,
        end_date: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : null,
      };

      let response;
      if (editingAd) {
        // Оновлення
        response = await fetch('/api/admin/advertisements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...adData, id: editingAd.id }),
        });
      } else {
        // Створення
        response = await fetch('/api/admin/advertisements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adData),
        });
      }

      const data = await response.json();

      if (data.success) {
        message.success(editingAd ? 'Рекламу оновлено' : 'Рекламу створено');
        closeModal();
        loadAdvertisements();
      } else {
        message.error(data.error || 'Помилка збереження реклами');
      }
    } catch (error: any) {
      message.error(error.message || 'Помилка збереження реклами');
      console.error(error);
    }
  };

  // Видалити рекламу
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/advertisements?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        message.success('Рекламу видалено');
        loadAdvertisements();
      } else {
        message.error(data.error || 'Помилка видалення реклами');
      }
    } catch (error: any) {
      message.error(error.message || 'Помилка видалення реклами');
      console.error(error);
    }
  };

  // Змінити статус активності
  const handleToggleActive = async (ad: Advertisement) => {
    try {
      const response = await fetch('/api/admin/advertisements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ad.id,
          title: ad.title,
          image_url: ad.image_url,
          link_url: ad.link_url,
          placement: ad.placement,
          is_active: !ad.is_active,
          display_order: ad.display_order,
          start_date: ad.start_date,
          end_date: ad.end_date,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success(`Рекламу ${!ad.is_active ? 'активовано' : 'деактивовано'}`);
        loadAdvertisements();
      } else {
        message.error(data.error || 'Помилка зміни статусу');
      }
    } catch (error: any) {
      message.error(error.message || 'Помилка зміни статусу');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Зображення',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 120,
      render: (imageUrl: string | null) => (
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="Advertisement"
            width={80}
            height={60}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 80, height: 60, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Немає фото
          </div>
        )
      ),
    },
    {
      title: 'Назва',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Позиція',
      dataIndex: 'placement',
      key: 'placement',
      width: 120,
      render: (placement: string) => {
        const placements: Record<string, string> = {
          adbanner: 'AdBanner',
          infomo: 'Infomo',
          sidebar: 'Sidebar',
          general: 'Загальна'
        };
        return placements[placement] || placement;
      },
    },
    {
      title: 'Посилання',
      dataIndex: 'link_url',
      key: 'link_url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <LinkOutlined /> {url.substring(0, 40)}...
        </a>
      ),
    },
    {
      title: 'Активна',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean, record: Advertisement) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
        />
      ),
    },
    {
      title: 'Порядок',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
      sorter: (a: Advertisement, b: Advertisement) => a.display_order - b.display_order,
    },
    {
      title: 'Кліки',
      dataIndex: 'click_count',
      key: 'click_count',
      width: 80,
    },
    {
      title: 'Покази',
      dataIndex: 'view_count',
      key: 'view_count',
      width: 80,
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 150,
      render: (_: any, record: Advertisement) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Редагувати
          </Button>
          <Popconfirm
            title="Видалити рекламу?"
            description="Ви впевнені, що хочете видалити цю рекламу?"
            onConfirm={() => handleDelete(record.id)}
            okText="Так"
            cancelText="Ні"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Видалити
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <AdminNavigation />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Управління рекламою</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Додати рекламу
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={advertisements}
          loading={loading}
          rowKey="id"
          pagination={{
            total: advertisements.length,
            pageSize: 20,
            showTotal: (total) => `Всього: ${total}`,
          }}
        />

        <Modal
          title={editingAd ? 'Редагувати рекламу' : 'Додати рекламу'}
          open={modalVisible}
          onOk={handleSave}
          onCancel={closeModal}
          width={700}
          okText="Зберегти"
          cancelText="Скасувати"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              is_active: true,
              display_order: 0,
            }}
          >
            <Form.Item
              label="Назва реклами"
              name="title"
              rules={[{ required: true, message: 'Введіть назву реклами' }]}
            >
              <Input placeholder="Назва реклами" />
            </Form.Item>

            <Form.Item
              label="Позиція реклами"
              name="placement"
              rules={[{ required: true, message: 'Виберіть позицію реклами' }]}
              tooltip="Де буде показуватися ця реклама"
            >
              <Select placeholder="Виберіть позицію">
                <Select.Option value="adbanner">AdBanner (головна реклама)</Select.Option>
                <Select.Option value="infomo">Infomo (IN-FOMO банер)</Select.Option>
                <Select.Option value="sidebar">Sidebar (бокова панель)</Select.Option>
                <Select.Option value="general">Загальна</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Зображення">
              <Upload
                beforeUpload={handleUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Завантажити зображення
                </Button>
              </Upload>
              {imageUrl && (
                <div style={{ marginTop: 10 }}>
                  <Image src={imageUrl} alt="Preview" width={200} />
                </div>
              )}
            </Form.Item>

            <Form.Item
              label="URL посилання"
              name="link_url"
              rules={[
                { required: true, message: 'Введіть URL посилання' },
                { type: 'url', message: 'Введіть коректний URL' }
              ]}
            >
              <Input placeholder="https://example.com" prefix={<LinkOutlined />} />
            </Form.Item>

            <Form.Item
              label="Порядок відображення"
              name="display_order"
              tooltip="Менше число = вища позиція"
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Період показу"
              name="date_range"
              tooltip="Залиште порожнім для постійного показу"
            >
              <RangePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="Активна"
              name="is_active"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

