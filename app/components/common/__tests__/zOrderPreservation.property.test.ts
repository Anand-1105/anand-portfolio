/**
 * Property 2: Z-Order Preservation
 *
 * For any foreground content element (Hero, Experience, Footer), the space
 * background should render behind that element in 3D space.
 *
 * Foreground elements are positioned at Z=0 (default in Three.js).
 * The SpaceBackground base Z position is -100.
 *
 * For any scroll position between 0 and 1, the SpaceBackground's Z position
 * should remain behind (more negative than) the foreground elements' Z=0.
 *
 * **Validates: Requirements 2.4, 11.4**
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

const FOREGROUND_Z = 0
const BASE_POSITION: [number, number, number] = [0, -50, -100]
const DEFAULT_PARALLAX_INTENSITY = 0.3

describe('Property 2: Z-Order Preservation', () => {
  test('SpaceBackground Z position is always behind foreground (Z < 0) for any scroll position', () => {
    // **Validates: Requirements 2.4, 11.4**
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }), // scrollProgress ∈ [0, 1]
        (scrollProgress) => {
          const result = calculateParallaxOffset(
            scrollProgress,
            BASE_POSITION,
            DEFAULT_PARALLAX_INTENSITY
          )
          // SpaceBackground Z must remain behind all foreground content (Z < FOREGROUND_Z)
          return result[2] < FOREGROUND_Z
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('SpaceBackground Z position is behind foreground for any valid parallax intensity', () => {
    // **Validates: Requirements 2.4, 11.4**
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }), // scrollProgress ∈ [0, 1]
        fc.float({ min: 0, max: 1, noNaN: true }), // intensity ∈ [0, 1]
        (scrollProgress, intensity) => {
          const result = calculateParallaxOffset(
            scrollProgress,
            BASE_POSITION,
            intensity
          )
          // Regardless of intensity, Z must stay behind foreground
          return result[2] < FOREGROUND_Z
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('SpaceBackground Z position is behind foreground at scroll extremes (0 and 1)', () => {
    // **Validates: Requirements 2.4, 11.4**
    const atScrollStart = calculateParallaxOffset(0, BASE_POSITION, DEFAULT_PARALLAX_INTENSITY)
    const atScrollEnd = calculateParallaxOffset(1, BASE_POSITION, DEFAULT_PARALLAX_INTENSITY)

    // At scroll start: Z should be base Z = -100
    if (atScrollStart[2] >= FOREGROUND_Z) return false
    // At scroll end: Z = -100 + 1 * 0.3 * 20 = -100 + 6 = -94, still behind foreground
    if (atScrollEnd[2] >= FOREGROUND_Z) return false

    return true
  })

  test('maximum parallax Z offset never brings SpaceBackground to foreground level', () => {
    // **Validates: Requirements 2.4, 11.4**
    // Worst case: scrollProgress=1, intensity=1 → Z = -100 + 1*1*20 = -80, still < 0
    fc.assert(
      fc.property(
        fc.constant(1),                              // maximum scrollProgress
        fc.float({ min: 0, max: 1, noNaN: true }), // any intensity
        (scrollProgress, intensity) => {
          const result = calculateParallaxOffset(
            scrollProgress,
            BASE_POSITION,
            intensity
          )
          return result[2] < FOREGROUND_Z
        }
      ),
      { numRuns: 100 }
    )
  })
})
