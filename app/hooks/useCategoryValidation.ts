"use client";

import { useMemo } from 'react';
import { useMenuData } from './useMenuData';
import { isValidCategoryInMenuData, getCategoryFromMenuData } from '@/app/lib/categoryUtils';

/**
 * Hook for dynamic category validation using menu data
 */
export function useCategoryValidation() {
  const { menuData, loading, error } = useMenuData();

  const validateCategory = useMemo(() => {
    return (categoryParam: string): boolean => {
      return isValidCategoryInMenuData(categoryParam, menuData);
    };
  }, [menuData]);

  const getCategory = useMemo(() => {
    return (categoryParam: string) => {
      return getCategoryFromMenuData(categoryParam, menuData);
    };
  }, [menuData]);

  return {
    validateCategory,
    getCategory,
    loading,
    error,
    menuData
  };
}

