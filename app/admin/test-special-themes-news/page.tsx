'use client';

import { useState } from 'react';
import { 
  useSpecialThemesNews, 
  useSpecialThemesNewsById,
  useLatestSpecialThemesNews,
  useSpecialThemesNewsWithImages,
  useAllSpecialThemesNews
} from '@/app/hooks';

export default function TestSpecialThemesNewsPage() {
  const [selectedThemeParam, setSelectedThemeParam] = useState('vidverta-rozmova-z');
  const [selectedThemeId, setSelectedThemeId] = useState(136);
  const [currentTest, setCurrentTest] = useState<'param' | 'id' | 'latest' | 'images' | 'all'>('param');

  // Test 1: Basic usage with parameter
  const {
    data: paramData,
    loading: paramLoading,
    error: paramError,
    setPage: setParamPage,
    setLimit: setParamLimit,
    goToNextPage: paramNextPage,
    goToPrevPage: paramPrevPage,
    getLatestNews: getParamLatestNews,
    getNewsWithImages: getParamNewsWithImages,
    getSpecialThemeInfo: getParamThemeInfo,
    hasNews: paramHasNews,
    getMainImage,
    hasImages
  } = useSpecialThemesNews({
    param: selectedThemeParam,
    limit: 5,
    autoFetch: currentTest === 'param'
  });

  // Test 2: Search by ID
  const {
    data: idData,
    loading: idLoading,
    error: idError,
    refetch: refetchById
  } = useSpecialThemesNewsById(selectedThemeId, {
    limit: 3,
    autoFetch: currentTest === 'id'
  });

  // Test 3: Latest news only
  const {
    data: latestData,
    loading: latestLoading,
    error: latestError
  } = useLatestSpecialThemesNews(selectedThemeParam, {
    autoFetch: currentTest === 'latest'
  });

  // Test 4: News with images
  const {
    data: imagesData,
    loading: imagesLoading,
    error: imagesError,
    newsWithImages
  } = useSpecialThemesNewsWithImages(selectedThemeParam, {
    autoFetch: currentTest === 'images'
  });

  // Test 5: All news
  const {
    data: allData,
    loading: allLoading,
    error: allError,
    goToNextPage: allNextPage,
    goToPrevPage: allPrevPage
  } = useAllSpecialThemesNews(selectedThemeParam, {
    autoFetch: currentTest === 'all'
  });

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
        <strong> Вага:</strong> {newsItem.nweight}
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
        <strong> Коментарі:</strong> {newsItem.comments_count}
      </div>
    </div>
  );

  const renderTestSection = () => {
    switch (currentTest) {
      case 'param':
        return (
          <div>
            <h2>🔍 Тест 1: Пошук за параметром</h2>
            <div style={{ marginBottom: '20px' }}>
              <label>
                Параметр теми: 
                <input 
                  type="text" 
                  value={selectedThemeParam} 
                  onChange={(e) => setSelectedThemeParam(e.target.value)}
                  style={{ marginLeft: '10px', padding: '5px' }}
                />
              </label>
            </div>
            
            {paramLoading && <p>⏳ Завантаження...</p>}
            {paramError && <p style={{ color: 'red' }}>❌ Помилка: {paramError}</p>}
            
            {paramData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                  <h3>📊 Інформація про тему:</h3>
                  <p><strong>ID:</strong> {getParamThemeInfo()?.id}</p>
                  <p><strong>Назва:</strong> {getParamThemeInfo()?.title}</p>
                  <p><strong>Параметр:</strong> {getParamThemeInfo()?.param}</p>
                  <p><strong>Посилання:</strong> {getParamThemeInfo()?.link}</p>
                  <p><strong>Тип категорії:</strong> {getParamThemeInfo()?.cattype}</p>
                  <p><strong>Є новини:</strong> {paramHasNews ? 'Так' : 'Ні'}</p>
                  <p><strong>Останні новини:</strong> {getParamLatestNews()?.nheader || 'Немає'}</p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <button onClick={() => setParamPage(1)} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    Перша сторінка
                  </button>
                  <button onClick={paramPrevPage} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    ← Попередня
                  </button>
                  <button onClick={paramNextPage} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    Наступна →
                  </button>
                  <button onClick={() => setParamLimit(10)} style={{ margin: '0 5px', padding: '5px 10px' }}>
                    Показати 10
                  </button>
                </div>

                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9' }}>
                  <strong>Пагінація:</strong> Сторінка {paramData.pagination.page} з {paramData.pagination.totalPages} 
                  | Всього: {paramData.pagination.total} новин
                </div>

                <h3>📰 Новини ({paramData.news.length}):</h3>
                {paramData.news.map(news => renderNewsItem(news, true))}
              </div>
            )}
          </div>
        );

      case 'id':
        return (
          <div>
            <h2>🆔 Тест 2: Пошук за ID</h2>
            <div style={{ marginBottom: '20px' }}>
              <label>
                ID теми: 
                <input 
                  type="number" 
                  value={selectedThemeId} 
                  onChange={(e) => setSelectedThemeId(Number(e.target.value))}
                  style={{ marginLeft: '10px', padding: '5px', width: '100px' }}
                />
              </label>
              <button onClick={refetchById} style={{ marginLeft: '10px', padding: '5px 10px' }}>
                🔄 Оновити
              </button>
            </div>
            
            {idLoading && <p>⏳ Завантаження...</p>}
            {idError && <p style={{ color: 'red' }}>❌ Помилка: {idError}</p>}
            
            {idData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                  <h3>📊 Інформація про тему (за ID):</h3>
                  <p><strong>ID:</strong> {idData.specialTheme.id}</p>
                  <p><strong>Назва:</strong> {idData.specialTheme.title}</p>
                  <p><strong>Параметр:</strong> {idData.specialTheme.param}</p>
                  <p><strong>Посилання:</strong> {idData.specialTheme.link}</p>
                </div>

                <h3>📰 Новини за ID ({idData.news.length}):</h3>
                {idData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      case 'latest':
        return (
          <div>
            <h2>⚡ Тест 3: Останні новини</h2>
            {latestLoading && <p>⏳ Завантаження...</p>}
            {latestError && <p style={{ color: 'red' }}>❌ Помилка: {latestError}</p>}
            
            {latestData && (
              <div>
                <h3>📰 Остання новина:</h3>
                {latestData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      case 'images':
        return (
          <div>
            <h2>🖼️ Тест 4: Новини з зображеннями</h2>
            {imagesLoading && <p>⏳ Завантаження...</p>}
            {imagesError && <p style={{ color: 'red' }}>❌ Помилка: {imagesError}</p>}
            
            {imagesData && (
              <div>
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0fff0', borderRadius: '8px' }}>
                  <strong>Всього новин:</strong> {imagesData.news.length}<br />
                  <strong>Новини з зображеннями:</strong> {newsWithImages.length}
                </div>
                
                <h3>📰 Новини з зображеннями ({newsWithImages.length}):</h3>
                {newsWithImages.map(news => renderNewsItem(news, true))}
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
      <h1>🧪 Тестування useSpecialThemesNews Hook</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Виберіть тест:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setCurrentTest('param')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: currentTest === 'param' ? '#0066cc' : '#f0f0f0',
              color: currentTest === 'param' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            1. Пошук за параметром
          </button>
          <button 
            onClick={() => setCurrentTest('id')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: currentTest === 'id' ? '#0066cc' : '#f0f0f0',
              color: currentTest === 'id' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            2. Пошук за ID
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
            3. Останні новини
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
            4. Новини з зображеннями
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
const { data, loading, error } = useSpecialThemesNews({
  param: 'vidverta-rozmova-z',
  limit: 10
});

// 2. Пошук за ID
const { data } = useSpecialThemesNewsById(136, { limit: 5 });

// 3. Останні новини
const { data } = useLatestSpecialThemesNews('vidverta-rozmova-z');

// 4. Новини з зображеннями
const { newsWithImages } = useSpecialThemesNewsWithImages('vidverta-rozmova-z');

// 5. Навігація
const { goToNextPage, goToPrevPage } = useSpecialThemesNews({
  param: 'vidverta-rozmova-z'
});

// 6. Робота з зображеннями
const { getMainImage, hasImages } = useSpecialThemesNews({
  param: 'vidverta-rozmova-z'
});

if (hasImages(newsItem)) {
  const mainImage = getMainImage(newsItem);
}

// 7. Динамічна зміна параметрів
const { setPage, setLimit, setById } = useSpecialThemesNews({
  param: '136',
  byId: true
});

setPage(2);
setLimit(20);
setById(false); // Переключити на пошук за параметром`}
        </pre>
      </div>
    </div>
  );
}
