'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticlePageRenderer from '@/app/components/ArticlePageRenderer';
import { CompleteNewsArticle } from '@/app/hooks/useCompleteNewsData';
import styles from './page.module.css';

interface PreviewPageClientProps {
  token: string;
  id: number;
}

export const PreviewPageClient: React.FC<PreviewPageClientProps> = ({ token, id }) => {
  const [data, setData] = useState<{ article: CompleteNewsArticle } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/news/preview/${token}/${id}`);
        
        if (!response.ok) {
          if (response.status === 403) {
            setError('Невалідне посилання для перегляду. Токен не підходить.');
          } else if (response.status === 404) {
            setError('Новина не знайдена.');
          } else {
            setError('Помилка завантаження новини.');
          }
          setLoading(false);
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching preview data:', err);
        setError('Помилка завантаження новини.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [token, id]);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2 className={styles.errorTitle}>Помилка</h2>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.previewContainer}>
      {/* Водяний знак про preview режим */}
      <div className={styles.previewBanner}>
        <div className={styles.previewBannerContent}>
          <span className={styles.previewBannerIcon}>👁️</span>
          <div className={styles.previewBannerText}>
            <strong>РЕЖИМ ПЕРЕГЛЯДУ</strong>
            <span className={styles.previewBannerSubtext}>
              Ця новина ще не опублікована. Це технічне посилання для попереднього перегляду.
            </span>
          </div>
        </div>
      </div>

      <ArticlePageRenderer article={data?.article} loading={loading} />
    </div>
  );
};

