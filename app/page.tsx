import {AllNews, CategoryNews, ColumnNews, Hero} from "@/app/components";

export default function HomePage() {
  return (
    <>
      <Hero/>
      <ColumnNews newsQuantity={4} smallImg={true} category="ПОЛІТИКА" showNewsList={true} />
      <CategoryNews category="СВІТ" />
      <ColumnNews newsQuantity={8} category="ЕВРОПА" showNewsList={true} />
      <CategoryNews category="ЗДОРОВ'Я" />
      <ColumnNews newsQuantity={8} category="КРИМІНАЛ" showNewsList={true} />
      <CategoryNews category="КУЛЬТУРА" />
      <AllNews />
    </>
  );
}