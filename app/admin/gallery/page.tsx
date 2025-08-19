'use client';

import AdminNavigation from '../components/AdminNavigation';
import styles from './gallery.module.css';

export default function GalleryPage() {
  return (
    <div className={styles.galleryPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Галерея</h1>
          <p>Управління зображеннями та медіа</p>
        </div>

        <div className={styles.content}>
          <p>Тут буде інтерфейс для управління галереєю зображень та медіа файлами.</p>
          <p>Функціональність знаходиться в розробці.</p>
        </div>
      </div>
    </div>
  );
}
