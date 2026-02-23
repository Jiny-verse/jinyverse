'use client';

import useLanguage from '../utils/i18n/hooks/useLanguage';

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

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
}: FilterSelectProps) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t('common.all');
  const allOptions = resolvedPlaceholder ? [{ value: '', label: resolvedPlaceholder }, ...options] : options;

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={ariaLabel ?? label}>
      <span className="text-xs text-muted-foreground whitespace-nowrap mr-0.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-border bg-background px-2 py-1 text-sm font-medium text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {allOptions.map((opt, i) => (
          <option key={opt.value !== '' ? opt.value : `__all__-${i}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
