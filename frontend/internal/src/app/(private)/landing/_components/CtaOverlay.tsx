'use client';

import { RefObject, useRef } from 'react';
import type { LandingCta } from 'common/schemas';
import { useDragCta } from '../_hooks/useDragCta';
import { useResizeCta, type ResizeDirection } from '../_hooks/useResizeCta';
import { useLandingContext } from '../_hooks/useLandingContext';
import { useApiOptions } from '@/app/providers/ApiProvider';

interface CtaOverlayProps {
  cta: LandingCta;
  sectionId: string;
  isSelected: boolean;
  sectionRef: RefObject<HTMLDivElement | null>;
  onSnap?: (snapH: boolean, snapV: boolean) => void;
}

const HANDLES: { dir: ResizeDirection; cls: string }[] = [
  { dir: 'nw', cls: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize' },
  { dir: 'n', cls: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize' },
  { dir: 'ne', cls: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize' },
  { dir: 'e', cls: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize' },
  { dir: 'se', cls: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize' },
  { dir: 's', cls: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize' },
  { dir: 'sw', cls: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize' },
  { dir: 'w', cls: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize' },
];

const FONT_FAMILY_MAP: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, SFMono-Regular, monospace',
};

export function CtaOverlay({ cta, sectionId, isSelected, sectionRef, onSnap }: CtaOverlayProps) {
  const { moveCta, updateCta, setSelectedCtaId } = useLandingContext();
  const { baseUrl } = useApiOptions();
  const apiBaseUrl = baseUrl ?? '';
  const hasDraggedRef = useRef(false);
  const isResizingRef = useRef(false);
  const ctaElementRef = useRef<HTMLDivElement>(null);

  const sc = cta.styleConfig ?? {};

  const { startDrag } = useDragCta({
    sectionRef,
    onMove: (ctaId, top, left) => {
      hasDraggedRef.current = true;
      moveCta(sectionId, ctaId, top, left);
    },
    onSnap,
  });

  const { startResize } = useResizeCta({
    sectionRef,
    onResize: (ctaId, w, h) => {
      updateCta(sectionId, ctaId, {
        styleConfig: { ...sc, width: w, height: h },
      });
    },
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isResizingRef.current) return;
    hasDraggedRef.current = false;
    startDrag(cta.id, e);
  };

  const handleClick = () => {
    if (!hasDraggedRef.current && !isResizingRef.current) {
      setSelectedCtaId(cta.id);
    }
  };

  const top = cta.positionTop ?? 50;
  const left = cta.positionLeft ?? 50;

  const styleConfigWidth = sc.width as number | undefined;
  const styleConfigHeight = sc.height as number | undefined;
  const hasCustomDimensions = !!(styleConfigWidth || styleConfigHeight);

  const customStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${top}%`,
    left: `${left}%`,
    transform: cta.positionTransform || 'translate(-50%, -50%)',
    ...(styleConfigWidth ? { width: `${styleConfigWidth}px` } : {}),
    ...(styleConfigHeight ? { height: `${styleConfigHeight}px` } : {}),
  };

  // Per-type inline styles derived from styleConfig
  const buttonStyle: React.CSSProperties = {
    ...(sc.bgColor ? { background: sc.bgColor as string } : {}),
    ...(sc.textColor ? { color: sc.textColor as string } : {}),
    ...(sc.borderColor ? { borderColor: sc.borderColor as string } : {}),
    ...(sc.borderWidth ? { borderWidth: `${sc.borderWidth}px`, borderStyle: 'solid' } : {}),
    ...(sc.opacity != null ? { opacity: (sc.opacity as number) / 100 } : {}),
  };

  const textStyle: React.CSSProperties = {
    ...(sc.lineHeight ? { lineHeight: sc.lineHeight as number } : {}),
    ...(sc.letterSpacing ? { letterSpacing: `${sc.letterSpacing}em` } : {}),
    ...(sc.fontFamily
      ? { fontFamily: FONT_FAMILY_MAP[sc.fontFamily as string] ?? (sc.fontFamily as string) }
      : {}),
    ...(sc.color ? { color: sc.color as string } : {}),
  };

  const imageStyle: React.CSSProperties = {
    ...(sc.opacity != null ? { opacity: (sc.opacity as number) / 100 } : {}),
    ...(sc.shadow ? { filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' } : {}),
    ...(sc.aspectRatio && sc.aspectRatio !== 'free' ? { aspectRatio: sc.aspectRatio as string } : {}),
  };

  return (
    <div
      style={customStyle}
      className={`cursor-grab active:cursor-grabbing select-none z-10 ${
        isSelected ? 'ring-2 ring-primary ring-offset-1 rounded' : ''
      }`}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <div ref={ctaElementRef} className={`relative${hasCustomDimensions ? ' w-full h-full' : ''}`}>
        {cta.type === 'button' && (
          <button
            type="button"
            style={buttonStyle}
            className={`${hasCustomDimensions ? 'w-full h-full ' : ''}${cta.className || 'px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium pointer-events-none'}`}
          >
            {cta.label || cta.href}
          </button>
        )}
        {cta.type === 'text' && (
          <span
            style={textStyle}
            className={`${hasCustomDimensions ? 'flex w-full h-full items-center ' : ''}${cta.className || 'text-sm font-medium text-foreground pointer-events-none'}`}
          >
            {cta.label || cta.href}
          </span>
        )}
        {cta.type === 'image' &&
          (cta.imageFileId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${apiBaseUrl}/api/files/${cta.imageFileId}/download`}
              alt={cta.label || 'CTA'}
              style={imageStyle}
              className={`object-contain pointer-events-none ${hasCustomDimensions ? 'w-full h-full' : (cta.className || 'w-48 h-12')}`}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-500">IMG</span>
            </div>
          ))}

        {/* Resize handles (visible when selected) */}
        {isSelected &&
          HANDLES.map(({ dir, cls }) => (
            <div
              key={dir}
              className={`absolute w-2 h-2 bg-white border border-primary rounded-sm z-20 ${cls}`}
              onPointerDown={(e) => {
                e.stopPropagation();
                isResizingRef.current = true;
                const initW =
                  (sc.width as number | undefined) ?? ctaElementRef.current?.offsetWidth ?? 80;
                const initH =
                  (sc.height as number | undefined) ?? ctaElementRef.current?.offsetHeight ?? 32;
                startResize(cta.id, dir, e, initW, initH);
                const cleanup = () => {
                  isResizingRef.current = false;
                  window.removeEventListener('pointerup', cleanup);
                };
                window.addEventListener('pointerup', cleanup);
              }}
            />
          ))}
      </div>
    </div>
  );
}
