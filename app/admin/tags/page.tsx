'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import AdminNavigation from '../components/AdminNavigation';
import styles from './tags.module.css';

interface Tag {
  id: number;
  tag: string;
  newsCount: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [replaceTagId, setReplaceTagId] = useState<string>('');
  const [allTagsForSelect, setAllTagsForSelect] = useState<Tag[]>([]);
  const [loadingAllTags, setLoadingAllTags] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 0,
    perPage: 100,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    keyword: '',
    newsId: ''
  });
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  // Завантаження тегів
  const loadTags = async (page: number = 0, filterData?: typeof filters) => {
    setLoading(true);
    try {
      const currentFilters = filterData || filters;
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: pagination.perPage.toString(),
      });

      if (currentFilters.keyword) {
        params.append('keyword', currentFilters.keyword);
      }
      if (currentFilters.newsId) {
        params.append('newsId', currentFilters.newsId);
      }

      const response = await fetch(`/api/admin/tags?${params}`);
      const data = await response.json();

      if (data.success) {
        setTags(data.data);
        setPagination(data.pagination);
      } else {
        // Показати повідомлення про помилку з беку
        alert(data.error || 'Помилка завантаження тегів');
      }
    } catch (error: any) {
      alert(error.message || 'Помилка з\'єднання з сервером');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  // Застосувати фільтри
  const handleFilter = async () => {
    const values = filterForm.getFieldsValue();
    setFilters(values);
    await loadTags(0, values);
  };

  // Скинути фільтри
  const handleResetFilters = async () => {
    filterForm.resetFields();
    const resetFilters = { keyword: '', newsId: '' };
    setFilters(resetFilters);
    await loadTags(0, resetFilters);
  };

  // Завантажити всі теги для випадаючого списку
  const loadAllTagsForSelect = async () => {
    setLoadingAllTags(true);
    try {
      // Завантажуємо всі теги без пагінації
      const params = new URLSearchParams({
        page: '0',
        perPage: '10000' // Завантажуємо всі теги
      });

      const response = await fetch(`/api/admin/tags?${params}`);
      const data = await response.json();

      if (data.success) {
        setAllTagsForSelect(data.data);
      } else {
        message.error(data.error || 'Помилка завантаження тегів');
      }
    } catch (error: any) {
      message.error(error.message || 'Помилка з\'єднання з сервером');
      console.error(error);
    } finally {
      setLoadingAllTags(false);
    }
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

      // Перевіряємо як успішність операції, так і HTTP статус
      if (data.success && response.ok) {
        message.success(editingTag ? 'Тег оновлено' : 'Тег створено');
        closeModal();
        loadTags(pagination.page);
      } else {
        // Показати повідомлення про помилку з беку
        const errorMsg = data.error || 'Помилка збереження';
        alert(errorMsg);
      }
    } catch (error: any) {
      // Обробка помилок валідації або мережевих помилок
      if (error.errorFields) {
        alert('Будь ласка, заповніть всі обов\'язкові поля');
      } else {
        alert(error.message || 'Помилка з\'єднання з сервером');
      }
      console.error(error);
    }
  };

  // Відкрити діалог видалення
  const openDeleteModal = async (tag: Tag) => {
    setDeletingTag(tag);
    setReplaceTagId('');
    setDeleteModalVisible(true);
    // Завантажити всі теги для можливості вибору
    await loadAllTagsForSelect();
  };

  // Видалити тег
  const handleDelete = async () => {
    if (!deletingTag) return;

    try {
      const params = new URLSearchParams({ id: deletingTag.id.toString() });
      if (replaceTagId) {
        params.append('replaceId', replaceTagId);
      }

      const response = await fetch(`/api/admin/tags?${params}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        message.success('Тег успішно видалено');
        setDeleteModalVisible(false);
        setDeletingTag(null);
        setReplaceTagId('');
        loadTags(pagination.page);
      } else {
        // Показати повідомлення про помилку з беку
        alert(data.error || 'Помилка видалення');
      }
    } catch (error: any) {
      alert(error.message || 'Помилка з\'єднання з сервером');
      console.error(error);
    }
  };

  // Зміна сторінки пагінації
  const handlePageChange = (page: number) => {
    loadTags(page - 1); // Ant Design використовує 1-based pagination, API - 0-based
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
      render: (text: string) => (
        <strong 
          style={{ 
            color: '#1890ff', 
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={() => window.open(`/tags/${encodeURIComponent(text)}`, '_blank')}
        >
          {text}
        </strong>
      )
    },
    {
      title: 'Кількість новин',
      dataIndex: 'newsCount',
      key: 'newsCount',
      width: 150,
      align: 'center' as const
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Tag) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            type="primary"
            title="Редагувати"
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => openDeleteModal(record)}
            danger
            title="Видалити"
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
          <h1>Теги</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            size="large"
          >
            Додати тег
          </Button>
        </div>


        {/* Фільтри */}
        <div className={styles.filters}>
          <Form
            form={filterForm}
            layout="inline"
            initialValues={filters}
            className={styles.filterForm}
          >
            <Form.Item name="keyword" label="Ключове слово">
              <Input
                placeholder="Введіть тег"
                style={{ width: 200 }}
                allowClear
                onPressEnter={handleFilter}
              />
            </Form.Item>
            <Form.Item name="newsId" label="ID новини">
              <Input
                placeholder="ID"
                style={{ width: 120 }}
                allowClear
                onPressEnter={handleFilter}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleFilter}
                >
                  Фільтрувати
                </Button>
                <Button onClick={handleResetFilters}>
                  Скинути
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>

        {/* Інформація про кількість */}
        <div className={styles.info}>
          Всього тегів: <strong>{pagination.total}</strong>
        </div>

        {/* Таблиця */}
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page + 1,
            pageSize: pagination.perPage,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: false,
            showTotal: (total) => `Всього: ${total}`
          }}
        />

        {/* Модальне вікно додавання/редагування */}
        <Modal
          title={editingTag ? 'Редагувати тег' : 'Новий тег'}
          open={modalVisible}
          onOk={handleSave}
          onCancel={closeModal}
          okText="Зберегти"
          cancelText="Скасувати"
          width={500}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item
              name="tag"
              label="Назва тегу"
              rules={[
                { required: true, message: 'Введіть назву тегу' },
                { max: 100, message: 'Максимум 100 символів' }
              ]}
            >
              <Input 
                placeholder="Наприклад: політика, економіка"
                onPressEnter={() => form.submit()}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Модальне вікно видалення з можливістю заміни */}
        <Modal
          title="Видалення тегу"
          open={deleteModalVisible}
          onOk={handleDelete}
          onCancel={() => {
            setDeleteModalVisible(false);
            setDeletingTag(null);
            setReplaceTagId('');
          }}
          okText="Видалити"
          cancelText="Скасувати"
          okButtonProps={{ danger: true }}
          width={500}
        >
          <div className={styles.deleteModal}>
            <p>
              Ви впевнені, що хочете видалити тег{' '}
              <strong style={{ color: '#f00' }}>"{deletingTag?.tag}"</strong>?
            </p>
            
            {deletingTag && deletingTag.newsCount > 0 && (
              <div className={styles.replaceSection}>
                <p>
                  Цей тег використовується в <strong>{deletingTag.newsCount}</strong> новинах.
                </p>
                <p>
                  При необхідності, ви можете об'єднати його з іншим існуючим тегом.
                  Виберіть тег для заміни:
                </p>
                <Select
                  showSearch
                  placeholder="Оберіть тег для об'єднання"
                  value={replaceTagId || undefined}
                  onChange={(value) => setReplaceTagId(value)}
                  style={{ width: '100%', marginTop: 10 }}
                  loading={loadingAllTags}
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={allTagsForSelect
                    .filter(t => t.id !== deletingTag.id) // Виключаємо тег, який видаляємо
                    .map(t => ({
                      value: t.id.toString(),
                      label: `${t.tag} (ID: ${t.id}, новин: ${t.newsCount})`
                    }))}
                />
                <p className={styles.hint}>
                  Якщо не обрати тег, видалений тег буде просто видалено зі всіх новин.
                  При об'єднанні всі новини з видаленим тегом отримають обраний тег.
                </p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
