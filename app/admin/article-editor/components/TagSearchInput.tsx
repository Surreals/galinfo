"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input, AutoComplete } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface TagSuggestion {
  id: number;
  tag: string;
  newsCount?: number;
}

interface TagSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export default function TagSearchInput({ value, onChange, placeholder, onSearch }: TagSearchInputProps) {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch tag suggestions from API
  const fetchSuggestions = useCallback(async (keyword: string | undefined) => {
    const searchTerm = keyword || '';
    if (!searchTerm || searchTerm.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tags?keyword=${encodeURIComponent(searchTerm)}&perPage=10`);
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
  const debouncedSearch = useCallback((keyword: string | undefined) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    const searchTerm = keyword || '';
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);
  }, [fetchSuggestions]);

  // Handle input change
  const handleInputChange = (inputValue: string | undefined) => {
    const value = inputValue || '';
    onChange(value);
    
    if (value.length > 0) {
      setShowSuggestions(true);
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (selectedTag: string) => {
    onChange(selectedTag);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Trigger search if onSearch is provided
    if (onSearch) {
      onSearch(selectedTag);
    }
  };

  // Handle search
  const handleSearch = (searchValue: string | undefined) => {
    if (onSearch) {
      onSearch(searchValue || '');
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
    <div style={{ position: 'relative', width: '100%' }}>
      <AutoComplete
        value={value}
        onChange={handleInputChange}
        onSelect={handleSuggestionSelect}
        onSearch={handleSearch}
        options={showSuggestions ? autocompleteOptions : []}
        placeholder={placeholder}
        style={{ width: '100%' }}
        allowClear
        filterOption={false} // Disable client-side filtering since we're using server-side search
      />
      <SearchOutlined 
        style={{ 
          position: 'absolute', 
          right: '8px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: '#999',
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
}
