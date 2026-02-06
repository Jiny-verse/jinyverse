'use client';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const BASE_CLASS =
  'h-8 px-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-1.5 focus:ring-(--focus-ring,#6b7280) focus:border-gray-400 min-w-[180px]';

export function SearchInput({
  value,
  onChange,
  placeholder = '검색',
  className = '',
}: SearchInputProps) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${BASE_CLASS} ${className}`}
      aria-label={placeholder}
    />
  );
}
