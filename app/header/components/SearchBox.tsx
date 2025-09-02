"use client";

import { useState, useCallback } from "react";
import { Input } from "antd";
import Image from "next/image";
import Link from "next/link";
import throttle from "lodash.throttle";
import searchIcon from "@/assets/icons/searchIcon.svg";

import styles from "../Header.module.scss";

export default function SearchBox() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // throttled search handler
  const handleSearch = useCallback(
    throttle(async (value: string) => {
      if (!value.trim()) {
        setSearchResults([]);
        return;
      }


      // try {
      //   // тут зроби свій API виклик
      //   const res = await fetch(`/search?q=${value}&page=1`);
      //   const data = await res.json();
      //   setSearchResults(data.results || []);
      // } catch (e) {
      //   console.error("Search error", e);
      // }
    }, 600),
    []
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      // запускаємо анімацію закриття
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }, 300); // має збігатись з animation-duration
    } else {
      setIsSearchOpen(true);
    }
  };

  return (
    <div className={styles.searchWrapper}>
      {/* Іконка пошуку */}
      <div className={styles.searchIcon} onClick={toggleSearch}>
        <Image src={searchIcon} alt="Search Logo" width={24} height={24} />
      </div>

      {/* Інпут з анімацією */}
      {isSearchOpen && (
        <div>
          <div
            className={`${styles.searchInputBox} ${
              isClosing ? styles.slideOut : ""
            }`}
          >
            <Input
              value={searchQuery}
              onChange={onChange}
              placeholder="Пошук..."
              autoFocus
              className={styles.searchInput}
            />

            {/* Dropdown з результатами */}
            {searchResults.length > 0 && (
              <div className={styles.searchDropdown}>
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className={styles.searchResultItem}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
