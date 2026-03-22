/**
 * Calculate parallax offset based on scroll progress and intensity.
 *
 * Preconditions:
 * - scrollProgress must be between 0 and 1 (inclusive)
 * - basePosition must be a valid 3D coordinate tuple of finite numbers
 * - intensity must be between 0 and 1 (inclusive)
 *
 * Postconditions:
 * - Returns a valid 3D coordinate tuple
 * - All returned values are finite numbers
 * - Y-axis offset = scrollProgress × intensity × 50
 * - Z-axis offset = scrollProgress × intensity × 20
 * - X-axis remains unchanged
 */
export function calculateParallaxOffset(
  scrollProgress: number,
  basePosition: [number, number, number],
  intensity: number
): [number, number, number] {
  if (scrollProgress < 0 || scrollProgress > 1) {
    console.warn(`Invalid scrollProgress: ${scrollProgress}. Clamping to [0, 1].`)
    scrollProgress = Math.max(0, Math.min(1, scrollProgress))
  }

  if (intensity < 0 || intensity > 1) {
    console.warn(`Invalid intensity: ${intensity}. Clamping to [0, 1].`)
    intensity = Math.max(0, Math.min(1, intensity))
  }

  if (!basePosition.every(v => Number.isFinite(v))) {
    console.error('Invalid basePosition: contains non-finite numbers')
    return [0, -50, -100]
  }

  const offsetY = scrollProgress * intensity * 50
  const offsetZ = scrollProgress * intensity * 20

  return [
    basePosition[0],
    basePosition[1] + offsetY,
    basePosition[2] + offsetZ,
  ]
}
