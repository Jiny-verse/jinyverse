'use client';

import { Modal } from '../ui';
import { Button } from '../ui';
import { useLanguage } from '../utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'default',
}: ConfirmDialogProps) {
  const { t } = useLanguage();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('message.confirm')}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {cancelText || t('ui.button.cancel')}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
            {confirmText || t('ui.button.confirm')}
          </Button>
        </div>
      }
    >
      <p>{message || t('message.confirm')}</p>
    </Modal>
  );
}
