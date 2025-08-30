"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import styles from "../NewsEditor.module.css";

export default function NewsFullEditor() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      TextStyle,
      Color,
      Highlight,
      FontFamily,
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "<p>Введіть текст новини...</p>",
  });

  if (!editor) return null;

  return (
    <div className={styles.editorWrapperSecond}>
      <div className={styles.toolbar}>
        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
        <button onClick={() => editor.chain().focus().toggleSuperscript().run()}>x²</button>
        <button onClick={() => editor.chain().focus().toggleSubscript().run()}>x₂</button>

        <button onClick={() => editor.chain().focus().setTextAlign("left").run()}>⯇</button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()}>≡</button>
        <button onClick={() => editor.chain().focus().setTextAlign("right").run()}>⯈</button>
        <button onClick={() => editor.chain().focus().setTextAlign("justify").run()}>≋</button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• list</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. list</button>

        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝ ❞</button>
        <button onClick={() => editor.chain().focus().setCodeBlock().run()}>{"</>"}</button>
        <button onClick={() => editor.chain().focus().undo().run()}>↶</button>
        <button onClick={() => editor.chain().focus().redo().run()}>↷</button>

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setImage({ src: prompt("Вставте URL картинки") || "" })
              .run()
          }
        >
          🖼
        </button>
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setLink({ href: prompt("Вставте URL посилання") || "" })
              .run()
          }
        >
          🔗
        </button>
      </div>

      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
