'use client';

import { lazy, Suspense, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';

const Spline = lazy(() =>
  (import('@splinetool/react-spline') as Promise<{ default: React.ComponentType<{ scene: string; style?: React.CSSProperties }> }>).catch(() => ({ default: () => null }))
);

interface SplinePreviewProps {
  visible: boolean;
}

export const SplinePreview = ({ visible }: SplinePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = visible ? '1' : '0';
    }
  }, [visible]);

  // Forward window mousemove events into the Spline canvas when visible.
  // The R3F canvas sits on top in the DOM and swallows all pointer events,
  // so Spline never receives them natively — we re-dispatch them manually.
  useEffect(() => {
    if (!visible) return;

    const forward = (e: MouseEvent) => {
      const splineCanvas = containerRef.current?.querySelector('canvas');
      if (!splineCanvas) return;
      // Spline's runtime listens for pointermove on its canvas element
      splineCanvas.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY,
        movementX: e.movementX,
        movementY: e.movementY,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
      }));
    };

    window.addEventListener('mousemove', forward);
    return () => window.removeEventListener('mousemove', forward);
  }, [visible]);

  if (isMobile) return null;

  return (
    <div
      ref={containerRef}
      id="projects-background"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity: 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <Suspense fallback={null}>
        <Spline
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      </Suspense>
    </div>
  );
};
