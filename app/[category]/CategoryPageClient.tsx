'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { CategoryRenderer } from "@/app/components";
import { isValidCategoryUrl } from '@/app/lib/categoryMapper';
import { useTemplateSchemas } from '@/app/hooks/useTemplateSchemas';
import { useMenuContext } from '@/app/contexts/MenuContext';
import { isValidCategoryInMenuData } from '@/app/lib/categoryUtils';
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

  // Перевіряємо, чи є валідна категорія (спочатку статично, потім динамічно)
  const isValidCategoryStatic = isValidCategoryUrl(category);
  const isValidCategoryDynamic = menuData ? isValidCategoryInMenuData(category, menuData) : false;
  const isValidCategory = isValidCategoryStatic || isValidCategoryDynamic;
  const isTag = !isValidCategory;

  // Завантажуємо дані тегу, якщо це тег
  useEffect(() => {
    if (isTag) {
      const fetchTagData = async () => {
        try {
          setLoading(true);
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
  }, [isTag, category]);

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
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <h1>Тег "{category}" не знайдено</h1>
          <p>Схоже, що цей тег не існує або був видалений.</p>
        </div>
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
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <h1>Категорія "{category}" не знайдена</h1>
          <p>Будь ласка, перевірте правильність URL.</p>
        </div>
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
