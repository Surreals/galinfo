import { useState } from 'react';
import { notification } from 'antd';
import { ArticleData } from './useArticleData';
import { apiPost, apiPut, apiDelete, ApiError } from '@/app/lib/apiClient';

export interface UseArticleSaveOptions {
  articleData?: ArticleData | null;
  newsId?: string | null;
}

export interface UseArticleSaveReturn {
  saving: boolean;
  saveArticle: (data: Partial<ArticleData>) => Promise<{ success: boolean; id?: number }>; 
  deleteArticle: () => Promise<boolean>;
}

export function useArticleSave({ articleData, newsId }: UseArticleSaveOptions = {}): UseArticleSaveReturn {
  const [saving, setSaving] = useState(false);

  const saveArticle = async (data: Partial<ArticleData>): Promise<{ success: boolean; id?: number }> => {
    try {
      setSaving(true);

      let response;
      if (newsId) {
        response = await apiPut(`/api/admin/articles/${newsId}`, data);
      } else {
        response = await apiPost('/api/admin/articles', data);
      }

      const result = response.data;
      
      if (result.success) {
        notification.success({
          message: 'Успіх',
          description: newsId ? 'Новину оновлено' : 'Новину створено',
          placement: 'topRight',
        });
        // Повертаємо ідентифікатор створеної/оновленої новини, якщо доступний
        const createdId = result.id || result.data?.id;
        return { success: true, id: createdId };
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      let errorMessage = 'Помилка збереження';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
        console.error('API Error saving article:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText
        });
      } else {
        console.error('Error saving article:', error);
        errorMessage = error instanceof Error ? error.message : 'Помилка збереження';
      }
      
      notification.error({
        message: 'Помилка',
        description: errorMessage,
        placement: 'topRight',
      });
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const deleteArticle = async (): Promise<boolean> => {
    if (!newsId) {
      notification.warning({
        message: 'Попередження',
        description: 'Немає ID новини для видалення',
        placement: 'topRight',
      });
      return false;
    }

    try {
      setSaving(true);

      const response = await apiDelete(`/api/admin/articles/${newsId}`);
      const result = response.data;
      
      if (result.success) {
        notification.success({
          message: 'Успіх',
          description: 'Новину видалено',
          placement: 'topRight',
        });
        return true;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      let errorMessage = 'Помилка видалення';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
        console.error('API Error deleting article:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText
        });
      } else {
        console.error('Error deleting article:', error);
        errorMessage = error instanceof Error ? error.message : 'Помилка видалення';
      }
      
      notification.error({
        message: 'Помилка',
        description: errorMessage,
        placement: 'topRight',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveArticle,
    deleteArticle,
  };
}
