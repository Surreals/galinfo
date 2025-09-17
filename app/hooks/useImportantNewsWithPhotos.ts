"use client";

import { useState, useEffect, useCallback } from 'react';
import { NewsImage, getMainImage, hasImages, getImagesCount } from '@/app/lib/imageUtils';

// Типи для важливих новин з фото
export interface ImportantNewsWithPhotosItem {
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

export interface ImportantNewsWithPhotosResponse {
  news: ImportantNewsWithPhotosItem[];
  total: number;
  filters: {
    category?: string;
    region?: string;
    tagId?: number;
    specialThemeId?: number;
    level?: number;
    lang: string;
    limit: number;
    requirePhotos: boolean;
  };
  metadata?: {
    category?: { id: string; name: string; };
    region?: { id: string; name: string; };
    tag?: { id: number; tag: string; };
    specialTheme?: { id: number; title: string; param: string; };
  };
}

export interface UseImportantNewsWithPhotosOptions {
  category?: string;        // Категорія/рубрика
  region?: string;          // Регіон
  tagId?: number;           // ID тегу
  specialThemeId?: number;  // ID спеціальної теми
  level?: number;           // Рівень важливості (1-4)
  limit?: number;           // Кількість новин
  lang?: string;            // Мова
  requirePhotos?: boolean;  // Обов'язково з фото
  autoFetch?: boolean;      // Автозавантаження
}

export interface UseImportantNewsWithPhotosReturn {
  data: ImportantNewsWithPhotosResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setCategory: (category: string | undefined) => void;
  setRegion: (region: string | undefined) => void;
  setTagId: (tagId: number | undefined) => void;
  setSpecialThemeId: (themeId: number | undefined) => void;
  setLevel: (level: number | undefined) => void;
  setLimit: (limit: number) => void;
  setLang: (lang: string) => void;
  setRequirePhotos: (require: boolean) => void;
  // Додаткові методи для зручності
  getLatestNews: () => ImportantNewsWithPhotosItem | null;
  getTopImportantNews: () => ImportantNewsWithPhotosItem | null;
  getPhotoNews: () => ImportantNewsWithPhotosItem | null;
  getNewsByWeight: (weight: number) => ImportantNewsWithPhotosItem[];
  hasNews: boolean;
  // Методи для роботи з зображеннями
  getMainImage: (newsItem: ImportantNewsWithPhotosItem) => NewsImage | null;
  hasImages: (newsItem: ImportantNewsWithPhotosItem) => boolean;
  getImagesCount: (newsItem: ImportantNewsWithPhotosItem) => number;
  // Статистичні методи
  getTotalNews: () => number;
  getNewsCount: () => number;
  // Методи для отримання метаданих
  getCategoryInfo: () => { id: string; name: string; } | null;
  getRegionInfo: () => { id: string; name: string; } | null;
  getTagInfo: () => { id: number; tag: string; } | null;
  getSpecialThemeInfo: () => { id: number; title: string; param: string; } | null;
}

export function useImportantNewsWithPhotos(options: UseImportantNewsWithPhotosOptions = {}): UseImportantNewsWithPhotosReturn {
  const {
    category,
    region,
    tagId,
    specialThemeId,
    level,
    limit: initialLimit = 5,
    lang: initialLang = '1',
    requirePhotos: initialRequirePhotos = true,
    autoFetch = true
  } = options;

  const [data, setData] = useState<ImportantNewsWithPhotosResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryState, setCategoryState] = useState<string | undefined>(category);
  const [regionState, setRegionState] = useState<string | undefined>(region);
  const [tagIdState, setTagIdState] = useState<number | undefined>(tagId);
  const [specialThemeIdState, setSpecialThemeIdState] = useState<number | undefined>(specialThemeId);
  const [levelState, setLevelState] = useState<number | undefined>(level);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [lang, setLang] = useState<string>(initialLang);
  const [requirePhotos, setRequirePhotos] = useState<boolean>(initialRequirePhotos);

