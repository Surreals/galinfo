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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #ccc",
            borderTop: "4px solid #c7084f",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{marginTop: "16px", fontSize: "18px", color: "#333"}}>
          Завантаження даних...
        </p>

        {/* Додаємо ключові кадри прямо в JSX через <style> */}
        <style>
          {`
      @keyframes spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
        </style>
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
