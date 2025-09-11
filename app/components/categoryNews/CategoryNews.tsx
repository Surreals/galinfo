'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AccentSquare, ViewAllButton } from '@/app/shared';
import styles from './CategoryNews.module.css';
import { useState, useEffect } from 'react';
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';
import { useNewsByRegion } from '@/app/hooks/useNewsByRegion';
import { isRegionCategory } from '@/app/lib/categoryUtils';
import { getImageUrlFromApi, getMainImageFromApi, hasApiImages, type ApiNewsImage } from '@/app/lib/imageUtils';
import { getUniversalNewsImageIntxt } from '@/app/lib/newsUtils';
import { getUrlFromCategoryId } from '@/app/lib/categoryMapper';

// Інтерфейси для типізації даних
export interface CategoryNewsItem {
  id: string;
  title: string;
  date: string;
  time: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  isImportant?: boolean;
  nweight: number;
}

export interface CategoryNewsProps {
  category: string;
  categoryId?: number;
  news?: CategoryNewsItem[];
  isLoading?: boolean;
  hideHeader?: boolean;
  className?: string;
  height?: number;
  mobileLayout?: 'column' | 'horizontal';
  isMobile?: boolean;
  limit?: number; // Кількість новин для відображення
  useRealData?: boolean; // Чи використовувати реальні дані з API
  config?: {
    mobileLayout?: 'column' | 'horizontal';
    limit?: number;
    showImportantTag?: boolean;
    hideHeader?: boolean;
    height?: number;
    useRealData?: boolean;
    apiParams?: {
      page?: number;
      limit?: number;
      lang?: string;
      approved?: boolean;
      type?: string;
    };
  };
}

export default function CategoryNews({ 
  category = "КУЛЬТУРА", 
  news = [], 
  isLoading = false,
  hideHeader = false,
  height = 200,
  className = "",
  mobileLayout = 'column',
  isMobile = false,
  categoryId,
  limit = 8,
  useRealData = false,
  config
}: CategoryNewsProps) {
  // Визначаємо, чи потрібно показувати горизонтальне відображення
  const [isMobileResize, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Визначаємо, чи це регіональна категорія
  const isRegion = categoryId ? isRegionCategory(categoryId) : false;

  // Використовуємо відповідний хук залежно від типу категорії
  const rubricHook = useNewsByRubric({
    rubric: categoryId?.toString() || '',
    page: config?.apiParams?.page || 1,
    limit: config?.apiParams?.limit || limit,
    lang: config?.apiParams?.lang || '1',
    approved: config?.apiParams?.approved !== undefined ? config.apiParams.approved : true,
    type: config?.apiParams?.type,
    autoFetch: useRealData && !!categoryId && !isRegion
  });

  const regionHook = useNewsByRegion({
    region: categoryId?.toString() || '',
    page: config?.apiParams?.page || 1,
    limit: config?.apiParams?.limit || limit,
    lang: config?.apiParams?.lang || '1',
    approved: config?.apiParams?.approved !== undefined ? config.apiParams.approved : true,
    type: config?.apiParams?.type,
    autoFetch: useRealData && !!categoryId && isRegion
  });

  // Вибираємо дані з відповідного хука
  const apiData = isRegion ? regionHook.data : rubricHook.data;
  const apiLoading = isRegion ? regionHook.loading : rubricHook.loading;
  const apiError = isRegion ? regionHook.error : rubricHook.error;


  const shouldShowHorizontal = isMobileResize && mobileLayout === 'horizontal';

  // Визначаємо, які дані використовувати
  let displayNews: CategoryNewsItem[] = [];
  let displayLoading = isLoading;

  if (useRealData && apiData?.news) {
    // Використовуємо реальні дані з API
    displayNews = apiData.news.map(item => {
      // Використовуємо універсальну функцію getUniversalNewsImageIntxt з newsUtils
      const imageUrl = getUniversalNewsImageIntxt(item) || 'https://picsum.photos/300/200?random=1';

      return {
        id: item.id.toString(),
        title: item.nheader,
        date: new Date(item.ndate).toLocaleDateString('uk-UA', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        time: item.ntime,
        url: `/news/${item.urlkey}_${item.id}`,
        imageUrl: imageUrl,
        imageAlt: item.nheader,
        nweight: (item as any).nweight || 0
      };
    });
    displayLoading = apiLoading;
  } else if (news.length > 0) {
    // Використовуємо передані дані
    displayNews = news;
  } else {
    // Якщо немає даних, показуємо порожній стан
    displayNews = [];
  }

  // Обробка помилок
  if (useRealData && apiError) {
    return (
      <section className={`${styles.categoryNewsSection} ${className}`}>
        <div className={styles.container}>
          <div className={styles.errorMessage}>
            Помилка завантаження новин: {apiError}
          </div>
        </div>
      </section>
    );
  }

  console.log(displayNews, 'displayNews')

  return (
    <section className={`${styles.categoryNewsSection} ${className}`}>
      <div className={styles.container}>
        {/* Заголовок секції */}
        {!hideHeader && (
          <div className={styles.header}>
            <AccentSquare className={styles.titleAccent} />
            {categoryId && getUrlFromCategoryId(categoryId) ? (
              <Link href={`/${getUrlFromCategoryId(categoryId)}`} className={styles.titleLink}>
                <h2 className={styles.title}>{category}</h2>
              </Link>
            ) : (
              <h2 className={styles.title}>{category}</h2>
            )}
          </div>
        )}

        {/* Сітка новин */}
        <div className={`${styles.newsGrid} ${shouldShowHorizontal ? styles.newsGridHorizontal : ''}`}>
          {displayLoading ? (
            // Скелетон для завантаження
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={`${styles.newsItem} ${shouldShowHorizontal ? styles.newsItemHorizontal : ''}`}>
                <div 
                  className={styles.skeletonImage}
                  style={{
                    height: shouldShowHorizontal ? height : 'auto',
                    aspectRatio: shouldShowHorizontal ? 'auto' : '1'
                  }}
                ></div>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonDate}></div>
              </div>
            ))
          ) : (
            // Відображення новин
            displayNews.map((item) => (
              <article key={item.id} className={`${styles.newsItem} ${shouldShowHorizontal ? styles.newsItemHorizontal : ''}`}>
                <Link href={item.url} className={styles.newsLink}>
                  <div style={{
                    height: shouldShowHorizontal ? height : 'auto',
                  }} 
                  className={styles.imageContainer}>
                    <Image 
                      src={item.imageUrl} 
                      alt={item.imageAlt}
                      width={300}
                      height={shouldShowHorizontal ? height : 300}
                      className={styles.newsImage}
                    />
                    {item.nweight > 0 && (
                      <div className={styles.importantTag}>
                        ВАЖЛИВО
                      </div>
                    )}
                  </div>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  <time className={styles.newsDate}>
                    {item.date}, {item.time}
                  </time>
                </Link>
              </article>
            ))
          )}
        </div>

        {/* Кнопка "Всі новини з рубрики" */}
        {!hideHeader && (
          <>
            <ViewAllButton href={categoryId && getUrlFromCategoryId(categoryId) ? `/${getUrlFromCategoryId(categoryId)}` : '/all-news'} />
            
            {/* Розділювальна лінія */}
            
          </>
        )}
        <div className={styles.separator}></div>
      </div>
    </section>
  );
}