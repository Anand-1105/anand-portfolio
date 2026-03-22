/**
 * Property 5: Parallax Y-Axis Formula
 *
 * For any scroll progress value between 0 and 1 and any intensity value
 * between 0 and 1, when parallax is enabled, the Y-axis offset should equal:
 *   scrollProgress × intensity × 50
 *
 * Validates: Requirements 3.2, 10.6
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

describe('Property 5: Parallax Y-Axis Formula', () => {
  test('Y-axis offset equals scrollProgress × intensity × 50 for all valid inputs', () => {
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

          const expectedY = basePosition[1] + scrollProgress * intensity * 50
          return Math.abs(result[1] - expectedY) < 1e-6
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('Y-axis offset is zero when scrollProgress is 0', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (intensity, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const result = calculateParallaxOffset(0, basePosition, intensity)
          return Math.abs(result[1] - basePosition[1]) < 1e-6
        }
      )
    )
  })

  test('Y-axis offset is maximal (intensity × 50) when scrollProgress is 1', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (intensity, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const result = calculateParallaxOffset(1, basePosition, intensity)
          const expectedY = basePosition[1] + intensity * 50
          return Math.abs(result[1] - expectedY) < 1e-6
        }
      )
    )
  })

  test('Y-axis offset is proportional to scrollProgress (monotonically non-decreasing)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 0.5, noNaN: true }),  // s1
        fc.float({ min: 0.5, max: 1, noNaN: true }),  // s2 >= s1
        fc.float({ min: 0, max: 1, noNaN: true }),    // intensity
        (s1, s2, intensity) => {
          const base: [number, number, number] = [0, -50, -100]
          const r1 = calculateParallaxOffset(s1, base, intensity)
          const r2 = calculateParallaxOffset(s2, base, intensity)
          // Y offset should be non-decreasing as scroll increases
          return r2[1] >= r1[1] - 1e-6
        }
      )
    )
  })

  test('Y-axis offset is proportional to intensity', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),   // scrollProgress
        fc.float({ min: 0, max: 0.5, noNaN: true }), // i1
        fc.float({ min: 0.5, max: 1, noNaN: true }), // i2 >= i1
        (scrollProgress, i1, i2) => {
          const base: [number, number, number] = [0, -50, -100]
          const r1 = calculateParallaxOffset(scrollProgress, base, i1)
          const r2 = calculateParallaxOffset(scrollProgress, base, i2)
          // Higher intensity → larger Y offset
          return r2[1] >= r1[1] - 1e-6
        }
      )
    )
  })
})
