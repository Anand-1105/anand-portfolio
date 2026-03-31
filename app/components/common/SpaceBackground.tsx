'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Space } from '../models/Space'
import { calculateParallaxOffset } from './calculateParallaxOffset'
import { validateSpaceBackgroundProps, DEFAULT_SPACE_BACKGROUND_PROPS } from './validateSpaceBackgroundProps'
import { updateRotation } from './updateRotation'

// Re-export for backward compatibility
export { calculateParallaxOffset } from './calculateParallaxOffset'
export { updateRotation } from './updateRotation'

const TWO_PI = Math.PI * 2

interface SpaceBackgroundProps {
  basePosition?: [number, number, number]
  baseScale?: number
  parallaxIntensity?: number
  rotationSpeed?: number
  enableParallax?: boolean
  enableRotation?: boolean
}

export function SpaceBackground({
  basePosition = DEFAULT_SPACE_BACKGROUND_PROPS.basePosition,
  baseScale = DEFAULT_SPACE_BACKGROUND_PROPS.baseScale,
  parallaxIntensity = DEFAULT_SPACE_BACKGROUND_PROPS.parallaxIntensity,
  rotationSpeed = DEFAULT_SPACE_BACKGROUND_PROPS.rotationSpeed,
  enableParallax = DEFAULT_SPACE_BACKGROUND_PROPS.enableParallax,
  enableRotation = DEFAULT_SPACE_BACKGROUND_PROPS.enableRotation,
}: SpaceBackgroundProps) {
  const groupRef = useRef<THREE.Group>(null)
  const scrollData = useScroll()
  const { pointer } = useThree()
  const isMobileRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    isMobileRef.current = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  }, [])

  // Memoize validated props — only recompute when inputs change, not every render
  const validated = useMemo(
    () => validateSpaceBackgroundProps(
      { basePosition, baseScale, parallaxIntensity, rotationSpeed, enableParallax, enableRotation },
      false
    ),
    [basePosition, baseScale, parallaxIntensity, rotationSpeed, enableParallax, enableRotation]
  )

  useFrame((_state, delta) => {
    if (!groupRef.current) return
    const group = groupRef.current
    const scrollProgress = Math.min(1, Math.max(0, scrollData?.offset || 0))
    const mobile = isMobileRef.current

    if (validated.enableParallax) {
      const newPos = calculateParallaxOffset(
        scrollProgress,
        validated.basePosition,
        mobile ? validated.parallaxIntensity * 0.5 : validated.parallaxIntensity
      )
      group.position.y = THREE.MathUtils.damp(group.position.y, newPos[1], 4, delta)
      group.position.z = THREE.MathUtils.damp(group.position.z, newPos[2], 4, delta)
    }

    group.position.x = THREE.MathUtils.damp(group.position.x, validated.basePosition[0] + pointer.x * 2, 4, delta)

    if (!mobile && validated.enableRotation) {
      const r = updateRotation(
        { x: group.rotation.x, y: group.rotation.y, z: group.rotation.z },
        validated.rotationSpeed,
        delta
      )
      group.rotation.x = r.x
      group.rotation.y = r.y > TWO_PI ? r.y - TWO_PI : r.y
    }
  })

  return (
    <group ref={groupRef} position={validated.basePosition}>
      <Space scale={validated.baseScale} />
    </group>
  )
}

useGLTF.preload('/models/need_some_space.glb')
