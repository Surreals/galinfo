'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './NewsSearch.module.css';

interface NewsSearchResult {
  id: number;
  nheader: string;
  nsubheader: string;
  nteaser: string;
  ndate: string;
  ntime: string;
  urlkey: string;
  ntype: number;
  nweight: number;
  relevance_score: number;
  images: any[];
  comments_count: number;
  views_count: number;
}

interface SearchResponse {
  searchResults: NewsSearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  search: {
    query: string;
    totalResults: number;
  };
}

const NewsSearch: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NewsSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Отримання пошукового запиту з URL при завантаженні
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    const pageFromUrl = searchParams.get('page');
    
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
      setCurrentPage(pageFromUrl ? parseInt(pageFromUrl) : 1);
      performSearch(queryFromUrl, pageFromUrl ? parseInt(pageFromUrl) : 1);
    }
  }, [searchParams]);

  const performSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '20',
        lang: '1'
      });
      
      const response = await fetch(`/api/news/search?${params}`);
      const data: SearchResponse = await response.json();
      
      if (response.ok) {
        setSearchResults(data.searchResults);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Помилка пошуку');
      }
    } catch (error) {
      console.error('Error searching news:', error);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&page=1`);
    }
  };

  const handlePageChange = (page: number) => {
    if (searchQuery.trim()) {
      setCurrentPage(page);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&page=${page}`);
    }
  };

  const getNewsTypeLabel = (type: number): string => {
    const types: { [key: number]: string } = {
      1: 'Новина',
      2: 'Стаття',
      3: 'Фоторепортаж',
      4: 'Відео',
      5: 'Аудіо',
      6: 'Анонс',
      20: 'Блог',
      21: 'Основні медіа'
    };
    return types[type] || 'Невідомий тип';
  };

  const getImportanceLabel = (nweight: number): string => {
    const importance: { [key: number]: string } = {
      0: 'Звичайна',
      1: 'Важлива',
      2: 'ТОП',
      3: 'Фотоновина',
      4: 'Ілюструюча'
    };
    return importance[nweight] || 'Звичайна';
  };

  const formatDate = (date: string, time: string): string => {
    const dateObj = new Date(date + ' ' + time);
    return dateObj.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.newsSearch}>
      {/* Пошукова форма */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введіть пошуковий запит..."
            className={styles.searchInput}
            disabled={loading}
          />
          <button 
            type="submit" 
            className={styles.searchButton}
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? 'Пошук...' : 'Пошук'}
          </button>
        </div>
      </form>

      {/* Помилка */}
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* Результати пошуку */}
      {searchResults.length > 0 && (
        <div className={styles.searchResults}>
          <div className={styles.resultsHeader}>
            <h2>Результати пошуку</h2>
            {pagination && (
              <p className={styles.resultsCount}>
                Знайдено {pagination.total} результатів
              </p>
            )}
          </div>

          <div className={styles.resultsList}>
            {searchResults.map((news) => (
              <article key={news.id} className={styles.newsItem}>
                <div className={styles.newsHeader}>
                  <h3 className={styles.newsTitle}>
                    <a href={`/article/${news.urlkey}_${news.id}`}>
                      {news.nheader}
                    </a>
                  </h3>
                  <div className={styles.newsMeta}>
                    <span className={styles.newsType}>
                      {getNewsTypeLabel(news.ntype)}
                    </span>
                    <span className={`${styles.importance} ${styles[`importance-${news.nweight}`]}`}>
                      {getImportanceLabel(news.nweight)}
                    </span>
                    <span className={styles.relevanceScore}>
                      Релевантність: {news.relevance_score}
                    </span>
                  </div>
                </div>

                {news.nsubheader && (
                  <p className={styles.newsSubtitle}>
                    {news.nsubheader}
                  </p>
                )}

                {news.nteaser && (
                  <p className={styles.newsTeaser}>
                    {news.nteaser}
                  </p>
                )}

                <div className={styles.newsFooter}>
                  <time className={styles.newsDate}>
                    {formatDate(news.ndate, news.ntime)}
                  </time>
                  <div className={styles.newsStats}>
                    <span className={styles.commentsCount}>
                      💬 {news.comments_count}
                    </span>
                    <span className={styles.viewsCount}>
                      👁 {news.views_count}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Пагінація */}
          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              {pagination.hasPrev && (
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={styles.paginationButton}
                >
                  ← Попередня
                </button>
              )}
              
              <span className={styles.paginationInfo}>
                Сторінка {pagination.page} з {pagination.totalPages}
              </span>
              
              {pagination.hasNext && (
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={styles.paginationButton}
                >
                  Наступна →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Повідомлення про відсутність результатів */}
      {!loading && searchQuery && searchResults.length === 0 && !error && (
        <div className={styles.noResults}>
          <p>За запитом "{searchQuery}" нічого не знайдено.</p>
          <p>Спробуйте змінити пошуковий запит або використати інші ключові слова.</p>
        </div>
      )}
    </div>
  );
};

export default NewsSearch;
