"use client";

import React, {useState, useEffect, useMemo, useCallback, useRef} from "react";
import {Input, Skeleton, Spin} from 'antd';
import { usePathname } from "next/navigation";
import Link from "next/link";

import paths from "@/app/paths";
import Image from "next/image";
import galinfoLogo from "@/assets/logos/galInfoLogo.png";
import locationIcon from "@/assets/icons/locationIcon.svg";
import radioLogo from "@/assets/logos/radioLogo.svg"
import searchIcon from "@/assets/icons/searchIcon.svg"
import dotIcon from "@/assets/icons/dotIcon.svg"
import burgerMenu from "@/assets/icons/burgerMenu.svg"
import logoutIcon from "@/assets/icons/logoutIcon.svg"
import { useMenuContext } from "@/app/contexts/MenuContext";
import { useAdminAuth } from "@/app/contexts/AdminAuthContext";
import { UserRole, ROLE_LABELS } from "@/app/types/roles";
import { useRolePermissions } from "@/app/hooks/useRolePermissions";
import SearchBox from "@/app/header/components/SearchBox";
import {useImportantNewsByLevel} from "@/app/hooks/useImportantNews";
import {RateRow, useCurrencyRates} from "@/app/hooks/UseCurrencyRatesResult";
import {useWeather} from "@/app/hooks/useWeather";
import { generateCategoryUrl } from "@/app/lib/categoryMapper";
import { useHeaderSettings } from "@/app/hooks/useHeaderSettings";
import HeaderSkeleton from "@/app/header/components/HeaderSkeleton";

import styles from "@/app/header/Header.module.scss";

// Custom debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

interface SearchResult {
  id: number;
  nheader: string;
  nsubheader?: string;
  nteaser?: string;
  urlkey: string;
  images: Array<{
    id: number;
    filename: string;
    title: string;
    urls: {
      full: string;
      intxt: string;
      tmb: string;
    };
  }>;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreNewsOpen, setIsMoreNewsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { menuData, loading: menuLoading } = useMenuContext();
  const { user, logout } = useAdminAuth();
  const { isAdmin: isAdminRole } = useRolePermissions();
  const { settings: headerSettings, loading: settingsLoading } = useHeaderSettings();
  
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeather("Lviv");
  const { importantNews, loading, refetch: refetchRates } = useImportantNewsByLevel(1)
  const currencies = useMemo(() => ['USD', 'EUR'], []);
  const { rates } = useCurrencyRates(currencies);
  const pathname = usePathname();

  // Check if user is on admin page
  const isAdminPage = pathname.startsWith('/admin');

