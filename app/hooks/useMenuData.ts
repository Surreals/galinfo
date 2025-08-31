import { useState, useEffect } from 'react';
import { MenuData, MenuItem } from '@/app/api/homepage/services/menuService';

export function useMenuData() {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/menu');
        
        if (!response.ok) {
          throw new Error('Failed to fetch menu data');
        }
        
        const data = await response.json();
        setMenuData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching menu data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  return { menuData, loading, error };
}
