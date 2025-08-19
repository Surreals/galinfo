'use client';

import AdminNavigation from '../../components/AdminNavigation';
import styles from './tree.module.css';

export default function TreePage() {
  return (
    <div className={styles.treePage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Дерево</h1>
          <p>Управління структурою сайту</p>
        </div>

        <div className={styles.content}>
          <p>Тут буде інтерфейс для управління структурою та навігацією сайту.</p>
          <p>Функціональність знаходиться в розробці.</p>
        </div>
      </div>
    </div>
  );
}
