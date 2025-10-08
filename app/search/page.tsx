'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchPageContent from './SearchPageContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Завантаження пошуку...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
