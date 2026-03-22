/**
 * Property 13: Frame-Rate Independence
 *
 * For any two different frame rates (e.g., 30fps vs 60fps), running the
 * animation for the same total time should produce equivalent final positions
 * and rotations.
 *
 * Key insight: since rotation is linear (no lerp), the sum of all deltas
 * equals total time, so the final rotation is identical regardless of how
 * many frames were used.
 *
 * Example:
 * - 30fps for 1 second = 30 frames × (1/30) delta each
 * - 60fps for 1 second = 60 frames × (1/60) delta each
 * - Both should produce the same final rotation
 *
 * **Validates: Requirements 4.5, 6.1, 6.2, 6.3**
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { updateRotation } from '../updateRotation'

const TOLERANCE = 1e-4

/**
 * Simulate running the animation at a given fps for a total duration.
 * Returns the final rotation after all frames.
 */
function simulateAtFrameRate(
  initialRotation: { x: number; y: number; z: number },
  rotationSpeed: number,
  fps: number,
  totalTime: number
): { x: number; y: number; z: number } {
  const delta = 1 / fps
  const frames = Math.round(totalTime * fps)
  let rotation = { ...initialRotation }
  for (let i = 0; i < frames; i++) {
    rotation = updateRotation(rotation, rotationSpeed, delta)
  }
  return rotation
}

describe('Property 13: Frame-Rate Independence', () => {
  test('30fps and 60fps produce equivalent final Y-axis rotation over the same time period', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }), // initial rotation y
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }), // rotationSpeed
        fc.integer({ min: 1, max: 5 }), // totalTime in seconds (integer for exact frame counts)
        (initialY, rotationSpeed, totalTime) => {
          const initial = { x: 0, y: initialY, z: 0 }
          const result30 = simulateAtFrameRate(initial, rotationSpeed, 30, totalTime)
          const result60 = simulateAtFrameRate(initial, rotationSpeed, 60, totalTime)
          return Math.abs(result30.y - result60.y) < TOLERANCE
        }
      ),
      { numRuns: 500 }
    )
  })

  test('30fps and 60fps produce equivalent final X-axis rotation over the same time period', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }), // initial rotation x
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }), // rotationSpeed
        fc.integer({ min: 1, max: 5 }), // totalTime in seconds
        (initialX, rotationSpeed, totalTime) => {
          const initial = { x: initialX, y: 0, z: 0 }
          const result30 = simulateAtFrameRate(initial, rotationSpeed, 30, totalTime)
          const result60 = simulateAtFrameRate(initial, rotationSpeed, 60, totalTime)
          return Math.abs(result30.x - result60.x) < TOLERANCE
        }
      ),
      { numRuns: 500 }
    )
  })

  test('30fps and 120fps produce equivalent final rotation over the same time period', () => {
    fc.assert(
      fc.property(
        fc.record({
          x: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
          y: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
          z: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
        }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }), // rotationSpeed
        fc.integer({ min: 1, max: 5 }), // totalTime in seconds
        (initial, rotationSpeed, totalTime) => {
          const result30 = simulateAtFrameRate(initial, rotationSpeed, 30, totalTime)
          const result120 = simulateAtFrameRate(initial, rotationSpeed, 120, totalTime)
          return (
            Math.abs(result30.y - result120.y) < TOLERANCE &&
            Math.abs(result30.x - result120.x) < TOLERANCE &&
            result30.z === result120.z
          )
        }
      ),
      { numRuns: 500 }
    )
  })

  test('Z-axis rotation remains unchanged regardless of frame rate', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }), // initial z
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }), // rotationSpeed
        fc.integer({ min: 1, max: 5 }), // totalTime in seconds
        (initialZ, rotationSpeed, totalTime) => {
          const initial = { x: 0, y: 0, z: initialZ }
          const result30 = simulateAtFrameRate(initial, rotationSpeed, 30, totalTime)
          const result60 = simulateAtFrameRate(initial, rotationSpeed, 60, totalTime)
          // Z should be unchanged and identical across frame rates
          return result30.z === initialZ && result60.z === initialZ
        }
      ),
      { numRuns: 500 }
    )
  })
})
