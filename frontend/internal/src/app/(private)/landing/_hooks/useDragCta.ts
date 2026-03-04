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

      // Capture cursor offset within the CTA element at drag start
      const ctaRect = target.getBoundingClientRect();
      const offsetX = e.clientX - ctaRect.left;
      const offsetY = e.clientY - ctaRect.top;

      const handleMove = (moveEvent: PointerEvent) => {
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const rawLeft = ((moveEvent.clientX - offsetX - rect.left) / rect.width) * 100;
        const rawTop = ((moveEvent.clientY - offsetY - rect.top) / rect.height) * 100;

        // Clamp so CTA stays within section bounds
        const ctaW = (ctaRect.width / rect.width) * 100;
        const ctaH = (ctaRect.height / rect.height) * 100;
        let left = Math.max(0, Math.min(100 - ctaW, rawLeft));
        let top = Math.max(0, Math.min(100 - ctaH, rawTop));

        // Smart snap to center
        const centerX = left + ctaW / 2;
        const centerY = top + ctaH / 2;
        let snappedV = false;
        let snappedH = false;

        if (Math.abs(centerX - 50) < SNAP_THRESHOLD) {
          left = 50 - ctaW / 2;
          snappedV = true;
        }
        if (Math.abs(centerY - 50) < SNAP_THRESHOLD) {
          top = 50 - ctaH / 2;
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
