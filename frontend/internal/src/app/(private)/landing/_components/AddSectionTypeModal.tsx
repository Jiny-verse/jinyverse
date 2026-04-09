'use client';

import { Modal } from 'common/ui';
import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';

const SECTION_TYPES = [
  { type: 'hero', label: 'Hero' },
  { type: 'image', label: 'Image' },
  { type: 'board_top', label: 'Board Top' },
] as const;

export function AddSectionTypeModal() {
  const { t } = useLanguage();
  const { isAddSectionModalOpen, closeAddSectionModal, addSection } = useLandingContext();

  const handleSelect = async (type: string) => {
    await addSection(type);
    closeAddSectionModal();
  };

  return (
    <Modal
      isOpen={isAddSectionModalOpen}
      onClose={closeAddSectionModal}
      title={t('admin.landing.addSection')}
      size="md"
    >
      <div className="grid grid-cols-2 gap-3">
        {SECTION_TYPES.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleSelect(type)}
            className="flex items-center justify-center p-4 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
