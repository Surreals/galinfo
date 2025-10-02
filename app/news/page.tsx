import { CategoryPageClient } from "../[category]/CategoryPageClient";
import { getCategoryMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";

// Генерація метаданих для сторінки новин
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Новини - Гал-інфо",
    description: "Останні новини з Львова та України. Актуальні події, політика, економіка, культура та інше.",
    keywords: "новини, Львів, Україна, актуальні події, політика, економіка",
    openGraph: {
      title: "Новини - Гал-інфо",
      description: "Останні новини з Львова та України. Актуальні події, політика, економіка, культура та інше.",
      type: "website",
    },
  };
}

export default function NewsPage() {
  return (
    <CategoryPageClient 
      category="news"
    />
  );
}
