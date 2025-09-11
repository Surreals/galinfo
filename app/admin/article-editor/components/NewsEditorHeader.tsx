// components/NewsEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, Input } from "antd";
import EditorJSClient from "@/app/admin/article-editor/components/EditorJSClient";
import { ArticleData } from "@/app/hooks/useArticleData";

import styles from "../NewsEditor.module.css";

const { TextArea } = Input;

interface NewsEditorHeaderProps {
  isEditing: boolean;
  newsId: string | null;
  articleData?: ArticleData | null;
  onNbodyChange?: (nbody: string) => void;
}

export default function NewsEditorHeader({ isEditing, newsId, articleData, onNbodyChange }: NewsEditorHeaderProps) {
  // --- стейти для всіх текстерій ---
  const [mainTitle, setMainTitle] = useState(articleData?.nheader || "");
  const [mainLead, setMainLead] = useState(articleData?.nteaser || "");

  const [topBlockTitle, setTopBlockTitle] = useState(articleData?.sheader || "");

  const [metaTitle, setMetaTitle] = useState(articleData?.ntitle || "");
  const [metaDescription, setMetaDescription] = useState(articleData?.ndescription || "");
  const [metaKeywords, setMetaKeywords] = useState(articleData?.nkeywords || "");

  // Оновлюємо поля при зміні даних новини
  useEffect(() => {
    if (articleData) {
      setMainTitle(articleData.nheader);
      setMainLead(articleData.nteaser);
      setTopBlockTitle(articleData.sheader || "");
      setMetaTitle(articleData.ntitle || "");
      setMetaDescription(articleData.ndescription || "");
      setMetaKeywords(articleData.nkeywords || "");
    } else {
      // Скидаємо до значень за замовчуванням при створенні нової новини
      setMainTitle("");
      setMainLead("");
      setTopBlockTitle("");
      setMetaTitle("");
      setMetaDescription("");
      setMetaKeywords("");
    }
  }, [articleData]);

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
                onChange={(e) => setMainTitle(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Лід</label>
              <TextArea
                rows={4}
                value={mainLead}
                onChange={(e) => setMainLead(e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Для ТОР БЛОКІВ",
      children: (
        <div className={styles.tabsBox}>
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label className={styles.label}>Заголовок</label>
              <TextArea
                rows={2}
                value={topBlockTitle}
                onChange={(e) => setTopBlockTitle(e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "3",
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
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <TextArea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Keywords</label>
                <TextArea
                  rows={2}
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                />
              </div>
            </div>
          </div>
        ),
    },
  ]

  return (
    <div className={styles.editorWrapper}>
      <h2 className={styles.header}>Редагувати новину</h2>
      <Tabs
        defaultActiveKey="1"
        items={items}
      />

      <h2 className={styles.header}>Повний текст новини</h2>
      <EditorJSClient
        htmlContent={articleData?.nbody}
        onHtmlChange={onNbodyChange}
        placeholder="Введіть повний текст новини..."
      />
    </div>
  );
}
