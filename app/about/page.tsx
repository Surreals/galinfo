'use client';

import { useState, useEffect } from 'react';
import { EditorialPageHtmlRenderer } from '@/app/components/EditorialPageHtmlRenderer';

export default function AboutPage() {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);

  const breadcrumbs = [
    { name: 'Головна', item: 'https://galinfo.com.ua/' },
    { name: 'Про редакцію', item: 'https://galinfo.com.ua/about' }
  ];

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await fetch('/api/admin/editorial-pages?page_id=about');
        const result = await response.json();
        
        if (result.success && result.data) {
          setHtmlContent(result.data.html_content);
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
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
          Завантаження...
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

  if (!htmlContent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ПРО РЕДАКЦІЮ</h1>
        <p>Помилка завантаження даних сторінки.</p>
      </div>
    );
  }

  return <EditorialPageHtmlRenderer htmlContent={htmlContent} breadcrumbs={breadcrumbs} />;
}