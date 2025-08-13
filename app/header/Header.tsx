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
import Script from "next/script";

export default function Header() {
  return (
    <header className={styles.headerMain}>
      <div className={styles.header}>
        <Link href={paths.society} className={styles.logo}>
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
          <div className={styles.burgerMenuIcon}>
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
          <Link href={paths.society} className={styles.newInfoLink}>
            <p className={styles.boltText}>ТЕРМІНОВІ НОВИНИ</p>
            <Image
              src={dotIcon}
              alt="Dot Logo"
              width={8}
              height={8}
            />
          </Link>
          <Link href={paths.society} className={styles.newInfoLink}>
          <p className={styles.gradientTextStart}>“ ВАЖЛИВА НОВИНА 1 .......... “</p>
            <Image
              src={dotIcon}
              alt="Dot Logo"
              width={8}
              height={8}
            />
          </Link>
          <Link href={paths.society} className={styles.newInfoLink}>
            <p className={styles.gradientTextEnd}>“ ВАЖЛИВА НОВИНА 2 .......... “</p>
            <Image
              src={dotIcon}
              alt="Dot Logo"
              width={8}
              height={8}
            />
          </Link>
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
    </header>
  )
}