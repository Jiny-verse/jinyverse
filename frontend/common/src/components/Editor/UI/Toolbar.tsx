'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Minus,
  Palette,
  Highlighter,
  Hash,
  Type,
  AArrowUp,
  MessageSquare,
  Youtube,
  Table,
  LucideIcon,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Tooltip } from '../../../ui/Tooltip';
import { useLanguage } from '../../../utils';
import type { IEditorCore, ToolbarItem } from '../Types';

const ICON_MAP: Record<string, LucideIcon> = {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Minus,
  Palette,
  Highlighter,
  Hash,
  Type,
  AArrowUp,
  MessageSquare,
  Youtube,
  Table,
};

type FormatActive = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
};

const FORMAT_ACTIVE_IDS: Record<string, keyof FormatActive> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strike: 'strikethrough',
};

interface ToolbarProps {
  items: ToolbarItem[];
  core: IEditorCore | null;
  currentMode: 'text' | 'markdown';
  onModeToggle: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

function ColorPickerButton({ item, core, label }: { item: ToolbarItem; core: IEditorCore | null; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const IconComponent = item.icon ? ICON_MAP[item.icon] : null;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Tooltip content={label} position="bottom">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          className="p-1.5 h-8 w-8"
          aria-label={label}
          disabled={!core}
        >
          {IconComponent ? <IconComponent size={16} /> : label.slice(0, 2)}
        </Button>
      </Tooltip>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow-md p-2 flex flex-wrap gap-1 w-[148px]">
          {item.colorOptions?.map((color) => (
            <button
              type="button"
              key={color}
              title={color}
              onClick={() => {
                if (core) item.onColorSelect?.(color, core);
                setOpen(false);
              }}
              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color === 'transparent' ? '#fff' : color, backgroundImage: color === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 0 0 / 8px 8px' : undefined }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SelectButton({ item, core, label }: { item: ToolbarItem; core: IEditorCore | null; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const IconComponent = item.icon ? ICON_MAP[item.icon] : null;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Tooltip content={label} position="bottom">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          className="p-1.5 h-8 w-8"
          aria-label={label}
          disabled={!core}
        >
          {IconComponent ? <IconComponent size={16} /> : label.slice(0, 2)}
        </Button>
      </Tooltip>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow-md py-1 min-w-[100px]">
          {item.selectOptions?.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                if (core) item.onSelect?.(opt.value, core);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Toolbar({
  items,
  core,
  currentMode,
  onModeToggle,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const { t } = useLanguage();
  const [formatActive, setFormatActive] = useState<FormatActive>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });

  useEffect(() => {
    if (!core) return;
    const handler = (data: FormatActive) => setFormatActive(data);
    core.on('format:active', handler);
    return () => core.off('format:active', handler);
  }, [core]);

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 border-b border-gray-200 bg-gray-50 flex-wrap"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Undo */}
      <Tooltip content={t('editor.toolbar.undo', { defaultValue: '실행 취소' })} position="bottom">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canUndo}
          onClick={() => core?.undo()}
          className="p-1.5 h-8 w-8"
          aria-label={t('editor.toolbar.undo', { defaultValue: '실행 취소' })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6"/>
            <path d="M3 13C5.4 7.4 10.7 4 16.5 4c3.6 0 6.5 1.1 8.5 2.7"/>
          </svg>
        </Button>
      </Tooltip>

      {/* Redo */}
      <Tooltip content={t('editor.toolbar.redo', { defaultValue: '다시 실행' })} position="bottom">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canRedo}
          onClick={() => core?.redo()}
          className="p-1.5 h-8 w-8"
          aria-label={t('editor.toolbar.redo', { defaultValue: '다시 실행' })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6"/>
            <path d="M21 13C18.6 7.4 13.3 4 7.5 4 3.9 4 1 5.1-1 6.7"/>
          </svg>
        </Button>
      </Tooltip>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Dynamic toolbar items */}
      {items.map((item) => {
        if (item.type === 'separator') {
          return <div key={item.id} className="w-px h-5 bg-gray-300 mx-1" />;
        }

        const label = t(item.labelKey, { defaultValue: item.labelKey });

        if (item.type === 'color-picker') {
          return <ColorPickerButton key={item.id} item={item} core={core} label={label} />;
        }

        if (item.type === 'select') {
          return <SelectButton key={item.id} item={item} core={core} label={label} />;
        }

        const IconComponent = item.icon ? ICON_MAP[item.icon] : null;
        const activeKey = FORMAT_ACTIVE_IDS[item.id];
        const isActive = activeKey ? formatActive[activeKey] : false;

        return (
          <Tooltip key={item.id} content={label} position="bottom">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => item.action?.(core!)}
              className={`p-1.5 h-8 w-8 ${isActive ? 'bg-gray-200 ring-1 ring-gray-400' : ''}`}
              aria-label={label}
              aria-pressed={isActive}
              disabled={!core}
            >
              {IconComponent ? <IconComponent size={16} /> : label.slice(0, 2)}
            </Button>
          </Tooltip>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mode toggle */}
      <Tooltip
        content={
          currentMode === 'text'
            ? t('editor.mode.markdown', { defaultValue: '마크다운' })
            : t('editor.mode.text', { defaultValue: '리치 텍스트' })
        }
        position="bottom"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onModeToggle}
          className="flex items-center gap-1 px-2 h-8 text-xs font-medium"
          aria-label={t('editor.toolbar.switchMode', { defaultValue: '모드 전환' })}
        >
          {currentMode === 'text' ? (
            <>
              <Code2 size={16} />
              <span className="hidden sm:inline">MD</span>
            </>
          ) : (
            <>
              <AlignLeft size={16} />
              <span className="hidden sm:inline">RT</span>
            </>
          )}
        </Button>
      </Tooltip>
    </div>
  );
}
