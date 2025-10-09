'use client';

import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Button, Tag, Table } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, LinkOutlined, FileOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminNavigation from '../components/AdminNavigation';
import styles from './news.module.css';
import { useRolePermissions } from '@/app/hooks/useRolePermissions';

// Функція для перевірки, чи новина запланована на майбутнє
const isNewsScheduled = (formattedDate: string, formattedTime: string): boolean => {
  try {
    // formattedDate має формат DD.MM.YYYY (наприклад, "10.10.2025")
    // formattedTime має формат HH:mm:ss (наприклад, "21:22:00")
    
    // Обрізаємо секунди з часу
    const timeWithoutSeconds = formattedTime.split(':').slice(0, 2).join(':');
    
    // Перетворюємо DD.MM.YYYY в YYYY-MM-DD
    const [day, month, year] = formattedDate.split('.');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Об'єднуємо в ISO формат
    const fullDateTime = dayjs(`${isoDate}T${timeWithoutSeconds}`);
    
    return fullDateTime.isAfter(dayjs());
  } catch (error) {
    console.error('Error checking if news is scheduled:', error);
    return false;
  }
};

const NEWS_TAB_TYPES = {
  all: { name: 'Підтверджені', color: 'blue' },
  drafts: { name: 'Чернетки', color: 'gold' }
};

interface NewsItem {
  id: number;
  nheader: string;
  nteaser: string;
  ndate: string;
  ntime: string;
  ntype: number;
  nweight: number;
  approved: number;
  images: any[];
  authorDisplayName: string;
  views_count: number;
  formattedDate: string;
  formattedTime: string;
  typeName: string;
  isImportant: boolean;
  isTopNews: boolean;
  isDelayed: boolean;
  urlkey?: string;
}

interface NewsListResponse {
  news: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    lang: string;
    status: string;
    type: string;
    rubric: string;
    theme: string;
    author: string;
    keyword: string;
    newsId: string;
    dateFrom: string;
    dateTo: string;
    sortBy: string;
    sortOrder: string;
  };
}

