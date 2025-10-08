"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input, AutoComplete, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface TagSuggestion {
  id: number;
  tag: string;
  newsCount?: number;
}

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  status?: 'error' | 'warning';
}

export default function TagInput({ value, onChange, placeholder, status }: TagInputProps) {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

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
    
    onChange(newValue);
    setCursorPosition(newCursorPosition);
    
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
    const tags = parseTags(value);
    const currentTagValue = getCurrentTag(value, cursorPosition);
    
    // Replace the current tag being typed with the selected suggestion
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    const beforeCurrentTag = beforeCursor.substring(0, beforeCursor.lastIndexOf(currentTagValue));
    
    let newValue = '';
    if (tags.length === 1 && currentTagValue === tags[0]) {
      // If this is the first tag, just use the selected tag
      newValue = selectedTag;
    } else if (beforeCurrentTag.endsWith(',') || beforeCurrentTag === '') {
      // If we're at the beginning or after a comma
      newValue = beforeCurrentTag + selectedTag + afterCursor;
    } else {
      // If we're in the middle of a tag, replace it and add comma if needed
      newValue = beforeCurrentTag + selectedTag + (afterCursor.startsWith(',') ? '' : ',') + afterCursor;
    }
    
    onChange(newValue);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Focus back to input after selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = newValue.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle input focus
  const handleFocus = () => {
    const currentTagValue = getCurrentTag(value, cursorPosition);
    if (currentTagValue.length > 0) {
      setShowSuggestions(true);
      debouncedSearch(currentTagValue);
    }
  };

  // Handle input blur
  const handleBlur = () => {
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
    };
  }, []);

  // Prepare autocomplete options
  const autocompleteOptions = suggestions.map(tag => ({
    value: tag.tag,
    label: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{tag.tag}</span>
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
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        status={status}
        rows={2}
        style={{ position: 'relative' }}
      />
      
      {showSuggestions && autocompleteOptions.length > 0 && (
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
          {autocompleteOptions.map((option, index) => (
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
          ))}
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
