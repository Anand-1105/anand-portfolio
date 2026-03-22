'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Always keeps the WebGL canvas opaque so 3D objects render correctly.
 * The Spline overlay uses CSS mix-blend-mode: screen instead of canvas transparency.
 */
export function ClearAlphaController() {
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearAlpha(1);
  }, [gl]);

  return null;
}
