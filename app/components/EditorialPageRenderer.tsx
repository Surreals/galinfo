'use client';

import { BreadcrumbStructuredData } from '@/components/BreadcrumbStructuredData';

interface EditorialPageData {
  pageTitle: string;
  ageWarning?: string;
  sections: Array<{
    id: string;
    title: string;
    content: (string | {
      type: 'contact' | 'address' | 'list';
      phone?: string;
      email?: string;
      message?: string;
      title?: string;
      lines?: string[];
      items?: string[];
    })[];
  }>;
}

interface EditorialPageRendererProps {
  data: EditorialPageData;
  breadcrumbs: Array<{ name: string; item: string }>;
}

export function EditorialPageRenderer({ data, breadcrumbs }: EditorialPageRendererProps) {
  const renderContent = (content: any, index: number) => {
    if (typeof content === 'string') {
      return (
        <p key={index} className="mb-4">
          {content}
        </p>
      );
    }

    switch (content.type) {
      case 'contact':
        return (
          <div key={index} className="mb-4">
            {content.message && <p className="mb-2">{content.message}</p>}
            {content.phone && (
              <p className="mb-2">
                <strong>Телефон редакції:</strong> {content.phone}
              </p>
            )}
            {content.email && (
              <p className="mb-6">
                <strong>e-mail:</strong> {content.email}
              </p>
            )}
          </div>
        );

      case 'address':
        return (
          <div key={index} className="mb-6">
            {content.title && (
              <h3 className="text-xl font-semibold mt-6 mb-2">{content.title}</h3>
            )}
            {content.lines?.map((line: string, lineIndex: number) => (
              <p key={lineIndex} className="mb-1">
                {line}
              </p>
            ))}
          </div>
        );

      case 'list':
        return (
          <div key={index} className="mb-4">
            <ul className="list-disc pl-6 space-y-1">
              {content.items?.map((item: string, itemIndex: number) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </div>
        );

      default:
        return (
          <div key={index} className="mb-4">
            <p>{JSON.stringify(content)}</p>
          </div>
        );
    }
  };

  return (
    <>
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{data.pageTitle}</h1>
        
        {data.ageWarning && (
          <div className="prose prose-lg">
            <p className="mb-6"><strong>{data.ageWarning}</strong></p>
          </div>
        )}

        <div className="prose prose-lg">
          {data.sections.map((section) => (
            <div key={section.id}>
              <h2 className="text-2xl font-semibold mt-6 mb-4">{section.title}</h2>
              {section.content.map((content, index) => renderContent(content, index))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
