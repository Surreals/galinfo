'use client';

import AdminNavigation from '../components/AdminNavigation';
import styles from './languages.module.css';

export default function LanguagesPage() {
  return (
    <div className={styles.languagesPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Мови</h1>
          <p>Управління мовними налаштуваннями</p>
        </div>

        <div className={styles.content}>
          <p>Тут буде інтерфейс для управління мовними налаштуваннями сайту.</p>
          <p>Функціональність знаходиться в розробці.</p>
        </div>
      </div>
    </div>
  );
}
