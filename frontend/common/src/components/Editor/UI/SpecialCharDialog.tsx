'use client';

import { useTranslation } from 'react-i18next';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';

const SPECIAL_CHARS = [
  { group: '기호', chars: ['©', '®', '™', '°', '±', '×', '÷', '≠', '≈', '∞', '√', 'π', '∑', '∆', '∏'] },
  { group: '화살표', chars: ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇑', '⇓', '⇔', '⟵', '⟶', '⟷'] },
  { group: '따옴표', chars: ['\u201C', '\u201D', '\u2018', '\u2019', '«', '»', '\u2039', '\u203A', '\u201E', '\u201F', '\u201A', '\u201B'] },
  { group: '구두점', chars: ['—', '–', '…', '·', '•', '‣', '⁃', '※', '†', '‡', '§', '¶', '¿', '¡'] },
  { group: '수학', chars: ['½', '¼', '¾', '⅓', '⅔', '⅛', '⅜', '⅝', '⅞', '∂', '∈', '∉', '∩', '∪', '⊂', '⊃'] },
  { group: '통화', chars: ['€', '£', '¥', '¢', '₩', '₹', '₽', '₿', 'ƒ'] },
];

interface SpecialCharDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (char: string) => void;
}

export function SpecialCharDialog({ isOpen, onClose, onSelect }: SpecialCharDialogProps) {
  const { t } = useTranslation();

  const handleSelect = (char: string) => {
    onSelect(char);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editor.toolbar.specialChar', '특수문자')}
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('ui.button.close', '닫기')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {SPECIAL_CHARS.map(({ group, chars }) => (
          <div key={group}>
            <p className="text-xs font-medium text-gray-500 mb-1.5">{group}</p>
            <div className="flex flex-wrap gap-1">
              {chars.map((char) => (
                <button
                  key={char}
                  onClick={() => handleSelect(char)}
                  className="w-8 h-8 flex items-center justify-center text-base rounded border border-gray-200 hover:bg-gray-100 hover:border-gray-400 transition-colors font-mono"
                  title={char}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
