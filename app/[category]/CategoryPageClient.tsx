'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { CategoryRenderer } from "@/app/components";
import { isValidCategoryUrl } from '@/app/lib/categoryMapper';
import { useTemplateSchemas } from '@/app/hooks/useTemplateSchemas';
import { useMenuContext } from '@/app/contexts/MenuContext';
import { getCategoryType } from '@/app/lib/categoryUtils';
import { Spin } from 'antd';
import styles from "./page.module.css";

interface CategoryPageClientProps {
  category: string;
  newsData1?: any[];
  newsData2?: any[];
  newsData3?: any[];
}

export const CategoryPageClient: React.FC<CategoryPageClientProps> = ({ 
  category
}) => {
  const [tagData, setTagData] = useState<{ id: number; tag: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSchema } = useTemplateSchemas();
  const { menuData, loading: menuLoading } = useMenuContext();

  // ВАЖЛИВО: Спочатку чекаємо завантаження menuData, щоб коректно визначити тип категорії
  // Якщо menuData ще завантажується, не робимо жодних висновків про тип категорії
  
  // Визначаємо тип категорії динамічно через menuData (тільки якщо menuData завантажилося)
  // categoryType може бути:
  // - 'main' - основна категорія (Політика, Економіка, тощо)
  // - 'region' - регіональна категорія (Львів, Тернопіль, Україна, тощо)
  // - 'special' - спеціальна тема (Відверта розмова, Пресслужба, тощо)
  // - null - не знайдено в menuData (може бути тег або невалідна категорія)
  const categoryType = !menuLoading ? getCategoryType(category, menuData) : undefined;
  
  // Перевіряємо чи це статична категорія (із старого маппера)
  const isStaticCategory = isValidCategoryUrl(category);
  
  // Визначаємо чи це тег ТІЛЬКИ після завантаження menuData
  // Якщо menuData ще завантажується (categoryType === undefined), не вважаємо це тегом
  const isTag = categoryType !== undefined && categoryType === null && !isStaticCategory;
  
  // Валідна категорія - це категорія з menuData або статична
  const isValidCategory = categoryType !== undefined && (categoryType !== null || isStaticCategory);

  // DEBUG
  console.log(`[CategoryPageClient] Category: ${category}`, {
    menuLoading,
    categoryType,
    isStaticCategory,
    isTag,
    isValidCategory
  });

  // Завантажуємо дані тегу, тільки якщо:
  // 1. menuData завантажилося (!menuLoading)
  // 2. це точно тег (isTag === true)
  // 3. дані тегу ще не завантажені
  useEffect(() => {
    // Чекаємо завантаження menuData перед визначенням тегу
    if (menuLoading) {
      return;
    }
    
    // Тепер можна перевірити чи це тег
    if (isTag && !tagData && !loading) {
      const fetchTagData = async () => {
        try {
          setLoading(true);
          console.log(`[CategoryPageClient] Fetching tag data for: ${category}`);
          const response = await fetch(`/api/tags/by-name/${encodeURIComponent(category)}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          setTagData(data.tag);
        } catch (err) {
          console.error('Error fetching tag data:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch tag data');
        } finally {
          setLoading(false);
        }
      };

      fetchTagData();
    }
  }, [isTag, category, menuLoading, tagData, loading]);

  // Якщо завантажуємо дані меню або тегу
  if (menuLoading || (isTag && loading)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Якщо це тег і є помилка або тег не знайдено
  if (isTag && (error || !tagData)) {
    return (
      <div className={styles.errorContainer}>
        <svg 
          className={styles.errorIcon}
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="#c7084f" strokeWidth="2"/>
          <path d="M12 8V12" stroke="#c7084f" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1" fill="#c7084f"/>
        </svg>
        <h1 className={styles.errorTitle}>Тег "{category}" не знайдено</h1>
        <p className={styles.errorDescription}>
          Схоже, що цей тег не існує або був видалений. 
          Спробуйте повернутися на головну сторінку або використати пошук.
        </p>
        <a href="/" className={styles.errorButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Повернутися на головну
        </a>
      </div>
    );
  }

  // Отримуємо схему категорій з API (якщо є)
  const apiCategoryDesktopSchema = getSchema('category-desktop');
  const apiCategoryMobileSchema = getSchema('category-mobile');

  // Якщо це тег і дані завантажені, використовуємо CategoryRenderer з назвою тегу
  if (isTag && tagData) {
    return (
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}>
          <Spin size="large" />
        </div>
      }>
        <CategoryRenderer 
          category={tagData.tag} 
          apiDesktopSchema={apiCategoryDesktopSchema}
          apiMobileSchema={apiCategoryMobileSchema}
        />
      </Suspense>
    );
  }

  // Якщо це не валідна категорія і не тег
  if (!isValidCategory && !isTag) {
    return (
      <div className={styles.errorContainer}>
        <svg 
          className={styles.errorIcon}
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="#c7084f" strokeWidth="2"/>
          <path d="M12 8V12" stroke="#c7084f" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1" fill="#c7084f"/>
        </svg>
        <h1 className={styles.errorTitle}>Категорія "{category}" не знайдена</h1>
        <p className={styles.errorDescription}>
          Будь ласка, перевірте правильність URL або поверніться на головну сторінку.
        </p>
        <a href="/" className={styles.errorButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Повернутися на головну
        </a>
      </div>
    );
  }

  // Для валідних категорій
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    }>
      <CategoryRenderer 
        category={category} 
        apiDesktopSchema={apiCategoryDesktopSchema}
        apiMobileSchema={apiCategoryMobileSchema}
      />
    </Suspense>
  );
};
