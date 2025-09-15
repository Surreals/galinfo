import { ArticlePageClient } from "./ArticlePageClient";
import { SearchOutlined } from "@ant-design/icons";

import styles from "./page.module.css";

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