export default function NewsPage() {
  const router = useRouter();
  const { isAdmin } = useRolePermissions();
  const [newsData, setNewsData] = useState<NewsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    newsId: number | null;
    newsTitle: string;
    isApproved: boolean; // Додаємо інформацію про статус новини
  }>({
    isOpen: false,
    newsId: null,
    newsTitle: '',
    isApproved: false
  });
  const [deleting, setDeleting] = useState(false);
  const [isUpdatingUrlKeys, setIsUpdatingUrlKeys] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'drafts'>('all');
  const previousPageRef = useRef(1);
  
  // Фільтри
  const [filters, setFilters] = useState({
    page: 1,
    limit: 15,
    status: 'all',
    type: 'all',
    rubric: 'all',
    theme: 'all',
    author: 'all',
    keyword: '',
    newsId: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'ndate',
    sortOrder: 'DESC'
  });

  // Завантаження даних
  const fetchNews = async (isPaginationChange = false) => {
    try {
      if (isPaginationChange) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const params = new URLSearchParams();
      
      // Додаємо фільтри до параметрів запиту
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString());
        }
      });
      
      // Встановлюємо статус залежно від активного табу
      if (activeTab === 'drafts') {
        // В табі "Чернетки" показуємо тільки неопубліковані новини
        params.set('status', 'unpublished');
      } else {
        // В табі "Всі новини" показуємо тільки опубліковані новини
        params.set('status', 'published');
      }
      
      const response = await fetch(`/api/admin/news?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setNewsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      if (isPaginationChange) {
        setPaginationLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Check if only the page or limit changed
    const isPageChange = filters.page !== previousPageRef.current;
    
    fetchNews(isPageChange);
    previousPageRef.current = filters.page;
  }, [filters, activeTab]);

  // Обробка зміни табу
  const handleTabChange = (key: string) => {
    setActiveTab(key as 'all' | 'drafts');
    // Скидаємо сторінку при зміні табу
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Обробка зміни фільтрів
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Скидаємо на першу сторінку при зміні фільтрів
    }));
  };

  // Обробка пагінації
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Обробка зміни розміру сторінки
  const handlePageSizeChange = (current: number, size: number) => {
    setFilters(prev => ({ ...prev, page: 1, limit: size }));
  };

  // Обробка редагування новини
  const handleEditNews = (newsId: number) => {
    router.push(`/admin/article-editor?id=${newsId}`);
  };

  // Обробка додавання нової новини
  const handleAddNews = () => {
    router.push('/admin/article-editor');
  };

  // Повернення на головну сторінку адмінки
  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  // Обробка оновлення URL ключів
  const handleUpdateUrlKeys = async () => {
    if (!confirm('Ви впевнені, що хочете оновити URL ключі для всіх новин без них? Це може зайняти деякий час.')) {
      return;
    }

    setIsUpdatingUrlKeys(true);
    try {
      const response = await fetch('/api/admin/news/update-url-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        alert(`Оновлено ${result.updated} новин. Помилок: ${result.errors}`);
        // Перезавантажуємо список новин
        fetchNews();
      } else {
        alert('Помилка при оновленні URL ключів: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating URL keys:', error);
      alert('Помилка при оновленні URL ключів');
    } finally {
      setIsUpdatingUrlKeys(false);
    }
  };

  // Обробка видалення новини
  const handleDeleteNews = (newsId: number, newsTitle: string, isApproved: boolean) => {
    setDeleteConfirm({
      isOpen: true,
      newsId,
      newsTitle,
      isApproved
    });
  };

  // Підтвердження видалення або перенесення в чернетки
  const confirmDelete = async () => {
    if (!deleteConfirm.newsId) return;
    
    try {
      setDeleting(true);
      
      let response;
      
      // Якщо новина підтверджена (approved = true), переносимо в чернетки
      if (deleteConfirm.isApproved) {
        response = await fetch(`/api/admin/news/move-to-draft?id=${deleteConfirm.newsId}`, {
          method: 'PUT'
        });
      } else {
        // Якщо новина в чернетках (approved = false), видаляємо (тільки для адміна)
        response = await fetch(`/api/admin/news?id=${deleteConfirm.newsId}`, {
          method: 'DELETE'
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }
      
      // Оновлюємо список новин
      await fetchNews();
      
      // Закриваємо діалог підтвердження
      setDeleteConfirm({
        isOpen: false,
        newsId: null,
        newsTitle: '',
        isApproved: false
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeleting(false);
    }
  };

  // Скасування видалення
  const cancelDelete = () => {
    setDeleteConfirm({
      isOpen: false,
      newsId: null,
      newsTitle: '',
      isApproved: false
    });
  };

  // Конфігурація колонок для Ant Design Table
  const columns = [
    {
      title: 'Дата/Час',
      dataIndex: 'formattedDate',
      key: 'date',
      width: 120,
      render: (date: string, record: NewsItem) => (
        <div>
          <div className={styles.date}>{date}</div>
          <div className={styles.time}>{record.formattedTime}</div>
        </div>
      ),
    },
    {
      title: 'Заголовок',
      dataIndex: 'nheader',
      key: 'title',
      width: 300,
      render: (title: string, record: NewsItem) => (
        <div 
          className={styles.title}
          onClick={() => handleEditNews(record.id)}
          style={{ cursor: 'pointer' }}
          title="Клікніть для редагування"
        >
          <span className={styles.newsId}>#{record.id}</span>
          {title || 'Без заголовка'}
          {record.images.length > 0 && (
            <span className={styles.imageIcon}>📷</span>
          )}
        </div>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'typeName',
      key: 'type',
      width: 120,
      render: (typeName: string, record: NewsItem) => (
        <span className={`${styles.type} ${styles[`type-${record.ntype}`]}`}>
          {typeName}
        </span>
      ),
    },
    {
      title: 'Автор',
      dataIndex: 'authorDisplayName',
      key: 'author',
      width: 150,
    },
    {
      title: 'Статус',
      dataIndex: 'approved',
      key: 'status',
      width: 120,
      render: (approved: number, record: NewsItem) => (
        <span className={`${styles.status} ${
          approved ? 
            (isNewsScheduled(record.formattedDate, record.formattedTime) ? styles.scheduled : styles.published) 
            : styles.unpublished
        }`}>
          {approved ? 
            (isNewsScheduled(record.formattedDate, record.formattedTime) ? 'Запланована' : 'Опубліковано')
            : 'Чернетка'}
        </span>
      ),
    },
    {
      title: 'Перегляди',
      dataIndex: 'views_count',
      key: 'views',
      width: 110,
      align: 'center' as const,
      render: (views: number) => (
        <div className={styles.viewsValue}>
          <EyeOutlined className={styles.inlineIcon} />
          <span>{views}</span>
        </div>
      ),
    },
    {
      title: 'Перегляд',
      key: 'view',
      width: 72,
      align: 'center' as const,
      render: (_: any, record: NewsItem) => (
        <button
          className={`${styles.iconButton} ${styles.viewIconButton}`}
          onClick={() => window.open(`/news/${record.urlkey || 'article'}_${record.id}`, '_blank')}
          title="Перегляд"
        >
          <LinkOutlined />
        </button>
      ),
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 112,
      align: 'center' as const,
      render: (_: any, record: NewsItem) => {
        const isApproved = record.approved === 1;
        const canDelete = !isApproved && isAdmin; // Видалення тільки для адміна і тільки чернеток
        const canMoveToDraft = isApproved; // Перенесення в чернетки для опублікованих
        
        return (
          <div className={styles.actionButtons}>
            <button
              className={`${styles.iconButton} ${styles.editIconButton}`}
              onClick={() => handleEditNews(record.id)}
              title="Редагувати"
            >
              <EditOutlined />
            </button>
            {(canMoveToDraft || canDelete) && (
              <button
                className={`${styles.iconButton} ${
                  canMoveToDraft ? styles.draftIconButton : styles.deleteIconButton
                }`}
                onClick={() => handleDeleteNews(record.id, record.nheader || 'Без заголовка', isApproved)}
                title={canMoveToDraft ? 'Перенести в чернетки' : 'Видалити'}
              >
                {canMoveToDraft ? <FileOutlined /> : <DeleteOutlined />}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // Очищення фільтрів
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 15,
      status: 'all',
      type: 'all',
      rubric: 'all',
      theme: 'all',
      author: 'all',
      keyword: '',
      newsId: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'ndate',
      sortOrder: 'DESC'
    });
  };

  if (loading) {
    return (
      <div className={styles.newsPage}>
        <AdminNavigation />
        <div className={styles.mainContent}>
          <div className={styles.loading}>Завантаження...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.newsPage}>
        <AdminNavigation />
        <div className={styles.mainContent}>
          <div className={styles.error}>Помилка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newsPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToAdmin}
              title="Повернутися до адмін-панелі"
              style={{ 
                color: '#595959',
                padding: '4px 8px',
                height: 'auto'
              }}
            />
            <h1>Новини / Статті</h1>
          </div>
          <div className={styles.headerActions}>
          <button 
              className={styles.updateUrlKeysButton}
              onClick={handleUpdateUrlKeys}
              disabled={isUpdatingUrlKeys}
            >
              {isUpdatingUrlKeys ? 'Оновлення...' : 'Оновити URL ключі'}
            </button>
            <button 
              className={styles.addButton}
              onClick={handleAddNews}
            >
              Додати новину
            </button>
            
          </div>
        </div>


        {/* Фільтри */}
        <div className={styles.filters}>
          <div className={styles.filterRow}>

            <div className={styles.filterGroup}>
              <label>Тип:</label>
              <select 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
                disabled={paginationLoading}
              >
                <option value="all">Всі типи</option>
                <option value="news">Новини</option>
                <option value="articles">Статті</option>
                <option value="photo">Фоторепортажі</option>
                <option value="video">Відео</option>
                <option value="blogs">Блоги</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Сортування:</label>
              <select 
                value={`${filters.sortBy}-${filters.sortOrder}`} 
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                disabled={paginationLoading}
              >
                <option value="ndate-DESC">Дата публікації (новіші)</option>
                <option value="ndate-ASC">Дата публікації (старіші)</option>
                <option value="udate-DESC">Дата оновлення (новіші)</option>
                <option value="udate-ASC">Дата оновлення (старіші)</option>
                <option value="nheader-ASC">Заголовок (А-Я)</option>
                <option value="nheader-DESC">Заголовок (Я-А)</option>
                <option value="views_count-DESC">Перегляди (більше)</option>
                <option value="views_count-ASC">Перегляди (менше)</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Ключове слово:</label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                placeholder="Пошук в заголовках..."
                disabled={paginationLoading}
              />
            </div>

            <div className={styles.filterGroup}>
              <label>ID новини:</label>
              <input
                type="text"
                value={filters.newsId}
                onChange={(e) => handleFilterChange('newsId', e.target.value)}
                placeholder="Введіть ID..."
                disabled={paginationLoading}
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Дата від:</label>
              <DatePicker
                allowClear
                format="YYYY-MM-DD"
                value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
                onChange={(date) => handleFilterChange('dateFrom', date ? date.format('YYYY-MM-DD') : '')}
                className={styles.datePicker}
                disabled={paginationLoading}
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Дата до:</label>
              <DatePicker
                allowClear
                format="YYYY-MM-DD"
                value={filters.dateTo ? dayjs(filters.dateTo) : null}
                onChange={(date) => handleFilterChange('dateTo', date ? date.format('YYYY-MM-DD') : '')}
                className={styles.datePicker}
                disabled={paginationLoading}
              />
            </div>

            <div className={`${styles.filterGroup} ${styles.clearButtonGroup}`}>
              <button 
                className={styles.clearButton}
                onClick={clearFilters}
                disabled={paginationLoading}
              >
                Очистити фільтри
              </button>
            </div>
          </div>
        </div>


        {/* Список новин */}
        <div className={styles.newsList}>
          {/* Таби над таблицею */}
          <div className={styles.tableTabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('all')}
              disabled={paginationLoading}
            >
              <Tag color={NEWS_TAB_TYPES.all.color}>{NEWS_TAB_TYPES.all.name}</Tag>
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'drafts' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('drafts')}
              disabled={paginationLoading}
            >
              <Tag color={NEWS_TAB_TYPES.drafts.color}>{NEWS_TAB_TYPES.drafts.name}</Tag>
            </button>
          </div>

          <Table
            columns={columns}
            dataSource={newsData?.news || []}
            rowKey="id"
            loading={loading || paginationLoading}
            pagination={newsData ? {
              current: newsData.pagination.page,
              total: newsData.pagination.total,
              pageSize: filters.limit,
              showSizeChanger: true,
              showQuickJumper: false,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} з ${total} новин`,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              pageSizeOptions: ['15', '30', '50', '100'],
              className: styles.antdPagination,
              position: ['bottomCenter'],
              disabled: paginationLoading
            } : false}
            scroll={{ x: 1200 }}
            rowClassName={(record) => {
              let className = styles.newsRow;
              if (record.isImportant) className += ` ${styles.importantNews}`;
              if (record.isTopNews) className += ` ${styles.topNews}`;
              if (record.isDelayed) className += ` ${styles.delayedNews}`;
              return className;
            }}
            locale={{
              emptyText: <div className={styles.noNews}>Новини не знайдено</div>
            }}
          />
        </div>


        {/* Діалог підтвердження видалення або перенесення в чернетки */}
        {deleteConfirm.isOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>
                {deleteConfirm.isApproved 
                  ? 'Перенесення в чернетки' 
                  : 'Підтвердження видалення'}
              </h3>
              <p>
                {deleteConfirm.isApproved 
                  ? 'Ви впевнені, що хочете перенести новину в чернетки:'
                  : 'Ви впевнені, що хочете видалити новину:'}
                <br />
                <strong>"{deleteConfirm.newsTitle}"</strong>
              </p>
              {!deleteConfirm.isApproved && (
                <p className={styles.warningText}>
                  ⚠️ Ця дія незворотна! Всі дані новини будуть видалені назавжди.
                </p>
              )}
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={cancelDelete}
                  disabled={deleting}
                >
                  Скасувати
                </button>
                <button 
                  className={deleteConfirm.isApproved ? styles.confirmDraftButton : styles.confirmDeleteButton}
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting 
                    ? (deleteConfirm.isApproved ? 'Перенесення...' : 'Видалення...') 
                    : (deleteConfirm.isApproved ? 'Перенести в чернетки' : 'Видалити')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
