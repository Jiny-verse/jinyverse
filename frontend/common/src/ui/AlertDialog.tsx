'use client';

import { Modal } from './Modal';
import { Button } from './Button';
import useLanguage from '../utils/i18n/hooks/useLanguage';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

/**
 * 단순 알림용 다이얼로그 (확인 버튼만, window.alert 대체)
 */
export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText,
}: AlertDialogProps) {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t('ui.dialog.alert');
  const resolvedButtonText = buttonText ?? t('ui.button.confirm');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resolvedTitle}
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={onClose}>
            {resolvedButtonText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
}
