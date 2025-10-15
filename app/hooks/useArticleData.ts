import { useState, useEffect, useCallback } from 'react';
import { apiGet, ApiError } from '@/app/lib/apiClient';
import { useAdminAuth } from '@/app/contexts/AdminAuthContext';

// Типи для даних новини
export interface ArticleData {
  // Основні поля
  id?: number;
  urlkey?: string;
  nheader: string;
  nsubheader: string;
  nteaser: string;
  nbody: string;
  
  // Спеціальні заголовки
  sheader?: string;
  steaser?: string;
  
  // Мета дані
  ntitle?: string;
  ndescription?: string;
  nkeywords?: string;
  
  // Налаштування
  ntype: number;
  rubric: number[];
  region: number[];
  theme?: number | null;
  tags: string[];
  
  // Автори
  nauthor?: number | null;
  userid?: number | null;
  showauthor: boolean;
  
  // Пріоритет та шаблон
  nweight: number;
  layout: number;
  
  // Додаткові параметри
  rated: boolean;
  headlineblock: boolean;
  hiderss: boolean;
  nocomment: boolean;
  maininblock: boolean;
  idtotop?: number;
  suggest: boolean;
  photo: boolean;
  video: boolean;
  
  // Час публікації
  ndate: string;
  ntime: string;
  
  // Публікація
  approved: boolean;
  to_twitter: boolean;
  
  // Зображення
  images: string;
  
  // Назви файлів зображень
  image_filenames: Array<{
    id: number;
    filename: string;
    title_ua?: string;
    title_deflang?: string;
    pic_type?: number;
  }>;
  
  // Мова
  lang: string;
}

export interface UseArticleDataOptions {
  id?: string | null;
}

export interface UseArticleDataReturn {
  data: ArticleData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateData: (updates: Partial<ArticleData>) => void;
}

const defaultArticleData: ArticleData = {
  nheader: '',
  nsubheader: '',
  nteaser: '',
  nbody: '',
  ntype: 1,
  rubric: [],
  region: [],
  tags: [],
  showauthor: true,  // За замовчуванням увімкнено
  nweight: 0,
  layout: 0,
  rated: true,
  headlineblock: false,
  hiderss: false,  // За замовчуванням вимкнено (не транслювати в RSS)
  nocomment: false,
  maininblock: true,  // За замовчуванням увімкнено (Головна стрічка)
  suggest: false,
  photo: false,
  video: false,
  ndate: new Date().toISOString().split('T')[0],
  ntime: new Date().toTimeString().split(' ')[0].substring(0, 5) + ':00',
  approved: false,
  to_twitter: false,
  images: '',
  image_filenames: [],
  lang: 'ua',
};

export function useArticleData(options: UseArticleDataOptions = {}): UseArticleDataReturn {
  const [data, setData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAdminAuth();

  const fetchArticle = useCallback(async () => {
    if (!options.id) {
      // When creating a new article, set the current user as the author
      const newArticleData = {
        ...defaultArticleData,
        nauthor: user?.id || null,
        userid: user?.id || null, // Set both fields to current user for consistency
      };
      setData(newArticleData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<{ data: ArticleData }>(`/api/admin/articles/${options.id}`);
      setData(response.data.data);
    } catch (err) {
      let errorMessage = 'Unknown error';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
        console.error('API Error fetching article:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText
        });
      } else {
        console.error('Error fetching article:', err);
        errorMessage = err instanceof Error ? err.message : 'Unknown error';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options.id, user]);

  const updateData = (updates: Partial<ArticleData>) => {
    setData(prev => prev ? { ...prev, ...updates } : null);
  };

  useEffect(() => {
    fetchArticle();
  }, [options.id]);

  return {
    data,
    loading,
    error,
    refetch: fetchArticle,
    updateData,
  };
}
