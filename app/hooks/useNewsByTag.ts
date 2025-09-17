"use client";

import { useState, useEffect, useCallback } from 'react';
import { NewsImage, getMainImage, hasImages, getImagesCount } from '@/app/lib/imageUtils';

// Типи для новин за тегом
export interface NewsByTagItem {
  id: number;
  ndate: string;
  ntime: string;
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

export interface NewsByTagResponse {
  news: NewsByTagItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    tagId: number;
    lang: string;
    approved: boolean;
    type?: string;
  };
  tag: {
    id: number;
    tag: string;
  };
}

export interface UseNewsByTagOptions {
  tagId?: number;           // Tag ID (use either tagId OR tagName)
  tagName?: string;         // Tag name (use either tagId OR tagName)
  page?: number;
  limit?: number;
  type?: string;
  lang?: string;
  approved?: boolean;
  autoFetch?: boolean;
}

export interface UseNewsByTagReturn {
  data: NewsByTagResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setType: (type: string) => void;
  setLang: (lang: string) => void;
  setApproved: (approved: boolean) => void;
  setTagId: (tagId: number) => void;
  setTagName: (tagName: string) => void;
  // Додаткові методи для навігації
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  // Додаткові методи для зручності
  getLatestNews: () => NewsByTagItem | null;
  getNewsWithImages: () => NewsByTagItem[];
  getVideoNews: () => NewsByTagItem[];
  hasNews: boolean;
  getNewsByWeight: (weight: number) => NewsByTagItem[];
  getTagInfo: () => NewsByTagResponse['tag'] | null;
  // Методи для роботи з зображеннями
  getMainImage: (newsItem: NewsByTagItem) => NewsImage | null;
  hasImages: (newsItem: NewsByTagItem) => boolean;
  getImagesCount: (newsItem: NewsByTagItem) => number;
  // Статистичні методи
  getTotalNews: () => number;
  getNewsCount: () => number;
  getNewsByType: (type: number) => NewsByTagItem[];
}

