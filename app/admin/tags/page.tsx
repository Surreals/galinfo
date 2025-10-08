'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag as AntTag, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import AdminNavigation from '../components/AdminNavigation';
import styles from './tags.module.css';

interface Tag {
  id: number;
  tag: string;
  usage_count?: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [searchText, setSearchText] = useState('');
  const [replaceTagId, setReplaceTagId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // Завантаження тегів
  const loadTags = async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        withUsageCount: 'true'
      });
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`/api/admin/tags?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTags(data.data);
      } else {
        message.error('Помилка завантаження тегів');
      }
    } catch (error) {
      message.error('Помилка з\'єднання з сервером');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Завантаження всіх тегів для вибору при видаленні
  const loadAllTags = async () => {
    try {
      const response = await fetch('/api/admin/tags');
      const data = await response.json();
      
      if (data.success) {
        setAllTags(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadTags();
    loadAllTags();
  }, []);

  // Пошук
  const handleSearch = () => {
    loadTags(searchText);
  };

  // Скинути пошук
  const handleResetSearch = () => {
    setSearchText('');
    loadTags();
  };

  // Відкрити модальне вікно для створення/редагування
  const openModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      form.setFieldsValue({ tag: tag.tag });
    } else {
      setEditingTag(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Закрити модальне вікно
  const closeModal = () => {
    setModalVisible(false);
    setEditingTag(null);
    form.resetFields();
  };

  // Зберегти тег
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const method = editingTag ? 'PUT' : 'POST';
      const body = editingTag 
        ? { ...values, id: editingTag.id }
        : values;

      const response = await fetch('/api/admin/tags', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        message.success(editingTag ? 'Тег оновлено' : 'Тег створено');
        closeModal();
        loadTags(searchText);
      } else {
        message.error(data.error || 'Помилка збереження');
      }
    } catch (error) {
      message.error('Помилка валідації форми');
      console.error(error);
    }
  };

  // Відкрити діалог видалення
  const openDeleteModal = (tag: Tag) => {
    setDeletingTag(tag);
    setReplaceTagId(null);
    setDeleteModalVisible(true);
  };

  // Видалити тег
  const handleDelete = async () => {
    if (!deletingTag) return;

    try {
      const params = new URLSearchParams({ id: String(deletingTag.id) });
      if (replaceTagId) {
        params.append('replaceWithId', String(replaceTagId));
      }

      const response = await fetch(`/api/admin/tags?${params}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        message.success('Тег видалено');
        setDeleteModalVisible(false);
        setDeletingTag(null);
        setReplaceTagId(null);
        loadTags(searchText);
      } else {
        message.error(data.error || 'Помилка видалення');
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
      width: 80
    },
    {
      title: 'Тег',
      dataIndex: 'tag',
      key: 'tag',
      render: (text: string) => <AntTag color="blue">{text}</AntTag>
    },
    {
      title: 'Кількість використань',
      dataIndex: 'usage_count',
      key: 'usage_count',
      width: 200,
      render: (count: number) => (
        <AntTag color={count > 0 ? 'green' : 'default'}>
          {count || 0} {count === 1 ? 'новина' : 'новин'}
        </AntTag>
      ),
      sorter: (a: Tag, b: Tag) => (a.usage_count || 0) - (b.usage_count || 0)
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 150,
      render: (_: any, record: Tag) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            type="primary"
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => openDeleteModal(record)}
            danger
          />
        </Space>
      )
    }
  ];

  return (
    <div className={styles.tagsPage}>
      <AdminNavigation />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Управління тегами</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            size="large"
          >
            Додати тег
          </Button>
        </div>

        <div className={styles.searchBar}>
          <Input
            placeholder="Пошук тегів..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Button onClick={handleSearch} type="primary">
            Пошук
          </Button>
          <Button onClick={handleResetSearch}>
            Скинути
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showTotal: (total) => `Всього: ${total} тегів`
          }}
        />

        {/* Модальне вікно створення/редагування */}
        <Modal
          title={editingTag ? 'Редагувати тег' : 'Новий тег'}
          open={modalVisible}
          onOk={handleSave}
          onCancel={closeModal}
          okText="Зберегти"
          cancelText="Скасувати"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="tag"
              label="Назва тегу"
              rules={[
                { required: true, message: 'Введіть назву тегу' },
                { min: 2, message: 'Мінімум 2 символи' }
              ]}
            >
              <Input placeholder="Наприклад: Львів" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Модальне вікно видалення */}
        <Modal
          title="Видалити тег"
          open={deleteModalVisible}
          onOk={handleDelete}
          onCancel={() => {
            setDeleteModalVisible(false);
            setDeletingTag(null);
            setReplaceTagId(null);
          }}
          okText="Видалити"
          cancelText="Скасувати"
          okButtonProps={{ danger: true }}
        >
          {deletingTag && (
            <div>
              <p>
                Ви дійсно хочете видалити тег <strong>"{deletingTag.tag}"</strong>?
              </p>
              {deletingTag.usage_count && deletingTag.usage_count > 0 && (
                <div className={styles.warningBox}>
                  <p>
                    ⚠️ Цей тег використовується в <strong>{deletingTag.usage_count}</strong> новинах.
                  </p>
                  <p>Ви можете замінити його на інший тег:</p>
                  <Select
                    placeholder="Виберіть тег для заміни (опціонально)"
                    style={{ width: '100%' }}
                    value={replaceTagId}
                    onChange={(value) => setReplaceTagId(value)}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {allTags
                      .filter(t => t.id !== deletingTag.id)
                      .map(t => (
                        <Select.Option key={t.id} value={t.id}>
                          {t.tag}
                        </Select.Option>
                      ))
                    }
                  </Select>
                  {!replaceTagId && (
                    <p className={styles.warningText}>
                      Якщо не вказати тег для заміни, він буде просто видалений з усіх новин.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

