'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
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
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  };

  return (
    <div className={`rich-text-editor ${className || ''}`}>
      {showToolbar && (
        <div className="toolbar border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
            title="Strike"
          >
            <s>S</s>
          </button>

          <div className="toolbar-divider" />

          {/* Headings */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            title="Heading 3"
          >
            H3
          </button>

          <div className="toolbar-divider" />

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet List"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered List"
          >
            1. List
          </button>

          <div className="toolbar-divider" />

          {/* Alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="Align Left"
          >
            ←
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="Align Center"
          >
            ↔
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="Align Right"
          >
            →
          </button>

          <div className="toolbar-divider" />

          {/* Links and Media */}
          <button
            onClick={addLink}
            className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
            title="Add Link"
          >
            🔗
          </button>
          <button
            onClick={addImage}
            className="toolbar-button"
            title="Add Image"
          >
            🖼️
          </button>

          <div className="toolbar-divider" />

          {/* Colors */}
          <div className="color-picker">
            <input
              type="color"
              onChange={(e) => setColor(e.target.value)}
              className="color-input"
              title="Text Color"
            />
          </div>
          <div className="color-picker">
            <input
              type="color"
              onChange={(e) => setHighlight(e.target.value)}
              className="color-input"
              title="Highlight Color"
            />
          </div>

          <div className="toolbar-divider" />

          {/* Clear Formatting */}
          <button
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            className="toolbar-button"
            title="Clear Formatting"
          >
            🧹
          </button>

          {/* Toggle Toolbar */}
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            className="toolbar-button ml-auto"
            title="Toggle Toolbar"
          >
            {showToolbar ? '⬆️' : '⬇️'}
          </button>
        </div>
      )}

      <div className="editor-content border border-gray-300 rounded-b-lg p-4 min-h-[300px] focus-within:ring-2 focus-within:ring-blue-500">
        <EditorContent editor={editor} />
        {!value && (
          <div className="placeholder text-gray-400 pointer-events-none">
            {placeholder || 'Start writing your content...'}
          </div>
        )}
      </div>
    </div>
  );
}
