'use client';

import { Modal } from './Modal';
import { Button } from './Button';
import useLanguage from '../utils/i18n/hooks/useLanguage';

export interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 확인/취소 선택용 다이얼로그 (window.confirm 대체)
 */
export function ConfirmDialog({
  isOpen,
  message,
  title,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t('ui.dialog.alert');
  const resolvedConfirmText = confirmText ?? t('ui.button.confirm');
  const resolvedCancelText = cancelText ?? t('ui.button.cancel');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={resolvedTitle}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {resolvedCancelText}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {resolvedConfirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
}
