'use client';

import React from 'react';
import { useSpecialThemesNews } from '@/app/hooks';

interface SpecialThemesExampleProps {
  themeParam: string;
  themeId?: number;
  searchById?: boolean;
}

export const SpecialThemesExample: React.FC<SpecialThemesExampleProps> = ({ 
  themeParam, 
  themeId, 
  searchById = false 
}) => {
  // Main hook usage with all features
  const {
    data,
    loading,
    error,
    refetch,
    setPage,
    setLimit,
    setType,
    setLang,
    setApproved,
    setParam,
    setById,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    getLatestNews,
    getNewsWithImages,
    getVideoNews,
    hasNews,
    getNewsByWeight,
    getSpecialThemeInfo,
    getMainImage,
    hasImages,
    getImagesCount
  } = useSpecialThemesNews({
    param: searchById ? (themeId?.toString() || '136') : themeParam,
    byId: searchById,
    limit: 10,
    lang: '1',
    approved: true,
    autoFetch: true
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>⏳ Завантаження новин спеціальної теми...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
        <div>❌ Помилка: {error}</div>
        <button onClick={refetch} style={{ marginTop: '10px', padding: '5px 10px' }}>
          🔄 Спробувати знову
        </button>
      </div>
    );
  }

  if (!data || !hasNews) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>📭 Новини для цієї теми не знайдено</div>
      </div>
    );
  }

  const themeInfo = getSpecialThemeInfo();
  const latestNews = getLatestNews();
  const newsWithImages = getNewsWithImages();
  const videoNews = getVideoNews();
  const importantNews = getNewsByWeight(2); // nweight = 2
  const topNews = getNewsByWeight(3); // nweight = 3

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Theme Information */}
      {themeInfo && (
        <div style={{ 
          backgroundColor: '#f0f8ff', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '30px',
          border: '1px solid #e1e8ff'
        }}>
          <h2 style={{ color: '#0066cc', margin: '0 0 15px 0' }}>
            📋 {themeInfo.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
            <div><strong>ID:</strong> {themeInfo.id}</div>
            <div><strong>Параметр:</strong> {themeInfo.param}</div>
            <div><strong>Посилання:</strong> {themeInfo.link}</div>
            <div><strong>Тип:</strong> {themeInfo.cattype}</div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>
            {data.news.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>ВСЬОГО НОВИН</div>
        </div>
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {newsWithImages.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>З ЗОБРАЖЕННЯМИ</div>
        </div>
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            {videoNews.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>ВІДЕО НОВИНИ</div>
        </div>
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fd7e14' }}>
            {importantNews.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>ВАЖЛИВІ</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '10px', 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <button onClick={goToFirstPage} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}>
          ⏮️ Перша
        </button>
        <button onClick={goToPrevPage} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}>
          ⬅️ Попередня
        </button>
        <button onClick={goToNextPage} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}>
          ➡️ Наступна
        </button>
        <button onClick={goToLastPage} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}>
          ⏭️ Остання
        </button>
        <button onClick={() => setLimit(5)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}>
          📄 5 на сторінку
        </button>
        <button onClick={() => setLimit(20)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}>
          📄 20 на сторінку
        </button>
        <button onClick={refetch} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#0066cc', color: 'white' }}>
          🔄 Оновити
        </button>
      </div>

      {/* Pagination Info */}
      <div style={{ 
        padding: '10px 15px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '6px', 
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '14px'
      }}>
        📊 Сторінка <strong>{data.pagination.page}</strong> з <strong>{data.pagination.totalPages}</strong> 
        | Всього новин: <strong>{data.pagination.total}</strong>
        {data.pagination.hasNext && ' | Є наступна сторінка ➡️'}
        {data.pagination.hasPrev && ' | Є попередня сторінка ⬅️'}
      </div>

      {/* Latest News Highlight */}
      {latestNews && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>⭐ Остання новина:</h3>
          <h4 style={{ color: '#0066cc', margin: '0 0 5px 0' }}>{latestNews.nheader}</h4>
          <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>{latestNews.nteaser}</p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            📅 {latestNews.ndate} {latestNews.ntime} | 
            👁️ {latestNews.views_count} переглядів | 
            💬 {latestNews.comments_count} коментарів
          </div>
        </div>
      )}

      {/* News List */}
      <div>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>📰 Список новин:</h3>
        {data.news.map((news, index) => {
          const mainImage = getMainImage(news);
          const newsHasImages = hasImages(news);
          const imagesCount = getImagesCount(news);

          return (
            <div key={news.id} style={{ 
              border: '1px solid #e9ecef', 
              borderRadius: '10px', 
              padding: '20px', 
              marginBottom: '20px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {/* News Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h4 style={{ color: '#0066cc', margin: '0', fontSize: '18px', flex: 1 }}>
                  {index + 1}. {news.nheader}
                </h4>
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'right', marginLeft: '15px' }}>
                  ID: {news.id}<br />
                  Вага: {news.nweight}
                </div>
              </div>

              {/* News Subheader */}
              {news.nsubheader && (
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#495057', marginBottom: '10px' }}>
                  {news.nsubheader}
                </div>
              )}

              {/* News Content */}
              <p style={{ color: '#333', lineHeight: '1.6', margin: '10px 0' }}>
                {news.nteaser}
              </p>

              {/* Image Information */}
              {newsHasImages && (
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  marginBottom: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ fontSize: '14px', color: '#495057' }}>
                    🖼️ <strong>Зображення:</strong> {imagesCount} шт.
                    {mainImage && (
                      <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                        <strong>Головне:</strong> {mainImage.urls?.tmb}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Video Badge */}
              {news.video === 1 && (
                <span style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  marginRight: '10px'
                }}>
                  🎥 ВІДЕО
                </span>
              )}

              {/* Important Badge */}
              {news.nweight === 2 && (
                <span style={{ 
                  backgroundColor: '#fd7e14', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  marginRight: '10px'
                }}>
                  ⭐ ВАЖЛИВА
                </span>
              )}

              {/* Top Badge */}
              {news.nweight === 3 && (
                <span style={{ 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  marginRight: '10px'
                }}>
                  🔝 ТОП
                </span>
              )}

              {/* News Footer */}
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d', 
                marginTop: '15px', 
                paddingTop: '10px', 
                borderTop: '1px solid #f1f3f4',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap'
              }}>
                <div>
                  📅 {news.ndate} {news.ntime} | 📂 {news.rubric}
                </div>
                <div>
                  👁️ {news.views_count} | 💬 {news.comments_count} | 📸 {news.photo ? 'Так' : 'Ні'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Debug Information */}
      <details style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#495057' }}>
          🐛 Налагоджувальна інформація
        </summary>
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '6px', 
          overflow: 'auto',
          fontSize: '12px',
          marginTop: '10px'
        }}>
          {JSON.stringify({
            searchMode: searchById ? 'ID' : 'Parameter',
            searchValue: searchById ? themeId : themeParam,
            pagination: data.pagination,
            filters: data.filters,
            specialTheme: themeInfo,
            statistics: {
              total: data.news.length,
              withImages: newsWithImages.length,
              videos: videoNews.length,
              important: importantNews.length,
              top: topNews.length
            }
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default SpecialThemesExample;
