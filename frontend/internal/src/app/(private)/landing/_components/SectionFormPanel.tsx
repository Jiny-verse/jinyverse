'use client';

import { useRef, useState } from 'react';
import { Input, Switch } from 'common/ui';
import { useLanguage } from 'common/utils';
import { uploadFile, getBoards } from 'common/services';
import type { LandingCta } from 'common/schemas';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLandingContext } from '../_hooks/useLandingContext';

const IMAGE_SECTION_TYPES = ['hero', 'image', 'image_link'];

interface BoardOption {
  id: string;
  name: string;
}

export function SectionFormPanel() {
  const { t } = useLanguage();
  const apiOptions = useApiOptions();
  const {
    selectedSection,
    updateSection,
    setSelectedCtaId,
    addCta,
    addSectionFile,
    removeSectionFile,
  } = useLandingContext();

  const [ctaHref, setCtaHref] = useState('');
  const [isAddingCta, setIsAddingCta] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [boardsLoaded, setBoardsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedSection) return null;

  const isImageType = IMAGE_SECTION_TYPES.includes(selectedSection.type);
  const isBoardTop = selectedSection.type === 'board_top';

  const handleAddCta = async () => {
    const href = ctaHref.trim();
    if (!href) return;
    setIsAddingCta(true);
    try {
      await addCta(selectedSection.id, href);
      setCtaHref('');
    } finally {
      setIsAddingCta(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(apiOptions, file);
      await addSectionFile(selectedSection.id, result.id, true);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadBoards = async () => {
    if (boardsLoaded) return;
    try {
      const res = await getBoards(apiOptions, { size: 100 });
      setBoards(res.content.map((b) => ({ id: b.id, name: b.name })));
      setBoardsLoaded(true);
    } catch {
      setBoardsLoaded(true);
    }
  };

  const apiBaseUrl = apiOptions.baseUrl ?? '';

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {t('admin.landing.section.type')}
        </label>
        <span className="text-sm font-medium">{selectedSection.type}</span>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {t('admin.landing.section.order')}
        </label>
        <Input
          type="number"
          value={selectedSection.order}
          onChange={(e) => updateSection(selectedSection.id, { order: Number(e.target.value) })}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={selectedSection.isActive}
          onChange={(e) => updateSection(selectedSection.id, { isActive: e.target.checked })}
        />
        <span className="text-sm">{t('admin.landing.section.active')}</span>
      </div>

      {/* Section image upload (hero / image / image_link) */}
      {isImageType && (
        <div className="pt-2 border-t border-border space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('admin.landing.section.image')}
          </h4>

          {/* Link URL for image sections */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('admin.landing.section.linkUrl')}
            </label>
            <Input
              value={(selectedSection.extraConfig?.href as string) ?? ''}
              onChange={(e) =>
                updateSection(selectedSection.id, {
                  extraConfig: {
                    ...(selectedSection.extraConfig ?? {}),
                    href: e.target.value || undefined,
                  },
                })
              }
              placeholder="https://..."
            />
          </div>

          {(selectedSection.fileIds ?? []).length > 0 ? (
            <div className="space-y-2">
              {(selectedSection.fileIds ?? []).map((fileId, idx) => (
                <div
                  key={fileId}
                  className="relative group rounded border border-border p-1"
                >
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 z-10 text-xs bg-black/60 text-white px-1 rounded">
                      main
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${apiBaseUrl}/api/files/${fileId}/download`}
                    alt="section"
                    className="h-20 w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeSectionFile(selectedSection.id, fileId)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
                    title={t('admin.landing.section.removeImage')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t('common.noData')}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3 py-1.5 border border-border text-sm rounded hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {isUploading ? t('ui.button.uploading') : t('admin.landing.section.uploadImage')}
          </button>
        </div>
      )}

      {/* Board top type: board selector + post limit */}
      {isBoardTop && (
        <div className="pt-2 border-t border-border space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('admin.landing.section.boardSelect')}
            </label>
            <select
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={selectedSection.boardId ?? ''}
              onFocus={handleLoadBoards}
              onChange={(e) =>
                updateSection(selectedSection.id, { boardId: e.target.value || undefined })
              }
            >
              <option value="">— {t('admin.none')} —</option>
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('admin.landing.section.postLimit')}
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={(selectedSection.extraConfig?.limit as number) ?? 5}
              onChange={(e) =>
                updateSection(selectedSection.id, {
                  extraConfig: {
                    ...(selectedSection.extraConfig ?? {}),
                    limit: Number(e.target.value),
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {/* CTA list */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {t('admin.landing.cta.title')}
        </h4>
        {selectedSection.ctas.length === 0 ? (
          <p className="text-xs text-muted-foreground mb-3">{t('common.noData')}</p>
        ) : (
          <ul className="space-y-1 mb-3">
            {selectedSection.ctas.map((cta: LandingCta) => (
              <li
                key={cta.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                onClick={() => setSelectedCtaId(cta.id)}
              >
                <span className="shrink-0 text-xs text-muted-foreground">[{cta.type}]</span>
                <span className="truncate">{cta.label || cta.href}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Add CTA inline */}
        <div className="flex gap-2">
          <Input
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
            placeholder={t('admin.landing.ctaHrefPlaceholder')}
            className="flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCta();
            }}
          />
          <button
            type="button"
            disabled={isAddingCta || !ctaHref.trim()}
            onClick={handleAddCta}
            className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {t('admin.landing.addCta')}
          </button>
        </div>
      </div>
    </div>
  );
}
