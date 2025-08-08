"use client";

import { useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Carousel } from 'antd';

import arrowUpPrimary from "@/assets/icons/arrowUpPrimary.svg";
import arrowRight from "@/assets/icons/arrowRight.svg";

import styles from './Hero.module.scss';



export default function Hero() {
  const carouselItems = [
    {
      src: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Місто
      title: "У Львові запрацював сучасний центр реабілітації для онкопацієнтів",
    },
    {
      src: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Природа
    },
    {
      src: "https://images.pexels.com/photos/1679646/pexels-photo-1679646.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Архітектура
    },
    {
      src: "https://images.pexels.com/photos/2356040/pexels-photo-2356040.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Пейзаж
    },
  ];

  useEffect(() => {
    // Динамічне завантаження скрипту
    const script = document.createElement("script");
    script.src = "https://sinoptik.ua/api/informer/content?loc=bwCOPQ6RBMAlPUoebrAObrFr&cem=gRYJ2sbUGk=WPQ6YbAD7cM=0cTYUcnEUbrjv2r3YPS5ePkC";
    script.async = true;
    document.body.appendChild(script);

    // Очищення при розмонтуванні
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Дані для курсів валют
  const exchangeRates = [
    {
      currency: 'USD',
      buy: 41.50,
      sell: 41.68,
      interbank: 41.76,
    },
    {
      currency: 'EUR',
      buy: 49.30,
      sell: 49.49,
      interbank: 49.10,
    },
  ];

  // Дані для погоди
  const weatherData = {
    temp: "+26°",
    humidity: "45%",
    pressure: "742 мм",
    wind: "1 м/с",
    condition: "Похмуро-світлий",
  };

  const onChange = (currentSlide: number) => {
    console.log(currentSlide);
  };

  const contentStyle: React.CSSProperties = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
  };

  return (
      <div className={styles.heroSection}>
        <div className={styles.carouselBox}>
          <Carousel afterChange={onChange} className={styles.carousel}>
            {carouselItems.map((item, index) => (
              <div key={index} className={styles.carouselItem}>
                <img alt={'img'} src={item.src} className={styles.heroImg} />
                <div className={styles.carouselContent}>
                  <p className={styles.carouselTime}>15 хвилин тому</p>
                  <h3 className={styles.carouselTitle}>{item.title}</h3>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <div className={styles.infoSection}>
          <div className={styles.currencySection}>
            <div className={styles.titleBox}>
              <h4 className={styles.sectionTitle}>КУРСИ ВАЛЮТ</h4>
              <Image
                src={arrowRight}
                alt={'Arrow right'}
                width={10}
                height={8}
              />
            </div>
            <div className={styles.exchangeTable}>
              <div className={styles.exchangeTableHeader}>
                <div></div>
                <div className={styles.exchangeCurrency}>КУПІВЛЯ</div>
                <div className={styles.exchangeCurrency}>ПРОДАЖ</div>
                <div className={styles.exchangeCurrency}>МІЖБАНК</div>
              </div>

              {exchangeRates.map((rate) => (
                <div key={rate.currency} className={styles.exchangeTableRow}>
                  <div className={styles.exchangeCurrency}>{rate.currency}</div>
                  <div className={styles.exchangeValue}>{rate.buy.toFixed(2)}</div>
                  <div className={styles.exchangeValue}>{rate.sell.toFixed(2)}</div>
                  <div className={styles.exchangeValue}>{rate.interbank.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.weatherSection}>
            <div className={styles.titleBox}>
              <h4 className={styles.sectionTitle}>ПОГОДА</h4>
              <Image
                src={arrowRight}
                alt={'Arrow right'}
                width={10}
                height={8}
              />
            </div>
            <div className={styles.weatherWidget}>
              <div
                className="sin-informer sin-informer_font-helvetica"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  color: "rgba(0, 0, 0, 1)",
                }}
                data-lang="uk"
              >
                <div className="sin-informer__header">
                  <a
                    className="sin-informer__logo-link"
                    href="https://sinoptik.ua"
                    target="_blank"
                    rel="nofollow"
                  >
                    <img
                      className="sin-informer__logo-image"
                      width="66"
                      height="20"
                      srcSet="https://sinoptik.ua/resources/informer/assets/icons/logo.png, https://sinoptik.ua/resources/informer/assets/icons/logo2x.png 2x"
                      src="https://sinoptik.ua/resources/informer/assets/icons/logo.png"
                      alt="Sinoptik - logo"
                    />
                  </a>
                  <p className="sin-informer__date">Погода на найближчий час</p>
                  <p
                    className="sin-informer__time"
                    data-format="24"
                    style={{color: "rgba(0, 0, 0, 1)"}}
                  >
              <span
                className="sin-informer__time-icon"
                style={{color: "rgba(218, 4, 87, 1)"}}
              ></span>
                  </p>
                </div>
                <div className="sin-informer__main sin-informer__main_inline">
                  <a
                    className="sin-informer__entry"
                    href="https://sinoptik.ua/pohoda/lviv"
                    target="_blank"
                    rel="nofollow"
                  >
                    <p
                      className="sin-informer__location"
                      style={{backgroundColor: "rgba(229, 229, 229, 1)"}}
                    >
                      Львів
                    </p>
                    <div className="sin-informer__primary" style={{display: "none"}}>
                      <p
                        className="sin-informer__local-time"
                        style={{color: "rgba(0, 0, 0, 1)"}}
                      ></p>
                      <p
                        className="sin-informer__temp"
                        data-unit="c"
                        style={{color: "rgba(218, 4, 87, 1)"}}
                      ></p>
                      <div
                        className="sin-informer__condition"
                        data-icon-path="https://sinoptik.ua/resources/informer/assets/icons/conditions"
                      ></div>
                    </div>
                    <div className="sin-informer__secondary" style={{display: "none"}}>
                      <p
                        className="sin-informer__marker sin-informer__marker_wind"
                        data-unit="ms"
                        data-suffix="м/с"
                        data-directions="Західний,Північно-Західний,Північний,Північно-Східний,Східний,Південно-Східний,Південний,Південно-Західний,Штиль"
                        title="Вітер"
                      >
                  <span
                    className="sin-informer__marker-icon"
                    style={{color: "rgba(218, 4, 87, 1)"}}
                  ></span>
                      </p>
                      <p
                        className="sin-informer__marker sin-informer__marker_humidity"
                        title="Волога"
                      >
                  <span
                    className="sin-informer__marker-icon"
                    style={{color: "rgba(218, 4, 87, 1)"}}
                  ></span>
                      </p>
                      <p
                        className="sin-informer__marker sin-informer__marker_pressure"
                        data-unit="mm-hg"
                        data-suffix="мм"
                        title="Тиск"
                      >
                  <span
                    className="sin-informer__marker-icon"
                    style={{color: "rgba(218, 4, 87, 1)"}}
                  ></span>
                      </p>
                    </div>
                  </a>
                </div>
                <div
                  className="sin-informer__footer"
                  style={{color: "rgba(0, 0, 0, 1)"}}
                >
                  Погода на 10 днів від{" "}
                  <a
                    className="sin-informer__domain-link"
                    href="https://sinoptik.ua/pohoda/lviv/10-dniv"
                    target="_blank"
                    rel="nofollow"
                    style={{color: "rgba(0, 0, 0, 1)"}}
                  >
                    sinoptik.ua
                  </a>
                </div>
              </div>
            </div>
          </div>
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
      </div>

  )
}