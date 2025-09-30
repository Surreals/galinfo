'use client';

import React, { useState, useEffect } from 'react';
import { CategoryRenderer } from "@/app/components";
import { isValidCategoryUrl } from '@/app/lib/categoryMapper';
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

  // Перевіряємо, чи є валідна категорія
  const isValidCategory = isValidCategoryUrl(category);
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

  // Якщо це тег і завантажуємо дані
  if (isTag && loading) {
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

  // Якщо це тег і дані завантажені, використовуємо CategoryRenderer з назвою тегу
  if (isTag && tagData) {
    return <CategoryRenderer category={tagData.tag} />;
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
  return <CategoryRenderer category={category} />;
};
