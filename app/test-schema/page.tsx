'use client';

import { HomePageRenderer } from '@/app/components';
import { desktopSchema, mobileSchema } from '@/app/lib/schema';
import styles from './page.module.css';

export default function TestSchema() {
  return (
    <div className={styles.container}>
      <h1>Тестування схеми головної сторінки</h1>
      
      <section className={styles.testSection}>
        <h2>Десктопна схема</h2>
        <HomePageRenderer schema={desktopSchema} />
      </section>

      <section className={styles.testSection}>
        <h2>Мобільна схема</h2>
        <HomePageRenderer schema={mobileSchema} />
      </section>

      <section className={styles.testSection}>
        <h2>Автоматичне визначення (залежно від розміру екрану)</h2>
        <HomePageRenderer />
      </section>
    </div>
  );
}
