'use client';

import { useState, useEffect } from 'react';
import AdminNavigation from '../components/AdminNavigation';
import styles from './test-db.module.css';

export default function AdminTestDBPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [customResult, setCustomResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  // Load connection info on component mount
  useEffect(() => {
    const loadConnectionInfo = async () => {
      try {
        const response = await fetch('/api/test-db/connection-info');
        if (response.ok) {
          const data = await response.json();
          setConnectionInfo(data);
        }
      } catch (error) {
        console.error('Failed to load connection info:', error);
      }
    };
    
    loadConnectionInfo();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus('✅ Connected');
        setTestResult(data);
      } else {
        setConnectionStatus('❌ Failed');
        setTestResult(data);
      }
    } catch (error) {
      setConnectionStatus('❌ Error');
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: customQuery }),
      });
      
      const data = await response.json();
      setCustomResult(data);
    } catch (error) {
      setCustomResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.testDbPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Тест бази даних</h1>
          <p>Перевірка з'єднання з базою даних та виконання SQL запитів</p>
        </div>
        
        {/* Connection Info Section */}
        {connectionInfo && (
          <div className={styles.infoSection}>
            <h2>Конфігурація з'єднання</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Хост:</span> {connectionInfo.host}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Порт:</span> {connectionInfo.port}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>База даних:</span> {connectionInfo.database}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Користувач:</span> {connectionInfo.user}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Середовище:</span> {connectionInfo.environment}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>SSL:</span> {connectionInfo.ssl ? 'Увімкнено' : 'Вимкнено'}
              </div>
            </div>
          </div>
        )}
        
        {/* Connection Test Section */}
        <div className={styles.testSection}>
          <h2>Тест з'єднання з базою даних</h2>
          <button
            onClick={testConnection}
            disabled={loading}
            className={styles.testButton}
          >
            {loading ? 'Тестування...' : 'Тестувати з\'єднання'}
          </button>
          
          {connectionStatus && (
            <div className={styles.statusSection}>
              <p className={styles.statusText}>Статус: {connectionStatus}</p>
            </div>
          )}
          
          {testResult && (
            <div className={styles.resultSection}>
              <h3>Результат тесту:</h3>
              <pre className={styles.resultCode}>
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Custom Query Section */}
        <div className={styles.querySection}>
          <h2>Виконати власний запит</h2>
          <div className={styles.queryInput}>
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Введіть ваш SQL запит тут (наприклад: SELECT 1 as test, NOW() as current_time)"
              className={styles.queryTextarea}
            />
          </div>
          <button
            onClick={executeCustomQuery}
            disabled={loading || !customQuery.trim()}
            className={styles.executeButton}
          >
            {loading ? 'Виконання...' : 'Виконати запит'}
          </button>
          
          {customResult && (
            <div className={styles.resultSection}>
              <h3>Результат запиту:</h3>
              <pre className={styles.resultCode}>
                {JSON.stringify(customResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className={styles.instructionsSection}>
          <h3>Інструкції з налаштування:</h3>
          <ol className={styles.instructionsList}>
            <li>Ваш файл <code>.env.local</code> налаштований для з'єднання з {process.env.NODE_ENV === 'development' ? 'вашим віддаленим сервером MariaDB' : 'localhost'}</li>
            <li>SSL зараз вимкнено для уникнення проблем з'єднання</li>
            <li>Натисніть "Тестувати з'єднання" для перевірки налаштувань</li>
            <li>Використовуйте розділ власних запитів для тестування конкретних SQL команд</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
