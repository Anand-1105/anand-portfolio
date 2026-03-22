/**
 * Property 3: Valid Configuration Application
 *
 * For any valid configuration props (finite basePosition, positive baseScale,
 * intensity in [0,1], positive rotationSpeed), the SpaceBackground should apply
 * those exact values to the rendering.
 *
 * **Validates: Requirements 1.3**
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { validateSpaceBackgroundProps } from '../validateSpaceBackgroundProps'

/**
 * Arbitrary for a valid basePosition: tuple of 3 finite numbers.
 */
const validBasePosition = fc.tuple(
  fc.float({ min: Math.fround(-1000), max: Math.fround(1000), noNaN: true }),
  fc.float({ min: Math.fround(-1000), max: Math.fround(1000), noNaN: true }),
  fc.float({ min: Math.fround(-1000), max: Math.fround(1000), noNaN: true })
) as fc.Arbitrary<[number, number, number]>

/**
 * Arbitrary for a valid baseScale: positive finite number.
 */
const validBaseScale = fc.float({ min: Math.fround(0.001), max: Math.fround(10000), noNaN: true })

/**
 * Arbitrary for a valid parallaxIntensity: in [0, 1].
 */
const validParallaxIntensity = fc.float({ min: 0, max: 1, noNaN: true })

/**
 * Arbitrary for a valid rotationSpeed: positive finite number.
 */
const validRotationSpeed = fc.float({ min: Math.fround(0.001), max: Math.fround(100), noNaN: true })

describe('Property 3: Valid Configuration Application', () => {
  test('valid props are returned unchanged by validateSpaceBackgroundProps', () => {
    fc.assert(
      fc.property(
        validBasePosition,
        validBaseScale,
        validParallaxIntensity,
        validRotationSpeed,
        fc.boolean(),
        fc.boolean(),
        (basePosition, baseScale, parallaxIntensity, rotationSpeed, enableParallax, enableRotation) => {
          const input = { basePosition, baseScale, parallaxIntensity, rotationSpeed, enableParallax, enableRotation }
          const result = validateSpaceBackgroundProps(input)

          // All valid props must be preserved exactly
          const positionMatch =
            result.basePosition[0] === basePosition[0] &&
            result.basePosition[1] === basePosition[1] &&
            result.basePosition[2] === basePosition[2]

          return (
            positionMatch &&
            result.baseScale === baseScale &&
            result.parallaxIntensity === parallaxIntensity &&
            result.rotationSpeed === rotationSpeed &&
            result.enableParallax === enableParallax &&
            result.enableRotation === enableRotation
          )
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('valid basePosition values are preserved exactly', () => {
    fc.assert(
      fc.property(
        validBasePosition,
        (basePosition) => {
          const input = {
            basePosition,
            baseScale: 180,
            parallaxIntensity: 0.3,
            rotationSpeed: 0.05,
            enableParallax: true,
            enableRotation: true,
          }
          const result = validateSpaceBackgroundProps(input)
          return (
            result.basePosition[0] === basePosition[0] &&
            result.basePosition[1] === basePosition[1] &&
            result.basePosition[2] === basePosition[2]
          )
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('valid baseScale values are preserved exactly', () => {
    fc.assert(
      fc.property(
        validBaseScale,
        (baseScale) => {
          const input = {
            basePosition: [0, -50, -100] as [number, number, number],
            baseScale,
            parallaxIntensity: 0.3,
            rotationSpeed: 0.05,
            enableParallax: true,
            enableRotation: true,
          }
          const result = validateSpaceBackgroundProps(input)
          return result.baseScale === baseScale
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('valid parallaxIntensity values in [0,1] are preserved exactly', () => {
    fc.assert(
      fc.property(
        validParallaxIntensity,
        (parallaxIntensity) => {
          const input = {
            basePosition: [0, -50, -100] as [number, number, number],
            baseScale: 180,
            parallaxIntensity,
            rotationSpeed: 0.05,
            enableParallax: true,
            enableRotation: true,
          }
          const result = validateSpaceBackgroundProps(input)
          return result.parallaxIntensity === parallaxIntensity
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('valid rotationSpeed values are preserved exactly', () => {
    fc.assert(
      fc.property(
        validRotationSpeed,
        (rotationSpeed) => {
          const input = {
            basePosition: [0, -50, -100] as [number, number, number],
            baseScale: 180,
            parallaxIntensity: 0.3,
            rotationSpeed,
            enableParallax: true,
            enableRotation: true,
          }
          const result = validateSpaceBackgroundProps(input)
          return result.rotationSpeed === rotationSpeed
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('boolean flags are always preserved regardless of other props', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (enableParallax, enableRotation) => {
          const input = {
            basePosition: [0, -50, -100] as [number, number, number],
            baseScale: 180,
            parallaxIntensity: 0.3,
            rotationSpeed: 0.05,
            enableParallax,
            enableRotation,
          }
          const result = validateSpaceBackgroundProps(input)
          return result.enableParallax === enableParallax && result.enableRotation === enableRotation
        }
      ),
      { numRuns: 500 }
    )
  })

  // Spot-check boundary values
  test('boundary values for parallaxIntensity (0 and 1) are preserved', () => {
    const base = {
      basePosition: [0, -50, -100] as [number, number, number],
      baseScale: 180,
      rotationSpeed: 0.05,
      enableParallax: true,
      enableRotation: true,
    }

    expect(validateSpaceBackgroundProps({ ...base, parallaxIntensity: 0 }).parallaxIntensity).toBe(0)
    expect(validateSpaceBackgroundProps({ ...base, parallaxIntensity: 1 }).parallaxIntensity).toBe(1)
  })
})
