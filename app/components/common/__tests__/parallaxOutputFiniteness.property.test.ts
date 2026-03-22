/**
 * Property 9: Parallax Output Finiteness
 *
 * For any inputs (valid or invalid), the calculateParallaxOffset function
 * must always return finite numbers for all three offset components.
 * Out-of-range inputs are clamped; non-finite basePosition falls back to [0, -50, -100].
 *
 * Validates: Requirement 10.5
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

describe('Property 9: Parallax Output Finiteness', () => {
  test('all result components are finite for valid inputs', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (scrollProgress, intensity, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
          return Number.isFinite(result[0]) && Number.isFinite(result[1]) && Number.isFinite(result[2])
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('all result components are finite when scrollProgress is out of range', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ max: Math.fround(-1e-7), noNaN: true }),
          fc.float({ min: Math.fround(1.0000001), noNaN: true }),
        ),
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (scrollProgress, intensity, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
          return Number.isFinite(result[0]) && Number.isFinite(result[1]) && Number.isFinite(result[2])
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('all result components are finite when intensity is out of range', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.oneof(
          fc.float({ max: Math.fround(-1e-7), noNaN: true }),
          fc.float({ min: Math.fround(1.0000001), noNaN: true }),
        ),
        fc.tuple(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.float({ min: -1000, max: 1000, noNaN: true }),
        ),
        (scrollProgress, intensity, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
          return Number.isFinite(result[0]) && Number.isFinite(result[1]) && Number.isFinite(result[2])
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('all result components are finite when basePosition contains non-finite values', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.tuple(
          fc.oneof(fc.constant(NaN), fc.constant(Infinity), fc.constant(-Infinity), fc.float({ min: -1000, max: 1000, noNaN: true })),
          fc.oneof(fc.constant(NaN), fc.constant(Infinity), fc.constant(-Infinity), fc.float({ min: -1000, max: 1000, noNaN: true })),
          fc.oneof(fc.constant(NaN), fc.constant(Infinity), fc.constant(-Infinity), fc.float({ min: -1000, max: 1000, noNaN: true })),
        ).filter(([x, y, z]) => !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)),
        (scrollProgress, intensity, base) => {
          const basePosition: [number, number, number] = [base[0], base[1], base[2]]
          const result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
          return Number.isFinite(result[0]) && Number.isFinite(result[1]) && Number.isFinite(result[2])
        }
      ),
      { numRuns: 1000 }
    )
  })
})
