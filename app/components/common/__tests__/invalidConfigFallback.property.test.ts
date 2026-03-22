/**
 * Property 4: Invalid Configuration Fallback
 *
 * For any invalid configuration props (non-finite basePosition, non-positive baseScale,
 * out-of-range intensity, non-positive rotationSpeed), the SpaceBackground should fall
 * back to default values for the invalid props.
 *
 * **Validates: Requirements 1.4, 7.1, 7.2, 7.3, 7.4**
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  validateSpaceBackgroundProps,
  DEFAULT_SPACE_BACKGROUND_PROPS,
} from '../validateSpaceBackgroundProps'
import type { SpaceBackgroundConfig } from '../validateSpaceBackgroundProps'

const DEFAULT_BASE_POSITION = DEFAULT_SPACE_BACKGROUND_PROPS.basePosition
const DEFAULT_BASE_SCALE = DEFAULT_SPACE_BACKGROUND_PROPS.baseScale
const DEFAULT_PARALLAX_INTENSITY = DEFAULT_SPACE_BACKGROUND_PROPS.parallaxIntensity
const DEFAULT_ROTATION_SPEED = DEFAULT_SPACE_BACKGROUND_PROPS.rotationSpeed

/** Base valid props to mix invalid values into */
function baseValidProps(): SpaceBackgroundConfig {
  return {
    basePosition: [0, -50, -100],
    baseScale: 180,
    parallaxIntensity: 0.3,
    rotationSpeed: 0.05,
    enableParallax: true,
    enableRotation: true,
  }
}

/** Arbitrary for a non-finite number (NaN, Infinity, -Infinity) */
const nonFiniteNumber = fc.oneof(
  fc.constant(NaN),
  fc.constant(Infinity),
  fc.constant(-Infinity)
)

/** Arbitrary for a non-positive number (0, negative, or non-finite) */
const nonPositiveOrNonFinite = fc.oneof(
  fc.constant(0),
  fc.float({ max: -Number.EPSILON, noNaN: true }),
  nonFiniteNumber
)

/** Arbitrary for a finite number outside [0, 1] */
const outOfRangeIntensity = fc.oneof(
  fc.float({ min: Math.fround(-1000), max: Math.fround(-Number.EPSILON), noNaN: true, noDefaultInfinity: true }),
  fc.float({ min: Math.fround(1 + Number.EPSILON), max: Math.fround(1000), noNaN: true, noDefaultInfinity: true })
)

