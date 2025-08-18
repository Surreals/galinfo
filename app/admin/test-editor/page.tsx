'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ClientOnly from '../../components/ClientOnly';

// Dynamically import the TipTap editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function TestEditor() {
  const [content, setContent] = useState('');

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Test News Editor</h1>
      <p>This page tests the TipTap rich text editor integration.</p>
      
      <ClientOnly fallback={<p>Loading editor...</p>}>
        <div style={{ margin: '2rem 0' }}>
          <h2>TipTap Rich Text Editor</h2>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your content here..."
          />
        </div>

        <div style={{ margin: '2rem 0' }}>
          <h2>Content Preview</h2>
          <div 
            style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              minHeight: '200px'
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        <div style={{ margin: '2rem 0' }}>
          <h2>Raw HTML</h2>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {content}
          </pre>
        </div>
      </ClientOnly>
    </div>
  );
}
