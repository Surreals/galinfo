"use client";

import { useMemo } from 'react';
import { useMenuData } from './useMenuData';
import { createCategoryIds, CategoryIds, LEGACY_CATEGORY_IDS } from '@/app/lib/categoryUtils';

/**
 * Hook to get dynamic category IDs from menu data
 * Falls back to legacy category IDs if menu data is not available
 */
export function useCategoryIds(): {
  categoryIds: CategoryIds;
  loading: boolean;
  error: string | null;
} {
  const { menuData, loading, error } = useMenuData();

  const categoryIds = useMemo(() => {
    return createCategoryIds(menuData);
  }, [menuData]);

  return {
    categoryIds,
    loading,
    error
  };
}

/**
 * Hook to get category IDs with fallback to legacy IDs
 * This is useful for components that need category IDs immediately
 */
export function useCategoryIdsWithFallback(): CategoryIds {
  const { categoryIds, loading } = useCategoryIds();
  
  // Return dynamic IDs if available, otherwise fallback to legacy
  return loading ? LEGACY_CATEGORY_IDS as CategoryIds : categoryIds;
}

