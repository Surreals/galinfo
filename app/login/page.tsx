'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/contexts/AdminAuthContext';
import TwoFactorPage from './TwoFactorPage';
import styles from './login.module.css';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && !authLoading) {
      router.push('/admin');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!login || !password) {
      setError('Будь ласка, заповніть всі поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        setUserId(data.userId);
        setShowTwoFactor(true);
        return;
      }

      if (data.success) {
        // Store user data and token
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        localStorage.setItem('adminToken', data.token);
        
        // Reload to update context
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Невірний логін або пароль');
      }
    } catch (err) {
      setError('Помилка входу. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSuccess = () => {
    window.location.href = '/admin';
  };

  const handleBackFromTwoFactor = () => {
    setShowTwoFactor(false);
    setUserId(null);
    setPassword('');
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Завантаження...</p>
      </div>
    );
  }

  // Show 2FA page if required
  if (showTwoFactor && userId) {
    return (
      <TwoFactorPage
        userId={userId}
        login={login}
        password={password}
        onSuccess={handleTwoFactorSuccess}
        onBack={handleBackFromTwoFactor}
      />
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
            <label htmlFor="login">Логін</label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введіть ваш логін"
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
