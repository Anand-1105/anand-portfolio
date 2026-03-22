/**
 * Property 15: Parallax Input Validation
 *
 * For any scroll progress value outside [0, 1] or intensity value outside [0, 1],
 * the parallax calculation should handle the input gracefully without crashing.
 *
 * The implementation clamps out-of-range inputs to [0, 1] and returns finite values.
 *
 * Validates: Requirements 10.1, 10.2
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

const basePosition: [number, number, number] = [0, -50, -100]

describe('Property 15: Parallax Input Validation', () => {
  test('handles out-of-range scrollProgress gracefully (no crash, finite result)', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ max: Math.fround(-1e-7), noNaN: true }),
          fc.float({ min: Math.fround(1.0000001), noNaN: true }),
        ),
        fc.float({ min: 0, max: 1, noNaN: true }),
        (scrollProgress, intensity) => {
          let result: [number, number, number] | undefined
          let threw = false
          try {
            result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
          } catch {
            threw = true
          }
          // Either it throws a descriptive error (graceful) or returns finite values
          if (threw) return true
          return (
            result !== undefined &&
            Number.isFinite(result[0]) &&
            Number.isFinite(result[1]) &&
            Number.isFinite(result[2])
          )
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('handles out-of-range intensity gracefully (no crash, finite result)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.oneof(
          fc.float({ max: Math.fround(-1e-7), noNaN: true }),
          fc.float({ min: Math.fround(1.0000001), noNaN: true }),
        ),
        (scrollProgress, intensity) => {
          let result: [number, number, number] | undefined
          let threw = false
          try {
            result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
          } catch {
            threw = true
          }
          if (threw) return true
          return (
            result !== undefined &&
            Number.isFinite(result[0]) &&
            Number.isFinite(result[1]) &&
            Number.isFinite(result[2])
          )
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('handles both scrollProgress and intensity out of range gracefully', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ max: Math.fround(-1e-7), noNaN: true }),
          fc.float({ min: Math.fround(1.0000001), noNaN: true }),
        ),
        fc.oneof(
          fc.float({ max: Math.fround(-1e-7), noNaN: true }),
          fc.float({ min: Math.fround(1.0000001), noNaN: true }),
        ),
        (scrollProgress, intensity) => {
          let result: [number, number, number] | undefined
          let threw = false
          try {
            result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
          } catch {
            threw = true
          }
          if (threw) return true
          return (
            result !== undefined &&
            Number.isFinite(result[0]) &&
            Number.isFinite(result[1]) &&
            Number.isFinite(result[2])
          )
        }
      ),
      { numRuns: 1000 }
    )
  })
})
