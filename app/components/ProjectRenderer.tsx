'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatFullNewsDate, getImageFromImageData } from '@/app/lib/newsUtils';
import Breadcrumbs from '@/app/components/breadcrumbs/Breadcrumbs';
import styles from './ProjectRenderer.module.css';

interface ProjectRendererProps {
  article: any;
  loading?: boolean;
}

const ProjectRenderer: React.FC<ProjectRendererProps> = ({ article, loading = false }) => {
  // Умовні return statements повинні бути до виклику hooks
  if (loading) {
    return (
      <div className={styles.projectContainer}>
        <div className={styles.loading}>Завантаження...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.projectContainer}>
        <div className={styles.error}>Проект не знайдено</div>
      </div>
    );
  }

  // Тепер викликаємо hooks після умовних return statements
  const [allImages, setAllImages] = useState<string[]>([]);

  React.useEffect(() => {
    if (!article?.images_data || !article?.images) return;

    // Отримуємо масив ID зображень з article.images (comma-separated string)
    const imageIds = article.images.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
    
    // Створюємо масив URL в правильному порядку
    const urls: string[] = imageIds
      .map((imageId: number) => {
        const img = article.images_data.find((imgData: any) => imgData.id === imageId);
        return img ? getImageFromImageData(img, 'full') : null;
      })
      .filter((u: string | null): u is string => Boolean(u));

    setAllImages(urls);
  }, [article?.images_data, article?.images]);

  // Отримуємо перше зображення для банера
  const bannerImage = allImages.length > 0 ? allImages[0] : null;

  // Формуємо breadcrumbs
  const breadcrumbItems = [
    { label: 'ГОЛОВНА', href: '/' },
    ...(article?.breadcrumbs?.map((item: { title: string; link: string }) => ({
      label: item.title.toUpperCase(),
      href: item.link,
    })) || []),
    { label: article?.nheader?.toUpperCase() || 'ПРОЕКТ' },
  ];

  return (
    <div className={styles.projectContainer}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbsSection}>
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Основне зображення з заголовком */}
      {bannerImage && (
        <div className={styles.bannerSection}>
          <div className={styles.bannerImage}>
            <Image
              src={bannerImage}
              alt={article.nheader || 'Проект'}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className={styles.bannerOverlay}>
              <div className={`${styles.bannerContent} ${styles.frostedGlass}`}>
                <h1 className={styles.bannerTitle}>{article.nheader}</h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Якщо немає банерного зображення, показуємо заголовок окремо */}
      {!bannerImage && article.nheader && (
        <div className={styles.leadSection}>
          <h1 className={styles.titleText}>
            {article.nheader}
          </h1>
        </div>
      )}

      {/* Дата та теги */}
      <div className={styles.metaSection}>
        <div className={styles.dateAndTags}>
          <time className={styles.publishDate}>
            {formatFullNewsDate(article.ndate, article.ntime)}
          </time>
          {article.tags && article.tags.length > 0 && (
            <div className={styles.tags}>
              {article.tags.map((tag: any, index: number) => (
                <span key={tag.id || index} className={styles.tag}>
                  {(typeof tag === 'string' ? tag : tag.tag || '').toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Лід (teaser) */}
      {article.nteaser && (
        <div className={styles.leadSection}>
          <p className={styles.lead}>{article.nteaser}</p>
        </div>
      )}

      {/* Основний текст проекту */}
      <div className={styles.contentSection}>
        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: article.nbody || '' }}
        />
      </div>

      {/* Автор */}
      {article.showauthor && article.author_name && (
        <div className={styles.authorSection}>
          <p className={styles.author}>
            Автор: {article.author_name}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectRenderer;
