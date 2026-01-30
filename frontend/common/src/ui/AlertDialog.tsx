'use client';

import { Modal } from './Modal';
import { Button } from './Button';

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
  title = '알림',
  message,
  buttonText = '확인',
}: AlertDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            {buttonText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
}
