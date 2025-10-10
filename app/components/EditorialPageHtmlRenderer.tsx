'use client';

import { BreadcrumbStructuredData } from '@/components/BreadcrumbStructuredData';
import styles from './EditorialPageHtmlRenderer.module.css';

interface EditorialPageHtmlRendererProps {
  htmlContent: string;
  breadcrumbs: Array<{ name: string; item: string }>;
}

export function EditorialPageHtmlRenderer({ htmlContent, breadcrumbs }: EditorialPageHtmlRendererProps) {
  return (
    <>
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      <div className={styles.container}>
        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </>
  );
}

