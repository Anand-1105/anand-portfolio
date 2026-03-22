/**
 * Property 1: Background Visibility Across Scroll Positions
 *
 * For any scroll position between 0 and 1, the space background should remain
 * visible within the camera frustum.
 *
 * Since we can't test actual WebGL rendering, "visibility" is modelled as:
 * the background position remains within reasonable bounds given the camera
 * setup (camera at [0, 0, 5]) and the large scale (180) of the model.
 *
 * Default config:
 *   basePosition:       [0, -50, -100]
 *   baseScale:          180
 *   parallaxIntensity:  0.3
 *
 * Max Y offset  = 1 × 0.3 × 50 = 15  → final Y = -50 + 15 = -35
 * Max Z offset  = 1 × 0.3 × 20 =  6  → final Z = -100 + 6 = -94
 *
 * Validates: Requirements 2.1, 2.2, 2.3
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

// Default SpaceBackground configuration (from design doc)
const DEFAULT_BASE_POSITION: [number, number, number] = [0, -50, -100]
const DEFAULT_PARALLAX_INTENSITY = 0.3

// Visibility bounds derived from camera setup and model scale
// Camera is at z=5; far clipping plane is typically 1000 in R3F defaults.
// The model is at z=-100 with scale 180, so it spans a huge area.
// Y bounds: base -50, max positive offset = intensity × 50 = 15 → range [-50, -35]
//   We use a generous bound of [-200, 50] to account for any base position variation.
// Z bounds: base -100, max positive offset = intensity × 20 = 6 → range [-100, -94]
//   We use a generous bound of [-200, 0] to ensure it stays in front of far plane.
const Y_MIN = -200
const Y_MAX = 50
const Z_MIN = -200
const Z_MAX = 0

describe('Property 1: Background Visibility Across Scroll Positions', () => {
  /**
   * Core property: for any scroll position in [0,1], the computed position
   * stays within the visible frustum bounds.
   *
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  test('background Y position stays within visible bounds for all scroll positions', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }), // scrollProgress ∈ [0, 1]
        (scrollProgress) => {
          const position = calculateParallaxOffset(
            scrollProgress,
            DEFAULT_BASE_POSITION,
            DEFAULT_PARALLAX_INTENSITY
          )
          return position[1] >= Y_MIN && position[1] <= Y_MAX
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('background Z position stays within visible bounds for all scroll positions', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }), // scrollProgress ∈ [0, 1]
        (scrollProgress) => {
          const position = calculateParallaxOffset(
            scrollProgress,
            DEFAULT_BASE_POSITION,
            DEFAULT_PARALLAX_INTENSITY
          )
          return position[2] >= Z_MIN && position[2] <= Z_MAX
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('background X position is not affected by parallax (mouse is 0)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }), // scrollProgress ∈ [0, 1]
        (scrollProgress) => {
          const position = calculateParallaxOffset(
            scrollProgress,
            DEFAULT_BASE_POSITION,
            DEFAULT_PARALLAX_INTENSITY
          )
          // X should remain equal to basePosition[0] (parallax doesn't touch X)
          return position[0] === DEFAULT_BASE_POSITION[0]
        }
      ),
      { numRuns: 1000 }
    )
  })

  // Requirement 2.2: visible at scroll position 0
  test('background is visible at initial scroll position (scrollProgress = 0)', () => {
    const position = calculateParallaxOffset(0, DEFAULT_BASE_POSITION, DEFAULT_PARALLAX_INTENSITY)

    const yVisible = position[1] >= Y_MIN && position[1] <= Y_MAX
    const zVisible = position[2] >= Z_MIN && position[2] <= Z_MAX

    if (!yVisible || !zVisible) {
      throw new Error(
        `Background not visible at scroll 0: position=${JSON.stringify(position)}`
      )
    }
  })

  // Requirement 2.3: visible at final scroll position 1
  test('background is visible at final scroll position (scrollProgress = 1)', () => {
    const position = calculateParallaxOffset(1, DEFAULT_BASE_POSITION, DEFAULT_PARALLAX_INTENSITY)

    const yVisible = position[1] >= Y_MIN && position[1] <= Y_MAX
    const zVisible = position[2] >= Z_MIN && position[2] <= Z_MAX

    if (!yVisible || !zVisible) {
      throw new Error(
        `Background not visible at scroll 1: position=${JSON.stringify(position)}`
      )
    }
  })

  // Requirement 2.1: visible across ALL scroll positions (combined check)
  test('background remains visible across all scroll positions with default config', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        (scrollProgress) => {
          const position = calculateParallaxOffset(
            scrollProgress,
            DEFAULT_BASE_POSITION,
            DEFAULT_PARALLAX_INTENSITY
          )

          const yVisible = position[1] >= Y_MIN && position[1] <= Y_MAX
          const zVisible = position[2] >= Z_MIN && position[2] <= Z_MAX
          const allFinite = position.every(v => Number.isFinite(v))

          return yVisible && zVisible && allFinite
        }
      ),
      { numRuns: 1000 }
    )
  })
})
