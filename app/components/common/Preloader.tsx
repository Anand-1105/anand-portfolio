'use client'

import { useGLTF } from '@react-three/drei'

// Preload all models so they're cached before the scene needs them
useGLTF.preload('/models/window.glb')
useGLTF.preload('/models/dalithe_persistence_of_memory.glb')
useGLTF.preload('/models/wanderer_above_the_sea_of_fog.glb')
useGLTF.preload('/models/snowy_mountian.glb')

const Preloader = () => null;
export default Preloader;
