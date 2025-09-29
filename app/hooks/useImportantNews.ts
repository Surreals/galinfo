"use client";

import { useState, useEffect } from 'react';
import { apiGetWithParams, ApiError } from '@/app/lib/apiClient';

interface ImportantNewsItem {
  id: number;
  ndate: string;
  ntime: string;
  udate: number;
  ntype: number;
  images: any[];
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

interface ImportantNewsResponse {
  error: string;
  importantNews: ImportantNewsItem[];
  total: number;
}

interface UseImportantNewsOptions {
  limit?: number;
  lang?: string;
  autoFetch?: boolean;
}

interface UseImportantNewsReturn {
  importantNews: ImportantNewsItem[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
  fetchByLevel: (level: number) => Promise<void>;
  fetchTopNews: () => Promise<void>;
}

export function useImportantNews(options: UseImportantNewsOptions = {}): UseImportantNewsReturn {
  const {
    limit = 5,
    lang = '1',
    autoFetch = true
  } = options;

  const [importantNews, setImportantNews] = useState<ImportantNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchImportantNews = async (customLimit?: number, customLang?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetWithParams<ImportantNewsResponse>('/api/news/important', {
        limit: (customLimit || limit).toString(),
        lang: customLang || lang
      });

      setImportantNews(response.data.importantNews);
      setTotal(response.data.total);
    } catch (err) {
      let errorMessage = 'Помилка з\'єднання з сервером';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
        console.error('API Error fetching important news:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText
        });
      } else {
        console.error('Error fetching important news:', err);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchByLevel = async (level: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetWithParams<ImportantNewsResponse>(`/api/news/important/${level}`, {
        limit: limit.toString(),
        lang: lang
      });

      setImportantNews(response.data.importantNews);
      setTotal(response.data.total);
    } catch (err) {
      let errorMessage = 'Помилка з\'єднання з сервером';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
        console.error('API Error fetching news by level:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText
        });
      } else {
        console.error('Error fetching news by level:', err);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopNews = async () => {
    // Топ новини мають nweight = 2
    await fetchByLevel(2);
  };

  const refetch = async () => {
    await fetchImportantNews();
  };

  // Автоматичне завантаження при монтуванні компонента
  useEffect(() => {
    if (autoFetch) {
      fetchImportantNews();
    }
  }, [limit, lang, autoFetch]);

  return {
    importantNews,
    loading,
    error,
    total,
    refetch,
    fetchByLevel,
    fetchTopNews
  };
}

// Додатковий hook для роботи з конкретним рівнем важливості
export function useImportantNewsByLevel(level: number, options: UseImportantNewsOptions = {}) {
  const {
    limit = 5,
    lang = '1',
    autoFetch = true
  } = options;

  const [importantNews, setImportantNews] = useState<ImportantNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchNewsByLevel = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetWithParams<ImportantNewsResponse>(`/api/news/important/${level}`, {
        limit: limit.toString(),
        lang: lang
      });

      setImportantNews(response.data.importantNews);
      setTotal(response.data.total);
    } catch (err) {
      let errorMessage = 'Помилка з\'єднання з сервером';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
        console.error('API Error fetching news by level:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText
        });
      } else {
        console.error('Error fetching news by level:', err);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchNewsByLevel();
  };

  // Автоматичне завантаження при монтуванні компонента
  useEffect(() => {
    if (autoFetch) {
      fetchNewsByLevel();
    }
  }, [level, limit, lang, autoFetch]);

  return {
    importantNews,
    loading,
    error,
    total,
    refetch
  };
}

// Hook для топ важливих новин (nweight = 2)
export function useTopImportantNews(options: UseImportantNewsOptions = {}) {
  return useImportantNewsByLevel(2, options);
}

// Hook для важливих новин (nweight = 1)
export function useHighImportantNews(options: UseImportantNewsOptions = {}) {
  return useImportantNewsByLevel(1, options);
}

// Hook для фотоновин (nweight = 3)
export function usePhotoNews(options: UseImportantNewsOptions = {}) {
  return useImportantNewsByLevel(3, options);
}

// Hook для ілюструючих новин (nweight = 4)
export function useIllustratedNews(options: UseImportantNewsOptions = {}) {
  return useImportantNewsByLevel(4, options);
}
