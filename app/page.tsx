import {AllNews, CategoryNews, ColumnNews, Hero} from "@/app/components";

export default function HomePage() {
  return (
    <>
      <Hero/>
      <ColumnNews newsQuantity={4} smallImg={true} category="ПОЛІТИКА" isHomePage={true} />
      <CategoryNews category="СВІТ" />
      <ColumnNews newsQuantity={8} category="ЕВРОПА" isHomePage={true} />
      <CategoryNews category="ЗДОРОВ'Я" />
      <ColumnNews newsQuantity={8} category="КРИМІНАЛ" isHomePage={true} />
      <CategoryNews category="КУЛЬТУРА" />
      <AllNews />
    </>
  );
}