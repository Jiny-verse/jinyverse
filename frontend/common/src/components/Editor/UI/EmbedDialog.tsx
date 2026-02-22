'use client';

import { useState } from 'react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { useLanguage } from '../../../utils';
import { toEmbedUrl } from '../Utils/astUtils';

interface EmbedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}

export function EmbedDialog({ isOpen, onClose, onConfirm }: EmbedDialogProps) {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');

  const embedUrl = url.trim() ? toEmbedUrl(url.trim()) : null;

  const handleConfirm = () => {
    if (!url.trim()) return;
    onConfirm(url.trim());
    setUrl('');
    onClose();
  };

  const handleClose = () => {
    setUrl('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('editorDialog.embed.title', { defaultValue: '임베드 삽입' })}
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
            placeholder={t('editorDialog.embed.placeholder', { defaultValue: 'YouTube, Vimeo URL을 입력하세요' })}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            autoFocus
          />
        </div>
        {url.trim() && (
          <p className="text-xs text-gray-500">
            {embedUrl
              ? t('editorDialog.embed.supported', { defaultValue: '✅ 지원되는 형식입니다 (YouTube / Vimeo)' })
              : t('editorDialog.embed.unsupported', { defaultValue: '⚠️ YouTube/Vimeo URL이 아닙니다. 링크 카드로 삽입됩니다.' })}
          </p>
        )}
      </div>
    </Modal>
  );
}
