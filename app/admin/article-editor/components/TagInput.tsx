"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input, AutoComplete, Tag } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { SearchOutlined } from '@ant-design/icons';

interface TagSuggestion {
  id: number;
  tag: string;
  newsCount?: number;
}

interface TagInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  status?: 'error' | 'warning';
}

export default function TagInput({ value = '', onChange, placeholder, status }: TagInputProps) {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [internalValue, setInternalValue] = useState(value);
  const [pendingValue, setPendingValue] = useState(value);
  const inputRef = useRef<TextAreaRef>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const updateDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal value with external value (only if not currently editing)
  useEffect(() => {
    if (pendingValue === value) {
      setInternalValue(value);
    }
  }, [value, pendingValue]);

  // Debounced update function
  const debouncedUpdate = useCallback((newValue: string) => {
    if (updateDebounceRef.current) {
      clearTimeout(updateDebounceRef.current);
    }
    
    updateDebounceRef.current = setTimeout(() => {
      setPendingValue(newValue);
      onChange?.(newValue);
    }, 2000);
  }, [onChange]);

  // Parse tags from the input value
  const parseTags = useCallback((tagString: string): string[] => {
    return tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }, []);

  // Get the current tag being typed (the last one after comma)
  const getCurrentTag = useCallback((value: string, cursorPos: number): string => {
    const tags = parseTags(value);
    const beforeCursor = value.substring(0, cursorPos);
    const afterLastComma = beforeCursor.split(',').pop() || '';
    return afterLastComma.trim();
  }, [parseTags]);

  // Fetch tag suggestions from API
  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (!keyword || keyword.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tags?keyword=${encodeURIComponent(keyword)}&perPage=10`);
      const result = await response.json();
      
      if (result.success) {
        setSuggestions(result.data || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback((keyword: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(keyword);
    }, 300);
  }, [fetchSuggestions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;
    
    setInternalValue(newValue);
    setCursorPosition(newCursorPosition);
    
    // Use debounced update instead of immediate onChange
    debouncedUpdate(newValue);
    
    const currentTagValue = getCurrentTag(newValue, newCursorPosition);
    setCurrentTag(currentTagValue);
    
    if (currentTagValue.length > 0) {
      setShowSuggestions(true);
      debouncedSearch(currentTagValue);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (selectedTag: string) => {
    const currentTagValue = getCurrentTag(internalValue, cursorPosition);
    
    // Simple approach: replace the current tag being typed with the selected tag
    let newValue = internalValue;
    
    // Find the position of the current tag being typed
    const beforeCursor = internalValue.substring(0, cursorPosition);
    const afterCursor = internalValue.substring(cursorPosition);
    
    // Replace the current incomplete tag with the selected tag
    const lastCommaIndex = beforeCursor.lastIndexOf(',');
    const startOfCurrentTag = lastCommaIndex >= 0 ? lastCommaIndex + 1 : 0;
    const beforeCurrentTag = internalValue.substring(0, startOfCurrentTag);
    const afterCurrentTag = internalValue.substring(cursorPosition);
    
    // Build the new value - add comma and space after selected tag
    const isFirstTag = beforeCurrentTag.trim() === '';
    const isAtEnd = afterCurrentTag.trim().length === 0;
    
    if (isFirstTag) {
      // First tag - just add tag + comma + space
      newValue = selectedTag + ', ' + afterCurrentTag.trimStart();
    } else {
      // Subsequent tags - add space + tag + comma + space
      newValue = beforeCurrentTag.trimEnd() + ' ' + selectedTag + ', ' + afterCurrentTag.trimStart();
    }
    
    // Clean up duplicate commas
    newValue = newValue.replace(/,\s*,/g, ',');
    
    // If we're at the end, ensure we have comma and space for next tag
    if (isAtEnd) {
      newValue = newValue.trim();
      if (!newValue.endsWith(', ')) {
        // Replace any trailing comma (with or without space) with exactly ", "
        newValue = newValue.replace(/,\s*$/, '') + ', ';
      }
    }
    
    setInternalValue(newValue);
    setPendingValue(newValue);
    onChange?.(newValue); // Immediate update for suggestion selection
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Focus back to input after selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        
        // Position cursor after the comma and space
        let newCursorPos = newValue.length; // Default to end
        
        if (!isAtEnd) {
          // We're in the middle, position after the selected tag and its comma
          if (isFirstTag) {
            newCursorPos = selectedTag.length + 2; // +2 for ", "
          } else {
            newCursorPos = beforeCurrentTag.trimEnd().length + 1 + selectedTag.length + 2; // +1 for space, +2 for ", "
          }
        }
        
        // Access the actual textarea element from Ant Design's TextArea component
        const textareaElement = inputRef.current.resizableTextArea?.textArea;
        if (textareaElement && typeof textareaElement.setSelectionRange === 'function') {
          textareaElement.setSelectionRange(newCursorPos, newCursorPos);
        }
      }
    }, 0);
  };

  // Handle input focus
  const handleFocus = () => {
    const currentTagValue = getCurrentTag(internalValue, cursorPosition);
    if (currentTagValue.length > 0) {
      setShowSuggestions(true);
      debouncedSearch(currentTagValue);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Apply any pending changes immediately on blur
    if (updateDebounceRef.current) {
      clearTimeout(updateDebounceRef.current);
      setPendingValue(internalValue);
      onChange?.(internalValue);
    }
    
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (updateDebounceRef.current) {
        clearTimeout(updateDebounceRef.current);
      }
    };
  }, []);

  // Function to highlight matching text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: '#fff3cd', fontWeight: 'bold' }}>
          {part}
        </span>
      ) : part
    );
  };

  // Prepare autocomplete options
  const autocompleteOptions = suggestions.map(tag => ({
    value: tag.tag,
    label: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{highlightText(tag.tag, currentTag)}</span>
        {tag.newsCount && (
          <span style={{ color: '#999', fontSize: '12px' }}>
            {tag.newsCount} новин
          </span>
        )}
      </div>
    ),
  }));

  return (
    <div style={{ position: 'relative' }}>
      <Input.TextArea
        ref={inputRef}
        value={internalValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        status={status}
        rows={2}
        style={{ position: 'relative' }}
      />
      
      {showSuggestions && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #e9e9e9',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {autocompleteOptions.length > 0 ? (
            autocompleteOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionSelect(option.value)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: index < autocompleteOptions.length - 1 ? '1px solid #f0f0f0' : 'none',
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f7f7f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '10px 12px',
                color: '#999',
                fontSize: '14px',
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              Тегів не знайдено
            </div>
          )}
        </div>
      )}
      
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #e9e9e9',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: '10px 12px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
            zIndex: 1000,
          }}
        >
          <SearchOutlined spin style={{ marginRight: '8px' }} /> Завантаження...
        </div>
      )}
    </div>
  );
}
