// components/NewsEditor.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, Input, Button } from "antd";
import { LinkOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArticleData } from "@/app/hooks/useArticleData";
import { EditorJSClientRef } from "@/app/admin/article-editor/components/EditorJSClient";
const EditorJSClient = dynamic(
  () => import("@/app/admin/article-editor/components/EditorJSClient"),
  { ssr: false }
);

import styles from "../NewsEditor.module.css";

const { TextArea } = Input;

interface NewsEditorHeaderProps {
  isEditing: boolean;
  articleData?: ArticleData | null;
  onNbodyChange?: (nbody: string) => void;
  onDataChange?: (updates: Partial<ArticleData>) => void;
  onEditorSaveRef?: (saveFn: () => Promise<string>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function NewsEditorHeader({ isEditing, articleData, onNbodyChange, onDataChange, onEditorSaveRef, onValidationChange }: NewsEditorHeaderProps) {
  const router = useRouter();
  const editorRef = useRef<EditorJSClientRef>(null);
  
  // --- стейти для всіх текстерій ---
  const [mainTitle, setMainTitle] = useState(articleData?.nheader || "");
  const [mainLead, setMainLead] = useState(articleData?.nteaser || "");
  
  // --- стан для валідації ---
  const [titleError, setTitleError] = useState<string>("");


  const [metaTitle, setMetaTitle] = useState(articleData?.ntitle || "");
  const [metaDescription, setMetaDescription] = useState(articleData?.ndescription || "");
  const [metaKeywords, setMetaKeywords] = useState(articleData?.nkeywords || "");

  // Оновлюємо поля при зміні даних новини
  useEffect(() => {
    if (articleData) {
      setMainTitle(articleData.nheader);
      setMainLead(articleData.nteaser);
      setMetaTitle(articleData.ntitle || "");
      setMetaDescription(articleData.ndescription || "");
      setMetaKeywords(articleData.nkeywords || "");
      
      // Валідуємо заголовок при завантаженні
      const isValid = validateTitle(articleData.nheader);
      onValidationChange?.(isValid);
    } else {
      // Sкидаємо до значень за замовчуванням при створенні нової новини
      setMainTitle("");
      setMainLead("");
      setMetaTitle("");
      setMetaDescription("");
      setMetaKeywords("");
      
      // Валідуємо порожній заголовок
      const isValid = validateTitle("");
      onValidationChange?.(isValid);
    }
  }, [articleData]);

  // Функція валідації заголовка
  const validateTitle = (title: string): boolean => {
    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      setTitleError("Заголовок є обов'язковим");
      return false;
    }
    setTitleError("");
    return true;
  };

  // Handlers для оновлення даних
  const handleMainTitleChange = (value: string) => {
    setMainTitle(value);
    onDataChange?.({ nheader: value });
    
    // Валідуємо заголовок
    const isValid = validateTitle(value);
    onValidationChange?.(isValid);
  };

  const handleMainLeadChange = (value: string) => {
    setMainLead(value);
    onDataChange?.({ nteaser: value });
  };

  const handleMetaTitleChange = (value: string) => {
    setMetaTitle(value);
    onDataChange?.({ ntitle: value });
  };

  const handleMetaDescriptionChange = (value: string) => {
    setMetaDescription(value);
    onDataChange?.({ ndescription: value });
  };

  const handleMetaKeywordsChange = (value: string) => {
    setMetaKeywords(value);
    onDataChange?.({ nkeywords: value });
  };

  // Функція для збереження контенту редактора
  const handleEditorSave = async (): Promise<string> => {
    if (editorRef.current) {
      await editorRef.current.save();
      // Отримуємо поточний HTML контент з редактора
      return await editorRef.current.getHtmlContent();
    }
    return articleData?.nbody || '';
  };

  // Передаємо функцію збереження наверх
  useEffect(() => {
    if (onEditorSaveRef) {
      onEditorSaveRef(handleEditorSave);
    }
  }, [onEditorSaveRef]);

  const items = [
    {
      key: "1",
      label: "Основні заголовки",
      children: (
        <div className={styles.tabsBox}>
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label className={styles.label}>Заголовок</label>
              <TextArea
                rows={2}
                value={mainTitle}
                onChange={(e) => handleMainTitleChange(e.target.value)}
                status={titleError ? "error" : undefined}
              />
              {titleError && (
                <div className={styles.errorMessage}>
                  {titleError}
                </div>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Лід</label>
              <TextArea
                rows={4}
                value={mainLead}
                onChange={(e) => handleMainLeadChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label:
        "Мета дані",
      children:
        (
          <div className={styles.tabsBox}>
            <div className={styles.tabContent}>
              <div className={styles.field}>
                <label className={styles.label}>Title</label>
                <TextArea
                  rows={2}
                  value={metaTitle}
                  onChange={(e) => handleMetaTitleChange(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <TextArea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => handleMetaDescriptionChange(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Keywords</label>
                <TextArea
                  rows={2}
                  value={metaKeywords}
                  onChange={(e) => handleMetaKeywordsChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        ),
    },
  ]

  // Функція для відкриття статті в новій вкладці
  const handleViewArticle = () => {
    if (articleData?.urlkey && articleData?.id) {
      const articleUrl = `/news/${articleData.urlkey}_${articleData.id}`;
      window.open(articleUrl, '_blank');
    }
  };

  // Функція для повернення до списку новин
  const handleBackToNews = () => {
    router.push('/admin/news');
  };

  return (
    <div className={styles.editorWrapper}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToNews}
          title="Повернутися до списку новин"
          style={{ 
            color: '#595959',
            padding: '4px 8px',
            height: 'auto'
          }}
        />
        <h2 className={styles.header}>{isEditing ? 'Редагувати новину' : 'Створити новину'}</h2>
        {isEditing && articleData?.urlkey && articleData?.id && (
          <Button
            type="text"
            icon={<LinkOutlined />}
            onClick={handleViewArticle}
            title="Переглянути статтю"
            style={{ 
              color: '#1890ff',
              padding: '4px 8px',
              height: 'auto'
            }}
          />
        )}
      </div>
      <Tabs
        defaultActiveKey="1"
        items={items}
      />

      <h2 className={styles.header}>Повний текст новини</h2>
      <EditorJSClient
        id={'editorjs'}
        ref={editorRef}
        htmlContent={articleData?.nbody}
        onHtmlChange={onNbodyChange}
        placeholder="Введіть повний текст новини..."
      />
    </div>
  );
}
