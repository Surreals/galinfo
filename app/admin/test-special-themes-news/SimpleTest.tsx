'use client';

import React, { useState } from 'react';
import { useSpecialThemesNews } from '@/app/hooks';

export const SimpleTest: React.FC = () => {
  const [themeParam, setThemeParam] = useState('vidverta-rozmova-z');
  const [searchById, setSearchById] = useState(false);

  const { 
    data, 
    loading, 
    error, 
    refetch,
    getSpecialThemeInfo,
    hasNews,
    getLatestNews
  } = useSpecialThemesNews({
    param: themeParam,
    byId: searchById,
    limit: 5,
    autoFetch: true
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Простий тест useSpecialThemesNews</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Налаштування:</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <input 
              type="radio" 
              checked={!searchById} 
              onChange={() => setSearchById(false)} 
            />
            Пошук за параметром
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input 
              type="radio" 
              checked={searchById} 
              onChange={() => setSearchById(true)} 
            />
            Пошук за ID
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            {searchById ? 'ID теми:' : 'Параметр теми:'} 
            <input 
              type="text" 
              value={themeParam} 
              onChange={(e) => setThemeParam(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
              placeholder={searchById ? '136' : 'vidverta-rozmova-z'}
            />
          </label>
        </div>
        
        <button 
          onClick={refetch}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#0066cc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Оновити
        </button>
      </div>

      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
          ⏳ Завантаження...
        </div>
      )}

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#ffe6e6', border: '1px solid #ff9999', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ color: '#cc0000', margin: '0 0 10px 0' }}>❌ Помилка:</h4>
          <p style={{ margin: '0', color: '#cc0000' }}>{error}</p>
          
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
            <h5>💡 Можливі причини:</h5>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Сервер не запущено (npm run dev)</li>
              <li>База даних недоступна</li>
              <li>Неправильний параметр або ID</li>
              <li>Тема не існує або не опублікована</li>
            </ul>
            
            <h5>🔧 Спробуйте:</h5>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Перевірити, чи запущено сервер</li>
              <li>Використати інший параметр (наприклад: "news", "politics")</li>
              <li>Переключитися між пошуком за ID та параметром</li>
              <li>Перевірити консоль браузера для деталей</li>
            </ul>
          </div>
        </div>
      )}

      {data && (
        <div>
          {/* Theme Info */}
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #b3d9ff'
          }}>
            <h3 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>
              📋 Інформація про тему:
            </h3>
            {getSpecialThemeInfo() ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div><strong>ID:</strong> {getSpecialThemeInfo()?.id}</div>
                <div><strong>Назва:</strong> {getSpecialThemeInfo()?.title}</div>
                <div><strong>Параметр:</strong> {getSpecialThemeInfo()?.param}</div>
                <div><strong>Посилання:</strong> {getSpecialThemeInfo()?.link}</div>
                <div><strong>Тип:</strong> {getSpecialThemeInfo()?.cattype}</div>
                <div><strong>Є новини:</strong> {hasNews ? '✅ Так' : '❌ Ні'}</div>
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
                {data.news.length}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>НОВИН</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                {data.pagination.total}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>ВСЬОГО</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fd7e14' }}>
                {data.pagination.page}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>СТОРІНКА</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6f42c1' }}>
                {data.pagination.totalPages}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>СТОРІНОК</div>
            </div>
          </div>

          {/* Latest News */}
          {getLatestNews() && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>⭐ Остання новина:</h4>
              <h5 style={{ color: '#0066cc', margin: '0 0 5px 0' }}>{getLatestNews()?.nheader}</h5>
              <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>{getLatestNews()?.nteaser}</p>
            </div>
          )}

          {/* News List */}
          <div>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>📰 Список новин:</h3>
            {data.news.length > 0 ? (
              data.news.map((news, index) => (
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

      {/* Debug Info */}
      <details style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🐛 Налагоджувальна інформація</summary>
        <div style={{ marginTop: '10px' }}>
          <h4>Параметри запиту:</h4>
          <ul>
            <li><strong>Параметр:</strong> {themeParam}</li>
            <li><strong>Режим пошуку:</strong> {searchById ? 'За ID' : 'За параметром'}</li>
            <li><strong>Ліміт:</strong> 5</li>
            <li><strong>Автозавантаження:</strong> Так</li>
          </ul>
          
          <h4>Стан хука:</h4>
          <ul>
            <li><strong>Завантаження:</strong> {loading ? 'Так' : 'Ні'}</li>
            <li><strong>Помилка:</strong> {error || 'Немає'}</li>
            <li><strong>Дані:</strong> {data ? 'Є' : 'Немає'}</li>
            <li><strong>Має новини:</strong> {hasNews ? 'Так' : 'Ні'}</li>
          </ul>
          
          {data && (
            <>
              <h4>API відповідь:</h4>
              <pre style={{ 
                backgroundColor: '#fff', 
                padding: '10px', 
                borderRadius: '4px', 
                fontSize: '11px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify({
                  newsCount: data.news.length,
                  pagination: data.pagination,
                  filters: data.filters,
                  specialTheme: data.specialTheme
                }, null, 2)}
              </pre>
            </>
          )}
        </div>
      </details>
    </div>
  );
};

export default SimpleTest;
