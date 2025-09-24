import { useState, useEffect } from 'react';
import { useAuthors, Author } from './useAuthors';

export interface UseAuthorOptions {
  authorId?: number | null;
  autoFetch?: boolean;
}

export interface UseAuthorReturn {
  author: Author | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAuthor(options: UseAuthorOptions = {}): UseAuthorReturn {
  const { authorId, autoFetch = true } = options;
  const { authorsData, getAuthorById, refreshAuthors } = useAuthors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const author = authorId ? getAuthorById(authorId) : null;

  const refetch = async () => {
    if (!authorId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await refreshAuthors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && authorId && !author) {
      refetch();
    }
  }, [authorId, autoFetch, author]);

  return {
    author,
    loading: authorsData.loading || loading,
    error: authorsData.error || error,
    refetch,
  };
}