  const fetchImportantNewsWithPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        lang,
        requirePhotos: requirePhotos.toString()
      });

      if (categoryState) params.append('category', categoryState);
      if (regionState) params.append('region', regionState);
      if (tagIdState) params.append('tagId', tagIdState.toString());
      if (specialThemeIdState) params.append('specialThemeId', specialThemeIdState.toString());
      if (levelState) params.append('level', levelState.toString());

      const response = await fetch(`/api/news/important/with-photos?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch important news with photos';
      console.error('Error in useImportantNewsWithPhotos:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [categoryState, regionState, tagIdState, specialThemeIdState, levelState, limit, lang, requirePhotos]);

  // Автоматичне завантаження при зміні параметрів
  useEffect(() => {
    if (autoFetch) {
      fetchImportantNewsWithPhotos();
    }
  }, [fetchImportantNewsWithPhotos, autoFetch]);

  // Оновлення внутрішнього стану при зміні пропсів
  useEffect(() => {
    setCategoryState(category);
    setRegionState(region);
    setTagIdState(tagId);
    setSpecialThemeIdState(specialThemeId);
    setLevelState(level);
    setLimit(initialLimit);
    setLang(initialLang);
    setRequirePhotos(initialRequirePhotos);
  }, [category, region, tagId, specialThemeId, level, initialLimit, initialLang, initialRequirePhotos]);

  const refetch = useCallback(() => {
    fetchImportantNewsWithPhotos();
  }, [fetchImportantNewsWithPhotos]);

  const handleSetCategory = useCallback((newCategory: string | undefined) => {
    setCategoryState(newCategory);
  }, []);

  const handleSetRegion = useCallback((newRegion: string | undefined) => {
    setRegionState(newRegion);
  }, []);

  const handleSetTagId = useCallback((newTagId: number | undefined) => {
    setTagIdState(newTagId);
  }, []);

  const handleSetSpecialThemeId = useCallback((newThemeId: number | undefined) => {
    setSpecialThemeIdState(newThemeId);
  }, []);

  const handleSetLevel = useCallback((newLevel: number | undefined) => {
    setLevelState(newLevel);
  }, []);

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
  }, []);

  const handleSetLang = useCallback((newLang: string) => {
    setLang(newLang);
  }, []);

  const handleSetRequirePhotos = useCallback((newRequire: boolean) => {
    setRequirePhotos(newRequire);
  }, []);

  // Додаткові методи для зручності
  const getLatestNews = useCallback((): ImportantNewsWithPhotosItem | null => {
    return data?.news?.[0] || null;
  }, [data]);

  const getTopImportantNews = useCallback((): ImportantNewsWithPhotosItem | null => {
    return data?.news?.find(news => news.nweight === 2) || null;
  }, [data]);

  const getPhotoNews = useCallback((): ImportantNewsWithPhotosItem | null => {
    return data?.news?.find(news => news.nweight === 3) || null;
  }, [data]);

  const getNewsByWeight = useCallback((weight: number): ImportantNewsWithPhotosItem[] => {
    return data?.news?.filter(news => news.nweight === weight) || [];
  }, [data]);

  const hasNews = Boolean(data?.news && data.news.length > 0);

  // Методи для роботи з зображеннями
  const getMainImageForNews = useCallback((newsItem: ImportantNewsWithPhotosItem) => {
    return getMainImage(newsItem.images);
  }, []);

  const hasImagesForNews = useCallback((newsItem: ImportantNewsWithPhotosItem) => {
    return hasImages(newsItem.images);
  }, []);

  const getImagesCountForNews = useCallback((newsItem: ImportantNewsWithPhotosItem) => {
    return getImagesCount(newsItem.images);
  }, []);

  // Статистичні методи
  const getTotalNews = useCallback((): number => {
    return data?.total || 0;
  }, [data]);

  const getNewsCount = useCallback((): number => {
    return data?.news?.length || 0;
  }, [data]);

  // Методи для отримання метаданих
  const getCategoryInfo = useCallback(() => {
    return data?.metadata?.category || null;
  }, [data]);

  const getRegionInfo = useCallback(() => {
    return data?.metadata?.region || null;
  }, [data]);

  const getTagInfo = useCallback(() => {
    return data?.metadata?.tag || null;
  }, [data]);

  const getSpecialThemeInfo = useCallback(() => {
    return data?.metadata?.specialTheme || null;
  }, [data]);

  return {
    data,
    loading,
    error,
    refetch,
    setCategory: handleSetCategory,
    setRegion: handleSetRegion,
    setTagId: handleSetTagId,
    setSpecialThemeId: handleSetSpecialThemeId,
    setLevel: handleSetLevel,
    setLimit: handleSetLimit,
    setLang: handleSetLang,
    setRequirePhotos: handleSetRequirePhotos,
    getLatestNews,
    getTopImportantNews,
    getPhotoNews,
    getNewsByWeight,
    hasNews,
    getMainImage: getMainImageForNews,
    hasImages: hasImagesForNews,
    getImagesCount: getImagesCountForNews,
    getTotalNews,
    getNewsCount,
    getCategoryInfo,
    getRegionInfo,
    getTagInfo,
    getSpecialThemeInfo
  };
}

// Додаткові хуки для специфічних випадків використання

// Хук для важливих новин з фото за категорією
export function useImportantNewsWithPhotosByCategory(category: string, options: Omit<UseImportantNewsWithPhotosOptions, 'category'> = {}) {
  return useImportantNewsWithPhotos({ ...options, category });
}

// Хук для важливих новин з фото за регіоном
export function useImportantNewsWithPhotosByRegion(region: string, options: Omit<UseImportantNewsWithPhotosOptions, 'region'> = {}) {
  return useImportantNewsWithPhotos({ ...options, region });
}

// Хук для важливих новин з фото за тегом
export function useImportantNewsWithPhotosByTag(tagId: number, options: Omit<UseImportantNewsWithPhotosOptions, 'tagId'> = {}) {
  return useImportantNewsWithPhotos({ ...options, tagId });
}

// Хук для важливих новин з фото за спеціальною темою
export function useImportantNewsWithPhotosBySpecialTheme(specialThemeId: number, options: Omit<UseImportantNewsWithPhotosOptions, 'specialThemeId'> = {}) {
  return useImportantNewsWithPhotos({ ...options, specialThemeId });
}

// Хук для топ важливих новин з фото (рівень 2)
export function useTopImportantNewsWithPhotos(options: UseImportantNewsWithPhotosOptions = {}) {
  return useImportantNewsWithPhotos({ ...options, level: 2, limit: 1 });
}

// Хук для фото новин (рівень 3)
export function usePhotoImportantNews(options: UseImportantNewsWithPhotosOptions = {}) {
  return useImportantNewsWithPhotos({ ...options, level: 3 });
}

// Хук для ілюстрованих новин (рівень 4)
export function useIllustratedImportantNews(options: UseImportantNewsWithPhotosOptions = {}) {
  return useImportantNewsWithPhotos({ ...options, level: 4 });
}

// Хук для важливих новин з фото за кількома фільтрами
export function useImportantNewsWithPhotosMultiFilter(filters: {
  category?: string;
  region?: string;
  tagId?: number;
  specialThemeId?: number;
}, options: UseImportantNewsWithPhotosOptions = {}) {
  return useImportantNewsWithPhotos({ 
    ...options, 
    ...filters 
  });
}

// Хук для останньої важливої новини з фото
export function useLatestImportantNewsWithPhoto(options: UseImportantNewsWithPhotosOptions = {}) {
  return useImportantNewsWithPhotos({ ...options, limit: 1 });
}
