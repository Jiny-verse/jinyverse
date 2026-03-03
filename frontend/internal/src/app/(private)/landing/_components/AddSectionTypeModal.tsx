'use client';

import { Modal } from 'common/ui';
import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';

const SECTION_TYPES = [
  { type: 'hero', icon: '🦸', label: 'Hero' },
  { type: 'image', icon: '🖼️', label: 'Image' },
  { type: 'board_top', icon: '📋', label: 'Board Top' },
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
        {SECTION_TYPES.map(({ type, icon, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleSelect(type)}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <span className="text-3xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
