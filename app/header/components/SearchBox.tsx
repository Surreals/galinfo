"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Input, Spin } from "antd";
import Image from "next/image";
import Link from "next/link";
import searchIcon from "@/assets/icons/searchIcon.svg";

import styles from "../Header.module.scss";

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

export default function SearchBox() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // debounced search handler
  const handleSearch = useCallback(
    debounce(async (value: string) => {
      if (!value.trim()) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/news/search?q=${encodeURIComponent(value)}&limit=5&lang=1`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Помилка пошуку');
        }
        
        setSearchResults(data.searchResults || []);
      } catch (e) {
        console.error("Search error", e);
        setError(e instanceof Error ? e.message : 'Помилка пошуку');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const clearSearch = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
    }, 300);
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      clearSearch();
    } else {
      setIsSearchOpen(true);
    }
  };

  // Закрити пошук при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (isSearchOpen) {
          clearSearch();
        }
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Очищення debounce при розмонтуванні компонента
  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  }, [handleSearch]);

  return (
    <div className={styles.searchWrapper} ref={searchRef}>
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
              placeholder="Пошук новин..."
              autoFocus
              className={styles.searchInput}
            />

            {/* Dropdown з результатами */}
            {(searchResults.length > 0 || isLoading || error) && (
              <div className={styles.searchDropdown}>
                {isLoading ? (
                  <div className={styles.searchLoading}>
                    <Spin size="small" />
                    <span>Пошук...</span>
                  </div>
                ) : error ? (
                  <div className={styles.searchError}>
                    <span>{error}</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className={styles.searchNoResults}>
                    <span>Нічого не знайдено</span>
                  </div>
                ) : (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.urlkey}_${item.id}`}
                      className={styles.searchResultItem}
                      onClick={clearSearch}
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
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
