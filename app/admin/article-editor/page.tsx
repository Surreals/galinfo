'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import ClientOnly from '../../components/ClientOnly';
import NewsEditorHeader from "@/app/admin/article-editor/components/NewsEditorHeader";
import NewsEditorSidebar from "@/app/admin/article-editor/components/NewsEditorSidebar";
import NewsEditor from "@/app/admin/article-editor/components/NewsEditor";
import NewsFullEditor from "@/app/admin/article-editor/components/NewsEditorTipTap";
import ArticleEditorLoader from "@/app/admin/article-editor/components/ArticleEditorLoader";
import { useArticleData } from "@/app/hooks/useArticleData";

// Dynamically import the TipTap editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function ArticleEditorContent() {
  const searchParams = useSearchParams();
  const newsId = searchParams.get('id');
  const [isEditing, setIsEditing] = useState(false);

  // Завантажуємо дані новини
  const { data: articleData, loading, error, updateData } = useArticleData({ id: newsId });

  useEffect(() => {
    if (newsId) {
      setIsEditing(true);
    }
  }, [newsId]);

  // Handler for nbody changes
  const handleNbodyChange = (nbody: string) => {
    updateData({ nbody });
  };

  return (
    <ArticleEditorLoader loading={loading} error={error}>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '24px' }}>
        <NewsEditorHeader 
          isEditing={isEditing} 
          newsId={newsId} 
          articleData={articleData}
          onNbodyChange={handleNbodyChange}
        />
        <NewsEditorSidebar 
          isEditing={isEditing} 
          newsId={newsId} 
          articleData={articleData}
          onNbodyChange={handleNbodyChange}
        />
        {/* <NewsFullEditor/> */}
      </div>
    </ArticleEditorLoader>
  );
}

export default function ArticleEditor() {
  return (
    <Suspense fallback={
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    }>
      <ArticleEditorContent />
    </Suspense>
  );
}
