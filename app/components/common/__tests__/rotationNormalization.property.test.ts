/**
 * Property 11: Rotation Normalization
 *
 * For any number of animation frames, when rotation is enabled, rotation
 * values should remain bounded within [0, 2π] through normalization.
 *
 * The normalization logic (from SpaceBackground.tsx):
 *   if (rotation.y > TWO_PI) rotation.y -= TWO_PI
 *   if (rotation.x > TWO_PI) rotation.x -= TWO_PI
 *
 * **Validates: Requirement 4.3**
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { updateRotation } from '../updateRotation'

const TWO_PI = Math.PI * 2

/**
 * Simulates one animation frame: update rotation then normalize.
 * Mirrors the logic in SpaceBackground.tsx useFrame callback.
 */
function updateAndNormalize(
  rotation: { x: number; y: number; z: number },
  rotationSpeed: number,
  delta: number
): { x: number; y: number; z: number } {
  const updated = updateRotation(rotation, rotationSpeed, delta)

  if (updated.y > TWO_PI) {
    updated.y -= TWO_PI
  }
  if (updated.x > TWO_PI) {
    updated.x -= TWO_PI
  }

  return updated
}

describe('Property 11: Rotation Normalization', () => {
  test('rotation values remain bounded within [0, 2π] after many frames', () => {
    fc.assert(
      fc.property(
        // Initial rotation starting within [0, 2π]
        fc.float({ min: 0, max: Math.fround(TWO_PI), noNaN: true }),  // initial x
        fc.float({ min: 0, max: Math.fround(TWO_PI), noNaN: true }),  // initial y
        // Positive rotation speed (typical range)
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }),
        // Positive frame delta (typical range: ~8ms to ~100ms)
        fc.float({ min: Math.fround(0.008), max: Math.fround(0.1), noNaN: true }),
        // Number of frames to simulate
        fc.integer({ min: 1, max: 500 }),
        (initialX, initialY, rotationSpeed, delta, numFrames) => {
          let rotation = { x: initialX, y: initialY, z: 0 }

          for (let i = 0; i < numFrames; i++) {
            rotation = updateAndNormalize(rotation, rotationSpeed, delta)
          }

          // After normalization, values must be within [0, 2π]
          // (a single subtraction of 2π keeps values in range as long as
          //  per-frame increment < 2π, which is guaranteed by our speed/delta bounds)
          return rotation.y <= TWO_PI && rotation.x <= TWO_PI
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('rotation values never go negative after normalization', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(TWO_PI), noNaN: true }),
        fc.float({ min: 0, max: Math.fround(TWO_PI), noNaN: true }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }),
        fc.float({ min: Math.fround(0.008), max: Math.fround(0.1), noNaN: true }),
        fc.integer({ min: 1, max: 500 }),
        (initialX, initialY, rotationSpeed, delta, numFrames) => {
          let rotation = { x: initialX, y: initialY, z: 0 }

          for (let i = 0; i < numFrames; i++) {
            rotation = updateAndNormalize(rotation, rotationSpeed, delta)
          }

          return rotation.x >= 0 && rotation.y >= 0
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('normalization triggers correctly when rotation exceeds 2π', () => {
    fc.assert(
      fc.property(
        // Start just below 2π so the next frame will exceed it
        fc.float({ min: Math.fround(TWO_PI - 0.5), max: Math.fround(TWO_PI), noNaN: true }),
        fc.float({ min: Math.fround(TWO_PI - 0.5), max: Math.fround(TWO_PI), noNaN: true }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(0.5), noNaN: true }),
        fc.float({ min: Math.fround(0.016), max: Math.fround(0.05), noNaN: true }),
        (initialX, initialY, rotationSpeed, delta) => {
          const rotation = { x: initialX, y: initialY, z: 0 }
          const result = updateAndNormalize(rotation, rotationSpeed, delta)

          // After normalization, values must be within [0, 2π]
          return result.y <= TWO_PI && result.x <= TWO_PI && result.y >= 0 && result.x >= 0
        }
      ),
      { numRuns: 1000 }
    )
  })
})
