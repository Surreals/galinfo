'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Spin, Empty } from 'antd';
import Link from 'next/link';
import styles from './search.module.css';

interface SearchResult {
  id: number;
  title: string;
  summary: string;
  url_key: string;
  category_name: string;
  published_at: string;
  main_image_url?: string;
}

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/news/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
          setResults(data.news || []);
          setTotal(data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <Empty description="Введіть пошуковий запит" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Результати пошуку: &quot;{query}&quot;</h1>
        <p className={styles.resultsCount}>
          Знайдено: <strong>{total}</strong> {total === 1 ? 'результат' : 'результатів'}
        </p>
      </div>

      {results.length === 0 ? (
        <Empty description="Нічого не знайдено" />
      ) : (
        <div className={styles.results}>
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/news/${result.url_key}`}
              className={styles.resultCard}
            >
              {result.main_image_url && (
                <div className={styles.resultImage}>
                  <img src={result.main_image_url} alt={result.title} />
                </div>
              )}
              <div className={styles.resultContent}>
                <h2 className={styles.resultTitle}>{result.title}</h2>
                <p className={styles.resultSummary}>{result.summary}</p>
                <div className={styles.resultMeta}>
                  <span className={styles.resultCategory}>{result.category_name}</span>
                  <span className={styles.resultDate}>
                    {new Date(result.published_at).toLocaleDateString('uk-UA')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

