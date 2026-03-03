'use client';

import { useRef, useState } from 'react';
import { Input, Switch, Select, ConfirmDialog } from 'common/ui';
import { useLanguage } from 'common/utils';
import { uploadFile } from 'common/services';
import {
  BUTTON_SHAPES,
  BUTTON_COLORS,
  BUTTON_SIZES,
  TEXT_SIZES,
  TEXT_WEIGHTS,
  TEXT_COLORS,
  IMAGE_SIZES,
} from 'common/constants';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLandingContext } from '../_hooks/useLandingContext';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseButtonClassName(cn: string) {
  const shape = BUTTON_SHAPES.find((s) => cn.includes(s.key))?.key ?? BUTTON_SHAPES[0].key;
  const color = BUTTON_COLORS.find((c) => cn.includes(c.key.split(' ')[0]))?.key ?? BUTTON_COLORS[0].key;
  const size = BUTTON_SIZES.find((s) => cn.includes(s.key.split(' ')[0]))?.key ?? BUTTON_SIZES[1].key;
  return { shape, color, size };
}

function buildButtonClassName(shape: string, color: string, size: string) {
  return [shape, color, size, 'transition-colors font-medium'].join(' ');
}

function parseTextClassName(cn: string) {
  const size = TEXT_SIZES.find((s) => cn.includes(s.key))?.key ?? TEXT_SIZES[2].key;
  const weight = TEXT_WEIGHTS.find((w) => cn.includes(w.key))?.key ?? TEXT_WEIGHTS[0].key;
  const color = TEXT_COLORS.find((c) => cn.includes(c.key))?.key ?? TEXT_COLORS[0].key;
  return { size, weight, color };
}

function buildTextClassName(size: string, weight: string, color: string) {
  return [size, weight, color].join(' ');
}

function parseImageClassName(cn: string) {
  return IMAGE_SIZES.find((s) => cn.includes(s.key.split(' ')[0]))?.key ?? IMAGE_SIZES[1].key;
}

// ─── PresetChips ───────────────────────────────────────────────────────────────

