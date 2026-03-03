'use client';

import { RefObject, useRef } from 'react';
import type { LandingCta } from 'common/schemas';
import { useDragCta } from '../_hooks/useDragCta';
import { useLandingContext } from '../_hooks/useLandingContext';
import { useApiOptions } from '@/app/providers/ApiProvider';

interface CtaOverlayProps {
  cta: LandingCta;
  sectionId: string;
  isSelected: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
}

export function CtaOverlay({ cta, sectionId, isSelected, canvasRef }: CtaOverlayProps) {
  const { moveCta, setSelectedCtaId } = useLandingContext();
  const { baseUrl } = useApiOptions();
  const apiBaseUrl = baseUrl ?? '';
  const hasDraggedRef = useRef(false);

  const { startDrag } = useDragCta({
    canvasRef,
    onMove: (ctaId, top, left) => {
      hasDraggedRef.current = true;
      moveCta(sectionId, ctaId, top, left);
    },
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    hasDraggedRef.current = false;
    startDrag(cta.id, e);
  };

  const handleClick = () => {
    if (!hasDraggedRef.current) {
      setSelectedCtaId(cta.id);
    }
  };

  const top = cta.positionTop ?? 50;
  const left = cta.positionLeft ?? 50;

  return (
    <div
      style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -50%)' }}
      className={`cursor-grab active:cursor-grabbing select-none z-10 ${
        isSelected ? 'ring-2 ring-primary ring-offset-1 rounded' : ''
      }`}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      {cta.type === 'button' && (
        <button
          type="button"
          className={cta.className || 'px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium pointer-events-none'}
        >
          {cta.label || cta.href}
        </button>
      )}
      {cta.type === 'text' && (
        <span className={cta.className || 'text-sm font-medium text-foreground pointer-events-none'}>
          {cta.label || cta.href}
        </span>
      )}
      {cta.type === 'image' && (
        cta.imageFileId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${apiBaseUrl}/api/files/${cta.imageFileId}/download`}
            alt={cta.label || 'CTA'}
            className={`object-contain pointer-events-none ${cta.className || 'w-48 h-12'}`}
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-500">IMG</span>
          </div>
        )
      )}
    </div>
  );
}
