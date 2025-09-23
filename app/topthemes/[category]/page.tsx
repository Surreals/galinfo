import { CategoryPageClient } from "../../[category]/CategoryPageClient";
import { getCategoryMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";
import { executeQuery } from "@/app/lib/db";

interface TopThemesCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Генерація метаданих для спеціальної теми
export async function generateMetadata({ params }: TopThemesCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  return await getCategoryMetadata(category);
}

export default async function TopThemesCategoryPage({ params, searchParams }: TopThemesCategoryPageProps) {
  const { category } = await params;
  
  // Перевіряємо, чи існує category
  if (!category) {
    return <div>Спеціальна тема не знайдена</div>;
  }

  // Отримуємо дані з API спеціальних тем
  let specialThemesData = null;
  let error = null;

  try {
    // Спочатку отримуємо інформацію про всі спеціальні теми
    const [specialThemesResult] = await executeQuery<{
      id: number;
      param: string;
      title: string;
      cattype: number;
    }>(
      `SELECT id, param, title, cattype 
       FROM a_cats 
       WHERE cattype = 2 AND isvis = 1 AND lng = "1"
       ORDER BY id`
    );

    // Знаходимо поточну тему за параметром
    const currentTheme = specialThemesResult.find(theme => 
      theme.param === category || theme.param === `${category}-z`
    );

    if (currentTheme) {
      // Отримуємо новини для поточної теми
      const [newsResult] = await executeQuery<{
        id: number;
        ndate: string;
        ntime: string;
        ntype: number;
        images: string;
        urlkey: string;
        photo: number;
        video: number;
        comments: number;
        printsubheader: number;
        rubric: string;
        nweight: number;
        nheader: string;
        nsubheader: string;
        nteaser: string;
        comments_count: number;
        views_count: number;
      }>(
        `SELECT 
          a_news.id,
          a_news.ndate,
          a_news.ntime,
          a_news.ntype,
          a_news.images,
          a_news.urlkey,
          a_news.photo,
          a_news.video,
          a_news.comments,
          a_news.printsubheader,
          a_news.rubric,
          a_news.nweight,
          a_news_headers.nheader,
          a_news_headers.nsubheader,
          a_news_headers.nteaser,
          a_statcomm.qty as comments_count,
          a_statview.qty as views_count
         FROM a_news
         LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
         LEFT JOIN a_statcomm ON a_news.id = a_statcomm.id
         LEFT JOIN a_statview ON a_news.id = a_statview.id
         WHERE FIND_IN_SET(?, a_news.rubric) > 0
           AND a_news.approved = 1
           AND a_news.lang = "1"
           AND a_news.udate < UNIX_TIMESTAMP()
         ORDER BY a_news.udate DESC
         LIMIT 24`,
        [currentTheme.id]
      );

      specialThemesData = {
        theme: currentTheme,
        news: newsResult || []
      };
    }
  } catch (err) {
    console.error('Error fetching special themes data:', err);
    error = err instanceof Error ? err.message : 'Failed to fetch special themes data';
  }

  // Якщо є помилка або немає даних, показуємо повідомлення
  if (error || !specialThemesData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Спеціальна тема "{category}"</h1>
        {error ? (
          <p>Помилка завантаження: {error}</p>
        ) : (
          <p>Наразі немає новин для цієї спеціальної теми.</p>
        )}
      </div>
    );
  }

  // Якщо немає новин, показуємо повідомлення
  if (specialThemesData.news.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>{specialThemesData.theme.title}</h1>
        <p>Наразі немає новин для цієї спеціальної теми.</p>
        <p>Перевірте пізніше для отримання актуальних новин.</p>
      </div>
    );
  }

  // Розподіляємо новини на три колонки
  const newsPerColumn = Math.ceil(specialThemesData.news.length / 3);
  const newsData1 = specialThemesData.news.slice(0, newsPerColumn);
  const newsData2 = specialThemesData.news.slice(newsPerColumn, newsPerColumn * 2);
  const newsData3 = specialThemesData.news.slice(newsPerColumn * 2);

  return (
    <CategoryPageClient 
      category={category}
      newsData1={newsData1}
      newsData2={newsData2}
      newsData3={newsData3}
    />
  );
}
