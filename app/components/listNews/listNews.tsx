"use client";

import { useEffect, useState } from "react"
import Image from "next/image";

import {AccentSquare, ViewAllButton} from "@/app/shared";
import arrowRight from "@/assets/icons/arrowRight.svg";
import settings from "@/assets/icons/settingsIcon.svg";

import styles from "./listNews.module.scss";

type NewsItem = {
  title: string;
  time: string;
  imageUrl?: string;
};

type NewsListProps = {
  data: NewsItem[];
  showImagesAt?: number[];
  widthPercent?: number;
  title?: string;
  arrowRightIcon?: boolean;
  settingsIcon?: boolean;
  showMoreButton?: boolean;
  moreButtonUrl?: string;
};

export default function NewsList({
   data,
   showImagesAt = [],
   widthPercent = 100,
   title,
   arrowRightIcon = false,
    settingsIcon = false,
   showMoreButton = false,
   moreButtonUrl = "#",
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
          {settingsIcon && <span className={styles.titleIcon}>
              <Image
                  src={settings}
                  alt={'Settings'}
                  width={18}
                  height={18}
              />
          </span>}
        </div>
      )}

      <ul className={styles.list}>
        {data.map((item, index) => (
          <li key={index} className={styles.item}>
            {showImagesAt.includes(index) && item.imageUrl && (
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
          </li>
        ))}
      </ul>

      {showMoreButton && (
        <div className={styles.moreBtnWrapper}>
          <ViewAllButton href="/all-news" />
        </div>
      )}
    </div>
  );
}