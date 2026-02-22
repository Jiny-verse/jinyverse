'use client';

import useLanguage from '../utils/i18n/hooks/useLanguage';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
}: PaginationProps) {
  const { t } = useLanguage();
  const effectiveTotalPages = Math.max(1, totalPages);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (effectiveTotalPages <= maxVisible) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(effectiveTotalPages);
      } else if (currentPage >= effectiveTotalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = effectiveTotalPages - 3; i <= effectiveTotalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(effectiveTotalPages);
      }
    }

    return pages;
  };

  const boxSize = 'min-w-7 h-7';
  const boxClass = `inline-flex items-center justify-center rounded border border-gray-200 bg-gray-100 px-1.5 py-1 text-xs text-gray-600 transition-colors ${boxSize}`;
  const selectedBoxClass = `inline-flex items-center justify-center rounded border border-gray-200 bg-gray-700 px-1.5 py-1 text-xs text-white ${boxSize}`;
  const disabledClass = 'cursor-not-allowed opacity-50';

  return (
    <div className="inline-flex shrink-0 items-center gap-1">
      <button
        type="button"
        className={`${boxClass} ${currentPage === 1 ? disabledClass : 'hover:bg-gray-200'}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {t('common.previous')}
      </button>

      {showPageNumbers &&
        getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-7 min-w-7 items-center justify-center text-xs text-gray-500"
              >
                ...
              </span>
            );
          }

          const isSelected = currentPage === page;
          return (
            <button
              key={page}
              type="button"
              className={isSelected ? selectedBoxClass : `${boxClass} hover:bg-gray-200`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          );
        })}

      <button
        type="button"
        className={`${boxClass} ${currentPage === effectiveTotalPages ? disabledClass : 'hover:bg-gray-200'}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === effectiveTotalPages}
      >
        {t('common.next')}
      </button>
    </div>
  );
}
