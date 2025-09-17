'use client';

import React, { useState } from 'react';
import { useNewsByTag, useNewsByTagName } from '@/app/hooks';

export const TagSearchExample: React.FC = () => {
  const [searchMode, setSearchMode] = useState<'id' | 'name'>('name');
  const [tagId, setTagId] = useState(1844);
  const [tagName, setTagName] = useState('Кабмін');

  // Search by ID
  const { 
    data: idData, 
    loading: idLoading, 
    error: idError,
    getTagInfo: getIdTagInfo
  } = useNewsByTag({
    tagId,
    limit: 3,
    autoFetch: searchMode === 'id'
  });

  // Search by name
  const { 
    data: nameData, 
    loading: nameLoading, 
    error: nameError,
    getTagInfo: getNameTagInfo,
    setTagName: updateTagName
  } = useNewsByTagName(tagName, {
    limit: 3,
    autoFetch: searchMode === 'name'
  });

  const currentData = searchMode === 'id' ? idData : nameData;
  const currentLoading = searchMode === 'id' ? idLoading : nameLoading;
  const currentError = searchMode === 'id' ? idError : nameError;
  const currentTagInfo = searchMode === 'id' ? getIdTagInfo() : getNameTagInfo();

  const sampleTags = [
    { id: 1844, name: 'Кабмін' },
    { id: 1906, name: 'житло' },
    { id: 2434, name: 'фінанси' }
  ];

  const handleTagChange = (newTagId: number, newTagName: string) => {
    setTagId(newTagId);
    setTagName(newTagName);
    if (searchMode === 'name') {
      updateTagName(newTagName);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏷️ Тестування пошуку за тегами</h1>
      
      {/* Search Mode Selector */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Режим пошуку:</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '20px' }}>
            <input 
              type="radio" 
              checked={searchMode === 'id'} 
              onChange={() => setSearchMode('id')} 
            />
            За ID тегу
          </label>
          <label>
            <input 
              type="radio" 
              checked={searchMode === 'name'} 
              onChange={() => setSearchMode('name')} 
            />
            За назвою тегу
          </label>
        </div>
        
        {searchMode === 'id' ? (
          <div style={{ marginBottom: '15px' }}>
            <label>
              ID тегу: 
              <input 
                type="number" 
                value={tagId} 
                onChange={(e) => setTagId(Number(e.target.value))}
                style={{ marginLeft: '10px', padding: '5px', width: '100px' }}
              />
            </label>
          </div>
        ) : (
          <div style={{ marginBottom: '15px' }}>
            <label>
              Назва тегу: 
              <input 
                type="text" 
                value={tagName} 
                onChange={(e) => {
                  setTagName(e.target.value);
                  updateTagName(e.target.value);
                }}
                style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
                placeholder="Кабмін, житло, фінанси..."
              />
            </label>
          </div>
        )}

        <div>
          <h4>Швидкий вибір:</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {sampleTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagChange(tag.id, tag.name)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: (searchMode === 'id' ? tagId === tag.id : tagName === tag.name) ? '#0066cc' : '#f0f0f0',
                  color: (searchMode === 'id' ? tagId === tag.id : tagName === tag.name) ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {tag.name} ({tag.id})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
        <h2>📊 Результати пошуку</h2>
        
        {currentLoading && (
          <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
            ⏳ Завантаження...
          </div>
        )}

        {currentError && (
          <div style={{ padding: '15px', backgroundColor: '#ffe6e6', border: '1px solid #ff9999', borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ color: '#cc0000', margin: '0 0 10px 0' }}>❌ Помилка:</h4>
            <p style={{ margin: '0', color: '#cc0000' }}>{currentError}</p>
            
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
              <h5>💡 Можливі причини:</h5>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>Тег не існує в базі даних</li>
                <li>Неправильно введена назва тегу</li>
                <li>Сервер не запущено</li>
                <li>База даних недоступна</li>
              </ul>
            </div>
          </div>
        )}

        {currentData && (
          <div>
            {/* Tag Info */}
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#e7f3ff', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #b3d9ff'
            }}>
              <h3 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>
                🏷️ Інформація про тег:
              </h3>
              {currentTagInfo ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                  <div><strong>ID:</strong> {currentTagInfo.id}</div>
                  <div><strong>Назва:</strong> {currentTagInfo.tag}</div>
                  <div><strong>Режим пошуку:</strong> {searchMode === 'id' ? 'За ID' : 'За назвою'}</div>
                  <div><strong>Параметр пошуку:</strong> {searchMode === 'id' ? tagId : tagName}</div>
                </div>
              ) : (
                <p style={{ margin: '0', color: '#666' }}>Інформація недоступна</p>
              )}
            </div>

            {/* Statistics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '10px', 
              marginBottom: '20px' 
            }}>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0066cc' }}>
                  {currentData.news.length}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>НОВИН НА СТОРІНЦІ</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                  {currentData.pagination.total}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>ВСЬОГО</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fd7e14' }}>
                  {currentData.pagination.page}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>СТОРІНКА</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6f42c1' }}>
                  {currentData.pagination.totalPages}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>СТОРІНОК</div>
              </div>
            </div>

            {/* News List */}
            <div>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>📰 Новини за тегом:</h3>
              {currentData.news.length > 0 ? (
                currentData.news.map((news, index) => (
                  <div key={news.id} style={{ 
                    border: '1px solid #e9ecef', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    marginBottom: '15px',
                    backgroundColor: '#fff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ color: '#0066cc', margin: '0 0 8px 0', fontSize: '16px' }}>
                        {index + 1}. {news.nheader}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#666' }}>ID: {news.id}</span>
                    </div>
                    
                    {news.nsubheader && (
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#495057', marginBottom: '8px' }}>
                        {news.nsubheader}
                      </div>
                    )}
                    
                    <p style={{ color: '#333', lineHeight: '1.5', margin: '8px 0', fontSize: '14px' }}>
                      {news.nteaser}
                    </p>
                    
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6c757d', 
                      marginTop: '10px', 
                      paddingTop: '8px', 
                      borderTop: '1px solid #f1f3f4',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>📅 {news.ndate} {news.ntime}</span>
                      <span>👁️ {news.views_count} | 💬 {news.comments_count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  color: '#666'
                }}>
                  📭 Новини не знайдено
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Code Examples */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>💡 Приклади використання:</h3>
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '4px', 
          fontSize: '13px',
          overflow: 'auto'
        }}>
{`// 1. Пошук за ID тегу (оригінальний спосіб)
const { data, loading, error } = useNewsByTag({
  tagId: 1844,
  limit: 10
});

// 2. Пошук за назвою тегу (НОВИЙ!)
const { data, loading, error } = useNewsByTag({
  tagName: 'Кабмін',
  limit: 10
});

// 3. Використання спеціальних хуків для назв
const { data } = useNewsByTagName('Кабмін', { limit: 5 });
const { data } = useLatestNewsByTagName('житло');
const { newsWithImages } = useNewsByTagNameWithImages('фінанси');

// 4. Динамічна зміна між ID та назвою
const { setTagId, setTagName } = useNewsByTag({
  tagId: 1844
});

// Переключитися на пошук за назвою
setTagName('житло'); // Автоматично очистить tagId

// Переключитися на пошук за ID
setTagId(1906); // Автоматично очистить tagName

// 5. API запити:
// За ID: /api/news/by-tag/1844
// За назвою: /api/news/by-tag/Кабмін?byName=true`}
        </pre>
      </div>

      {/* Debug Info */}
      <details style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🐛 Налагоджувальна інформація</summary>
        <div style={{ marginTop: '10px' }}>
          <h4>Поточні параметри:</h4>
          <ul>
            <li><strong>Режим пошуку:</strong> {searchMode === 'id' ? 'За ID' : 'За назвою'}</li>
            <li><strong>Tag ID:</strong> {tagId}</li>
            <li><strong>Tag Name:</strong> {tagName}</li>
            <li><strong>Завантаження:</strong> {currentLoading ? 'Так' : 'Ні'}</li>
            <li><strong>Помилка:</strong> {currentError || 'Немає'}</li>
            <li><strong>Дані:</strong> {currentData ? 'Є' : 'Немає'}</li>
          </ul>
          
          {currentData && (
            <>
              <h4>Інформація про тег:</h4>
              <ul>
                <li><strong>Знайдений ID:</strong> {currentTagInfo?.id}</li>
                <li><strong>Знайдена назва:</strong> {currentTagInfo?.tag}</li>
                <li><strong>Всього новин:</strong> {currentData.pagination.total}</li>
              </ul>
              
              <h4>Фільтри API:</h4>
              <pre style={{ 
                backgroundColor: '#fff', 
                padding: '10px', 
                borderRadius: '4px', 
                fontSize: '11px'
              }}>
                {JSON.stringify(currentData.filters, null, 2)}
              </pre>
            </>
          )}
        </div>
      </details>
    </div>
  );
};

export default TagSearchExample;
