'use client';

import AdminNavigation from '../components/AdminNavigation';
import styles from './news.module.css';

export default function NewsPage() {
  return (
    <div className={styles.newsPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Новини / Статті</h1>
          <p>Управління новинами та статтями</p>
        </div>

        <div className={styles.content}>
          <p>Тут буде інтерфейс для управління новинами та статтями.</p>
          <p>Функціональність знаходиться в розробці.</p>
        </div>
      </div>
    </div>
  );
}
