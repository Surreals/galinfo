'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AccentSquare, ViewAllButton } from '@/app/shared';
import styles from './CategoryNews.module.css';
import { useState, useEffect } from 'react';
import { useNewsByRubric } from '@/app/hooks/useNewsByRubric';
import { getImageUrlFromApi, getMainImageFromApi, hasApiImages, type ApiNewsImage } from '@/app/lib/imageUtils';

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

  // Використовуємо хук для отримання реальних даних
  const {
    data: apiData,
    loading: apiLoading,
    error: apiError
  } = useNewsByRubric({
    rubric: categoryId?.toString() || '',
    page: config?.apiParams?.page || 1,
    limit: config?.apiParams?.limit || limit,
    lang: config?.apiParams?.lang || '1',
    approved: config?.apiParams?.approved !== undefined ? config.apiParams.approved : true,
    type: config?.apiParams?.type,
    autoFetch: useRealData && !!categoryId
  });

  // Логування даних з хука
  useEffect(() => {
    if (useRealData && categoryId) {
      console.log('=== CategoryNews Debug ===');
      console.log('Category ID:', categoryId);
      console.log('Category Name:', category);
      console.log('useRealData:', useRealData);
      console.log('API Loading:', apiLoading);
      console.log('API Error:', apiError);
      console.log('API Data:', apiData);
      console.log('API Params from config:', config?.apiParams);
      
      if (apiData?.news) {
        console.log('News count:', apiData.news.length);
        console.log('First news item:', apiData.news[0]);
        console.log('Pagination:', apiData.pagination);
        console.log('Filters:', apiData.filters);
        
        // Детальне логування структури першої новини
        if (apiData.news.length > 0) {
          const firstNews = apiData.news[0];
          console.log('First news detailed structure:', {
            id: firstNews.id,
            ndate: firstNews.ndate,
            ntime: firstNews.ntime,
            ntype: firstNews.ntype,
            nheader: firstNews.nheader,
            urlkey: firstNews.urlkey,
            rubric: firstNews.rubric,
            images: firstNews.images
          });
        }
      }
      console.log('========================');
    }
  }, [apiData, apiLoading, apiError, categoryId, category, useRealData, config]);

  const shouldShowHorizontal = isMobileResize && mobileLayout === 'horizontal';

  // Визначаємо, які дані використовувати
  let displayNews: CategoryNewsItem[] = [];
  let displayLoading = isLoading;

  if (useRealData && apiData?.news) {
    // Використовуємо реальні дані з API
    displayNews = apiData.news.map(item => {
      // Отримуємо основне зображення з нової структури
      const mainImage = getMainImageFromApi(item.images as ApiNewsImage[]);
      const imageUrl = getImageUrlFromApi(mainImage, 'intxt') || 'https://picsum.photos/300/200?random=1';
      
      return {
        id: item.id.toString(),
        title: item.nheader,
        date: new Date(item.ndate).toLocaleDateString('uk-UA', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        time: item.ntime,
        url: `/article/${item.urlkey}`,
        imageUrl: imageUrl,
        imageAlt: item.nheader,
        isImportant: item.ntype === 1 // ntype === 1 означає важливу новину
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
            <h2 className={styles.title}>{category}</h2>
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
                    {item.isImportant && (
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
            <ViewAllButton href={`/category/${category.toLowerCase()}`} />
            
            {/* Розділювальна лінія */}
            
          </>
        )}
        <div className={styles.separator}></div>
      </div>
    </section>
  );
}