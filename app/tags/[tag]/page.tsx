import { CategoryPageClient } from "@/app/[category]/CategoryPageClient";
import { getCategoryMetadata } from "@/lib/seo-utils";
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
  return await getCategoryMetadata(tag);
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
