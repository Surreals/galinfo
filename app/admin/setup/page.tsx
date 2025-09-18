'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './setup.module.css';

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const router = useRouter();

  const checkAdminExists = async () => {
    try {
      const response = await fetch('/api/admin/init');
      const data = await response.json();
      setAdminExists(data.adminExists);
      if (data.adminExists) {
        setMessage('Admin користувач вже існує. Ви можете увійти в систему.');
      }
    } catch (err) {
      setError('Помилка перевірки адміністратора');
    }
  };

  const createAdmin = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`
          Адміністратор створений успішно!
          
          Облікові дані:
          Логін: ${data.credentials.login}
          Пароль: ${data.credentials.password}
          
          ⚠️ Обов'язково змініть пароль після першого входу!
        `);
        setAdminExists(true);
      } else {
        setError(data.message || 'Помилка створення адміністратора');
      }
    } catch (err) {
      setError('Помилка створення адміністратора');
    } finally {
      setIsLoading(false);
    }
  };

  // Check admin status on component mount
  React.useEffect(() => {
    checkAdminExists();
  }, []);

  return (
    <div className={styles.setupPage}>
      <div className={styles.setupContainer}>
        <div className={styles.setupHeader}>
          <div className={styles.logo}>
            <span className={styles.logoText}>G</span>
          </div>
          <h1>Налаштування адміністратора</h1>
          <p>Створення облікового запису адміністратора для GalInfo</p>
        </div>

        <div className={styles.setupContent}>
          {adminExists === null && (
            <div className={styles.loadingMessage}>
              Перевірка стану адміністратора...
            </div>
          )}

          {adminExists === true && (
            <div className={styles.successSection}>
              <div className={styles.successIcon}>✅</div>
              <h2>Адміністратор вже налаштований</h2>
              <p>Обліковий запис адміністратора вже існує в системі.</p>
              <button
                onClick={() => router.push('/admin/login')}
                className={styles.loginButton}
              >
                Перейти до входу
              </button>
            </div>
          )}

          {adminExists === false && (
            <div className={styles.setupSection}>
              <div className={styles.infoBox}>
                <h2>Створення адміністратора</h2>
                <p>
                  Цей інструмент створить обліковий запис адміністратора за замовчуванням
                  з наступними обліковими даними:
                </p>
                <div className={styles.credentialsPreview}>
                  <strong>Логін:</strong> admin<br />
                  <strong>Пароль:</strong> admin
                </div>
                <p className={styles.warning}>
                  ⚠️ <strong>Важливо:</strong> Обов'язково змініть пароль після першого входу в систему!<br />
                  💡 Тепер система приймає будь-який тип логіна (не тільки email формат).
                </p>
              </div>

              <button
                onClick={createAdmin}
                disabled={isLoading}
                className={styles.createButton}
              >
                {isLoading ? 'Створення...' : 'Створити адміністратора'}
              </button>
            </div>
          )}

          {message && (
            <div className={styles.messageBox}>
              <pre>{message}</pre>
              {adminExists && (
                <button
                  onClick={() => router.push('/admin/login')}
                  className={styles.loginButton}
                >
                  Перейти до входу
                </button>
              )}
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}
        </div>

        <div className={styles.setupFooter}>
          <div className={styles.helpSection}>
            <h3>Альтернативні способи налаштування:</h3>
            <div className={styles.helpMethods}>
              <div className={styles.method}>
                <strong>Через командний рядок:</strong>
                <code>npm run setup:admin</code>
              </div>
              <div className={styles.method}>
                <strong>Через Node.js скрипт:</strong>
                <code>node scripts/setup-admin.js</code>
              </div>
            </div>
          </div>
          
          <div className={styles.footerInfo}>
            <p>GalInfo Admin Setup</p>
            <small>Система ініціалізації адміністратора</small>
          </div>
        </div>
      </div>
    </div>
  );
}
