import { AllNews, CategoryNews } from "@/app/components";

export default function HomePage() {
  return (
    <>
      <CategoryNews category="КУЛЬТУРА" />
      <AllNews />
    </>
  );
}