/// <reference path="../types/editorjs.d.ts" />
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
      Code,
      Delimiter,
      Embed,
      Link,
      Marker,
      NestedList,
      Paragraph,
      Raw,
      SimpleImage,
      Warning,
      Underline,
      Attaches,
      Alert,
      TextColorPlugin,
      TextAlignmentTool,
      Button,
      Carousel,
      Latex,
      Mermaid,
    ] = await Promise.all([
      import("@editorjs/editorjs"),
      import("@editorjs/header"),
      import("@editorjs/list"),
      import("@editorjs/table"),
      import("@editorjs/checklist"),
      import("@editorjs/inline-code"),
      import("@editorjs/quote"),
      import("@editorjs/image"),
      import("@editorjs/code"),
      import("@editorjs/delimiter"),
      import("@editorjs/embed"),
      import("@editorjs/link"),
      import("@editorjs/marker"),
      import("@editorjs/nested-list"),
      import("@editorjs/paragraph"),
      import("@editorjs/raw"),
      import("@editorjs/simple-image"),
      import("@editorjs/warning"),
      import("@editorjs/underline"),
      import("@editorjs/attaches"),
      import("editorjs-alert"),
      import("editorjs-text-color-plugin"),
      import("editorjs-text-alignment-tool"),
      import("editorjs-button"),
      import("editorjs-carousel"),
      import("editorjs-latex"),
      import("editorjs-mermaid"),
    ]);

    const editor = new Editor({
      holder: holderRef.current!,
      readOnly,
      placeholder,
      minHeight: 50,
      inlineToolbar: ['bold', 'italic', 'underline', 'marker', 'inlineCode', 'link', 'textColor', 'textAlignment'],
      autofocus: true,
      logLevel: 'ERROR' as any,
      i18n: {
        messages: {
          toolNames: {
            'Text': 'Text',
            'Heading': 'Heading',
            'List': 'List',
            'Nested List': 'Nested List',
            'Checklist': 'Checklist',
            'Quote': 'Quote',
            'Code': 'Code',
            'Inline Code': 'Inline Code',
            'Marker': 'Marker',
            'Underline': 'Underline',
            'Image': 'Image',
            'Simple Image': 'Simple Image',
            'Embed': 'Embed',
            'Link': 'Link',
            'Attaches': 'Attaches',
            'Table': 'Table',
            'Delimiter': 'Delimiter',
            'Warning': 'Warning',
            'Raw': 'Raw HTML',
            'Alert': 'Alert',
            'Text Color': 'Text Color',
            'Text Alignment': 'Text Alignment',
            'Button': 'Button',
            'Carousel': 'Carousel',
            'LaTeX': 'LaTeX Formula',
            'Mermaid': 'Mermaid Diagram',
          }
        }
      },
      tools: {
        // Text formatting tools
        header: {
          class: (Header as any).default ?? (Header as any),
          inlineToolbar: true,
          config: { levels: [1, 2, 3, 4, 5, 6], defaultLevel: 2 },
        },
        paragraph: {
          class: (Paragraph as any).default ?? (Paragraph as any),
          inlineToolbar: true,
        },
        list: { 
          class: (List as any).default ?? (List as any), 
          inlineToolbar: true 
        },
        nestedList: { 
          class: (NestedList as any).default ?? (NestedList as any), 
          inlineToolbar: true 
        },
        checklist: { 
          class: (Checklist as any).default ?? (Checklist as any),
          inlineToolbar: true 
        },
        quote: { 
          class: (Quote as any).default ?? (Quote as any),
          inlineToolbar: true 
        },
        
        // Code and formatting
        code: {
          class: (Code as any).default ?? (Code as any),
          config: {
            placeholder: 'Enter code...',
          }
        },
        inlineCode: { 
          class: (InlineCode as any).default ?? (InlineCode as any) 
        },
        marker: {
          class: (Marker as any).default ?? (Marker as any),
        },
        underline: {
          class: (Underline as any).default ?? (Underline as any),
        },
        
        // Media and embeds
        image: {
          class: (ImageTool as any).default ?? (ImageTool as any),
          config: {
            uploader: {
              uploadByUrl: async (url: string) => ({ success: 1, file: { url } }),
            },
          },
        },
        simpleImage: {
          class: (SimpleImage as any).default ?? (SimpleImage as any),
        },
        embed: {
          class: (Embed as any).default ?? (Embed as any),
          config: {
            services: {
              youtube: true,
              codepen: true,
              instagram: true,
              twitter: true,
              github: true,
            }
          }
        },
        
        // Links and attachments
        link: {
          class: (Link as any).default ?? (Link as any),
          config: {
            endpoint: '/api/link-preview', // You can implement this endpoint
          }
        },
        attaches: {
          class: (Attaches as any).default ?? (Attaches as any),
          config: {
            endpoint: '/api/upload-file', // You can implement this endpoint
          }
        },
        
        // Layout and structure
        table: { 
          class: (Table as any).default ?? (Table as any),
          inlineToolbar: true 
        },
        delimiter: {
          class: (Delimiter as any).default ?? (Delimiter as any),
        },
        warning: {
          class: (Warning as any).default ?? (Warning as any),
          inlineToolbar: true,
          config: {
            titlePlaceholder: 'Title',
            messagePlaceholder: 'Message',
          }
        },
        
        // Raw HTML
        raw: {
          class: (Raw as any).default ?? (Raw as any),
        },
        
        // Advanced tools
        alert: {
          class: (Alert as any).default ?? (Alert as any),
          inlineToolbar: true,
          config: {
            defaultType: 'info',
            messagePlaceholder: 'Enter your message',
          }
        },
        textColor: {
          class: (TextColorPlugin as any).default ?? (TextColorPlugin as any),
        },
        textAlignment: {
          class: (TextAlignmentTool as any).default ?? (TextAlignmentTool as any),
        },
        button: {
          class: (Button as any).default ?? (Button as any),
          config: {
            text: 'Click me',
            link: '#',
            target: '_blank',
          }
        },
        carousel: {
          class: (Carousel as any).default ?? (Carousel as any),
          config: {
            slides: [],
          }
        },
        latex: {
          class: (Latex as any).default ?? (Latex as any),
          config: {
            placeholder: 'Enter LaTeX formula...',
          }
        },
        mermaid: {
          class: (Mermaid as any).default ?? (Mermaid as any),
          config: {
            placeholder: 'Enter Mermaid diagram code...',
          }
        },
      },
      // Additional configuration
      onReady: () => {
        console.log('Editor.js is ready to work!');
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
