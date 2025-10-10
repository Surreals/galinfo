'use client';

import { useState, useEffect, useRef } from 'react';
import { CKEditor } from 'ckeditor4-react';
import styles from './EditorialPagesEditor.module.css';

interface EditorialPage {
  page_id: string;
  title: string;
  path: string;
  html_content: string;
}

const PAGES_LIST = [
  { page_id: 'about', title: 'Про редакцію', icon: '📋' },
  { page_id: 'editorial-policy', title: 'Редакційна політика', icon: '📜' },
  { page_id: 'advertising', title: 'Замовити рекламу', icon: '💼' },
  { page_id: 'contacts', title: 'Контакти', icon: '📞' },
  { page_id: 'terms-of-use', title: 'Правила використання', icon: '⚖️' }
];

export default function EditorialPagesEditor() {
  const [selectedPage, setSelectedPage] = useState<string>('about');
  const [pages, setPages] = useState<Record<string, EditorialPage>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const editorRef = useRef<any>(null);

  // CKEditor конфігурація
  const editorConfig = {
    editorUrl: 'https://cdn.ckeditor.com/4.22.1/standard-all/ckeditor.js',
    placeholder: 'Введіть контент сторінки...',
    language: 'uk',
    versionCheck: false,
    toolbar: [
      { name: 'document', items: ['Source', '-', 'Preview'] },
      { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
      { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll'] },
      '/',
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
      { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
      { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
      '/',
      { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar', 'Iframe'] },
      { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
      { name: 'colors', items: ['TextColor', 'BGColor'] },
      { name: 'tools', items: ['Maximize', 'ShowBlocks'] }
    ],
    allowedContent: true,
    height: 600,
    extraPlugins: 'iframe,font,colorbutton,justify',
    filebrowserUploadUrl: '/api/admin/images/upload',
    filebrowserUploadMethod: 'form',
    enterMode: 2,
    shiftEnterMode: 1,
    removePlugins: 'elementspath',
    resize_enabled: true,
    contentsCss: ['https://cdn.ckeditor.com/4.22.1/standard-all/contents.css'],
  };

  // Load all pages on mount
  useEffect(() => {
    const loadPages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/editorial-pages');
        const result = await response.json();

        if (result.success && result.data) {
          const pagesMap: Record<string, EditorialPage> = {};
          result.data.forEach((page: EditorialPage) => {
            pagesMap[page.page_id] = page;
          });
          setPages(pagesMap);
        }
      } catch (error) {
        console.error('Error loading pages:', error);
        alert('Помилка завантаження сторінок');
      } finally {
        setIsLoading(false);
      }
    };

    loadPages();
  }, []);

  // Update editor content when selected page changes
  useEffect(() => {
    if (editorRef.current?.editor && pages[selectedPage]) {
      const content = pages[selectedPage].html_content;
      editorRef.current.editor.setData(content);
      setCurrentContent(content);
      setHasUnsavedChanges(false);
    }
  }, [selectedPage, pages]);

  const handleSave = async () => {
    if (!editorRef.current?.editor || !pages[selectedPage]) return;

    try {
      setIsSaving(true);
      const htmlContent = editorRef.current.editor.getData();

      const response = await fetch('/api/admin/editorial-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: selectedPage,
          html_content: htmlContent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setPages(prev => ({
          ...prev,
          [selectedPage]: {
            ...prev[selectedPage],
            html_content: htmlContent,
          },
        }));
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        alert('Сторінку успішно збережено!');
      } else {
        throw new Error(result.error || 'Помилка збереження');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert(`Помилка збереження: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageChange = (pageId: string) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        'У вас є незбережені зміни. Ви впевнені, що хочете перейти на іншу сторінку?'
      );
      if (!confirm) return;
    }
    setSelectedPage(pageId);
  };

  // Обробник зміни контенту
  const handleEditorChange = (event: any) => {
    if (editorRef.current?.editor) {
      const data = editorRef.current.editor.getData();
      setCurrentContent(data);
      setHasUnsavedChanges(true);
    }
  };

  // Ініціалізація редактора
  const handleEditorReady = (event: any) => {
    const editor = event.editor;
    editorRef.current = { editor };

    // Встановлюємо початковий контент якщо є
    if (pages[selectedPage]) {
      editor.setData(pages[selectedPage].html_content);
      setCurrentContent(pages[selectedPage].html_content);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Завантаження...</p>
      </div>
    );
  }

  const currentPage = pages[selectedPage];

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>📝 Статичні сторінки</h3>
        </div>
        <div className={styles.pagesList}>
          {PAGES_LIST.map((page) => (
            <button
              key={page.page_id}
              className={`${styles.pageButton} ${
                selectedPage === page.page_id ? styles.pageButtonActive : ''
              }`}
              onClick={() => handlePageChange(page.page_id)}
            >
              <span className={styles.pageIcon}>{page.icon}</span>
              <span className={styles.pageTitle}>{page.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className={styles.editorArea}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.pageInfo}>
            <h2>{currentPage?.title}</h2>
            <span className={styles.pagePath}>{currentPage?.path}</span>
          </div>
          <div className={styles.actions}>
            {lastSaved && (
              <span className={styles.lastSaved}>
                Збережено: {lastSaved.toLocaleTimeString('uk-UA')}
              </span>
            )}
            {hasUnsavedChanges && (
              <span className={styles.unsavedBadge}>Незбережені зміни</span>
            )}
            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </div>

        {/* CKEditor */}
        <div className={styles.editorWrapper}>
          <CKEditor
            initData={currentContent}
            config={editorConfig}
            onInstanceReady={handleEditorReady}
            onChange={handleEditorChange}
            editorUrl="https://cdn.ckeditor.com/4.22.1/standard-all/ckeditor.js"
          />
        </div>
      </div>
    </div>
  );
}

