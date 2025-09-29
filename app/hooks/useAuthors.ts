import { useState, useEffect } from 'react';

export interface Author {
  id: number;
  name: string;
  type: 'editor' | 'journalist' | 'blogger';
  services?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface AuthorsData {
  editors: Author[];
  journalists: Author[];
  bloggers: Author[];
  allAuthors: Author[];
  loading: boolean;
  error: string | null;
}

export interface UseAuthorsOptions {
  includeInactive?: boolean;
  refreshInterval?: number; // в мілісекундах
}

export interface UseAuthorsReturn {
  authorsData: AuthorsData;
  refreshAuthors: () => Promise<void>;
  getAuthorById: (id: number) => Author | undefined;
  getAuthorsByType: (type: 'editor' | 'journalist' | 'blogger') => Author[];
  searchAuthors: (query: string) => Author[];
}

export function useAuthors(options: UseAuthorsOptions = {}): UseAuthorsReturn {
  const [authorsData, setAuthorsData] = useState<AuthorsData>({
    editors: [],
    journalists: [],
    bloggers: [],
    allAuthors: [],
    loading: true,
    error: null,
  });

  // Функція для завантаження авторів
  const fetchAuthors = async (): Promise<Author[]> => {
    try {
      const response = await fetch('/api/admin/all-users');
      if (!response.ok) {
        throw new Error('Failed to fetch authors');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch authors');
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching authors:', error);
      throw error;
    }
  };

  // Функція для оновлення даних
  const refreshAuthors = async (): Promise<void> => {
    setAuthorsData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const authors = await fetchAuthors();
      
      // Фільтруємо неактивних користувачів, якщо потрібно
      const filteredAuthors = options.includeInactive 
        ? authors 
        : authors.filter(author => author.isActive !== false);
      
      // Розділяємо авторів за типами
      const editors = filteredAuthors.filter(author => author.type === 'editor');
      const journalists = filteredAuthors.filter(author => author.type === 'journalist');
      const bloggers = filteredAuthors.filter(author => author.type === 'blogger');
      
      setAuthorsData({
        editors,
        journalists,
        bloggers,
        allAuthors: filteredAuthors,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthorsData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  // Функція для пошуку автора за ID
  const getAuthorById = (id: number): Author | undefined => {
    return authorsData.allAuthors.find(author => author.id === id);
  };

  // Функція для отримання авторів за типом
  const getAuthorsByType = (type: 'editor' | 'journalist' | 'blogger'): Author[] => {
    return authorsData.allAuthors.filter(author => author.type === type);
  };

  // Функція для пошуку авторів
  const searchAuthors = (query: string): Author[] => {
    if (!query.trim()) return authorsData.allAuthors;
    
    const lowercaseQuery = query.toLowerCase();
    return authorsData.allAuthors.filter(author =>
      author.name.toLowerCase().includes(lowercaseQuery) ||
      author.email?.toLowerCase().includes(lowercaseQuery) ||
      author.phone?.includes(query)
    );
  };

  // Автоматичне завантаження при монтуванні
  useEffect(() => {
    refreshAuthors();
  }, [options.includeInactive]);

  // Автоматичне оновлення за інтервалом
  useEffect(() => {
    if (options.refreshInterval && options.refreshInterval > 0) {
      const interval = setInterval(refreshAuthors, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [options.refreshInterval]);

  return {
    authorsData,
    refreshAuthors,
    getAuthorById,
    getAuthorsByType,
    searchAuthors,
  };
}
