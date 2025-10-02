import { CategoryPageClient } from "../[category]/CategoryPageClient";
import { getCategoryMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";

// Генерація метаданих для сторінки статей
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Статті - Гал-інфо",
    description: "Аналітичні статті, глибокі матеріали та ексклюзивні публікації від редакції Гал-інфо.",
    keywords: "статті, аналітика, публікації, ексклюзив, Гал-інфо",
    openGraph: {
      title: "Статті - Гал-інфо",
      description: "Аналітичні статті, глибокі матеріали та ексклюзивні публікації від редакції Гал-інфо.",
      type: "website",
    },
  };
}

export default function ArticlesPage() {
  return (
    <CategoryPageClient 
      category="articles"
    />
  );
}
