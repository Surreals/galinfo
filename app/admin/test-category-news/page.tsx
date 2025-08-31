'use client';

import { useState, useEffect } from 'react';
import AdminNavigation from '../components/AdminNavigation';
import { NewsListByRubric } from '@/app/components';
import ProtectedAdminRoute from '@/app/components/ProtectedAdminRoute';
import styles from './test-category-news.module.css';

interface Category {
  id: string;
  title: string;
  description: string;
}

export default function AdminTestCategoryNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(true);
  const [showPagination, setShowPagination] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Available categories for testing
  const categories: Category[] = [
    { id: '1', title: 'Головні новини', description: 'Основні новини сайту' },
    { id: '2', title: 'Політика', description: 'Політичні новини та події' },
    { id: '3', title: 'Економіка', description: 'Економічні новини та аналітика' },
    { id: '4', title: 'Суспільство', description: 'Соціальні новини та події' },
    { id: '5', title: 'Культура', description: 'Культурні новини та заходи' },
    { id: '6', title: 'Спорт', description: 'Спортивні новини та результати' },
    { id: '7', title: 'Технології', description: 'Технічні новини та інновації' },
    { id: '8', title: 'Медицина', description: 'Медичні новини та здоров\'я' },
    { id: 'all', title: 'Всі рубрики', description: 'Новини з усіх рубрик' }
  ];

  // Test API endpoint directly
  const testCategoryNewsAPI = async () => {
    setIsTesting(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        lang: '1',
        approved: 'true'
      });

      const response = await fetch(`/api/news/${selectedCategory}?${params}`);
      const data = await response.json();
      
      setTestResults({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
        url: `/api/news/${selectedCategory}?${params}`
      });
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        url: `/api/news/${selectedCategory}?page=${currentPage}&limit=${itemsPerPage}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <ProtectedAdminRoute>
      <div className={styles.testCategoryNewsPage}>
        <AdminNavigation />
        
        <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Тест новин по категорії з пагінацією</h1>
          <p>Тестування API для отримання новин по categoryId з підтримкою пагінації та фільтрації</p>
        </div>

        {/* Controls Section */}
        <div className={styles.controlsSection}>
          <h3>Налаштування тестування</h3>
          
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label htmlFor="category-select">Категорія:</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.controlSelect}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
              <small className={styles.controlDescription}>
                {categories.find(c => c.id === selectedCategory)?.description}
              </small>
            </div>

            <div className={styles.controlGroup}>
              <label htmlFor="page-input">Сторінка:</label>
              <input
                id="page-input"
                type="number"
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.max(1, parseInt(e.target.value) || 1))}
                className={styles.controlInput}
                min="1"
              />
            </div>

            <div className={styles.controlGroup}>
              <label htmlFor="limit-select">Новин на сторінці:</label>
              <select
                id="limit-select"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                className={styles.controlSelect}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>


          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="show-filters">Показувати фільтри:</label>
            <input
              id="show-filters"
              type="checkbox"
              checked={showFilters}
              onChange={(e) => setShowFilters(e.target.checked)}
              className={styles.controlCheckbox}
            />
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="show-pagination">Показувати пагінацію:</label>
            <input
              id="show-pagination"
              type="checkbox"
              checked={showPagination}
              onChange={(e) => setShowPagination(e.target.checked)}
              className={styles.controlCheckbox}
            />
          </div>

          <div className={styles.testButtonContainer}>
            <button
              onClick={testCategoryNewsAPI}
              disabled={isTesting}
              className={styles.testButton}
            >
              {isTesting ? 'Тестування...' : 'Тестувати API'}
            </button>
          </div>
        </div>

        {/* API Test Results */}
        {testResults && (
          <div className={styles.testResultsSection}>
            <h3>Результати тестування API</h3>
            <div className={`${styles.resultCard} ${testResults.success ? styles.success : styles.error}`}>
              <div className={styles.resultHeader}>
                <span className={styles.resultStatus}>
                  {testResults.success ? '✅ Успішно' : '❌ Помилка'}
                </span>
                <span className={styles.resultTimestamp}>
                  {new Date(testResults.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div className={styles.resultDetails}>
                <div className={styles.resultUrl}>
                  <strong>URL:</strong> <code>{testResults.url}</code>
                </div>
                
                {testResults.status && (
                  <div className={styles.resultStatus}>
                    <strong>HTTP Status:</strong> {testResults.status}
                  </div>
                )}
                
                {testResults.error && (
                  <div className={styles.resultError}>
                    <strong>Помилка:</strong> {testResults.error}
                  </div>
                )}
                
                {testResults.data && (
                  <div className={styles.resultData}>
                    <strong>Дані відповіді:</strong>
                    <pre className={styles.jsonData}>
                      {JSON.stringify(testResults.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* News List Component */}
        <div className={styles.newsListSection}>
          <h3>Компонент списку новин</h3>
          <div className={styles.newsListWrapper}>
            <NewsListByRubric 
              rubric={selectedCategory}
              initialPage={currentPage}
              initialLimit={itemsPerPage}
              showFilters={showFilters}
              showPagination={showPagination}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.instructionsSection}>
          <h3>Інструкції з використання</h3>
          <div className={styles.instructionsGrid}>
            <div className={styles.instructionCard}>
              <h4>🎯 Тестування API</h4>
              <ul>
                <li>Виберіть категорію для тестування</li>
                <li>Налаштуйте параметри пагінації</li>
                <li>Натисніть "Тестувати API" для прямого тестування</li>
                <li>Переглядайте результати та статус відповіді</li>
              </ul>
            </div>

            <div className={styles.instructionCard}>
              <h4>📰 Компонент новин</h4>
              <ul>
                <li>Автоматичне завантаження при зміні параметрів</li>
                <li>Фільтрація по типу новин та мові</li>
                <li>Навігація по сторінках</li>
                <li>Відображення статистики (перегляди, коментарі)</li>
              </ul>
            </div>

                         <div className={styles.instructionCard}>
               <h4>🔧 Налаштування</h4>
               <ul>
                 <li>Включення/виключення фільтрів</li>
                 <li>Налаштування пагінації</li>
                 <li>Гнучкість відображення компонентів</li>
                 <li>Тестування API endpoints</li>
               </ul>
             </div>

            <div className={styles.instructionCard}>
              <h4>📊 API Endpoints</h4>
              <ul>
                <li><code>/api/news/[categoryId]</code> - новини по категорії</li>
                <li>Підтримка параметрів: page, limit, type, lang, approved</li>
                <li>Автоматична пагінація та фільтрація</li>
                <li>Обробка помилок та валідація</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedAdminRoute>
  );
}
