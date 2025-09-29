import { CategoryPageClient } from "@/app/[category]/CategoryPageClient";
import { Metadata } from "next";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Генерація метаданих для тегу
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag || '').trim();

  const title = decodedTag ? `${decodedTag} | Гал-Інфо` : 'Тег | Гал-Інфо';
  const description = decodedTag
    ? `Новини за тегом "${decodedTag}" від агенції інформації та аналітики "Гал-Інфо".`
    : 'Новини за тегами від агенції інформації та аналітики "Гал-Інфо".';
  const canonical = decodedTag
    ? `https://galinfo.com.ua/tags/${encodeURIComponent(decodedTag)}`
    : `https://galinfo.com.ua/tags`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Гал-Інфо',
      locale: 'uk_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical,
    },
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  
  // Перевіряємо, чи існує tag
  if (!tag) {
    return <div>Тег не знайдено</div>;
  }
  
  // Використовуємо CategoryPageClient, який вже вміє обробляти теги
  return (
    <CategoryPageClient 
      category={tag}
    />
  );
}
