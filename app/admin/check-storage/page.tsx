'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

interface Diagnostics {
  environment: {
    MEDIA_STORAGE_PATH: string;
    NEXT_PUBLIC_MEDIA_URL: string;
    NODE_ENV: string;
  };
  paths: {
    externalPath: string;
    projectPath: string;
    usingExternal: boolean;
  };
  checks: {
    externalPathExists: boolean;
    externalPathWritable: boolean;
    projectPathExists: boolean;
    projectPathWritable: boolean;
  };
  recommendations: string[];
}

interface CheckResult {
  success: boolean;
  status: string;
  message: string;
  diagnostics: Diagnostics;
}

export default function CheckStoragePage() {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStorage();
  }, []);

  const checkStorage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/check-storage');
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to check storage');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return '✅';
      case 'NEEDS_ATTENTION':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getCheckIcon = (value: boolean) => {
    return value ? '✅' : '❌';
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Media Storage Configuration Check</h1>
          <p>Verify your media storage setup</p>
        </div>

        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Checking configuration...</p>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fee', 
            border: '1px solid #fcc',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        {result && !loading && (
          <div style={{ maxWidth: '800px' }}>
            {/* Status */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: result.status === 'OK' ? '#e8f5e9' : '#fff3e0',
              border: `2px solid ${result.status === 'OK' ? '#4caf50' : '#ff9800'}`,
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>
                {getStatusIcon(result.status)} {result.message}
              </h2>
            </div>

            {/* Environment Variables */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3>Environment Variables</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(result.diagnostics.environment).map(([key, value]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{key}</td>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paths */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3>Storage Paths</h3>
              <p><strong>Using External Storage:</strong> {result.diagnostics.paths.usingExternal ? '✅ Yes' : '❌ No (using project directory)'}</p>
              <p><strong>External Path:</strong> <code>{result.diagnostics.paths.externalPath}</code></p>
              <p><strong>Project Path:</strong> <code>{result.diagnostics.paths.projectPath}</code></p>
            </div>

            {/* Checks */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3>File System Checks</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '0.5rem' }}>External path exists</td>
                    <td style={{ padding: '0.5rem' }}>{getCheckIcon(result.diagnostics.checks.externalPathExists)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '0.5rem' }}>External path writable</td>
                    <td style={{ padding: '0.5rem' }}>{getCheckIcon(result.diagnostics.checks.externalPathWritable)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '0.5rem' }}>Project path exists</td>
                    <td style={{ padding: '0.5rem' }}>{getCheckIcon(result.diagnostics.checks.projectPathExists)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem' }}>Project path writable</td>
                    <td style={{ padding: '0.5rem' }}>{getCheckIcon(result.diagnostics.checks.projectPathWritable)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendations */}
            {result.diagnostics.recommendations.length > 0 && (
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#fff3e0',
                border: '2px solid #ff9800',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3>⚠️ Recommendations</h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {result.diagnostics.recommendations.map((rec, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Refresh Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={checkStorage}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh Check
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

