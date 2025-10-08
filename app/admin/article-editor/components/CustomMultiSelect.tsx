"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from '../NewsEditor.module.css';

interface Option {
  label: string;
  value: string;
}

interface CustomMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  showSearch?: boolean;
  notFoundContent?: string;
  loading?: boolean;
  status?: 'error' | 'warning';
}

export default function CustomMultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Оберіть опції",
  className = "",
  size = "middle",
  showSearch = false,
  notFoundContent = "Опції не знайдені",
  loading = false,
  status
}: CustomMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Фільтруємо опції за пошуковим запитом
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Закриваємо dropdown при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Фокусуємося на інпуті при відкритті dropdown
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOptionClick = (optionValue: string, event: React.MouseEvent) => {
    const isCtrlPressed = event.ctrlKey || event.metaKey;
    
    if (isCtrlPressed) {
      // Ctrl+click: додаємо або видаляємо з вибору, не закриваємо dropdown
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    } else {
      // Звичайний клік: замінюємо вибір на одну опцію і закриваємо dropdown
      onChange([optionValue]);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const removeTag = (tagValue: string) => {
    const newValue = value.filter(v => v !== tagValue);
    onChange(newValue);
  };

  const getSelectedLabels = () => {
    return value.map(val => {
      const option = options.find(opt => opt.value === val);
      return option ? option.label : val;
    });
  };

  const getInputClasses = () => {
    let classes = styles.customSelectInput;
    if (size === 'large') classes += ` ${styles.large}`;
    if (size === 'small') classes += ` ${styles.small}`;
    if (status === 'error') classes += ` ${styles.error}`;
    return classes;
  };

  const getDropdownClasses = () => {
    let classes = styles.customSelectDropdown;
    if (size === 'large') classes += ` ${styles.large}`;
    if (size === 'small') classes += ` ${styles.small}`;
    return classes;
  };

  return (
    <div className={`${styles.customSelectContainer} ${className}`} ref={dropdownRef}>
      {/* Input field with tags */}
      <div 
        className={getInputClasses()}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length > 0 ? (
          <div className={styles.selectedTags}>
            {getSelectedLabels().map((label, index) => (
              <span key={index} className={styles.selectedTag}>
                {label}
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(value[index]);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <div className={styles.selectArrow}>
          {isOpen ? '▲' : '▼'}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={getDropdownClasses()}>
          {showSearch && (
            <div className={styles.searchInput}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Пошук..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchField}
              />
            </div>
          )}
          
          <div className={styles.optionsList}>
            {loading ? (
              <div className={styles.loadingOption}>Завантаження...</div>
            ) : filteredOptions.length === 0 ? (
              <div className={styles.noOptions}>{notFoundContent}</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`${styles.option} ${
                    value.includes(option.value) ? styles.optionSelected : ''
                  }`}
                  onClick={(e) => handleOptionClick(option.value, e)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {value.includes(option.value) && (
                    <span className={styles.optionCheckmark}>✓</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
