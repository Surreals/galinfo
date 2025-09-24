'use client';

import React from 'react';
import { useCompleteNewsData } from "@/app/hooks";
import ArticlePageRenderer from "@/app/components/ArticlePageRenderer";

interface ArticlePageClientProps {
  urlkey: string;
  id: number;
}

export const ArticlePageClient: React.FC<ArticlePageClientProps> = ({ urlkey, id }) => {
  const { data, loading } = useCompleteNewsData({
    id,
    urlkey,
    articleType: 'mixed', // Використовуємо 'mixed' для пошуку як новин, так і статей
  });

  const article = data?.article;

  return (
    <ArticlePageRenderer 
      article={article} 
      loading={loading} 
    />
  );
};
