"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';

import paths from '@/app/paths';
import galinfoLogo from '@/assets/logos/galInfoLogo.png';
import inFomoLogoWhite from '@/assets/logos/inFomoLogoWhite.png';
import arrowUpPrimary from "@/assets/icons/arrowUpPrimary.svg";
import rssIcon from "@/assets/icons/rssIcon.svg";
import { useMenuContext } from "@/app/contexts/MenuContext";
import { generateCategoryUrl } from "@/app/lib/categoryMapper";

import styles from './Footer.module.css';

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  const { menuData } = useMenuContext();

  const mainCategories = menuData?.mainCategories || [];
  const regions = menuData?.regions || [];
  const additionalItems = menuData?.additionalItems || [];
  const specialThemesItem = menuData?.specialThemes || [];

  useEffect(() => {
    const handleScroll = () => {
      const screenHeight = window.innerHeight;
      setIsVisible(window.scrollY > screenHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className={styles.footer}>
      <button
        type="button"
        className={`${styles.buttonUp} ${isVisible ? styles.show : styles.hide}`}
        onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
        aria-label="Прокрутити вверх"
      >
        <Image
          src={arrowUpPrimary}
          alt=""
          width={10}
          height={14}
          className={styles.arrayIcon}
        />
      </button>
      
      <div className={styles.container}>
        {/* Верхня секція з колонками */}
        <div className={styles.flexContainer}>

          {/* АГЕНЦІЯ */}
          <div className={styles.column}>
            <h3 className={styles.title}>АГЕНЦІЯ</h3>
            <div className={styles.divider}></div>
            <ul className={styles.list}>
              <li>
                <Link href={paths.about} className={styles.link}>
                  ПРО РЕДАКЦІЮ
                </Link>
              </li>
              <li>
                <Link href={paths.editorialPolicy} className={styles.link}>
                  РЕДАКЦІЙНА ПОЛІТИКА
                </Link>
              </li>
              <li>
                <Link href={paths.advertising} className={styles.link}>
                  ЗАМОВИТИ РЕКЛАМУ
                </Link>
              </li>
              <li>
                <Link href={paths.contacts} className={styles.link}>
                  КОНТАКТИ
                </Link>
              </li>
              <li>
                <Link href={paths.termsOfUse} className={styles.link}>
                  ПРАВИЛА ВИКОРИСТАННЯ
                </Link>
              </li>
            </ul>
          </div>

          {/* ТОП ТЕМИ */}
          <div className={styles.column}>
            <h3 className={styles.title}>ТОП ТЕМИ</h3>
            <div className={styles.divider}></div>
            <ul className={styles.list}>
              {specialThemesItem.map((item) => (
                <li key={item.id}>
                  <Link href={generateCategoryUrl(item.id) || item.link} className={styles.link}>
                    {item.title.toUpperCase()}
                  </Link>
                </li>
              ))}
              {specialThemesItem.length === 0 && (
                <>
                  <li><Link href={paths.frankConversation} className={styles.link}>ВІДВЕРТА РОЗМОВА З</Link></li>
                  <li><Link href={paths.lvivDistricts} className={styles.link}>РАЙОНИ ЛЬВОВА</Link></li>
                  <li><Link href={paths.pressService} className={styles.link}>ПРЕССЛУЖБА</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* КАТЕГОРІЇ */}
          <div className={styles.categoriesColumn}>
            <h3 className={styles.title}>КАТЕГОРІЇ</h3>
            <div className={styles.divider}></div>
            <div className={styles.grid}>
              <div className={styles.gridColumn}>
                {regions.map((region) => (
                  <Link key={region.id} href={generateCategoryUrl(region.id) || region.link} className={styles.link}>
                    {region.title?.toUpperCase()}
                  </Link>
                ))}
                {regions.length === 0 && (
                  <>
                    <Link href={paths.lvivRegion} className={styles.link}>ЛЬВІВЩИНА</Link>
                    <Link href={paths.ternopilRegion} className={styles.link}>ТЕРНОПІЛЬЩИНА</Link>
                    <Link href={paths.volyn} className={styles.link}>ВОЛИНЬ</Link>
                  </>
                )}
              </div>

              <div className={styles.gridColumn}>
                {mainCategories.slice(0, 5).map((cat) => (
                  <Link key={cat.id} href={generateCategoryUrl(cat.id) || cat.link} className={styles.link}>
                    {cat.title.toUpperCase()}
                  </Link>
                ))}
              </div>

              <div className={styles.gridColumn}>
                {mainCategories.slice(5).map((cat) => (
                  <Link key={cat.id} href={generateCategoryUrl(cat.id) || cat.link} className={styles.link}>
                    {cat.title.toUpperCase()}
                  </Link>
                ))}
              </div>

              <div className={styles.gridColumn}>
                {additionalItems.slice(0, 2).map((item) => (
                  <Link key={item.param} href={item.link} className={styles.link}>
                    {item.title.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Розділювальна лінія */}
        <div className={styles.separator}></div>

        {/* Нижня секція */}
        <div className={styles.bottomSection}>
          <div>
            {/* Логотип galinfo */}
            <div className={styles.logo}>
              <Image
                src={galinfoLogo}
                alt="Galinfo Logo"
                width={120}
                height={40}
                className={styles.logoImage}
              />
            </div>

            {/* Копірайт */}
            <div className={styles.copyright}>
              <div>© 2005-2018 Агенція інформації та аналітики</div>
              <div>Передрук матеріали тільки за наявності гіперпосилання на galinfo.com.ua</div>
            </div>

            {/* Соціальні мережі */}
            <div className={styles.socialLinks}>
              <Link href={paths.facebook} target="_blank" rel="noopener noreferrer">
                <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              <Link href={paths.twitter} target="_blank" rel="noopener noreferrer">
                <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link href={paths.instagram} target="_blank" rel="noopener noreferrer">
                <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
              {/* RSS Feed */}
              <Link 
                href="/api/rss/export" 
                target="_blank"
                rel="noopener noreferrer"
                title="RSS Feed - Останні новини"
                className={styles.rssLink}
              >
                <Image
                  src={rssIcon}
                  alt="RSS Feed"
                  width={18}
                  height={18}
                  className={styles.rssIcon}
                />
              </Link>
            </div>

            {/* Container for both buttons and 'and' text */}
            <div className={styles.buttonGroup}>
              {/* IN-FOMO button (now a Link) */}
              <Link href={paths.inFomo} target="_blank" rel="noopener noreferrer" className={styles.fomoButton}>
                <span className={styles.fomoText}>САЙТ СТВОРЕНИЙ</span>
                <Image
                  src={inFomoLogoWhite}
                  alt="IN-FOMO Logo"
                  width={80}
                  height={20}
                  className={styles.fomoLogo}
                />
              </Link>

              {/*<span className={styles.andText}>та</span>*/}

              {/* BYTCD TEAM button */}
              {/*<Link href={paths.bytcd} target="_blank" rel="noopener noreferrer" className={styles.bytcdButton}>*/}
              {/*  <Image */}
              {/*    src={bytcdIcon} */}
              {/*    alt="BYTCD Icon" */}
              {/*    width={16} */}
              {/*    height={16} */}
              {/*    className={styles.bytcdIcon}*/}
              {/*  />*/}
              {/*  <span className={styles.bytcdText}>BYTCD TEAM</span>*/}
              {/*</Link>*/}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}