'use client';

import AdminNavigation from '../../components/AdminNavigation';
import styles from './templates.module.css';

export default function TemplatesPage() {
  return (
    <div className={styles.templatesPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Шаблони</h1>
          <p>Управління шаблонами сторінок</p>
        </div>

        <div className={styles.content}>
          <p>Тут буде інтерфейс для управління шаблонами сторінок та макетами.</p>
          <p>Функціональність знаходиться в розробці.</p>
        </div>
      </div>
    </div>
  );
}
