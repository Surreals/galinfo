"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiGetWithParams, ApiError } from '@/app/lib/apiClient';

// Розширені типи для повної інформації новини
export interface NewsImage {
  id: number;
  filename: string;
  title: string;
  title_ua?: string;
  urls: {
    full: string;
    intxt: string;
    tmb: string;
  };
}

export interface NewsRubric {
  id: number;
  param: string;
  title: string;
  cattype: string;
  description?: string;
}

export interface NewsTag {
  id: number;
  tag: string;
}

export interface RelatedNews {
  id: number;
  urlkey: string;
  ndate: string;
  ntype: number;
  images: string;
  nheader: string;
  nteaser: string;
  comments_count?: number;
  views_count?: number;
}

export interface NewsAuthor {
  id: number;
  name: string;
  avatar?: string;
  twowords?: string;
  link?: string;
}

export interface NewsStatistics {
  comments_count: number;
  views_count: number;
  rating?: number;
}

export interface NewsMeta {
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
}

export interface NewsBreadcrumb {
  type: 'rubric' | 'article_type';
  title: string;
  link: string;
}

export interface CompleteNewsArticle {
  // Основна інформація
  id: number;
  ndate: string;
  ntime: string;
  ntype: number;
  urlkey: string;
  lang: string;
  approved: number;
  udate: number;
  
  // Контент
  nheader: string;
  nsubheader: string;
  nteaser: string;
  nbody: string;
  
  // Мета інформація
  ntitle: string;
  ndescription: string;
  nkeywords: string;
  
  // Медіа
  images: string;
  photo: number;
  video: number;
  
  // Класифікація
  rubric: string;
  nweight: number;
  layout: number;
  
  // Автор
  userid: number;
  showauthor: number;
  
  // Статистика
  comments: number;
  printsubheader: number;
  rated: number;
  
  // Розширені дані
  images_data: NewsImage[];
  rubrics: NewsRubric[];
  tags: NewsTag[];
  relatedNews: RelatedNews[];
  author: NewsAuthor | null;
  statistics: NewsStatistics;
  meta: NewsMeta;
  breadcrumbs: NewsBreadcrumb[];
  
  // Додаткові поля з PHP
  region?: string;
  region_description?: string;
  bytheme?: string;
  comments_count: number;
  views_count: number;
  author_name: string;
}

export interface CompleteNewsResponse {
  article: CompleteNewsArticle;
  meta: {
    type: string;
    urlkey: string;
    id: number;
    printUrl?: string;
    editUrl?: string;
  };
  layout: {
    pattern: string;
    imageClass: string;
    imagePath: string;
  };
}

export interface UseCompleteNewsDataOptions {
  articleType: string;
  urlkey: string;
  id: number;
  lang?: string;
  autoFetch?: boolean;
  includeRelated?: boolean;
  includeAuthor?: boolean;
  includeStatistics?: boolean;
}

export interface UseCompleteNewsDataReturn {
  data: CompleteNewsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  // Додаткові методи для роботи з даними
  getImageByIndex: (index: number) => NewsImage | null;
  getRubricByIndex: (index: number) => NewsRubric | null;
  getTagByIndex: (index: number) => NewsTag | null;
  getRelatedNewsByIndex: (index: number) => RelatedNews | null;
  hasImages: boolean;
  hasRubrics: boolean;
  hasTags: boolean;
  hasRelatedNews: boolean;
  hasAuthor: boolean;
  isImportant: boolean;
  isPhotoNews: boolean;
  isVideoNews: boolean;
  isBlogPost: boolean;
}

