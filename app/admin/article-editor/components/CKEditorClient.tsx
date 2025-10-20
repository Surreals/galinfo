"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef, useState } from "react";
import { CKEditor } from "ckeditor4-react";
import VideoWidget from "./VideoWidget";

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
    const [existingVideos, setExistingVideos] = useState<any[]>([]);

    // CKEditor 4 конфігурація з локальними файлами
    const editorConfig = {
      // Використовуємо локальний CKEditor
      editorUrl: '/ckeditor/ckeditor.js',
      placeholder: placeholder,
      language: 'uk',
      // Вимикаємо попередження про оновлення до LTS (комерційної) версії
      versionCheck: false,
      
      // Toolbar Groups конфігурація (адаптована з config.js)
      toolbarGroups: [
        { name: 'correction', groups: [ 'correction' ] },
        { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
        { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
        { name: 'forms', groups: [ 'forms' ] },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
        { name: 'links', groups: [ 'links' ] },
        { name: 'insert', groups: [ 'insert' ] },
        { name: 'emoji', groups: [ 'emoji' ] },
        { name: 'styles', groups: [ 'styles' ] },
        { name: 'colors', groups: [ 'colors' ] },
        { name: 'tools', groups: [ 'tools' ] },
        { name: 'others', groups: [ 'others' ] },
        { name: 'about', groups: [ 'about' ] }
      ],
      
      // Видаляємо непотрібні кнопки
      removeButtons: 'Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,HiddenField,CopyFormatting,CreateDiv,BidiLtr,BidiRtl,Language,Styles,Font,Save,NewPage,Templates,PasteFromWord,ExportPdf,ImageButton',
      
      // Додаткові плагіни
      extraPlugins: 'iframe,font,colorbutton,justify,autocorrect,insertvariable,nofollow',
      
      // Видаляємо плагіни
      removePlugins: 'exportpdf,elementspath',
      
      // Форматування блоків
      format_tags: 'p;h1;h2;h3;pre',
      
      // Налаштування для офіційного плагіна autogrow
      autoGrow_minHeight: 200,
      autoGrow_maxHeight: 800,
      autoGrow_bottomSpace: 50,
      autoGrow_onStartup: true,
      
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
      
      resize_enabled: true,
      
      // Стилі для редактора - використовуємо локальний файл
      contentsCss: [
        '/ckeditor/contents.css',
      ],
      
      // Налаштування для autocorrect
      autocorrect: {
        rulesPath: '/ckeditor/plugins/autocorrect/rules.json'
      },
    };

    // Обробник зміни контенту
    const handleEditorChange = (event: any) => {
      if (editorRef.current) {
        const data = editorRef.current.editor.getData();
        onHtmlChange?.(data);
      }
    };

    // Завантажуємо існуючі відео при ініціалізації
    useEffect(() => {
      fetchExistingVideos();
    }, []);

    // Функція для завантаження існуючих відео
    const fetchExistingVideos = async () => {
      try {
        const response = await fetch('/api/admin/videos?limit=50&video_type=news');
        const data = await response.json();
        if (data.videos) {
          setExistingVideos(data.videos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    // Функція для завантаження відео файлу
    const handleVideoUpload = async (file: File, title: string, description?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('video_type', 'news');

      const response = await fetch('/api/admin/videos/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        return result.video;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    };

    // Функція для вставки відео по URL
    const handleVideoUrlInsert = async (url: string, title: string, description?: string) => {
      const response = await fetch('/api/admin/videos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, title, description, video_type: 'news' }),
      });

      const result = await response.json();
      if (result.success) {
        return result.video;
      } else {
        throw new Error(result.error || 'URL insert failed');
      }
    };

    // Функція для вставки відео в редактор
    const handleVideoSelect = (video: any) => {
      if (editorRef.current?.editor) {
        const editor = editorRef.current.editor;
        
        // Створюємо HTML для відео
        const videoHtml = `
          <div class="video-block" data-url="${video.url}" data-caption="${video.title || ''}">
            <video controls style="max-width: 100%; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <source src="${video.url}" type="video/mp4">
              <source src="${video.url}" type="video/webm">
              <source src="${video.url}" type="video/ogg">
              Ваш браузер не підтримує відео тег.
            </video>
            ${video.title ? `<div class="video-caption" style="text-align: center; margin-top: 8px; font-style: italic; color: #666;">${video.title}</div>` : ''}
          </div>
        `;
        
        // Вставляємо відео в редактор
        editor.insertHtml(videoHtml);
        
        // Оновлюємо контент
        const newContent = editor.getData();
        onHtmlChange?.(newContent);
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
        {/* <div className={styles.editorToolbar}>
          <VideoWidget
            onVideoSelect={handleVideoSelect}
            onVideoUpload={handleVideoUpload}
            onVideoUrlInsert={handleVideoUrlInsert}
            existingVideos={existingVideos}
          />
        </div> */}
        <CKEditor
          initData={htmlContent || ''}
          config={editorConfig}
          onInstanceReady={handleEditorReady}
          onChange={handleEditorChange}
          editorUrl="/ckeditor/ckeditor.js"
        />
      </div>
    );
  }
);

CKEditorClient.displayName = 'CKEditorClient';

export default CKEditorClient;

