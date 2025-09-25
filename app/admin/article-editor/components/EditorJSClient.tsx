"use client";

import {useEffect, useImperativeHandle, useRef, forwardRef} from "react";
import type { OutputData } from "@editorjs/editorjs";
import type EditorJS from "@editorjs/editorjs";

import styles from "../NewsEditor.module.css";

export interface EditorJSClientRef {
  save: () => Promise<void>;
  getHtmlContent: () => Promise<string>;
}

type Props = {
  htmlContent?: string;
  onHtmlChange?: (html: string) => void;
  placeholder?: string;
  id?: string;
};


const EditorJSClient = forwardRef<EditorJSClientRef, Props>(({
                                         htmlContent,
                                         onHtmlChange,
                                         placeholder = "Start typing...",
                                       }, ref) => {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  // Перетворюємо HTML в блоки EditorJS (розбираємо <p> як paragraph, все інше як raw)
  const htmlToEditorJS = (html: string): OutputData => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || "", "text/html");
    const blocks: any[] = [];

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) blocks.push({ type: "paragraph", data: { text } });
      } else if (node.nodeName === "P") {
        // Залишаємо innerHTML всередині <p> (щоб зберегти <strong>, <a> і т.д.)
        blocks.push({ type: "paragraph", data: { text: (node as HTMLElement).innerHTML } });
      } else {
        // fallback — вбудовуємо як raw блок
        blocks.push({ type: "raw", data: { html: (node as HTMLElement).outerHTML } });
      }
    });

    if (blocks.length === 0) {
      blocks.push({ type: "paragraph", data: { text: "" } });
    }

    return { time: Date.now(), blocks };
  };

  // Збираємо HTML назад з блоків
  const editorJSToHtml = (data: OutputData): string =>
    (data.blocks ?? [])
      .map((b) =>
        b.type === "raw" && b.data?.html
          ? b.data.html
          : b.type === "paragraph"
            ? `<p>${b.data?.text ?? ""}</p>`
            : ""
      )
      .join("");


  // Якщо зовнішній htmlContent змінюється — замінюємо вміст редактора

  useEffect(() => {
    const init = async () => {
      if (!holderRef.current || editorRef.current) return;

      const { default: Editor } = await import("@editorjs/editorjs");
      const { default: Paragraph } = await import("@editorjs/paragraph");
      const { default: Raw } = await import("@editorjs/raw");

      const editor = new Editor({
        holder: 'editorjs',
        placeholder,
        tools: {
          paragraph: { class: Paragraph },
          raw: { class: Raw },
        },
      });

      editorRef.current = editor;

      await editor.isReady;

      // Рендеримо htmlContent тільки під час ініціалізації
      if (htmlContent) {
        const data = htmlToEditorJS(htmlContent);
        editor.blocks.clear();
        editor.render(data);
      }
    };

    init();

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []); // <- ПУСТИЙ масив залежностей, щоб init викликався один раз


  const handleSave = async () => {
    if (!editorRef.current) return;
    const saved = await editorRef.current.save();
    const html = editorJSToHtml(saved);
    console.log(3, html)
    onHtmlChange?.(html);
  };

  useImperativeHandle(ref, () => ({
    save: handleSave,
    getHtmlContent: async () => {
      if (editorRef.current) {
        try {
          const saved = await editorRef.current.save();
          return editorJSToHtml(saved);
        } catch {
          return '';
        }
      }
      return '';
    },
  }));


  return (
      <div ref={holderRef} id={'editorjs'} className={styles.editor} />
  );
});

EditorJSClient.displayName = 'EditorJSClient';

export default EditorJSClient;