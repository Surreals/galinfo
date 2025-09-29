"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiGetWithParams, ApiError } from '@/app/lib/apiClient';

// Типи для новини
export interface NewsImage {
  id: number;
  filename: string;
  title: string;
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
}

export interface NewsTag {
  id: number;
  tag: string;
  lng: string;
}

export interface RelatedNews {
  id: number;
  urlkey: string;
  ndate: string;
  ntype: number;
  images: string;
  nheader: string;
  nteaser: string;
}

export interface SingleNewsArticle {
  id: number;
  ndate: string;
  ntime: string;
  ntype: number;
  images: string;
  urlkey: string;
  photo: number;
  video: number;
  comments: number;
  printsubheader: number;
  rubric: string;
  userid: number;
  udate: number;
  lang: string;
  approved: number;
  rated: number;
  nheader: string;
  nsubheader: string;
  nteaser: string;
  nbody: string;
  ntitle: string;
  ndescription: string;
  nkeywords: string;
  comments_count: number;
  views_count: number;
  author_name: string;
  images: NewsImage[];
  rubrics: NewsRubric[];
  tags: NewsTag[];
  relatedNews: RelatedNews[];
}

export interface SingleNewsResponse {
  article: SingleNewsArticle;
  meta: {
    type: string;
    urlkey: string;
    id: number;
  };
}

export interface UseSingleNewsOptions {
  articleType: string;
  urlkey: string;
  id: number;
  lang?: string;
  autoFetch?: boolean;
}

export interface UseSingleNewsReturn {
  data: SingleNewsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSingleNews(options: UseSingleNewsOptions): UseSingleNewsReturn {
  const {
    articleType,
    urlkey,
    id,
    lang = '1',
    autoFetch = true
  } = options;

  const [data, setData] = useState<SingleNewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!articleType || !urlkey || !id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiGetWithParams<SingleNewsResponse>(`/api/news/single/${articleType}/${urlkey}_${id}`, {
        lang
      });

      setData(response.data);
    } catch (err) {
      let errorMessage = 'Failed to fetch article';
      
      if (err instanceof ApiError) {
        if (err.status === 404) {
          errorMessage = 'Article not found';
        } else {
          errorMessage = err.message;
        }
        console.error('API Error fetching single news:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText
        });
      } else {
        console.error('Error fetching single news:', err);
        errorMessage = err instanceof Error ? err.message : 'Failed to fetch article';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [articleType, urlkey, id, lang]);

  // Автоматичне завантаження при зміні параметрів
  useEffect(() => {
    if (autoFetch) {
      fetchNews();
    }
  }, [fetchNews, autoFetch]);

  const refetch = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    data,
    loading,
    error,
    refetch
  };
}
