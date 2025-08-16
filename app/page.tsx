import {AllNews, CategoryNews, ColumnNews, Hero, ArticleLink} from "@/app/components";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <div className={styles.container}>
        <Hero/>
        

        
        <ColumnNews
          newsQuantity={4}
          smallImg={true}
          category="ПОЛІТИКА"
          secondCategory="ВІЙНА З РОСІЄЮ"
          settingsIcon
          isHomePage={true}
          showNewsList={true}
        />
        <CategoryNews category="ЕВРОПА"/>
        <ColumnNews
          newsQuantity={8}
          category="ЗДОРОВʼЯ"
          secondCategory="СУСПІЛЬСТВО"
          arrowRightIcon
          showNewsList={true}
          isHomePage={true}
        />
        <CategoryNews category="ЗДОРОВ'Я"/>
        <ColumnNews
          newsQuantity={8}
          category="КРИМІНАЛ"
          secondCategory="СПОРТ"
          arrowRightIcon
          isHomePage={true}
        />
        <CategoryNews category="КУЛЬТУРА"/>
        <AllNews/>
      </div>
    </>
  );
}