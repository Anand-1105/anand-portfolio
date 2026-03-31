'use client';

import { useGLTF } from '@react-three/drei';
import { forwardRef, JSX } from 'react';
import * as THREE from 'three';

export const Mountain = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>(function Mountain(props, ref) {
  const { scene } = useGLTF('/models/snowy_mountian.glb');
  try {

    if (!scene || scene.children.length === 0) {
      return null;
    }

    return <group ref={ref} {...props}><primitive object={scene} dispose={null} /></group>;
  } catch {
    return null;
  }
});

// No eager preload — 30MB model loaded on demand when Work portal opens
