'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuData, MenuItem } from '@/app/api/homepage/services/menuService';

interface MenuContextType {
  menuData: MenuData | null;
  loading: boolean;
  error: string | null;
  getCategoryById: (id: number) => MenuItem | undefined;
  getCategoryByParam: (param: string) => MenuItem | undefined;
  getCategoryByTitle: (title: string) => MenuItem | undefined;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
}

interface MenuProviderProps {
  children: ReactNode;
}

export function MenuProvider({ children }: MenuProviderProps) {
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

  const getCategoryById = (id: number): MenuItem | undefined => {
    if (!menuData) return undefined;
    
    const allCategories = [
      ...menuData.mainCategories,
      ...menuData.regions,
      ...menuData.specialThemes
    ];
    
    return allCategories.find(cat => cat.id === id);
  };

  const getCategoryByParam = (param: string): MenuItem | undefined => {
    if (!menuData) return undefined;
    
    const allCategories = [
      ...menuData.mainCategories,
      ...menuData.regions,
      ...menuData.specialThemes
    ];
    
    return allCategories.find(cat => cat.param === param);
  };

  const getCategoryByTitle = (title: string): MenuItem | undefined => {
    if (!menuData) return undefined;
    
    const allCategories = [
      ...menuData.mainCategories,
      ...menuData.regions,
      ...menuData.specialThemes
    ];
    
    return allCategories.find(cat => 
      cat.title.toUpperCase() === title.toUpperCase() ||
      cat.title === title
    );
  };

  const value: MenuContextType = {
    menuData,
    loading,
    error,
    getCategoryById,
    getCategoryByParam,
    getCategoryByTitle
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}
