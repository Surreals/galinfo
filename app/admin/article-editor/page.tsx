'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import ClientOnly from '../../components/ClientOnly';
import NewsEditorHeader from "@/app/admin/article-editor/components/NewsEditorHeader";
import NewsEditorSidebar from "@/app/admin/article-editor/components/NewsEditorSidebar";
import NewsEditor from "@/app/admin/article-editor/components/NewsEditor";
import NewsFullEditor from "@/app/admin/article-editor/components/NewsEditorTipTap";

// Dynamically import the TipTap editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function ArticleEditor() {
  const searchParams = useSearchParams();
  const newsId = searchParams.get('id');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (newsId) {
      setIsEditing(true);
    }
  }, [newsId]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '24px' }}>
      <NewsEditorHeader isEditing={isEditing} newsId={newsId} />
      <NewsEditorSidebar isEditing={isEditing} newsId={newsId} />
      {/*<NewsFullEditor/>*/}
    </div>
  );
}
