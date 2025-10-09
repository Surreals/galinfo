'use client';

import { useState, useEffect } from 'react';
import { EditorialPageRenderer } from '@/app/components/EditorialPageRenderer';

export default function TermsOfUsePage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  const breadcrumbs = [
    { name: 'Головна', item: 'https://galinfo.com.ua/' },
    { name: 'Правила використання', item: 'https://galinfo.com.ua/terms-of-use' }
  ];

  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        const response = await fetch('/api/admin/templates');
        const result = await response.json();
        
        if (result.success && result.data) {
          const template = result.data.find((template: any) => template.template_id === 'terms-of-use');
          if (template) {
            setPageData(template.schema_json);
          }
        }
      } catch (error) {
        console.error('Error fetching template data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateData();
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

  if (!pageData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ПРАВИЛА ВИКОРИСТАННЯ</h1>
        <p>Помилка завантаження даних сторінки.</p>
      </div>
    );
  }

  return <EditorialPageRenderer data={pageData} breadcrumbs={breadcrumbs} />;
}


