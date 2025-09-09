import { CategoryPageClient } from "./CategoryPageClient";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  
  // Перевіряємо, чи існує category
  if (!category) {
    return <div>Категорія не знайдена</div>;
  }
  
  // Функція для генерації випадкових новин для NewsList
  const generateRandomNews = (count: number) => {
    const titles = [
      "Зеленський підписав новий закон",
      "В Україні прогнозують грози",
      "Трамп дав нове інтерв'ю",
      "На Львівщині відкрили парк",
      "Вчені винайшли новий велосипед",
      "Новий арт-проєкт у центрі Києва",
      "Економічні новини та аналітика",
      "Спортивні події та досягнення",
      "Культурні заходи та фестивалі",
      "Медичні новини та здоров'я",
    ];

    const articleIds = [
      "zelensky-new-law",
      "ukraine-thunderstorms",
      "trump-interview",
      "lviv-region-park",
      "scientists-bicycle",
      "kyiv-art-project",
      "economic-news",
      "sports-events",
      "cultural-events",
      "medical-news"
    ];

    return Array.from({ length: count }, (_, index) => ({
      id: `category-${index + 1}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      time: new Date(
        Date.now() - Math.floor(Math.random() * 1e8)
      ).toLocaleString("uk-UA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      imageUrl: `https://picsum.photos/seed/${Math.random()}/300/200`,
      url: `/article/${articleIds[Math.floor(Math.random() * articleIds.length)]}-${index + 1}`,
    }));
  };

  // Генеруємо дані для трьох колонок NewsList
  const newsData1 = generateRandomNews(8);
  const newsData2 = generateRandomNews(8);
  const newsData3 = generateRandomNews(8);

  return (
    <CategoryPageClient 
      category={category}
      newsData1={newsData1}
      newsData2={newsData2}
      newsData3={newsData3}
    />
  );
}
