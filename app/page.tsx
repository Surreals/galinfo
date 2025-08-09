import {AllNews, CategoryNews, ColumnNews, Hero} from "@/app/components";

export default function HomePage() {
  return (
    <>
      <Hero/>
      <CategoryNews category="СВІТ" />
      <ColumnNews category="ЕВРОПА" />
      <CategoryNews category="ЗДОРОВ'Я" />
      <ColumnNews category="КРИМІНАЛ" />
      <CategoryNews category="КУЛЬТУРА" />
      <AllNews />
    </>
  );
}