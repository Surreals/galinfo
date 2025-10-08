'use client';

import { useState } from 'react';
import styles from './login.module.css';

interface TwoFactorPageProps {
  userId: number;
  login: string;
  password: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function TwoFactorPage({ userId, login, password, onSuccess, onBack }: TwoFactorPageProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      setError('Будь ласка, введіть 6-значний код');
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
        body: JSON.stringify({
          login,
          password,
          twoFactorCode: code
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and token
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        localStorage.setItem('adminToken', data.token);
        
        onSuccess();
      } else {
        setError(data.error || 'Невірний код автентифікації');
      }
    } catch (err) {
      setError('Помилка підключення. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCode = () => {
    const backupCode = prompt('Введіть резервний код (8 символів):');
    if (backupCode) {
      setCode(backupCode.toUpperCase());
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>
            <span className={styles.logoText}>G</span>
          </div>
          <h1>Двофакторна автентифікація</h1>
          <p>Введіть 6-значний код з вашого додатку Google Authenticator</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="code">Код автентифікації</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
              placeholder="000000"
              style={{
                fontSize: '20px',
                letterSpacing: '0.5em',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}
              disabled={isLoading}
              maxLength={6}
              autoFocus
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Перевірка...' : 'Підтвердити'}
          </button>

          <div className={styles.twoFactorActions}>
            <button
              type="button"
              onClick={handleBackupCode}
              className={styles.linkButton}
            >
              Використати резервний код
            </button>
            <button
              type="button"
              onClick={onBack}
              className={styles.linkButton}
            >
              Назад до входу
            </button>
          </div>
        </form>

        <div className={styles.loginFooter}>
          <p>GalInfo Admin Panel</p>
          <small>Система управління контентом</small>
        </div>
      </div>
    </div>
  );
}

