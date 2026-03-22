/**
 * Property 7: Parallax X-Axis Invariant
 *
 * For any scroll progress value, when parallax is enabled, the X-axis position
 * should remain unchanged by parallax calculations (only affected by mouse influence).
 *
 * Validates: Requirement 3.4
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

describe('Property 7: Parallax X-Axis Invariant', () => {
  test('X-axis position is unchanged for any scroll progress and intensity', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),   // scrollProgress ∈ [0, 1]
        fc.float({ min: 0, max: 1, noNaN: true }),   // intensity ∈ [0, 1]
        fc.tuple(                                     // arbitrary base position
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (scrollProgress, intensity, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
          return result[0] === basePosition[0]
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('X-axis position is unchanged regardless of scroll progress extremes (0 and 1)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),   // intensity
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (intensity, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const atStart = calculateParallaxOffset(0, basePosition, intensity)
          const atEnd = calculateParallaxOffset(1, basePosition, intensity)
          return atStart[0] === basePosition[0] && atEnd[0] === basePosition[0]
        }
      )
    )
  })

  test('X-axis position is the same across all scroll progress values for a fixed base', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),   // s1
        fc.float({ min: 0, max: 1, noNaN: true }),   // s2
        fc.float({ min: 0, max: 1, noNaN: true }),   // intensity
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (s1, s2, intensity, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const r1 = calculateParallaxOffset(s1, basePosition, intensity)
          const r2 = calculateParallaxOffset(s2, basePosition, intensity)
          // X must be identical regardless of scroll progress
          return r1[0] === r2[0]
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('X-axis position is the same across all intensity values for a fixed scroll progress', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),   // scrollProgress
        fc.float({ min: 0, max: 1, noNaN: true }),   // i1
        fc.float({ min: 0, max: 1, noNaN: true }),   // i2
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (scrollProgress, i1, i2, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const r1 = calculateParallaxOffset(scrollProgress, basePosition, i1)
          const r2 = calculateParallaxOffset(scrollProgress, basePosition, i2)
          // X must be identical regardless of intensity
          return r1[0] === r2[0]
        }
      ),
      { numRuns: 1000 }
    )
  })
})
