'use client';

import { Html } from '@react-three/drei';
import { lazy, Suspense } from 'react';
import { isMobile } from 'react-device-detect';

const Spline = lazy(() => import('@splinetool/react-spline'));

export const SplinePreview = () => {
  // Desktop is a perfect 4x4 square, so we use no clipping.
  // Mobile is a triangle. The points are [-3, 2], [1, -2], [1, 2].
  // Relative to a 4x4 square centered at [-1, 0]:
  // Left is x=-3, right is x=1, top is y=2, bottom is y=-2.
  // CSS clip-path for that triangle: polygon(0% 0%, 100% 100%, 100% 0%)
  const clipPath = isMobile ? 'polygon(0% 0%, 100% 100%, 100% 0%)' : 'none';

  return (
    <Html
      transform
      distanceFactor={4.9} // Matches the default scale calculation for distance to camera
      zIndexRange={[0, 0]}
      position={[0, 0, 0.05]} // Slightly in front of the grid mesh
      style={{
        width: '800px', // high res
        height: '800px',
        overflow: 'hidden',
        clipPath,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        opacity: 0.8 // Dim as a preview
      }}
    >
      <Suspense fallback={<div className="text-white text-xs tracking-widest">LOADING...</div>}>
        <Spline
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      </Suspense>
    </Html>
  );
};
