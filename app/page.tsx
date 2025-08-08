import { AllNews, CategoryNews, ColumnNews } from "@/app/components";

export default function HomePage() {
  return (
    <>
      <CategoryNews category="СВІТ" />
      <ColumnNews category="ЕВРОПА" />
      <CategoryNews category="ЗДОРОВ'Я" />
      <ColumnNews category="КРИМІНАЛ" />
      <CategoryNews category="КУЛЬТУРА" />
      <AllNews />
    </>
  );
}