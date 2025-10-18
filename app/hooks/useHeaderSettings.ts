import { useState, useEffect } from 'react';
import { headerSchema } from '@/app/lib/headerSchema';

interface HeaderSettings {
  mainNavigation: {
    categoryIds: number[];
    maxItems: number;
  };
  moreNewsDropdown: {
    topThemes: {
      enabled: boolean;
      categoryIds: number[];
    };
    categories: {
      enabled: boolean;
      column1: {
        categoryIds: number[];
      };
      column2: {
        categoryIds: number[];
      };
      column3: {
        categoryIds: number[];
      };
      column4: {
        items?: string[];
        categoryIds?: number[];
      };
    };
  };
  mobileMenu: {
    topThemes: {
      enabled: boolean;
      categoryIds: number[];
    };
    categories: {
      enabled: boolean;
      categoryIds: number[];
    };
  };
}

export function useHeaderSettings() {
  const [settings, setSettings] = useState<HeaderSettings>(headerSchema as HeaderSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/templates');
        const result = await response.json();

        if (result.success && result.data) {
          const headerTemplate = result.data.find((t: any) => t.template_id === 'header');
          
          if (headerTemplate) {
            // Parse schema_json if it's a string
            const parsedSettings = typeof headerTemplate.schema_json === 'string'
              ? JSON.parse(headerTemplate.schema_json)
              : headerTemplate.schema_json;
            
            setSettings(parsedSettings);
          } else {
            // Use default schema if template not found in DB
            setSettings(headerSchema as HeaderSettings);
          }
        } else {
          setSettings(headerSchema as HeaderSettings);
        }
      } catch (err) {
        console.error('Error fetching header settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch header settings');
        // Fallback to default schema on error
        setSettings(headerSchema as HeaderSettings);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
