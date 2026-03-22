/**
 * Prop validation utilities for SpaceBackground component.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

export interface SpaceBackgroundConfig {
  basePosition: [number, number, number]
  baseScale: number
  parallaxIntensity: number
  rotationSpeed: number
  enableParallax: boolean
  enableRotation: boolean
}

export const DEFAULT_SPACE_BACKGROUND_PROPS: SpaceBackgroundConfig = {
  basePosition: [0, -50, -100],
  baseScale: 180,
  parallaxIntensity: 0.3,
  rotationSpeed: 0.05,
  enableParallax: true,
  enableRotation: true,
}

/**
 * Validate and sanitize SpaceBackground props, falling back to defaults for invalid values.
 * Logs warnings in development mode when invalid props are detected.
 */
export function validateSpaceBackgroundProps(
  props: SpaceBackgroundConfig,
  isDev = false
): SpaceBackgroundConfig {
  let { basePosition, baseScale, parallaxIntensity, rotationSpeed } = props
  const { enableParallax, enableRotation } = props

  // Validate basePosition: must be a tuple of 3 finite numbers (Requirement 7.1)
  if (
    !Array.isArray(basePosition) ||
    basePosition.length !== 3 ||
    !basePosition.every((v) => Number.isFinite(v))
  ) {
    if (isDev) console.warn('[SpaceBackground] Invalid basePosition prop; falling back to default.')
    basePosition = DEFAULT_SPACE_BACKGROUND_PROPS.basePosition
  }

  // Validate baseScale: must be a positive number (Requirement 7.2)
  if (!Number.isFinite(baseScale) || baseScale <= 0) {
    if (isDev) console.warn('[SpaceBackground] Invalid baseScale prop; falling back to default.')
    baseScale = DEFAULT_SPACE_BACKGROUND_PROPS.baseScale
  }

  // Validate parallaxIntensity: clamp to [0, 1] (Requirement 7.3)
  if (!Number.isFinite(parallaxIntensity)) {
    if (isDev) console.warn('[SpaceBackground] Invalid parallaxIntensity prop; falling back to default.')
    parallaxIntensity = DEFAULT_SPACE_BACKGROUND_PROPS.parallaxIntensity
  } else if (parallaxIntensity < 0 || parallaxIntensity > 1) {
    if (isDev)
      console.warn(`[SpaceBackground] parallaxIntensity ${parallaxIntensity} out of range [0,1]; clamping.`)
    parallaxIntensity = Math.max(0, Math.min(1, parallaxIntensity))
  }

  // Validate rotationSpeed: must be a positive number (Requirement 7.4)
  if (!Number.isFinite(rotationSpeed) || rotationSpeed <= 0) {
    if (isDev) console.warn('[SpaceBackground] Invalid rotationSpeed prop; falling back to default.')
    rotationSpeed = DEFAULT_SPACE_BACKGROUND_PROPS.rotationSpeed
  }

  return { basePosition, baseScale, parallaxIntensity, rotationSpeed, enableParallax, enableRotation }
}
