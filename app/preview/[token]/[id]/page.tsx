import { Metadata } from 'next';
import { PreviewPageClient } from './PreviewPageClient';

interface PreviewPageProps {
  params: Promise<{
    token: string;
    id: string;
  }>;
}

// Генерація метаданих для preview сторінки
// ВАЖЛИВО: Додаємо noindex, nofollow для захисту від індексації
export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  return {
    title: 'Preview - Попередній перегляд новини',
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        'max-video-preview': -1,
        'max-image-preview': 'none',
        'max-snippet': -1,
      },
    },
    // Додаткові мета-теги для запобігання індексації
    other: {
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
    },
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { token, id } = await params;
  const newsId = parseInt(id);

  // Перевіряємо валідність ID
  if (isNaN(newsId)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Невалідний ID новини</h2>
        <p>Посилання на preview містить некоректний ID.</p>
      </div>
    );
  }

  return (
    <>
      {/* Додаткові HTML meta теги для захисту від індексації */}
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      <meta name="googlebot" content="noindex, nofollow" />
      <meta name="bingbot" content="noindex, nofollow" />
      
      <PreviewPageClient token={token} id={newsId} />
    </>
  );
}

