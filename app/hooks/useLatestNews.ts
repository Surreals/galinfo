"use client";

import { useState, useEffect, useCallback } from 'react';
import { NewsImage, getMainImage, hasImages, getImagesCount } from '@/app/lib/imageUtils';
import { apiGetWithParams, ApiError } from '@/app/lib/apiClient';

// Типи для новин
export interface LatestNewsItem {
  id: number;
  ndate: string;
  ntime: string;
  udate: number;
  ntype: number;
  images: NewsImage[];
  urlkey: string;
  photo: number;
  video: number;
  comments: number;
  printsubheader: number;
  rubric: string;
  nweight: number;
  nheader: string;
  nsubheader: string;
  nteaser: string;
  comments_count: number;
  views_count: number;
}

export interface LatestNewsResponse {
  news: LatestNewsItem[];
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
    approved: boolean;
  };
}

export interface UseLatestNewsOptions {
  page?: number;
  limit?: number;
  lang?: string;
  autoFetch?: boolean;
}

export interface UseLatestNewsReturn {
  data: LatestNewsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setLang: (lang: string) => void;
  // Додаткові методи для зручності
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  // Методи для роботи з зображеннями
  getMainImage: (newsItem: LatestNewsItem) => NewsImage | null;
  hasImages: (newsItem: LatestNewsItem) => boolean;
  getImagesCount: (newsItem: LatestNewsItem) => number;
}

export function useLatestNews(options: UseLatestNewsOptions = {}): UseLatestNewsReturn {
  const {
    page: initialPage = 1,
    limit: initialLimit = 20,
    lang: initialLang = '1',
    autoFetch = true
  } = options;

  const [data, setData] = useState<LatestNewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [lang, setLang] = useState<string>(initialLang);

  const fetchLatestNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetWithParams<LatestNewsResponse>('/api/news/latest', {
        page: page.toString(),
        limit: limit.toString(),
        lang
      });

      setData(response.data);
    } catch (err) {
      let errorMessage = 'Failed to fetch latest news';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
        console.error('API Error in useLatestNews:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText
        });
      } else {
        console.error('Error in useLatestNews:', err);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, limit, lang]);

  // Автоматичне завантаження при зміні параметрів
  useEffect(() => {
    if (autoFetch) {
      fetchLatestNews();
    }
  }, [fetchLatestNews, autoFetch]);

  // Оновлення внутрішнього стану при зміні пропсів
  useEffect(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setLang(initialLang);
  }, [initialPage, initialLimit, initialLang]);

  const refetch = useCallback(() => {
    fetchLatestNews();
  }, [fetchLatestNews]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Скидаємо на першу сторінку при зміні ліміту
  }, []);

  const handleSetLang = useCallback((newLang: string) => {
    setLang(newLang);
  }, []);

  // Додаткові методи для навігації
  const goToNextPage = useCallback(() => {
    if (data?.pagination.hasNext) {
      setPage(page + 1);
    }
  }, [data?.pagination.hasNext, page]);

  const goToPrevPage = useCallback(() => {
    if (data?.pagination.hasPrev) {
      setPage(page - 1);
    }
  }, [data?.pagination.hasPrev, page]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    if (data?.pagination.totalPages) {
      setPage(data.pagination.totalPages);
    }
  }, [data?.pagination.totalPages]);

  // Методи для роботи з зображеннями
  const getMainImageForNews = useCallback((newsItem: LatestNewsItem) => {
    return getMainImage(newsItem.images);
  }, []);

  const hasImagesForNews = useCallback((newsItem: LatestNewsItem) => {
    return hasImages(newsItem.images);
  }, []);

  const getImagesCountForNews = useCallback((newsItem: LatestNewsItem) => {
    return getImagesCount(newsItem.images);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
    setLang: handleSetLang,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    getMainImage: getMainImageForNews,
    hasImages: hasImagesForNews,
    getImagesCount: getImagesCountForNews
  };
}

// Додатковий хук для отримання тільки першої сторінки останніх новин
export function useLatestNewsFirstPage(options: Omit<UseLatestNewsOptions, 'page'> = {}) {
  return useLatestNews({ ...options, page: 1 });
}

// Хук для отримання останніх новин з певною кількістю елементів
export function useLatestNewsWithLimit(limit: number, options: Omit<UseLatestNewsOptions, 'limit'> = {}) {
  return useLatestNews({ ...options, limit });
}
