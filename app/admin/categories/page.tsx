'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, message, Popconfirm, Space, Tag, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import AdminNavigation from '../components/AdminNavigation';
import styles from './categories.module.css';

const { Option } = Select;
const { TabPane } = Tabs;

interface Category {
  id: number;
  title: string;
  cattype: number;
  param: string;
  description?: string;
  isvis: number;
  orderid: number;
  lng?: string;
}

const CATEGORY_TYPES = {
  1: { name: 'Основні категорії', color: 'blue' },
  2: { name: 'Спеціальні теми', color: 'green' },
  3: { name: 'Регіони', color: 'orange' }
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();

  // Завантаження категорій
  const loadCategories = async (cattype?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        includeHidden: 'true',
        lang: '1'
      });
      if (cattype) {
        params.append('cattype', cattype);
      }
      
      const response = await fetch(`/api/admin/categories?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        message.error('Помилка завантаження категорій');
      }
    } catch (error) {
      message.error('Помилка з\'єднання з сервером');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(activeTab);
  }, [activeTab]);

  // Відкрити модальне вікно для створення/редагування
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue(category);
    } else {
      setEditingCategory(null);
      form.resetFields();
      form.setFieldsValue({ 
        cattype: parseInt(activeTab),
        isvis: 1 
      });
    }
    setModalVisible(true);
  };

  // Закрити модальне вікно
  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Зберегти категорію
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { ...values, id: editingCategory.id }
        : values;

      const response = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        message.success(editingCategory ? 'Категорію оновлено' : 'Категорію створено');
        closeModal();
        loadCategories(activeTab);
      } else {
        message.error(data.error || 'Помилка збереження');
      }
    } catch (error) {
      message.error('Помилка валідації форми');
      console.error(error);
    }
  };

  // Видалити категорію
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        message.success('Категорію видалено');
        loadCategories(activeTab);
      } else {
        message.error(data.error || 'Помилка видалення');
      }
    } catch (error) {
      message.error('Помилка з\'єднання з сервером');
      console.error(error);
    }
  };

  // Змінити порядок
  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', id, direction })
      });

      const data = await response.json();

      if (data.success) {
        loadCategories(activeTab);
      } else {
        message.error(data.error || 'Помилка зміни порядку');
      }
    } catch (error) {
      message.error('Помилка з\'єднання з сервером');
      console.error(error);
    }
  };

  // Змінити видимість
  const handleToggleVisibility = async (id: number) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-visibility', id })
      });

      const data = await response.json();

      if (data.success) {
        loadCategories(activeTab);
      } else {
        message.error(data.error || 'Помилка зміни видимості');
      }
    } catch (error) {
      message.error('Помилка з\'єднання з сервером');
      console.error(error);
    }
  };

  // Колонки таблиці
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'Порядок',
      dataIndex: 'orderid',
      key: 'orderid',
      width: 80,
      sorter: (a: Category, b: Category) => a.orderid - b.orderid
    },
    {
      title: 'Назва',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Category) => (
        <Space>
          <strong>{text}</strong>
          {!record.isvis && <Tag color="red">Прихована</Tag>}
        </Space>
      )
    },
    {
      title: 'Параметр (URL)',
      dataIndex: 'param',
      key: 'param',
      render: (text: string) => <code>/{text}/</code>
    },
    {
      title: 'Опис',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 280,
      fixed: 'right' as const,
      render: (_: any, record: Category) => (
        <div className={styles.actionsColumn}>
          <Button
            size="small"
            icon={<ArrowUpOutlined />}
            onClick={() => handleReorder(record.id, 'up')}
            title="Вгору"
          />
          <Button
            size="small"
            icon={<ArrowDownOutlined />}
            onClick={() => handleReorder(record.id, 'down')}
            title="Вниз"
          />
          <Button
            size="small"
            icon={record.isvis ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => handleToggleVisibility(record.id)}
            title={record.isvis ? 'Сховати' : 'Показати'}
            type={record.isvis ? 'default' : 'dashed'}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            type="primary"
          />
          <Popconfirm
            title="Видалити категорію?"
            description="Ця дія незворотна"
            onConfirm={() => handleDelete(record.id)}
            okText="Видалити"
            cancelText="Скасувати"
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className={styles.categoriesPage}>
      <AdminNavigation />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Управління категоріями</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            size="large"
          >
            Додати категорію
          </Button>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: (
                <span>
                  <Tag color={CATEGORY_TYPES[1].color}>{CATEGORY_TYPES[1].name}</Tag>
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={categories}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                />
              )
            },
            {
              key: '2',
              label: (
                <span>
                  <Tag color={CATEGORY_TYPES[2].color}>{CATEGORY_TYPES[2].name}</Tag>
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={categories}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                />
              )
            },
            {
              key: '3',
              label: (
                <span>
                  <Tag color={CATEGORY_TYPES[3].color}>{CATEGORY_TYPES[3].name}</Tag>
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={categories}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                />
              )
            }
          ]}
        />

        <Modal
          title={editingCategory ? 'Редагувати категорію' : 'Нова категорія'}
          open={modalVisible}
          onOk={handleSave}
          onCancel={closeModal}
          okText="Зберегти"
          cancelText="Скасувати"
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ isvis: 1 }}
          >
            <Form.Item
              name="title"
              label="Назва категорії"
              rules={[{ required: true, message: 'Введіть назву' }]}
            >
              <Input placeholder="Наприклад: Суспільство" />
            </Form.Item>

            <Form.Item
              name="param"
              label="Параметр (URL slug)"
              rules={[
                { required: true, message: 'Введіть параметр' },
                { pattern: /^[a-z0-9-]+$/, message: 'Тільки малі латинські літери, цифри та дефіс' }
              ]}
            >
              <Input placeholder="наприклад: society" />
            </Form.Item>

            <Form.Item
              name="cattype"
              label="Тип категорії"
              rules={[{ required: true, message: 'Виберіть тип' }]}
            >
              <Select disabled={!!editingCategory}>
                <Option value={1}>
                  <Tag color="blue">Основна категорія</Tag>
                </Option>
                <Option value={2}>
                  <Tag color="green">Спеціальна тема</Tag>
                </Option>
                <Option value={3}>
                  <Tag color="orange">Регіон</Tag>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Опис (опціонально)"
            >
              <Input.TextArea rows={3} placeholder="Короткий опис категорії" />
            </Form.Item>

            <Form.Item
              name="isvis"
              label="Видимість"
              valuePropName="checked"
              getValueFromEvent={(checked) => checked ? 1 : 0}
              getValueProps={(value) => ({ checked: value === 1 })}
            >
              <Switch checkedChildren="Видима" unCheckedChildren="Прихована" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

