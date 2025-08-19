'use client';

import AdminNavigation from '../components/AdminNavigation';
import styles from './advertising.module.css';

export default function AdvertisingPage() {
  return (
    <div className={styles.advertisingPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Реклама</h1>
          <p>Управління рекламними матеріалами</p>
        </div>

        <div className={styles.content}>
          <p>Тут буде інтерфейс для управління рекламними матеріалами та банерами.</p>
          <p>Функціональність знаходиться в розробці.</p>
        </div>
      </div>
    </div>
  );
}
