import { ArticlePageClient } from "./ArticlePageClient";
import { getNewsMetadata } from "@/lib/seo-utils";
import { SearchOutlined } from "@ant-design/icons";
import { Metadata } from "next";

import styles from "./page.module.css";

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Генерація метаданих для новини
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id: urlParams } = await params;


  const lastDashIndex = urlParams.lastIndexOf("_");
  console.log('AAAA',lastDashIndex);
  if (lastDashIndex === -1) {
    return {
      title: 'Новина не знайдена | Гал-Інфо',
      description: 'Запитана новина не існує або була видалена',
    };
  }

  const urlkey = urlParams.substring(0, lastDashIndex);
  const id = +(urlParams.substring(lastDashIndex + 1));

  return await getNewsMetadata(urlkey, id);
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const { id:url } = await params;
  const urlParams = url.replace(/\.html$/i, "");
  const lastDashIndex = urlParams.lastIndexOf("_");

  const urlkey = urlParams.substring(0, lastDashIndex);
  const id = +(urlParams.substring(lastDashIndex + 1));

  // Перевіряємо, чи існує id
  if (!urlParams) {
    return <div className={styles.wrapper}>
          <SearchOutlined className={styles.icon}/>
          <h2 className={styles.title}>Новина не знайдена</h2>
          <p className={styles.description}>
            Схоже, що цієї новини більше немає або її видалили.
          </p>
        </div>
  }


  return (
    <ArticlePageClient
      urlkey={urlkey}
      id={id}
    />
  );
}
