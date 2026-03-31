'use client'

import { useGLTF } from '@react-three/drei'

// Only preload models visible on initial load
useGLTF.preload('/models/window.glb')
// wanderer and memory are unused — not preloaded
// snowy_mountian.glb is 30MB — loaded on demand when Work portal opens

const Preloader = () => null;
export default Preloader;
