'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';

interface TableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rows: number, cols: number, hasHeader: boolean) => void;
}

export function TableDialog({ isOpen, onClose, onConfirm }: TableDialogProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState('3');
  const [cols, setCols] = useState('3');
  const [hasHeader, setHasHeader] = useState(true);

  const handleConfirm = () => {
    const r = Math.max(1, Math.min(20, parseInt(rows) || 3));
    const c = Math.max(1, Math.min(10, parseInt(cols) || 3));
    onConfirm(r, c, hasHeader);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editor.dialog.table.title', '표 삽입')}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('ui.button.cancel', '취소')}
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleConfirm}>
            {t('ui.button.confirm', '확인')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('editor.dialog.table.rows', '행 수')}
            </label>
            <Input
              type="number"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              min={1}
              max={20}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('editor.dialog.table.cols', '열 수')}
            </label>
            <Input
              type="number"
              value={cols}
              onChange={(e) => setCols(e.target.value)}
              min={1}
              max={10}
            />
          </div>
        </div>

        {/* Preview grid */}
        <div>
          <p className="text-xs text-gray-500 mb-2">{t('editor.dialog.table.preview', '미리보기')}</p>
          <div className="overflow-auto max-h-32">
            <table className="border-collapse text-xs w-full">
              {Array.from({ length: Math.max(1, Math.min(20, parseInt(rows) || 3)) }).map((_, r) => (
                <tr key={r}>
                  {Array.from({ length: Math.max(1, Math.min(10, parseInt(cols) || 3)) }).map((_, c) => {
                    const isHdr = hasHeader && r === 0;
                    const Tag = isHdr ? 'th' : 'td';
                    return (
                      <Tag
                        key={c}
                        className={`border border-gray-300 px-2 py-1 ${isHdr ? 'bg-gray-100 font-medium' : 'bg-white'}`}
                      >
                        {isHdr ? `헤더 ${c + 1}` : ''}
                      </Tag>
                    );
                  })}
                </tr>
              ))}
            </table>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
            className="rounded"
          />
          {t('editor.dialog.table.hasHeader', '첫 행을 헤더로')}
        </label>
      </div>
    </Modal>
  );
}
