'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpFromLine,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Trash2,
  PaintBucket,
  Baseline,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../ui/Button';
import { Tooltip } from '../../../ui/Tooltip';

const TABLE_BG_COLORS = [
  'transparent', '#ffffff', '#fef3c7', '#dcfce7',
  '#dbeafe', '#fae8ff', '#fee2e2', '#f3f4f6',
];
const TABLE_TEXT_COLORS = [
  '#000000', '#e03e3e', '#0f7b6c', '#0b6e99',
  '#6940a5', '#d9730d', '#374151', '#9ca3af',
];

function MiniColorPicker({
  colors,
  onSelect,
  label,
  icon: Icon,
}: {
  colors: string[];
  onSelect: (c: string) => void;
  label: string;
  icon: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Tooltip content={label} position="bottom">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="p-1.5 h-7 w-7"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon size={14} />
        </Button>
      </Tooltip>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow-md p-1.5 flex flex-wrap gap-1 w-[112px]">
          {colors.map((c) => (
            <button
              type="button"
              key={c}
              title={c}
              onClick={() => { onSelect(c); setOpen(false); }}
              className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{
                backgroundColor: c === 'transparent' ? '#fff' : c,
                backgroundImage:
                  c === 'transparent'
                    ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 0 0 / 6px 6px'
                    : undefined,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export interface TableToolbarProps {
  onAddRowAbove: () => void;
  onAddRowBelow: () => void;
  onDeleteRow: () => void;
  onAddColLeft: () => void;
  onAddColRight: () => void;
  onDeleteCol: () => void;
  onSetCellBgColor: (color: string) => void;
  onSetCellTextColor: (color: string) => void;
  onDeleteTable: () => void;
}

export function TableToolbar({
  onAddRowAbove,
  onAddRowBelow,
  onDeleteRow,
  onAddColLeft,
  onAddColRight,
  onDeleteCol,
  onSetCellBgColor,
  onSetCellTextColor,
  onDeleteTable,
}: TableToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-blue-200 bg-blue-50 flex-wrap">
      <span className="text-blue-700 font-semibold text-xs mr-1.5">표</span>

      <div className="w-px h-4 bg-blue-200 mx-0.5" />

      {/* Row operations */}
      <Tooltip content={t('editor.table.addRowAbove', '위에 행 추가')} position="bottom">
        <Button type="button" variant="ghost" size="sm" className="p-1.5 h-7 w-7 hover:bg-blue-100" onClick={onAddRowAbove}>
          <ArrowUpFromLine size={14} />
        </Button>
      </Tooltip>
      <Tooltip content={t('editor.table.addRowBelow', '아래에 행 추가')} position="bottom">
        <Button type="button" variant="ghost" size="sm" className="p-1.5 h-7 w-7 hover:bg-blue-100" onClick={onAddRowBelow}>
          <ArrowDownFromLine size={14} />
        </Button>
      </Tooltip>
      <Tooltip content={t('editor.table.deleteRow', '행 삭제')} position="bottom">
        <Button type="button" variant="ghost" size="sm" className="p-1.5 h-7 w-7 hover:bg-red-100 text-red-500" onClick={onDeleteRow}>
          <Trash2 size={14} />
        </Button>
      </Tooltip>

      <div className="w-px h-4 bg-blue-200 mx-0.5" />

      {/* Column operations */}
      <Tooltip content={t('editor.table.addColLeft', '왼쪽에 열 추가')} position="bottom">
        <Button type="button" variant="ghost" size="sm" className="p-1.5 h-7 w-7 hover:bg-blue-100" onClick={onAddColLeft}>
          <ArrowLeftFromLine size={14} />
        </Button>
      </Tooltip>
      <Tooltip content={t('editor.table.addColRight', '오른쪽에 열 추가')} position="bottom">
        <Button type="button" variant="ghost" size="sm" className="p-1.5 h-7 w-7 hover:bg-blue-100" onClick={onAddColRight}>
          <ArrowRightFromLine size={14} />
        </Button>
      </Tooltip>
      <Tooltip content={t('editor.table.deleteCol', '열 삭제')} position="bottom">
        <Button type="button" variant="ghost" size="sm" className="p-1.5 h-7 w-7 hover:bg-red-100 text-red-500" onClick={onDeleteCol}>
          <ArrowLeftFromLine size={14} className="opacity-0 absolute" />
          <Trash2 size={14} style={{ transform: 'rotate(90deg)' }} />
        </Button>
      </Tooltip>

      <div className="w-px h-4 bg-blue-200 mx-0.5" />

      {/* Cell color pickers */}
      <MiniColorPicker
        colors={TABLE_BG_COLORS}
        onSelect={onSetCellBgColor}
        label={t('editor.table.cellBgColor', '셀 배경색')}
        icon={PaintBucket}
      />
      <MiniColorPicker
        colors={TABLE_TEXT_COLORS}
        onSelect={onSetCellTextColor}
        label={t('editor.table.cellTextColor', '셀 글자색')}
        icon={Baseline}
      />

      <div className="flex-1" />

      {/* Delete table */}
      <Tooltip content={t('editor.table.deleteTable', '표 삭제')} position="bottom">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 px-2 h-7 text-red-600 text-xs hover:bg-red-100"
          onClick={onDeleteTable}
        >
          <Trash2 size={12} />
          <span className="hidden sm:inline">{t('editor.table.deleteTable', '표 삭제')}</span>
        </Button>
      </Tooltip>
    </div>
  );
}
