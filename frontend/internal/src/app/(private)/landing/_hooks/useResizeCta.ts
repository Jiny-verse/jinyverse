'use client';

import { useCallback, RefObject } from 'react';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface UseResizeCtaOptions {
  sectionRef: RefObject<HTMLDivElement | null>;
  onResize: (ctaId: string, width: number, height: number) => void;
}

export function useResizeCta({ sectionRef, onResize }: UseResizeCtaOptions) {
  const startResize = useCallback(
    (
      ctaId: string,
      direction: ResizeDirection,
      e: React.PointerEvent,
      initialW: number,
      initialH: number,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const startX = e.clientX;
      const startY = e.clientY;

      const handleMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        let newW = initialW;
        let newH = initialH;

        if (direction.includes('e')) newW = Math.max(20, initialW + dx);
        if (direction.includes('w')) newW = Math.max(20, initialW - dx);
        if (direction.includes('s')) newH = Math.max(20, initialH + dy);
        if (direction.includes('n')) newH = Math.max(20, initialH - dy);

        onResize(ctaId, Math.round(newW), Math.round(newH));
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
