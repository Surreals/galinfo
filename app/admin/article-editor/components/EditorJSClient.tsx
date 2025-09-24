/// <reference path="../types/editorjs.d.ts" />
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import throttle from "lodash.throttle";
import styles from "../NewsEditor.module.css";

export type EditorJSClientProps = {
  /** Initial content */
  data?: OutputData;
  /** HTML content to convert to EditorJS format */
  htmlContent?: string;
  /** Fired on every (throttled) content change */
  onChange?: (data: OutputData) => void;
  /** Fired when HTML content changes (for nbody field) */
  onHtmlChange?: (html: string) => void;
  /** Readonly mode */
  readOnly?: boolean;
  /** Placeholder shown in empty paragraph */
  placeholder?: string;
  /** Optional id for the holder div; useful if you render several editors on a page */
  id?: string;
};

export default function EditorJSClient({htmlContent,
                                         onHtmlChange,
                                         placeholder,
                                         id = "editorjs-holder",
                                       }: EditorJSClientProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Helper function to convert HTML to EditorJS format
  const htmlToEditorJS = (html: string): OutputData => {
    if (!html || html.trim() === '') {
      return {
        time: Date.now(),
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: ''
            }
          }
        ]
      };
    }

    // Try to parse HTML and convert to EditorJS blocks
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const blocks: any[] = [];

      // Process each element
      const processElement = (element: Element) => {
        const tagName = element.tagName.toLowerCase();

        switch (tagName) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            blocks.push({
              type: 'header',
              data: {
                text: element.textContent || '',
                level: parseInt(tagName.charAt(1))
              }
            });
            break;
          case 'p':
            if (element.textContent?.trim()) {
              blocks.push({
                type: 'paragraph',
                data: {
                  text: element.textContent
                }
              });
            }
            break;
          case 'ul':
          case 'ol':
            const items = Array.from(element.querySelectorAll('li')).map(li => li.textContent || '');
            blocks.push({
              type: 'list',
              data: {
                style: tagName === 'ol' ? 'ordered' : 'unordered',
                items: items
              }
            });
            break;
          case 'blockquote':
            blocks.push({
              type: 'quote',
              data: {
                text: element.textContent || '',
                caption: ''
              }
            });
            break;
          default:
            // For other elements, wrap in raw HTML
            blocks.push({
              type: 'raw',
              data: {
                html: element.outerHTML
              }
            });
        }
      };

      // Process all direct children
      Array.from(doc.body.children).forEach(processElement);

      // If no blocks were created, create a paragraph with the HTML
      if (blocks.length === 0) {
        blocks.push({
          type: 'raw',
          data: {
            html: html
          }
        });
      }

      return {
        time: Date.now(),
        blocks: blocks
      };
    } catch (error) {
      console.warn('Failed to parse HTML, using raw block:', error);
      // Fallback: wrap HTML in a raw block
      return {
        time: Date.now(),
        blocks: [
          {
            type: 'raw',
            data: {
              html: html
            }
          }
        ]
      };
    }
  };

  // Helper function to convert EditorJS data to HTML
  const editorJSToHtml = (data: OutputData): string => {
    if (!data || !data.blocks || data.blocks.length === 0) {
      return '';
    }

    // If we have a raw block with HTML, return that
    const rawBlock = data.blocks.find(block => block.type === 'raw');
    if (rawBlock && rawBlock.data?.html) {
      return rawBlock.data.html;
    }

    // Otherwise, convert blocks to HTML
    return data.blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.data?.text || ''}</p>`;
        case 'header':
          const level = block.data?.level || 2;
          return `<h${level}>${block.data?.text || ''}</h${level}>`;
        case 'list':
          const listType = block.data?.style === 'ordered' ? 'ol' : 'ul';
          const items = block.data?.items?.map((item: any) => `<li>${item}</li>`).join('') || '';
          return `<${listType}>${items}</${listType}>`;
        case 'quote':
          return `<blockquote>${block.data?.text || ''}</blockquote>`;
        case 'code':
          return `<pre><code>${block.data?.code || ''}</code></pre>`;
        case 'checklist':
          const checklistItems = block.data?.items?.map((item: any) =>
            `<li><input type="checkbox" ${item.checked ? 'checked' : ''} disabled> ${item.text}</li>`
          ).join('') || '';
          return `<ul class="checklist">${checklistItems}</ul>`;
        case 'table':
          const tableData = block.data?.content || [];
          const tableRows = tableData.map((row: any[]) =>
            `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
          ).join('');
          return `<table><tbody>${tableRows}</tbody></table>`;
        case 'image':
          return `<img src="${block.data?.file?.url || block.data?.url || ''}" alt="${block.data?.caption || ''}" />`;
        case 'embed':
          return `<div class="embed">${block.data?.html || ''}</div>`;
        case 'delimiter':
          return '<hr>';
        case 'warning':
          return `<div class="warning"><strong>${block.data?.title || 'Warning'}:</strong> ${block.data?.message || ''}</div>`;
        case 'alert':
          return `<div class="alert alert-${block.data?.type || 'info'}">${block.data?.message || ''}</div>`;
        default:
          // For unknown block types, try to render as HTML or fallback to text
          if (block.data?.html) {
            return block.data.html;
          }
          return `<p>${JSON.stringify(block.data)}</p>`;
      }
    }).join('');
  };

  const initEditor = useCallback(async () => {
    if (editorRef.current) return;
    if (typeof window === "undefined") return;
    if (!holderRef.current) return;

    const [
      { default: Editor },
      Header,
      List,
      Table,
      Checklist,
      InlineCode,
      Quote,
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

    try {
      const editor = new Editor({
        holder: holderRef.current,
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
        setIsInitialized(true);
        setInitError(null);
      },
      data: (htmlContent ? htmlToEditorJS(htmlContent) : undefined),
      onChange: throttle(async () => {

        // Also call onHtmlChange if provided
        const saved = '<div>ddd</div>'

        if (onHtmlChange) {
          const html = editorJSToHtml(saved);
          onHtmlChange(html);
        }
      }, 500),
    });

    editorRef.current = editor;
    } catch (error) {
      console.error('Failed to initialize Editor.js:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to initialize editor');
    }
  }, [htmlContent, onHtmlChange, placeholder]);

  useEffect(() => {
    // Add a small delay to ensure the DOM element is mounted
    const timer = setTimeout(() => {
      initEditor();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (editorRef.current && (editorRef.current as any).destroy) {
        (editorRef.current as any).destroy();
      }
      editorRef.current = null;
    };
  }, [initEditor]);

  if (initError) {
    return (
      <div className={styles.editorJSClient}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#ff4d4f' }}>
          <p>Помилка ініціалізації редактора: {initError}</p>
          <button
            onClick={() => {
              setInitError(null);
              setIsInitialized(false);
              initEditor();
            }}
            style={{
              padding: '8px 16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={holderRef} id={id} className={styles.editorJSClient}>
      {!isInitialized && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Завантаження редактора...
        </div>
      )}
    </div>
  );
}
