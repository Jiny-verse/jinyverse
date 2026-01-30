'use client';

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  'aria-label'?: string;
}

/** 라벨 + 버튼 그룹 형태 필터 (셀렉트 대신 터치하기 좋은 토글) */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = '전체',
  'aria-label': ariaLabel,
}: FilterSelectProps) {
  const allOptions = placeholder ? [{ value: '', label: placeholder }, ...options] : options;

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={ariaLabel ?? label}>
      <span className="text-xs text-gray-500 whitespace-nowrap mr-0.5">{label}</span>
      <span className="inline-flex rounded-md border border-gray-300 bg-gray-50/80 p-0.5">
        {allOptions.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value || '__all__'}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`h-6 min-w-8 px-2 rounded text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </span>
    </div>
  );
}
