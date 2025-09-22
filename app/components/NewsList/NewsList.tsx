'use client';

import React from 'react';
import { useNewsByRubric, NewsItem } from '@/app/hooks/useNewsByRubric';
import { getMainImage, hasImages } from '@/app/lib/imageUtils';
import { formatFullNewsDate } from '@/app/lib/newsUtils';
import styles from './NewsList.module.css';

interface NewsListProps {
  rubric: string;
  initialPage?: number;
  initialLimit?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  className?: string;
}

export default function NewsList({
  rubric,
  initialPage = 1,
  initialLimit = 20,
  showFilters = true,
  showPagination = true,
  className = ''
}: NewsListProps) {
  const {
    data,
    loading,
    error,
    refetch,
    setPage,
    setLimit,
    setType,
    setLang,
    setApproved
  } = useNewsByRubric({
    rubric,
    page: initialPage,
    limit: initialLimit,
    autoFetch: true
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value));
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value);
  };

  const handleLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(event.target.value);
  };

  const handleApprovedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApproved(event.target.checked);
  };

  if (error) {
    return (
      <div className={`${styles.errorContainer} ${className}`}>
        <div className={styles.errorMessage}>
          <h3>Помилка завантаження новин</h3>
          <p>{error}</p>
          <button onClick={refetch} className={styles.retryButton}>
            Спробувати ще раз
          </button>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className={`${styles.loadingContainer} ${className}`}>
        <div className={styles.loadingSpinner}></div>
        <p>Завантаження новин...</p>
      </div>
    );
  }

  if (!data || !data.news || data.news.length === 0) {
    return (
      <div className={`${styles.emptyContainer} ${className}`}>
        <div className={styles.emptyMessage}>
          <h3>Новини не знайдено</h3>
          <p>За вашими критеріями новин не знайдено.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.newsListContainer} ${className}`}>
      {/* Фільтри */}
      {showFilters && (
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="type-filter">Тип новини:</label>
            <select
              id="type-filter"
              onChange={handleTypeChange}
              className={styles.filterSelect}
            >
              <option value="">Всі типи</option>
              <option value="news">Новини</option>
              <option value="articles">Статті</option>
              <option value="photo">Фоторепортажі</option>
              <option value="video">Відео</option>
              <option value="audio">Аудіо</option>
              <option value="announces">Анонси</option>
              <option value="blogs">Блоги</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="lang-filter">Мова:</label>
            <select
              id="lang-filter"
              onChange={handleLangChange}
              className={styles.filterSelect}
            >
              <option value="1">Українська</option>
              <option value="2">English</option>
              <option value="3">Русский</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="limit-filter">На сторінці:</label>
            <select
              id="limit-filter"
              onChange={handleLimitChange}
              className={styles.filterSelect}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={true}
                onChange={handleApprovedChange}
                className={styles.filterCheckbox}
              />
              Тільки схвалені
            </label>
          </div>
        </div>
      )}

      {/* Список новин */}
      <div className={styles.newsGrid}>
        {data.news.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>

      {/* Пагінація */}
      {showPagination && data.pagination.totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Показано {((data.pagination.page - 1) * data.pagination.limit) + 1} - {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} з {data.pagination.total} новин
          </div>
          
          <div className={styles.paginationControls}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={!data.pagination.hasPrev}
              className={styles.paginationButton}
            >
              Перша
            </button>
            
            <button
              onClick={() => handlePageChange(data.pagination.page - 1)}
              disabled={!data.pagination.hasPrev}
              className={styles.paginationButton}
            >
              Попередня
            </button>
            
            <span className={styles.currentPage}>
              Сторінка {data.pagination.page} з {data.pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(data.pagination.page + 1)}
              disabled={!data.pagination.hasNext}
              className={styles.paginationButton}
            >
              Наступна
            </button>
            
            <button
              onClick={() => handlePageChange(data.pagination.totalPages)}
              disabled={!data.pagination.hasNext}
              className={styles.paginationButton}
            >
              Остання
            </button>
          </div>
        </div>
      )}

      {/* Індикатор завантаження при зміні сторінки */}
      {loading && data && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
}

// Компонент для окремої новини
function NewsCard({ news }: { news: NewsItem }) {
  const mainImage = getMainImage(news.images);
  const hasImage = hasImages(news.images);
  
  // Використовуємо formatFullNewsDate для консистентного форматування дати

  const getNewsTypeLabel = (type: number) => {
    const typeLabels: { [key: number]: string } = {
      1: 'Новина',
      2: 'Стаття',
      3: 'Фоторепортаж',
      4: 'Відео',
      5: 'Аудіо',
      6: 'Анонс',
      20: 'Блог',
      21: 'Медіа'
    };
    return typeLabels[type] || 'Новина';
  };

  return (
    <article className={styles.newsCard}>
      {hasImage && mainImage && (
        <div className={styles.newsImage}>
          <img
            src={mainImage.urls.intxt}
            alt={mainImage.title}
            className={styles.newsImageImg}
          />
        </div>
      )}
      
      <div className={styles.newsContent}>
        <div className={styles.newsMeta}>
          <span className={styles.newsType}>{getNewsTypeLabel(news.ntype)}</span>
          <span className={styles.newsDate}>{formatFullNewsDate(news.ndate, news.ntime)}</span>
        </div>
        
        <h3 className={styles.newsTitle}>
          <a href={`/news/${news.urlkey}_${news.id}`} className={styles.newsTitleLink}>
            {news.nheader}
          </a>
        </h3>
        
        {news.nsubheader && (
          <h4 className={styles.newsSubtitle}>{news.nsubheader}</h4>
        )}
        
        {news.nteaser && (
          <p className={styles.newsTeaser}>{news.nteaser}</p>
        )}
        
        <div className={styles.newsFooter}>
          {news.comments_count > 0 && (
            <span className={styles.newsComments}>
              💬 {news.comments_count}
            </span>
          )}
          
          {news.views_count > 0 && (
            <span className={styles.newsViews}>
              👁 {news.views_count}
            </span>
          )}
          
          {news.photo && (
            <span className={styles.newsPhoto}>📷</span>
          )}
          
          {news.video && (
            <span className={styles.newsVideo}>🎥</span>
          )}
        </div>
      </div>
    </article>
  );
}
