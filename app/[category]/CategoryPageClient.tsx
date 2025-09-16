'use client';

import React from 'react';
import { CategoryRenderer } from "@/app/components";
import { isValidCategoryUrl } from '@/app/lib/categoryMapper';
import styles from "./page.module.css";

interface CategoryPageClientProps {
  category: string;
}

export const CategoryPageClient: React.FC<CategoryPageClientProps> = ({ 
  category
}) => {
  // Перевіряємо, чи є валідна категорія
  if (!isValidCategoryUrl(category)) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <h1>Категорія "{category}" не знайдена</h1>
          <p>Будь ласка, перевірте правильність URL.</p>
        </div>
      </div>
    );
  }

  return <CategoryRenderer category={category} />;
};
