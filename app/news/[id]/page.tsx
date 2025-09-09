import { ArticlePageClient } from "./ArticlePageClient";

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const { id: urlParams } = await params;
  const lastDashIndex = urlParams.lastIndexOf("_");

  const urlkey = urlParams.substring(0, lastDashIndex);
  const id = +(urlParams.substring(lastDashIndex + 1));

  // Перевіряємо, чи існує id
  if (!urlParams) {
    return <div>Новина не знайдена</div>;
  }


  return (
    <ArticlePageClient
      urlkey={urlkey}
      id={id}
    />
  );
}
