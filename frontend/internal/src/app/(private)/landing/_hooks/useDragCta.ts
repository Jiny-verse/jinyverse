'use client';

import { useCallback, RefObject } from 'react';

interface UseDragCtaOptions {
  canvasRef: RefObject<HTMLDivElement | null>;
  onMove: (ctaId: string, top: number, left: number) => void;
}

export function useDragCta({ canvasRef, onMove }: UseDragCtaOptions) {
  const startDrag = useCallback(
    (ctaId: string, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const handleMove = (moveEvent: PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const rawTop = ((moveEvent.clientY - rect.top) / rect.height) * 100;
        const rawLeft = ((moveEvent.clientX - rect.left) / rect.width) * 100;

        const top = Math.min(100, Math.max(0, rawTop));
        const left = Math.min(100, Math.max(0, rawLeft));

        onMove(ctaId, top, left);
      };

      const handleUp = () => {
        target.removeEventListener('pointermove', handleMove);
        target.removeEventListener('pointerup', handleUp);
      };

      target.addEventListener('pointermove', handleMove);
      target.addEventListener('pointerup', handleUp);
    },
    [canvasRef, onMove]
  );

  return { startDrag };
}
