import { useState, useEffect } from 'react';

// Типи для даних новини
export interface ArticleData {
  // Основні поля
  id?: number;
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
  theme?: number;
  tags: string[];
  
  // Автори
  nauthor?: number;
  userid?: number;
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
  showauthor: false,
  nweight: 0,
  layout: 0,
  rated: true,
  headlineblock: false,
  hiderss: false,
  nocomment: false,
  maininblock: false,
  suggest: false,
  photo: false,
  video: false,
  ndate: new Date().toISOString().split('T')[0],
  ntime: new Date().toTimeString().split(' ')[0].substring(0, 5) + ':00',
  approved: false,
  to_twitter: false,
  images: '',
  lang: 'ua',
};

export function useArticleData(options: UseArticleDataOptions = {}): UseArticleDataReturn {
  const [data, setData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = async () => {
    if (!options.id) {
      setData(defaultArticleData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/articles/${options.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

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
