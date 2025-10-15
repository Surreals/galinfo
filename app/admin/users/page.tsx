'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Button, Tag, Space, Modal, Form, Checkbox, message, Popconfirm, Select, Tabs } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, UserDeleteOutlined } from '@ant-design/icons';
import AdminNavigation from '../components/AdminNavigation';
import { useAdminAuth } from '@/app/contexts/AdminAuthContext';
import { UserRole, ROLE_LABELS } from '@/app/types/roles';
import styles from './users.module.css';

interface User {
  id: number;
  uname_ua: string;
  uname: string;
  uagency: string;
  active: number;
  perm: string;
  role: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('active');
  
  const isCurrentUserAdmin = currentUser?.role === UserRole.ADMIN;

  // Available permissions for display purposes
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
    
    form.setFieldsValue({
      uname_ua: user.uname_ua || '',
      uname: user.uname || '',
      uagency: user.uagency || '',
      upass: '',
      active: user.active === 1,
      role: user.role || 'journalist'
    });
    setIsModalVisible(true);
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success('Користувача успішно деактивовано');
        await fetchUsers();
      } else {
        message.error(data.error || 'Помилка деактивації користувача');
      }
    } catch (err) {
      message.error('Помилка з\'єднання з сервером');
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success('Користувача успішно активовано');
        await fetchUsers();
      } else {
        message.error(data.error || 'Помилка активації користувача');
      }
    } catch (err) {
      message.error('Помилка з\'єднання з сервером');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Prevent admin from changing their own role
      if (editingUser && editingUser.id === currentUser?.id && values.role !== currentUser?.role) {
        message.error('Ви не можете змінити свою власну роль');
        return;
      }
      
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Permissions are now auto-assigned based on role on the backend
      const submitData = {
        uname_ua: values.uname_ua,
        uname: values.uname,
        uagency: values.uagency,
        upass: values.upass,
        active: values.active,
        role: values.role
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

  // Filter users based on search term and active tab
  const filteredUsers = users.filter(user => {
    // Filter by active/inactive status based on current tab
    const isActive = user.active === 1;
    const matchesTab = (activeTab === 'active' && isActive) || (activeTab === 'inactive' && !isActive);
    
    if (!matchesTab) return false;
    
    // Filter by search term
    if (!searchTerm) return true;
    
    return user.uname_ua.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.uname.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.uagency && user.uagency.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'red';
      case UserRole.EDITOR:
        return 'orange';
      case UserRole.JOURNALIST:
        return 'blue';
      default:
        return 'default';
    }
  };

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
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {ROLE_LABELS[role as UserRole] || role}
        </Tag>
      ),
      filters: [
        { text: 'Адміністратор', value: UserRole.ADMIN },
        { text: 'Редактор', value: UserRole.EDITOR },
        { text: 'Журналіст', value: UserRole.JOURNALIST },
      ],
      onFilter: (value: any, record: User) => record.role === value,
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
            disabled={!isCurrentUserAdmin}
          />
          {record.active === 1 ? (
            <Popconfirm
              title="Ви впевнені, що хочете деактивувати цього користувача?"
              description="Користувач буде розлогінений і втратить доступ до системи."
              onConfirm={() => handleDeactivateUser(record.id)}
              okText="Так"
              cancelText="Ні"
              disabled={!isCurrentUserAdmin}
            >
              <Button
                type="text"
                danger
                icon={<UserDeleteOutlined />}
                title="Деактивувати"
                disabled={!isCurrentUserAdmin}
              />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Ви впевнені, що хочете активувати цього користувача?"
              onConfirm={() => handleActivateUser(record.id)}
              okText="Так"
              cancelText="Ні"
              disabled={!isCurrentUserAdmin}
            >
              <Button
                type="text"
                icon={<UserOutlined />}
                title="Активувати"
                disabled={!isCurrentUserAdmin}
              />
            </Popconfirm>
          )}
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
              disabled={!isCurrentUserAdmin}
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
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'active',
                label: (
                  <span>
                    <UserOutlined />
                    Активні ({users.filter(u => u.active === 1).length})
                  </span>
                ),
                children: (
                  <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 15,
                      showSizeChanger: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} з ${total} активних користувачів`,
                    }}
                    scroll={{ x: 800 }}
                  />
                ),
              },
              {
                key: 'inactive',
                label: (
                  <span>
                    <UserDeleteOutlined />
                    Неактивні ({users.filter(u => u.active === 0).length})
                  </span>
                ),
                children: (
                  <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 15,
                      showSizeChanger: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} з ${total} неактивних користувачів`,
                    }}
                    scroll={{ x: 800 }}
                  />
                ),
              },
            ]}
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
              role: 'journalist'
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
              label="Роль користувача"
              name="role"
              rules={[{ required: true, message: 'Будь ласка, оберіть роль' }]}
              tooltip="Права доступу автоматично призначаються відповідно до обраної ролі"
            >
              <Select 
                placeholder="Оберіть роль"
                disabled={editingUser?.id === currentUser?.id}
              >
                <Select.Option value={UserRole.ADMIN}>
                  {ROLE_LABELS[UserRole.ADMIN]}
                </Select.Option>
                <Select.Option value={UserRole.EDITOR}>
                  {ROLE_LABELS[UserRole.EDITOR]}
                </Select.Option>
                <Select.Option value={UserRole.JOURNALIST}>
                  {ROLE_LABELS[UserRole.JOURNALIST]}
                </Select.Option>
              </Select>
            </Form.Item>
            
            {editingUser?.id === currentUser?.id && (
              <div style={{ marginBottom: '16px', padding: '8px', background: '#fff7e6', border: '1px solid #ffd666', borderRadius: '4px' }}>
                <small>⚠️ Ви не можете змінити свою власну роль</small>
              </div>
            )}

            <div style={{ 
              marginBottom: '16px', 
              padding: '12px', 
              background: '#f0f5ff', 
              border: '1px solid #adc6ff', 
              borderRadius: '4px'
            }}>
              <strong>Опис ролей:</strong>
              <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
                <li><strong>Адміністратор:</strong> повний доступ до всіх функцій адмінки</li>
                <li><strong>Редактор:</strong> створення, редагування та публікація новин, статей та медіа. Видалення новини тільки в чернетки</li>
                <li><strong>Журналіст:</strong> створення та редагування новин, статей та медіа з розміщенням тільки в чернетках</li>
              </ul>
            </div>

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
