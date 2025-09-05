'use client';

import { CategoryNews } from '@/app/components';
import { CATEGORY_IDS } from '@/app/lib/categoryUtils';
import styles from './page.module.css';

export default function TestCategoryNewsAPI() {
  return (
    <div className={styles.container}>
      <h1>Тестування CategoryNews з реальними даними API</h1>
      
      <section className={styles.testSection}>
        <h2>Європа - реальні дані з API</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.EVROPA}
          category="ЄВРОПА"
          useRealData={true}
          limit={6}
          mobileLayout="horizontal"
        />
      </section>

      <section className={styles.testSection}>
        <h2>Культура - реальні дані з API</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.CULTURE}
          category="КУЛЬТУРА"
          useRealData={true}
          limit={8}
          mobileLayout="column"
        />
      </section>

      <section className={styles.testSection}>
        <h2>Спорт - реальні дані з API</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.SPORT}
          category="СПОРТ"
          useRealData={true}
          limit={4}
          mobileLayout="horizontal"
        />
      </section>

      <section className={styles.testSection}>
        <h2>Політика - реальні дані з API</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.POLITICS}
          category="ПОЛІТИКА"
          useRealData={true}
          limit={6}
          mobileLayout="horizontal"
        />
      </section>

      <section className={styles.testSection}>
        <h2>Економіка - реальні дані з API</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.ECONOMICS}
          category="ЕКОНОМІКА"
          useRealData={true}
          limit={6}
          mobileLayout="column"
        />
      </section>

      <section className={styles.testSection}>
        <h2>Сусільство - реальні дані з API</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.SOCIETY}
          category="СУСПІЛЬСТВО"
          useRealData={true}
          limit={8}
          mobileLayout="horizontal"
        />
      </section>

      <section className={styles.testSection}>
        <h2>Порівняння: Мокові дані vs Реальні дані</h2>
        <div className={styles.comparison}>
          <div className={styles.comparisonItem}>
            <h3>Мокові дані</h3>
            <CategoryNews 
              category="ТЕСТОВА КАТЕГОРІЯ"
              useRealData={false}
              limit={4}
              mobileLayout="horizontal"
            />
          </div>
          <div className={styles.comparisonItem}>
            <h3>Реальні дані (Європа)</h3>
            <CategoryNews 
              categoryId={CATEGORY_IDS.EVROPA}
              category="ЄВРОПА"
              useRealData={true}
              limit={4}
              mobileLayout="horizontal"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
