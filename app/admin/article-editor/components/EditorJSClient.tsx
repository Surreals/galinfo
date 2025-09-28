"use client";

import {useEffect, useImperativeHandle, useRef, forwardRef} from "react";
import type {OutputData, ToolConstructable} from "@editorjs/editorjs";
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

    const walk = (node: ChildNode) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) blocks.push({ type: "paragraph", data: { text } });
        return;
      }

      if (node.nodeName === "P") {
        blocks.push({
          type: "paragraph",
          data: { text: (node as HTMLElement).innerHTML },
        });
        return;
      }

      if (node.nodeName === "UL" || node.nodeName === "OL") {
        const style = node.nodeName === "UL" ? "unordered" : "ordered";
        const items: string[] = [];
        node.childNodes.forEach((li) => {
          if (li.nodeName === "LI") {
            const inner = (li as HTMLElement).innerHTML.trim();
            items.push(inner);
          }
        });
        blocks.push({ type: "list", data: { style, items } });
        return;
      }

      // fallback
      blocks.push({ type: "raw", data: { html: (node as HTMLElement).outerHTML } });
    };

    doc.body.childNodes.forEach(walk);

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
      const { default: List } = await import("@editorjs/list");

      const editor = new Editor({
        holder: holderRef.current!,
        placeholder,
        tools: {
          paragraph: { class: Paragraph },
          raw: { class: Raw },
          list: { class: List as unknown as ToolConstructable, inlineToolbar: true },
        },
      });

      editorRef.current = editor;

      await editor.isReady;

      if (htmlContent) {
        const data = htmlToEditorJS(htmlContent);
        await editor.render(data);
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