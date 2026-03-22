'use client';

import { usePortalStore } from '@stores';
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function ProjectsBackground() {
  const isActive = usePortalStore((state) => state.activePortalId === 'projects');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLoad = useCallback((splineApp: { setBackgroundColor: (color: string) => void }) => {
    try {
      splineApp.setBackgroundColor('#00000000');
    } catch {
      // ignore
    }
  }, []);

  if (!mounted) return null;

  const inset = isMobile ? 0 : '1rem';
  const size = isMobile
    ? { width: '100%', height: '100dvh' }
    : { width: 'calc(100% - 2rem)', height: 'calc(100% - 2rem)' };

  return (
    <div
      id="projects-background"
      style={{
        position: 'absolute',
        inset,
        ...size,
        zIndex: 2,
        pointerEvents: 'none',
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.8s ease',
        overflow: 'hidden',
        background: 'transparent',
        mixBlendMode: 'screen',
        borderRadius: isMobile ? 0 : '0.5rem',
      }}
    >
      <Suspense fallback={null}>
        <Spline
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
          onLoad={handleLoad as never}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  );
}
