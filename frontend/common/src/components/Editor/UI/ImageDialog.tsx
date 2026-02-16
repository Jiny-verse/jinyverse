'use client';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, alt: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

export function ImageDialog({ isOpen, onClose, onConfirm, onUpload }: ImageDialogProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    if (!url.trim()) return;
    onConfirm(url.trim(), alt.trim());
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const reset = () => {
    setUrl('');
    setAlt('');
    setError('');
    setUploading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    setUploading(true);
    setError('');
    try {
      const uploadedUrl = await onUpload(file);
      setUrl(uploadedUrl);
      if (!alt) setAlt(file.name.replace(/\.[^.]+$/, ''));
    } catch {
      setError(t('editor.dialog.image.uploadError', '업로드에 실패했습니다.'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('editor.dialog.image.title', '이미지 삽입')}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            {t('ui.button.cancel', '취소')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={!url.trim() || uploading}
          >
            {t('ui.button.confirm', '확인')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {onUpload && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('editor.dialog.image.upload', '파일 업로드')}
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploading}
              >
                {t('editor.dialog.image.selectFile', '파일 선택')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL {!onUpload && <span className="text-red-500">*</span>}
          </label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            autoFocus={!onUpload}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('editor.dialog.image.alt', '대체 텍스트 (alt)')}
          </label>
          <Input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder={t('editor.dialog.image.altPlaceholder', '이미지 설명 (선택)')}
          />
        </div>
      </div>
    </Modal>
  );
}
