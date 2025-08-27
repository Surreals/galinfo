'use client';

import { AllNews, CategoryNews, ColumnNews, Hero, ArticleLink } from "@/app/components";
import { useHomePageData } from "@/app/hooks/useHomePageData";
import { useIsMobile } from "@/app/hooks/useIsMobile";

import styles from "./page.module.css";


export default function HomePage() {
  const { data, loading, error } = useHomePageData();
  const isMobile = useIsMobile();

  if (loading) {
    console.log('Loading...');
  }

  if (error) {
    console.log('Error:', error);
  }

  if (!data) {
    console.log('No data');
  }

  console.log(data);

  return (
    <>
      <div className={styles.container}>
      {!isMobile ? (
        <>
          <Hero />
          <ColumnNews
            mobileLayout="horizontal"
            newsQuantity={4}
            smallImg={true}
            category="ПОЛІТИКА"
            arrowRightIcon
            secondCategory="ВІЙНА З РОСІЄЮ"
            isHomePage={true}
            showNewsList={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ЕВРОПА"/>
          <ColumnNews
            mobileLayout="horizontal"
            newsQuantity={5}
            category="ЗДОРОВʼЯ"
            secondCategory="СУСПІЛЬСТВО"
            arrowRightIcon
            showNewsList={true}
            isHomePage={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ІСТОРІЯ"/>
          <ColumnNews
            mobileLayout="horizontal"
            newsQuantity={5}
            category="КРИМІНАЛ"
            secondCategory="СПОРТ"
            arrowRightIcon
            isHomePage={true}
          />
          <CategoryNews category="КУЛЬТУРА"/>
          <AllNews/>
        </>
      ) : (
        // Десктопна версія - збільшена кількість новин
        <>
          <Hero />
          <ColumnNews
          showSeparator={true}
            isMobile={isMobile}
            mobileLayout="horizontal"
            newsQuantity={4}
            smallImg={true}
            category="ПОЛІТИКА"
            secondCategory="ВІЙНА З РОСІЄЮ"
            isHomePage={true}
            showNewsList={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ЕВРОПА"/>
          <ColumnNews
          showSeparator={true}
            isMobile={isMobile}
            mobileLayout="horizontal"
            newsQuantity={5}
            category="ЗДОРОВʼЯ"
            secondCategory="СУСПІЛЬСТВО"
            arrowRightIcon
            showNewsList={true}
            isHomePage={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ІСТОРІЯ"/>
          <ColumnNews
          showSeparator={true}
            isMobile={isMobile}
            mobileLayout="horizontal"
            newsQuantity={5}
            category="КРИМІНАЛ"
            secondCategory="СПОРТ"
            arrowRightIcon
            isHomePage={true}
          />
          <CategoryNews mobileLayout="horizontal" category="КУЛЬТУРА"/>
          <AllNews/>
        </>
      )}
      </div>
    </>
  );
}