describe('Property 4: Invalid Configuration Fallback', () => {
  describe('basePosition fallback (Requirement 7.1)', () => {
    test('non-finite value in any position component falls back to default basePosition', () => {
      fc.assert(
        fc.property(
          // Pick which component (0, 1, or 2) gets the invalid value
          fc.integer({ min: 0, max: 2 }),
          nonFiniteNumber,
          (index, badValue) => {
            const pos: [number, number, number] = [0, -50, -100]
            pos[index] = badValue
            const input = { ...baseValidProps(), basePosition: pos }
            const result = validateSpaceBackgroundProps(input)

            return (
              result.basePosition[0] === DEFAULT_BASE_POSITION[0] &&
              result.basePosition[1] === DEFAULT_BASE_POSITION[1] &&
              result.basePosition[2] === DEFAULT_BASE_POSITION[2]
            )
          }
        ),
        { numRuns: 500 }
      )
    })

    test('all-NaN basePosition falls back to default', () => {
      fc.assert(
        fc.property(
          fc.tuple(nonFiniteNumber, nonFiniteNumber, nonFiniteNumber),
          ([x, y, z]) => {
            const input = {
              ...baseValidProps(),
              basePosition: [x, y, z] as [number, number, number],
            }
            const result = validateSpaceBackgroundProps(input)
            return (
              result.basePosition[0] === DEFAULT_BASE_POSITION[0] &&
              result.basePosition[1] === DEFAULT_BASE_POSITION[1] &&
              result.basePosition[2] === DEFAULT_BASE_POSITION[2]
            )
          }
        ),
        { numRuns: 200 }
      )
    })
  })

  describe('baseScale fallback (Requirement 7.2)', () => {
    test('non-positive or non-finite baseScale falls back to default', () => {
      fc.assert(
        fc.property(
          nonPositiveOrNonFinite,
          (badScale) => {
            const input = { ...baseValidProps(), baseScale: badScale }
            const result = validateSpaceBackgroundProps(input)
            return result.baseScale === DEFAULT_BASE_SCALE
          }
        ),
        { numRuns: 500 }
      )
    })
  })

  describe('parallaxIntensity clamping (Requirement 7.3)', () => {
    test('parallaxIntensity below 0 (finite) is clamped to 0', () => {
      fc.assert(
        fc.property(
          // Only finite negative numbers — non-finite values fall back to default, not clamped
          fc.float({ min: Math.fround(-1000), max: Math.fround(-Number.EPSILON), noNaN: true, noDefaultInfinity: true }),
          (badIntensity) => {
            const input = { ...baseValidProps(), parallaxIntensity: badIntensity }
            const result = validateSpaceBackgroundProps(input)
            return result.parallaxIntensity === 0
          }
        ),
        { numRuns: 500 }
      )
    })

    test('parallaxIntensity above 1 (finite) is clamped to 1', () => {
      fc.assert(
        fc.property(
          // Only finite numbers above 1
          fc.float({ min: Math.fround(1 + Number.EPSILON), max: Math.fround(1000), noNaN: true, noDefaultInfinity: true }),
          (badIntensity) => {
            const input = { ...baseValidProps(), parallaxIntensity: badIntensity }
            const result = validateSpaceBackgroundProps(input)
            return result.parallaxIntensity === 1
          }
        ),
        { numRuns: 500 }
      )
    })

    test('non-finite parallaxIntensity falls back to default', () => {
      fc.assert(
        fc.property(
          nonFiniteNumber,
          (badIntensity) => {
            const input = { ...baseValidProps(), parallaxIntensity: badIntensity }
            const result = validateSpaceBackgroundProps(input)
            return result.parallaxIntensity === DEFAULT_PARALLAX_INTENSITY
          }
        ),
        { numRuns: 200 }
      )
    })

    test('out-of-range parallaxIntensity is always clamped to [0, 1]', () => {
      fc.assert(
        fc.property(
          outOfRangeIntensity,
          (badIntensity) => {
            const input = { ...baseValidProps(), parallaxIntensity: badIntensity }
            const result = validateSpaceBackgroundProps(input)
            return result.parallaxIntensity >= 0 && result.parallaxIntensity <= 1
          }
        ),
        { numRuns: 500 }
      )
    })
  })

  describe('rotationSpeed fallback (Requirement 7.4)', () => {
    test('non-positive or non-finite rotationSpeed falls back to default', () => {
      fc.assert(
        fc.property(
          nonPositiveOrNonFinite,
          (badSpeed) => {
            const input = { ...baseValidProps(), rotationSpeed: badSpeed }
            const result = validateSpaceBackgroundProps(input)
            return result.rotationSpeed === DEFAULT_ROTATION_SPEED
          }
        ),
        { numRuns: 500 }
      )
    })
  })

  describe('independent fallback per prop', () => {
    test('only the invalid prop falls back; valid props are preserved', () => {
      fc.assert(
        fc.property(
          nonFiniteNumber,
          fc.float({ min: Math.fround(0.001), max: Math.fround(10000), noNaN: true }),
          fc.float({ min: 0, max: 1, noNaN: true }),
          fc.float({ min: Math.fround(0.001), max: Math.fround(100), noNaN: true }),
          (badPositionVal, validScale, validIntensity, validSpeed) => {
            const badPos: [number, number, number] = [badPositionVal, -50, -100]
            const input: SpaceBackgroundConfig = {
              basePosition: badPos,
              baseScale: validScale,
              parallaxIntensity: validIntensity,
              rotationSpeed: validSpeed,
              enableParallax: true,
              enableRotation: false,
            }
            const result = validateSpaceBackgroundProps(input)

            // basePosition should fall back to default
            const positionFallback =
              result.basePosition[0] === DEFAULT_BASE_POSITION[0] &&
              result.basePosition[1] === DEFAULT_BASE_POSITION[1] &&
              result.basePosition[2] === DEFAULT_BASE_POSITION[2]

            // Other valid props should be preserved
            const otherPreserved =
              result.baseScale === validScale &&
              result.parallaxIntensity === validIntensity &&
              result.rotationSpeed === validSpeed &&
              result.enableParallax === true &&
              result.enableRotation === false

            return positionFallback && otherPreserved
          }
        ),
        { numRuns: 500 }
      )
    })

    test('result always has finite values for all numeric props', () => {
      // Generate arbitrary (possibly invalid) configs and verify output is always finite
      const anyNumber = fc.oneof(
        fc.float({ noNaN: false }),
        fc.constant(NaN),
        fc.constant(Infinity),
        fc.constant(-Infinity),
        fc.constant(0),
        fc.float({ min: -1000, max: 1000, noNaN: true })
      )

      fc.assert(
        fc.property(
          fc.tuple(anyNumber, anyNumber, anyNumber),
          anyNumber,
          anyNumber,
          anyNumber,
          fc.boolean(),
          fc.boolean(),
          ([x, y, z], scale, intensity, speed, enableParallax, enableRotation) => {
            const input: SpaceBackgroundConfig = {
              basePosition: [x, y, z] as [number, number, number],
              baseScale: scale,
              parallaxIntensity: intensity,
              rotationSpeed: speed,
              enableParallax,
              enableRotation,
            }
            const result = validateSpaceBackgroundProps(input)

            return (
              result.basePosition.every((v) => Number.isFinite(v)) &&
              Number.isFinite(result.baseScale) &&
              result.baseScale > 0 &&
              Number.isFinite(result.parallaxIntensity) &&
              result.parallaxIntensity >= 0 &&
              result.parallaxIntensity <= 1 &&
              Number.isFinite(result.rotationSpeed) &&
              result.rotationSpeed > 0
            )
          }
        ),
        { numRuns: 1000 }
      )
    })
  })
})