export function useCompleteNewsData(options: UseCompleteNewsDataOptions): UseCompleteNewsDataReturn {
  const {
    articleType,
    urlkey,
    id,
    lang = '1',
    autoFetch = true,
    includeRelated = true,
    includeAuthor = true,
    includeStatistics = true
  } = options;

  const [data, setData] = useState<CompleteNewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompleteNews = useCallback(async () => {
    if (!articleType || !urlkey || !id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiGetWithParams<CompleteNewsResponse>(`/api/news/complete/${articleType}/${urlkey}_${id}`, {
        lang,
        includeRelated: includeRelated.toString(),
        includeAuthor: includeAuthor.toString(),
        includeStatistics: includeStatistics.toString()
      });

      setData(response.data);
    } catch (err) {
      let errorMessage = 'Failed to fetch complete article data';
      
      if (err instanceof ApiError) {
        if (err.status === 404) {
          errorMessage = 'Article not found';
        } else {
          errorMessage = err.message;
        }
        console.error('API Error fetching complete news data:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText
        });
      } else {
        console.error('Error fetching complete news data:', err);
        errorMessage = err instanceof Error ? err.message : 'Failed to fetch complete article data';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [articleType, urlkey, id, lang, includeRelated, includeAuthor, includeStatistics]);

  // Автоматичне завантаження при зміні параметрів
  useEffect(() => {
    if (autoFetch) {
      fetchCompleteNews();
    }
  }, [fetchCompleteNews, autoFetch]);

  const refetch = useCallback(() => {
    fetchCompleteNews();
  }, [fetchCompleteNews]);

  // Допоміжні методи для роботи з даними
  const getImageByIndex = useCallback((index: number): NewsImage | null => {
    if (!data?.article.images_data || index < 0 || index >= data.article.images_data.length) {
      return null;
    }
    return data.article.images_data[index];
  }, [data]);

  const getRubricByIndex = useCallback((index: number): NewsRubric | null => {
    if (!data?.article.rubrics || index < 0 || index >= data.article.rubrics.length) {
      return null;
    }
    return data.article.rubrics[index];
  }, [data]);

  const getTagByIndex = useCallback((index: number): NewsTag | null => {
    if (!data?.article.tags || index < 0 || index >= data.article.tags.length) {
      return null;
    }
    return data.article.tags[index];
  }, [data]);

  const getRelatedNewsByIndex = useCallback((index: number): RelatedNews | null => {
    if (!data?.article.relatedNews || index < 0 || index >= data.article.relatedNews.length) {
      return null;
    }
    return data.article.relatedNews[index];
  }, [data]);

  // Властивості для перевірки наявності даних
  const hasImages = Boolean(data?.article.images_data && data.article.images_data.length > 0);
  const hasRubrics = Boolean(data?.article.rubrics && data.article.rubrics.length > 0);
  const hasTags = Boolean(data?.article.tags && data.article.tags.length > 0);
  const hasRelatedNews = Boolean(data?.article.relatedNews && data.article.relatedNews.length > 0);
  const hasAuthor = Boolean(data?.article.author);

  // Властивості для визначення типу новини
  const isImportant = Boolean(data?.article.nweight && data.article.nweight > 0);
  const isPhotoNews = data?.article.ntype === 3;
  const isVideoNews = data?.article.ntype === 4;
  const isBlogPost = data?.article.ntype === 20;

  return {
    data,
    loading,
    error,
    refetch,
    getImageByIndex,
    getRubricByIndex,
    getTagByIndex,
    getRelatedNewsByIndex,
    hasImages,
    hasRubrics,
    hasTags,
    hasRelatedNews,
    hasAuthor,
    isImportant,
    isPhotoNews,
    isVideoNews,
    isBlogPost
  };
}

// Додаткові хуки для специфічних типів новин
export function usePhotoNewsData(options: Omit<UseCompleteNewsDataOptions, 'articleType'>) {
  return useCompleteNewsData({ ...options, articleType: 'photo' });
}

export function useVideoNewsData(options: Omit<UseCompleteNewsDataOptions, 'articleType'>) {
  return useCompleteNewsData({ ...options, articleType: 'video' });
}

export function useBlogPostData(options: Omit<UseCompleteNewsDataOptions, 'articleType'>) {
  return useCompleteNewsData({ ...options, articleType: 'blogs' });
}

export function useArticleData(options: Omit<UseCompleteNewsDataOptions, 'articleType'>) {
  return useCompleteNewsData({ ...options, articleType: 'articles' });
}

export function useNewsData(options: Omit<UseCompleteNewsDataOptions, 'articleType'>) {
  return useCompleteNewsData({ ...options, articleType: 'news' });
}
