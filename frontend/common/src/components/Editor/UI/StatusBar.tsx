import { useLanguage } from '../../../utils';

interface StatusBarProps {
  currentMode: 'text' | 'markdown';
  charCount: number;
  cursorLine: number;
  cursorColumn: number;
}

export function StatusBar({ currentMode, charCount, cursorLine, cursorColumn }: StatusBarProps) {
  const { t } = useLanguage();

  const modeLabel =
    currentMode === 'text'
      ? t('editor.mode.text', { defaultValue: '리치 텍스트' })
      : t('editor.mode.markdown', { defaultValue: '마크다운' });

  return (
    <div className="flex items-center justify-between px-3 py-1 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 select-none">
      <span>{modeLabel}</span>
      <div className="flex items-center gap-3">
        <span>
          {t('editor.status.cursor', {
            defaultValue: '{{line}}:{{col}}',
            line: cursorLine,
            col: cursorColumn,
          })}
        </span>
        <span>
          {t('editor.status.chars', { defaultValue: '{{count}}자', count: charCount })}
        </span>
      </div>
    </div>
  );
}