function PresetChips({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`px-2 py-0.5 text-xs rounded border transition-colors ${
            value === o.key
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:bg-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CtaFormPanel() {
  const { t } = useLanguage();
  const apiOptions = useApiOptions();
  const { selectedSection, selectedCtaId, setSelectedCtaId, updateCta, deleteCta } =
    useLandingContext();
  const [pendingDelete, setPendingDelete] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedSection || !selectedCtaId) return null;

  const cta = selectedSection.ctas.find((c) => c.id === selectedCtaId);
  if (!cta) return null;

  const apiBaseUrl = apiOptions.baseUrl ?? '';

  const handleDeleteConfirm = async () => {
    await deleteCta(selectedSection.id, cta.id);
    setSelectedCtaId(null);
    setPendingDelete(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadFile(apiOptions, file);
      updateCta(selectedSection.id, cta.id, { imageFileId: result.id });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Button style preset UI ──────────────────────────────────────────────────
  const renderButtonStyleUI = () => {
    const { shape, color, size } = parseButtonClassName(cta.className ?? '');
    const setPreset = (newShape = shape, newColor = color, newSize = size) => {
      updateCta(selectedSection.id, cta.id, {
        className: buildButtonClassName(newShape, newColor, newSize),
      });
    };
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {t('admin.landing.cta.style.shape')}
          </label>
          <PresetChips
            options={BUTTON_SHAPES}
            value={shape}
            onChange={(v) => setPreset(v, color, size)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {t('admin.landing.cta.style.color')}
          </label>
          <PresetChips
            options={BUTTON_COLORS}
            value={color}
            onChange={(v) => setPreset(shape, v, size)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {t('admin.landing.cta.style.size')}
          </label>
          <PresetChips
            options={BUTTON_SIZES}
            value={size}
            onChange={(v) => setPreset(shape, color, v)}
          />
        </div>
      </div>
    );
  };

  // ── Text style preset UI ────────────────────────────────────────────────────
  const renderTextStyleUI = () => {
    const { size, weight, color } = parseTextClassName(cta.className ?? '');
    const setPreset = (newSize = size, newWeight = weight, newColor = color) => {
      updateCta(selectedSection.id, cta.id, {
        className: buildTextClassName(newSize, newWeight, newColor),
      });
    };
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {t('admin.landing.cta.style.size')}
          </label>
          <PresetChips
            options={TEXT_SIZES}
            value={size}
            onChange={(v) => setPreset(v, weight, color)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {t('admin.landing.cta.style.weight')}
          </label>
          <PresetChips
            options={TEXT_WEIGHTS}
            value={weight}
            onChange={(v) => setPreset(size, v, color)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {t('admin.landing.cta.style.color')}
          </label>
          <PresetChips
            options={TEXT_COLORS}
            value={color}
            onChange={(v) => setPreset(size, weight, v)}
          />
        </div>
      </div>
    );
  };

  // ── Image type UI ───────────────────────────────────────────────────────────
  const renderImageUI = () => {
    const sizeKey = parseImageClassName(cta.className ?? '');
    return (
      <div className="space-y-3">
        {cta.imageFileId ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${apiBaseUrl}/api/files/${cta.imageFileId}/download`}
              alt="CTA"
              className="h-16 object-contain rounded border border-border"
            />
            <button
              type="button"
              onClick={() => updateCta(selectedSection.id, cta.id, { imageFileId: undefined })}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
              title={t('admin.landing.cta.removeImage')}
            >
              ×
            </button>
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
          {isUploading ? t('ui.button.uploading') : t('admin.landing.cta.imageUpload')}
        </button>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {t('admin.landing.cta.style.size')}
          </label>
          <PresetChips
            options={IMAGE_SIZES}
            value={sizeKey}
            onChange={(v) => updateCta(selectedSection.id, cta.id, { className: v })}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <ConfirmDialog
        isOpen={pendingDelete}
        message={t('message.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(false)}
      />

      <button
        type="button"
        onClick={() => setSelectedCtaId(null)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {t('admin.landing.backToSection')}
      </button>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {t('admin.landing.cta.type')}
        </label>
        <Select
          value={cta.type}
          options={[
            { value: 'button', label: 'button' },
            { value: 'text', label: 'text' },
            { value: 'image', label: 'image' },
          ]}
          onChange={(e) =>
            updateCta(selectedSection.id, cta.id, {
              type: e.target.value as 'button' | 'text' | 'image',
            })
          }
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {t('admin.landing.cta.label')}
        </label>
        <Input
          value={cta.label ?? ''}
          onChange={(e) => updateCta(selectedSection.id, cta.id, { label: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {t('admin.landing.cta.href')}
        </label>
        <Input
          value={cta.href}
          onChange={(e) => updateCta(selectedSection.id, cta.id, { href: e.target.value })}
        />
      </div>

      {/* Type-specific style UI */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {t('admin.landing.cta.style.title')}
        </h4>
        {cta.type === 'button' && renderButtonStyleUI()}
        {cta.type === 'text' && renderTextStyleUI()}
        {cta.type === 'image' && renderImageUI()}
      </div>

      {/* Advanced (raw className) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvanced ? '▾' : '▸'} {t('admin.landing.cta.style.advanced')}
        </button>
        {showAdvanced && (
          <Input
            className="mt-1"
            value={cta.className ?? ''}
            onChange={(e) => updateCta(selectedSection.id, cta.id, { className: e.target.value })}
            placeholder={t('admin.landing.cta.className')}
          />
        )}
      </div>

      {/* Position */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Position
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('admin.landing.cta.positionTop')}
            </label>
            <Input
              type="number"
              value={cta.positionTop ?? ''}
              onChange={(e) =>
                updateCta(selectedSection.id, cta.id, {
                  positionTop: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('admin.landing.cta.positionLeft')}
            </label>
            <Input
              type="number"
              value={cta.positionLeft ?? ''}
              onChange={(e) =>
                updateCta(selectedSection.id, cta.id, {
                  positionLeft: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('admin.landing.cta.positionBottom')}
            </label>
            <Input
              type="number"
              value={cta.positionBottom ?? ''}
              onChange={(e) =>
                updateCta(selectedSection.id, cta.id, {
                  positionBottom: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('admin.landing.cta.positionRight')}
            </label>
            <Input
              type="number"
              value={cta.positionRight ?? ''}
              onChange={(e) =>
                updateCta(selectedSection.id, cta.id, {
                  positionRight: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {t('admin.landing.cta.positionTransform')}
          </label>
          <Input
            value={cta.positionTransform ?? ''}
            onChange={(e) =>
              updateCta(selectedSection.id, cta.id, { positionTransform: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {t('admin.landing.section.order')}
        </label>
        <Input
          type="number"
          value={cta.order}
          onChange={(e) =>
            updateCta(selectedSection.id, cta.id, { order: Number(e.target.value) })
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={cta.isActive}
          onChange={(e) => updateCta(selectedSection.id, cta.id, { isActive: e.target.checked })}
        />
        <span className="text-sm">{t('admin.landing.section.active')}</span>
      </div>

      <div className="pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => setPendingDelete(true)}
          className="w-full px-3 py-2 border border-destructive/40 text-destructive text-sm rounded hover:bg-destructive/10 transition-colors"
        >
          {t('ui.button.delete')} CTA
        </button>
      </div>
    </div>
  );
}
