'use client';

import { useEffect, useState } from 'react';
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
  LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../ui/Button';
import { Tooltip } from '../../../ui/Tooltip';
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

export function Toolbar({
  items,
  core,
  currentMode,
  onModeToggle,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const { t } = useTranslation();
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
    <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-200 bg-gray-50 flex-wrap">
      {/* Undo */}
      <Tooltip content={t('editor.toolbar.undo', '실행 취소')} position="bottom">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canUndo}
          onClick={() => core?.undo()}
          className="p-1.5 h-8 w-8"
          aria-label={t('editor.toolbar.undo', '실행 취소')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6"/>
            <path d="M3 13C5.4 7.4 10.7 4 16.5 4c3.6 0 6.5 1.1 8.5 2.7"/>
          </svg>
        </Button>
      </Tooltip>

      {/* Redo */}
      <Tooltip content={t('editor.toolbar.redo', '다시 실행')} position="bottom">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canRedo}
          onClick={() => core?.redo()}
          className="p-1.5 h-8 w-8"
          aria-label={t('editor.toolbar.redo', '다시 실행')}
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

        const IconComponent = item.icon ? ICON_MAP[item.icon] : null;
        const label = t(item.labelKey, item.labelKey);
        const activeKey = FORMAT_ACTIVE_IDS[item.id];
        const isActive = activeKey ? formatActive[activeKey] : false;

        return (
          <Tooltip key={item.id} content={label} position="bottom">
            <Button
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
            ? t('editor.mode.markdown', '마크다운')
            : t('editor.mode.text', '리치 텍스트')
        }
        position="bottom"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onModeToggle}
          className="flex items-center gap-1 px-2 h-8 text-xs font-medium"
          aria-label={t('editor.toolbar.switchMode', '모드 전환')}
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
