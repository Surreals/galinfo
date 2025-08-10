import React from "react";
import styles from "./listNews.module.scss";
import {ViewAllButton} from "@/app/shared";

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
  titleIcon?: React.ReactNode;
  showMoreButton?: boolean;
  moreButtonUrl?: string;
};

export default function NewsList({
   data,
   showImagesAt = [],
   widthPercent = 100,
   title,
   titleIcon,
   showMoreButton = false,
   moreButtonUrl = "#",
 }: NewsListProps) {

  return (
    <div style={{ width: `${widthPercent}%` }} className={styles.container}>
      {title && (
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {titleIcon && <span className={styles.titleIcon}>{titleIcon}</span>}
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