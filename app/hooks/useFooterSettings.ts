import { useState, useEffect } from 'react';
import { footerSchema } from '@/app/lib/footerSchema';

interface FooterSettings {
  agency: {
    enabled: boolean;
  };
  topThemes: {
    enabled: boolean;
    categoryIds: number[];
  };
  categories: {
    enabled: boolean;
    column1: {
      type: string;
      categoryIds: number[];
    };
    column2: {
      type: string;
      categoryIds: number[];
      maxItems: number;
    };
    column3: {
      type: string;
      categoryIds: number[];
    };
    column4: {
      type: string;
      items: string[];
      maxItems: number;
    };
  };
  bottomSection: {
    logo: {
      enabled: boolean;
    };
    copyright: {
      enabled: boolean;
    };
    socialLinks: {
      enabled: boolean;
      facebook: boolean;
      twitter: boolean;
      instagram: boolean;
      rss: boolean;
    };
    siteCreator: {
      enabled: boolean;
    };
  };
}

export function useFooterSettings() {
  const [settings, setSettings] = useState<FooterSettings>(footerSchema as FooterSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/templates');
        const result = await response.json();

        if (result.success && result.data) {
          const footerTemplate = result.data.find((t: any) => t.template_id === 'footer');
          
          if (footerTemplate) {
            // Parse schema_json if it's a string
            const parsedSettings = typeof footerTemplate.schema_json === 'string'
              ? JSON.parse(footerTemplate.schema_json)
              : footerTemplate.schema_json;
            
            setSettings(parsedSettings);
          } else {
            // Use default schema if template not found in DB
            setSettings(footerSchema as FooterSettings);
          }
        } else {
          setSettings(footerSchema as FooterSettings);
        }
      } catch (err) {
        console.error('Error fetching footer settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch footer settings');
        // Fallback to default schema on error
        setSettings(footerSchema as FooterSettings);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
