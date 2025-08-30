// components/NewsEditor.tsx
"use client";

import { useState } from "react";
import { Tabs, Input } from "antd";
import NewsEditor from "@/app/admin/test-editor/components/NewsEditor";

import styles from "../NewsEditor.module.css";

const { TextArea } = Input;

export default function NewsEditorHeader() {
  // --- стейти для всіх текстерій ---
  const [mainTitle, setMainTitle] = useState("");
  const [mainLead, setMainLead] = useState("");

  const [topBlockTitle, setTopBlockTitle] = useState("");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

  return (
    <div className={styles.editorWrapper}>
      <h2 className={styles.header}>Редагувати новину</h2>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Основні заголовки",
            children: (
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
            ),
          },
          {
            key: "2",
            label: "Для ТОР БЛОКІВ",
            children: (
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
            ),
          },
          {
            key: "3",
            label: "Мета дані",
            children: (
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
            ),
          },
        ]}
      />
      <NewsEditor/>
    </div>
  );
}
