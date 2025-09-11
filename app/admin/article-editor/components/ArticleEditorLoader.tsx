"use client";

import { Spin, Alert, Card } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface ArticleEditorLoaderProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export default function ArticleEditorLoader({ loading, error, children }: ArticleEditorLoaderProps) {
  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <Card style={{ textAlign: 'center', padding: '2rem' }}>
          <Spin 
            size="large" 
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
          <div style={{ marginTop: '1rem', fontSize: '16px' }}>
            Завантаження даних...
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        maxWidth: '1400px', 
        margin: '0 auto'
      }}>
        <Alert
          message="Помилка завантаження"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                background: 'none', 
                border: '1px solid #ff4d4f', 
                color: '#ff4d4f',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Спробувати знову
            </button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
