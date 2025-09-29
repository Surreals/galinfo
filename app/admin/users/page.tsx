'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Button, Tag, Space, Modal, Form, Checkbox, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminNavigation from '../components/AdminNavigation';
import styles from './users.module.css';

interface User {
  id: number;
  uname_ua: string;
  uname: string;
  uagency: string;
  active: number;
  perm: string;
}

interface Permission {
  key: string;
  name: string;
  value: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Define available permissions based on PHP implementation
  const availablePermissions: { key: string; name: string }[] = [
    { key: 'ac_usermanage', name: 'Управління користувачами' },
    { key: 'ac_newsmanage', name: 'Управління новинами' },
    { key: 'ac_articlemanage', name: 'Управління статтями' },
    { key: 'ac_commentmanage', name: 'Управління коментарями' },
    { key: 'ac_sitemanage', name: 'Управління сайтом' },
    { key: 'ac_admanage', name: 'Управління рекламою' },
    { key: 'ac_telegrammanage', name: 'Управління Telegram' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        message.error(data.error || 'Помилка завантаження користувачів');
      }
    } catch (err) {
      message.error('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    
    let permissions: Record<string, any> = {};
    try {
      permissions = user.perm ? JSON.parse(user.perm) : {};
    } catch (error) {
      console.error('Error parsing permissions for user:', user.uname, error);
      permissions = {};
    }
    
    // Convert permissions object to array of keys for Checkbox.Group
    const permissionKeys = Object.keys(permissions).filter(key => permissions[key] === true || permissions[key] === 1);
    
    form.setFieldsValue({
      uname_ua: user.uname_ua || '',
      uname: user.uname || '',
      uagency: user.uagency || '',
      upass: '',
      active: user.active === 1,
      permissions: permissionKeys
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success('Користувача успішно видалено');
        await fetchUsers();
      } else {
        message.error(data.error || 'Помилка видалення користувача');
      }
    } catch (err) {
      message.error('Помилка з\'єднання з сервером');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Convert permissions array back to object
      const permissionsObj: Record<string, boolean> = {};
      if (values.permissions && Array.isArray(values.permissions)) {
        values.permissions.forEach((perm: string) => {
          permissionsObj[perm] = true;
        });
      }
      
      const submitData = {
        ...values,
        permissions: permissionsObj
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success(editingUser ? 'Користувача успішно оновлено' : 'Користувача успішно створено');
        setIsModalVisible(false);
        form.resetFields();
        await fetchUsers();
      } else {
        message.error(data.error || 'Помилка збереження користувача');
      }
    } catch (err) {
      message.error('Помилка з\'єднання з сервером');
    }
  };

  const renderPermissions = (permissions: string) => {
    try {
      // Handle empty or null permissions
      if (!permissions || permissions.trim() === '') {
        return <Tag color="default">Немає прав</Tag>;
      }

      let permObj;
      
      // Try to parse as JSON first
      try {
        permObj = JSON.parse(permissions);
      } catch (jsonError) {
        
        // Check if it might be PHP serialized data
        if (permissions.includes('a:') || permissions.includes('s:')) {
          return <Tag color="orange">PHP серіалізовані права (потрібно оновити)</Tag>;
        }
        
        // If it looks like a simple string, try to treat it as a comma-separated list
        if (permissions.includes(',')) {
          const permList = permissions.split(',').map(p => p.trim());
          return permList.map(perm => (
            <Tag key={perm} color="purple">
              {perm}
            </Tag>
          ));
        }
        
        return <Tag color="orange">Невідомий формат прав</Tag>;
      }
      
      if (!permObj || typeof permObj !== 'object' || Object.keys(permObj).length === 0) {
        return <Tag color="default">Немає прав</Tag>;
      }
      
      return availablePermissions
        .filter(perm => permObj[perm.key] === true || permObj[perm.key] === 1)
        .map(perm => (
          <Tag key={perm.key} color="blue">
            {perm.name}
          </Tag>
        ));
    } catch (error) {
      console.error('Error parsing permissions:', error, permissions);
      return <Tag color="red">Помилка парсингу прав</Tag>;
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    !searchTerm || 
    user.uname_ua.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.uagency && user.uagency.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Table columns definition
  const columns = [
    {
      title: 'Користувач',
      dataIndex: 'uname_ua',
      key: 'uname_ua',
      render: (text: string) => text || 'Не вказано',
      sorter: (a: User, b: User) => (a.uname_ua || '').localeCompare(b.uname_ua || ''),
    },
    {
      title: 'Логін',
      dataIndex: 'uname',
      key: 'uname',
      sorter: (a: User, b: User) => a.uname.localeCompare(b.uname),
    },
    {
      title: 'Агенція',
      dataIndex: 'uagency',
      key: 'uagency',
      render: (text: string) => text || 'Не вказано',
    },
    {
      title: 'Права доступу',
      dataIndex: 'perm',
      key: 'perm',
      render: (permissions: string) => renderPermissions(permissions),
    },
    {
      title: 'Статус',
      dataIndex: 'active',
      key: 'active',
      render: (active: number) => (
        <Tag color={active === 1 ? 'green' : 'red'}>
          {active === 1 ? 'Активний' : 'Неактивний'}
        </Tag>
      ),
      filters: [
        { text: 'Активний', value: 1 },
        { text: 'Неактивний', value: 0 },
      ],
      onFilter: (value: any, record: User) => record.active === value,
    },
    {
      title: 'Дії',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            title="Редагувати"
          />
          <Popconfirm
            title="Ви впевнені, що хочете видалити цього користувача?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Так"
            cancelText="Ні"
          >
            <Button
              type="text"
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
    <div className={styles.usersPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1>Користувачі</h1>
              <p>Управління користувачами та правами доступу</p>
            </div>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddUser}
            >
              Додати користувача
            </Button>
          </div>
          
          <div className={styles.searchContainer}>
            <Input
              placeholder="Пошук за іменем, логіном або агенцією..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} з ${total} користувачів`,
            }}
            scroll={{ x: 800 }}
          />
        </div>

        <Modal
          title={editingUser ? 'Редагувати користувача' : 'Додати користувача'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              active: true,
              permissions: []
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                label="Повне ім'я (українською)"
                name="uname_ua"
                rules={[{ required: true, message: 'Будь ласка, введіть повне ім\'я' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Агенція"
                name="uagency"
              >
                <Input />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                label="Логін"
                name="uname"
                rules={[{ required: true, message: 'Будь ласка, введіть логін' }]}
              >
                <Input disabled={!!editingUser} />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="upass"
                rules={editingUser ? [] : [{ required: true, message: 'Будь ласка, введіть пароль' }]}
              >
                <Input.Password 
                  placeholder={editingUser ? 'Залиште порожнім, щоб не змінювати' : ''}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Права доступу"
              name="permissions"
            >
              <Checkbox.Group style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '8px' }}>
                {availablePermissions.map(perm => (
                  <Checkbox key={perm.key} value={perm.key}>
                    {perm.name}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="active"
              valuePropName="checked"
            >
              <Checkbox>Активний користувач</Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}>
                  Скасувати
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingUser ? 'Зберегти зміни' : 'Додати користувача'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
