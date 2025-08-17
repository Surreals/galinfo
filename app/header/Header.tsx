"use client";

import { useState, useEffect } from "react";
import { Input } from 'antd';
import Link from "next/link";

import paths from "@/app/paths";
import Image from "next/image";
import galinfoLogo from "@/assets/logos/galInfoLogo.png";
import locationIcon from "@/assets/icons/locationIcon.svg";
import radioLogo from "@/assets/logos/radioLogo.svg"
import searchIcon from "@/assets/icons/searchIcon.svg"
import dotIcon from "@/assets/icons/dotIcon.svg"
import burgerMenu from "@/assets/icons/burgerMenu.svg"

import styles from "@/app/header/Header.module.scss";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMenuOpen(false);
    }, 400);
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      handleCloseMenu();
    } else {
      setIsMenuOpen(true);
    }
  };

  return (
    <header className={styles.headerMain}>
      <div className={styles.header}>
        <Link href={'./'} className={styles.logo}>
          <Image
            src={galinfoLogo}
            alt="Galinfo Logo"
            width={144}
            height={46}
            className={styles.logoImage}
          />
        </Link>

        <nav className={styles.headerNav}>
          <ul className={styles.navList}>
            <li>
              <Link href={paths.society} className={styles.link}>
                СУСПІЛЬСТВО
              </Link>
            </li>
            <li>
              <Link href={paths.politics} className={styles.link}>
                ПОЛІТИА
              </Link>
            </li>
            <li>
              <Link href={paths.economy} className={styles.link}>
                ЕКОНОМІКА
              </Link>
            </li>
            <li>
              <Link href={paths.culture} className={styles.link}>
                КУЛЬТУРА
              </Link>
            </li>
            <li>
              <Link href={paths.health} className={styles.link}>
                ЗДОРОВ'Я
              </Link>
            </li>
            <li>
              <Link href={paths.health} className={styles.link}>
                ВІЙНА З РОСІЄЮ
              </Link>
            </li>
            <li>
              <Link href={paths.sport} className={styles.link}>
                СПОРТ
              </Link>
            </li>
            <li>
              <Link href={paths.crime} className={styles.link}>
                КРИМІНАЛ
              </Link>
            </li>
            <li>
              <Link href={paths.crime} className={styles.link}>
                БІЛЬШЕ НОВИН...
              </Link>
            </li>
          </ul>
        </nav>
        <div className={styles.burgerMenuContainer}>
          <div
            className={styles.burgerMenuIcon}
            onClick={toggleMenu}
          >
            <Image src={burgerMenu} alt={'Burger menu'}/>
          </div>
          <div className={styles.svgBox}>
            <div className={styles.searchIcon}>
              <Image
                src={searchIcon}
                alt="Search Logo"
                width={24}
                height={24}
              />
            </div>
            <a className={styles.radioLogo} target={'_blank'} href={'https://lviv.fm/'}>
              <Image
                src={radioLogo}
                alt="Radio Logo"
                width={120}
                height={40}
              />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.secondaryHeader}>
        <p className={styles.text}>
          Агенція інформації та аналітики "Гал-інфо"
        </p>
        <div className={styles.infoContainer}>
          {/* Статичний блок "ТЕРМІНОВІ НОВИНИ" */}
          <Link href={paths.society} className={styles.newInfoLink}>
            <p className={styles.boltText}>ТЕРМІНОВІ НОВИНИ</p>
            <Image src={dotIcon} alt="Dot Logo" width={8} height={8}/>
          </Link>

          <div className={styles.marqueeWrapper}>
            <div className={styles.marqueeContent}>
              <Link href={paths.society} className={styles.newInfoLink}>
                <p className={styles.gradientTextStart}>“ ВАЖЛИВА НОВИНА 1 ................. “</p>
                <Image src={dotIcon} alt="Dot Logo" width={8} height={8}/>
              </Link>
              <Link href={paths.society} className={styles.newInfoLink}>
                <p className={styles.gradientTextEnd}>“ ВАЖЛИВА НОВИНА 2 ................. “</p>
                <Image src={dotIcon} alt="Dot Logo" width={8} height={8}/>
              </Link>

              <Link href={paths.society} className={styles.newInfoLink}>
                <p className={styles.gradientTextStart}>“ ВАЖЛИВА НОВИНА 1 ................. “</p>
                <Image src={dotIcon} alt="Dot Logo" width={8} height={8}/>
              </Link>
              <Link href={paths.society} className={styles.newInfoLink}>
                <p className={styles.gradientTextEnd}>“ ВАЖЛИВА НОВИНА 2 ................. “</p>
                <Image src={dotIcon} alt="Dot Logo" width={8} height={8}/>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.infoSection}>
        <div className={styles.weatherBox}>
          <div className={styles.sityText}>+13°C</div>
          <Image src={locationIcon} alt={'location'}/>
          <div className={styles.sityText}>ЛЬВІВ</div>
        </div>
        <div className={styles.exchangeBox}>
          <div className={styles.exchangeItem}>
            <div className={styles.exchangeType}>USD:</div>
            <div className={styles.exchangeValue}>39.10</div>
          </div>
          <div className={styles.verticalBorder}></div>
          <div className={styles.exchangeItem}>
            <div className={styles.exchangeType}>EUR:</div>
            <div className={styles.exchangeValue}>42.20</div>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className={`${styles.fullScreenMenu} ${isClosing ? styles.fadeOut : styles.fadeIn}`}>
          <aside className={styles.sidebar}>

            <Input
              placeholder=""
                suffix={<Image
                src={searchIcon}
                alt="Search"
                width={20}
                height={20}
                className={styles.searchIcon}
              />}
              className={styles.input}
            />

            <h3 className={styles.sectionTitle}>
              ТОП ТЕМИ
            </h3>
            <hr className={styles.divider}/>
            <ul className={styles.topicsList}>
              <li><Link className={styles.textCategory} href="#">ВІДВЕРТА РОЗМОВА З</Link></li>
              <li><Link className={styles.textCategory} href="#">РАЙОНИ ЛЬВОВА</Link></li>
              <li><Link className={styles.textCategory} href="#">ПРЕССЛУЖБА</Link></li>
            </ul>

            {/* Categories */}
            <h3 className={styles.sectionTitle}>КАТЕГОРІЇ</h3>
            <hr className={styles.divider}/>
            <div className={styles.categories}>
              <Link className={styles.textCategory} href="#">ЛЬВІВЩИНА</Link>
              <Link className={styles.textCategory} href="#">СУСПІЛЬСТВО</Link>
              <Link className={styles.textCategory} href="#">ТЕРНОПІЛЬЩИНА</Link>
              <Link className={styles.textCategory} href="#">ПОЛІТИКА</Link>
              <Link className={styles.textCategory} href="#">ВОЛИНЬ</Link>
              <Link className={styles.textCategory} href="#">ЕКОНОМІКА</Link>
              <Link className={styles.textCategory} href="#">УКРАЇНА</Link>
              <Link className={styles.textCategory} href="#">КУЛЬТУРА</Link>
              <Link className={styles.textCategory} href="#">ЄС</Link>
              <Link className={styles.textCategory} href="#">ЗДОРОВ'Я</Link>
              <Link className={styles.textCategory} href="#">СВІТ</Link>
              <span></span>
              <Link className={styles.textCategory} href="#">СПОРТ</Link>
              <Link className={styles.textCategory} href="#">НОВИНА</Link>
              <Link className={styles.textCategory} href="#">КРИМІНАЛ</Link>
              <Link className={styles.textCategory} href="#">СТАТТЯ</Link>
              <Link className={styles.textCategory} href="#">НАДЗВИЧАЙНІ ПОДІЇ</Link>
              <Link className={styles.textCategory} href="#">ІНТЕРВ'Ю</Link>
              <Link className={styles.textCategory} href="#">ІСТОРІЯ</Link>
              <span></span>
              <Link className={styles.textCategory} href="#">ТЕХНОЛОГІЇ</Link>
              <span></span>
            </div>
            <div className={styles.radioBox}>
              <a className={styles.radioLogo} target={'_blank'} href={'https://lviv.fm/'}>
                <Image
                  src={radioLogo}
                  alt="Radio Logo"
                  width={120}
                  height={40}
                />
              </a>
            </div>

          </aside>
        </div>
      )}
    </header>
  )
}