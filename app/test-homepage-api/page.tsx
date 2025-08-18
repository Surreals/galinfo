'use client';

import { useState } from 'react';

export default function TestHomePageAPI() {
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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Test Home Page API</h1>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {loading ? 'Testing...' : 'Test API Endpoint'}
      </button>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div>
          <h2>API Response Data</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3>Summary</h3>
            <ul>
              <li><strong>News Count:</strong> {data.newsCount}</li>
              <li><strong>Categories:</strong> {data.categories?.length || 0}</li>
              <li><strong>Main News:</strong> {data.mainNews?.length || 0}</li>
              <li><strong>Special News:</strong> {data.specialNews?.length || 0}</li>
              <li><strong>Slide News:</strong> {data.slideNews?.length || 0}</li>
              <li><strong>Headline News:</strong> {data.headlineNews?.length || 0}</li>
              <li><strong>Popular News:</strong> {data.popularNews?.length || 0}</li>
              <li><strong>Suggested News:</strong> {data.suggestedNews?.length || 0}</li>
              <li><strong>Languages:</strong> {data.languages?.length || 0}</li>
              <li><strong>Environment Data:</strong> {data.enviro?.length || 0}</li>
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Categories</h3>
            {data.categories && data.categories.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {data.categories.map((category: any) => (
                  <div key={category.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                    <h4>{category.title}</h4>
                    <p>Type: {category.cattype === '1' ? 'Rubric' : 'Region'}</p>
                    <p>Param: {category.param}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No categories found</p>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Sample News Items</h3>
            {data.mainNews && data.mainNews.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {data.mainNews.slice(0, 6).map((news: any) => (
                  <div key={news.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                    <h4>{news.nheader}</h4>
                    {news.nsubheader && <p><em>{news.nsubheader}</em></p>}
                    <p>Date: {new Date(news.ndate * 1000).toLocaleDateString()}</p>
                    {news.comments && <p>Comments: {news.comments}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p>No main news found</p>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Raw Data (First 1000 characters)</h3>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px', 
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {JSON.stringify(data, null, 2).substring(0, 1000)}...
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
