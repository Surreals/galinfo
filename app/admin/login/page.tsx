'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/contexts/AdminAuthContext';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && !authLoading) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Будь ласка, заповніть всі поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      
      if (success) {
        router.push('/admin');
      } else {
        setError('Невірний email або пароль');
      }
    } catch (err) {
      setError('Помилка входу. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Завантаження...</p>
      </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>
            <span className={styles.logoText}>G</span>
          </div>
          <h1>Вхід в адмін-панель</h1>
          <p>Введіть ваші облікові дані для доступу</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email або логін</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введіть ваш email"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введіть ваш пароль"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>GalInfo Admin Panel</p>
          <small>Система управління контентом</small>
        </div>
      </div>
    </div>
  );
}
