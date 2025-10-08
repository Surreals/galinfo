"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { CKEditor } from "ckeditor4-react";

import styles from "../NewsEditor.module.css";

export interface CKEditorClientRef {
  save: () => Promise<void>;
  getHtmlContent: () => Promise<string>;
}

type Props = {
  htmlContent?: string;
  onHtmlChange?: (html: string) => void;
  placeholder?: string;
  id?: string;
};

const CKEditorClient = forwardRef<CKEditorClientRef, Props>(
  ({ htmlContent, onHtmlChange, placeholder = "Введіть текст новини..." }, ref) => {
    const editorRef = useRef<any>(null);

    // CKEditor 4 конфігурація
    const editorConfig = {
      // Використовуємо конкретну версію 4.22.1 (остання Open Source версія)
      editorUrl: 'https://cdn.ckeditor.com/4.22.1/standard-all/ckeditor.js',
      placeholder: placeholder,
      language: 'uk',
      // Вимикаємо попередження про оновлення до LTS (комерційної) версії
      versionCheck: false,
      // Toolbar конфігурація
      toolbar: [
        { name: 'document', items: ['Source', '-', 'NewPage', 'Preview', '-', 'Templates'] },
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
      // Дозволені теги для контенту
      allowedContent: true,
      // Висота редактора
      height: 500,
      // Додаткові плагіни
      extraPlugins: 'iframe,font,colorbutton,justify',
      // Налаштування для зображень
      filebrowserUploadUrl: '/api/admin/images/upload',
      filebrowserUploadMethod: 'form',
      // Налаштування для відео через iframe
      iframe_dialog: {
        title: 'Вставити відео',
        minWidth: 350,
        minHeight: 260
      },
      // Форматування виводу
      enterMode: 2, // CKEDITOR.ENTER_BR
      shiftEnterMode: 1, // CKEDITOR.ENTER_P
      // Автоматичне збереження при втраті фокусу
      removePlugins: 'elementspath', // Прибираємо path внизу редактора
      resize_enabled: true,
      // Стилі для редактора
      contentsCss: [
        'https://cdn.ckeditor.com/4.22.1/standard-all/contents.css',
      ],
    };

    // Обробник зміни контенту
    const handleEditorChange = (event: any) => {
      if (editorRef.current) {
        const data = editorRef.current.editor.getData();
        onHtmlChange?.(data);
      }
    };

    // Ініціалізація редактора
    const handleEditorReady = (event: any) => {
      const editor = event.editor;
      editorRef.current = { editor };

      // Встановлюємо початковий контент якщо є
      if (htmlContent) {
        editor.setData(htmlContent);
      }
    };

    // Методи для ref
    useImperativeHandle(ref, () => ({
      save: async () => {
        if (editorRef.current?.editor) {
          const data = editorRef.current.editor.getData();
          onHtmlChange?.(data);
        }
      },
      getHtmlContent: async () => {
        if (editorRef.current?.editor) {
          return editorRef.current.editor.getData();
        }
        return '';
      },
    }));

    return (
      <div className={styles.editor}>
        <CKEditor
          initData={htmlContent || ''}
          config={editorConfig}
          onInstanceReady={handleEditorReady}
          onChange={handleEditorChange}
          editorUrl="https://cdn.ckeditor.com/4.22.1/standard-all/ckeditor.js"
        />
      </div>
    );
  }
);

CKEditorClient.displayName = 'CKEditorClient';

export default CKEditorClient;