export function useNewsByTag(options: UseNewsByTagOptions): UseNewsByTagReturn {
  const {
    tagId,
    tagName,
    page: initialPage = 1,
    limit: initialLimit = 20,
    type: initialType,
    lang: initialLang = '1',
    approved: initialApproved = true,
    autoFetch = true
  } = options;

  // Validate that either tagId or tagName is provided
  if (!tagId && !tagName) {
    throw new Error('Either tagId or tagName must be provided');
  }

  const [data, setData] = useState<NewsByTagResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [type, setType] = useState<string | undefined>(initialType);
  const [lang, setLang] = useState<string>(initialLang);
  const [approved, setApproved] = useState<boolean>(initialApproved);
  const [tagIdState, setTagIdState] = useState<number | undefined>(tagId);
  const [tagNameState, setTagNameState] = useState<string | undefined>(tagName);

  const fetchNewsByTag = useCallback(async () => {
    if (!tagIdState && !tagNameState) return;

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

      // Determine search method and parameter
      const searchParam = tagNameState || tagIdState?.toString() || '';
      const byName = Boolean(tagNameState);
      
      if (byName) {
        params.append('byName', 'true');
      }

      const response = await fetch(`/api/news/by-tag/${searchParam}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news by tag';
      console.error('Error in useNewsByTag:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tagIdState, tagNameState, page, limit, type, lang, approved]);

  // Автоматичне завантаження при зміні параметрів
  useEffect(() => {
    if (autoFetch) {
      fetchNewsByTag();
    }
  }, [fetchNewsByTag, autoFetch]);

  // Оновлення внутрішнього стану при зміні пропсів
  useEffect(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setType(initialType);
    setLang(initialLang);
    setApproved(initialApproved);
    setTagIdState(tagId);
    setTagNameState(tagName);
  }, [initialPage, initialLimit, initialType, initialLang, initialApproved, tagId, tagName]);

  // Скидання на першу сторінку при зміні tagId або tagName (але не при зміні page)
  useEffect(() => {
    if (page !== initialPage) {
      setPage(1);
    }
  }, [tagId, tagName, initialPage]);

  const refetch = useCallback(() => {
    fetchNewsByTag();
  }, [fetchNewsByTag]);

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

  const handleSetTagId = useCallback((newTagId: number) => {
    setTagIdState(newTagId);
    setTagNameState(undefined); // Clear tag name when setting ID
  }, []);

  const handleSetTagName = useCallback((newTagName: string) => {
    setTagNameState(newTagName);
    setTagIdState(undefined); // Clear tag ID when setting name
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

  // Додаткові методи для зручності
  const getLatestNews = useCallback((): NewsByTagItem | null => {
    return data?.news?.[0] || null;
  }, [data]);

  const getNewsWithImages = useCallback((): NewsByTagItem[] => {
    return data?.news?.filter(news => news.images && news.images.length > 0) || [];
  }, [data]);

  const getVideoNews = useCallback((): NewsByTagItem[] => {
    return data?.news?.filter(news => news.video === 1) || [];
  }, [data]);

  const hasNews = Boolean(data?.news && data.news.length > 0);

  const getNewsByWeight = useCallback((weight: number): NewsByTagItem[] => {
    return data?.news?.filter(news => news.nweight === weight) || [];
  }, [data]);

  const getTagInfo = useCallback((): NewsByTagResponse['tag'] | null => {
    return data?.tag || null;
  }, [data]);

  // Методи для роботи з зображеннями
  const getMainImageForNews = useCallback((newsItem: NewsByTagItem) => {
    return getMainImage(newsItem.images);
  }, []);

  const hasImagesForNews = useCallback((newsItem: NewsByTagItem) => {
    return hasImages(newsItem.images);
  }, []);

  const getImagesCountForNews = useCallback((newsItem: NewsByTagItem) => {
    return getImagesCount(newsItem.images);
  }, []);

  // Статистичні методи
  const getTotalNews = useCallback((): number => {
    return data?.pagination.total || 0;
  }, [data]);

  const getNewsCount = useCallback((): number => {
    return data?.news?.length || 0;
  }, [data]);

  const getNewsByType = useCallback((newsType: number): NewsByTagItem[] => {
    return data?.news?.filter(news => news.ntype === newsType) || [];
  }, [data]);

  return {
    data,
    loading,
    error,
    refetch,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
    setType: handleSetType,
    setLang: handleSetLang,
    setApproved: handleSetApproved,
    setTagId: handleSetTagId,
    setTagName: handleSetTagName,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    getLatestNews,
    getNewsWithImages,
    getVideoNews,
    hasNews,
    getNewsByWeight,
    getTagInfo,
    getMainImage: getMainImageForNews,
    hasImages: hasImagesForNews,
    getImagesCount: getImagesCountForNews,
    getTotalNews,
    getNewsCount,
    getNewsByType
  };
}

// Додаткові хуки для специфічних випадків використання

// Хук для отримання останніх новин за тегом
export function useLatestNewsByTag(tagId: number, options: Omit<UseNewsByTagOptions, 'tagId' | 'limit'> = {}) {
  return useNewsByTag({ ...options, tagId, limit: 1 });
}

// Хук для отримання новин з зображеннями за тегом
export function useNewsByTagWithImages(tagId: number, options: Omit<UseNewsByTagOptions, 'tagId'> = {}) {
  const hook = useNewsByTag({ ...options, tagId });
  return {
    ...hook,
    newsWithImages: hook.getNewsWithImages()
  };
}

// Хук для отримання відео новин за тегом
export function useVideoNewsByTag(tagId: number, options: Omit<UseNewsByTagOptions, 'tagId'> = {}) {
  const hook = useNewsByTag({ ...options, tagId });
  return {
    ...hook,
    videoNews: hook.getVideoNews()
  };
}

// Хук для отримання новин певного типу за тегом
export function useNewsByTagAndType(tagId: number, type: string, options: Omit<UseNewsByTagOptions, 'tagId' | 'type'> = {}) {
  return useNewsByTag({ ...options, tagId, type });
}

// Хук для отримання всіх новин за тегом
export function useAllNewsByTag(tagId: number, options: Omit<UseNewsByTagOptions, 'tagId'> = {}) {
  return useNewsByTag({ ...options, tagId, limit: 50 });
}

// Хук для пошуку новин за кількома тегами (використовує перший тег як базовий)
export function useNewsByMultipleTags(tagIds: number[], options: Omit<UseNewsByTagOptions, 'tagId'> = {}) {
  const primaryTagId = tagIds[0] || 0;
  return useNewsByTag({ ...options, tagId: primaryTagId });
}

// Хуки для пошуку за назвою тегу
export function useNewsByTagName(tagName: string, options: Omit<UseNewsByTagOptions, 'tagName'> = {}) {
  return useNewsByTag({ ...options, tagName });
}

export function useLatestNewsByTagName(tagName: string, options: Omit<UseNewsByTagOptions, 'tagName' | 'limit'> = {}) {
  return useNewsByTag({ ...options, tagName, limit: 1 });
}

export function useNewsByTagNameWithImages(tagName: string, options: Omit<UseNewsByTagOptions, 'tagName'> = {}) {
  const hook = useNewsByTag({ ...options, tagName });
  return {
    ...hook,
    newsWithImages: hook.getNewsWithImages()
  };
}

export function useAllNewsByTagName(tagName: string, options: Omit<UseNewsByTagOptions, 'tagName'> = {}) {
  return useNewsByTag({ ...options, tagName, limit: 50 });
}
