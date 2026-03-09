'use client';

import { useCallback, useRef, RefObject } from 'react';

interface UseDragCtaOptions {
  sectionRef: RefObject<HTMLDivElement | null>;
  onMove: (ctaId: string, top: number, left: number) => void;
  onSnap?: (snapH: boolean, snapV: boolean) => void;
}

const SNAP_THRESHOLD = 5; // % from center to trigger snap

export function useDragCta({ sectionRef, onMove, onSnap }: UseDragCtaOptions) {
  const onSnapRef = useRef(onSnap);
  onSnapRef.current = onSnap;

  const startDrag = useCallback(
    (ctaId: string, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      // CTA position is center-based (transform: translate(-50%, -50%))
      // Capture offset from the CTA's CENTER, not its top-left corner
      const ctaRect = target.getBoundingClientRect();
      const ctaCenterX = ctaRect.left + ctaRect.width / 2;
      const ctaCenterY = ctaRect.top + ctaRect.height / 2;
      const offsetX = e.clientX - ctaCenterX;
      const offsetY = e.clientY - ctaCenterY;

      const handleMove = (moveEvent: PointerEvent) => {
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        // New center position as % of section
        let left = ((moveEvent.clientX - offsetX - rect.left) / rect.width) * 100;
        let top = ((moveEvent.clientY - offsetY - rect.top) / rect.height) * 100;

        // Clamp so CTA center stays within section bounds
        left = Math.max(0, Math.min(100, left));
        top = Math.max(0, Math.min(100, top));

        // Smart snap to center
        let snappedV = false;
        let snappedH = false;
        if (Math.abs(left - 50) < SNAP_THRESHOLD) {
          left = 50;
          snappedV = true;
        }
        if (Math.abs(top - 50) < SNAP_THRESHOLD) {
          top = 50;
          snappedH = true;
        }

        onSnapRef.current?.(snappedH, snappedV);
        onMove(ctaId, top, left);
      };

      const handleUp = () => {
        onSnapRef.current?.(false, false);
        target.removeEventListener('pointermove', handleMove);
        target.removeEventListener('pointerup', handleUp);
      };

      target.addEventListener('pointermove', handleMove);
      target.addEventListener('pointerup', handleUp);
    },
    [sectionRef, onMove],
  );

  return { startDrag };
}
