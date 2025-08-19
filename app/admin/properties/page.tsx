'use client';

import AdminNavigation from '../components/AdminNavigation';
import styles from './properties.module.css';

export default function PropertiesPage() {
  return (
    <div className={styles.propertiesPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Властивості</h1>
          <p>Управління системними властивостями</p>
        </div>

        <div className={styles.content}>
          <p>Тут буде інтерфейс для управління системними властивостями та налаштуваннями.</p>
          <p>Функціональність знаходиться в розробці.</p>
        </div>
      </div>
    </div>
  );
}
