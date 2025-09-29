"use client";

import { useState, useEffect } from 'react';
import { MenuData, MenuItem } from '@/app/api/homepage/services/menuService';
import { apiGet, ApiError } from '@/app/lib/apiClient';

export function useMenuData() {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const response = await apiGet<MenuData>('/api/menu');
        
        setMenuData(response.data);
        setError(null);
      } catch (err) {
        let errorMessage = 'Unknown error occurred';
        
        if (err instanceof ApiError) {
          errorMessage = err.message;
          console.error('API Error fetching menu data:', {
            message: err.message,
            status: err.status,
            statusText: err.statusText
          });
        } else {
          console.error('Error fetching menu data:', err);
          errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  return { menuData, loading, error };
}
