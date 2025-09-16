"use client";

import { useState, useEffect, useCallback } from 'react';

// Типи для новин спеціальних тем
export interface SpecialThemesNewsItem {
  id: number;
  ndate: string;
  ntime: string;
  ntype: number;
  images: Array<{
    urls: {
      full: string;
      intxt: string;
      tmb: string;
    };
  }>;
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

export interface SpecialThemesNewsResponse {
  news: SpecialThemesNewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    param: string;
    lang: string;
    approved: boolean;
  };
  specialTheme: {
    id: number;
    param: string;
    title: string;
    link: string;
    cattype: number;
  };
}

export interface UseSpecialThemesNewsOptions {
  param: string;
  page?: number;
  limit?: number;
  lang?: string;
  approved?: boolean;
  autoFetch?: boolean;
  byId?: boolean; // Search by ID instead of param
}

export interface UseSpecialThemesNewsReturn {
  data: SpecialThemesNewsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setLang: (lang: string) => void;
  setApproved: (approved: boolean) => void;
  setParam: (param: string) => void;
  setById: (byId: boolean) => void;
  // Додаткові методи для зручності
  getLatestNews: () => SpecialThemesNewsItem | null;
  getNewsWithImages: () => SpecialThemesNewsItem[];
  getVideoNews: () => SpecialThemesNewsItem[];
  hasNews: boolean;
  getNewsByWeight: (weight: number) => SpecialThemesNewsItem[];
  getSpecialThemeInfo: () => SpecialThemesNewsResponse['specialTheme'] | null;
}

export function useSpecialThemesNews(options: UseSpecialThemesNewsOptions): UseSpecialThemesNewsReturn {
  const {
    param,
    page: initialPage = 1,
    limit: initialLimit = 20,
    lang: initialLang = '1',
    approved: initialApproved = true,
    autoFetch = true,
    byId = false
  } = options;

  const [data, setData] = useState<SpecialThemesNewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [lang, setLang] = useState<string>(initialLang);
  const [approved, setApproved] = useState<boolean>(initialApproved);
  const [paramState, setParamState] = useState<string>(param);
  const [byIdState, setByIdState] = useState<boolean>(byId);

  const fetchSpecialThemesNews = useCallback(async () => {
    if (!paramState) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        lang,
        approved: approved.toString()
      });

      if (byIdState) {
        params.append('byId', 'true');
      }

      const response = await fetch(`/api/news/special-themes/${paramState}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch special themes news';
      console.error('Error in useSpecialThemesNews:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [paramState, page, limit, lang, approved, byIdState]);

  // Автоматичне завантаження при зміні параметрів
  useEffect(() => {
    if (autoFetch) {
      fetchSpecialThemesNews();
    }
  }, [fetchSpecialThemesNews, autoFetch]);

  // Оновлення внутрішнього стану при зміні пропсів
  useEffect(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setLang(initialLang);
    setApproved(initialApproved);
    setParamState(param);
    setByIdState(byId);
  }, [initialPage, initialLimit, initialLang, initialApproved, param, byId]);

  // Скидання на першу сторінку при зміні param
  useEffect(() => {
    if (paramState !== param) {
      setPage(1);
    }
  }, [param, paramState]);

  const refetch = useCallback(() => {
    fetchSpecialThemesNews();
  }, [fetchSpecialThemesNews]);

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

  const handleSetApproved = useCallback((newApproved: boolean) => {
    setApproved(newApproved);
  }, []);

  const handleSetParam = useCallback((newParam: string) => {
    setParamState(newParam);
  }, []);

  const handleSetById = useCallback((newById: boolean) => {
    setByIdState(newById);
  }, []);

  // Додаткові методи для зручності
  const getLatestNews = useCallback((): SpecialThemesNewsItem | null => {
    return data?.news?.[0] || null;
  }, [data]);

  const getNewsWithImages = useCallback((): SpecialThemesNewsItem[] => {
    return data?.news?.filter(news => news.images && news.images.length > 0) || [];
  }, [data]);

  const getVideoNews = useCallback((): SpecialThemesNewsItem[] => {
    return data?.news?.filter(news => news.video === 1) || [];
  }, [data]);

  const hasNews = Boolean(data?.news && data.news.length > 0);

  const getNewsByWeight = useCallback((weight: number): SpecialThemesNewsItem[] => {
    return data?.news?.filter(news => news.nweight === weight) || [];
  }, [data]);

  const getSpecialThemeInfo = useCallback((): SpecialThemesNewsResponse['specialTheme'] | null => {
    return data?.specialTheme || null;
  }, [data]);

  return {
    data,
    loading,
    error,
    refetch,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
    setLang: handleSetLang,
    setApproved: handleSetApproved,
    setParam: handleSetParam,
    setById: handleSetById,
    getLatestNews,
    getNewsWithImages,
    getVideoNews,
    hasNews,
    getNewsByWeight,
    getSpecialThemeInfo
  };
}

// Додаткові хуки для специфічних випадків використання

// Хук для отримання останньої новини спеціальної теми
export function useLatestSpecialThemesNews(param: string, options: Omit<UseSpecialThemesNewsOptions, 'param' | 'limit'> = {}) {
  return useSpecialThemesNews({ ...options, param, limit: 1 });
}

// Хук для отримання новин спеціальної теми з зображеннями
export function useSpecialThemesNewsWithImages(param: string, options: Omit<UseSpecialThemesNewsOptions, 'param'> = {}) {
  const hook = useSpecialThemesNews({ ...options, param });
  return {
    ...hook,
    newsWithImages: hook.getNewsWithImages()
  };
}

// Хук для отримання відео новин спеціальної теми
export function useSpecialThemesVideoNews(param: string, options: Omit<UseSpecialThemesNewsOptions, 'param'> = {}) {
  const hook = useSpecialThemesNews({ ...options, param });
  return {
    ...hook,
    videoNews: hook.getVideoNews()
  };
}

// Хук для отримання всіх новин спеціальної теми
export function useAllSpecialThemesNews(param: string, options: Omit<UseSpecialThemesNewsOptions, 'param'> = {}) {
  return useSpecialThemesNews({ ...options, param, limit: 50 });
}

// Хуки для пошуку за ID
export function useSpecialThemesNewsById(id: number, options: Omit<UseSpecialThemesNewsOptions, 'param' | 'byId'> = {}) {
  return useSpecialThemesNews({ ...options, param: id.toString(), byId: true });
}

export function useLatestSpecialThemesNewsById(id: number, options: Omit<UseSpecialThemesNewsOptions, 'param' | 'byId' | 'limit'> = {}) {
  return useSpecialThemesNews({ ...options, param: id.toString(), byId: true, limit: 1 });
}

export function useAllSpecialThemesNewsById(id: number, options: Omit<UseSpecialThemesNewsOptions, 'param' | 'byId'> = {}) {
  return useSpecialThemesNews({ ...options, param: id.toString(), byId: true, limit: 50 });
}
