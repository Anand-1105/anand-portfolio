'use client'

import { useRef, useState, useEffect, Component } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Space } from '../models/Space'
import { calculateParallaxOffset } from './calculateParallaxOffset'
import {
  validateSpaceBackgroundProps,
  DEFAULT_SPACE_BACKGROUND_PROPS,
} from './validateSpaceBackgroundProps'
import { updateRotation } from './updateRotation'

// Re-export for backward compatibility
export { calculateParallaxOffset } from './calculateParallaxOffset'
export { updateRotation } from './updateRotation'

// Pre-calculated constant to avoid recomputing Math.PI * 2 every frame
const TWO_PI = Math.PI * 2

interface SpaceBackgroundProps {
  basePosition?: [number, number, number]
  baseScale?: number
  parallaxIntensity?: number
  rotationSpeed?: number
  enableParallax?: boolean
  enableRotation?: boolean
}

// ---------------------------------------------------------------------------
// Fallback particle system rendered when the Space model fails to load
// ---------------------------------------------------------------------------
function FallbackParticles({ basePosition, baseScale }: { basePosition: [number, number, number]; baseScale: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  // Create geometry and material once; dispose on unmount
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null)

  if (!geometryRef.current) {
    const geometry = new THREE.BufferGeometry()
    const count = 2000
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometryRef.current = geometry
  }

  if (!materialRef.current) {
    materialRef.current = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })
  }

  useEffect(() => {
    return () => {
      geometryRef.current?.dispose()
      materialRef.current?.dispose()
    }
  }, [])

  return (
    <points
      ref={pointsRef}
      geometry={geometryRef.current}
      material={materialRef.current}
      position={basePosition}
      scale={baseScale}
    />
  )
}

// ---------------------------------------------------------------------------
// Error boundary that catches Space model render errors
// ---------------------------------------------------------------------------
interface SpaceErrorBoundaryProps {
  children: React.ReactNode
  onError: (error: Error) => void
}

interface SpaceErrorBoundaryState {
  hasError: boolean
}

class SpaceErrorBoundary extends Component<SpaceErrorBoundaryProps, SpaceErrorBoundaryState> {
  constructor(props: SpaceErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): SpaceErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      // Render nothing here; the parent will show the fallback
      return null
    }
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Inner component that handles retry logic and renders Space or fallback
// ---------------------------------------------------------------------------
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

function SpaceWithRetry({
  basePosition,
  baseScale,
}: {
  basePosition: [number, number, number]
  baseScale: number
}) {
  const [attempt, setAttempt] = useState(0)
  const [loadFailed, setLoadFailed] = useState(false)

  const handleError = (error: Error) => {
    console.error('[SpaceBackground] Space model failed to load:', error.message)

    if (attempt < MAX_RETRIES - 1) {
      // Schedule a retry
      setTimeout(() => {
        setAttempt((prev) => prev + 1)
      }, RETRY_DELAY_MS)
    } else {
      // All retries exhausted
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SpaceBackground] All retry attempts failed. Rendering fallback particle system.')
      }
      setLoadFailed(true)
    }
  }

  if (loadFailed) {
    return <FallbackParticles basePosition={basePosition} baseScale={baseScale} />
  }

  return (
    // key forces remount on each retry attempt
    <SpaceErrorBoundary key={attempt} onError={handleError}>
      <Space scale={baseScale} />
    </SpaceErrorBoundary>
  )
}

// ---------------------------------------------------------------------------
// Main SpaceBackground component
// ---------------------------------------------------------------------------
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
  const isMobile = useRef(false)
  const frameTimesRef = useRef<number[]>([])
  const lowPerfRef = useRef(false)

  // Detect mobile once on mount (SSR-safe) — Req 9.5
  useEffect(() => {
    if (typeof window === 'undefined') return
    const byScreenSize = window.innerWidth < 768
    const byUserAgent = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    isMobile.current = byScreenSize || byUserAgent
  }, [])

  // Dispose all geometries and materials in the group on unmount (Req 1.5, 12.1, 12.2)
  useEffect(() => {
    return () => {
      const group = groupRef.current
      if (!group) return
      group.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry?.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose())
          } else {
            object.material?.dispose()
          }
        }
      })
    }
  }, [])

  // Validate and sanitize all props (logs warnings in dev mode)
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
  const validated = validateSpaceBackgroundProps(
    { basePosition, baseScale, parallaxIntensity, rotationSpeed, enableParallax, enableRotation },
    isDev
  )

  // Animation loop for parallax and rotation
  useFrame((_state, delta) => {
    if (!groupRef.current) return

    const group = groupRef.current
    const scrollProgress = Math.min(1, Math.max(0, scrollData?.offset || 0))

    // Performance monitoring: track frame deltas, detect low FPS
    frameTimesRef.current.push(delta)
    if (frameTimesRef.current.length > 30) {
      frameTimesRef.current.shift()
    }
    if (!lowPerfRef.current && frameTimesRef.current.length === 30) {
      const avgDelta = frameTimesRef.current.reduce((sum, d) => sum + d, 0) / frameTimesRef.current.length
      const avgFps = 1 / avgDelta
      if (avgFps < 30) {
        lowPerfRef.current = true
        console.warn('[SpaceBackground] Low frame rate detected (~' + Math.round(avgFps) + ' fps). Disabling rotation to improve performance.')
      }
    }

    // Apply mobile overrides: halve parallax intensity, disable rotation
    const effectiveParallaxIntensity = isMobile.current
      ? validated.parallaxIntensity * 0.5
      : validated.parallaxIntensity
    const effectiveEnableRotation = (isMobile.current || lowPerfRef.current) ? false : validated.enableRotation

    // Apply parallax effect when enableParallax is true
    if (validated.enableParallax) {
      const newPosition = calculateParallaxOffset(
        scrollProgress,
        validated.basePosition,
        effectiveParallaxIntensity
      )
      group.position.y = THREE.MathUtils.damp(group.position.y, newPosition[1], 4, delta)
      group.position.z = THREE.MathUtils.damp(group.position.z, newPosition[2], 4, delta)
      group.position.x = THREE.MathUtils.damp(group.position.x, newPosition[0], 4, delta)
    }

    // Apply subtle mouse influence on X-axis (always active), smoothly interpolated
    group.position.x = THREE.MathUtils.damp(group.position.x, validated.basePosition[0] + pointer.x * 2, 4, delta)

    // Apply rotation only when enableRotation is true (and not on mobile)
    if (effectiveEnableRotation) {
      const newRotation = updateRotation(
        { x: group.rotation.x, y: group.rotation.y, z: group.rotation.z },
        validated.rotationSpeed,
        delta
      )
      group.rotation.x = newRotation.x
      group.rotation.y = newRotation.y

      // Normalize rotation values when exceeding 2π
      if (group.rotation.y > TWO_PI) {
        group.rotation.y -= TWO_PI
      }
      if (group.rotation.x > TWO_PI) {
        group.rotation.x -= TWO_PI
      }
    }
  })

  return (
    <group ref={groupRef} position={validated.basePosition}>
      <SpaceWithRetry basePosition={validated.basePosition} baseScale={validated.baseScale} />
    </group>
  )
}

// Preload the Space model so it's ready before the component mounts (Req 12.3)
useGLTF.preload('/models/need_some_space.glb')
