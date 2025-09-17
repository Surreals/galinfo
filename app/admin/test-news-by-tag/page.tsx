'use client';

import { useState } from 'react';
import { 
  useNewsByTag, 
  useLatestNewsByTag,
  useNewsByTagWithImages,
  useVideoNewsByTag,
  useAllNewsByTag
} from '@/app/hooks';

export default function TestNewsByTagPage() {
  const [selectedTagId, setSelectedTagId] = useState(1844); // Кабмін
  const [currentTest, setCurrentTest] = useState<'basic' | 'latest' | 'images' | 'video' | 'all'>('basic');

  // Test 1: Basic usage
  const {
    data: basicData,
    loading: basicLoading,
    error: basicError,
    setPage: setBasicPage,
    setLimit: setBasicLimit,
    goToNextPage: basicNextPage,
    goToPrevPage: basicPrevPage,
    getLatestNews: getBasicLatestNews,
    getNewsWithImages: getBasicNewsWithImages,
    getTagInfo: getBasicTagInfo,
    hasNews: basicHasNews,
    getMainImage,
    hasImages,
    getTotalNews,
    getNewsCount
  } = useNewsByTag({
    tagId: selectedTagId,
    limit: 5,
    autoFetch: currentTest === 'basic'
  });

  // Test 2: Latest news only
  const {
    data: latestData,
    loading: latestLoading,
    error: latestError
  } = useLatestNewsByTag(selectedTagId, {
    autoFetch: currentTest === 'latest'
  });

  // Test 3: News with images
  const {
    data: imagesData,
    loading: imagesLoading,
    error: imagesError,
    newsWithImages
  } = useNewsByTagWithImages(selectedTagId, {
    autoFetch: currentTest === 'images'
  });

  // Test 4: Video news
  const {
    data: videoData,
    loading: videoLoading,
    error: videoError,
    videoNews
  } = useVideoNewsByTag(selectedTagId, {
    autoFetch: currentTest === 'video'
  });

  // Test 5: All news
  const {
    data: allData,
    loading: allLoading,
    error: allError,
    goToNextPage: allNextPage,
    goToPrevPage: allPrevPage
  } = useAllNewsByTag(selectedTagId, {
    autoFetch: currentTest === 'all'
  });

  // Sample tag IDs for testing
  const sampleTags = [
    { id: 1844, name: 'Кабмін' },
    { id: 1906, name: 'житло' },
    { id: 2434, name: 'фінанси' },
    { id: 7277, name: 'Міністерство розвитку громад' }
  ];

  const renderNewsItem = (newsItem: any, showImages = false) => (
    <div key={newsItem.id} style={{ 
      border: '1px solid #ddd', 
      padding: '15px', 
      margin: '10px 0',
      borderRadius: '8px'
    }}>
      <h4 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>
        {newsItem.nheader}
      </h4>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
        <strong>ID:</strong> {newsItem.id} | 
        <strong> Дата:</strong> {newsItem.ndate} | 
        <strong> Час:</strong> {newsItem.ntime} | 
        <strong> Тип:</strong> {newsItem.ntype}
      </div>
      {newsItem.nsubheader && (
        <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0' }}>
          {newsItem.nsubheader}
        </div>
      )}
      <p style={{ color: '#333', lineHeight: '1.4' }}>{newsItem.nteaser}</p>
      
      {showImages && (
        <div style={{ marginTop: '10px' }}>
          <strong>Зображення:</strong> {hasImages(newsItem) ? 'Так' : 'Ні'}
          {hasImages(newsItem) && (
            <div>
              <strong>Кількість:</strong> {newsItem.images?.length || 0}
              {getMainImage(newsItem) && (
                <div style={{ marginTop: '5px' }}>
                  <strong>Головне зображення:</strong> {getMainImage(newsItem)?.urls?.tmb}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
        <strong>Рубрика:</strong> {newsItem.rubric} | 
        <strong> Перегляди:</strong> {newsItem.views_count} | 
        <strong> Коментарі:</strong> {newsItem.comments_count} |
        <strong> URL:</strong> {newsItem.urlkey}
      </div>
    </div>
  );

  const renderTestSection = () => {
    switch (currentTest) {
      case 'basic':
        return (
          <div>
            <h2>🏷️ Тест 1: Базове використання</h2>
            
            {basicLoading && <p>⏳ Завантаження...</p>}
            {basicError && <p style={{ color: 'red' }}>❌ Помилка: {basicError}</p>}
            
            {basicData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                  <h3>🏷️ Інформація про тег:</h3>
                  <p><strong>ID:</strong> {getBasicTagInfo()?.id}</p>
                  <p><strong>Назва:</strong> {getBasicTagInfo()?.tag}</p>
                  <p><strong>Є новини:</strong> {basicHasNews ? 'Так' : 'Ні'}</p>
                  <p><strong>Всього новин:</strong> {getTotalNews()}</p>
                  <p><strong>На сторінці:</strong> {getNewsCount()}</p>
                  <p><strong>Остання новина:</strong> {getBasicLatestNews()?.nheader || 'Немає'}</p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <button onClick={() => setBasicPage(1)} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    Перша сторінка
                  </button>
                  <button onClick={basicPrevPage} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    ← Попередня
                  </button>
                  <button onClick={basicNextPage} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    Наступна →
                  </button>
                  <button onClick={() => setBasicLimit(10)} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    Показати 10
                  </button>
                </div>

                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9' }}>
                  <strong>Пагінація:</strong> Сторінка {basicData.pagination.page} з {basicData.pagination.totalPages} 
                  | Всього: {basicData.pagination.total} новин
                </div>

                <h3>📰 Новини за тегом ({basicData.news.length}):</h3>
                {basicData.news.map(news => renderNewsItem(news, true))}
              </div>
            )}
          </div>
        );

      case 'latest':
        return (
          <div>
            <h2>⚡ Тест 2: Останні новини</h2>
            {latestLoading && <p>⏳ Завантаження...</p>}
            {latestError && <p style={{ color: 'red' }}>❌ Помилка: {latestError}</p>}
            
            {latestData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                  <h3>🏷️ Тег: {latestData.tag.tag} (ID: {latestData.tag.id})</h3>
                </div>
                <h3>📰 Остання новина:</h3>
                {latestData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      case 'images':
        return (
          <div>
            <h2>🖼️ Тест 3: Новини з зображеннями</h2>
            {imagesLoading && <p>⏳ Завантаження...</p>}
            {imagesError && <p style={{ color: 'red' }}>❌ Помилка: {imagesError}</p>}
            
            {imagesData && (
              <div>
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0fff0', borderRadius: '8px' }}>
                  <strong>Тег:</strong> {imagesData.tag.tag}<br />
                  <strong>Всього новин:</strong> {imagesData.news.length}<br />
                  <strong>Новини з зображеннями:</strong> {newsWithImages.length}
                </div>
                
                <h3>📰 Новини з зображеннями ({newsWithImages.length}):</h3>
                {newsWithImages.map(news => renderNewsItem(news, true))}
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div>
            <h2>🎥 Тест 4: Відео новини</h2>
            {videoLoading && <p>⏳ Завантаження...</p>}
            {videoError && <p style={{ color: 'red' }}>❌ Помилка: {videoError}</p>}
            
            {videoData && (
              <div>
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff0f0', borderRadius: '8px' }}>
                  <strong>Тег:</strong> {videoData.tag.tag}<br />
                  <strong>Всього новин:</strong> {videoData.news.length}<br />
                  <strong>Відео новини:</strong> {videoNews.length}
                </div>
                
                <h3>📰 Відео новини ({videoNews.length}):</h3>
                {videoNews.length > 0 ? (
                  videoNews.map(news => renderNewsItem(news, true))
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    📭 Відео новини для цього тегу не знайдено
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'all':
        return (
          <div>
            <h2>📚 Тест 5: Всі новини</h2>
            {allLoading && <p>⏳ Завантаження...</p>}
            {allError && <p style={{ color: 'red' }}>❌ Помилка: {allError}</p>}
            
            {allData && (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <button onClick={allPrevPage} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    ← Попередня
                  </button>
                  <button onClick={allNextPage} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    Наступна →
                  </button>
                </div>

                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9' }}>
                  <strong>Тег:</strong> {allData.tag.tag}<br />
                  <strong>Пагінація:</strong> Сторінка {allData.pagination.page} з {allData.pagination.totalPages} 
                  | Всього: {allData.pagination.total} новин
                </div>

                <h3>📰 Всі новини ({allData.news.length}):</h3>
                {allData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Тестування useNewsByTag Hook</h1>
      
      {/* Tag Selector */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Виберіть тег для тестування:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {sampleTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTagId(tag.id)}
              style={{
                padding: '8px 12px',
                backgroundColor: selectedTagId === tag.id ? '#0066cc' : '#f0f0f0',
                color: selectedTagId === tag.id ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {tag.name} (ID: {tag.id})
            </button>
          ))}
        </div>
        <div>
          <label>
            Або введіть ID тегу: 
            <input 
              type="number" 
              value={selectedTagId} 
              onChange={(e) => setSelectedTagId(Number(e.target.value))}
              style={{ marginLeft: '10px', padding: '5px', width: '100px' }}
            />
          </label>
        </div>
      </div>
      
      {/* Test Selector */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Виберіть тест:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setCurrentTest('basic')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: currentTest === 'basic' ? '#0066cc' : '#f0f0f0',
              color: currentTest === 'basic' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            1. Базове використання
          </button>
          <button 
            onClick={() => setCurrentTest('latest')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: currentTest === 'latest' ? '#0066cc' : '#f0f0f0',
              color: currentTest === 'latest' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            2. Останні новини
          </button>
          <button 
            onClick={() => setCurrentTest('images')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: currentTest === 'images' ? '#0066cc' : '#f0f0f0',
              color: currentTest === 'images' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            3. Новини з зображеннями
          </button>
          <button 
            onClick={() => setCurrentTest('video')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: currentTest === 'video' ? '#0066cc' : '#f0f0f0',
              color: currentTest === 'video' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            4. Відео новини
          </button>
          <button 
            onClick={() => setCurrentTest('all')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: currentTest === 'all' ? '#0066cc' : '#f0f0f0',
              color: currentTest === 'all' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            5. Всі новини
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px' }}>
        {renderTestSection()}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
        <h3>💡 Приклади використання коду:</h3>
        <pre style={{ backgroundColor: '#f1f1f1', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
{`// 1. Основне використання
const { data, loading, error } = useNewsByTag({
  tagId: 1844, // Кабмін
  limit: 10
});

// 2. Останні новини за тегом
const { data } = useLatestNewsByTag(1844);

// 3. Новини з зображеннями
const { newsWithImages } = useNewsByTagWithImages(1844);

// 4. Відео новини за тегом
const { videoNews } = useVideoNewsByTag(1844);

// 5. Новини певного типу за тегом
const { data } = useNewsByTagAndType(1844, 'video');

// 6. Навігація
const { goToNextPage, goToPrevPage } = useNewsByTag({
  tagId: 1844
});

// 7. Робота з зображеннями
const { getMainImage, hasImages } = useNewsByTag({
  tagId: 1844
});

if (hasImages(newsItem)) {
  const mainImage = getMainImage(newsItem);
}

// 8. Статистика
const { getTotalNews, getNewsCount, getTagInfo } = useNewsByTag({
  tagId: 1844
});

const tagInfo = getTagInfo();
const totalNews = getTotalNews();`}
        </pre>
      </div>
    </div>
  );
}
