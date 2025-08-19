'use client';

import { useState } from 'react';
import AdminNavigation from '../components/AdminNavigation';
import styles from './test-homepage-api.module.css';

export default function AdminTestHomePageAPI() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/homepage');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error testing API:', err);
      setError(err instanceof Error ? err.message : 'Failed to test API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.testHomePageApiPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Тест API головної сторінки</h1>
          <p>Тестування API endpoint для отримання даних головної сторінки</p>
        </div>
        
        <button 
          onClick={testAPI}
          disabled={loading}
          className={styles.testButton}
        >
          {loading ? 'Тестування...' : 'Тестувати API Endpoint'}
        </button>

        {error && (
          <div className={styles.errorSection}>
            <strong>Помилка:</strong> {error}
          </div>
        )}

        {data && (
          <div className={styles.dataSection}>
            <h2>Дані відповіді API</h2>
            
            <div className={styles.summarySection}>
              <h3>Підсумок</h3>
              <ul className={styles.summaryList}>
                <li><strong>Кількість новин:</strong> {data.newsCount}</li>
                <li><strong>Категорії:</strong> {data.categories?.length || 0}</li>
                <li><strong>Основні новини:</strong> {data.mainNews?.length || 0}</li>
                <li><strong>Спеціальні новини:</strong> {data.specialNews?.length || 0}</li>
                <li><strong>Слайд новини:</strong> {data.slideNews?.length || 0}</li>
                <li><strong>Заголовкові новини:</strong> {data.headlineNews?.length || 0}</li>
                <li><strong>Популярні новини:</strong> {data.popularNews?.length || 0}</li>
                <li><strong>Запропоновані новини:</strong> {data.suggestedNews?.length || 0}</li>
                <li><strong>Мови:</strong> {data.languages?.length || 0}</li>
                <li><strong>Дані середовища:</strong> {data.enviro?.length || 0}</li>
              </ul>
            </div>

            <div className={styles.categoriesSection}>
              <h3>Категорії</h3>
              {data.categories && data.categories.length > 0 ? (
                <div className={styles.categoriesGrid}>
                  {data.categories.map((category: any) => (
                    <div key={category.id} className={styles.categoryCard}>
                      <h4>{category.title}</h4>
                      <p>Тип: {category.cattype === '1' ? 'Рубрика' : 'Регіон'}</p>
                      <p>Параметр: {category.param}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Категорії не знайдено</p>
              )}
            </div>

            <div className={styles.newsSection}>
              <h3>Приклади новин</h3>
              {data.mainNews && data.mainNews.length > 0 ? (
                <div className={styles.newsGrid}>
                  {data.mainNews.slice(0, 6).map((news: any) => (
                    <div key={news.id} className={styles.newsCard}>
                      <h4>{news.nheader}</h4>
                      {news.nsubheader && <p><em>{news.nsubheader}</em></p>}
                      <p>Дата: {new Date(news.ndate * 1000).toLocaleDateString()}</p>
                      {news.comments && <p>Коментарі: {news.comments}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>Основні новини не знайдено</p>
              )}
            </div>

            <div className={styles.rawDataSection}>
              <h3>Сирі дані (Перші 1000 символів)</h3>
              <pre className={styles.rawDataCode}>
                {JSON.stringify(data, null, 2).substring(0, 1000)}...
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
