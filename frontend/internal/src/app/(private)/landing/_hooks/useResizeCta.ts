'use client';

import { useCallback, RefObject } from 'react';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface UseResizeCtaOptions {
  sectionRef: RefObject<HTMLDivElement | null>;
  onResize: (ctaId: string, width: number, height: number, newTopPct: number | null, newLeftPct: number | null) => void;
}

export function useResizeCta({ sectionRef, onResize }: UseResizeCtaOptions) {
  const startResize = useCallback(
    (
      ctaId: string,
      direction: ResizeDirection,
      e: React.PointerEvent,
      initialW: number,
      initialH: number,
      initialTopPct: number,
      initialLeftPct: number,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const startX = e.clientX;
      const startY = e.clientY;

      const handleMove = (moveEvent: PointerEvent) => {
        const section = sectionRef.current;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        let newW = initialW;
        let newH = initialH;
        let newTopPct: number | null = null;
        let newLeftPct: number | null = null;

        const sectionH = section?.offsetHeight ?? 1;
        const sectionW = section?.offsetWidth ?? 1;

        if (direction.includes('e')) newW = Math.max(20, initialW + dx);
        if (direction.includes('w')) {
          newW = Math.max(20, initialW - dx);
          // Keep right edge fixed: center shifts left when widening
          const widthDelta = newW - initialW;
          newLeftPct = initialLeftPct - (widthDelta / 2 / sectionW) * 100;
        }
        if (direction.includes('s')) newH = Math.max(20, initialH + dy);
        if (direction.includes('n')) {
          newH = Math.max(20, initialH - dy);
          // Keep bottom edge fixed: center shifts up when heightening
          const heightDelta = newH - initialH;
          newTopPct = initialTopPct - (heightDelta / 2 / sectionH) * 100;
        }

        onResize(ctaId, Math.round(newW), Math.round(newH), newTopPct, newLeftPct);
      };

      const handleUp = () => {
        target.removeEventListener('pointermove', handleMove);
        target.removeEventListener('pointerup', handleUp);
      };

      target.addEventListener('pointermove', handleMove);
      target.addEventListener('pointerup', handleUp);
    },
    [sectionRef, onResize],
  );

  return { startResize };
}
