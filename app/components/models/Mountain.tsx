'use client';

import { useGLTF } from '@react-three/drei';
import { forwardRef, JSX } from 'react';
import * as THREE from 'three';

export const Mountain = forwardRef<THREE.Group, JSX.IntrinsicElements['group']>(function Mountain(props, ref) {
  const { scene } = useGLTF('/models/snowy_mountian.glb');
  try {

    if (!scene || scene.children.length === 0) {
      console.warn('[Mountain] Scene is empty or invalid');
      return null;
    }

    return <group ref={ref} {...props}><primitive object={scene} dispose={null} /></group>;
  } catch (error) {
    console.error('[Mountain] Failed to load GLB:', error);
    return null;
  }
});

useGLTF.preload('/models/snowy_mountian.glb');
