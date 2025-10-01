'use client';

import { useState, useEffect } from 'react';

interface TemplateSchema {
  id: number;
  template_id: string;
  name: string;
  description: string;
  schema_json: any;
  created_at: string;
  updated_at: string;
}

interface TemplateSchemas {
  'main-desktop': any;
  'main-mobile': any;
  'category-desktop': any;
  'category-mobile': any;
  'hero': any;
  'hero-info-desktop': any;
  'hero-info-mobile': any;
  'article-desktop': any;
  'article-mobile': any;
}

interface UseTemplateSchemasReturn {
  schemas: Partial<TemplateSchemas>;
  loading: boolean;
  error: string | null;
  getSchema: (templateId: keyof TemplateSchemas) => any | null;
}

export function useTemplateSchemas(): UseTemplateSchemasReturn {
  const [schemas, setSchemas] = useState<Partial<TemplateSchemas>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/templates');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Перетворюємо масив у об'єкт з ключами template_id
          const schemasMap: Partial<TemplateSchemas> = {};
          data.data.forEach((template: TemplateSchema) => {
            // Парсимо JSON якщо це строка
            let schemaObj = template.schema_json;
            if (typeof schemaObj === 'string') {
              try {
                schemaObj = JSON.parse(schemaObj);
              } catch (e) {
                console.error(`Failed to parse schema for ${template.template_id}:`, e);
                return;
              }
            }
            schemasMap[template.template_id as keyof TemplateSchemas] = schemaObj;
          });
          setSchemas(schemasMap);
        }
      } catch (err) {
        console.error('Error fetching template schemas:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch schemas');
      } finally {
        setLoading(false);
      }
    };

    fetchSchemas();
  }, []);

  const getSchema = (templateId: keyof TemplateSchemas) => {
    return schemas[templateId] || null;
  };

  return {
    schemas,
    loading,
    error,
    getSchema,
  };
}

