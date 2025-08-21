'use client';

import { useState } from 'react';
import AdminNavigation from '../components/AdminNavigation';
import { NewsListByRubric, NewsDetail } from '@/app/components';
import styles from './test-news.module.css';

export default function AdminTestNewsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>('list');
  const [selectedRubric, setSelectedRubric] = useState('1');
  const [articleParams, setArticleParams] = useState({
    type: 'news',
    urlkey: 'test-article',
    id: 1
  });

  const rubrics = [
    { id: '1', title: 'Головні новини' },
    { id: '2', title: 'Політика' },
    { id: '3', title: 'Економіка' },
    { id: '4', title: 'Суспільство' },
    { id: '5', title: 'Культура' },
    { id: 'all', title: 'Всі рубрики' }
  ];

  const articleTypes = [
    { value: 'news', label: 'Новини' },
    { value: 'articles', label: 'Статті' },
    { value: 'photo', label: 'Фоторепортажі' },
    { value: 'video', label: 'Відео' },
    { value: 'audio', label: 'Аудіо' },
    { value: 'announces', label: 'Анонси' },
    { value: 'blogs', label: 'Блоги' }
  ];

  return (
    <div className={styles.testNewsPage}>
      <AdminNavigation />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Тест системи новин</h1>
          <p>Демонстрація функціональності для роботи з новинами, категоріями та зображеннями</p>
        </div>

        {/* Навігація по вкладках */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'list' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Список новин по рубриці
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'detail' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            Детальна новина
          </button>
        </div>

        {/* Вкладка зі списком новин */}
        {activeTab === 'list' && (
          <div className={styles.tabContent}>
            <div className={styles.controls}>
              <div className={styles.controlGroup}>
                <label htmlFor="rubric-select">Рубрика:</label>
                <select
                  id="rubric-select"
                  value={selectedRubric}
                  onChange={(e) => setSelectedRubric(e.target.value)}
                  className={styles.controlSelect}
                >
                  {rubrics.map(rubric => (
                    <option key={rubric.id} value={rubric.id}>
                      {rubric.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.newsListWrapper}>
              <NewsListByRubric 
                rubric={selectedRubric}
                initialPage={1}
                initialLimit={10}
                showFilters={true}
                showPagination={true}
              />
            </div>
          </div>
        )}

        {/* Вкладка з детальною новиною */}
        {activeTab === 'detail' && (
          <div className={styles.tabContent}>
            <div className={styles.controls}>
              <div className={styles.controlGroup}>
                <label htmlFor="article-type">Тип новини:</label>
                <select
                  id="article-type"
                  value={articleParams.type}
                  onChange={(e) => setArticleParams(prev => ({ ...prev, type: e.target.value }))}
                  className={styles.controlSelect}
                >
                  {articleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.controlGroup}>
                <label htmlFor="article-urlkey">URL ключ:</label>
                <input
                  id="article-urlkey"
                  type="text"
                  value={articleParams.urlkey}
                  onChange={(e) => setArticleParams(prev => ({ ...prev, urlkey: e.target.value }))}
                  className={styles.controlInput}
                  placeholder="test-article"
                />
              </div>

              <div className={styles.controlGroup}>
                <label htmlFor="article-id">ID новини:</label>
                <input
                  id="article-id"
                  type="number"
                  value={articleParams.id}
                  onChange={(e) => setArticleParams(prev => ({ ...prev, id: parseInt(e.target.value) || 1 }))}
                  className={styles.controlInput}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            <div className={styles.newsDetailWrapper}>
              <NewsDetail
                articleType={articleParams.type}
                urlkey={articleParams.urlkey}
                id={articleParams.id}
                lang="1"
              />
            </div>
          </div>
        )}

        {/* Інструкції */}
        <div className={styles.instructionsSection}>
          <h3>Інструкції з використання:</h3>
          <div className={styles.instructionsGrid}>
            <div className={styles.instructionCard}>
              <h4>📰 Список новин по рубриці</h4>
              <ul>
                <li>Виберіть рубрику для відображення новин</li>
                <li>Використовуйте фільтри для сортування</li>
                <li>Навігація по сторінках</li>
                <li>Автоматичне завантаження зображень</li>
              </ul>
            </div>

            <div className={styles.instructionCard}>
              <h4>🔍 Детальна новина</h4>
              <ul>
                <li>Введіть параметри новини</li>
                <li>Перегляд повного контенту</li>
                <li>Галерея зображень з навігацією</li>
                <li>Пов'язані новини</li>
              </ul>
            </div>

            <div className={styles.instructionCard}>
              <h4>🖼️ Робота з зображеннями</h4>
              <ul>
                <li>Три розміри: full, intxt, tmb</li>
                <li>Мініатюри з навігацією</li>
                <li>Модальне вікно для перегляду</li>
                <li>Автоматичне оновлення статистики</li>
              </ul>
            </div>

            <div className={styles.instructionCard}>
              <h4>⚡ API функції</h4>
              <ul>
                <li><code>/api/news/[rubric]</code> - новини по рубриці</li>
                <li><code>/api/news/single/[...params]</code> - конкретна новина</li>
                <li>Підтримка пагінації та фільтрів</li>
                <li>Автоматичне оновлення переглядів</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
