"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Carousel } from 'antd';
import NewsList from "@/app/components/listNews";
import CurrencyRates from "./CurrencyRates";
import WeatherWidget from "./WeatherWidget";

import arrowUpPrimary from "@/assets/icons/arrowUpPrimary.svg";
import roundArrowRight from "@/assets/icons/roundArrowRight.svg";
import roundArrowLeft from "@/assets/icons/roundArrowLeft.svg";

import styles from './Hero.module.scss';

export default function Hero() {
  const carouselRef = useRef<any>(null);

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

  const generateRandomNews = (count: number) => {
    const titles = [
      "Зеленський підписав новий закон Зеленський підписав новий закон ",
      "В Україні прогнозують грози Зеленський підписав новий закон",
      "Трамп дав нове інтерв'ю Зеленський підписав новий закон",
      "На Львівщині відкрили парк Зеленський підписав новий закон",
      "Вчені винайшли новий велосипед Зеленський підписав новий закон",
      "Новий арт-проєкт у центрі Києва Зеленський підписав новий закон",
    ];

    return Array.from({ length: count }, () => ({
      title: titles[Math.floor(Math.random() * titles.length)],
      time: new Date(
        Date.now() - Math.floor(Math.random() * 1e8)
      ).toLocaleString("uk-UA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      imageUrl: `https://picsum.photos/seed/${Math.random()}/300/200`,
    }));
  };

  const newsData = generateRandomNews(8);

  const onChange = (currentSlide: number) => {
    console.log(currentSlide);
  };

  const carouselItems = [
    {
      src: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Місто
      title: "У Львові запрацював сучасний центр реабілітації для онкопацієнтів",
    },
    {
      src: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "У Львові запрацював сучасний центр реабілітації для онкопацієнтів",// Природа
    },
    {
      src: "https://images.pexels.com/photos/1679646/pexels-photo-1679646.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "У Львові запрацював сучасний центр реабілітації для онкопацієнтів",// Архітектура
    },
    {
      src: "https://images.pexels.com/photos/2356040/pexels-photo-2356040.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      title: "У Львові запрацював сучасний центр реабілітації для онкопацієнтів",// Пейзаж
    },
  ];


  const contentStyle: React.CSSProperties = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.heroBox}>
          <div className={styles.carouselBox}>
            <Carousel
              afterChange={onChange}
              autoplay
              ref={carouselRef}
            >
              {carouselItems.map((item, index) => (
                <div key={index} className={styles.carouselItem}>
                  <div>
                    <img alt={'img'} src={item.src} className={styles.heroImg}/>
                  </div>
                  <div className={styles.carouselContent}>
                    <p className={styles.carouselTime}>15 хвилин тому</p>
                    <h3 className={styles.carouselTitle}>{item.title}</h3>
                  </div>
                  <button
                    onClick={() => carouselRef.current?.next()}
                    className={styles.rightArrowButton}
                  >
                    <Image
                      src={roundArrowRight}
                      alt="Right arrow"
                      width={44}
                      height={44}
                    />
                  </button>
                  <button
                    onClick={() => carouselRef.current?.prev()}
                    className={styles.leftArrowButton}
                  >
                    <Image
                      src={roundArrowLeft}
                      alt="Left arrow"
                      width={44}
                      height={44}
                    />
                  </button>
                </div>
              ))}
            </Carousel>
          </div>
          <div className={styles.infoSection}>
            <CurrencyRates />
            <WeatherWidget />
          </div>
        </div>
      </div>
      <div className={styles.containerHeroInfo}>
        <NewsList
          data={newsData}
          showImagesAt={[3]}
          widthPercent={isMobile ? 100 : 45}
          showMoreButton={false}
        />

        <NewsList
          title="ЕКОНОМІКА"
          moreButtonUrl="/economics"
          data={newsData}
          arrowRightIcon
          showImagesAt={[0]}
          widthPercent={isMobile ? 100 : 25}
          showMoreButton
        />

        <NewsList
          data={newsData}
          showImagesAt={[3]}
          widthPercent={isMobile ? 100 : 25}
          title="НОВИНИ ЛЬВОВА"
          showMoreButton
          settingsIcon
          moreButtonUrl="/lviv-news"
        />
      </div>
      {/*<div className={styles.buttonUp}>*/}
      {/*  <Image*/}
      {/*    src={arrowUpPrimary}*/}
      {/*    alt="Arrow Up"*/}
      {/*    width={10}*/}
      {/*    height={14}*/}
      {/*    className={styles.arrayIcon}*/}
      {/*  />*/}
      {/*</div>*/}
    </section>
  )
}