"use client";

import { useEffect, useRef, useCallback } from "react";
import type EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import throttle from "lodash.throttle";
import styles from "../NewsEditor.module.css";

export type EditorJSClientProps = {
  /** Initial content */
  data?: OutputData;
  /** Fired on every (throttled) content change */
  onChange?: (data: OutputData) => void;
  /** Readonly mode */
  readOnly?: boolean;
  /** Placeholder shown in empty paragraph */
  placeholder?: string;
  /** Optional id for the holder div; useful if you render several editors on a page */
  id?: string;
};

export default function EditorJSClient({
                                         data,
                                         onChange,
                                         readOnly,
                                         placeholder = "Введіть текст…",
                                         id = "editorjs-holder",
                                       }: EditorJSClientProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  const initEditor = useCallback(async () => {
    if (editorRef.current) return;
    if (typeof window === "undefined") return;

    const [
      { default: Editor },
      Header,
      List,
      Table,
      Checklist,
      InlineCode,
      Quote,
      ImageTool,
    ] = await Promise.all([
      import("@editorjs/editorjs"),
      import("@editorjs/header"),
      import("@editorjs/list"),
      import("@editorjs/table"),
      import("@editorjs/checklist"),
      import("@editorjs/inline-code"),
      import("@editorjs/quote"),
      import("@editorjs/image"),
    ]);

    const editor = new Editor({
      holder: holderRef.current!,
      readOnly,
      placeholder,
      minHeight: 50,
      inlineToolbar: true,
      autofocus: true,
      tools: {
        header: {
          class: (Header as any).default ?? (Header as any),
          inlineToolbar: true,
          config: { levels: [2, 3, 4], defaultLevel: 2 },
        },
        list: { class: (List as any).default ?? (List as any), inlineToolbar: true },
        table: { class: (Table as any).default ?? (Table as any) },
        checklist: { class: (Checklist as any).default ?? (Checklist as any) },
        inlineCode: { class: (InlineCode as any).default ?? (InlineCode as any) },
        quote: { class: (Quote as any).default ?? (Quote as any) },
        image: {
          class: (ImageTool as any).default ?? (ImageTool as any),
          config: {
            uploader: {
              uploadByUrl: async (url: string) => ({ success: 1, file: { url } }),
            },
          },
        },
      },
      data,
      onChange: throttle(async () => {
        if (!editorRef.current) return;
        const saved = await editorRef.current.save();
        onChange?.(saved);
      }, 500),
    });

    editorRef.current = editor;
  }, [data, onChange, placeholder, readOnly]);

  useEffect(() => {
    initEditor();
    return () => {
      if (editorRef.current && (editorRef.current as any).destroy) {
        (editorRef.current as any).destroy();
      }
      editorRef.current = null;
    };
  }, [initEditor]);

  return <div ref={holderRef} id={id} className={styles.editorJSClient} />;
}
