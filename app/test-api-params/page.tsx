'use client';

import { CategoryNews } from '@/app/components';
import { CATEGORY_IDS } from '@/app/lib/categoryUtils';
import styles from './page.module.css';

export default function TestApiParams() {
  return (
    <div className={styles.container}>
      <h1>Тестування параметрів API для CategoryNews</h1>
      
      <section className={styles.testSection}>
        <h2>Європа - стандартні параметри</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.EVROPA}
          category="ЄВРОПА"
          useRealData={true}
          config={{
            apiParams: {
              page: 1,
              limit: 8,
              lang: '1',
              approved: true
            }
          }}
        />
      </section>

      <section className={styles.testSection}>
        <h2>Культура - збільшений ліміт</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.CULTURE}
          category="КУЛЬТУРА"
          useRealData={true}
          config={{
            apiParams: {
              page: 1,
              limit: 10,
              lang: '1',
              approved: true
            }
          }}
        />
      </section>

      <section className={styles.testSection}>
        <h2>Спорт - друга сторінка</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.SPORT}
          category="СПОРТ"
          useRealData={true}
          config={{
            apiParams: {
              page: 2,
              limit: 6,
              lang: '1',
              approved: true
            }
          }}
        />
      </section>

      <section className={styles.testSection}>
        <h2>Політика - тільки схвалені новини</h2>
        <CategoryNews 
          categoryId={CATEGORY_IDS.POLITICS}
          category="ПОЛІТИКА"
          useRealData={true}
          config={{
            apiParams: {
              page: 1,
              limit: 4,
              lang: '1',
              approved: true
            }
          }}
        />
      </section>

      <section className={styles.testSection}>
        <h2>Порівняння різних параметрів</h2>
        <div className={styles.comparison}>
          <div className={styles.comparisonItem}>
            <h3>Ліміт 4</h3>
            <CategoryNews 
              categoryId={CATEGORY_IDS.EVROPA}
              category="ЄВРОПА"
              useRealData={true}
              config={{
                apiParams: {
                  page: 1,
                  limit: 4,
                  lang: '1',
                  approved: true
                }
              }}
            />
          </div>
          <div className={styles.comparisonItem}>
            <h3>Ліміт 8</h3>
            <CategoryNews 
              categoryId={CATEGORY_IDS.EVROPA}
              category="ЄВРОПА"
              useRealData={true}
              config={{
                apiParams: {
                  page: 1,
                  limit: 8,
                  lang: '1',
                  approved: true
                }
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