  // debounced search handler
  const handleSearch = useCallback(
    debounce(async (value: string) => {
      if (!value.trim()) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      setIsSearchLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/news/search?q=${encodeURIComponent(value)}&limit=5&lang=1`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Помилка пошуку');
        }
        
        setSearchResults(data.searchResults || []);
      } catch (e) {
        console.error("Search error", e);
        setSearchError(e instanceof Error ? e.message : 'Помилка пошуку');
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 500),
    []
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  const handleSearchResultClick = () => {
    clearSearch();
  };

  useEffect(() => {

    refetchRates();
    refetchWeather();
  }, [pathname]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    if (isMenuOpen) {
      handleCloseMenu();
    }
  }, [pathname]);

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

  // Закрити пошук при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        clearSearch();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Очищення debounce при розмонтуванні компонента
  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  }, [handleSearch]);

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

  const mainCategories = menuData?.mainCategories || [];
  const regions = menuData?.regions || [];
  const specialThemesItem = menuData?.specialThemes || [];
  const additionalItems = menuData?.additionalItems || [];

  // Helper function to order categories by settings
  const getOrderedCategories = (categories: any[], categoryIds: number[]) => {
    if (!categoryIds || categoryIds.length === 0) {
      return []; // Return empty array if no specific order is set
    }
    
    const ordered: any[] = [];
    categoryIds.forEach(id => {
      const category = categories.find(cat => cat.id === id);
      if (category) {
        ordered.push(category);
      }
    });
    
    return ordered;
  };

  // Get ordered categories for main navigation
  const orderedMainNav = getOrderedCategories(
    mainCategories,
    headerSettings?.mainNavigation?.categoryIds || []
  ).slice(0, headerSettings?.mainNavigation?.maxItems || 8);

  // Get ordered categories for dropdown sections
  const orderedTopThemes = getOrderedCategories(
    specialThemesItem,
    headerSettings?.moreNewsDropdown?.topThemes?.categoryIds || []
  );

  const orderedRegions = getOrderedCategories(
    regions,
    headerSettings?.moreNewsDropdown?.categories?.column1?.categoryIds || []
  );

  const orderedMainCatCol2 = getOrderedCategories(
    mainCategories,
    headerSettings?.moreNewsDropdown?.categories?.column2?.categoryIds || []
  );

  const orderedMainCatCol3 = getOrderedCategories(
    mainCategories,
    headerSettings?.moreNewsDropdown?.categories?.column3?.categoryIds || []
  );

  const orderedAdditionalItems = (headerSettings?.moreNewsDropdown?.categories?.column4?.items || [])
    .map(param => additionalItems.find(item => item.param === param))
    .filter(Boolean);

  // Mobile menu ordering
  const orderedMobileTopThemes = getOrderedCategories(
    specialThemesItem,
    headerSettings?.mobileMenu?.topThemes?.categoryIds || []
  );

  const orderedMobileRegions = getOrderedCategories(
    regions,
    headerSettings?.mobileMenu?.categories?.regionIds || []
  );

  const orderedMobileMainCategories = getOrderedCategories(
    mainCategories,
    headerSettings?.mobileMenu?.categories?.mainCategoryIds || []
  );


  // Показуємо скелетон поки завантажуються налаштування та дані меню
  if (settingsLoading || menuLoading) {
    return <HeaderSkeleton />;
  }

  return (
    <header className={styles.headerMain}>
      <div className={styles.header}>
        <Link href="/" target={isAdminPage ? '_blank' : undefined} className={styles.logo}>
          <Image
            src={galinfoLogo}
            alt="Galinfo Logo"
            width={144}
            height={46}
            className={styles.logoImage}
          />
        </Link>
        <nav className={styles.headerNav}>
          <div className={styles.navListWrapper}>
            <ul className={styles.navList}>
              {/* Admin navigation */}
              {isAdminPage ? (
                <>
                  <li>
                    <Link href="/admin" className={styles.link}>
                      ПАНЕЛЬ
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/news" className={styles.link}>
                      НОВИНИ
                    </Link>
                  </li>
                  {isAdminRole && (
                    <li>
                      <Link href="/admin/categories" className={styles.link}>
                        КАТЕГОРІЇ
                      </Link>
                    </li>
                  )}
                  {isAdminRole && (
                    <li>
                      <Link href="/admin/tags" className={styles.link}>
                        ТЕГИ
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/admin/gallery" className={styles.link}>
                      ГАЛЕРЕЯ
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/videos" className={styles.link}>
                      ВІДЕО
                    </Link>
                  </li>
                  {isAdminRole && (
                    <li>
                      <Link href="/admin/users" className={styles.link}>
                        КОРИСТУВАЧІ
                      </Link>
                    </li>
                  )}
                  {isAdminRole && (
                    <li>
                      <Link href="/admin/advertisements" className={styles.link}>
                        РЕКЛАМА
                      </Link>
                    </li>
                  )}
                  {isAdminRole && (
                    <li>
                      <Link href="/admin/telegram-settings" className={styles.link}>
                        TELEGRAM
                      </Link>
                    </li>
                  )}
                  {isAdminRole && (
                    <li>
                      <Link href="/admin/templates" className={styles.link}>
                        ШАБЛОНИ
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/admin/settings/2fa" className={styles.link}>
                      БЕЗПЕКА
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  {/* Dynamic main categories from database - ordered by settings */}
                  {(orderedMainNav.length > 0 ? orderedMainNav : mainCategories.slice(0, 8)).map((category) => (
                    <li key={category.id}>
                      <Link href={generateCategoryUrl(category.id) || category.link} className={styles.link}>
                        {category.title?.toUpperCase()}
                      </Link>
                    </li>
                  ))}

                  {/* Fallback to static categories if no dynamic data */}
                  {mainCategories.length === 0 && (
                    <>
                      <li>
                        <Link href={paths.society} className={styles.link}>
                          СУСПІЛЬСТВО
                        </Link>
                      </li>
                      <li>
                        <Link href={paths.politics} className={styles.link}>
                          ПОЛІТИКА
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
                    </>
                  )}
                </>
              )}
            </ul>
          </div>

        </nav>
        {!isAdminPage && (
          <div className={styles.moreNewsItem}>
            <Link
              href="#"
              onMouseEnter={() => setIsMoreNewsOpen(true)}
              className={styles.link}
            >
              БІЛЬШЕ НОВИН...
            </Link>
          </div>
        )}
        <div className={styles.burgerMenuContainer}>
          <div
            className={styles.burgerMenuIcon}
            onClick={toggleMenu}
          >
            <Image src={burgerMenu} alt={'Burger menu'}/>
          </div>
          <div className={styles.svgBox}>
            {!isAdminPage && <SearchBox/>}
            {!isAdminPage && <a className={styles.radioLogo} target={'_blank'} href={'https://lviv.fm/'}>
              <Image
                src={radioLogo}
                alt="Radio Logo"
                width={120}
                height={40}
              />
            </a>}
            {/* Admin logout button - only show if admin is authenticated and on admin page */}
            {user && isAdminPage && (
              <div className={styles.adminSection}>
                <div className={styles.adminUserInfo}>
                  <span className={styles.adminUserName} title={user.name}>
                  <a  href={'/admin'}>
                    {user.name}
                    </a>
                  </span>
                  <span className={styles.adminUserRole}>
                    {ROLE_LABELS[user.role as UserRole] || user.role}
                  </span>
                </div>
                <button 
                  className={styles.adminLogoutButton} 
                  onClick={logout}
                  title="Вийти"
                >
                  <Image
                    src={logoutIcon}
                    alt="Вийти"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {!isAdminPage && (
        <div
          onMouseLeave={() => setIsMoreNewsOpen(false)}
          className={`${styles.moreNewsBlock} ${isMoreNewsOpen ? styles.open : ''}`}
        >
        <div className={styles.flexContainer}>
          {/* ТОП ТЕМИ */}
          {headerSettings?.moreNewsDropdown?.topThemes?.enabled !== false && (
            <div className={styles.column}>
              <h3 className={styles.title}>ТОП ТЕМИ</h3>
              <div className={styles.divider}></div>
              <ul className={styles.list}>
                {(orderedTopThemes.length > 0 ? orderedTopThemes : specialThemesItem).map((region) => (
                  <Link key={region.id} href={generateCategoryUrl(region.id) || region.link} className={styles.linkSlider}>
                    {region.title?.toUpperCase()}
                  </Link>
                ))}
                {/* Fallback to static regions if no dynamic data */}
                {specialThemesItem.length === 0 && (                <>
                    <Link href={paths.frankConversation} className={styles.linkSlider}>
                      ВІДВЕРТА РОЗМОВА З
                    </Link>
                    <Link href={paths.lvivDistricts} className={styles.linkSlider}>РАЙОНИ ЛЬВОВА</Link>
                    <Link href={paths.pressService} className={styles.linkSlider}>ПРЕССЛУЖБА</Link>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* КАТЕГОРІЇ */}
          {headerSettings?.moreNewsDropdown?.categories?.enabled !== false && (
            <div className={styles.categoriesColumn}>
              <h3 className={styles.title}>КАТЕГОРІЇ</h3>
              <div className={styles.divider}></div>
              <div className={styles.grid}>
                {/* Підколонка 1 - Регіони */}
                <div className={styles.gridColumn}>
                  {(orderedRegions.length > 0 ? orderedRegions : regions).map((region) => (
                    <Link key={region.id} href={generateCategoryUrl(region.id) || region.link} className={styles.linkSlider}>
                      {region.title?.toUpperCase()}
                    </Link>
                  ))}
                  {/* Fallback to static regions if no dynamic data */}
                  {regions.length === 0 && (
                    <>
                      <Link href={paths.lvivRegion} className={styles.linkSlider}>
                        ЛЬВІВЩИНА
                      </Link>
                      <Link href={paths.ternopilRegion} className={styles.linkSlider}>
                        ТЕРНОПІЛЬЩИНА
                      </Link>
                      <Link href={paths.volyn} className={styles.linkSlider}>
                        ВОЛИНЬ
                      </Link>
                      <Link href={paths.ukraine} className={styles.linkSlider}>
                        УКРАЇНА
                      </Link>
                      <Link href={paths.eu} className={styles.linkSlider}>
                        ЄС
                      </Link>
                      <Link href={paths.world} className={styles.linkSlider}>
                        СВІТ
                      </Link>
                    </>
                  )}
                </div>

                {/* Підколонка 2 - Теми */}
                <div className={styles.gridColumn}>
                  {(orderedMainCatCol2.length > 0 ? orderedMainCatCol2 : mainCategories.slice(0, 5)).map((category) => (
                    <Link key={category.id} href={generateCategoryUrl(category.id) || category.link} className={styles.linkSlider}>
                      {category.title?.toUpperCase()}
                    </Link>
                  ))}
                  {/* Fallback to static categories if no dynamic data */}
                  {mainCategories.length === 0 && (
                    <>
                      <Link href={paths.society} className={styles.linkSlider}>
                        СУСПІЛЬСТВО
                      </Link>
                      <Link href={paths.politics} className={styles.linkSlider}>
                        ПОЛІТИКА
                      </Link>
                      <Link href={paths.economy} className={styles.linkSlider}>
                        ЕКОНОМІКА
                      </Link>
                      <Link href={paths.culture} className={styles.linkSlider}>
                        КУЛЬТУРА
                      </Link>
                      <Link href={paths.health} className={styles.linkSlider}>
                        ЗДОРОВ'Я
                      </Link>
                    </>
                  )}
                </div>

                {/* Підколонка 3 - Додаткові теми */}
                <div className={styles.gridColumn}>
                  {orderedMainCatCol3.map((category) => (
                    <Link key={category.id} href={generateCategoryUrl(category.id) || category.link} className={styles.linkSlider}>
                      {category.title?.toUpperCase()}
                    </Link>
                  ))}
                  {/* Fallback to static categories if no dynamic data */}
                  {mainCategories.length === 0 && (
                    <>
                      <Link href={paths.sport} className={styles.linkSlider}>
                        СПОРТ
                      </Link>
                      <Link href={paths.crime} className={styles.linkSlider}>
                        КРИМІНАЛ
                      </Link>
                      <Link href={paths.emergency} className={styles.linkSlider}>
                        НАДЗВИЧАЙНІ ПОДІЇ
                      </Link>
                      <Link href={paths.history} className={styles.linkSlider}>
                        ІСТОРІЯ
                      </Link>
                      <Link href={paths.technologies} className={styles.linkSlider}>
                        ТЕХНОЛОГІЇ
                      </Link>
                    </>
                  )}
                </div>

                {/* Підколонка 4 - Типи контенту */}
                <div className={styles.gridColumn}>
                  {(orderedAdditionalItems.length > 0 ? orderedAdditionalItems : additionalItems.slice(0, 2)).map((item: any) => (
                    <Link key={item.param} href={item.link} className={styles.linkSlider}>
                      {item.title.toUpperCase()}
                    </Link>
                  ))}
                  {/* Fallback to static items if no dynamic data */}
                  {additionalItems.length === 0 && (
                    <>
                      <Link href={paths.news} className={styles.linkSlider}>
                        НОВИНА
                      </Link>
                      <Link href={paths.article} className={styles.linkSlider}>
                        СТАТТЯ
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      )}
      {
        isAdminPage ? null : <div className={styles.secondaryHeaderBox}>
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
                  {
                    loading ? Array.from({length: 5}).map((_, index) => (
                      <Skeleton.Input
                        key={index}
                        active
                        style={{width: '100%', height: 16}}
                      />
                    )) : importantNews && importantNews.map((item, index) => (
                      <Link key={index} href={`/news/${item.urlkey}_${item.id}`} className={styles.newInfoLink}>
                        <p className={styles.gradientTextStart}>{item.nheader}</p>
                        <Image src={dotIcon} alt="Dot Logo" width={8} height={8}/>
                      </Link>
                    ))
                  }
                  {
                    loading ? Array.from({length: 5}).map((_, index) => (
                      <Skeleton.Input
                        key={index}
                        active
                        style={{width: '100%', height: 16}}
                      />
                    )) : importantNews && importantNews.map((item, index) => (
                      <Link key={index} href={`/news/${item.urlkey}_${item.id}`} className={styles.newInfoLink}>
                        <p className={styles.gradientTextStart}>{item.nheader}</p>
                        <Image src={dotIcon} alt="Dot Logo" width={8} height={8}/>
                      </Link>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      <div className={styles.infoSection}>
        <div className={styles.weatherBox}>
          {
            weatherLoading ?
              <div style={{width: '35px'}}>
                <Skeleton.Button
                  active
                  size="small"
                  style={{width: '100%', height: '18px', minWidth: '35px'}}
                />
              </div>
              : <div className={styles.sityText}>{weather?.temp}°C</div>
          }

          <Image src={locationIcon} alt={'location'}/>
          <div className={styles.sityText}>ЛЬВІВ</div>
        </div>

        <div className={styles.exchangeBox}>
          {rates?.map((rate: RateRow, index) => (
            <div key={rate.currency} className={styles.exchangeItemWrapper}>
              <div className={styles.exchangeItem}>
                <div className={styles.exchangeType}>{rate.currency}</div>
                <div className={styles.exchangeValue}>{rate.interbank.toFixed(2)}</div>
              </div>
              {/* Додаємо вертикальний роздільник після першого елемента */}
              {index < rates.length - 1 && (
                <div className={styles.verticalBorder}></div>
              )}
            </div>
          ))}
        </div>
      </div>
      {isMenuOpen && (
        <div className={`${styles.fullScreenMenu} ${isClosing ? styles.fadeOut : styles.fadeIn}`}>
          <aside className={styles.sidebar}>
            <div className={styles.mobileSearchWrapper} ref={searchRef}>
              <Input.Search
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Пошук новин..."
                suffix={<Image
                  src={searchIcon}
                  alt="Search"
                  width={20}
                  height={20}
                  className={styles.searchIcon}
                />}
                className={styles.input}
              />

              {/* Dropdown з результатами */}
              {(searchResults.length > 0 || isSearchLoading || searchError) && (
                <div className={styles.mobileSearchDropdown}>
                  {isSearchLoading ? (
                    <div className={styles.searchLoading}>
                      <Spin size="small" />
                      <span>Пошук...</span>
                    </div>
                  ) : searchError ? (
                    <div className={styles.searchError}>
                      <span>{searchError}</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className={styles.searchNoResults}>
                      <span>Нічого не знайдено</span>
                    </div>
                  ) : (
                    <>
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/news/${item.urlkey}_${item.id}`}
                          className={styles.searchResultItem}
                          onClick={handleSearchResultClick}
                        >
                          <div className={styles.searchResultContent}>
                            {item.images && item.images.length > 0 && (
                              <div className={styles.searchResultImage}>
                                <Image
                                  src={item.images[0].urls.tmb}
                                  alt={item.images[0].title || item.nheader}
                                  width={60}
                                  height={40}
                                  className={styles.searchImage}
                                />
                              </div>
                            )}
                            <div className={styles.searchResultText}>
                              <div className={styles.searchResultTitle}>
                                {item.nheader}
                              </div>
                              {item.nsubheader && (
                                <div className={styles.searchResultSubtitle}>
                                  {item.nsubheader}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        className={styles.searchViewAllButton}
                        onClick={handleSearchResultClick}
                      >
                        Всі результати
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Admin Mobile Menu */}
            {isAdminPage ? (
              <>
                <h3 className={styles.sectionTitle}>АДМІНІСТРУВАННЯ</h3>
                <hr className={styles.divider}/>
                <div className={styles.categories}>
                  <Link className={styles.textCategory} href="/admin">ПАНЕЛЬ</Link>
                  <Link className={styles.textCategory} href="/admin/news">НОВИНИ</Link>
                  {isAdminRole && <Link className={styles.textCategory} href="/admin/categories">КАТЕГОРІЇ</Link>}
                  {isAdminRole && <Link className={styles.textCategory} href="/admin/tags">ТЕГИ</Link>}
                  <Link className={styles.textCategory} href="/admin/gallery">ГАЛЕРЕЯ</Link>
                  <Link className={styles.textCategory} href="/admin/videos">ВІДЕО</Link>
                  {isAdminRole && <Link className={styles.textCategory} href="/admin/users">КОРИСТУВАЧІ</Link>}
                  {isAdminRole && <Link className={styles.textCategory} href="/admin/advertisements">РЕКЛАМА</Link>}
                  {isAdminRole && <Link className={styles.textCategory} href="/admin/telegram-settings">TELEGRAM</Link>}
                  {isAdminRole && <Link className={styles.textCategory} href="/admin/templates">ШАБЛОНИ</Link>}
                  <Link className={styles.textCategory} href="/admin/settings/2fa">БЕЗПЕКА</Link>
                </div>
              </>
            ) : (
              <>
                {/* ТОП ТЕМИ - Mobile */}
                {headerSettings?.mobileMenu?.topThemes?.enabled !== false && (
                  <>
                    <h3 className={styles.sectionTitle}>
                    ТОП ТЕМИ
                    </h3>
                    <hr className={styles.divider}/>
                    <ul className={styles.topicsList}>
                      {(orderedMobileTopThemes.length > 0 ? orderedMobileTopThemes : specialThemesItem).map((theme) => (
                        <li key={theme.id}>
                          <Link className={styles.textCategory} href={generateCategoryUrl(theme.id) || theme.link}>
                            {theme.title?.toUpperCase()}
                          </Link>
                        </li>
                      ))}
                      {/* Fallback if no dynamic data */}
                      {specialThemesItem.length === 0 && (
                        <>
                          <li><Link className={styles.textCategory} href="#">ВІДВЕРТА РОЗМОВА З</Link></li>
                          <li><Link className={styles.textCategory} href="#">РАЙОНИ ЛЬВОВА</Link></li>
                          <li><Link className={styles.textCategory} href="#">ПРЕССЛУЖБА</Link></li>
                        </>
                      )}
                    </ul>
                  </>
                )}

                {/* Categories - Mobile */}
                {headerSettings?.mobileMenu?.categories?.enabled !== false && (
                  <>
                    <h3 className={styles.sectionTitle}>КАТЕГОРІЇ</h3>
                    <hr className={styles.divider}/>
                    <div className={styles.categories}>
                      {/* Dynamic categories from database - ordered */}
                      {(orderedMobileRegions.length > 0 ? orderedMobileRegions : regions).map((region) => (
                        <Link key={region.id} className={styles.textCategory} href={generateCategoryUrl(region.id) || region.link}>
                          {region.title?.toUpperCase()}
                        </Link>
                      ))}
                      {(orderedMobileMainCategories.length > 0 ? orderedMobileMainCategories : mainCategories).map((category) => (
                        <Link key={category.id} className={styles.textCategory} href={generateCategoryUrl(category.id) || category.link}>
                          {category.title?.toUpperCase()}
                        </Link>
                      ))}

                      {/* Fallback to static categories if no dynamic data */}
                      {regions.length === 0 && mainCategories.length === 0 && (
                        <>
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
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
           {!isAdminPage && <div className={styles.radioBox}>
              <a className={styles.radioLogo} target={'_blank'} href={'https://lviv.fm/'}>
                <Image
                  src={radioLogo}
                  alt="Radio Logo"
                  width={120}
                  height={40}
                />
              </a>
            </div>}

            {/* Admin section in mobile menu */}
            {user && isAdminPage && (
              <div className={styles.mobileAdminSection}>
                <div className={styles.mobileAdminInfo}>
                  <span className={styles.mobileAdminUserName} title={user.name}>
                    <a  href={'/admin'}>
                      {user.name}
                    </a>
                  </span>
                  <span className={styles.mobileAdminRole}>
                    {ROLE_LABELS[user.role as UserRole] || user.role}
                  </span>
                  <span className={styles.mobileAdminEmail}>{user.email}</span>
                </div>
                <button 
                  className={styles.mobileAdminLogoutButton} 
                  onClick={logout}
                  title="Вийти"
                >
                  <Image
                    src={logoutIcon}
                    alt="Вийти"
                    width={20}
                    height={20}
                  />
                  <span>Вийти</span>
                </button>
              </div>
            )}

          </aside>
        </div>
      )}
    </header>
  )
}