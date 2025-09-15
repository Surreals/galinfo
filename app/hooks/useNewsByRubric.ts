"use client";

import { useState, useEffect, useCallback } from 'react';

// Типи для новин
export interface NewsItem {
  id: number;
  ndate: string;
  ntime: string;
  ntype: number;
  images: any[];
  urlkey: string;
  photo: number;
  video: number;
  comments: number;
  printsubheader: number;
  rubric: string;
  nheader: string;
  nsubheader: string;
  nteaser: string;
  comments_count: number;
  views_count: number;
}

export interface NewsResponse {
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
    rubric: string;
    type?: string;
    lang: string;
    approved: boolean;
  };
}

export interface UseNewsByRubricOptions {
  rubric: string;
  page?: number;
  limit?: number;
  type?: string;
  lang?: string;
  approved?: boolean;
  autoFetch?: boolean;
}

export interface UseNewsByRubricReturn {
  data: NewsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setType: (type: string) => void;
  setLang: (lang: string) => void;
  setApproved: (approved: boolean) => void;
}

export function useNewsByRubric(options: UseNewsByRubricOptions): UseNewsByRubricReturn {
  const {
    rubric,
    page: initialPage = 1,
    limit: initialLimit = 20,
    type: initialType,
    lang: initialLang = '1',
    approved: initialApproved = true,
    autoFetch = true
  } = options;

  const [data, setData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [type, setType] = useState<string | undefined>(initialType);
  const [lang, setLang] = useState<string>(initialLang);
  const [approved, setApproved] = useState<boolean>(initialApproved);

  const fetchNews = useCallback(async () => {
    if (!rubric) return;

    setLoading(true);
    setError(null);


    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        lang,
        approved: approved.toString()
      });

      if (type) {
        params.append('type', type);
      }

      const url = `/api/news/${rubric}?${params}`;

      const response = await fetch(url);
      

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news';
      console.error('Error in useNewsByRubric:', err);
      setError(errorMessage);
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  }, [rubric, page, limit, type, lang, approved]);

  // Автоматичне завантаження при зміні параметрів
  useEffect(() => {
    if (autoFetch) {
      fetchNews();
    }
  }, [fetchNews, autoFetch]);

  // Оновлення внутрішнього стану при зміні пропсів
  useEffect(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setType(initialType);
    setLang(initialLang);
    setApproved(initialApproved);
  }, [initialPage, initialLimit, initialType, initialLang, initialApproved]);

  // Скидання на першу сторінку тільки при зміні rubric (але не при зміні page)
  useEffect(() => {
    if (page !== initialPage) {
      setPage(1);
    }
  }, [rubric]);

  const refetch = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Скидаємо на першу сторінку при зміні ліміту
  }, []);

  const handleSetType = useCallback((newType: string) => {
    setType(newType);
  }, []);

  const handleSetLang = useCallback((newLang: string) => {
    setLang(newLang);
  }, []);

  const handleSetApproved = useCallback((newApproved: boolean) => {
    setApproved(newApproved);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
    setType: handleSetType,
    setLang: handleSetLang,
    setApproved: handleSetApproved
  };
}
