'use client';

import { useEffect, useState } from 'react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { useLanguage } from '../../../utils';

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, text: string) => void;
  initialText?: string;
}

export function LinkDialog({ isOpen, onClose, onConfirm, initialText }: LinkDialogProps) {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText(initialText ?? '');
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    if (!url.trim()) return;
    const normalizedUrl =
      /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    onConfirm(normalizedUrl, text.trim());
    setUrl('');
    setText('');
    onClose();
  };

  const handleClose = () => {
    setUrl('');
    setText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('editorDialog.link.title', { defaultValue: '링크 삽입' })}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            {t('ui.button.cancel', '취소')}
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleConfirm} disabled={!url.trim()}>
            {t('ui.button.confirm', '확인')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL <span className="text-red-500">*</span>
          </label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('editorDialog.link.text', { defaultValue: '표시 텍스트' })}
          </label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('editorDialog.link.textPlaceholder', { defaultValue: '링크 텍스트 (선택)' })}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>
      </div>
    </Modal>
  );
}
