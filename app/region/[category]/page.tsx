import { CategoryPageClient } from "../../[category]/CategoryPageClient";
import { getCategoryMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";

interface RegionCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Генерація метаданих для регіональної категорії
export async function generateMetadata({ params }: RegionCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  return await getCategoryMetadata(category);
}

export default async function RegionCategoryPage({ params, searchParams }: RegionCategoryPageProps) {
  const { category } = await params;
  
  // Перевіряємо, чи існує category
  if (!category) {
    return <div>Регіональна категорія не знайдена</div>;
  }
  


  return (
    <CategoryPageClient 
      category={category}
    />
  );
}
