'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ClientOnly from '../../components/ClientOnly';
import NewsEditorHeader from "@/app/admin/test-editor/components/NewsEditorHeader";
import NewsEditorSidebar from "@/app/admin/test-editor/components/NewsEditorSidebar";
import NewsEditor from "@/app/admin/test-editor/components/NewsEditor";
import NewsFullEditor from "@/app/admin/test-editor/components/NewsEditorTipTap";

// Dynamically import the TipTap editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function TestEditor() {


  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '24px' }}>
      <NewsEditorHeader/>
      <NewsEditorSidebar/>
      {/*<NewsFullEditor/>*/}
    </div>
  );
}
