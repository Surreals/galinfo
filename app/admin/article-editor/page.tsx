'use client';

import {useState, useEffect, Suspense, useRef, useCallback} from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import ClientOnly from '../../components/ClientOnly';
import NewsEditorHeader from "@/app/admin/article-editor/components/NewsEditorHeader";
import NewsEditorSidebar from "@/app/admin/article-editor/components/NewsEditorSidebar";
import NewsEditor from "@/app/admin/article-editor/components/NewsEditor";
import NewsFullEditor from "@/app/admin/article-editor/components/NewsEditorTipTap";
import ArticleEditorLoader from "@/app/admin/article-editor/components/ArticleEditorLoader";
import ChatGPTIframe from "@/app/admin/article-editor/components/ChatGPTIframe";
import TelegramMessenger from "@/app/admin/article-editor/components/TelegramMessenger";
import { useArticleData, ArticleData } from "@/app/hooks/useArticleData";
import {useMenuContext} from "@/app/contexts/MenuContext";

// Dynamically import the TipTap editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function ArticleEditorContent() {
  const searchParams = useSearchParams();
  const newsId = searchParams.get('id');
  const [isEditing, setIsEditing] = useState(false);
  const [isChatGPTVisible, setIsChatGPTVisible] = useState(false);
  const [isTelegramVisible, setIsTelegramVisible] = useState(false);
  const [editorSaveFn, setEditorSaveFn] = useState<(() => Promise<string>) | null>(null);
  const [isHeaderValid, setIsHeaderValid] = useState(false);
  const [isSidebarValid, setIsSidebarValid] = useState(false);
  
  // Загальна валідація
  const isFormValid = isHeaderValid && isSidebarValid;

  // Завантажуємо дані новини
  const { data: articleData, loading, error, updateData, refetch: fetchArticle, } = useArticleData({ id: newsId });
  const { menuData } = useMenuContext();

  useEffect(() => {
    if (newsId) {
      setIsEditing(true);
    }
  }, [newsId]);

  // Handler for nbody changes
  const handleNbodyChange = (nbody: string) => {
    updateData({ nbody });
  };

  // Handler for general data changes
  const handleDataChange = (updates: Partial<ArticleData>) => {
    updateData(updates);
  };

  // Handler for tags changes from sidebar
  const handleTagsChange = (tags: string) => {
    console.log('Tags changed in parent:', tags);
    
    // Convert tags string to array and update both tags and keywords
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const keywordsString = tagsArray.join(', ');
    
    console.log('Tags array:', tagsArray, 'Keywords string:', keywordsString);
    
    updateData({ 
      tags: tagsArray,
      nkeywords: keywordsString 
    });
  };

  // Handler for editor save function
  const handleEditorSaveRef = useCallback((saveFn: () => Promise<string>) => {
    setEditorSaveFn(() => saveFn);
  }, []);

  return (
    <ArticleEditorLoader loading={loading} error={error}>
      <div style={{ padding: '10px', maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '10px' }}>
        <NewsEditorHeader
          isEditing={isEditing}
          articleData={articleData}
          onNbodyChange={handleNbodyChange}
          onDataChange={handleDataChange}
          onEditorSaveRef={handleEditorSaveRef}
          onValidationChange={setIsHeaderValid}
        />
        <NewsEditorSidebar
          fetchArticle={fetchArticle}
          menuData={menuData}
          newsId={newsId} 
          articleData={articleData}
          onEditorSave={editorSaveFn}
          isTitleValid={isFormValid}
          onSidebarValidationChange={setIsSidebarValid}
          onTagsChange={handleTagsChange}
        />
      </div>
      
      {/* Floating action buttons and modals */}
      <ChatGPTIframe 
        isVisible={isChatGPTVisible}
        onToggle={() => setIsChatGPTVisible(!isChatGPTVisible)}
        articleData={articleData}
      />
      <TelegramMessenger 
        articleData={articleData}
        isVisible={isTelegramVisible}
        onToggle={() => setIsTelegramVisible(!isTelegramVisible)}
      />
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
