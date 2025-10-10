'use client';

import { useState, useEffect } from 'react';
import { EditorialPageHtmlRenderer } from '@/app/components/EditorialPageHtmlRenderer';

export default function ContactsPage() {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);

  const breadcrumbs = [
    { name: 'Головна', item: 'https://galinfo.com.ua/' },
    { name: 'Контакти', item: 'https://galinfo.com.ua/contacts' }
  ];

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await fetch('/api/admin/editorial-pages?page_id=contacts');
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">КОНТАКТИ</h1>
        <p>Помилка завантаження даних сторінки.</p>
      </div>
    );
  }

  return <EditorialPageHtmlRenderer htmlContent={htmlContent} breadcrumbs={breadcrumbs} />;
}


