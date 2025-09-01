import { Suspense } from 'react';
import NewsSearch from '@/app/components/NewsSearch/NewsSearch';

export default function SearchPage() {
  return (
    <div className="search-page">
      <Suspense fallback={<div>Завантаження пошуку...</div>}>
        <NewsSearch />
      </Suspense>
    </div>
  );
}
