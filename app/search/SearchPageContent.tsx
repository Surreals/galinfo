'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination, Input, Spin } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { formatFullNewsDate } from '@/app/lib/newsUtils';
import { AccentSquare } from '@/app/shared';
import styles from './search.module.css';

const { Search } = Input;

interface SearchResult {
  id: number;
  nheader: string;
  nsubheader?: string;
  nteaser?: string;
  ndate: string;
  ntime: string;
  urlkey: string;
  ntype: number;
  nweight: number;
  images: Array<{
    id: number;
    filename: string;
    title: string;
    urls: {
      full: string;
      intxt: string;
      tmb: string;
    };
  }>;
}

interface SearchResponse {
  searchResults: SearchResult[];
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

export default function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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
      const page = pageFromUrl ? parseInt(pageFromUrl) : 1;
      setCurrentPage(page);
      performSearch(queryFromUrl, page);
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

  const handleSearch = (value: string) => {
    if (value.trim()) {
      setCurrentPage(1);
      router.push(`/search?q=${encodeURIComponent(value.trim())}&page=1`);
    }
  };

  const handlePageChange = (page: number) => {
    if (searchQuery.trim()) {
      setCurrentPage(page);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&page=${page}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.searchPage}>
      <div className={styles.container}>
        {/* Пошукова форма */}
        <div className={styles.searchHeader}>
          <div className={styles.titleContainer}>
            <AccentSquare className={styles.titleAccent} />
            <h1 className={styles.title}>ПОШУК НОВИН</h1>
          </div>
          <Search
            placeholder="Введіть пошуковий запит..."
            enterButton="Пошук"
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            loading={loading}
            className={styles.searchInput}
          />
        </div>

        {/* Результати пошуку або інфо */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <p>Пошук новин...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
          </div>
        ) : searchResults.length === 0 && searchQuery ? (
          <div className={styles.noResults}>
            <p>За запитом "{searchQuery}" нічого не знайдено.</p>
            <p>Спробуйте змінити пошуковий запит або використати інші ключові слова.</p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            {/* Інфо про результати */}
            {pagination && (
              <div className={styles.resultsInfo}>
                Знайдено <strong>{pagination.total}</strong> результатів
              </div>
            )}

            {/* Список новин - стиль як у блоку ПОЛІТИКА */}
            <ul className={styles.newsList}>
              {searchResults.map((item, index) => (
                <li key={item.id} className={styles.newsItem}>
                  <Link href={`/news/${item.urlkey}_${item.id}`} className={styles.newsLink}>
                    {/* Показуємо зображення для всіх новин, якщо вони існують */}
                    {item.images && item.images.length > 0 && (
                      <div className={styles.imageWrapper}>
                        <Image
                          src={item.images[0].urls.tmb}
                          alt={item.images[0].title || item.nheader}
                          width={200}
                          height={150}
                          className={styles.newsImage}
                        />
                        {/* Мітка для важливих новин */}
                        {item.nweight > 0 && (
                          <div className={styles.importantTag}>
                            ВАЖЛИВО
                          </div>
                        )}
                      </div>
                    )}
                    <div className={styles.newsText}>
                      <p className={`${styles.newsTitle} ${item.nweight > 0 ? styles.importantTitle : ''}`}>
                        {item.nheader}
                      </p>
                      <p className={styles.newsTime}>
                        {formatFullNewsDate(item.ndate, item.ntime)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Пагінація */}
            {pagination && pagination.totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  current={currentPage}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total, range) => `${range[0]}-${range[1]} з ${total} новин`}
                  className={styles.pagination}
                />
              </div>
            )}
          </>
        ) : !searchQuery ? (
          <div className={styles.initialState}>
            <p>Введіть пошуковий запит, щоб знайти новини</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

