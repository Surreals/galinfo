'use client';

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Button, Tabs, Tag } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminNavigation from '../components/AdminNavigation';
import styles from './news.module.css';

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
  all: { name: 'Всі новини', color: 'blue' },
  drafts: { name: 'Чернетки', color: 'red' }
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
  const [newsData, setNewsData] = useState<NewsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    newsId: number | null;
    newsTitle: string;
  }>({
    isOpen: false,
    newsId: null,
    newsTitle: ''
  });
  const [deleting, setDeleting] = useState(false);
  const [isUpdatingUrlKeys, setIsUpdatingUrlKeys] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'drafts'>('all');
  
  // Фільтри
  const [filters, setFilters] = useState({
    page: 1,
    limit: 30,
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
  const fetchNews = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
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
  const handleDeleteNews = (newsId: number, newsTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      newsId,
      newsTitle
    });
  };

  // Підтвердження видалення
  const confirmDelete = async () => {
    if (!deleteConfirm.newsId) return;
    
    try {
      setDeleting(true);
      
      const response = await fetch(`/api/admin/news?id=${deleteConfirm.newsId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete news');
      }
      
      // Оновлюємо список новин
      await fetchNews();
      
      // Закриваємо діалог підтвердження
      setDeleteConfirm({
        isOpen: false,
        newsId: null,
        newsTitle: ''
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
      newsTitle: ''
    });
  };

  // Очищення фільтрів
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 30,
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

        {/* Таби для розділення новин */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className={styles.newsTabs}
          items={[
            {
              key: 'all',
              label: (
                <span>
                  <Tag color={NEWS_TAB_TYPES.all.color}>{NEWS_TAB_TYPES.all.name}</Tag>
                </span>
              ),
              children: null
            },
            {
              key: 'drafts',
              label: (
                <span>
                  <Tag color={NEWS_TAB_TYPES.drafts.color}>{NEWS_TAB_TYPES.drafts.name}</Tag>
                </span>
              ),
              children: null
            }
          ]}
        />

        {/* Фільтри */}
        <div className={styles.filters}>
          <div className={styles.filterRow}>

            <div className={styles.filterGroup}>
              <label>Тип:</label>
              <select 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
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
              <label>На сторінці:</label>
              <select 
                value={filters.limit} 
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              >
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Ключове слово:</label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                placeholder="Пошук в заголовках..."
              />
            </div>

            <div className={styles.filterGroup}>
              <label>ID новини:</label>
              <input
                type="text"
                value={filters.newsId}
                onChange={(e) => handleFilterChange('newsId', e.target.value)}
                placeholder="Введіть ID..."
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
              />
            </div>

            <div className={`${styles.filterGroup} ${styles.clearButtonGroup}`}>
              <button 
                className={styles.clearButton}
                onClick={clearFilters}
              >
                Очистити фільтри
              </button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        {newsData && (
          <div className={styles.stats}>
            <span>Всього новин: {newsData.pagination.total}</span>
            <span>Сторінка {newsData.pagination.page} з {newsData.pagination.totalPages}</span>
          </div>
        )}

        {/* Список новин */}
        <div className={styles.newsList}>
          {newsData?.news.length === 0 ? (
            <div className={styles.noNews}>Новини не знайдено</div>
          ) : (
            <table className={styles.newsTable}>
              <thead>
                <tr>
                  <th>Дата/Час</th>
                  <th>Заголовок</th>
                  <th>Тип</th>
                  <th>Автор</th>
                  <th>Статус</th>
                  <th>Перегляди</th>
                  <th>Перегляд</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {newsData?.news.map((news) => (
                  <tr 
                    key={news.id}
                    className={`${styles.newsRow} ${
                      news.isImportant ? styles.importantNews : ''
                    } ${news.isTopNews ? styles.topNews : ''} ${
                      news.isDelayed ? styles.delayedNews : ''
                    }`}
                  >
                    <td className={styles.dateCell}>
                      <div className={styles.date}>{news.formattedDate}</div>
                      <div className={styles.time}>{news.formattedTime}</div>
                    </td>
                    <td className={styles.titleCell}>
                      <div 
                        className={styles.title}
                        onClick={() => handleEditNews(news.id)}
                        style={{ cursor: 'pointer' }}
                        title="Клікніть для редагування"
                      >
                        <span className={styles.newsId}>#{news.id}</span>
                        {news.nheader || 'Без заголовка'}
                        {news.images.length > 0 && (
                          <span className={styles.imageIcon}>📷</span>
                        )}
                      </div>
                      {news.nteaser && (
                        <div className={styles.teaser}>{news.nteaser}</div>
                      )}
                    </td>
                    <td className={styles.typeCell}>
                      <span className={`${styles.type} ${styles[`type-${news.ntype}`]}`}>
                        {news.typeName}
                      </span>
                    </td>
                    <td className={styles.authorCell}>
                      {news.authorDisplayName}
                    </td>
                    <td className={styles.statusCell}>
                      <span className={`${styles.status} ${
                        news.approved ? 
                          (isNewsScheduled(news.formattedDate, news.formattedTime) ? styles.scheduled : styles.published) 
                          : styles.unpublished
                      }`}>
                        {news.approved ? 
                          (isNewsScheduled(news.formattedDate, news.formattedTime) ? 'Запланована' : 'Опубліковано')
                          : 'Чернетка'}
                      </span>
                      
                      
                    </td>
                    <td className={styles.statsCell}>
                      <div className={styles.viewsValue}>
                        <EyeOutlined className={styles.inlineIcon} />
                        <span>{news.views_count}</span>
                      </div>
                    </td>
                    <td className={styles.viewCell}>
                      <button
                        className={`${styles.iconButton} ${styles.viewIconButton}`}
                        onClick={() => window.open(`/news/${news.urlkey || 'article'}_${news.id}`, '_blank')}
                        title="Перегляд"
                      >
                        <EyeOutlined />
                      </button>
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.iconButton} ${styles.editIconButton}`}
                          onClick={() => handleEditNews(news.id)}
                          title="Редагувати"
                        >
                          <EditOutlined />
                        </button>
                        <button
                          className={`${styles.iconButton} ${styles.deleteIconButton}`}
                          onClick={() => handleDeleteNews(news.id, news.nheader || 'Без заголовка')}
                          title="Видалити"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Пагінація */}
        {newsData && newsData.pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={styles.paginationButton}
              disabled={!newsData.pagination.hasPrev}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              ‹ Попередня
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(5, newsData.pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, filters.page - 2) + i;
                if (pageNum > newsData.pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageButton} ${
                      pageNum === filters.page ? styles.activePage : ''
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              className={styles.paginationButton}
              disabled={!newsData.pagination.hasNext}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              Наступна ›
            </button>
          </div>
        )}

        {/* Діалог підтвердження видалення */}
        {deleteConfirm.isOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Підтвердження видалення</h3>
              <p>
                Ви впевнені, що хочете видалити новину:
                <br />
                <strong>"{deleteConfirm.newsTitle}"</strong>
              </p>
              <p className={styles.warningText}>
                ⚠️ Ця дія незворотна! Всі дані новини будуть видалені назавжди.
              </p>
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={cancelDelete}
                  disabled={deleting}
                >
                  Скасувати
                </button>
                <button 
                  className={styles.confirmDeleteButton}
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Видалення...' : 'Видалити'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
