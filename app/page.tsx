'use client';

import { AllNews, CategoryNews, ColumnNews, Hero, ArticleLink } from "@/app/components";
import { useHomePageData } from "@/app/hooks/useHomePageData";
import { useMobileContext } from "@/app/contexts/MobileContext";
import styles from "./page.module.css";


export default function HomePage() {
  const { data, loading, error } = useHomePageData();
  const { isMobile } = useMobileContext();

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

          <Hero />
          <ColumnNews
          isMobile={isMobile}
            mobileLayout="horizontal"
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
            mobileLayout="horizontal"
            newsQuantity={5}
            category="ЗДОРОВʼЯ"
            secondCategory="СУСПІЛЬСТВО"
            arrowRightIcon
            showNewsList={true}
            isHomePage={true}
          />
          <CategoryNews isMobile={isMobile} mobileLayout="horizontal" category="ЗДОРОВ'Я"/>
          <ColumnNews
          isMobile={isMobile}
            mobileLayout="horizontal"
            newsQuantity={5}
            category="КРИМІНАЛ"
            secondCategory="СПОРТ"
            arrowRightIcon
            isHomePage={true}
          />
          <CategoryNews isMobile={isMobile} mobileLayout="horizontal" category="КУЛЬТУРА"/>
          <AllNews/>
       
      
      </div>
    </>
  );
}