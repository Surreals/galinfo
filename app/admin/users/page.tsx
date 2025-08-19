'use client';

import AdminNavigation from '../components/AdminNavigation';
import styles from './users.module.css';

export default function UsersPage() {
  return (
    <div className={styles.usersPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Користувачі</h1>
          <p>Управління користувачами та правами доступу</p>
        </div>

        <div className={styles.content}>
          <p>Тут буде інтерфейс для управління користувачами та їх правами доступу.</p>
          <p>Функціональність знаходиться в розробці.</p>
        </div>
      </div>
    </div>
  );
}
