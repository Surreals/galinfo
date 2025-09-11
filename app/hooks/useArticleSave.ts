import { useState } from 'react';
import { notification } from 'antd';
import { ArticleData } from './useArticleData';

export interface UseArticleSaveOptions {
  articleData?: ArticleData | null;
  newsId?: string | null;
}

export interface UseArticleSaveReturn {
  saving: boolean;
  saveArticle: (data: Partial<ArticleData>) => Promise<boolean>;
  deleteArticle: () => Promise<boolean>;
}

export function useArticleSave({ articleData, newsId }: UseArticleSaveOptions = {}): UseArticleSaveReturn {
  const [saving, setSaving] = useState(false);

  const saveArticle = async (data: Partial<ArticleData>): Promise<boolean> => {
    try {
      setSaving(true);

      const url = newsId ? `/api/admin/articles/${newsId}` : '/api/admin/articles';
      const method = newsId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }

      const result = await response.json();
      
      if (result.success) {
        notification.success({
          message: 'Успіх',
          description: newsId ? 'Новину оновлено' : 'Новину створено',
          placement: 'topRight',
        });
        return true;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      notification.error({
        message: 'Помилка',
        description: error instanceof Error ? error.message : 'Помилка збереження',
        placement: 'topRight',
      });
      return false;
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

      const response = await fetch(`/api/admin/articles/${newsId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      const result = await response.json();
      
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
      console.error('Error deleting article:', error);
      notification.error({
        message: 'Помилка',
        description: error instanceof Error ? error.message : 'Помилка видалення',
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
