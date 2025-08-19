'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import FontFamily from '@tiptap/extension-font-family';
import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight,
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      FontFamily,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Введіть URL посилання');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addImage = () => {
    const url = window.prompt('Введіть URL зображення');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addYouTube = () => {
    const url = window.prompt('Введіть URL YouTube відео');
    if (url) {
      // Extract video ID from YouTube URL
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      if (videoId) {
        const embedHtml = `<div class="youtube-embed"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
        editor.chain().focus().insertContent(embedHtml).run();
      }
    }
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  };

  const insertSource = () => {
    const source = window.prompt('Введіть джерело');
    if (source) {
      editor.chain().focus().insertContent(`<p><em>Джерело: ${source}</em></p>`).run();
    }
  };

  const toggleSubscript = () => {
    editor.chain().focus().toggleSubscript().run();
  };

  const toggleSuperscript = () => {
    editor.chain().focus().toggleSuperscript().run();
  };

  const removeFormat = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const printContent = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .youtube-embed { margin: 20px 0; }
            </style>
          </head>
          <body>${editor.getHTML()}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const showHelp = () => {
    alert('Довідка по редактору:\n\n- Використовуйте кнопки на панелі інструментів для форматування\n- Для посилань натисніть 🔗\n- Для зображень натисніть 🖼️\n- Для таблиць натисніть 📊');
  };

  return (
    <div className={`rich-text-editor ${className || ''}`}>
      {showToolbar && (
        <div className="toolbar">
          {/* Source and File Operations */}
          <div className="toolbar-group">
            <button
              onClick={insertSource}
              className="toolbar-button"
              title="Джерело"
            >
              📄
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(editor.getHTML())}
              className="toolbar-button"
              title="Копіювати"
            >
              📋
            </button>
            <button
              onClick={() => navigator.clipboard.readText().then(text => editor.chain().focus().insertContent(text).run())}
              className="toolbar-button"
              title="Вставити"
            >
              📥
            </button>
            <button
              onClick={() => editor.chain().focus().deleteSelection().run()}
              className="toolbar-button"
              title="Видалити"
            >
              ✂️
            </button>
            <button
              onClick={() => editor.chain().focus().undo().run()}
              className="toolbar-button"
              title="Відмінити"
            >
              ↩️
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              className="toolbar-button"
              title="Повторити"
            >
              ↪️
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Media and Tables */}
          <div className="toolbar-group">
            <button
              onClick={addImage}
              className="toolbar-button"
              title="Додати зображення"
            >
              🖼️
            </button>
            <button
              onClick={addTable}
              className="toolbar-button"
              title="Додати таблицю"
            >
              📊
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Links */}
          <div className="toolbar-group">
            <button
              onClick={addLink}
              className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
              title="Додати посилання"
            >
              🔗
            </button>
            <button
              onClick={removeLink}
              className="toolbar-button"
              title="Видалити посилання"
            >
              🔗❌
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Social Media */}
          <div className="toolbar-group">
            <button
              onClick={addYouTube}
              className="toolbar-button"
              title="Додати YouTube відео"
            >
              📺
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Lists */}
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
              title="Маркований список"
            >
              • List
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
              title="Нумерований список"
            >
              1. List
            </button>
            <button
              onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
              className="toolbar-button"
              title="Відступ"
            >
              ➡️
            </button>
            <button
              onClick={() => editor.chain().focus().liftListItem('listItem').run()}
              className="toolbar-button"
              title="Зменшити відступ"
            >
              ⬅️
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Alignment */}
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
              title="По лівому краю"
            >
              ←
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
              title="По центру"
            >
              ↔
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
              title="По правому краю"
            >
              →
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
              title="По ширині"
            >
              ↔↔
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Text Formatting */}
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
              title="Жирний"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
              title="Курсив"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
              title="Підкреслений"
            >
              <u>U</u>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
              title="Перекреслений"
            >
              <s>S</s>
            </button>
            <button
              onClick={toggleSubscript}
              className={`toolbar-button ${editor.isActive('subscript') ? 'active' : ''}`}
              title="Підрядковий"
            >
              X₂
            </button>
            <button
              onClick={toggleSuperscript}
              className={`toolbar-button ${editor.isActive('superscript') ? 'active' : ''}`}
              title="Надрядковий"
            >
              X²
            </button>
            <button
              onClick={removeFormat}
              className="toolbar-button"
              title="Очистити форматування"
            >
              Tx
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Format Dropdowns */}
          <div className="toolbar-group">
            <select
              onChange={(e) => {
                if (e.target.value === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
                else if (e.target.value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                else if (e.target.value === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
                else if (e.target.value === 'p') editor.chain().focus().setParagraph().run();
              }}
              className="toolbar-select"
              title="Формат"
            >
              <option value="p">Формат...</option>
              <option value="h1">Заголовок 1</option>
              <option value="h2">Заголовок 2</option>
              <option value="h3">Заголовок 3</option>
              <option value="p">Параграф</option>
            </select>

            <select
              onChange={(e) => {
                editor.chain().focus().setFontFamily(e.target.value).run();
              }}
              className="toolbar-select"
              title="Шрифт"
            >
              <option value="">Шрифт</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>

            <select
              onChange={(e) => {
                if (e.target.value === 'left') editor.chain().focus().setTextAlign('left').run();
                else if (e.target.value === 'center') editor.chain().focus().setTextAlign('center').run();
                else if (e.target.value === 'right') editor.chain().focus().setTextAlign('right').run();
                else if (e.target.value === 'justify') editor.chain().focus().setTextAlign('justify').run();
              }}
              className="toolbar-select"
              title="Параграф"
            >
              <option value="">Po...</option>
              <option value="left">По лівому краю</option>
              <option value="center">По центру</option>
              <option value="right">По правому краю</option>
              <option value="justify">По ширині</option>
            </select>
          </div>

          <div className="toolbar-divider" />

          {/* Colors */}
          <div className="toolbar-group">
            <div className="color-picker">
              <input
                type="color"
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
                title="Колір тексту"
              />
              <span className="color-label">A</span>
            </div>
            <div className="color-picker">
              <input
                type="color"
                onChange={(e) => setHighlight(e.target.value)}
                className="color-input"
                title="Колір фону"
              />
              <span className="color-label">A</span>
            </div>
          </div>

          <div className="toolbar-divider" />

          {/* View and Help */}
          <div className="toolbar-group">
            <button
              onClick={() => setShowToolbar(!showToolbar)}
              className="toolbar-button"
              title="Розгорнути/Згорнути"
            >
              {showToolbar ? '⬆️' : '⬇️'}
            </button>
            <button
              onClick={printContent}
              className="toolbar-button"
              title="Друкувати"
            >
              🖨️
            </button>
            <button
              onClick={showHelp}
              className="toolbar-button"
              title="Довідка"
            >
              ❓
            </button>
          </div>
        </div>
      )}

      <div className="editor-content">
        <EditorContent editor={editor} />
        {!value && (
          <div className="placeholder">
            {placeholder || 'Почніть писати ваш контент...'}
          </div>
        )}
      </div>
    </div>
  );
}
