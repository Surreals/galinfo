"use client";

import { useEffect, useState } from "react"
import Image from "next/image";

import {AccentSquare, ViewAllButton} from "@/app/shared";
import arrowRight from "@/assets/icons/arrowRight.svg";

import styles from "./listNews.module.scss";

type NewsItem = {
  id?: string;
  title: string;
  time: string;
  imageUrl?: string;
  url?: string;
};

type NewsListProps = {
  data: NewsItem[];
  showImagesAt?: number[];
  widthPercent?: number;
  title?: string;
  arrowRightIcon?: boolean;
  showMoreButton?: boolean;
  moreButtonUrl?: string;
  mobileLayout?: 'column' | 'horizontal'; // Новий пропс для контролю мобільного відображення
  showSeparator?: boolean;
};

export default function NewsList({
   data,
   showImagesAt = [],
   widthPercent = 100,
   title,
   arrowRightIcon = false,
   showMoreButton = false,
   moreButtonUrl = "#",
   mobileLayout = 'column', // За замовчуванням - колонка
   showSeparator = false
 }: NewsListProps) {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Функція перевірки ширини
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Визначаємо, чи потрібно показувати горизонтальне відображення
  const shouldShowHorizontal = isMobile && mobileLayout === 'horizontal';

  return (
    <div style={{ width: `${widthPercent}%` }} className={styles.container}>
      {title && (
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            {isMobile ? <AccentSquare className={styles.titleAccent} /> : null}
            <h2 className={isMobile ? styles.titleMobile : styles.title}>{title}</h2>
          </div>
          {arrowRightIcon && <span className={styles.titleIcon}>
              <Image
              src={arrowRight}
              alt={'Arrow right'}
              width={10}
              height={8}
            />
          </span>}
        </div>
      )}

      <ul className={`${styles.list} ${shouldShowHorizontal ? styles.listHorizontal : ''}`}>
        {data.map((item, index) => (
          <li key={item.id || index} className={`${styles.item} ${shouldShowHorizontal ? styles.itemHorizontal : ''}`}>
            {item.url ? (
              <a href={item.url} className={`${styles.itemLink} ${shouldShowHorizontal ? styles.itemLinkHorizontal : ''}`}>
                {/* Показуємо зображення на мобільних для кожної новини при горизонтальному відображенні, або за параметром showImagesAt */}
                {(shouldShowHorizontal || showImagesAt.includes(index)) && item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={styles.image}
                  />
                )}
                <div className={styles.textBlock}>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemTime}>{item.time}</p>
                </div>
              </a>
            ) : (
              <>
                {/* Показуємо зображення на мобільних для кожної новини при горизонтальному відображенні, або за параметром showImagesAt */}
                {(shouldShowHorizontal || showImagesAt.includes(index)) && item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={styles.image}
                  />
                )}
                <div className={styles.textBlock}>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemTime}>{item.time}</p>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {showMoreButton && (
        <div className={styles.moreBtnWrapper}>
          <ViewAllButton href="/all-news" />
        </div>
      )}
      {isMobile && showSeparator && (
        <div className={styles.separator}></div>
      )}
    </div>
  );
}