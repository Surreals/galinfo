import {AllNews, CategoryNews, ColumnNews, Hero} from "@/app/components";

export default function HomePage() {
  return (
    <>
      <Hero/>
      <ColumnNews
        newsQuantity={4}
        smallImg={true}
        category="ПОЛІТИКА"
        secondCategory="ВІЙНА З РОСІЄЮ"
        settingsIcon
        isHomePage={true}
      />
      <CategoryNews category="ЕВРОПА" />
      <ColumnNews
        newsQuantity={8}
        category="ЗДОРОВʼЯ"
        secondCategory="СУСПІЛЬСТВО"
        arrowRightIcon
        isHomePage={true}
      />
      <CategoryNews category="ЗДОРОВ'Я" />
      <ColumnNews
        newsQuantity={8}
        category="КРИМІНАЛ"
        secondCategory="СПОРТ"
        arrowRightIcon
        isHomePage={true}
      />
      <CategoryNews category="КУЛЬТУРА" />
      <AllNews />
    </>
  );
}