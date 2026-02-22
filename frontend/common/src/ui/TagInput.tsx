'use client';

import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import useLanguage from '../utils/i18n/hooks/useLanguage';

interface TagInputProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagInput({
  selected,
  onChange,
  placeholder,
  maxTags = 10,
  className = '',
}: TagInputProps) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t('form.placeholder.tagName');
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().replace(/^#/, '');
    if (!trimmedTag) return;
    if (selected.includes(trimmedTag)) {
      setInputValue('');
      return;
    }
    if (selected.length >= maxTags) return;

    onChange([...selected, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(selected.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && selected.length > 0) {
      removeTag(selected.length - 1);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-blue-500 transition-all ${className}`}>
      {selected.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium rounded-full"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="hover:text-blue-900 dark:hover:text-blue-100 focus:outline-none"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={selected.length === 0 ? resolvedPlaceholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
      />
      {maxTags && (
        <span className="text-[10px] text-gray-400 ml-auto">
          {selected.length}/{maxTags}
        </span>
      )}
    </div>
  );
}
