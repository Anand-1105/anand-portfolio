/**
 * Property 8: Parallax Disabled Invariant
 *
 * For any scroll progress value, when parallax is disabled, the background
 * position should remain at the base position regardless of scrolling.
 *
 * When enableParallax is false, the SpaceBackground component skips the
 * parallax calculation entirely and keeps the group at basePosition.
 * This is modelled here by verifying that with zero intensity (the effective
 * no-op state of the parallax formula), the returned position equals the
 * basePosition exactly for any scroll progress value.
 *
 * **Validates: Requirement 3.5**
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

describe('Property 8: Parallax Disabled Invariant', () => {
  test('position equals basePosition for any scroll progress when parallax is disabled (intensity = 0)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),   // scrollProgress ∈ [0, 1]
        fc.tuple(                                     // arbitrary base position
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (scrollProgress, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          // intensity = 0 models the disabled parallax state: no offset is applied
          const result = calculateParallaxOffset(scrollProgress, basePosition, 0)
          return (
            result[0] === basePosition[0] &&
            result[1] === basePosition[1] &&
            result[2] === basePosition[2]
          )
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('position is identical across all scroll progress values when parallax is disabled', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),   // s1
        fc.float({ min: 0, max: 1, noNaN: true }),   // s2
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (s1, s2, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const r1 = calculateParallaxOffset(s1, basePosition, 0)
          const r2 = calculateParallaxOffset(s2, basePosition, 0)
          // Both results must be identical regardless of scroll progress
          return r1[0] === r2[0] && r1[1] === r2[1] && r1[2] === r2[2]
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('position equals basePosition at scroll extremes (0 and 1) when parallax is disabled', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const atStart = calculateParallaxOffset(0, basePosition, 0)
          const atEnd = calculateParallaxOffset(1, basePosition, 0)
          return (
            atStart[0] === basePosition[0] &&
            atStart[1] === basePosition[1] &&
            atStart[2] === basePosition[2] &&
            atEnd[0] === basePosition[0] &&
            atEnd[1] === basePosition[1] &&
            atEnd[2] === basePosition[2]
          )
        }
      )
    )
  })
})
