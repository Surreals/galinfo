"use client";

import { useState, useEffect, useCallback } from 'react';

// Типи для важливих новин
export interface ImportantNewsByCategoryItem {
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

export interface ImportantNewsByCategoryResponse {
  importantNews: ImportantNewsByCategoryItem[];
  total: number;
  filters: {
    rubric: string;
    lang: string;
    level: number | null;
    limit: number;
  };
}

export interface UseImportantNewsByCategoryOptions {
  rubric: string;
  limit?: number;
  lang?: string;
  level?: number; // Рівень важливості (1, 2, 3, 4)
  autoFetch?: boolean;
}

export interface UseImportantNewsByCategoryReturn {
  data: ImportantNewsByCategoryResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setRubric: (rubric: string) => void;
  setLimit: (limit: number) => void;
  setLang: (lang: string) => void;
  setLevel: (level: number | undefined) => void;
  // Додаткові методи для зручності
  getLatestImportantNews: () => ImportantNewsByCategoryItem | null;
  getTopImportantNews: () => ImportantNewsByCategoryItem | null;
  getPhotoNews: () => ImportantNewsByCategoryItem | null;
  getIllustratedNews: () => ImportantNewsByCategoryItem | null;
  hasImportantNews: boolean;
  getNewsByLevel: (level: number) => ImportantNewsByCategoryItem[];
}

export function useImportantNewsByCategory(options: UseImportantNewsByCategoryOptions): UseImportantNewsByCategoryReturn {
  const {
    rubric,
    limit: initialLimit = 1,
    lang: initialLang = '1',
    level: initialLevel,
    autoFetch = true
  } = options;

  const [data, setData] = useState<ImportantNewsByCategoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rubricState, setRubricState] = useState<string>(rubric);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [lang, setLang] = useState<string>(initialLang);
  const [level, setLevel] = useState<number | undefined>(initialLevel);

  const fetchImportantNewsByCategory = useCallback(async () => {
    if (!rubricState) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        lang
      });

      if (level !== undefined) {
        params.append('level', level.toString());
      }

      const response = await fetch(`/api/news/important/by-category/${rubricState}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch important news by category';
      console.error('Error in useImportantNewsByCategory:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [rubricState, limit, lang, level]);

  // Автоматичне завантаження при зміні параметрів
  useEffect(() => {
    if (autoFetch) {
      fetchImportantNewsByCategory();
    }
  }, [fetchImportantNewsByCategory, autoFetch]);

  // Оновлення внутрішнього стану при зміні пропсів
  useEffect(() => {
    setRubricState(rubric);
    setLimit(initialLimit);
    setLang(initialLang);
    setLevel(initialLevel);
  }, [rubric, initialLimit, initialLang, initialLevel]);

  const refetch = useCallback(() => {
    fetchImportantNewsByCategory();
  }, [fetchImportantNewsByCategory]);

  const handleSetRubric = useCallback((newRubric: string) => {
    setRubricState(newRubric);
  }, []);

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
  }, []);

  const handleSetLang = useCallback((newLang: string) => {
    setLang(newLang);
  }, []);

  const handleSetLevel = useCallback((newLevel: number | undefined) => {
    setLevel(newLevel);
  }, []);

  // Додаткові методи для зручності
  const getLatestImportantNews = useCallback((): ImportantNewsByCategoryItem | null => {
    return data?.importantNews?.[0] || null;
  }, [data]);

  const getTopImportantNews = useCallback((): ImportantNewsByCategoryItem | null => {
    return data?.importantNews?.find(news => news.nweight === 2) || null;
  }, [data]);

  const getPhotoNews = useCallback((): ImportantNewsByCategoryItem | null => {
    return data?.importantNews?.find(news => news.nweight === 3) || null;
  }, [data]);

  const getIllustratedNews = useCallback((): ImportantNewsByCategoryItem | null => {
    return data?.importantNews?.find(news => news.nweight === 4) || null;
  }, [data]);

  const hasImportantNews = Boolean(data?.importantNews && data.importantNews.length > 0);

  const getNewsByLevel = useCallback((level: number): ImportantNewsByCategoryItem[] => {
    return data?.importantNews?.filter(news => news.nweight === level) || [];
  }, [data]);

  return {
    data,
    loading,
    error,
    refetch,
    setRubric: handleSetRubric,
    setLimit: handleSetLimit,
    setLang: handleSetLang,
    setLevel: handleSetLevel,
    getLatestImportantNews,
    getTopImportantNews,
    getPhotoNews,
    getIllustratedNews,
    hasImportantNews,
    getNewsByLevel
  };
}

// Додаткові хуки для специфічних випадків використання

// Хук для отримання останньої важливої новини в категорії
export function useLatestImportantNewsByCategory(rubric: string, options: Omit<UseImportantNewsByCategoryOptions, 'rubric' | 'limit'> = {}) {
  return useImportantNewsByCategory({ ...options, rubric, limit: 1 });
}

// Хук для отримання топ важливої новини в категорії (nweight = 2)
export function useTopImportantNewsByCategory(rubric: string, options: Omit<UseImportantNewsByCategoryOptions, 'rubric' | 'level'> = {}) {
  return useImportantNewsByCategory({ ...options, rubric, level: 2, limit: 1 });
}

// Хук для отримання фото новини в категорії (nweight = 3)
export function usePhotoNewsByCategory(rubric: string, options: Omit<UseImportantNewsByCategoryOptions, 'rubric' | 'level'> = {}) {
  return useImportantNewsByCategory({ ...options, rubric, level: 3, limit: 1 });
}

// Хук для отримання ілюстрованої новини в категорії (nweight = 4)
export function useIllustratedNewsByCategory(rubric: string, options: Omit<UseImportantNewsByCategoryOptions, 'rubric' | 'level'> = {}) {
  return useImportantNewsByCategory({ ...options, rubric, level: 4, limit: 1 });
}

// Хук для отримання всіх важливих новин в категорії
export function useAllImportantNewsByCategory(rubric: string, options: Omit<UseImportantNewsByCategoryOptions, 'rubric'> = {}) {
  return useImportantNewsByCategory({ ...options, rubric, limit: 10 });
}
