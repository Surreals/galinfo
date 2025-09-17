'use client';

import { useState } from 'react';
import { 
  useImportantNewsWithPhotos,
  useImportantNewsWithPhotosByCategory,
  useImportantNewsWithPhotosByRegion,
  useImportantNewsWithPhotosByTag,
  useImportantNewsWithPhotosBySpecialTheme,
  useTopImportantNewsWithPhotos,
  useLatestImportantNewsWithPhoto
} from '@/app/hooks';

export default function TestImportantNewsWithPhotosPage() {
  const [filterType, setFilterType] = useState<'none' | 'category' | 'region' | 'tag' | 'theme' | 'top' | 'latest'>('none');
  const [categoryValue, setCategoryValue] = useState('politics');
  const [regionValue, setRegionValue] = useState('lviv-region');
  const [tagValue, setTagValue] = useState(1844);
  const [themeValue, setThemeValue] = useState(136);

  // Test 1: Basic usage - all important news with photos
  const {
    data: basicData,
    loading: basicLoading,
    error: basicError,
    setLevel: setBasicLevel,
    setLimit: setBasicLimit,
    setRequirePhotos: setBasicRequirePhotos,
    getLatestNews: getBasicLatestNews,
    getTotalNews: getBasicTotalNews,
    getNewsCount: getBasicNewsCount,
    getMainImage,
    hasImages,
    getNewsByWeight
  } = useImportantNewsWithPhotos({
    limit: 5,
    autoFetch: filterType === 'none'
  });

  // Test 2: By category
  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
    getCategoryInfo
  } = useImportantNewsWithPhotosByCategory(categoryValue, {
    limit: 3,
    autoFetch: filterType === 'category'
  });

  // Test 3: By region
  const {
    data: regionData,
    loading: regionLoading,
    error: regionError,
    getRegionInfo
  } = useImportantNewsWithPhotosByRegion(regionValue, {
    limit: 3,
    autoFetch: filterType === 'region'
  });

  // Test 4: By tag
  const {
    data: tagData,
    loading: tagLoading,
    error: tagError,
    getTagInfo
  } = useImportantNewsWithPhotosByTag(tagValue, {
    limit: 3,
    autoFetch: filterType === 'tag'
  });

  // Test 5: By special theme
  const {
    data: themeData,
    loading: themeLoading,
    error: themeError,
    getSpecialThemeInfo
  } = useImportantNewsWithPhotosBySpecialTheme(themeValue, {
    limit: 3,
    autoFetch: filterType === 'theme'
  });

  // Test 6: Top important news with photos
  const {
    data: topData,
    loading: topLoading,
    error: topError,
    getTopImportantNews
  } = useTopImportantNewsWithPhotos({
    autoFetch: filterType === 'top'
  });

  // Test 7: Latest important news with photo
  const {
    data: latestData,
    loading: latestLoading,
    error: latestError
  } = useLatestImportantNewsWithPhoto({
    autoFetch: filterType === 'latest'
  });

  const renderNewsItem = (newsItem: any, showImages = true) => (
    <div key={newsItem.id} style={{ 
      border: '1px solid #ddd', 
      padding: '15px', 
      margin: '10px 0',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <h4 style={{ color: '#0066cc', margin: '0', flex: 1 }}>
          {newsItem.nheader}
        </h4>
        <div style={{ fontSize: '12px', color: '#666', textAlign: 'right', marginLeft: '15px' }}>
          <div>ID: {newsItem.id}</div>
          <div>Важливість: {newsItem.nweight}</div>
        </div>
      </div>
      
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
        <strong>Дата:</strong> {newsItem.ndate} | 
        <strong> Час:</strong> {newsItem.ntime} | 
        <strong> Тип:</strong> {newsItem.ntype}
      </div>
      
      {newsItem.nsubheader && (
        <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0', color: '#495057' }}>
          {newsItem.nsubheader}
        </div>
      )}
      
      <p style={{ color: '#333', lineHeight: '1.4', margin: '10px 0' }}>{newsItem.nteaser}</p>
      
      {showImages && hasImages(newsItem) && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '14px', color: '#495057', marginBottom: '5px' }}>
            🖼️ <strong>Зображення:</strong> {newsItem.images?.length || 0} шт.
          </div>
          {getMainImage(newsItem) && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>Головне:</strong> {getMainImage(newsItem)?.urls?.tmb}
            </div>
          )}
        </div>
      )}
      
      <div style={{ 
        fontSize: '12px', 
        color: '#888', 
        marginTop: '15px',
        paddingTop: '10px',
        borderTop: '1px solid #f1f3f4',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div>
          📂 {newsItem.rubric} | 🔗 {newsItem.urlkey}
        </div>
        <div>
          👁️ {newsItem.views_count} | 💬 {newsItem.comments_count}
        </div>
      </div>
    </div>
  );

  const renderTestSection = () => {
    switch (filterType) {
      case 'none':
        return (
          <div>
            <h2>📰 Всі важливі новини з фото</h2>
            
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setBasicLevel(1)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                Рівень 1
              </button>
              <button onClick={() => setBasicLevel(2)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                Рівень 2 (Топ)
              </button>
              <button onClick={() => setBasicLevel(3)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                Рівень 3 (Фото)
              </button>
              <button onClick={() => setBasicLevel(4)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                Рівень 4 (Ілюстровані)
              </button>
              <button onClick={() => setBasicLevel(undefined)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                Всі рівні
              </button>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => setBasicLimit(3)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                3 новини
              </button>
              <button onClick={() => setBasicLimit(10)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                10 новин
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input 
                  type="checkbox" 
                  checked={true} 
                  onChange={(e) => setBasicRequirePhotos(e.target.checked)}
                />
                Тільки з фото
              </label>
            </div>
            
            {basicLoading && <p>⏳ Завантаження...</p>}
            {basicError && <p style={{ color: 'red' }}>❌ Помилка: {basicError}</p>}
            
            {basicData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                  <h3>📊 Статистика:</h3>
                  <p><strong>Всього знайдено:</strong> {getBasicTotalNews()}</p>
                  <p><strong>На сторінці:</strong> {getBasicNewsCount()}</p>
                  <p><strong>Остання новина:</strong> {getBasicLatestNews()?.nheader || 'Немає'}</p>
                  <p><strong>Топ новин:</strong> {getNewsByWeight(2).length}</p>
                  <p><strong>Фото новин:</strong> {getNewsByWeight(3).length}</p>
                </div>

                <h3>📰 Новини ({basicData.news.length}):</h3>
                {basicData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      case 'category':
        return (
          <div>
            <h2>📂 Важливі новини з фото за категорією</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label>
                Категорія: 
                <select 
                  value={categoryValue} 
                  onChange={(e) => setCategoryValue(e.target.value)}
                  style={{ marginLeft: '10px', padding: '5px' }}
                >
                  <option value="politics">Політика</option>
                  <option value="economy">Економіка</option>
                  <option value="society">Суспільство</option>
                  <option value="culture">Культура</option>
                  <option value="sport">Спорт</option>
                </select>
              </label>
            </div>
            
            {categoryLoading && <p>⏳ Завантаження...</p>}
            {categoryError && <p style={{ color: 'red' }}>❌ Помилка: {categoryError}</p>}
            
            {categoryData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                  <h3>📂 Категорія:</h3>
                  <p><strong>ID:</strong> {getCategoryInfo()?.id}</p>
                  <p><strong>Назва:</strong> {getCategoryInfo()?.name}</p>
                  <p><strong>Всього новин:</strong> {categoryData.total}</p>
                </div>

                <h3>📰 Новини за категорією ({categoryData.news.length}):</h3>
                {categoryData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      case 'region':
        return (
          <div>
            <h2>🏛️ Важливі новини з фото за регіоном</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label>
                Регіон: 
                <select 
                  value={regionValue} 
                  onChange={(e) => setRegionValue(e.target.value)}
                  style={{ marginLeft: '10px', padding: '5px' }}
                >
                  <option value="lviv-region">Львівщина</option>
                  <option value="ternopil-region">Тернопільщина</option>
                  <option value="volyn">Волинь</option>
                  <option value="ukraine">Україна</option>
                </select>
              </label>
            </div>
            
            {regionLoading && <p>⏳ Завантаження...</p>}
            {regionError && <p style={{ color: 'red' }}>❌ Помилка: {regionError}</p>}
            
            {regionData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fff0', borderRadius: '8px' }}>
                  <h3>🏛️ Регіон:</h3>
                  <p><strong>ID:</strong> {getRegionInfo()?.id}</p>
                  <p><strong>Назва:</strong> {getRegionInfo()?.name}</p>
                  <p><strong>Всього новин:</strong> {regionData.total}</p>
                </div>

                <h3>📰 Новини за регіоном ({regionData.news.length}):</h3>
                {regionData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      case 'tag':
        return (
          <div>
            <h2>🏷️ Важливі новини з фото за тегом</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label>
                Тег ID: 
                <select 
                  value={tagValue} 
                  onChange={(e) => setTagValue(Number(e.target.value))}
                  style={{ marginLeft: '10px', padding: '5px' }}
                >
                  <option value={1844}>1844 (Кабмін)</option>
                  <option value={1906}>1906 (житло)</option>
                  <option value={2434}>2434 (фінанси)</option>
                </select>
              </label>
            </div>
            
            {tagLoading && <p>⏳ Завантаження...</p>}
            {tagError && <p style={{ color: 'red' }}>❌ Помилка: {tagError}</p>}
            
            {tagData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff0f0', borderRadius: '8px' }}>
                  <h3>🏷️ Тег:</h3>
                  <p><strong>ID:</strong> {getTagInfo()?.id}</p>
                  <p><strong>Назва:</strong> {getTagInfo()?.tag}</p>
                  <p><strong>Всього новин:</strong> {tagData.total}</p>
                </div>

                <h3>📰 Новини за тегом ({tagData.news.length}):</h3>
                {tagData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      case 'theme':
        return (
          <div>
            <h2>🎯 Важливі новини з фото за спеціальною темою</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label>
                Спеціальна тема ID: 
                <input 
                  type="number" 
                  value={themeValue} 
                  onChange={(e) => setThemeValue(Number(e.target.value))}
                  style={{ marginLeft: '10px', padding: '5px', width: '100px' }}
                />
              </label>
            </div>
            
            {themeLoading && <p>⏳ Завантаження...</p>}
            {themeError && <p style={{ color: 'red' }}>❌ Помилка: {themeError}</p>}
            
            {themeData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0ff', borderRadius: '8px' }}>
                  <h3>🎯 Спеціальна тема:</h3>
                  <p><strong>ID:</strong> {getSpecialThemeInfo()?.id}</p>
                  <p><strong>Назва:</strong> {getSpecialThemeInfo()?.title}</p>
                  <p><strong>Параметр:</strong> {getSpecialThemeInfo()?.param}</p>
                  <p><strong>Всього новин:</strong> {themeData.total}</p>
                </div>

                <h3>📰 Новини за темою ({themeData.news.length}):</h3>
                {themeData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      case 'top':
        return (
          <div>
            <h2>⭐ Топ важливі новини з фото</h2>
            
            {topLoading && <p>⏳ Завантаження...</p>}
            {topError && <p style={{ color: 'red' }}>❌ Помилка: {topError}</p>}
            
            {topData && (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                  <h3>⭐ Топ важливі новини (рівень 2):</h3>
                  <p><strong>Всього знайдено:</strong> {topData.total}</p>
                  <p><strong>Топ новина:</strong> {getTopImportantNews()?.nheader || 'Немає'}</p>
                </div>

                <h3>📰 Топ новини ({topData.news.length}):</h3>
                {topData.news.map(news => renderNewsItem(news))}
              </div>
            )}
          </div>
        );

      case 'latest':
        return (
          <div>
            <h2>⚡ Остання важлива новина з фото</h2>
            
            {latestLoading && <p>⏳ Завантаження...</p>}
            {latestError && <p style={{ color: 'red' }}>❌ Помилка: {latestError}</p>}
            
            {latestData && (
              <div>
                <h3>📰 Остання важлива новина з фото:</h3>
                {latestData.news.map(news => renderNewsItem(news))}
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
      <h1>🧪 Тестування Important News with Photos</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Виберіть тип фільтрації:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { key: 'none', label: 'Всі важливі' },
            { key: 'category', label: 'За категорією' },
            { key: 'region', label: 'За регіоном' },
            { key: 'tag', label: 'За тегом' },
            { key: 'theme', label: 'За темою' },
            { key: 'top', label: 'Топ новини' },
            { key: 'latest', label: 'Остання новина' }
          ].map(({ key, label }) => (
            <button 
              key={key}
              onClick={() => setFilterType(key as any)}
              style={{ 
                padding: '10px 15px', 
                backgroundColor: filterType === key ? '#0066cc' : '#f0f0f0',
                color: filterType === key ? 'white' : 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', backgroundColor: '#fafafa' }}>
        {renderTestSection()}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
        <h3>💡 Приклади використання коду:</h3>
        <pre style={{ backgroundColor: '#f1f1f1', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
{`// 1. Всі важливі новини з фото
const { data, loading, error } = useImportantNewsWithPhotos({
  limit: 5
});

// 2. За категорією
const { data, getCategoryInfo } = useImportantNewsWithPhotosByCategory('politics');

// 3. За регіоном
const { data, getRegionInfo } = useImportantNewsWithPhotosByRegion('lviv-region');

// 4. За тегом
const { data, getTagInfo } = useImportantNewsWithPhotosByTag(1844);

// 5. За спеціальною темою
const { data, getSpecialThemeInfo } = useImportantNewsWithPhotosBySpecialTheme(136);

// 6. Топ важливі новини
const { data, getTopImportantNews } = useTopImportantNewsWithPhotos();

// 7. Остання важлива новина з фото
const { data } = useLatestImportantNewsWithPhoto();

// 8. Множинна фільтрація
const { data } = useImportantNewsWithPhotosMultiFilter({
  category: 'politics',
  tagId: 1844,
  level: 2
});

// 9. Динамічна зміна фільтрів
const { setCategory, setRegion, setTagId, setLevel } = useImportantNewsWithPhotos();

setCategory('politics');
setRegion('lviv-region');
setTagId(1844);
setLevel(2);`}
        </pre>
      </div>
    </div>
  );
}
