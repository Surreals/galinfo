import { useState, useEffect } from 'react';

// Типи для даних
export interface ArticleType {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  title: string;
  cattype: number; // 1-рубрика, 2-тема, 3-регіон, 4-рейтинг
  description?: string;
}

export interface User {
  id: number;
  name: string;
  type: 'editor' | 'journalist' | 'blogger';
}

export interface Language {
  id: string;
  title: string;
  code: string;
}

export interface Tag {
  id: number;
  tag: string;
}

export interface ArticleEditorData {
  articleTypes: ArticleType[];
  categories: Category[];
  users: User[];
  languages: Language[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

export interface UseArticleEditorDataOptions {
  lang?: string;
}

export interface UseArticleEditorDataReturn extends ArticleEditorData {
  refetch: () => void;
}

export function useArticleEditorData(options: UseArticleEditorDataOptions = {}): UseArticleEditorDataReturn {
  const [data, setData] = useState<ArticleEditorData>({
    articleTypes: [],
    categories: [],
    users: [],
    languages: [],
    tags: [],
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Паралельно завантажуємо всі дані
      const [
        articleTypesRes,
        categoriesRes,
        usersRes,
        languagesRes,
        tagsRes
      ] = await Promise.all([
        fetch('/api/admin/article-types'),
        fetch(`/api/admin/categories?lang=${options.lang || 'ua'}`),
        fetch('/api/admin/users'),
        fetch('/api/admin/languages'),
        fetch('/api/admin/tags')
      ]);

      if (!articleTypesRes.ok) throw new Error('Failed to fetch article types');
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      if (!languagesRes.ok) throw new Error('Failed to fetch languages');
      if (!tagsRes.ok) throw new Error('Failed to fetch tags');

      const [articleTypes, categories, users, languages, tags] = await Promise.all([
        articleTypesRes.json(),
        categoriesRes.json(),
        usersRes.json(),
        languagesRes.json(),
        tagsRes.json()
      ]);

      setData({
        articleTypes: articleTypes.data || [],
        categories: categories.data || [],
        users: users.data || [],
        languages: languages.data || [],
        tags: tags.data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching article editor data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [options.lang]);

  return {
    ...data,
    refetch: fetchData,
  };
}

// Допоміжні функції для фільтрації даних
export function getRubrics(categories: Category[]): Category[] {
  return categories.filter(cat => cat.cattype === 1);
}

export function getThemes(categories: Category[]): Category[] {
  return categories.filter(cat => cat.cattype === 2);
}

export function getRegions(categories: Category[]): Category[] {
  return categories.filter(cat => cat.cattype === 3);
}

export function getEditors(users: User[]): User[] {
  return users.filter(user => user.type === 'editor');
}

export function getJournalists(users: User[]): User[] {
  return users.filter(user => user.type === 'journalist');
}

export function getBloggers(users: User[]): User[] {
  return users.filter(user => user.type === 'blogger');
}

// Константи для статичних даних
export const ARTICLE_TYPE_OPTIONS = [
  { value: 1, label: 'Новина' },
  { value: 2, label: 'Стаття' },
  { value: 3, label: 'Фоторепортаж' },
  { value: 4, label: 'Відео' },
  { value: 20, label: 'Блог' },
];

export const PRIORITY_OPTIONS = [
  { value: 0, label: 'Звичайний' },
  { value: 1, label: 'Важливий' },
  { value: 2, label: 'ТОП! Слайдшоу' },
];

export const LAYOUT_OPTIONS = [
  { value: 0, label: 'По замовчуванню' },
  { value: 1, label: 'Малі фото' },
  { value: 2, label: 'Фотослайд' },
  { value: 3, label: 'Фото в тексті/після тексту' },
  { value: 10, label: 'Без фото' },
];

export const ID_TO_TOP_OPTIONS = [
  { value: 0, label: 'ID —> TOP' },
  { value: 1, label: '#1' },
  { value: 2, label: '#2' },
  { value: 3, label: '#3' },
  { value: 4, label: '#4' },
];
