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

  return (
    <>
      <div className={styles.container}>
      {!isMobile ? (
        <>
          <Hero />
          <ColumnNews
          // mobileLayout="horizontal"
            newsQuantity={4}
            smallImg={true}
            category="ПОЛІТИКА"
            secondCategory="ВІЙНА З РОСІЄЮ"
            settingsIcon
            isHomePage={true}
            showNewsList={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ЕВРОПА"/>
          <ColumnNews
          //mobileLayout="horizontal"
            newsQuantity={5}
            category="ЗДОРОВʼЯ"
            secondCategory="СУСПІЛЬСТВО"
            arrowRightIcon
            showNewsList={true}
            isHomePage={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ЗДОРОВ'Я"/>
          <ColumnNews
          //mobileLayout="horizontal"
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
            isMobile={isMobile}
            newsQuantity={4}
            smallImg={true}
            category="ПОЛІТИКА"
            secondCategory="ВІЙНА З РОСІЄЮ"
            settingsIcon
            isHomePage={true}
            showNewsList={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ЕВРОПА"/>
          <ColumnNews
          isMobile={isMobile}
            newsQuantity={5}
            category="ЗДОРОВʼЯ"
            secondCategory="СУСПІЛЬСТВО"
            arrowRightIcon
            showNewsList={true}
            isHomePage={true}
          />
          <CategoryNews mobileLayout="horizontal" category="ЗДОРОВ'Я"/>
          <ColumnNews
          isMobile={isMobile}
            newsQuantity={5}
            category="КРИМІНАЛ"
            secondCategory="СПОРТ"
            arrowRightIcon
            isHomePage={true}
          />
          <CategoryNews category="КУЛЬТУРА"/>
          <AllNews/>
        </>
      )}
      </div>
    </>
  );
}